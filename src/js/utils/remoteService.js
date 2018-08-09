export default class RemoteService {

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
}