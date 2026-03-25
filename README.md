# Parktronik
> IoT система за мониторинг на паркинг места в реално време, базирана на ESP32 и Spring Boot backend.

---

## 📑 Table of Contents
- [Project Introduction](#-introduction)
- [Project Features](#-features)
- [API Documentation](#-api-documentation)
- [Hardware Schematics](#-schematic)
- [Tech Stack](#-tech-stack)
- [Installation Guide](#-installation-guide)
- [Usage](#-usage)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## 🧠 Introduction

**The problem:**
- Urban parking lots lack real-time occupancy data, causing drivers to waste time searching for free spots.
- Existing solutions are expensive and require complex infrastructure.
- Parking lot operators have no digital tool to monitor or manage their facilities remotely.

**Our solution:**

Parktronik is a full-stack IoT system that monitors parking spot occupancy using ESP32 microcontrollers equipped with ultrasonic sensors (HC-SR04). Each sensor node detects whether a spot is occupied and transmits its status to a Spring Boot REST API over Wi-Fi. The backend stores the data in a relational database and exposes it through a REST API, which a web/mobile frontend consumes to display a live parking map.

**High-level architecture:**
```
[HC-SR04 Sensor] → [ESP32] --WiFi--> [Spring Boot API] → [Database]
                                              ↑
                                      [Frontend / Dashboard]
```

---

## ✨ Features

### Core Features
- 🔐 User authentication (JWT-based)
- 📡 REST API communication between ESP32 and backend
- 🚗 Real-time parking spot occupancy detection via ultrasonic sensors
- 📊 Data visualization dashboard (live map of free/occupied spots)
- 🏗️ Device (sensor node) management — register, update, delete nodes

### Extra Features
- ⚠️ Global error handling with meaningful HTTP status codes
- 📝 Request/response logging
- 🔒 Secure communication (HTTPS / token-based auth)
- 📈 Scalability — supports multiple parking lots and sensor arrays

---

## 📡 API Documentation

Base URL: `http://localhost:8080/api`

### 🔑 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Registers a new user. Returns a JWT token. |
| `POST` | `/auth/login` | Authenticates a user. Returns a JWT access token. |
| `POST` | `/auth/logout` | Invalidates the current session token. |

---

### 🅿️ Parking Lots

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/parking-lots` | Returns a list of all registered parking lots. |
| `GET` | `/parking-lots/{id}` | Returns details for a specific parking lot by ID. |
| `POST` | `/parking-lots` | Creates a new parking lot entry. Returns the created object. |
| `PUT` | `/parking-lots/{id}` | Updates the details of an existing parking lot. |
| `DELETE` | `/parking-lots/{id}` | Deletes a parking lot and all its associated spots. |

---

### 🔲 Parking Spots

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/parking-lots/{lotId}/spots` | Returns all parking spots in a given lot with their current occupancy status. |
| `GET` | `/parking-lots/{lotId}/spots/free` | Returns only the currently free spots in a lot. |
| `GET` | `/spots/{id}` | Returns details and current status of a single spot. |
| `POST` | `/parking-lots/{lotId}/spots` | Adds a new parking spot to a lot. |
| `DELETE` | `/spots/{id}` | Removes a parking spot from the system. |

---

### 📶 Sensor Nodes (ESP32 Devices)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/devices` | Returns all registered ESP32 sensor nodes. |
| `GET` | `/devices/{id}` | Returns details for a specific device (MAC address, assigned spot, last seen). |
| `POST` | `/devices/register` | Registers a new ESP32 device. Called on first boot by the device. Returns device ID. |
| `PUT` | `/devices/{id}` | Updates device metadata (e.g., assigned spot, firmware version). |
| `DELETE` | `/devices/{id}` | Removes a device from the system. |

---

### 📤 Sensor Data (Incoming from ESP32)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sensor-data` | Receives a sensor reading from an ESP32 node. Updates the occupancy status of the associated spot. Returns `200 OK` on success. |
| `GET` | `/sensor-data/{spotId}` | Returns the last N sensor readings for a specific spot (for history/debugging). |

---

### 📊 Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stats/lots/{lotId}` | Returns occupancy statistics for a parking lot (total spots, free, occupied, % full). |
| `GET` | `/stats/history/{spotId}` | Returns hourly/daily occupancy history for a specific spot. |

---

## 🔌 Schematic

> Wiring diagram for a single ESP32 sensor node:
```
HC-SR04         ESP32
-------         -----
VCC     →       3.3V / 5V
GND     →       GND
TRIG    →       GPIO 5
ECHO    →       GPIO 18
```

> Each ESP32 node handles one or more HC-SR04 sensors, one per parking spot.  
> Multiple nodes communicate with the backend over the same Wi-Fi network.

*(Full schematic diagram — see `/docs/schematic.pdf`)*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Firmware** | C++ (Arduino framework), ESP32, HC-SR04 |
| **Communication** | HTTP over Wi-Fi (ESP32 WiFi + HTTPClient library) |
| **Backend** | Java 17, Spring Boot 3, Spring Security, Spring Data JPA |
| **Database** | MySQL / PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens) |
| **Frontend** | React / React Native (Expo) |
| **Build tools** | Maven, PlatformIO |

---

## ⚙️ Installation Guide

### Prerequisites
- Java 25+
- Maven 3.8+
- PostgreSQL
- PlatformIO
- Node.js 24+ 

### 1. Clone the repository
```bash
git clone https://github.com/your-username/parktronik.git
cd parktronik
```

### 2. Backend setup
```bash
cd backend
```
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/parktronik
spring.datasource.username=your_user
spring.datasource.password=your_password
jwt.secret=your_jwt_secret
```
Run the backend:
```bash
mvn spring-boot:run
```

### 3. ESP32 firmware setup
- Open the `/firmware` folder in PlatformIO or Arduino IDE.
- Edit `config.h` with your Wi-Fi credentials and backend IP:
```cpp
#define WIFI_SSID     "your_network"
#define WIFI_PASSWORD "your_password"
#define SERVER_URL    "http://192.168.1.x:8080/api/sensor-data"
#define DEVICE_ID     "ESP32-NODE-01"
```
- Flash to the ESP32.

### 4. Frontend setup
```bash
cd frontend
npm install
npm start
```

---

## 🚀 Usage

1. Power on the ESP32 sensor node — it auto-registers with the backend on first boot.
2. The device begins sending sensor readings every few seconds.
3. Open the frontend dashboard to see the live status of all parking spots.
4. Use the admin panel to manage parking lots, spots, and devices.

---

## 🔮 Future Improvements

- [ ] MQTT support for lower latency sensor communication
- [ ] Mobile push notifications when a spot becomes free
- [ ] License plate recognition via camera module (ESP32-CAM)
- [ ] Admin analytics dashboard with weekly/monthly occupancy trends
- [ ] Support for LoRaWAN for long-range, low-power deployments
- [ ] Containerization with Docker + Docker Compose

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
