import DBHelper from './dbhelper.js';
import GoogleMapsLoader from 'google-maps';
GoogleMapsLoader.KEY = 'AIzaSyDaNOX7XbtJ6LTgCHIVtxoC2VFGukikTf8';

class IndexController {
  constructor() {
    this.markers = [];

    const cuisine = document.getElementById('cuisines-select');
    const neighborhoods = document.getElementById('neighborhoods-select');
    cuisine.addEventListener('change', event => this.updateRestaurants());
    neighborhoods.addEventListener('change', event => this.updateRestaurants());
  }
  
  /**
   * Fetch all neighborhoods and set their HTML.
   */
  fetchNeighborhoods() {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
      if (error) { // Got an error
        console.error(error);
      } else {
        this.neighborhoods = neighborhoods;
        this.fillNeighborhoodsHTML();
      }
    });
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
   * Fetch all cuisines and set their HTML.
   */
  fetchCuisines() {
    DBHelper.fetchCuisines((error, cuisines) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        this.cuisines = cuisines;
        this.fillCuisinesHTML();
      }
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

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
      if (error) { // Got an error!
        console.error(error);
      } else {
        this.resetRestaurants(restaurants);
        this.fillRestaurantsHTML();
      }
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
    this.markers.forEach(m => m.setMap(null));
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
      const marker = DBHelper.mapMarkerForRestaurant(this.google, restaurant, this.map);
      this.google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url;
      });
      this.markers.push(marker);
    });
  }

  /**
   * Initialize Google map.
   */
  initMap(google) {
    this.google = google;
    let loc = {
      lat: 40.722216,
      lng: -73.987501
    };
    this.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: loc,
      scrollwheel: false
    });
    this.updateRestaurants();
  }
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  let indexControler = new IndexController();
  indexControler.fetchNeighborhoods();
  indexControler.fetchCuisines();
  GoogleMapsLoader.load(google => indexControler.initMap(google));
});
