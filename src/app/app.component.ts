import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import booleanDisjoint from '@turf/boolean-disjoint';
import lineIntersect from '@turf/line-intersect';
import buffer from '@turf/buffer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  recyclingPoints = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6541, -25.4938],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6527, -25.4903],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6558, -25.4871],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6603, -25.486],
        },
        properties: {},
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6684, -25.485],
        },
        properties: {},
      },
    ],
  };
  mapbox = mapboxgl as typeof mapboxgl;
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/light-v11';
  lat = -25.4938;
  lng = -54.6541;
  zoom = 15;
  async getDirections(
    originPoint: number[],
    destinyPoint: number[],
    accessToken: string
  ) {
    try {
      let response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${originPoint[0]},${originPoint[1]};${destinyPoint[0]},${destinyPoint[1]}?geometries=geojson&access_token=${accessToken}`,
        { method: 'GET' }
      );
      return await response.json();
    } catch (err) {
      console.log(err);
    }
  }

  constructor() {
    this.mapbox.accessToken = environment.mapBoxToken;
  }

  ngOnInit() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: this.zoom,
      center: [this.lng, this.lat],
    });
    navigator.geolocation.getCurrentPosition((position) => {
      this.map.setCenter([position.coords.longitude, position.coords.latitude]);
      new mapboxgl.Marker()
        .setLngLat([position.coords.longitude, position.coords.latitude])
        .addTo(this.map);
    });
    this.map.on('move', () => {
      this.lng = parseFloat(this.map.getCenter().lng.toFixed(4));
      this.lat = parseFloat(this.map.getCenter().lat.toFixed(4));
      this.zoom = parseFloat(this.map.getZoom().toFixed(2));
    });
    let obstacle = buffer(this.recyclingPoints as any, 0.04, {
      units: 'kilometers',
    });
    this.map.on('load', () => {
      this.map.addLayer({
        id: 'recyclingPoints',
        type: 'fill',
        source: {
          type: 'geojson',
          data: obstacle,
        },
        layout: {},
        paint: {
          'fill-color': '#f03b20',
          'fill-opacity': 0,
          'fill-outline-color': '#f03b20',
        },
      });
    });
    this.recyclingPoints.features.forEach((item) => {
      const element = document.createElement('img');
      element.src = '/assets/green-marker.svg';
      new mapboxgl.Marker(element)
        .setLngLat(item.geometry.coordinates as any)
        .addTo(this.map);
    });
  }
}
