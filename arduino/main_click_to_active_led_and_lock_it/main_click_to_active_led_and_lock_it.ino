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
bool button1Selected = false;
int button1State = 0;         // variable for reading the pushbutton status

bool button2Active = true;
bool button2Selected = false;
int button2State = 0;

bool button3Active = true;
bool button3Selected = false;
int button3State = 0;

bool button4Active = true;
bool button4Selected = false;
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
  Serial.println("-" + readBuffer);

  digitalWrite(led1Pin, HIGH);
  delay(1000);
  digitalWrite(led1Pin, LOW);
  delay(1000);
  digitalWrite(led1Pin, HIGH);
  delay(1000);
  digitalWrite(led1Pin, LOW);
  
  if (readBuffer.length() == 12) {
    button1Active = readBuffer.charAt(0) == '0' ? false : true;
    button1Selected = readBuffer.charAt(2) == '0' ? false : true;
    
    button2Active = readBuffer.charAt(3) == '0' ? false : true;
    button2Selected = readBuffer.charAt(5) == '0' ? false : true;
    
    button3Active = readBuffer.charAt(6) == '0' ? false : true;
    button3Selected = readBuffer.charAt(8) == '0' ? false : true;
    
    button4Active = readBuffer.charAt(9) == '0' ? false : true;
    button4Selected = readBuffer.charAt(11) == '0' ? false : true;
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
    if (button1State == HIGH || button1Selected == true) {
      // turn LED on:
      digitalWrite(led1Pin, HIGH);
    } else {
      // turn LED off:
      digitalWrite(led1Pin, LOW);
    }
  }

  if (button2Active == true) {
    if (button2State == HIGH || button2Selected == true) {
      digitalWrite(led2Pin, HIGH);
    } else {
      digitalWrite(led2Pin, LOW);
    }
  }

  if (button3Active == true) {
    if (button3State == HIGH || button3Selected == true) {
      digitalWrite(led3Pin, HIGH);
    } else {
      digitalWrite(led3Pin, LOW);
    }
  }

  if (button4Active == true) {
    if (button4State == HIGH || button4Selected == true) {
      digitalWrite(led4Pin, HIGH);
    } else {
      digitalWrite(led4Pin, LOW);
    }
  }
  
  // send button status
  writeBuffer = String(button1Active) + String(button1State) + String(button1Selected)
                + String(button2Active) + String(button2State) + String(button2Selected)
                + String(button3Active) + String(button3State) + String(button3Selected)
                + String(button4Active) + String(button4State) + String(button4Selected);
  Serial.println(writeBuffer);
}
