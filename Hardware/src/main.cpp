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

Adafruit_NeoPixel rgb(RGB_COUNT, RGB_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

float distance = 0;
unsigned long duration = 0;

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
  if (dist > 20)
  {
    buzzerOff();
  }
  else if (dist > 13 && dist <= 20)
  {
    buzzerTone(500);
    delay(200);
    buzzerOff();
    delay(600);
  }
  else if (dist > 6 && dist <= 13)
  {
    buzzerTone(1000);
    delay(150);
    buzzerOff();
    delay(250);
  }
  else
  {
    buzzerTone(2000);
    delay(100);
    buzzerOff();
    delay(100);
  }
}

void lightIndication(float dist)
{
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, LOW);

  if (dist > 13 && dist <= 20)
    digitalWrite(GREEN_LED, HIGH);
  else if (dist > 6 && dist <= 13)
    digitalWrite(YELLOW_LED, HIGH);
  else if (dist > 0 && dist <= 6)
    digitalWrite(RED_LED, HIGH);
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
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);

  duration = pulseIn(ECHO, HIGH);

  if (duration == 0 || duration >= 38000)
  {
    buzzerOff();

    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);

    rgb.setPixelColor(0, rgb.Color(0, 255, 0));
    rgb.show();

    Serial.println("Out of range");

    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.println("Out of range");
    display.display();
  }
  else
  {
    distance = duration / 58.0;
    Serial.printf("Distance: %.1f cm\n", distance);

    rgb.setPixelColor(0, rgb.Color(255, 0, 0));
    rgb.show();

    lightIndication(distance);
    soundIndication(distance);

    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(30, 0);
    display.println("Welcome to");
    display.setCursor(13, 8);
    display.println("Parktronic 3000");

    display.setTextSize(2);
    display.setTextColor(WHITE);
    display.setCursor(0, 16);
    display.printf("%.1f cm", distance);

    display.setTextSize(1);
    display.setCursor(0, 32);
    if (distance > 20)
      display.println("Safe distance for now");
    else if (distance > 13)
      display.println("Getting closer...");
    else if (distance > 6)
      display.println("WARNING!!");
    else
      display.println("STOP!!!");

    display.display();
  }
}