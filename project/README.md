# Theatre Security Management Dashboard

A full-stack web application for monitoring and managing theatre security, featuring real-time phone detection with seat mapping, face detection, and automated alerts.

## Features

### 1. Phone Detection System
- **YOLO-based Detection**: Uses YOLO model (`best.pt`) for accurate phone detection
- **Continuous Monitoring**: Real-time video feed analysis
- **Detection Threshold**: 5-second continuous detection before triggering alerts
- **Grid-based Seat Mapping**: Maps detections to specific theatre seats

### 2. Advanced Face Detection
- **MTCNN Integration**: Deep learning-based face detection and alignment
- **High Accuracy**: Better performance in varying lighting conditions
- **Face Image Capture**: Automatically saves aligned face images of suspects

### 3. Real-time Dashboard
- **Live Monitoring**: Real-time display of detection events
- **Interactive UI**: Filter and search capabilities
- **Event Details**: View timestamps, durations, and captured images
- **Seat Information**: Display of mapped seat numbers for each detection

### 4. Alert System
- **Email Notifications**: Automated alerts with detection details
- **Seat-specific Alerts**: Includes seat numbers in notifications    
- **Image Attachments**: Captured face images included in alerts
- **Audit Trail**: Complete logging of all detection events

## Prerequisites

### Hardware Requirements
- Webcam or IP camera for surveillance
- Computer with sufficient processing power for real-time detection

### Software Requirements
1. Node.js (v14+)
2. Python 3.8+
3. SQLite3

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd theatre-security-dashboard
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Install Python dependencies:
   ```bash
   pip install opencv-python mtcnn ultralytics python-dotenv requests numpy
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update email configuration:
     ```
     EMAIL_SENDER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-specific-password
     EMAIL_RECIPIENT=security@theatre.com
     SMTP_SERVER=smtp.gmail.com
     SMTP_PORT=587
     ```
   
   Note: For Gmail, use an App-Specific Password instead of your account password.

5. Configure seat mapping:
   - Edit `grid_config.json` to match your theatre layout
   - Each seat entry should follow the format:
     ```json
     "seat_ID": [[x1, y1], [x2, y2]]
     ```
   - Coordinates represent the top-left and bottom-right corners of each seat area

## Running the System

### 1. Start the Backend Server
```bash
npm run server
```
This starts:
- Express.js server (Port 3000)
- SQLite database connection
- WebSocket server for real-time updates

### 2. Start the Frontend Development Server
```bash
npm run dev
```
Access the dashboard at `http://localhost:5173`

### 3. Launch the Detection System
```bash
python server/python_integration.py
```
This initiates:
- Camera feed processing
- Phone detection
- Face detection
- Grid mapping
- Alert system

## System Components

### Grid Mapping System
- Visual grid overlay on camera feed
- Real-time coordinate mapping to seat numbers
- Configurable grid layout via `grid_config.json`
- Support for multiple seating arrangements

### Face Detection System
- MTCNN-based face detection
- Facial landmark detection
- Face alignment and cropping
- High-quality face image capture

### Email Alert System
- SMTP integration
- HTML email support
- Automated image attachments
- Customizable alert templates

### Database Schema
- Events table: Stores detection events with seat numbers
- Users table: Admin authentication
- Audit logs: System activity tracking
- Settings: System configuration

## Usage Guide

### Admin Login
- Default credentials:
  - Username: `admin`
  - Password: `admin123`
- Change password after first login

### Dashboard Navigation
1. **Main Dashboard**
   - Real-time detection feed
   - Summary statistics
   - System status indicators

2. **Event Logs**
   - Filterable event history
   - Seat-specific searches
   - Image previews

3. **Settings**
   - Email configuration
   - Detection parameters
   - Grid mapping setup

### Alert Management
1. **Email Alerts**
   - Instant notifications
   - Seat number identification
   - Face image attachments
   - Timestamp information

2. **System Alerts**
   - Camera status
   - Detection system health
   - Database connectivity

## Troubleshooting

### Camera Issues
- Verify camera connection
- Check camera index in Python script
- Ensure proper lighting conditions

### Grid Mapping
- Calibrate grid coordinates
- Update `grid_config.json` if seats are misaligned
- Check camera positioning

### Email Alerts
- Verify SMTP settings
- Check email credentials
- Ensure proper network connectivity
- Monitor spam folder for alerts

### Detection System
- Confirm YOLO model file presence
- Adjust detection confidence threshold
- Verify Python dependencies

## Security Considerations

1. **Authentication**
   - Use strong passwords
   - Regular credential rotation
   - Session management

2. **Data Protection**
   - Secure image storage
   - Event log encryption
   - Access control implementation

3. **Network Security**
   - HTTPS implementation
   - WebSocket security
   - API authentication

## License

This project is licensed under the MIT License.

## Support

For technical support or feature requests, please open an issue in the repository.