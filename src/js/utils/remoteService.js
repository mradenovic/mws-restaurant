export default class RemoteService {

  static get DB_URL() {
    const HOST = 'http://localhost';
    const PORT = '1337';
    return `${HOST}:${PORT}`;
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
  static handleFetchError(response) {
    if (!response.ok) {
      throw Error(response.status.text);
    }
    return response;
  }

  static postReview(postUrl, review) {
    return fetch(postUrl, {method: 'POST', body: review})
      .then(response => this.handleFetchError(response))
      .then(response => response.json());
  }

  /**
   * Fetch array of objects from a remote server
   *
   * @param {stirng} url  
   * @returns {Object[]}  
   */
  static getRecords(url) {
    return fetch(url)
      .then(response => this.handleFetchError(response))
      .then(response => response.json());
  }  

  static putFavorite(url) {
    return fetch(url, {method: 'PUT'})
      .then(response => this.handleFetchError(response))
      .then(response => response.json());
  }

  /**
   * Fetch reviews for the restaurant from a remote server
   * 
   * @param {String} id restaurant id
   * @returns {Object[]}  
   */
  static getReviews(id) {
    const {DB_URL} = this;
    let PATH = '/reviews/';
    if (id) {
      PATH += `?restaurant_id=${id}`;
    }
    return this.getRecords(`${DB_URL}${PATH}`);
  }

  /**
   * Fetch restaurants from a remote server
   * 
   * @returns {Object[]}  
   */
  static getRestaurants() {
    const {DB_URL} = this;
    return this.getRecords(`${DB_URL}/restaurants`);
  }

}