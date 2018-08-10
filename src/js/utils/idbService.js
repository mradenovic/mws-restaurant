import idb from 'idb';

/** Databse Service
 * 
 * Helper class to handle database operations
 */
class IDBService {

  constructor() {
    this.db = this.getDB();
  }

  getDB() {
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
   * Get reviews for the restaurant from IndexedDB
   * 
   * @param {String} id 
   */
  getReviews(id) {
    return this.getRecords('reviews', 'restaurant', id);
  }

  /**
   * Get restaurants from IndexedDB
   * 
   */
  getRestaurants() {
    return this.getRecords('restaurants');
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
  getRecords(objectStoreName, indexName, indexValue) {
    return this.db.then(db => {
      let tx = db.transaction([objectStoreName], 'readonly');
      let store = tx.objectStore(objectStoreName);
      if (indexName && indexValue) {
        let index = store.index(indexName);
        return index.getAll(IDBKeyRange.only(Number(indexValue)));
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
  postReviews(reviews) {
    return this.postRecords('reviews', reviews);
  }

  /**
   * Store restaurants into IndexedDB
   * 
   * @param {Object[]} reviews - The reviews to be stored.
   */
  postRestaurants(restaurants) {
    return this.postRecords('restaurants', restaurants);
  }

  /**
   * Store records into IndexedDB
   * 
   * @param {string} objectStoreName - The name of the object store.
   * @param {Object[]} records - The records to be stored. 
   */
  postRecords(objectStoreName, records) {
    return this.db
      .then(db => {
        var tx = db.transaction([objectStoreName], 'readwrite');
        var store = tx.objectStore(objectStoreName);
        return Promise.all(records.map(record => {
          return store.add(record);
        })
        ).catch(e => {
          tx.abort();
          console.log(e);
        });
      })
      // return records Promise
      .then(() => records);
  }

  /**
   * Store record into IndexedDB
   * 
   * @param {string} objectStoreName - The name of the object store.
   * @param {Object} record - The record to be updated. 
   */
  putRecords(objectStoreName, records) {
    return this.db
      .then(db => {
        var tx = db.transaction([objectStoreName], 'readwrite');
        var store = tx.objectStore(objectStoreName);
        return Promise.all(records.map(record => {
          return store.put(record);
        })
        ).catch(e => {
          tx.abort();
          console.log(e);
        });
      })
      // return records Promise
      .then(() => records);
  }
}

export default new IDBService();