📦 Campus Smart Locker for Online Deliveries

An IoT-based smart locker system designed for university campuses to provide a secure, convenient, and space-efficient drop-off and pick-up point for online food and package deliveries such as Gojek, Grab, and other delivery services.

The system uses dynamic locker allocation, temporary PINs, IoT sensors, and real-time communication to ensure that lockers are only occupied when needed while keeping delivered items secure.

🎯 Project Purpose
1. Space Efficiency

The system uses a Dynamic Allocation System (Locker Pooling).

Lockers are not permanently assigned to students. Instead, an available locker is temporarily allocated when a delivery arrives. Once the student retrieves the item, the locker becomes available for the next user.

2. Enhanced Security

The system uses an Auto-Reset PIN Mechanism.

A temporary Drop-off PIN is generated for the delivery driver. Once the driver opens the locker, places the item inside, and closes the door, the PIN is automatically invalidated.

This prevents the same Drop-off PIN from being reused by unauthorized individuals.

3. Convenience

Students do not need to immediately meet delivery drivers at the campus gate.

Drivers can securely place the package inside the assigned locker, while students can retrieve it later using their personal Pick-up PIN.

This can also help reduce congestion at campus entrances and security posts.

🏗️ System Architecture

The Campus Smart Locker consists of three major components:

┌─────────────────────┐
│     React.js App    │
│   Student / Admin   │
└──────────┬──────────┘
           │
           │ REST API
           ▼
┌─────────────────────┐
│   Node.js + Express │
│    Backend Server    │
└──────────┬──────────┘
           │
      ┌────┴─────┐
      │          │
      ▼          ▼
┌──────────┐  ┌──────────────┐
│ MongoDB  │  │ MQTT Broker  │
└──────────┘  └──────┬───────┘
                     │
                     │ MQTT
                     ▼
              ┌─────────────┐
              │    ESP32    │
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      Keypad     Door Sensor   Relay
                                 │
                                 ▼
                           Solenoid Lock
🛠️ Hardware

Each smart locker unit is equipped with the following components:

Component	Description
ESP32	Main microcontroller with built-in Wi-Fi connectivity
12V Solenoid Door Lock	Electronic lock used to secure the locker door
Relay Module	Controls the 12V solenoid using the ESP32
4x4 / 4x3 Keypad	Allows users and delivery drivers to enter PINs
Limit Switch / Magnetic Door Sensor	Detects whether the locker door is open or closed
12V Power Supply	Provides power for the solenoid lock
Power Converter	Converts the required voltage for ESP32 and other low-voltage components
Hardware Flow
User enters PIN
      │
      ▼
    ESP32
      │
      ▼
 Relay Module
      │
      ▼
12V Solenoid Lock
      │
      ▼
 Locker Door Opens
      │
      ▼
Door Sensor Detects Closure
      │
      ▼
ESP32 Sends Locker Status
💻 Software Technologies
Frontend
React.js

The frontend provides the user interface for students and administrators.

Main responsibilities:

Locker booking
PIN management
Locker status monitoring
Delivery status tracking
Pick-up confirmation
Admin dashboard
Real-time status updates
Backend
Node.js + Express.js

The backend handles the application's business logic and API services.

Main responsibilities:

User authentication
Locker allocation
PIN generation and validation
Booking management
Booking expiration
Locker state management
MQTT communication
Activity logging
Admin operations
Database
MongoDB

MongoDB stores application and locker-related data such as:

User accounts
Locker information
Locker status
Booking records
Active PINs
Delivery information
Access logs
Error logs
Alternative: Firebase Realtime Database

Firebase Realtime Database can also be used when extremely fast synchronization between the application and IoT devices is required.

IoT Communication
MQTT

MQTT is used for lightweight communication between the backend/server and ESP32 devices.

Example communication:

Server
   │
   │ MQTT
   ▼
ESP32
   │
   ├── Unlock locker
   ├── Update door status
   ├── Update locker status
   └── Report hardware errors

Example MQTT topics:

locker/{lockerId}/command
locker/{lockerId}/status
locker/{lockerId}/sensor
locker/{lockerId}/response
👨‍🎓 Student / User Features
🔐 Locker Booking

Students can request an available locker through the application.

The system automatically selects an available locker from the locker pool.

EMPTY
  │
  │ Booking
  ▼
BOOKED
🔑 Dual-PIN System

Each delivery uses two different PINs:

Drop-off PIN

Used by the delivery driver to open the locker and place the package inside.

Example:

Drop-off PIN: 1234

The PIN is temporary and becomes invalid after the driver closes the locker door.

Pick-up PIN

Used by the student to retrieve the package.

Example:

Pick-up PIN: 9999

The Pick-up PIN remains active until the student retrieves the package.

🔄 Secondary Drop-off PIN

If the driver forgets an item and needs to make another delivery, the student can generate a new temporary Drop-off PIN.

Example:

Original Drop-off PIN
        1234
          │
          ▼
      Door Closed
          │
          ▼
       Deleted
          
Later...

Secondary Drop-off PIN
        4321
          │
          ▼
      Door Opens
          │
          ▼
      Item Added
          │
          ▼
      Door Closed
          │
          ▼
       Deleted
📡 Real-Time Locker Status

Students can monitor their delivery status through the application.

Possible statuses include:

Empty
Booked
Waiting for Drop-off
Filled
Offline
Maintenance
✅ Pick-up Confirmation

After retrieving their items, students close the locker and confirm the pickup through the application.

The locker is then returned to the available locker pool.

FILLED
  │
  │ Student Pickup
  ▼
EMPTY
🔐 Admin Features

The system provides a dedicated dashboard for campus security or administrators.

📊 Master Locker Monitoring

Administrators can monitor all lockers in real time.

Example:

Locker 01  → EMPTY
Locker 02  → BOOKED
Locker 03  → FILLED
Locker 04  → OFFLINE
Locker 05  → MAINTENANCE
🚨 Emergency Override

Administrators can remotely open a locker when necessary.

Possible use cases:

Hardware failure
Forgotten items
System malfunction
Emergency maintenance
Authorized security inspection

The system can also provide a Master PIN for authorized emergency access.

Emergency access should be restricted to authorized administrators and recorded in the system logs.

⏱️ Booking Time Limit

The system prevents lockers from being reserved indefinitely.

For example, if a driver does not arrive within 45 minutes, the booking can automatically expire.

BOOKED
  │
  │ 45 minutes
  │ No Drop-off
  ▼
EXPIRED
  │
  ▼
EMPTY

This prevents ghost bookings from unnecessarily occupying lockers.

💰 Overstay Management

The system can monitor packages that remain inside lockers beyond the allowed pickup period.

Administrators can view:

Package duration
Locker occupancy time
Overdue status
User information
Pickup history

Optional demurrage or storage policies can be implemented based on campus regulations.

📝 Activity Logs

The system records important locker activities, including:

Locker booking
PIN generation
PIN usage
Door opening
Door closing
Package drop-off
Package pickup
Booking expiration
Emergency override
Hardware errors
Offline/online status

Example:

[08:30] Locker #03 booked by Student A
[08:35] Drop-off PIN generated
[08:42] Driver opened Locker #03
[08:43] Door closed
[08:43] Locker #03 → FILLED
[10:15] Student opened Locker #03
[10:17] Student confirmed pickup
[10:17] Locker #03 → EMPTY
🔄 System Workflow
Phase 1 — Delivery Drop-off
Step 1: Driver Arrival

The delivery driver arrives at the campus and contacts the student.

Step 2: Locker Booking

The student opens the application and requests an available locker.

The system dynamically assigns an empty locker.

Available Locker
       │
       ▼
   Locker #03
Step 3: PIN Generation

The system generates:

Drop-off PIN: 1234
Pick-up PIN: 9999

The student sends the locker number and Drop-off PIN to the driver.

Step 4: Driver Opens Locker

The driver enters:

1234

The ESP32 validates the PIN through the backend and unlocks the locker.

Step 5: Package Drop-off

The driver places the package inside the locker and closes the door.

Step 6: Automatic PIN Reset

The door sensor detects that the door has been closed.

The system then:

Invalidates the Drop-off PIN.
Updates the locker status.
Records the drop-off event.
Notifies the student.
Drop-off PIN
    1234
      │
      ▼
 Door Opened
      │
      ▼
 Package Placed
      │
      ▼
 Door Closed
      │
      ▼
 PIN Invalidated
      │
      ▼
 Locker → FILLED
📦 Phase 2 — Forgotten Items

If the driver realizes that an item was forgotten, the student can generate a new temporary Drop-off PIN.

Example:

New Drop-off PIN: 4321

The driver uses the new PIN to access the existing locker.

FILLED
  │
  │ Temporary Drop-off PIN
  ▼
Door Opens
  │
  ▼
Additional Item Added
  │
  ▼
Door Closes
  │
  ▼
PIN Invalidated
  │
  ▼
FILLED

The student's original Pick-up PIN remains valid.

🎒 Phase 3 — Student Pickup
Step 1: Student Arrives

The student arrives at the locker.

Step 2: Student Enters Pick-up PIN

The student enters their Pick-up PIN:

9999
Step 3: Locker Opens

The system validates the PIN and unlocks the locker.

Step 4: Student Retrieves Items

The student takes all items from the locker.

Step 5: Door Closes

The door sensor confirms that the locker has been closed.

Step 6: Pickup Confirmation

The student presses:

DONE / SELESAI

The locker status is then changed to:

FILLED → EMPTY

The locker becomes available for the next user.

🔄 Locker State Machine
             Booking
   ┌────────────────────────┐
   │                        ▼
┌───────┐              ┌─────────┐
│ EMPTY │─────────────▶│ BOOKED  │
└───────┘              └────┬────┘
   ▲                        │
   │                        │ Driver Drop-off
   │                        ▼
   │                   ┌──────────┐
   │                   │  FILLED  │
   │                   └────┬─────┘
   │                        │
   │                        │ Student Pickup
   │                        ▼
   └────────────────────────┘


Additional states:

BOOKED ──45 min timeout──▶ EMPTY

Any State ──Hardware Error──▶ OFFLINE
🔑 PIN Security Model

The system uses different PINs for different access purposes.

PIN	User	Purpose	Lifetime
Drop-off PIN	Driver	Open locker for delivery	Until door is closed
Secondary Drop-off PIN	Driver	Add forgotten items	Until door is closed
Pick-up PIN	Student	Retrieve package	Until pickup is completed
Master PIN	Admin	Emergency access	Controlled by admin
Important Security Rules
Drop-off PINs must be single-use.
PINs should be stored securely.
PINs should have expiration timestamps.
Failed PIN attempts should be logged.
Excessive failed attempts can temporarily lock the keypad.
Emergency access should always be recorded.
MQTT communication should use authentication and encryption in production.
🗄️ Example Data Model
User
{
  "userId": "USR001",
  "name": "Student Name",
  "email": "student@example.com",
  "role": "student"
}
Locker
{
  "lockerId": "LKR003",
  "status": "FILLED",
  "isOnline": true,
  "doorOpen": false
}
Booking
{
  "bookingId": "BKG001",
  "userId": "USR001",
  "lockerId": "LKR003",
  "status": "FILLED",
  "dropOffPin": null,
  "pickupPin": "9999",
  "createdAt": "2026-09-26T08:00:00Z"
}
📁 Suggested Project Structure
campus-smart-locker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── mqtt/
│   │   ├── middleware/
│   │   └── server.js
│   └── package.json
│
├── esp32/
│   ├── src/
│   │   ├── main.cpp
│   │   ├── keypad.cpp
│   │   ├── locker.cpp
│   │   ├── mqtt.cpp
│   │   └── sensor.cpp
│   └── platformio.ini
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── mqtt-topics.md
│
└── README.md
🔌 Example MQTT Communication
Server → ESP32

Unlock a locker:

Topic:
locker/LKR003/command

Payload:
{
  "action": "unlock"
}
ESP32 → Server

Door status update:

Topic:
locker/LKR003/sensor

Payload:
{
  "door": "closed"
}
ESP32 → Server

Locker status:

Topic:
locker/LKR003/status

Payload:
{
  "status": "FILLED",
  "online": true
}
🔒 Security Considerations

Because the system controls physical access to lockers, security should be considered at both the software and hardware levels.

Recommended measures include:

HTTPS for REST APIs
Secure MQTT over TLS
MQTT username/password or certificate authentication
Hashed user passwords
Secure PIN storage
PIN expiration
Rate limiting for PIN attempts
Temporary keypad lockout after repeated failures
Role-based access control
Admin activity logging
Device authentication
ESP32 firmware protection
Server-side PIN validation
Audit logs for emergency access
🚀 Future Improvements

Possible future developments include:

📱 Mobile application
🔔 Push notifications
📷 Camera integration
📦 QR-code-based access
🤖 Automatic package detection
🔋 Backup battery system
🌐 Multi-campus locker management
📊 Usage analytics
🧑‍💼 Integration with campus authentication
🔔 Automatic notifications for overdue packages
🌡️ Temperature monitoring for food deliveries
💳 Automated overstay payment system
🎯 Project Goals

The Campus Smart Locker aims to provide a secure and efficient delivery infrastructure for university environments.

The core goals are:

SECURITY
   +
CONVENIENCE
   +
SPACE EFFICIENCY
   +
REAL-TIME IoT
   +
DYNAMIC LOCKER ALLOCATION
        ↓
CAMPUS SMART LOCKER
📌 Technology Stack
Layer	Technology
Frontend	React.js
Backend	Node.js
API	Express.js
Database	MongoDB
IoT Communication	MQTT
Microcontroller	ESP32
Lock	12V Solenoid
Switching	Relay Module
Input	4x4 / 4x3 Keypad
Door Detection	Limit Switch / Magnetic Sensor
Communication	Wi-Fi
👥 Target Users
Students
Book lockers
Receive delivery notifications
Generate Drop-off PINs
View delivery status
Retrieve packages
Confirm pickup
Delivery Drivers
Access assigned lockers using temporary Drop-off PINs
Deposit packages without entering the campus interior
Campus Administrators
Monitor lockers
Manage locker availability
Handle emergencies
Monitor overdue packages
Review activity logs
Manage system configuration
📄 License

This project is developed as a university/project prototype. Licensing information can be added here depending on the project's distribution requirements.
