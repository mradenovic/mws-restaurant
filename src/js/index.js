import './utils/register-sw';
import DBHelper, {DBService} from './utils/dbhelper.js';
import MapService from './utils/map-helper.js';

class IndexController {
  constructor() {
    this.db = new DBService();
    this.markers = [];

    const cuisine = document.getElementById('cuisines-select');
    const neighborhoods = document.getElementById('neighborhoods-select');
    cuisine.addEventListener('change', () => this.updateRestaurants());
    neighborhoods.addEventListener('change', () => this.updateRestaurants());
  }

  init() {
    this.db.getCuisines()
      .then(cuisines => this.fillCuisinesHTML(cuisines));
    this.db.getNeighborhoods()
      .then(neighborhoods => this.fillNeighborhoodsHTML(neighborhoods));
    this.initMap();
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
  updateRestaurants() {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    this.db.getFilteredResaurants(cuisine, neighborhood)
      .then(restaurants => {
        this.resetRestaurants(restaurants);
        this.fillRestaurantsHTML();
      });
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
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = restaurant.name + ' restaurant';
    li.append(image);

    const details = document.createElement('a');
    details.href = DBHelper.urlForRestaurant(restaurant);
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

    // TODO: remove 'View Details' button
    // keep the code until final decision is made
    // const more = document.createElement('a');
    // more.innerHTML = 'View Details';
    // more.href = DBHelper.urlForRestaurant(restaurant);
    // li.append(more)

    return li;
  }

  /**
   * Add markers for current restaurants to the map.
   */
  addMarkersToMap(restaurants = this.restaurants) {
    restaurants.forEach(restaurant => {
      // Add marker to the map
      const marker = MapService.createMarker(restaurant, this.map)
        .on('click', () => window.location.assign(`./restaurant.html?id=${restaurant.id}`));
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
    this.updateRestaurants();
  }
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  let indexControler = new IndexController();
  indexControler.init();
});
