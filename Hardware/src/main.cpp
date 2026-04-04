#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define TRIG 12
#define ECHO 11

#define BUZZER 5

#define GREEN_LED 35
#define YELLOW_LED 36
#define RED_LED 37

#define RGB_PIN 14
#define RGB_COUNT 1

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define BUZZER_CHANNEL 0
#define BUZZER_RESOLUTION 8 // 8-bit: 0–255
#define BUZZER_VOLUME 128   // 50% duty cycle

#define NOSOUND 16
#define GREENSOUND 11
#define YELLOWSOUND 5.5
#define REDSOUND 2.4

typedef unsigned long ulong;

Adafruit_NeoPixel rgb(RGB_COUNT, RGB_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

float distance = 0;
ulong duration = 0;
bool buzzerState = false;
ulong lastChangeTime = 0;

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

  if (dist > GREENSOUND && dist <= NOSOUND)
    digitalWrite(GREEN_LED, HIGH);
  else if (dist > YELLOWSOUND && dist <= GREENSOUND)
    digitalWrite(YELLOW_LED, HIGH);
  else if (dist > 0 && dist <= YELLOWSOUND)
    digitalWrite(RED_LED, HIGH);
}

void readHC_SR04() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  duration = pulseIn(ECHO, HIGH, 30000); // timeout
  if (duration == 0) {
    distance = -1; // no echo
  } else {
    distance = duration / 58.0;
  }
}

// void showHome()
// {
//   display.clearDisplay();
//   display.setTextSize(1);
//   display.setTextColor(WHITE);
//   display.setCursor(30, 0);
//   display.println("Welcome to");
//   display.setCursor(13, 8);
//   display.println("Parktronic 3000");

//   display.setTextSize(2);
//   display.setTextColor(WHITE);
//   display.setCursor(12, 18);

//   if (duration >= 38000 || duration == -1)
//   {
//     display.printf("SAFE");
//   } else {
//   display.printf("%.1f cm", distance);

//   }

//   display.setTextSize(1);
//   display.setCursor(0, 32);
//   if (distance > 20)
//     display.println("Safe distance for now");
//   else if (distance > 13)
//     display.println("Getting closer...");
//   else if (distance > 6)
//     display.println("WARNING!!");
//   else
//     display.println("STOP!!!");

//   display.display();
// }


void drawSettingsIcon(int x, int y)
{
  display.drawCircle(x + 6, y + 6, 3, WHITE);
  display.drawLine(x + 6, y + 0, x + 6, y + 2, WHITE);
  display.drawLine(x + 6, y + 10, x + 6, y + 12, WHITE);
  display.drawLine(x + 0, y + 6, x + 2, y + 6, WHITE);
  display.drawLine(x + 10, y + 6, x + 12, y + 6, WHITE);
  display.drawLine(x + 2, y + 2, x + 3, y + 3, WHITE);
  display.drawLine(x + 9, y + 9, x + 10, y + 10, WHITE);
  display.drawLine(x + 9, y + 3, x + 10, y + 2, WHITE);
  display.drawLine(x + 2, y + 10, x + 3, y + 9, WHITE);
}

// void drawAutoIcon(int x, int y)
// {
//   display.drawRect(x + 1, y + 5, 10, 4, WHITE);

//   // wheels
//   display.drawPixel(x + 3, y + 10, WHITE);
//   display.drawPixel(x + 8, y + 10, WHITE);

//   // distance waves (sensor signal)
//   display.drawLine(x + 12, y + 5, x + 14, y + 4, WHITE);
//   display.drawLine(x + 12, y + 7, x + 15, y + 7, WHITE);
//   display.drawLine(x + 12, y + 9, x + 14, y + 10, WHITE);
// }

void drawAutoIcon(int x, int y) {
  display.fillRect(x, y + 2, 2, 10, WHITE);
  display.fillRect(x + 4, y + 4, 9, 5, WHITE);
  display.fillRect(x + 5, y + 2, 6, 3, WHITE);
  display.fillRect(x + 6, y + 3, 4, 2, BLACK);
  display.fillCircle(x + 6,  y + 10, 2, WHITE);
  display.fillCircle(x + 11, y + 10, 2, WHITE);
  display.fillCircle(x + 6,  y + 9, 1, BLACK);
  display.fillCircle(x + 11, y + 9, 1, BLACK);
}
void showHome()
{
  display.clearDisplay();
  display.setTextColor(WHITE);

  //RIGHT ICON COLUMN 
  int colX = 110;
  drawSettingsIcon(colX, 2);
  drawAutoIcon(colX, 18);

  // line
  display.drawLine(105, 0, 105, 64, WHITE);

  //TITLE
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("PARKTRONIC 3000");

  display.drawLine(0, 10, 100, 10, WHITE);

  //DISTANCE
  display.setTextSize(2);

  if (duration == 0 || duration >= 38000 || distance < 0)
  {
    display.setCursor(10, 18);
    display.println("SAFE");
  }
  else
  {
    display.setCursor(0, 18);
    display.printf("%4.1fcm", distance);
  }

  //STATUS TEXT
  display.setTextSize(1);
  display.setCursor(0, 44);

  String status;
  int barWidth;

  if (distance > NOSOUND || distance < 0)
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

  display.println(status);

  //BAR
  display.drawRect(0, 56, 100, 6, WHITE);
  display.fillRect(0, 56, barWidth, 6, WHITE);

  display.display();
}

void setup()
{
  Serial.begin(115200);

  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);

  ledcSetup(BUZZER_CHANNEL, 1000, BUZZER_RESOLUTION);
  ledcAttachPin(BUZZER, BUZZER_CHANNEL);
  ledcWrite(BUZZER_CHANNEL, 0);

  rgb.begin();
  rgb.show();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C))
  {
    Serial.println(F("SSD1306 allocation failed"));
    rgb.setPixelColor(0, rgb.Color(255, 0, 0));
    rgb.show();
    for (;;)
      ;
  }

  digitalWrite(TRIG, LOW);
  delay(1000);

  display.clearDisplay();
}

void loop()
{
  readHC_SR04();
  // Serial.printf("Distance: %.1f cm\n", distance);
  lightIndication(distance);
  soundIndication(distance);
  showHome();
}