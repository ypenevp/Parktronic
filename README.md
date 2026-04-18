# Parktronik
> Car system improving safety parking

---

## Table of Contents
- [Introduction](#-introduction)
- [Features](#-features)
- [Hardware Schematics](#-schematic)
- [Tech Stack](#-tech-stack)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

## Introduction
 
**Parktronik** is an embedded system mounted on a car body that measures the distance to nearby walls or objects using an ultrasonic sensor. It provides real-time feedback through visual (LEDs + OLED display) and audio (buzzer) indicators, and allows the car to be driven manually via an analog joystick or remotely via Bluetooth.
 
The system features a small OLED display with two pages — a **Home** page showing live distance and status, and a **Settings** page where the user can configure the indication mode. Navigation between options is done using two physical buttons: **NEXT** and **OK**.

---

## Features
 
- **Ultrasonic distance sensing** — HC-SR04 measures distance to the nearest obstacle in real time
- **4-zone proximity indication:**
  - `> 16 cm` — Clear (no indication)
  - `11–16 cm` — Approach (green LED, slow beep)
  - `5.5–11 cm` — Warning (yellow LED, medium beep)
  - `< 5.5 cm` — Stop (red LED, fast/continuous beep)
- **OLED Display (128×64):**
  - **Home page** — shows live distance, status text, and a fill bar
  - **Settings page** — 4 configurable indication modes
- **Settings modes (selectable via display):**
  - Light & Sound (both LEDs and buzzer)
  - Light Only
  - Sound Only
  - None(Only on display)
- **2-button navigation:**
  - `NEXT` — cycles through options on the current page
  - `OK` — activates the highlighted option or navigates between pages
- **Joystick control** — control the car with analog joystick
 
---


## Schematic


![Modules architecture](docx/circuit_image1.png)
![Modules architecture](docx/image.png)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Firmware** | C++ (Arduino framework), ESP32 S3 |
| **Sensors** | HC-SR04 |
| **Display** | SSD1306 OLED display |
| **Motors** | TT DC motors, L298N driver |
| **Frontend** | React Native (Expo) |
| **Build tools** | PlatformIO |

---

## Future Improvements
 
- **Bluetooth Low Energy (BLE)** — remote control via commands (`F`, `B`, `L`, `R`, `S`)
- **Automatic stop** — blocks forward movement when obstacle is closer than 2.4 cm
- Add a camera module (e.g. ESP32-CAM) for live video feed via Bluethooth
 
---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
