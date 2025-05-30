// Sample media data - Replace with your actual media files
const mediaItems = [
    {
        type: 'image',
        src: 'images/School-1.png',
        caption: 'School-1'
    },
    {
        type: 'image',
        src: 'images/Logo.png',
        caption: 'Logo'
    },
    {
        type: 'video',
        src: 'video/km_20250530_1080p_60f_20250530_165419.mp4',
        caption: 'Splash Screen'
    }
];

// DOM Elements
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalCaption = document.getElementById('modalCaption');
const closeButton = document.querySelector('.close-button');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

let currentMediaIndex = 0;

// Initialize gallery
function initializeGallery() {
    mediaItems.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.caption;
            img.loading = 'lazy';
            galleryItem.appendChild(img);
        } else if (item.type === 'video') {
            const video = document.createElement('video');
            video.src = item.src;
            video.controls = true;
            video.preload = 'metadata';
            video.poster = item.poster || ''; // Optional poster image
            galleryItem.appendChild(video);
        }
        
        const caption = document.createElement('div');
        caption.className = 'caption';
        caption.textContent = item.caption;
        galleryItem.appendChild(caption);
        
        galleryItem.addEventListener('click', () => openModal(index));
        
        gallery.appendChild(galleryItem);
    });
}

// Modal functions
function openModal(index) {
    currentMediaIndex = index;
    updateModalContent();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    // Stop any playing video when closing modal
    const video = modalContent.querySelector('video');
    if (video) {
        video.pause();
    }
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function updateModalContent() {
    const item = mediaItems[currentMediaIndex];
    modalContent.innerHTML = ''; // Clear previous content
    
    if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.caption;
        img.className = 'modal-content';
        modalContent.appendChild(img);
    } else if (item.type === 'video') {
        const video = document.createElement('video');
        video.src = item.src;
        video.controls = true;
        video.className = 'modal-content';
        video.autoplay = true;
        if (item.poster) {
            video.poster = item.poster;
        }
        modalContent.appendChild(video);
    }
    
    modalCaption.textContent = item.caption;
}

function showPrevMedia() {
    currentMediaIndex = (currentMediaIndex - 1 + mediaItems.length) % mediaItems.length;
    updateModalContent();
}

function showNextMedia() {
    currentMediaIndex = (currentMediaIndex + 1) % mediaItems.length;
    updateModalContent();
}

// Search functionality
function searchMedia() {
    const searchTerm = searchInput.value.toLowerCase();
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        const caption = mediaItems[index].caption.toLowerCase();
        if (caption.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Event listeners
closeButton.addEventListener('click', closeModal);
prevButton.addEventListener('click', showPrevMedia);
nextButton.addEventListener('click', showNextMedia);
searchButton.addEventListener('click', searchMedia);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchMedia();
    }
});

// Close modal when clicking outside the content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'block') {
        switch (e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                showPrevMedia();
                break;
            case 'ArrowRight':
                showNextMedia();
                break;
        }
    }
});

// Initialize the gallery when the page loads
window.addEventListener('load', initializeGallery); 