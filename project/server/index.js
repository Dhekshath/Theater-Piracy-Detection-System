import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Database setup
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create tables if they don't exist
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        detection_duration TEXT NOT NULL,
        face_image_path TEXT NOT NULL,
        status TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        user TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        settings_data TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Check if admin user exists, if not create default admin
    db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err.message);
        return;
      }

      if (!row) {
        bcrypt.hash('admin123', 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err.message);
            return;
          }

          db.run(
            'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)',
            [generateId(), 'admin', hashedPassword, 'admin'],
            (err) => {
              if (err) {
                console.error('Error creating admin user:', err.message);
              } else {
                console.log('Default admin user created');
              }
            }
          );
        });
      }
    });
  });
};

// Helper functions
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const logAuditEvent = (user, action, details, ip) => {
  db.run(
    'INSERT INTO audit_logs (id, user, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
    [generateId(), user, action, details, ip],
    (err) => {
      if (err) {
        console.error('Error logging audit event:', err.message);
      }
    }
  );
};

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
// Login route
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        console.error('Database error during login:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          'your_jwt_secret',
          { expiresIn: '24h' }
        );
        
        // Log login event
        logAuditEvent(username, 'login', 'User logged in', req.ip);
        
        res.json({ token });
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events
app.get('/api/events', authenticateToken, (req, res) => {
  try {
    let query = 'SELECT * FROM events';
    const params = [];
    
    // Apply filters if provided
    if (req.query.date) {
      const date = req.query.date;
      const now = new Date();
      let startDate;
      
      if (date === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (date === 'yesterday') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      } else if (date === 'week') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      } else if (date === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      }
      
      if (startDate) {
        query += ' WHERE timestamp >= ?';
        params.push(startDate.toISOString());
      }
    }
    
    if (req.query.status && req.query.status !== 'all') {
      if (params.length > 0) {
        query += ' AND status = ?';
      } else {
        query += ' WHERE status = ?';
      }
      params.push(req.query.status);
    }
    
    // Add limit if provided
    if (req.query.limit) {
      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(parseInt(req.query.limit));
    } else {
      query += ' ORDER BY timestamp DESC';
    }
    
    db.all(query, params, (err, events) => {
      if (err) {
        console.error('Error fetching events:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      res.json(events);
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get stats
app.get('/api/stats', authenticateToken, (req, res) => {
  try {
    // Get total events
    db.get('SELECT COUNT(*) as count FROM events', [], (err, totalEvents) => {
      if (err) {
        console.error('Error counting events:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      
      // Get today's events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      db.get(
        'SELECT COUNT(*) as count FROM events WHERE timestamp >= ?',
        [today.toISOString()],
        (err, todayEvents) => {
          if (err) {
            console.error('Error counting today\'s events:', err.message);
            return res.status(500).json({ message: 'Server error' });
          }
          
          // Calculate average duration (mock data for now)
          const averageDuration = '5.8s';
          
          // Calculate peak time (mock data for now)
          const peakTime = '14:30';
          
          res.json({
            totalEvents: totalEvents.count,
            todayEvents: todayEvents.count,
            averageDuration,
            peakTime
          });
        }
      );
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system status
app.get('/api/system/status', authenticateToken, (req, res) => {
  try {
    // Mock system status data
    const status = {
      camera: 'online',
      detection: 'online',
      database: 'online',
      lastUpdated: new Date().toLocaleTimeString()
    };
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get audit logs
app.get('/api/audit', authenticateToken, (req, res) => {
  try {
    db.all('SELECT * FROM audit_logs ORDER BY timestamp DESC', [], (err, logs) => {
      if (err) {
        console.error('Error fetching audit logs:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }
      res.json(logs);
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save settings
app.post('/api/settings', authenticateToken, (req, res) => {
  try {
    const { notifications, detection, system } = req.body;
    
    // Save settings to database (simplified for demo)
    // In a real app, you would save each setting individually
    
    // Log the settings update
    logAuditEvent(
      req.user.username,
      'settings_update',
      'Updated system settings',
      req.ip
    );
    
    res.json({ message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event (endpoint for Python detection system)
app.post('/api/events', upload.single('face_image'), (req, res) => {
  try {
    const { detection_duration, status } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Face image is required' });
    }
    
    const id = generateId();
    const timestamp = new Date().toISOString();
    const face_image_path = `/uploads/${req.file.filename}`;
    
    db.run(
      'INSERT INTO events (id, timestamp, detection_duration, face_image_path, status) VALUES (?, ?, ?, ?, ?)',
      [id, timestamp, detection_duration, face_image_path, status],
      function(err) {
        if (err) {
          console.error('Error creating event:', err.message);
          return res.status(500).json({ message: 'Server error' });
        }
        
        const newEvent = {
          id,
          timestamp,
          detection_duration,
          face_image_path,
          status
        };
        
        // Emit the new event to all connected clients
        io.emit('newEvent', newEvent);
        
        res.status(201).json(newEvent);
      }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});