// API URL
const API_URL = 'http://localhost:1234/api';

// Initialize empty photo array
const photos = [];
let filteredPhotos = [...photos];

// DOM Elements
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
const closeButton = document.querySelector('.close-button');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const darkModeToggle = document.getElementById('darkModeToggle');
const categoryButtons = document.querySelectorAll('.category-btn');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');

let currentPhotoIndex = 0;

// Initialize gallery
function initializeGallery() {
    loadPhotos(); // Load photos from server
    setupEventListeners();
    loadDarkModePreference();
}

// Render gallery items with animation
function renderGallery(photosToRender) {
    const emptyState = document.getElementById('emptyState');
    
    if (photosToRender.length === 0) {
        emptyState.style.display = 'flex';
        gallery.innerHTML = '';
        gallery.appendChild(emptyState);
        return;
    }
    
    emptyState.style.display = 'none';
    gallery.innerHTML = '';
    
    photosToRender.forEach((photo, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.style.opacity = '0';
        galleryItem.style.transform = 'translateY(20px)';
        
        const img = document.createElement('img');
        img.src = photo.url;
        img.alt = photo.caption;
        img.loading = 'lazy';
        
        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.textContent = photo.caption;
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deletePhoto(photo.filename);
        };
        
        galleryItem.appendChild(img);
        galleryItem.appendChild(caption);
        galleryItem.appendChild(deleteBtn);
        
        galleryItem.addEventListener('click', () => openModal(index));
        
        gallery.appendChild(galleryItem);
        
        // Staggered animation for items
        setTimeout(() => {
            galleryItem.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            galleryItem.style.opacity = '1';
            galleryItem.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Modal functions
function openModal(index) {
    currentPhotoIndex = index;
    updateModalImage();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Trigger animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function closeModal() {
    modal.classList.remove('show');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

function updateModalImage() {
    const photo = filteredPhotos[currentPhotoIndex];
    modalImg.src = photo.url;
    modalCaption.textContent = photo.caption;
    
    // Add loading animation
    modalImg.style.opacity = '0';
    modalImg.style.transform = 'scale(0.95)';
    
    modalImg.onload = () => {
        modalImg.style.transition = 'all 0.3s ease';
        modalImg.style.opacity = '1';
        modalImg.style.transform = 'scale(1)';
    };
}

function showPrevImage() {
    currentPhotoIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    updateModalImage();
}

function showNextImage() {
    currentPhotoIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
    updateModalImage();
}

// Enhanced search with debounce
let searchTimeout;
function searchPhotos() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredPhotos = photos.filter(photo => 
            photo.caption.toLowerCase().includes(searchTerm) ||
            photo.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        renderGallery(filteredPhotos);
    }, 300);
}

// Enhanced category filtering with animation
function filterByCategory(category) {
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Fade out current gallery
    const items = document.querySelectorAll('.gallery-item');
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
    });
    
    // Update filtered photos
    setTimeout(() => {
        if (category === 'all') {
            filteredPhotos = [...photos];
        } else {
            filteredPhotos = photos.filter(photo => photo.category === category);
        }
        renderGallery(filteredPhotos);
    }, 300);
}

// Dark mode functionality
function toggleDarkMode() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    localStorage.setItem('darkMode', !isDark);
}

function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.setAttribute('data-theme', 'dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Load photos from server
async function loadPhotos() {
    try {
        const response = await fetch(`${API_URL}/photos`);
        const data = await response.json();
        photos.length = 0; // Clear array
        photos.push(...data);
        filteredPhotos = [...photos];
        renderGallery(filteredPhotos);
    } catch (error) {
        console.error('Error loading photos:', error);
        alert('Error loading photos. Please try again later.');
    }
}

// Upload functionality
async function handleFileUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
        if (file.type.startsWith('image/')) {
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('caption', file.name);
            formData.append('category', 'personal');
            formData.append('tags', JSON.stringify(['uploaded']));
            
            try {
                const response = await fetch(`${API_URL}/photos`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Upload failed');
                }
                
                const newPhoto = await response.json();
                photos.push(newPhoto);
                filteredPhotos = [...photos];
                renderGallery(filteredPhotos);
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Error uploading photo. Please try again.');
            }
        }
    }
}

// Delete photo
async function deletePhoto(filename) {
    if (!confirm('Are you sure you want to delete this photo?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/photos/${filename}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Delete failed');
        }
        
        // Remove from arrays
        const index = photos.findIndex(p => p.filename === filename);
        if (index !== -1) {
            photos.splice(index, 1);
            filteredPhotos = [...photos];
            renderGallery(filteredPhotos);
        }
    } catch (error) {
        console.error('Error deleting photo:', error);
        alert('Error deleting photo. Please try again.');
    }
}

// Setup event listeners
function setupEventListeners() {
    closeButton.addEventListener('click', closeModal);
    prevButton.addEventListener('click', showPrevImage);
    nextButton.addEventListener('click', showNextImage);
    searchInput.addEventListener('input', searchPhotos);
    searchButton.addEventListener('click', searchPhotos);
    darkModeToggle.addEventListener('click', toggleDarkMode);
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', (e) => filterByCategory(e.target.dataset.category));
    });
    uploadButton.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        }
    });
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', initializeGallery); 