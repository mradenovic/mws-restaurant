import idb from 'idb';

/**
 * Common database helper functions.
 */
export default class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Handle fetch errors
   * 
   * https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
   * 
   * @param {Prommise} response 
   */
  static getData(response) {
    if (!response.ok) {
      throw Error(response.status.text);
    }
    return response.json();
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // check idb for restaurants
    this.idbGetRestaurants()
      .then(restaurants => {
        if (restaurants && restaurants.length > 0) {
          callback(null, restaurants);
        } else {
          // fetch restaurants
          fetch(DBHelper.DATABASE_URL)
            .then(DBHelper.getData)
            .then(restaurants => {
              this.idbSetRestaurants(restaurants);
              callback(null, restaurants);
            })
            .catch(error => {
              callback(error, null);
            });
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch restaurant
    fetch(`http://localhost:1337/restaurants?id=${id}`)
      .then(DBHelper.getData)
      .then(restaurant => {
        callback(null, restaurant);
      })
      .catch(error => {
        callback(error, null);
      });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    let img = restaurant.photograph || restaurant.id;
    return (`/img/${img}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(google, restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

/** Databse Service
 * 
 * Helper class to handle database operations
 */
export class DBService {

  constructor() {
    const HOST = 'http://localhost';
    const PORT = '1337';
    this.DB_URL = `${HOST}:${PORT}`;
    this.db = this.idbGetDB();
  }

  idbGetDB() {
    return idb.open('restaurant-reviews', 2, upgradeDB => {
      // Note: we don't use 'break' in this switch statement,
      // the fall-through behaviour is what we want.
      switch (upgradeDB.oldVersion) {
        case 0:
          upgradeDB.createObjectStore('restaurants', {
            keyPath: 'id'
          });
          // eslint-disable-line no-fallthrough
        case 1: {
          const reviews = upgradeDB.createObjectStore('reviews', {
            keyPath: 'id'
          });
          reviews.createIndex('restaurant', 'restaurant_id', {unique: false});
        }
      }
    });   
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
   * Get reviews for the restaurant from IndexedDB
   * 
   * @param {String} id 
   */
  idbGetReviews(id) {
    return this.idbGetRecords('reviews', 'restaurant', id);
  }

  /**
   * Get restaurants from IndexedDB
   * 
   */
  idbGetRestaurants() {
    return this.idbGetRecords('restaurants');
  }

  /**
   * Get cuisines
   * 
   * @returns {string[]} Unique cuisines.
   */
  getCuisines() {
    return this.getRestaurants()
      .then(restaurants => this.getUniqueValues(restaurants, 'cuisine_type'));
  }

  /**
   * Get neighborhoods
   * 
   * @returns {string[]} Unique neighborhoods.
   */
  getNeighborhoods() {
    return this.getRestaurants()
      .then(restaurants => this.getUniqueValues(restaurants, 'neighborhood'));
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
   * Get records from IndexedDB
   * 
   * If indexName and indexValue are provided, filtered result will be returned.
   * Otherwise, all records will be returned.
   * 
   * @param {string} objectStoreName - The name of the object store.
   * @param {string} indexName - The name of the index.
   * @param {string} indexValue - The index value.
   */
  idbGetRecords(objectStoreName, indexName, indexValue) {
    return this.db.then(function(db) {
      let tx = db.transaction([objectStoreName], 'readonly');
      let store = tx.objectStore(objectStoreName);
      if (indexName && indexValue) {
        let index = store.index( indexName);
        return index.getAll(IDBKeyRange.only(indexValue));
      } else {
        return store.getAll();
      }
    });
  }

  /**
   * Store reviews into IndexedDB
   * 
   * @param {Object[]} reviews - The reviews to be stored.
   */
  idbPostReviews(reviews) {
    return this.idbPostRecords('reviews', reviews);
  }

  /**
   * Store reviews into IndexedDB
   * 
   * @param {Object[]} reviews - The reviews to be stored.
   */
  idbPostRestaurants(restaurants) {
    return this.idbPostRecords('restaurants', restaurants);
  }

  /**
   * Store records into IndexedDB
   * 
   * @param {string} objectStoreName - The name of the object store.
   * @param {Object[]} records - The records to be stored. 
   */
  idbPostRecords(objectStoreName, records) {
    return this.db
      .then(db => {
        var tx = db.transaction([objectStoreName], 'readwrite');
        var store = tx.objectStore(objectStoreName);
        return Promise.all(records.map(record => {
          return store.add(record);
        })
        ).catch(function(e) {
          tx.abort();
          console.log(e);
        });
      })
      // return records Promise
      .then(() => records);
  }

  /**
   * Gets reviews for the restaurant
   * 
   * @param {String} id 
   */
  getReviews(id) {
    return this.idbGetReviews(id)
      .then(reviews => {
        if (reviews && reviews.length > 0) {
          return reviews;
        } else {
          return this.remoteGetReviews(id)
            .then(reviews => this.idbPostReviews(reviews));
        }
      });
  }

  /**
   * Gets restaurants
   * 
   * @return {Object[]}
   */
  getRestaurants() {
    return this.idbGetRestaurants()
      .then(restaurants => {
        if (restaurants && restaurants.length > 0) {
          return restaurants;
        } else {
          return this.remoteGetRestaurants()
            .then(restaurants => this.idbPostRestaurants(restaurants));
        }
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

  /**
   * Fetch reviews for the restaurant from a remote server
   * 
   * @param {String} id restaurant id
   * @returns {Object[]}  
   */
  remoteGetReviews(id) {
    const {DB_URL} = this;
    return this.remoteGetRecords(`${DB_URL}/reviews/?restaurant_id=${id}`);
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