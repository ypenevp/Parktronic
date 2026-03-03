#include <Arduino.h>

#define BUZZER 5

void setup() {
    Serial.begin(115200);
    pinMode(BUZZER, OUTPUT);
}

void lightIndication(float distance){

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
    soundIndication(25);
    delay(2000);
    soundIndication(18);
    delay(2000);
    soundIndication(10);
    delay(2000);
    soundIndication(3);
    delay(2000);
}
