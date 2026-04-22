// #include <Arduino.h>
// #include <Adafruit_NeoPixel.h>
// #include <Wire.h>
// #include <Adafruit_GFX.h>
// #include <Adafruit_SSD1306.h>
// #include <math.h>
// // #include <NimBLEDevice.h>
// #include <BLEDevice.h>
// #include <BLEServer.h>
// #include <BLEUtils.h>

// #define TRIG 12
// #define ECHO 11

// #define BUZZER 5

// #define GREEN_LED 35
// #define YELLOW_LED 36
// #define RED_LED 37

// #define RGB_PIN 38
// #define RGB_COUNT 1

// #define SCREEN_WIDTH 128
// #define SCREEN_HEIGHT 64

// #define BUZZER_CHANNEL 0
// #define BUZZER_RESOLUTION 8
// #define BUZZER_VOLUME 128

// #define NOSOUND 16
// #define GREENSOUND 11
// #define YELLOWSOUND 5.5
// #define REDSOUND 2.4

// #define LEFTMOTORS1 6
// #define LEFTMOTORS2 7
// #define RIGHTMOTORS1 15
// #define RIGHTMOTORS2 16

// #define LEFT_ENABLE 3
// #define RIGHT_ENABLE 10

// #define LEFT_ENABLE_CHANNEL 1
// #define RIGHT_ENABLE_CHANNEL 2
// #define MOTOR_PWM_RESOLUTION 8
// #define MOTOR_PWM_FREQ 1000

// #define JOYSTICKX 18
// #define JOYSTICKY 17

// #define JOY_VCC 3.3
// #define JOY_ADC_MAX 4095
// #define JOY_THRESHOLD 0.15
// #define MIN_SPEED 70

// #define BUTTON_NEXT 14
// #define BUTTON_OK 13

// #define BLE_TIMEOUT 300
// BLEServer *pServer = nullptr;
// bool deviceConnected = false;
// ulong lastBLECommand = 0;
// bool bleControlActive = false;

// const float JOY_MID_X = 1.61;
// const float JOY_MID_Y = 1.56;

// typedef unsigned long ulong;

// Adafruit_NeoPixel rgb(RGB_COUNT, RGB_PIN, NEO_GRB + NEO_KHZ800);
// Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
// bool displayOK = false;

// float distance = 0;
// ulong duration = 0;
// ulong lastSensorRead = 0;
// ulong lastDisplayUpdate = 0;

// bool buzzerState = false;
// ulong lastChangeTime = 0;

// int motorSpeedLeft = 0;
// int motorSpeedRight = 0;

// // ─── Navigation state ────────────────────────────────────────────────────────

// enum Page { PAGE_HOME = 0, PAGE_SETTINGS = 1 };

// Page currentPage = PAGE_HOME;

// // Settings page: which option is currently highlighted (0–3)
// int settingsSelectedIndex = 0;
// int settingsModeActive = 0; // which mode is activated (0 = Light&Sound, etc.)

// // Button debounce
// bool lastNextState = false;
// bool lastOkState = false;
// ulong lastNextPress = 0;
// ulong lastOkPress = 0;
// #define DEBOUNCE_MS 200

// // Animation state for NEXT button highlight blink
// bool animBlink = false;
// ulong lastAnimTime = 0;
// #define ANIM_INTERVAL 300

// // ─────────────────────────────────────────────────────────────────────────────

// void buzzerTone(int frequency)
// {
//   ledcSetup(BUZZER_CHANNEL, frequency, BUZZER_RESOLUTION);
//   ledcAttachPin(BUZZER, BUZZER_CHANNEL);
//   ledcWrite(BUZZER_CHANNEL, BUZZER_VOLUME);
// }

// void buzzerOff()
// {
//   ledcWrite(BUZZER_CHANNEL, 0);
// }

// void soundIndication(float dist)
// {
//   if (dist < 0)
//   {
//     buzzerOff();
//     buzzerState = false;
//     return;
//   }

//   ulong now = millis();
//   int toneFreq;
//   ulong onTime, offTime;

//   if (dist > NOSOUND)
//   {
//     buzzerOff();
//     buzzerState = false;
//     return;
//   }
//   else if (dist > GREENSOUND)
//   {
//     toneFreq = 500;
//     onTime = 200;
//     offTime = 600;
//   }
//   else if (dist > YELLOWSOUND)
//   {
//     toneFreq = 1000;
//     onTime = 150;
//     offTime = 250;
//   }
//   else if (dist > REDSOUND)
//   {
//     toneFreq = 2000;
//     onTime = 100;
//     offTime = 100;
//   }
//   else
//   {
//     buzzerTone(2000);
//     buzzerState = true;
//     lastChangeTime = now;
//     return;
//   }

//   ulong waitTime = buzzerState ? onTime : offTime;
//   if (now - lastChangeTime >= waitTime)
//   {
//     lastChangeTime = now;
//     if (buzzerState)
//     {
//       buzzerOff();
//       buzzerState = false;
//     }
//     else
//     {
//       buzzerTone(toneFreq);
//       buzzerState = true;
//     }
//   }
// }

// void lightIndication(float dist)
// {
//   digitalWrite(GREEN_LED, LOW);
//   digitalWrite(YELLOW_LED, LOW);
//   digitalWrite(RED_LED, LOW);

//   if (dist < 0)
//     return;

//   if (dist > GREENSOUND && dist <= NOSOUND)
//     digitalWrite(GREEN_LED, HIGH);
//   else if (dist > YELLOWSOUND && dist <= GREENSOUND)
//     digitalWrite(YELLOW_LED, HIGH);
//   else if (dist > 0 && dist <= YELLOWSOUND)
//     digitalWrite(RED_LED, HIGH);
// }

// void readHC_SR04()
// {
//   digitalWrite(TRIG, LOW);
//   delayMicroseconds(2);
//   digitalWrite(TRIG, HIGH);
//   delayMicroseconds(10);
//   digitalWrite(TRIG, LOW);

//   duration = pulseIn(ECHO, HIGH, 30000);
//   distance = (duration == 0) ? -1.0f : duration / 58.0f;
// }

// const unsigned char epd_bitmap_autopilot[] PROGMEM = {
//     0x20, 0xf0, 0x40, 0x43, 0x9c, 0x20, 0x56, 0x06, 0xa0, 0x84, 0x02, 0x50, 0xac, 0xf3, 0x50, 0xaf,
//     0xff, 0x50, 0xaf, 0xff, 0x50, 0xac, 0xf3, 0x50, 0xa4, 0x62, 0x50, 0x16, 0x66, 0x80, 0x43, 0xfc,
//     0x20, 0x20, 0xf0, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

// const unsigned char epd_bitmap_settings[] PROGMEM = {
//     0x03, 0x80, 0x17, 0xd0, 0x3f, 0xf8, 0x7f, 0xfc, 0x38, 0x38, 0x70, 0x1c, 0xf0, 0x1e, 0xf0, 0x1e,
//     0xf0, 0x1e, 0x70, 0x1c, 0x38, 0x38, 0x7f, 0xfc, 0x3f, 0xf8, 0x17, 0xd0, 0x03, 0x80};

// const unsigned char epd_bitmap_backtohome[] PROGMEM = {
//     0x01, 0xf8, 0x00, 0x07, 0x0e, 0x00, 0x1c, 0x03, 0x00, 0x30, 0x00, 0x80, 0x20, 0x38, 0x40, 0x60,
//     0x78, 0x60, 0x40, 0xf0, 0x20, 0xc1, 0xe0, 0x20, 0x83, 0xc0, 0x30, 0x87, 0x80, 0x10, 0x87, 0x80,
//     0x10, 0x83, 0xc0, 0x30, 0xc1, 0xe0, 0x20, 0x40, 0xf0, 0x20, 0x60, 0x78, 0x60, 0x20, 0x38, 0x40,
//     0x10, 0x00, 0x80, 0x0c, 0x03, 0x00, 0x07, 0x9e, 0x00, 0x01, 0xf8, 0x00};

// // ─── Draw helpers ─────────────────────────────────────────────────────────────

// // Draws the animated blink box around the currently focused icon/button.
// // Called from showHome() and showSettings() when animBlink is true.
// void drawNextHighlight(int x, int y, int w, int h)
// {
//   // Inverted blinking rectangle to show which button NEXT will cycle to
//   display.drawRect(x - 1, y - 1, w + 2, h + 2, WHITE);
// }

// // ─── Page renderers ───────────────────────────────────────────────────────────

// void showHome()
// {
//   if (!displayOK)
//     return;

//   display.clearDisplay();
//   display.drawRect(0, 0, 128, 64, WHITE);
//   display.setTextColor(WHITE);

//   int colX = 108;

//   // Settings icon – highlight when animBlink is on and we're on HOME page
//   // (NEXT from home cycles to Settings page, so highlight the settings icon)
//   display.drawBitmap(colX + 1, 2, epd_bitmap_settings, 15, 15, WHITE);
//   if (animBlink)
//     drawNextHighlight(colX, 1, 17, 17);

//   display.drawBitmap(colX - 1, 18, epd_bitmap_autopilot, 20, 15, WHITE);
//   display.drawLine(105, 0, 105, 64, WHITE);

//   display.setTextSize(1);
//   display.setCursor(4, 3);
//   display.println("PARKTRONIC 3000");
//   display.drawLine(0, 12, 105, 12, WHITE);

//   display.setTextSize(2);
//   if (duration == 0 || distance < 0)
//   {
//     display.setCursor(10, 18);
//     display.println("SAFE");
//   }
//   else
//   {
//     display.setCursor(5, 18);
//     display.printf("%4.1fcm", distance);
//   }

//   String status;
//   int barWidth;
//   if (distance < 0 || duration == 0 || distance > NOSOUND)
//   {
//     status = "Clear";
//     barWidth = 0;
//   }
//   else if (distance > GREENSOUND)
//   {
//     status = "Approach";
//     barWidth = 35;
//   }
//   else if (distance > YELLOWSOUND)
//   {
//     status = "Warning";
//     barWidth = 65;
//   }
//   else
//   {
//     status = "STOP";
//     barWidth = 100;
//   }

//   display.setTextSize(1);
//   display.setCursor(3, 44);
//   display.println(status);

//   display.drawRect(3, 56, 100, 6, WHITE);
//   display.fillRect(3, 56, barWidth, 6, WHITE);

//   display.display();
// }

// void showSettings()
// {
//   if (!displayOK)
//     return;

//   display.clearDisplay();
//   display.drawRect(0, 0, 128, 64, WHITE);
//   display.setTextColor(WHITE);

//   int colX = 108;

//   // Back-to-home icon – highlight when animBlink is on and we're on SETTINGS page
//   // (NEXT from settings cycles back to Home page)
//   display.drawBitmap(colX - 1, 16, epd_bitmap_backtohome, 20, 20, WHITE);
//   if (animBlink)
//     drawNextHighlight(colX - 2, 15, 22, 22);

//   display.drawLine(105, 0, 105, 64, WHITE);

//   display.setTextSize(1);
//   display.setCursor(4, 3);
//   display.println("SETTINGS");
//   display.drawLine(0, 12, 128, 12, WHITE);

//   const char *modes[] = {"Light&Sound:", "Light Only:", "Sound Only:", "None:"};
//   for (int i = 0; i < 4; i++)
//   {
//     int yRow = 22 + i * 10;

//     // Highlight the currently selected row (OK will activate it)
//     if (i == settingsSelectedIndex)
//     {
//       display.fillRect(2, yRow - 2, 100, 11, WHITE);
//       display.setTextColor(BLACK);
//     }
//     else
//     {
//       display.setTextColor(WHITE);
//     }

//     display.drawCircle(5, yRow + 2, 2, (i == settingsSelectedIndex) ? BLACK : WHITE);
//     // Fill circle for active mode
//     if (i == settingsModeActive)
//       display.fillCircle(5, yRow + 2, 1, (i == settingsSelectedIndex) ? BLACK : WHITE);

//     display.setCursor(10, yRow);
//     display.print(modes[i]);
//     display.setCursor(85, yRow);
//     display.print((i == settingsModeActive) ? "ON " : "OFF");

//     display.setTextColor(WHITE);
//   }

//   display.display();
// }

// // ─── Navigation logic ─────────────────────────────────────────────────────────

// // Called when NEXT button is pressed.
// // On HOME  → switches to SETTINGS page.
// // On SETTINGS → cycles through the 4 options; wraps back to HOME after the last one.
// void handleNextButton()
// {
//   if (currentPage == PAGE_HOME)
//   {
//     currentPage = PAGE_SETTINGS;
//     settingsSelectedIndex = 0;
//   }
//   else // PAGE_SETTINGS
//   {
//     settingsSelectedIndex++;
//     if (settingsSelectedIndex >= 4)
//     {
//       settingsSelectedIndex = 0;
//       currentPage = PAGE_HOME;
//     }
//   }
// }

// // Called when OK button is pressed.
// // On HOME  → activates the settings icon / could trigger autopilot (extend as needed).
// // On SETTINGS → activates the currently highlighted mode.
// void handleOkButton()
// {
//   if (currentPage == PAGE_HOME)
//   {
//     // OK on home: navigate to settings (same as NEXT for convenience)
//     currentPage = PAGE_SETTINGS;
//     settingsSelectedIndex = 0;
//   }
//   else // PAGE_SETTINGS
//   {
//     settingsModeActive = settingsSelectedIndex;
//   }
// }

// // Renders the current page
// void renderCurrentPage()
// {
//   if (currentPage == PAGE_HOME)
//     showHome();
//   else
//     showSettings();
// }

// // Updates the blink animation ticker (call every loop iteration)
// void updateNavAnimation()
// {
//   ulong now = millis();
//   if (now - lastAnimTime >= ANIM_INTERVAL)
//   {
//     lastAnimTime = now;
//     animBlink = !animBlink;
//   }
// }

// // Reads both buttons with debounce and fires the appropriate handlers
// void handleButtons()
// {
//   ulong now = millis();

//   bool nextState = digitalRead(BUTTON_NEXT);
//   bool okState   = digitalRead(BUTTON_OK);

//   // NEXT button – rising edge with debounce
//   if (nextState && !lastNextState && (now - lastNextPress > DEBOUNCE_MS))
//   {
//     lastNextPress = now;
//     handleNextButton();
//   }
//   lastNextState = nextState;

//   // OK button – rising edge with debounce
//   if (okState && !lastOkState && (now - lastOkPress > DEBOUNCE_MS))
//   {
//     lastOkPress = now;
//     handleOkButton();
//   }
//   lastOkState = okState;
// }

// // ─────────────────────────────────────────────────────────────────────────────

// void setLeftSpeed(int speed) { ledcWrite(LEFT_ENABLE_CHANNEL, constrain(speed, 0, 255)); }
// void setRightSpeed(int speed) { ledcWrite(RIGHT_ENABLE_CHANNEL, constrain(speed, 0, 255)); }

// void moveForward()
// {
//   digitalWrite(LEFTMOTORS1, LOW);
//   digitalWrite(LEFTMOTORS2, HIGH);
//   digitalWrite(RIGHTMOTORS1, LOW);
//   digitalWrite(RIGHTMOTORS2, HIGH);
// }

// void moveBackward()
// {
//   digitalWrite(LEFTMOTORS1, HIGH);
//   digitalWrite(LEFTMOTORS2, LOW);
//   digitalWrite(RIGHTMOTORS1, HIGH);
//   digitalWrite(RIGHTMOTORS2, LOW);
// }

// void stopLeftMotors()
// {
//   digitalWrite(LEFTMOTORS1, LOW);
//   digitalWrite(LEFTMOTORS2, LOW);
// }
// void stopRightMotors()
// {
//   digitalWrite(RIGHTMOTORS1, LOW);
//   digitalWrite(RIGHTMOTORS2, LOW);
// }

// void stopMotors()
// {
//   stopLeftMotors();
//   stopRightMotors();
//   setLeftSpeed(0);
//   setRightSpeed(0);
// }

// void driveFromJoystick()
// {
//   float xVolt = (analogRead(JOYSTICKX) * JOY_VCC) / JOY_ADC_MAX;
//   float yVolt = (analogRead(JOYSTICKY) * JOY_VCC) / JOY_ADC_MAX;

//   float xOffset = xVolt - JOY_MID_X;
//   float yOffset = yVolt - JOY_MID_Y;

//   if (yOffset > JOY_THRESHOLD)
//   {
//     moveForward();
//     motorSpeedLeft = map((int)(yOffset * 1000),
//                          (int)(JOY_THRESHOLD * 1000),
//                          (int)(JOY_MID_Y * 1000), 0, 255);
//     motorSpeedRight = motorSpeedLeft;
//   }
//   else if (yOffset < -JOY_THRESHOLD)
//   {
//     moveBackward();
//     motorSpeedLeft = map((int)(-yOffset * 1000),
//                          (int)(JOY_THRESHOLD * 1000),
//                          (int)(JOY_MID_Y * 1000), 0, 255);
//     motorSpeedRight = motorSpeedLeft;
//   }
//   else
//   {
//     motorSpeedLeft = 0;
//     motorSpeedRight = 0;
//   }

//   if (xOffset > JOY_THRESHOLD)
//   {
//     int xMapped = map((int)(xOffset * 1000),
//                       (int)(JOY_THRESHOLD * 1000),
//                       (int)((JOY_VCC - JOY_MID_X) * 1000), 0, 255);
//     motorSpeedLeft = constrain(motorSpeedLeft + xMapped, 0, 255);
//     motorSpeedRight = constrain(motorSpeedRight - xMapped, 0, 255);
//   }
//   else if (xOffset < -JOY_THRESHOLD)
//   {
//     int xMapped = map((int)(-xOffset * 1000),
//                       (int)(JOY_THRESHOLD * 1000),
//                       (int)(JOY_MID_X * 1000), 0, 255);
//     motorSpeedLeft = constrain(motorSpeedLeft - xMapped, 0, 255);
//     motorSpeedRight = constrain(motorSpeedRight + xMapped, 0, 255);
//   }

//   if (motorSpeedLeft < MIN_SPEED)
//     motorSpeedLeft = 0;
//   if (motorSpeedRight < MIN_SPEED)
//     motorSpeedRight = 0;

//   if (motorSpeedLeft == 0 && motorSpeedRight == 0)
//     stopMotors();

//   setLeftSpeed(motorSpeedLeft);
//   setRightSpeed(motorSpeedRight);
// }

// class MyServerCallbacks : public BLEServerCallbacks
// {
//   void onConnect(BLEServer *pServer)
//   {
//     deviceConnected = true;
//     Serial.println("BLE: Client connected");
//     rgb.setPixelColor(0, rgb.Color(0, 0, 255));
//     rgb.show();
//   }

//   void onDisconnect(BLEServer *pServer)
//   {
//     deviceConnected = false;
//     Serial.println("BLE: Client disconnected");
//     rgb.setPixelColor(0, rgb.Color(255, 0, 0));
//     rgb.show();
//     pServer->startAdvertising();
//   }
// };

// class MyCallbacks : public BLECharacteristicCallbacks
// {
//   void onWrite(BLECharacteristic *pCharacteristic)
//   {
//     std::string value = pCharacteristic->getValue();
//     if (value.empty())
//       return;

//     lastBLECommand = millis();

//     Serial.printf("BLE received: %s\n", value.c_str());

//     if (value == "F")
//     {
//       setLeftSpeed(200);
//       setRightSpeed(200);
//       moveForward();
//     }
//     else if (value == "B")
//     {
//       if (distance > 0 && distance < REDSOUND)
//       {
//         stopMotors();
//         return;
//       }
//       setLeftSpeed(200);
//       setRightSpeed(200);
//       moveBackward();
//     }
//     else if (value == "L")
//     {
//       motorSpeedLeft = 80;
//       motorSpeedRight = 200;
//       setLeftSpeed(motorSpeedLeft);
//       setRightSpeed(motorSpeedRight);
//       moveForward();
//     }
//     else if (value == "R")
//     {
//       motorSpeedLeft = 200;
//       motorSpeedRight = 80;
//       setLeftSpeed(motorSpeedLeft);
//       setRightSpeed(motorSpeedRight);
//       moveForward();
//     }
//     else if (value == "S")
//     {
//       stopMotors();
//     }
//   }
// };

// void setup()
// {
//   Serial.begin(115200);
//   delay(1000);
//   Serial.println("Booting...");

//   pinMode(GREEN_LED, OUTPUT);
//   pinMode(YELLOW_LED, OUTPUT);
//   pinMode(RED_LED, OUTPUT);
//   pinMode(TRIG, OUTPUT);
//   pinMode(ECHO, INPUT);
//   pinMode(LEFTMOTORS1, OUTPUT);
//   pinMode(LEFTMOTORS2, OUTPUT);
//   pinMode(RIGHTMOTORS1, OUTPUT);
//   pinMode(RIGHTMOTORS2, OUTPUT);
//   pinMode(BUTTON_NEXT, INPUT_PULLDOWN);
//   pinMode(BUTTON_OK, INPUT_PULLDOWN);

//   ledcSetup(LEFT_ENABLE_CHANNEL, MOTOR_PWM_FREQ, MOTOR_PWM_RESOLUTION);
//   ledcSetup(RIGHT_ENABLE_CHANNEL, MOTOR_PWM_FREQ, MOTOR_PWM_RESOLUTION);
//   ledcAttachPin(LEFT_ENABLE, LEFT_ENABLE_CHANNEL);
//   ledcAttachPin(RIGHT_ENABLE, RIGHT_ENABLE_CHANNEL);

//   ledcSetup(BUZZER_CHANNEL, 1000, BUZZER_RESOLUTION);
//   ledcAttachPin(BUZZER, BUZZER_CHANNEL);
//   ledcWrite(BUZZER_CHANNEL, 0);

//   rgb.begin();
//   rgb.setPixelColor(0, rgb.Color(255, 0, 0));
//   rgb.show();

//   Wire.begin(8, 9);
//   displayOK = display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
//   if (!displayOK)
//     Serial.println("SSD1306 NOT detected -> continuing without display");
//   else
//   {
//     display.clearDisplay();
//     display.display();
//   }

//   analogReadResolution(12);
//   stopMotors();
//   digitalWrite(TRIG, LOW);
//   delay(500);

//   BLEDevice::init("ESP32Car");
//   pServer = BLEDevice::createServer();
//   pServer->setCallbacks(new MyServerCallbacks());

//   BLEService *pService = pServer->createService("12345678-1234-1234-1234-123456789abc");
//   BLECharacteristic *pCharacteristic = pService->createCharacteristic(
//       "abcd1234-5678-90ab-cdef-1234567890ab",
//       BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_READ);
//   pCharacteristic->setCallbacks(new MyCallbacks());
//   pService->start();

//   BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
//   pAdvertising->addServiceUUID(pService->getUUID());
//   pAdvertising->setScanResponse(true);
//   BLEDevice::startAdvertising();

//   Serial.println("BLE started!");
// }

// void loop()
// {
//   ulong now = millis();

//   if (now - lastSensorRead >= 60)
//   {
//     lastSensorRead = now;
//     readHC_SR04();
//     lightIndication(distance);
//     soundIndication(distance);
//   }

//   // Update blink animation ticker
//   updateNavAnimation();

//   // Handle button presses
//   handleButtons();

//   // Render display at ~10 fps
//   if (now - lastDisplayUpdate >= 100)
//   {
//     lastDisplayUpdate = now;
//     renderCurrentPage();
//   }

//   driveFromJoystick();
// }

//////////////////////////////////////////////////////////////////////////////////////////
#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <math.h>
// #include <NimBLEDevice.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>

typedef unsigned long ulong;

#define TRIG 12
#define ECHO 11

#define BUZZER 5

#define GREEN_LED 35
#define YELLOW_LED 36
#define RED_LED 37

#define RGB_PIN 38
#define RGB_COUNT 1

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define BUZZER_CHANNEL 0
#define BUZZER_RESOLUTION 8
#define BUZZER_VOLUME 128

#define NOSOUND 16
#define GREENSOUND 11
#define YELLOWSOUND 5.5
#define REDSOUND 2.4

#define LEFTMOTORS1 6
#define LEFTMOTORS2 7
#define RIGHTMOTORS1 15
#define RIGHTMOTORS2 16

#define LEFT_ENABLE 3
#define RIGHT_ENABLE 10

#define LEFT_ENABLE_CHANNEL 1
#define RIGHT_ENABLE_CHANNEL 2
#define MOTOR_PWM_RESOLUTION 8
#define MOTOR_PWM_FREQ 300

#define JOYSTICKX 18
#define JOYSTICKY 17

#define JOY_VCC 3.3
#define JOY_ADC_MAX 4095
#define JOY_THRESHOLD 0.15
#define MIN_SPEED 50
#define PARKING_MIN_SPEED 30

#define BUTTON_NEXT 14
#define BUTTON_OK 13

#define BLE_TIMEOUT 300

#define PARKING_MAX_SPEED 70

BLEServer *pServer = nullptr;
bool deviceConnected = false;
ulong lastBLECommand = 0;
bool bleControlActive = false;

const float JOY_MID_X = 1.61;
const float JOY_MID_Y = 1.56;

Adafruit_NeoPixel rgb(RGB_COUNT, RGB_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
bool displayOK = false;

float distance = 0;
ulong duration = 0;
ulong lastSensorRead = 0;
ulong lastDisplayUpdate = 0;

bool buzzerState = false;
ulong lastChangeTime = 0;

int motorSpeedLeft = 0;
int motorSpeedRight = 0;

///////////////////////////////////////////////////////////
// navigation variables

enum Page
{
  PAGE_HOME = 0,
  PAGE_SETTINGS = 1
};

Page currentPage = PAGE_HOME;

int homeSelectedIndex = 0;
int settingsSelectedIndex = 0;
int settingsModeActive = 3;

bool parkingModeActive = false;
bool autopilotActive = false;

bool lastNextState = false;
bool lastOkState = false;
ulong lastNextPress = 0;
ulong lastOkPress = 0;
#define DEBOUNCE_MS 200

bool animBlink = false;
ulong lastAnimTime = 0;
#define ANIM_INTERVAL 300

///////////////////////////////////////////////////////////
// indication

void buzzerTone(int frequency)
{
  ledcSetup(BUZZER_CHANNEL, frequency, BUZZER_RESOLUTION);
  ledcAttachPin(BUZZER, BUZZER_CHANNEL);
  ledcWrite(BUZZER_CHANNEL, BUZZER_VOLUME);
}

void buzzerOff()
{
  ledcWrite(BUZZER_CHANNEL, 0);
}

void soundIndication(float dist)
{
  if (dist < 0)
  {
    buzzerOff();
    buzzerState = false;
    return;
  }

  ulong now = millis();
  int toneFreq;
  ulong onTime, offTime;

  if (dist > NOSOUND)
  {
    buzzerOff();
    buzzerState = false;
    return;
  }
  else if (dist > GREENSOUND)
  {
    toneFreq = 500;
    onTime = 200;
    offTime = 600;
  }
  else if (dist > YELLOWSOUND)
  {
    toneFreq = 1000;
    onTime = 150;
    offTime = 250;
  }
  else if (dist > REDSOUND)
  {
    toneFreq = 2000;
    onTime = 100;
    offTime = 100;
  }
  else
  {
    buzzerTone(2000);
    buzzerState = true;
    lastChangeTime = now;
    return;
  }

  ulong waitTime = buzzerState ? onTime : offTime;
  if (now - lastChangeTime >= waitTime)
  {
    lastChangeTime = now;
    if (buzzerState)
    {
      buzzerOff();
      buzzerState = false;
    }
    else
    {
      buzzerTone(toneFreq);
      buzzerState = true;
    }
  }
}

void lightIndication(float dist)
{
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, LOW);
  if (dist < 0)
    return;
  if (dist > GREENSOUND && dist <= NOSOUND)
    digitalWrite(GREEN_LED, HIGH);
  else if (dist > YELLOWSOUND && dist <= GREENSOUND)
    digitalWrite(YELLOW_LED, HIGH);
  else if (dist > 0 && dist <= YELLOWSOUND)
    digitalWrite(RED_LED, HIGH);
}

///////////////////////////////////////////////////////////
// read input

void readHC_SR04()
{
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  duration = pulseIn(ECHO, HIGH, 30000);
  distance = (duration == 0) ? -1.0f : duration / 58.0f;
}

void handleNextButton()
{
  if (currentPage == PAGE_HOME)
    homeSelectedIndex = (homeSelectedIndex + 1) % 3;
  else
    settingsSelectedIndex = (settingsSelectedIndex + 1) % 5;
}

void handleOkButton()
{
  if (currentPage == PAGE_HOME)
  {
    if (homeSelectedIndex == 0)
    {
      currentPage = PAGE_SETTINGS;
      settingsSelectedIndex = 0;
    }
    else if (homeSelectedIndex == 1)
    {
      autopilotActive = !autopilotActive;
      if (autopilotActive)
      {
        buzzerTone(1800);
        delay(60);
        buzzerTone(2400);
        delay(60);
        buzzerOff();
      }
      else
      {
        buzzerTone(1000);
        delay(80);
        buzzerOff();
      }
    }
    else if (homeSelectedIndex == 2)
    {
      parkingModeActive = !parkingModeActive;
      if (parkingModeActive)
      {
        buzzerTone(1500);
        delay(80);
        buzzerOff();
        settingsModeActive = 0;
      }
      else
      {
        settingsModeActive = 3;
      }
    }
  }
  else
  {
    if (settingsSelectedIndex == 4)
      currentPage = PAGE_HOME;
    else
      settingsModeActive = settingsSelectedIndex;
  }
}

void handleButtons()
{
  ulong now = millis();
  bool nextState = digitalRead(BUTTON_NEXT);
  bool okState = digitalRead(BUTTON_OK);

  if (nextState && !lastNextState && (now - lastNextPress > DEBOUNCE_MS))
  {
    lastNextPress = now;
    handleNextButton();
  }
  lastNextState = nextState;

  if (okState && !lastOkState && (now - lastOkPress > DEBOUNCE_MS))
  {
    lastOkPress = now;
    handleOkButton();
  }
  lastOkState = okState;
}

///////////////////////////////////////////////////////////
// display helpers

const unsigned char epd_bitmap_autopilot[] PROGMEM = {
    0x20, 0xf0, 0x40, 0x43, 0x9c, 0x20, 0x56, 0x06, 0xa0, 0x84, 0x02, 0x50, 0xac, 0xf3, 0x50, 0xaf,
    0xff, 0x50, 0xaf, 0xff, 0x50, 0xac, 0xf3, 0x50, 0xa4, 0x62, 0x50, 0x16, 0x66, 0x80, 0x43, 0xfc,
    0x20, 0x20, 0xf0, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

const unsigned char epd_bitmap_settings[] PROGMEM = {
    0x03, 0x80, 0x17, 0xd0, 0x3f, 0xf8, 0x7f, 0xfc, 0x38, 0x38, 0x70, 0x1c, 0xf0, 0x1e, 0xf0, 0x1e,
    0xf0, 0x1e, 0x70, 0x1c, 0x38, 0x38, 0x7f, 0xfc, 0x3f, 0xf8, 0x17, 0xd0, 0x03, 0x80};

const unsigned char epd_bitmap_backtohome[] PROGMEM = {
    0x01, 0xf8, 0x00, 0x07, 0x0e, 0x00, 0x1c, 0x03, 0x00, 0x30, 0x00, 0x80, 0x20, 0x38, 0x40, 0x60,
    0x78, 0x60, 0x40, 0xf0, 0x20, 0xc1, 0xe0, 0x20, 0x83, 0xc0, 0x30, 0x87, 0x80, 0x10, 0x87, 0x80,
    0x10, 0x83, 0xc0, 0x30, 0xc1, 0xe0, 0x20, 0x40, 0xf0, 0x20, 0x60, 0x78, 0x60, 0x20, 0x38, 0x40,
    0x10, 0x00, 0x80, 0x0c, 0x03, 0x00, 0x07, 0x9e, 0x00, 0x01, 0xf8, 0x00};

void drawNextHighlight(int x, int y, int w, int h)
{
  display.drawRect(x - 1, y - 1, w + 2, h + 2, WHITE);
}

void drawParkingIcon(int x, int y, bool selected, bool active, bool blink)
{
  if (active)
  {
    display.fillRect(x, y, 16, 14, WHITE);
    display.setTextColor(BLACK);
  }
  else
  {
    display.drawRect(x, y, 16, 14, WHITE);
    display.setTextColor(WHITE);
  }

  display.setTextSize(1);
  display.setCursor(x + 4, y + 3);
  display.print("P");
  display.setTextColor(WHITE);

  if (selected && blink && !active)
    drawNextHighlight(x - 1, y - 1, 18, 16);

  if (selected && blink && active)
    display.drawRect(x - 2, y - 2, 20, 18, WHITE);
}

///////////////////////////////////////////////////////////
// display

void showHome()
{
  if (!displayOK)
    return;

  display.clearDisplay();
  display.drawRect(0, 0, 128, 64, WHITE);
  display.setTextColor(WHITE);

  int colX = 108;

  display.drawBitmap(colX + 1, 2, epd_bitmap_settings, 15, 15, WHITE);
  if (homeSelectedIndex == 0 && animBlink)
    drawNextHighlight(colX, 1, 17, 17);

  if (autopilotActive)
  {
    display.fillRect(colX - 2, 18, 22, 16, WHITE);
    display.drawBitmap(colX - 1, 19, epd_bitmap_autopilot, 20, 14, BLACK);
  }
  else
  {
    display.drawBitmap(colX - 1, 19, epd_bitmap_autopilot, 20, 14, WHITE);
    if (homeSelectedIndex == 1 && animBlink)
      drawNextHighlight(colX - 2, 18, 22, 16);
  }

  drawParkingIcon(colX, 36, homeSelectedIndex == 2, parkingModeActive, animBlink);

  display.drawLine(105, 0, 105, 64, WHITE);

  display.setTextSize(1);
  display.setCursor(4, 3);
  if (bleControlActive)
    display.println("PARKTRONIC [BLE]");
  else if (parkingModeActive)
    display.println("PARKTRONIC [PRK]");
  else
    display.println("PARKTRONIC 3000");

  display.drawLine(0, 12, 105, 12, WHITE);

  display.setTextSize(2);
  if (duration == 0 || distance < 0)
  {
    display.setCursor(10, 18);
    display.println("SAFE");
  }
  else
  {
    display.setCursor(5, 18);
    display.printf("%4.1fcm", distance);
  }

  String status;
  int barWidth;
  if (distance < 0 || duration == 0 || distance > NOSOUND)
  {
    status = "Clear";
    barWidth = 0;
  }
  else if (distance > GREENSOUND)
  {
    status = "Approach";
    barWidth = 35;
  }
  else if (distance > YELLOWSOUND)
  {
    status = "Warning";
    barWidth = 65;
  }
  else
  {
    status = "STOP";
    barWidth = 100;
  }

  display.setTextSize(1);
  display.setCursor(3, 44);
  display.println(status);

  display.drawRect(3, 56, 100, 6, WHITE);
  display.fillRect(3, 56, barWidth, 6, WHITE);

  display.display();
}

void showSettings()
{
  if (!displayOK)
    return;

  display.clearDisplay();
  display.drawRect(0, 0, 128, 64, WHITE);
  display.setTextColor(WHITE);

  int colX = 108;

  display.drawBitmap(colX - 1, 16, epd_bitmap_backtohome, 20, 20, WHITE);
  if (settingsSelectedIndex == 4 && animBlink)
    drawNextHighlight(colX - 2, 15, 22, 22);

  display.drawLine(105, 0, 105, 64, WHITE);

  display.setTextSize(1);
  display.setCursor(4, 3);
  display.println("SETTINGS");
  display.drawLine(0, 12, 128, 12, WHITE);

  const char *modes[] = {"Light&Sound:", "Light Only:", "Sound Only:", "None:"};
  for (int i = 0; i < 4; i++)
  {
    int yRow = 22 + i * 10;
    if (i == settingsSelectedIndex)
    {
      display.fillRect(2, yRow - 2, 100, 11, WHITE);
      display.setTextColor(BLACK);
    }
    else
      display.setTextColor(WHITE);

    display.drawCircle(5, yRow + 2, 2, (i == settingsSelectedIndex) ? BLACK : WHITE);
    if (i == settingsModeActive)
      display.fillCircle(5, yRow + 2, 1, (i == settingsSelectedIndex) ? BLACK : WHITE);

    display.setCursor(10, yRow);
    display.print(modes[i]);
    display.setCursor(85, yRow);
    display.print((i == settingsModeActive) ? "ON " : "OFF");
    display.setTextColor(WHITE);
  }

  display.display();
}

///////////////////////////////////////////////////////////
// display navigation

void renderCurrentPage()
{
  if (currentPage == PAGE_HOME)
    showHome();
  else
    showSettings();
}

void updateNavAnimation()
{
  ulong now = millis();
  if (now - lastAnimTime >= ANIM_INTERVAL)
  {
    lastAnimTime = now;
    animBlink = !animBlink;
  }
}

///////////////////////////////////////////////////////////
// controll motors

void setLeftSpeed(int speed) { ledcWrite(LEFT_ENABLE_CHANNEL, constrain(speed, 0, 255)); }
void setRightSpeed(int speed) { ledcWrite(RIGHT_ENABLE_CHANNEL, constrain(speed, 0, 255)); }

void moveForward()
{
  digitalWrite(LEFTMOTORS1, LOW);
  digitalWrite(LEFTMOTORS2, HIGH);
  digitalWrite(RIGHTMOTORS1, LOW);
  digitalWrite(RIGHTMOTORS2, HIGH);
}

void moveBackward()
{
  digitalWrite(LEFTMOTORS1, HIGH);
  digitalWrite(LEFTMOTORS2, LOW);
  digitalWrite(RIGHTMOTORS1, HIGH);
  digitalWrite(RIGHTMOTORS2, LOW);
}

void stopLeftMotors()
{
  digitalWrite(LEFTMOTORS1, LOW);
  digitalWrite(LEFTMOTORS2, LOW);
}
void stopRightMotors()
{
  digitalWrite(RIGHTMOTORS1, LOW);
  digitalWrite(RIGHTMOTORS2, LOW);
}

void stopMotors()
{
  stopLeftMotors();
  stopRightMotors();
  setLeftSpeed(0);
  setRightSpeed(0);
}

float getDynamicStopDistance()
{
  int avgSpeed = (motorSpeedLeft + motorSpeedRight) / 2;
  float extraDist = 18.6f;
  return REDSOUND + (avgSpeed / 255.0f) * extraDist;
}

void driveFromJoystick()
{
  static bool motorsWereStopped = true;

  // if (parkingModeActive && distance > 0 && distance <= REDSOUND)
  // {
  //   stopMotors();
  //   motorsWereStopped = true;
  //   return;
  // }

  int maxSpeed = parkingModeActive ? PARKING_MAX_SPEED : 255;
  int minSpeed = parkingModeActive ? PARKING_MIN_SPEED : MIN_SPEED;

  float xVolt = (analogRead(JOYSTICKX) * JOY_VCC) / JOY_ADC_MAX;
  float yVolt = (analogRead(JOYSTICKY) * JOY_VCC) / JOY_ADC_MAX;

  float xOffset = xVolt - JOY_MID_X;
  float yOffset = yVolt - JOY_MID_Y;

  bool goingForward = false;
  bool goingBackward = false;

  if (yOffset > JOY_THRESHOLD)
  {
    goingForward = true;
    motorSpeedLeft = map((int)(yOffset * 1000),
                         (int)(JOY_THRESHOLD * 1000),
                         (int)(JOY_MID_Y * 1000), 0, 255);
    motorSpeedRight = motorSpeedLeft;
  }
  else if (yOffset < -JOY_THRESHOLD)
  {
    goingBackward = true;
    motorSpeedLeft = map((int)(-yOffset * 1000),
                         (int)(JOY_THRESHOLD * 1000),
                         (int)(JOY_MID_Y * 1000), 0, 255);
    motorSpeedRight = motorSpeedLeft;
  }
  else
  {
    motorSpeedLeft = 0;
    motorSpeedRight = 0;
  }

  if (autopilotActive && goingBackward && distance > 0 && distance <= getDynamicStopDistance())
  {
    stopMotors();
    motorsWereStopped = true;
    return;
  }

  if (xOffset > JOY_THRESHOLD)
  {
    int xMapped = map((int)(xOffset * 1000),
                      (int)(JOY_THRESHOLD * 1000),
                      (int)((JOY_VCC - JOY_MID_X) * 1000), 0, 255);
    motorSpeedLeft = constrain(motorSpeedLeft + xMapped, 0, 255);
    motorSpeedRight = constrain(motorSpeedRight - xMapped, 0, 255);
  }
  else if (xOffset < -JOY_THRESHOLD)
  {
    int xMapped = map((int)(-xOffset * 1000),
                      (int)(JOY_THRESHOLD * 1000),
                      (int)(JOY_MID_X * 1000), 0, 255);
    motorSpeedLeft = constrain(motorSpeedLeft - xMapped, 0, 255);
    motorSpeedRight = constrain(motorSpeedRight + xMapped, 0, 255);
  }

  motorSpeedLeft = constrain(motorSpeedLeft, 0, maxSpeed);
  motorSpeedRight = constrain(motorSpeedRight, 0, maxSpeed);

  if (motorSpeedLeft < minSpeed)
    motorSpeedLeft = 0;
  if (motorSpeedRight < minSpeed)
    motorSpeedRight = 0;

  if (motorSpeedLeft == 0 && motorSpeedRight == 0)
  {
    stopMotors();
    motorsWereStopped = true;
    return;
  }

  if (goingForward)
    moveForward();
  else if (goingBackward)
    moveBackward();

  // Kickstart
  if (motorsWereStopped)
  {
    setLeftSpeed(255);
    setRightSpeed(255);
    delay(40);
    motorsWereStopped = false;
  }

  setLeftSpeed(motorSpeedLeft);
  setRightSpeed(motorSpeedRight);
}

///////////////////////////////////////////////////////////
// BLE
class MyServerCallbacks : public BLEServerCallbacks
{
  void onConnect(BLEServer *pServer)
  {
    deviceConnected = true;
    bleControlActive = true;
    stopMotors();
    Serial.println("BLE: Client connected — joystick DISABLED");
    rgb.setPixelColor(0, rgb.Color(0, 0, 255));
    rgb.show();
  }

  void onDisconnect(BLEServer *pServer)
  {
    deviceConnected = false;
    bleControlActive = false;
    stopMotors();
    Serial.println("BLE: Client disconnected — joystick ENABLED");
    rgb.setPixelColor(0, rgb.Color(255, 0, 0));
    rgb.show();
    pServer->startAdvertising();
  }
};

class MyCallbacks : public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    std::string value = pCharacteristic->getValue();
    if (value.empty())
      return;

    lastBLECommand = millis();
    Serial.printf("BLE received: %s\n", value.c_str());

    if (value == "F")
    {
      setLeftSpeed(200);
      setRightSpeed(200);
      moveForward();
    }
    else if (value == "B")
    {
      if (distance > 0 && distance < REDSOUND)
      {
        stopMotors();
        return;
      }
      setLeftSpeed(200);
      setRightSpeed(200);
      moveBackward();
    }
    else if (value == "L")
    {
      motorSpeedLeft = 80;
      motorSpeedRight = 200;
      setLeftSpeed(motorSpeedLeft);
      setRightSpeed(motorSpeedRight);
      moveForward();
    }
    else if (value == "R")
    {
      motorSpeedLeft = 200;
      motorSpeedRight = 80;
      setLeftSpeed(motorSpeedLeft);
      setRightSpeed(motorSpeedRight);
      moveForward();
    }
    else if (value == "S")
    {
      stopMotors();
    }
    else if (value == "X")
    {
      rgb.setPixelColor(0, rgb.Color(0, 255, 0));
      rgb.show();
    }
    else if (value == "Y")
    {
      rgb.setPixelColor(0, rgb.Color(0, 0, 255));
      rgb.show();
    }
  }
};

void setup()
{
  Serial.begin(115200);
  delay(1000);
  Serial.println("Booting...");

  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  pinMode(LEFTMOTORS1, OUTPUT);
  pinMode(LEFTMOTORS2, OUTPUT);
  pinMode(RIGHTMOTORS1, OUTPUT);
  pinMode(RIGHTMOTORS2, OUTPUT);
  pinMode(BUTTON_NEXT, INPUT_PULLDOWN);
  pinMode(BUTTON_OK, INPUT_PULLDOWN);

  ledcSetup(LEFT_ENABLE_CHANNEL, MOTOR_PWM_FREQ, MOTOR_PWM_RESOLUTION);
  ledcSetup(RIGHT_ENABLE_CHANNEL, MOTOR_PWM_FREQ, MOTOR_PWM_RESOLUTION);
  ledcAttachPin(LEFT_ENABLE, LEFT_ENABLE_CHANNEL);
  ledcAttachPin(RIGHT_ENABLE, RIGHT_ENABLE_CHANNEL);

  ledcSetup(BUZZER_CHANNEL, 1000, BUZZER_RESOLUTION);
  ledcAttachPin(BUZZER, BUZZER_CHANNEL);
  ledcWrite(BUZZER_CHANNEL, 0);

  rgb.begin();
  rgb.setPixelColor(0, rgb.Color(255, 0, 0));
  rgb.show();

  Wire.begin(8, 9);
  displayOK = display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  if (!displayOK)
    Serial.println("SSD1306 NOT detected -> continuing without display");
  else
  {
    display.clearDisplay();
    display.display();
  }

  analogReadResolution(12);
  stopMotors();
  digitalWrite(TRIG, LOW);
  delay(500);

  BLEDevice::init("ESP32Car");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService("12345678-1234-1234-1234-123456789abc");
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
      "abcd1234-5678-90ab-cdef-1234567890ab",
      BLECharacteristic::PROPERTY_READ |
          BLECharacteristic::PROPERTY_WRITE |
          BLECharacteristic::PROPERTY_WRITE_NR);
  pCharacteristic->setCallbacks(new MyCallbacks());
  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(pService->getUUID());
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("BLE started!");
}

///////////////////////////////////////////////////////////

void loop()
{
  ulong now = millis();

  if (now - lastSensorRead >= 60)
  {
    lastSensorRead = now;
    readHC_SR04();

    if (settingsModeActive == 0)
    {
      lightIndication(distance);
      soundIndication(distance);
    }
    else if (settingsModeActive == 1)
    {
      buzzerOff();
      buzzerState = false;
      lightIndication(distance);
    }
    else if (settingsModeActive == 2)
    {
      digitalWrite(GREEN_LED, LOW);
      digitalWrite(YELLOW_LED, LOW);
      digitalWrite(RED_LED, LOW);
      soundIndication(distance);
    }
    else
    {
      digitalWrite(GREEN_LED, LOW);
      digitalWrite(YELLOW_LED, LOW);
      digitalWrite(RED_LED, LOW);
      buzzerOff();
      buzzerState = false;
    }
  }

  updateNavAnimation();
  handleButtons();

  if (now - lastDisplayUpdate >= 100)
  {
    lastDisplayUpdate = now;
    renderCurrentPage();
  }

  if (!bleControlActive)
    driveFromJoystick();
}