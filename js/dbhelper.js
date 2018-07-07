/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // fetch data
    fetch('http://localhost:1337/restaurants')
      .then(response => {
        return response.json();
      })
      .then(data => {
        callback(null, data);
      });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch restaurant
    fetch(`http://localhost:1337/restaurants?id=${id}`)
      .then(response => {
        return response.json();
      })
      .catch(error => {
        console.log(error);
        callback('Restaurant does not exist', null);
      })
      .then(restaurant => {
        callback(null, restaurant);
      });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // fetch restaurants by cuisine
    fetch(`http://localhost:1337/restaurants?cuisine=${cuisine}`)
      .then(response => {
        return response.json();
      })
      .catch(error => {
        callback(error, null);
      })
      .then(restaurants => {
        callback(null, restaurants);
      });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // fetch restaurants by neighborhood
    fetch(`http://localhost:1337/restaurants?neighborhood=${neighborhood}`)
      .then(response => {
        return response.json();
      })
      .catch(error => {
        callback(error, null);
      })
      .then(restaurants => {
        callback(null, restaurants);
      });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // fetch restaurants by cuisine and neighborhood
    fetch(`http://localhost:1337/restaurants?cuisine=${cuisine}&neighborhood=${neighborhood}`)
      .then(response => {
        return response.json();
      })
      .catch(error => {
        callback(error, null);
      })
      .then(restaurants => {
        callback(null, restaurants);
      });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
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
    return (`/img/${restaurant.photograph}.jpg`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
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
