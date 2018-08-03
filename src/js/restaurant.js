import './utils/register-sw';
import DBHelper, { DBService } from './utils/dbhelper.js';
import {Map, TileLayer, Marker} from 'leaflet';

class RestaurantController {

  constructor() {
    this.db = new DBService();
    this.id = this.getParameterByName('id');
  }

  init() {
    const {db, id} = this;

    db.getReviews(id)
      .then(reviews => this.fillReviewsHTML(reviews));
    this.fetchRestaurantFromURL()
      .then(restaurant => {
        this.fillBreadcrumb(restaurant);
        this.fillRestaurantHTML(restaurant);
        this.initMap();
      });
  }

  /**
   * Initialize Google map, called from HTML.
   */
  initMap(google, restaurant = this.restaurant) {
    this.map = new Map('map', {
      zoom: 18,
      center: restaurant.latlng
    });

    new TileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 13,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibXJhZGVub3ZpYyIsImEiOiJjamtlM2J3ZzUwNXkwM2tydzVxMms0Y2ZsIn0.9ZoLEoZuLhpFrwoNubqhBA'
    }).addTo(this.map);
    
    new Marker(restaurant.latlng, {
      title: restaurant.name
    }).addTo(this.map);
  }

  /**
   * Get current restaurant from page URL.
   */
  fetchRestaurantFromURL() {
    if (this.restaurant) { // restaurant already fetched!
      return this.restaurant;
    }

    const id = this.getParameterByName('id');
    if (!id) { // no id found in URL
      throw 'No restaurant id in URL';
    } else {
      let controller = this;
      return this.db.getRestaurant(id)
        .then(restaurant => {
          controller.restaurant = restaurant;
          controller.fillRestaurantHTML(restaurant);
          return restaurant;
        })
        .catch(error => console.error(error));
    }
  }

  /**
   * Create restaurant HTML and add it to the webpage
   */
  fillRestaurantHTML(restaurant = this.restaurant) {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    image.alt = restaurant.name + ' restaurant';

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
      this.fillRestaurantHoursHTML(restaurant);
    }
  }

  /**
   * Create restaurant operating hours HTML table and add it to the webpage.
   */
  fillRestaurantHoursHTML(restaurant) {
    let operatingHours = restaurant.operating_hours;

    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
      const row = document.createElement('tr');

      const day = document.createElement('td');
      day.innerHTML = key;
      row.appendChild(day);

      const time = document.createElement('td');
      time.innerHTML = operatingHours[key];
      row.appendChild(time);

      hours.appendChild(row);
    }
  }

  /**
   * Create all reviews HTML and add them to the webpage.
   */
  fillReviewsHTML(reviews) {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(this.createReviewHTML(review));
    });
    container.appendChild(ul);
  }

  /**
   * Create review HTML and add it to the webpage.
   */
  createReviewHTML(review) {
    const li = document.createElement('li');
    const article = document.createElement('article');
    li.appendChild(article);

    const header = document.createElement('header');
    header.className = 'review-header';
    article.appendChild(header);

    const heading = document.createElement('h3');
    heading.className = 'review-heading';
    header.appendChild(heading);

    const name = document.createElement('span');
    name.innerHTML = review.name;
    name.className = 'review-name';
    heading.appendChild(name);

    const date = document.createElement('span');
    date.innerHTML = review.date;
    date.className = 'review-date';
    heading.appendChild(date);

    const rating = document.createElement('div');
    rating.innerHTML = `Rating: ${review.rating}`;
    rating.className = 'review-rating';
    article.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    comments.className = 'review-comment';
    article.appendChild(comments);

    return li;
  }

  /**
   * Add restaurant name to the breadcrumb navigation menu
   */
  fillBreadcrumb(restaurant = this.restaurant) {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
  }

  /**
   * Get a parameter by name from page URL.
   */
  getParameterByName(name, url) {
    if (!url)
      url = window.location.href;
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
      results = regex.exec(url);
    if (!results)
      return null;
    if (!results[2])
      return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let restaurantControler = new RestaurantController();
  restaurantControler.init();
  // GoogleMapsLoader.load(google => restaurantControler.initMap(google));
});