#include <Adafruit_NeoPixel.h>
#include <SoftwareSerial.h>
#define PIN 0
 
Adafruit_NeoPixel pixels = Adafruit_NeoPixel(16, PIN);
SoftwareSerial softSerial(2, 1); // RX, TX

int numberOfLeds = 16;
String incomingString = ""; // for incoming serial data
uint32_t prevTime;
uint32_t currTime;
uint32_t OFF = 0x000000;
uint32_t RED = 0xFF0000;
uint32_t GREEN = 0x008000;
uint32_t ORANGE = 0xFFA500;
uint32_t YELLOW = 0xFFD700;
uint32_t BLUE = 0x1919FF;

void setup() {
  pixels.begin();
  pixels.setBrightness(40); // 1/3 brightness
  prevTime = millis();
  softSerial.begin(9600);
  ledTest();
}

void loop() {
  currTime = millis();
  if ((currTime - prevTime) > 10000) {
    if(softSerial.available() > 0) {
      incomingString = softSerial.readString();
    }

    if (incomingString != "") {
      int counter = 0;
      int revCounter = 15;
      for (; counter < incomingString.length(); counter++) {
        if (incomingString[counter] == '0') {
          pixels.setPixelColor(counter, OFF);
        }
        else if (incomingString[counter] == '1') {
          pixels.setPixelColor(counter, YELLOW);
        }
        else if (incomingString[counter] == '2') {
          pixels.setPixelColor(counter, GREEN);
        }
        else if (incomingString[counter] == '3') {
          pixels.setPixelColor(counter, RED);
        }
        else if (incomingString[counter] == '4') {
          pixels.setPixelColor(counter, BLUE);
        }
        else if (incomingString[counter] == '.') {
          break;
        }
      }

      for (; counter < incomingString.length(); counter++) {
        if (incomingString[counter] == '0') {
          pixels.setPixelColor(revCounter, OFF);
        }
        else if (incomingString[counter] == '1') {
          pixels.setPixelColor(revCounter, YELLOW);
        }
        else if (incomingString[counter] == '2') {
          pixels.setPixelColor(revCounter, GREEN);
        }
        else if (incomingString[counter] == '3') {
          pixels.setPixelColor(revCounter, RED);
        }
        revCounter--;
      }

      pixels.show();
      incomingString = "";
    }
    
    prevTime = currTime;
  }
}

void ledTest() {
  for(int ledCounter = 0; ledCounter < numberOfLeds; ledCounter++) {
    pixels.setPixelColor(ledCounter, GREEN);
    pixels.show();
    delay(500);
    pixels.setPixelColor(ledCounter, 0x000000);
    pixels.show();
  }
}

