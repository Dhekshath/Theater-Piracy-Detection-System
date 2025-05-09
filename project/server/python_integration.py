"""
Advanced Python integration script for Theatre Security Management Dashboard.
Includes grid mapping, MTCNN face detection, and email notifications.

Requirements:
- OpenCV
- MTCNN
- NumPy
- Ultralytics (for YOLO)
- python-dotenv
"""

import cv2
import time
import json
import numpy as np
import threading
import requests
import smtplib
import os
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from mtcnn import MTCNN
from ultralytics import YOLO
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize models
yolo_model = YOLO("best.pt")
face_detector = MTCNN()

# Load grid configuration
def load_grid_config():
    try:
        with open('grid_config.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Grid configuration file not found. Using default configuration.")
        return {
            "seat_A1": [[100, 200], [200, 300]],
            "seat_A2": [[210, 200], [310, 300]]
        }

GRID_CONFIG = load_grid_config()

# Email configuration
EMAIL_SENDER = os.getenv('EMAIL_SENDER')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')
EMAIL_RECIPIENT = os.getenv('EMAIL_RECIPIENT')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))

def send_email_alert(seat_number, face_image_path, timestamp):
    """
    Send email alert with detection details
    """
    try:
        msg = MIMEMultipart()
        msg['Subject'] = f'Phone Detection Alert - Seat {seat_number}'
        msg['From'] = EMAIL_SENDER
        msg['To'] = EMAIL_RECIPIENT

        # Add text content
        text = f"""
        Phone Detection Alert

        Seat Number: {seat_number}
        Timestamp: {timestamp}
        Duration: 5+ seconds

        Please take appropriate action.
        """
        msg.attach(MIMEText(text, 'plain'))

        # Attach face image if available
        if os.path.exists(face_image_path):
            with open(face_image_path, 'rb') as f:
                img = MIMEImage(f.read())
                img.add_header('Content-Disposition', 'attachment', filename=os.path.basename(face_image_path))
                msg.attach(img)

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)

        print(f"Alert email sent for seat {seat_number}")
    except Exception as e:
        print(f"Error sending email alert: {e}")

def get_seat_number(x, y):
    """
    Map coordinates to seat number using grid configuration
    """
    for seat, [[x1, y1], [x2, y2]] in GRID_CONFIG.items():
        if x1 <= x <= x2 and y1 <= y <= y2:
            return seat
    return "Unknown"

def detect_phone(frame):
    """
    Detect phones using YOLO model
    Returns: (bool, float, tuple) - (detected, confidence, center_coordinates)
    """
    results = yolo_model(frame)
    
    for result in results:
        for box in result.boxes:
            if box.conf[0] > 0.5:  # Confidence threshold
                # Get bounding box coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                # Calculate center point
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2
                return True, box.conf[0].item(), (center_x, center_y)
    
    return False, 0.0, None

def detect_and_align_face(frame):
    """
    Detect and align faces using MTCNN
    Returns: (face_image, face_coordinates)
    """
    results = face_detector.detect_faces(frame)
    if results:
        # Get the face with highest confidence
        face = max(results, key=lambda x: x['confidence'])
        x, y, w, h = face['box']
        
        # Get facial landmarks
        landmarks = face['keypoints']
        
        # Extract and align face
        face_img = frame[y:y+h, x:x+w]
        return face_img, (x, y, w, h)
    
    return None, None

def draw_grid_overlay(frame):
    """
    Draw grid overlay on frame
    """
    for seat, [[x1, y1], [x2, y2]] in GRID_CONFIG.items():
        # Draw grid cell
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 1)
        # Draw seat label
        cv2.putText(frame, seat, (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
    
    return frame

def log_detection_event(seat_number, face_image_path, duration):
    """
    Send detection event to server
    """
    try:
        url = "http://localhost:3000/api/events"
        files = {
            'face_image': ('face.jpg', open(face_image_path, 'rb'), 'image/jpeg')
        }
        data = {
            'detection_duration': duration,
            'status': 'alerted',
            'seat_number': seat_number
        }
        
        response = requests.post(url, files=files, data=data)
        if response.status_code == 201:
            print(f"Detection event logged successfully for seat {seat_number}")
        else:
            print(f"Failed to log detection event: {response.text}")
    except Exception as e:
        print(f"Error logging detection event: {e}")

def main():
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return
    
    print("Camera initialized. Starting detection...")
    
    detection_states = {}  # Track detection state for each seat
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Error: Failed to capture frame.")
                break
            
            # Draw grid overlay
            frame_with_grid = draw_grid_overlay(frame.copy())
            
            # Detect phone
            phone_detected, confidence, center = detect_phone(frame)
            
            if phone_detected and center:
                # Get seat number from coordinates
                seat_number = get_seat_number(*center)
                
                # Initialize or update detection state for this seat
                if seat_number not in detection_states:
                    detection_states[seat_number] = {
                        'start_time': time.time(),
                        'alerted': False
                    }
                
                # Calculate detection duration
                elapsed = time.time() - detection_states[seat_number]['start_time']
                
                # Draw detection info on frame
                cv2.putText(frame_with_grid, 
                          f"Phone detected in seat {seat_number}", 
                          (10, 30), 
                          cv2.FONT_HERSHEY_SIMPLEX, 
                          0.8, 
                          (0, 0, 255), 
                          2)
                
                # Check if detection threshold is reached
                if elapsed >= 5 and not detection_states[seat_number]['alerted']:
                    # Detect and save face
                    face_img, face_coords = detect_and_align_face(frame)
                    
                    if face_img is not None:
                        # Save face image
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        face_image_path = f"face_{seat_number}_{timestamp}.jpg"
                        cv2.imwrite(face_image_path, face_img)
                        
                        # Send email alert
                        threading.Thread(
                            target=send_email_alert,
                            args=(seat_number, face_image_path, timestamp)
                        ).start()
                        
                        # Log detection event
                        threading.Thread(
                            target=log_detection_event,
                            args=(seat_number, face_image_path, f"{elapsed:.1f} seconds")
                        ).start()
                        
                        # Mark as alerted
                        detection_states[seat_number]['alerted'] = True
                        
                        print(f"Alert triggered for seat {seat_number}")
            else:
                # Reset detection state for seats with no current detection
                detection_states = {
                    seat: state 
                    for seat, state in detection_states.items() 
                    if time.time() - state['start_time'] < 5
                }
            
            # Display frame
            cv2.imshow("Theatre Security - Phone Detection", frame_with_grid)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("Detection stopped.")

if __name__ == "__main__":
    main()