import idb from './idbService.js';
import remote from './remoteService.js';

/** Databse Service
 * 
 * Helper class to handle database operations
 */
export default class DBService {

  /**
   * Gets restaurant page url
   * 
   * @param {Object} restaurant
   * @returns {string} restaurant page url.
   */
  static getUrl(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Gets restaurant image url
   * 
   * @param {Object} restaurant
   * @returns {string} restaurant image url.
   */
  static getImageUrl(restaurant) {
    let img = restaurant.photograph || restaurant.id;
    return (`/img/${img}.webp`);
  }

  getRegistration() {
    return new Promise((resolve, reject) => {
      if (location.protocol != 'https:' && !location.hostname == 'localhost') {
        reject('Only secured origins allow service workers');
      }
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        resolve(navigator.serviceWorker.ready);
      } else {
        reject('Sync not suported');
      }
    });
  }

  constructor() {
    const HOST = 'http://localhost';
    const PORT = '1337';
    this.DB_URL = `${HOST}:${PORT}`;
  }

  /**
   * Handle fetch errors
   * 
   * If there is an error, throws an error, otherwise
   * returns response.
   * 
   * https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
   * 
   * @param {Prommise} response 
   */
  handleFetchError(response) {
    if (!response.ok) {
      throw Error(response.status.text);
    }
    return response;
  }

  /**
   * Get cuisines
   * 
   * @param {Object[]} restaurants
   * @returns {string[]} Unique cuisines.
   */
  getCuisines(restaurants) {
    return this.getUniqueValues(restaurants, 'cuisine_type');
  }

  /**
   * Get neighborhoods
   * 
   * @param {Object[]} restaurants
   * @returns {string[]} Unique neighborhoods.
   */
  getNeighborhoods(restaurants) {
    return this.getUniqueValues(restaurants, 'neighborhood');
  }

  /** Get unique values from records for a given filed
   * 
   * @param {Object[]} records
   * @returns {string[]} Unique values.
   */
  getUniqueValues(records, fieldName) {
    // Get all cuisines from all restaurants
    const values = records.map((record) => record[fieldName]);
    // Remove duplicates from cuisines
    const uniqueValues = values.filter((v, i) => values.indexOf(v) == i);
    return uniqueValues;
  }

  /**
   * Gets reviews for the restaurant
   * 
   * @param {String} id 
   */
  getReviews(id) {
    return idb.getReviews(id)
      .then(reviews => {
        // console.log(`idb.getReviews(${id})`, id, reviews)
        if (reviews && reviews.length > 0) {
          return reviews;
        } else {
          // console.log('reviews before remote.get()', reviews)
          return remote.getReviews(id)
            .then(reviews => {
              // console.log(`remote.getReviews(${id}):`, reviews);
              return idb.postReviews(reviews);
            });
        }
      });
  }

  /**
   * Gets restaurants
   * 
   * @return {Object[]}
   */
  getRestaurants() {
    return idb.getRestaurants()
      .then(restaurants => {
        if (restaurants && restaurants.length > 0) {
          return restaurants;
        } else {
          return remote.getRestaurants()
            .then(restaurants => idb.postRestaurants(restaurants));
        }
      });
  }

  /**
   * Gets restaurant by id
   * 
   * @param {String} id
   * @return {Object}
   */
  getRestaurant(id) {
    return this.getRestaurants()
      .then(restaurants => restaurants.find(r => r.id == id ));
  }

  putFavorite(restaurant) {
    return idb.putRecords('restaurants', [restaurant])
      .then(() => this.syncPutFavorite(restaurant));
  }

  syncPutFavorite(restaurant) {
    const {id, is_favorite} = restaurant;
    const {DB_URL} = this;
    const PATH = `/restaurants/${id}/?is_favorite=${is_favorite}`;
    const putUrl = `${DB_URL}${PATH}`;
    return this.getRegistration()
      .then(reg => {
        return reg.sync.register(`PUT@${putUrl}`);
      })
      .catch(e => {
        console.log('Syncing error;', e);
        remote.putFavorite(putUrl);
      });
  }

  postReview(review) {
    const {DB_URL} = this;
    const PATH = '/reviews/';
    const postUrl = `${DB_URL}${PATH}`;
    const data = JSON.stringify(review);
    return this.getRegistration()
      // if possible do  background sync
      .then(reg => {
        return reg.sync.register(`POST@${postUrl}@${data}`);
      })
      // if background sync not supported
      // do instant sync
      .catch(e => {
        console.log('Syncing error;', e);
        return remote.postReview(postUrl, data)
          .then(review => idb.postRecords('reviews', [review]))
          // return newly created review
          .then(reviews => reviews[0]);
      });
  }

  /**
   * Gets filtered restaurants
   * 
   * @param {String} cuisine
   * @param {String} neighborhood
   * @return {Object[]}
   */
  getFilteredResaurants (cuisine, neighborhood ) {
    return this.getRestaurants()
      .then(restaurants => {
        if (cuisine!= 'all') {
          restaurants = restaurants.filter(restaurant => restaurant.cuisine_type == cuisine);
        }
        if (neighborhood!= 'all') {
          restaurants = restaurants.filter(restaurant => restaurant.neighborhood == neighborhood);
        }
        return restaurants;
      });
  }

}