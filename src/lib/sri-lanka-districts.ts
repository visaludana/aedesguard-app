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
            "properties": { "district": "Colombo", "province": "Western" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 79.846, 6.953 ], [ 79.914, 6.999 ], [ 80.009, 6.954 ], [ 80.06, 6.89 ], [ 80.08, 6.812 ], [ 79.981, 6.757 ], [ 79.86, 6.78 ], [ 79.846, 6.953 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Gampaha", "province": "Western" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 79.824, 7.292 ], [ 79.938, 7.301 ], [ 80.0, 7.303 ], [ 80.117, 7.203 ], [ 80.116, 7.153 ], [ 80.009, 6.954 ], [ 79.914, 6.999 ], [ 79.846, 6.953 ], [ 79.824, 7.292 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Kalutara", "province": "Western" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 79.981, 6.757 ], [ 80.08, 6.812 ], [ 80.205, 6.582 ], [ 80.22, 6.51 ], [ 80.11, 6.425 ], [ 79.957, 6.568 ], [ 79.981, 6.757 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Kandy", "province": "Central" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.528, 7.493 ], [ 80.6, 7.498 ], [ 80.686, 7.46 ], [ 80.78, 7.373 ], [ 80.835, 7.221 ], [ 80.75, 7.15 ], [ 80.729, 7.02 ], [ 80.573, 6.953 ], [ 80.46, 7.123 ], [ 80.47, 7.31 ], [ 80.528, 7.493 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Matale", "province": "Central" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.545, 7.962 ], [ 80.649, 7.92 ], [ 80.774, 7.79 ], [ 80.825, 7.55 ], [ 80.686, 7.46 ], [ 80.6, 7.498 ], [ 80.528, 7.493 ], [ 80.47, 7.31 ], [ 80.46, 7.66 ], [ 80.545, 7.962 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Nuwara Eliya", "province": "Central" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.573, 6.953 ], [ 80.729, 7.02 ], [ 80.75, 7.15 ], [ 80.835, 7.221 ], [ 80.963, 7.009 ], [ 80.89, 6.82 ], [ 80.78, 6.78 ], [ 80.55, 6.75 ], [ 80.573, 6.953 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Galle", "province": "Southern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.07, 6.425 ], [ 80.22, 6.51 ], [ 80.35, 6.27 ], [ 80.32, 6.03 ], [ 80.217, 5.96 ], [ 80.07, 6.425 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Matara", "province": "Southern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.35, 6.27 ], [ 80.53, 6.3 ], [ 80.6, 6.17 ], [ 80.54, 5.94 ], [ 80.32, 6.03 ], [ 80.35, 6.27 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Hambantota", "province": "Southern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.6, 6.17 ], [ 80.78, 6.3 ], [ 80.9, 6.6 ], [ 81.1, 6.75 ], [ 81.25, 6.7 ], [ 81.4, 6.4 ], [ 81.23, 6.1 ], [ 80.9, 5.99 ], [ 80.75, 6.0 ], [ 80.6, 6.17 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Jaffna", "province": "Northern" },
            "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 79.93, 9.8 ], [ 80.0, 9.82 ], [ 80.1, 9.75 ], [ 80.05, 9.6 ], [ 79.9, 9.65 ], [ 79.93, 9.8 ] ] ], [ [ [ 80.2, 9.75 ], [ 80.25, 9.7 ], [ 80.2, 9.65 ], [ 80.15, 9.7 ], [ 80.2, 9.75 ] ] ], [ [ [ 80.4, 9.7 ], [ 80.45, 9.65 ], [ 80.4, 9.6 ], [ 80.35, 9.65 ], [ 80.4, 9.7 ] ] ], [ [ [ 80.5, 9.8 ], [ 80.55, 9.75 ], [ 80.5, 9.7 ], [ 80.45, 9.75 ], [ 80.5, 9.8 ] ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Kilinochchi", "province": "Northern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.1, 9.5 ], [ 80.25, 9.55 ], [ 80.4, 9.6 ], [ 80.6, 9.5 ], [ 80.5, 9.3 ], [ 80.2, 9.25 ], [ 80.1, 9.5 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Mannar", "province": "Northern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 79.75, 9.1 ], [ 79.9, 9.2 ], [ 80.05, 9.0 ], [ 80.2, 9.25 ], [ 80.5, 9.3 ], [ 80.4, 8.8 ], [ 80.1, 8.6 ], [ 79.75, 9.1 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Vavuniya", "province": "Northern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.2, 9.25 ], [ 80.5, 9.3 ], [ 80.8, 9.1 ], [ 80.7, 8.7 ], [ 80.6, 8.5 ], [ 80.3, 8.6 ], [ 80.1, 8.6 ], [ 80.2, 9.25 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Mullaitivu", "province": "Northern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.5, 9.3 ], [ 80.6, 9.5 ], [ 80.8, 9.4 ], [ 81.1, 9.1 ], [ 80.8, 9.1 ], [ 80.5, 9.3 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Batticaloa", "province": "Eastern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 81.3, 8.2 ], [ 81.5, 8.0 ], [ 81.7, 7.9 ], [ 81.8, 7.6 ], [ 81.7, 7.4 ], [ 81.4, 7.3 ], [ 81.3, 8.2 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Ampara", "province": "Eastern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 81.4, 7.3 ], [ 81.7, 7.4 ], [ 81.8, 7.6 ], [ 81.85, 7.2 ], [ 81.6, 6.8 ], [ 81.3, 7.0 ], [ 81.4, 7.3 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Trincomalee", "province": "Eastern" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.8, 9.1 ], [ 81.1, 9.1 ], [ 81.2, 8.8 ], [ 81.25, 8.5 ], [ 81.1, 8.3 ], [ 80.9, 8.4 ], [ 80.6, 8.5 ], [ 80.8, 9.1 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Kurunegala", "province": "North Western" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 79.938, 7.301 ], [ 80.117, 7.203 ], [ 80.46, 7.123 ], [ 80.47, 7.31 ], [ 80.46, 7.66 ], [ 80.3, 8.0 ], [ 80.0, 7.8 ], [ 79.938, 7.301 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Puttalam", "province": "North Western" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 79.7, 8.5 ], [ 79.8, 8.3 ], [ 79.9, 8.0 ], [ 80.0, 7.8 ], [ 80.3, 8.0 ], [ 80.1, 8.6 ], [ 79.7, 8.5 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Anuradhapura", "province": "North Central" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.1, 8.6 ], [ 80.3, 8.6 ], [ 80.6, 8.5 ], [ 80.9, 8.4 ], [ 81.1, 8.3 ], [ 80.9, 8.0 ], [ 80.545, 7.962 ], [ 80.46, 7.66 ], [ 80.3, 8.0 ], [ 80.1, 8.6 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Polonnaruwa", "province": "North Central" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.825, 7.55 ], [ 80.774, 7.79 ], [ 80.649, 7.92 ], [ 80.545, 7.962 ], [ 80.9, 8.0 ], [ 81.1, 8.3 ], [ 81.3, 8.2 ], [ 81.0, 7.5 ], [ 80.825, 7.55 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Badulla", "province": "Uva" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.89, 6.82 ], [ 80.963, 7.009 ], [ 80.835, 7.221 ], [ 81.0, 7.5 ], [ 81.3, 7.0 ], [ 81.1, 6.75 ], [ 80.9, 6.6 ], [ 80.89, 6.82 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Moneragala", "province": "Uva" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.9, 6.6 ], [ 81.1, 6.75 ], [ 81.25, 6.7 ], [ 81.4, 6.4 ], [ 81.6, 6.8 ], [ 81.3, 7.0 ], [ 80.9, 6.6 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Ratnapura", "province": "Sabaragamuwa" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.205, 6.582 ], [ 80.55, 6.75 ], [ 80.78, 6.78 ], [ 80.6, 6.17 ], [ 80.53, 6.3 ], [ 80.35, 6.27 ], [ 80.205, 6.582 ] ] ] }
        },
        {
            "type": "Feature",
            "properties": { "district": "Kegalle", "province": "Sabaragamuwa" },
            "geometry": { "type": "Polygon", "coordinates": [ [ [ 80.117, 7.203 ], [ 80.116, 7.153 ], [ 80.46, 7.123 ], [ 80.573, 6.953 ], [ 80.55, 6.75 ], [ 80.205, 6.582 ], [ 80.08, 6.812 ], [ 80.06, 6.89 ], [ 80.117, 7.203 ] ] ] }
        }
    ]
};
