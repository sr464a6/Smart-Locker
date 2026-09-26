# 📦 Campus Smart Locker for Online Deliveries

An **IoT-based smart locker system** designed for university campuses to provide a secure, convenient, and space-efficient drop-off and pick-up point for online food and package deliveries such as **Gojek, Grab, and other delivery services**.

The system uses **dynamic locker allocation**, **temporary PINs**, **IoT sensors**, and **real-time communication** to ensure that lockers are only occupied when needed while keeping delivered items secure.

---

## 🎯 Project Purpose

### 1. Space Efficiency

The system uses a **Dynamic Allocation System (Locker Pooling)**.

Lockers are not permanently assigned to students. Instead, an available locker is temporarily allocated when a delivery arrives. Once the student retrieves the item, the locker becomes available for the next user.

### 2. Enhanced Security

The system uses an **Auto-Reset PIN Mechanism**.

A temporary Drop-off PIN is generated for the delivery driver. Once the driver opens the locker, places the item inside, and closes the door, the PIN is automatically invalidated.

This prevents the same Drop-off PIN from being reused by unauthorized individuals.

### 3. Convenience

Students do not need to immediately meet delivery drivers at the campus gate.

Drivers can securely place the package inside the assigned locker, while students can retrieve it later using their personal Pick-up PIN.

This can also help reduce congestion at campus entrances and security posts.

---

# 🏗️ System Architecture

The Campus Smart Locker consists of three major components:

```text
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
