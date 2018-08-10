import idb from './idbService.js';

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
        if (reviews && reviews.length > 0) {
          return reviews;
        } else {
          return this.remoteGetReviews(id)
            .then(reviews => idb.postReviews(reviews));
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
          return this.remoteGetRestaurants()
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
        this.remotePutFavorite(putUrl);
      });
  }

  remotePutFavorite(url) {
    return fetch(url, {method: 'PUT'});
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
        return this.remotePostReview(postUrl, data)
          .then(review => idb.postRecords('reviews', [review]))
          // return newly created review
          .then(reviews => reviews[0]);
      });
  }

  remotePostReview(postUrl, review) {
    return fetch(postUrl, {method: 'POST', body: review})
      .then(response => this.handleFetchError(response))
      .then(response => response.json());
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

  /**
   * Fetch reviews for the restaurant from a remote server
   * 
   * @param {String} id restaurant id
   * @returns {Object[]}  
   */
  remoteGetReviews(id) {
    const {DB_URL} = this;
    let PATH = '/reviews/';
    if (id) {
      PATH += `?restaurant_id=${id}`;
    }

    return this.remoteGetRecords(`${DB_URL}${PATH}`);
  }

  /**
   * Fetch restaurants from a remote server
   * 
   * @returns {Object[]}  
   */
  remoteGetRestaurants() {
    const {DB_URL} = this;
    return this.remoteGetRecords(`${DB_URL}/restaurants`);
  }

  /**
   * Fetch array of objects from a remote server
   *
   * @param {stirng} url  
   * @returns {Object[]}  
   */
  remoteGetRecords(url) {
    return fetch(url)
      .then(response => this.handleFetchError(response))
      .then(response => response.json());
  }

}