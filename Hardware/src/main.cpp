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

Adafruit_NeoPixel rgb(RGB_COUNT, RGB_PIN, NEO_GRB + NEO_KHZ800);

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

float distance;
float meter;
unsigned long duration = 0;

void setup()
{
  Serial.begin(115200);
  pinMode(BUZZER, OUTPUT);

  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  rgb.begin();
  rgb.show();

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    rgb.setPixelColor(0, rgb.Color(255, 0, 0));
    rgb.show();
    for(;;);
  }
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);

  digitalWrite(TRIG, LOW);
  delay(1000);

  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(30, 0);
  display.println("Welcome to");
  display.setCursor(13, 8);
  display.println(" Parktronic 3000");
  display.display(); 
}

void lightIndication(float distance)
{
  if (distance > 20)
  {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);
  }
  else if (distance > 13 && distance <= 20)
  {
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
  }
  else if (distance > 6 && distance <= 13)
  {
    digitalWrite(YELLOW_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, LOW);
  }
  else if (distance > 0 && distance <= 6)
  {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
  }
}

void soundIndication(float distance)
{
  if (distance > 20)
  {
    noTone(BUZZER);
  }
  else if (distance <= 20 && distance > 13)
  {
    tone(BUZZER, 500);
    delay(200);
    noTone(BUZZER);
    delay(600);
  }
  else if (distance <= 13 && distance > 6)
  {
    tone(BUZZER, 1000);
    delay(150);
    noTone(BUZZER);
    delay(250);
  }
  else
  {
    tone(BUZZER, 2000);
    delay(100);
    noTone(BUZZER);
    delay(100);
  }
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
    rgb.setPixelColor(0, rgb.Color(0, 255, 0));
    rgb.show();
    Serial.println("Out of range");
  }
  else
  {
    rgb.setPixelColor(0, rgb.Color(255, 0, 0));
    rgb.show();

    distance = duration / 58.0;
    // meter = distance / 100.0;

    Serial.print(distance);
    Serial.println(" cm");

    soundIndication(distance);
    lightIndication(distance);
  }
}
