import { Component, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import booleanDisjoint from '@turf/boolean-disjoint';
import lineIntersect from '@turf/line-intersect';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import buffer from '@turf/buffer';

interface Item {
  name: string;
  address: string;
  closeTime: string;
  coordinates: any;
}

type Filter = {
  order: number;
  material: string[];
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  item$: Observable<Item[]>;
  recyclingPoints = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6541, -25.4938],
        },
        properties: {
          name: 'Centro CDE',
          address: 'Barrio La Blanca km 5 1/2',
          state: 'Abierto',
          closeTime: '5PM',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6527, -25.4903],
        },
        properties: {
          name: 'Centro CDE',
          address: 'Barrio La Blanca km 5 1/2',
          state: 'Abierto',
          closeTime: '5PM',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6558, -25.4871],
        },
        properties: {
          name: 'Centro CDE',
          address: 'Barrio La Blanca km 5 1/2',
          state: 'Abierto',
          closeTime: '5PM',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6603, -25.486],
        },
        properties: {
          name: 'Centro CDE',
          address: 'Barrio La Blanca km 5 1/2',
          state: 'Abierto',
          closeTime: '5PM',
        },
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-54.6684, -25.485],
        },
        properties: {
          name: 'Centro CDE',
          address: 'Barrio La Blanca km 5 1/2',
          state: 'Abierto',
          closeTime: '5PM',
        },
      },
    ],
  };
  filters: Filter = {
    order: 0,
    material: [],
  };
  materials = ['Hierro', 'Plástico', 'Cobre', 'Madera'];
  filteredPoints: any = [];
  showMaterials = false;
  mapbox = mapboxgl as typeof mapboxgl;
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/light-v11';
  lat = -25.4938;
  lng = -54.6541;
  zoom = 15;
  showMenu = true;
  constructor(firestore: Firestore) {
    this.mapbox.accessToken = environment.mapBoxToken;
    const itemsCollection: any = collection(firestore, 'recycle-point');
    this.item$ = collectionData(itemsCollection);
  }

  materialsClickHandler() {
    this.showMaterials = !this.showMaterials;
  }

  filterPoints() {
    if (this.filters.order == 1) {
      this.filteredPoints = this.filteredPoints.sort((a: any, b: any) => {
        return b.name.localeCompare(a.name);
      });
    } else {
      this.item$.subscribe((value) => {
        this.filteredPoints = value;
      });
    }
  }

  changeOrder(event: any) {
    this.filters = { ...this.filters, order: event.target.value };
  }

  showMenuHandler() {
    this.showMenu = !this.showMenu;
  }

  ngOnInit() {
    this.item$.subscribe((value) => {
      console.log(typeof value[0].coordinates);
      console.log(typeof value[0].coordinates.latitude);
      this.filteredPoints = value;
    });
    console.log(this.filteredPoints);
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
