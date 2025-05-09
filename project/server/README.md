# Theatre Security Management Server

This directory contains the server-side code for the Theatre Security Management Dashboard.

## Server Components

1. **Express.js Backend**: Handles API requests, authentication, and database operations
2. **SQLite Database**: Stores events, users, audit logs, and settings
3. **Socket.IO**: Provides real-time updates to the dashboard
4. **Python Integration**: Example scripts for integrating with YOLO-based phone detection

## Getting Started

### Starting the Server

```bash
npm run server  
```

This will start the Express.js server on port 3000.

### API Endpoints

- `POST /api/auth/login`: Authenticate users
- `GET /api/events`: Retrieve detection events
- `POST /api/events`: Create a new detection event
- `GET /api/stats`: Get dashboard statistics
- `GET /api/system/status`: Check system status
- `GET /api/audit`: Retrieve audit logs
- `POST /api/settings`: Update system settings

## Python Integration

The `python_integration.py` script demonstrates how to integrate the YOLO model with the Express.js backend. It:

1. Captures video from a webcam
2. Uses the YOLO model to detect phones
3. Captures suspect images after 5 seconds of continuous detection
4. Sends detection events to the dashboard via the REST API

### Running the Python Script

```bash
python server/python_integration.py
```

Note: You'll need to install the required Python packages:
```bash
pip install opencv-python requests ultralytics
```

## Database Schema

The SQLite database includes the following tables:

- `users`: Stores user credentials and roles
- `events`: Stores detection events with timestamps and image paths
- `audit_logs`: Tracks system and user activities
- `settings`: Stores user preferences and system settings

## Default Login

- Username: `admin`
- Password: `admin123`