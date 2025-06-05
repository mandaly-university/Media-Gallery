const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 1234;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'));
        }
        cb(null, true);
    }
});

// Database setup
const db = new sqlite3.Database('gallery.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

// Create tables
function createTables() {
    db.run(`CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        caption TEXT,
        category TEXT,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT
    )`);
}

// Get all photos
app.get('/api/photos', (req, res) => {
    db.all('SELECT * FROM photos ORDER BY uploadDate DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Transform the data to match the frontend expectations
        const photos = rows.map(photo => ({
            filename: photo.filename,
            url: `/uploads/${photo.filename}`,
            caption: photo.caption || photo.originalName,
            category: photo.category || 'personal',
            tags: photo.tags ? JSON.parse(photo.tags) : ['uploaded'],
            uploadDate: photo.uploadDate
        }));
        res.json(photos);
    });
});

// Upload a photo
app.post('/api/photos', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caption, category, tags } = req.body;
    const filename = req.file.filename;
    const originalName = req.file.originalname;

    db.run(
        'INSERT INTO photos (filename, originalName, caption, category, tags) VALUES (?, ?, ?, ?, ?)',
        [filename, originalName, caption || originalName, category || 'personal', tags || JSON.stringify(['uploaded'])],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            // Return data in the format expected by the frontend
            res.json({
                filename: filename,
                url: `/uploads/${filename}`,
                caption: caption || originalName,
                category: category || 'personal',
                tags: tags ? JSON.parse(tags) : ['uploaded'],
                uploadDate: new Date().toISOString()
            });
        }
    );
});

// Delete a photo
app.delete('/api/photos/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // First get the file info from database
    db.get('SELECT * FROM photos WHERE filename = ?', [filename], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }

        // Delete the file
        const filepath = path.join(__dirname, 'uploads', filename);
        fs.unlink(filepath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            }
        });

        // Delete from database
        db.run('DELETE FROM photos WHERE filename = ?', [filename], (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Photo deleted successfully' });
        });
    });
});

// Update photo metadata
app.put('/api/photos/:filename', (req, res) => {
    const filename = req.params.filename;
    const { caption, category, tags } = req.body;

    db.run(
        'UPDATE photos SET caption = ?, category = ?, tags = ? WHERE filename = ?',
        [caption, category, tags, filename],
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Photo updated successfully' });
        }
    );
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Connected to SQLite database');
}); 