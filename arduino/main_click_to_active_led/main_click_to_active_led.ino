// set pin numbers:
const int button1Pin = 2;     // the number of the pushbutton pin
const int button2Pin = 7;
const int button3Pin = 12;
const int button4Pin = 13;

const int led1Pin =  4;       // the number of the LED pin
const int led2Pin =  8;
const int led3Pin =  10;
const int led4Pin =  11;

bool button1Active = true;
int button1State = 0;         // variable for reading the pushbutton status

bool button2Active = true;
int button2State = 0;

bool button3Active = true;
int button3State = 0;

bool button4Active = true;
int button4State = 0;

String writeBuffer;
String readBuffer;

void setup() {
  // initialize the LED pin as an output:
  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  // initialize the pushbutton pin as an input:
  pinMode(button1Pin, INPUT);
  pinMode(button2Pin, INPUT);
  // initialize serial communication:
  Serial.begin(9600);
}

void serialEvent() {
  readBuffer = Serial.readString();
  Serial.println("------------");
  Serial.println(readBuffer);
  Serial.println("------------");
  if (readBuffer.length() == 4) {
    button1Active = readBuffer.charAt(0) == '0' ? false : true;
    button2Active = readBuffer.charAt(1) == '0' ? false : true;
    button3Active = readBuffer.charAt(2) == '0' ? false : true;
    button4Active = readBuffer.charAt(3) == '0' ? false : true;
  }
}

void loop() {
  // read the state of the pushbutton value:
  button1State = digitalRead(button1Pin);
  button2State = digitalRead(button2Pin);
  button3State = digitalRead(button3Pin);
  button4State = digitalRead(button4Pin);


  if (button1Active == true) {
    // check if the pushbutton is pressed.
    // if it is, the buttonState is HIGH:
    if (button1State == HIGH) {
      // turn LED on:
      digitalWrite(led1Pin, HIGH);
    } else {
      // turn LED off:
      digitalWrite(led1Pin, LOW);
    }
  }

  if (button2Active == true) {
    if (button2State == HIGH) {
      digitalWrite(led2Pin, HIGH);
    } else {
      digitalWrite(led2Pin, LOW);
    }
  }

  if (button3Active == true) {
    if (button3State == HIGH) {
      digitalWrite(led3Pin, HIGH);
    } else {
      digitalWrite(led3Pin, LOW);
    }
  }

  if (button4Active == true) {
    if (button4State == HIGH) {
      digitalWrite(led4Pin, HIGH);
    } else {
      digitalWrite(led4Pin, LOW);
    }
  }
  
  // send button status
  writeBuffer = String(button1Active) + String(button1State) 
                + String(button2Active) + String(button2State) 
                + String(button3Active) + String(button3State) 
                + String(button4Active) + String(button4State);
  Serial.println(writeBuffer);
}
