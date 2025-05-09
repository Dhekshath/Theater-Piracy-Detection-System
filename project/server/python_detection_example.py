"""
Example Python script for phone detection using YOLO model.
This script demonstrates how to integrate with the Theatre Security Dashboard.

Requirements:
- OpenCV
- Requests
- NumPy
- PyTorch (for YOLO)

Note: This is a simplified example. In a real implementation, you would:
1. Use the actual YOLO model from best.pt
2. Implement proper error handling and reconnection logic
3. Add more sophisticated detection logic
"""

import cv2
import time
import requests
import json
import os
from datetime import datetime

# Mock YOLO detection function (in real implementation, use the actual model)
def detect_phone(frame):
    """
    Simulate phone detection using YOLO model.
    In a real implementation, this would use the actual YOLO model.
    
    Returns:
        bool: True if phone detected, False otherwise
        float: Confidence score (0-1)
    """
    # This is a mock function that randomly detects a phone
    # In a real implementation, you would:
    # 1. Preprocess the frame
    # 2. Run it through the YOLO model
    # 3. Process the results to determine if a phone is present
    
    # For demo purposes, let's simulate detection
    import random
    detected = random.random() > 0.7  # 30% chance of detection
    confidence = random.uniform(0.7, 0.95) if detected else 0.0
    
    return detected, confidence

def capture_face(frame):
    """
    Capture and save a face from the frame.
    In a real implementation, this would use a face detection model.
    
    Returns:
        str: Path to the saved face image
    """
    # In a real implementation, you would:
    # 1. Use a face detection model to locate faces
    # 2. Crop the face from the frame
    # 3. Save it to a file
    
    # For demo purposes, just save the current frame
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"face_{timestamp}.jpg"
    cv2.imwrite(filename, frame)
    
    return filename

def log_detection_event(duration, face_image_path):
    """
    Send detection event to the server.
    
    Args:
        duration (str): Detection duration (e.g., "5 seconds")
        face_image_path (str): Path to the captured face image
    """
    url = "http://localhost:3000/api/events"
    
    # Prepare form data
    data = {
        "detection_duration": duration,
        "status": "alerted"
    }
    
    # Prepare file
    files = {
        "face_image": (os.path.basename(face_image_path), open(face_image_path, "rb"), "image/jpeg")
    }
    
    try:
        response = requests.post(url, data=data, files=files)
        if response.status_code == 201:
            print(f"Detection event logged successfully: {response.json()}")
        else:
            print(f"Failed to log detection event: {response.text}")
    except Exception as e:
        print(f"Error sending detection event: {e}")
    finally:
        # Close the file
        files["face_image"][1].close()

def main():
    # Initialize camera
    cap = cv2.VideoCapture(0)  # Use default camera (0)
    
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return
    
    print("Camera initialized. Starting detection...")
    
    # Variables for tracking detection
    detection_start_time = None
    detection_duration = 0
    continuous_detection_threshold = 5  # seconds
    
    try:
        while True:
            # Capture frame
            ret, frame = cap.read()
            
            if not ret:
                print("Error: Failed to capture frame.")
                break
            
            # Detect phone in frame
            phone_detected, confidence = detect_phone(frame)
            
            # Display frame with detection info
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            status_text = f"Phone {'Detected' if phone_detected else 'Not Detected'}"
            cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255) if phone_detected else (0, 255, 0), 2)
            
            if phone_detected:
                cv2.putText(frame, f"Confidence: {confidence:.2f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                
                # Start or continue tracking detection time
                if detection_start_time is None:
                    detection_start_time = time.time()
                
                detection_duration = time.time() - detection_start_time
                cv2.putText(frame, f"Duration: {detection_duration:.1f}s", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                
                # Check if detection threshold is reached
                if detection_duration >= continuous_detection_threshold:
                    # Capture face and log event
                    face_image_path = capture_face(frame)
                    duration_str = f"{detection_duration:.1f} seconds"
                    log_detection_event(duration_str, face_image_path)
                    
                    # Reset detection timer
                    detection_start_time = None
                    
                    # Display alert on console
                    print(f"[ALERT] Phone detected for {duration_str} at {current_time}")
                    
                    # Add alert overlay to frame
                    cv2.putText(frame, "ALERT: Phone Detected!", (frame.shape[1]//2 - 150, frame.shape[0]//2), 
                                cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
            else:
                # Reset detection timer if phone is no longer detected
                detection_start_time = None
            
            # Display timestamp
            cv2.putText(frame, current_time, (10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
            
            # Show frame
            cv2.imshow("Theatre Security - Phone Detection", frame)
            
            # Break loop on 'q' key press
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    finally:
        # Release resources
        cap.release()
        cv2.destroyAllWindows()
        print("Detection stopped.")

if __name__ == "__main__":
    main()