// API URL - will be updated to the actual backend URL when deployed
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:1234/api'
    : '/api';

// Initialize empty photo array
const photos = [];
let filteredPhotos = [...photos]; 