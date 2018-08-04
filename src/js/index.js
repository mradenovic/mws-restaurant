import './utils/register-sw';
import DBService from './utils/dbhelper.js';
import MapService from './utils/map-helper.js';

class IndexController {
  constructor() {
    this.db = new DBService();
    this.markers = [];
    this.restaurants = [];

    const cuisine = document.getElementById('cuisines-select');
    const neighborhoods = document.getElementById('neighborhoods-select');
    cuisine.addEventListener('change', () => this.filterRestaurants());
    neighborhoods.addEventListener('change', () => this.filterRestaurants());
  }

  /**
   * Initialize UI.
   */
  init() {
    this.initMap();
    this.db.getRestaurants()
      // update all UI on initial load
      .then(restaurants => this.updateAll(restaurants));
  }
  
  /**
   * Update all HTML.
   */
  updateAll(restaurants) {
    this.updateFilters(restaurants);
    this.updateRestaurants(restaurants);    
  }

  /**
   * Update reastaurants HTML.
   */
  updateRestaurants(restaurants) {
    this.resetRestaurants(restaurants);
    this.fillRestaurantsHTML(restaurants);
  }
  
  /**
   * Update filters HTML.
   */
  updateFilters(restaurants) {
    this.fillCuisinesHTML(this.db.getCuisines(restaurants));
    this.fillNeighborhoodsHTML(this.db.getNeighborhoods(restaurants));
  }
 
  /**
   * Set neighborhoods HTML.
   */
  fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
      const option = document.createElement('option');
      option.innerHTML = neighborhood;
      option.value = neighborhood;
      select.append(option);
    });
  }

  /**
   * Set cuisines HTML.
   */
  fillCuisinesHTML(cuisines = this.cuisines) {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
      const option = document.createElement('option');
      option.innerHTML = cuisine;
      option.value = cuisine;
      select.append(option);
    });
  }

  /**
   * Update page and map for current restaurants.
   */
  filterRestaurants() {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    this.db.getFilteredResaurants(cuisine, neighborhood)
      .then(restaurants => this.updateRestaurants(restaurants));
  }

  /**
   * Clear current restaurants, their HTML and remove their map markers.
   */
  resetRestaurants(restaurants) {
    // Remove all restaurants
    this.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    this.restaurants = restaurants;
  }

  /**
   * Create all restaurants HTML and add them to the webpage.
   */
  fillRestaurantsHTML(restaurants = this.restaurants) {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
      ul.append(this.createRestaurantHTML(restaurant));
    });
    this.addMarkersToMap();
  }

  /**
   * Create restaurant HTML.
   */
  createRestaurantHTML(restaurant) {
    const li = document.createElement('li');

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = DBService.getImageUrl(restaurant);
    image.alt = restaurant.name + ' restaurant';
    li.append(image);

    const details = document.createElement('a');
    details.href = DBService.getUrl(restaurant);
    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    details.append(name);
    li.append(details);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    return li;
  }

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants = this.restaurants) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = MapService.createMarker(restaurant, this.map)
        .on('click', () => window.location.assign(`./restaurant.html?id=${restaurant.id}`))
        .addTo(this.map);
      this.markers.push(marker);
    });
  }

  /**
   * Initialize Google map.
   */
  initMap() {
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    this.map = MapService.createMap('map', loc);
  }
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  let indexControler = new IndexController();
  indexControler.init();
});
