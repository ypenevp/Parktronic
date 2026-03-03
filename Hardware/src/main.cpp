#include <Arduino.h>

#define BUZZER 5

#define GREEN_LED 35
#define YELLOW_LED 36
#define RED_LED 37

void setup() {
    Serial.begin(115200);
    pinMode(BUZZER, OUTPUT);

    pinMode(GREEN_LED, OUTPUT);
    pinMode(YELLOW_LED, OUTPUT);
    pinMode(RED_LED, OUTPUT);
}

void lightIndication(float distance)
{
  if (distance > 20)
  {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(RED_LED, LOW);
  }
  else if (distance >= 13 && distance <= 20)
  {
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
  }
  else if (distance >= 6 && distance <= 13)
  {
    digitalWrite(YELLOW_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, LOW);
  }
  else if (distance >= 0 && distance <= 6)
  {
    digitalWrite(RED_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
  }
}

void soundIndication(float distance){
    if(distance > 20){
        noTone(BUZZER);
    } else if (distance <= 20 && distance > 13){
        tone(BUZZER, 500, 100);
        delay(900);
    } else if(distance <= 13 && distance > 6){
        tone(BUZZER, 1000, 100);
        delay(400);
    } else {
        tone(BUZZER, 2000);
    }
}

void loop() {
    soundIndication(18);
    delay(2000);
    // soundIndication(18);
    // delay(2000);
    // soundIndication(10);
    // delay(2000);
    // soundIndication(3);
    // delay(2000);
    lightIndication(25);
    delay(2000);
    lightIndication(18);
    delay(2000);
    lightIndication(10);
    delay(2000);
    lightIndication(3);
    delay(2000);
}
