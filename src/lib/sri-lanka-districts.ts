
import type { FeatureCollection } from 'geojson';

export const districts = [
  { name: 'Colombo', lat: 6.9271, lng: 79.8612 },
  { name: 'Gampaha', lat: 7.0928, lng: 79.9989 },
  { name: 'Kalutara', lat: 6.5854, lng: 80.0601 },
  { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
  { name: 'Matale', lat: 7.4675, lng: 80.6234 },
  { name: 'Nuwara Eliya', lat: 6.9687, lng: 80.7839 },
  { name: 'Galle', lat: 6.0535, lng: 80.2210 },
  { name: 'Matara', lat: 5.9545, lng: 80.5568 },
  { name: 'Hambantota', lat: 6.1245, lng: 81.1185 },
  { name: 'Jaffna', lat: 9.6615, lng: 80.0255 },
  { name: 'Kilinochchi', lat: 9.3828, lng: 80.3996 },
  { name: 'Mannar', lat: 8.9804, lng: 79.9056 },
  { name: 'Vavuniya', lat: 8.7513, lng: 80.4984 },
  { name: 'Mullaitivu', lat: 9.2678, lng: 80.8143 },
  { name: 'Batticaloa', lat: 7.7299, lng: 81.6924 },
  { name: 'Ampara', lat: 7.2922, lng: 81.6749 },
  { name: 'Trincomalee', lat: 8.5874, lng: 81.2152 },
  { name: 'Kurunegala', lat: 7.485, lng: 80.3607 },
  { name: 'Puttalam', lat: 8.0333, lng: 79.8333 },
  { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037 },
  { name: 'Polonnaruwa', lat: 7.9403, lng: 81.0188 },
  { name: 'Badulla', lat: 6.9934, lng: 81.0550 },
  { name: 'Moneragala', lat: 6.873, lng: 81.343 },
  { name: 'Ratnapura', lat: 6.705, lng: 80.3842 },
  { name: 'Kegalle', lat: 7.251, lng: 80.3464 },
];

export const sriLankaDistrictsGeoJSON: FeatureCollection = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": { "district": "Ampara", "province": "Eastern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [81.855, 7.575], [81.87, 7.35], [81.675, 7.292], [81.67, 6.7], [81.4, 6.45], [81.32, 6.8], [81.5, 7.2], [81.855, 7.575]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Anuradhapura", "province": "North Central" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.02, 8.85], [80.45, 8.9], [80.75, 8.7], [81.0, 8.35], [80.7, 7.7], [80.35, 7.4], [80.2, 7.75], [79.9, 8.2], [80.02, 8.85]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Badulla", "province": "Uva" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.88, 7.2], [81.1, 7.3], [81.25, 7.15], [81.35, 6.8], [80.9, 6.6], [80.75, 6.9], [80.88, 7.2]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Batticaloa", "province": "Eastern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [81.2, 8.1], [81.5, 8.2], [81.7, 8.0], [81.8, 7.7], [81.675, 7.292], [81.5, 7.2], [81.2, 8.1]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Colombo", "province": "Western" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [79.845, 6.94], [79.9, 6.98], [80.05, 6.92], [80.07, 6.8], [79.95, 6.73], [79.85, 6.79], [79.845, 6.94]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Galle", "province": "Southern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.05, 6.3], [80.221, 6.54], [80.35, 6.25], [80.45, 6.0], [80.22, 5.95], [80.05, 6.3]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Gampaha", "province": "Western" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [79.82, 7.3], [80.0, 7.31], [80.15, 7.15], [80.05, 6.92], [79.9, 6.98], [79.82, 7.3]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Hambantota", "province": "Southern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.7, 6.3], [80.9, 6.6], [81.25, 6.7], [81.4, 6.4], [81.118, 6.124], [80.9, 6.0], [80.7, 6.3]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Jaffna", "province": "Northern" },
        "geometry": {
          "type": "MultiPolygon",
          "coordinates": [
            [[[80.025, 9.661]]],
            [[[79.8, 9.8], [80.1, 9.85], [80.2, 9.75], [79.9, 9.5], [79.8, 9.8]]],
            [[[80.3, 9.8], [80.4, 9.75], [80.35, 9.65], [80.25, 9.7], [80.3, 9.8]]]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Kalutara", "province": "Western" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [79.95, 6.73], [80.07, 6.8], [80.221, 6.54], [80.1, 6.35], [79.95, 6.5], [79.95, 6.73]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Kandy", "province": "Central" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.5, 7.5], [80.7, 7.45], [80.8, 7.3], [80.83, 7.1], [80.633, 7.29], [80.45, 7.2], [80.5, 7.5]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Kegalle", "province": "Sabaragamuwa" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.15, 7.15], [80.346, 7.251], [80.5, 7.1], [80.4, 6.8], [80.2, 6.85], [80.15, 7.15]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Kilinochchi", "province": "Northern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.2, 9.5], [80.4, 9.6], [80.6, 9.4], [80.399, 9.382], [80.1, 9.2], [80.2, 9.5]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Kurunegala", "province": "North Western" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [79.9, 7.7], [80.3, 8.0], [80.5, 7.8], [80.45, 7.2], [80.346, 7.251], [80.0, 7.31], [79.9, 7.7]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Mannar", "province": "Northern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [79.7, 9.2], [80.0, 9.3], [80.2, 9.1], [80.4, 8.8], [80.1, 8.6], [79.75, 8.7], [79.7, 9.2]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Matale", "province": "Central" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.45, 7.9], [80.7, 7.8], [80.85, 7.5], [80.623, 7.467], [80.45, 7.2], [80.35, 7.4], [80.45, 7.9]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Matara", "province": "Southern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.45, 6.0], [80.556, 5.954], [80.7, 6.3], [80.5, 6.35], [80.35, 6.25], [80.45, 6.0]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Moneragala", "province": "Uva" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.9, 6.6], [81.35, 6.8], [81.5, 6.6], [81.2, 6.3], [80.9, 6.6]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Mullaitivu", "province": "Northern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.4, 9.6], [80.8, 9.5], [80.814, 9.267], [80.6, 9.0], [80.3, 9.1], [80.4, 9.6]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Nuwara Eliya", "province": "Central" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.5, 7.1], [80.83, 7.1], [80.95, 6.9], [80.783, 6.968], [80.55, 6.7], [80.5, 7.1]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Polonnaruwa", "province": "North Central" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.7, 7.7], [81.018, 7.94], [81.3, 7.8], [81.2, 7.4], [80.85, 7.5], [80.7, 7.7]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Puttalam", "province": "North Western" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [79.7, 8.5], [79.833, 8.033], [80.0, 7.7], [79.9, 8.2], [79.7, 8.5]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Ratnapura", "province": "Sabaragamuwa" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.2, 6.85], [80.4, 6.8], [80.7, 6.9], [80.8, 6.5], [80.5, 6.35], [80.384, 6.705], [80.2, 6.85]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Trincomalee", "province": "Eastern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.8, 9.0], [81.215, 8.587], [81.1, 8.3], [80.75, 8.7], [80.8, 9.0]
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": { "district": "Vavuniya", "province": "Northern" },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [80.2, 9.1], [80.6, 9.0], [80.7, 8.8], [80.498, 8.751], [80.3, 8.6], [80.2, 9.1]
            ]
          ]
        }
      }
    ]
  };
