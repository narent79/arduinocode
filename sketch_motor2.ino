// Connect motor controller pins to Arduino digital pins
// Motor One
const int enA = 10;
const int in1 = 9;
const int in2 = 8;
// Motor Two
const int enB = 5;
const int in3 = 7;
const int in4 = 6;
// Distance Sensor
const int TRIGGER_PIN = 2;
const int ECHO_PIN = 4;
// Directions
const int FORWARDS = 1;
const int BACKWARDS = 2;
const int LEFT = 3;
const int RIGHT = 4;
const int STOPPED = 0;
// Speed
const int LEFT_SPEED = 175;
const int RIGHT_SPEED = 185;
// Turning Delay in milliseconds
const int TURNING_DELAY = 1000;
// Loop Interval
const long interval = 1000;

// Driving Status
int drivingStatus = STOPPED;
// previous loop run
unsigned long previousMillis = 0;

void setup()
{
  // initialize serial communication:
  Serial.begin(9600);
  // set all the motor control pins to outputs
  pinMode(enA, OUTPUT);
  pinMode(enB, OUTPUT);
  pinMode(in1, OUTPUT);
  pinMode(in2, OUTPUT);
  pinMode(in3, OUTPUT);
  pinMode(in4, OUTPUT);
  pinMode(TRIGGER_PIN, OUTPUT); // Sets the trigPin as an Output
  pinMode(ECHO_PIN, INPUT); // Sets the echoPin as an Input
}

/**
 * @param direction string 'forwards' 'backwards' 'left' 'right'
 * @param speed int 0-255
 * @return string status
 */
int drive(int direction) {
  stopDriving();
  analogWrite(enA, LEFT_SPEED);
  analogWrite(enB, RIGHT_SPEED);
  if(direction == FORWARDS) {
    digitalWrite(in2, HIGH);
    digitalWrite(in4, HIGH);
  } else if(direction == BACKWARDS) {
    digitalWrite(in1, HIGH);
    digitalWrite(in3, HIGH);
  } else if(direction == LEFT) {
    digitalWrite(in2, HIGH);
  } else if(direction == RIGHT) {
    digitalWrite(in4, HIGH);
  }
  return direction;
}

/**
 * @return string status
 */
int stopDriving() {
  analogWrite(enA, 0);
  analogWrite(enB, 0);
  digitalWrite(in1, LOW);
  digitalWrite(in2, LOW);
  digitalWrite(in3, LOW);
  digitalWrite(in4, LOW);
  return STOPPED;
}

long getDistance() {
  // establish variables for duration of the ping,
  // and the distance result in inches and centimeters:
  long duration, inches, cm;

  // The PING))) is triggered by a HIGH pulse of 2 or more microseconds.
  // Give a short LOW pulse beforehand to ensure a clean HIGH pulse:
  digitalWrite(TRIGGER_PIN, LOW);
  delayMicroseconds(2);

  // The same pin is used to read the signal from the PING))): a HIGH
  // pulse whose duration is the time (in microseconds) from the sending
  // of the ping to the reception of its echo off of an object.
  digitalWrite(TRIGGER_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIGGER_PIN, LOW);

  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(ECHO_PIN, HIGH);

  // convert the time into a distance
  inches = microsecondsToInches(duration);
  //cm = microsecondsToCentimeters(duration);

  Serial.print(inches);
  Serial.print("in, ");
  //Serial.print(cm);
  //Serial.print("cm");
  Serial.println();

  return inches;
}


long microsecondsToInches(long microseconds) {
  // According to Parallax's datasheet for the PING))), there are
  // 73.746 microseconds per inch (i.e. sound travels at 1130 feet per
  // second).  This gives the distance travelled by the ping, outbound
  // and return, so we divide by 2 to get the distance of the obstacle.
  // See: http://www.parallax.com/dl/docs/prod/acc/28015-PING-v1.3.pdf
  return microseconds / 74 / 2;
}

long microsecondsToCentimeters(long microseconds) {
  // The speed of sound is 340 m/s or 29 microseconds per centimeter.
  // The ping travels out and back, so to find the distance of the
  // object we take half of the distance travelled.
  return microseconds / 29 / 2;
}

void loop()
{
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    // save the last time you blinked the LED
    previousMillis = currentMillis;
    if(getDistance() < 12) {
      drivingStatus = stopDriving();
      drivingStatus = drive(LEFT);
      delay(TURNING_DELAY);
    } else if(drivingStatus != FORWARDS) {
        drivingStatus = drive(FORWARDS);
    }
  }
}
