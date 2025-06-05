# Photo Gallery Application

A full-stack photo gallery application built with Node.js, Express, and SQLite.

## Project Structure

- `frontend/` - Contains the static files (HTML, CSS, JS) for GitHub Pages
- `backend/` - Contains the Node.js server code

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/photo-gallery.git
cd photo-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open `http://localhost:1234` in your browser

## Deployment

### Frontend (GitHub Pages)

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to your repository settings on GitHub
3. Navigate to "Pages" in the sidebar
4. Select the branch you want to deploy (usually `main`)
5. Select the root directory (`/`)
6. Click "Save"

### Backend (Heroku/Railway/Render)

The backend needs to be deployed to a platform that supports Node.js applications. Here are some options:

1. [Heroku](https://www.heroku.com/)
2. [Railway](https://railway.app/)
3. [Render](https://render.com/)

After deploying the backend, update the `API_URL` in `frontend/js/main.js` to point to your deployed backend URL.

## Features

- Photo upload and management
- Category-based filtering
- Search functionality
- Dark mode support
- Responsive design
- Image preview modal
- Keyboard navigation

## Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Font Awesome icons

- Backend:
  - Node.js
  - Express.js
  - SQLite3
  - Multer (file uploads)
  - CORS

## License

MIT 