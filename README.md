# Theater-Piracy-Detection-System
The Theater Piracy Detection and Prevention System is a real-time, AI-driven surveillance solution designed to combat illegal video recording inside cinema theaters. Leveraging the cutting-edge object detection capabilities of YOLOv10s, the system accurately identifies suspicious devices such as mobile phones or handheld cameras during movie screenings. Complementing this, the system integrates MTCNN (Multi-task Cascaded Convolutional Neural Network) for facial detection, enabling the identification and tracking of individuals attempting to record content. When a threat is detected, the system automatically captures both video snippets and image evidence, which are logged in a local database along with timestamps and confidence scores. Simultaneously, an email alert is dispatched to theater administrators containing essential details like incident time, detection type, and media attachments.

To further streamline theater security, the system includes an interface for real-time monitoring by security guards, allowing them to review flagged incidents and respond swiftly. IoT components such as IR sensors and microcontrollers (e.g., ESP8266) are optionally integrated for motion detection and environmental sensing. A lightweight web dashboard presents a centralized view of ongoing detections and incident history. The data handling pipeline ensures all captured media is stored systematically for later analysis, while machine learning models may be incorporated to distinguish between normal behavior and piracy-prone actions based on user posture, light anomalies, and activity duration.

Overall, this system combines advanced AI, real-time video analytics, automated communication, and human-in-the-loop supervision to create a robust defense against piracy in theaters, reducing financial losses for content creators and distributors.


# 🎥 Theater Piracy Detection and Prevention System

A smart surveillance system that detects and prevents piracy in cinema theaters using **YOLOv10s**, **MTCNN**, and an integrated IoT setup. It captures and reports unauthorized video recording attempts, sends email alerts, logs events, and enables security teams to take timely action.

---

## 🚀 Project Overview

The system uses real-time camera feeds, advanced computer vision models, and machine learning techniques to detect:
- Unauthorized use of mobile phones or cameras in theaters
- Presence of hidden or low-light recording devices
- Human faces linked to known piracy suspects

Once detected, the system:
- Captures video evidence
- Sends **email alerts** with video snapshots
- Logs incidents in the local database
- Optionally activates security lights or sirens
- Notifies on-site security personnel for immediate action

---

## 🔍 Features

- 🎯 **Real-Time Detection** using **YOLOv10s**
- 👤 **Face Detection & Tracking** using **MTCNN**
- 📸 **Capture and Store Piracy Evidence** (images and short videos)
- 📧 **Email Alerts** with incident details
- 🧠 **ML-based Behavior Analysis** (e.g., prolonged phone usage in dark environments)
- 🛡️ **Security Guard Notification Interface**
- 📊 **Data Logging and Analytics**
- 🔌 IoT Integration with sensors (e.g., ESP8266 or IR sensors for motion detection)

---

## 🧠 Technologies Used

| Component            | Technology                          |
|----------------------|--------------------------------------|
| Object Detection     | YOLOv10s (Ultralytics)              |
| Face Detection       | MTCNN (Multi-task Cascaded CNN)     |
| Alerting             | SMTP (Python Email API)             |
| Backend              | Flask / FastAPI                     |
| Hardware Integration | ESP8266 + IR Sensors                |
| Frontend             | HTML, CSS, JS                       |
| Data Handling        | SQLite / Firebase / PostgreSQL      |
| Deployment           | Raspberry Pi / Jetson Nano (Edge AI)|

---

## 📁 Project Structure

Theater-Piracy-Detection/
│
├── app/
│ ├── main.py # Main detection and alert script
│ ├── detector.py # YOLOv10s detection logic
│ ├── face_tracking.py # MTCNN for face detection
│ ├── alert_system.py # Email and logging
│ └── utils/
│ ├── logger.py
│ └── config.py
│
├── static/
│ ├── captured_images/
│ └── pirated_clips/
│
├── templates/
│ └── index.html # Web dashboard for security
│
├── sensors/
│ └── esp8266_code.ino # Sensor interfacing code
│
├── database/
│ └── piracy_logs.db
│
├── flowchart/
│ └── system_architecture.png
│
├── README.md
└── requirements.txt


---

## 🧪 Data Handling

All video and image data captured during piracy attempts are:
- Saved in `static/captured_images/` and `static/pirated_clips/`
- Logged in a local database along with timestamps and confidence scores
- Optionally pushed to cloud storage or remote servers

---

## 📧 Email Alerting System

- Email sent to theater admins upon piracy detection
- Includes:
  - Snapshot of scene
  - Detected object label (e.g., “camera”)
  - Location (if available)
  - Time of incident

Sample email message:

> **Subject:** 🎥 Piracy Attempt Detected!  
> **Body:** A suspicious object was detected in Row 5 at 07:33 PM. Please find the snapshot and video attached.

---

## 🛡️ Security Guard Interface

A lightweight **web dashboard** (`/templates/index.html`) allows:
- Real-time viewing of flagged activity
- Review of recent incidents
- Manual logging of suspicious behavior
- Trigger sirens or lights

---

## 🤖 Machine Learning Logic

- A behavior model (optional) can classify “normal” vs. “piracy-prone” activities.
- Trained on:
  - User pose
  - Light reflection patterns
  - Time duration of object usage
- Enhances false positive reduction

---

## 🧰 Installation

```bash
# Clone the repo
git clone https://github.com/your-username/Theater-Piracy-Detection.git
cd Theater-Piracy-Detection

# Install dependencies
pip install -r requirements.txt

# Run the system
python app/main.py
