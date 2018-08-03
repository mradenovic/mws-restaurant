import {Map, TileLayer, Marker} from 'leaflet';

export default class MapService {
  static createMap(mapId, mapCenter) {
    let map = new Map(mapId, {
      zoom: 18,
      scrollWheelZoom: false,
      center: mapCenter
    });

    const tileUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
    const tileConfig = {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 13,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibXJhZGVub3ZpYyIsImEiOiJjamtlM2J3ZzUwNXkwM2tydzVxMms0Y2ZsIn0.9ZoLEoZuLhpFrwoNubqhBA'
    };

    new TileLayer(tileUrl, tileConfig).addTo(map);

    return map;
  }

  static createMarker(restaurant, map) {
    let marker = new Marker(restaurant.latlng, {
      title: restaurant.name
    }).addTo(map);
    return marker;
  }
}