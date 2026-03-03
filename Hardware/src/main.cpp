#include <Arduino.h>

#define TRIG 12
#define ECHO 11

#define BUZZER 5

#define GREEN_LED 35
#define YELLOW_LED 36
#define RED_LED 37

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
    pinMode(TRIG, OUTPUT);
    pinMode(ECHO, INPUT);

    digitalWrite(TRIG, LOW);
    delay(1000);
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

    if (duration >= 38000)
    {
        Serial.println("Out of range");
    }
    else
    {
        distance = duration / 58.0;
        // meter = distance / 100.0;

        Serial.print(distance);
        Serial.print(" cm\t");

        soundIndication(distance);
        lightIndication(distance);
    }
}
