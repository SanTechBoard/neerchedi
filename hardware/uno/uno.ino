int bloom_time;
int nutes_time;
int greens_time;
float ph;
String state;
bool activate = false; // Default state of activate

// Manual control states
bool manualGreens = false;
bool manualNutes = false;
bool manualBlooms = false;
bool manualInlet = false;
bool manualOutlet = false;

// Pin definitions
#define bloom 2
#define nutes 3
#define greens 4
#define inlet 5
#define outlet 10
#define acid 6
#define base 8

#include <avr/wdt.h>

void setup() {
  Serial.begin(115200);  // Initialize serial communication at 115200 baud rate
  wdt_enable(WDTO_2S);
  
  // Set pins as output
  pinMode(bloom, OUTPUT);
  pinMode(nutes, OUTPUT);
  pinMode(greens, OUTPUT);
  pinMode(inlet, OUTPUT);
  pinMode(outlet, OUTPUT);
  pinMode(acid, OUTPUT);
  pinMode(base, OUTPUT);
  digitalWrite(bloom,HIGH);
  digitalWrite(nutes,HIGH);
  digitalWrite(greens,HIGH);
  digitalWrite(inlet,HIGH);
  digitalWrite(outlet,LOW);
}

void handleManualControls(String message) {
  // Remove the "M:" prefix
  message = message.substring(2);
  
  // Split the message into control states
  int firstComma = message.indexOf(',');
  int secondComma = message.indexOf(',', firstComma + 1);
  int thirdComma = message.indexOf(',', secondComma + 1);
  int fourthComma = message.indexOf(',', thirdComma + 1);
  
  // Extract and apply each control state
  manualGreens = message.substring(0, firstComma) == "1";
  manualNutes = message.substring(firstComma + 1, secondComma) == "1";
  manualBlooms = message.substring(secondComma + 1, thirdComma) == "1";
  manualInlet = message.substring(thirdComma + 1, fourthComma) == "1";
  manualOutlet = message.substring(fourthComma + 1) == "1";
  
  // Apply the control states to the pins
  digitalWrite(greens, manualGreens ? LOW : HIGH);
  digitalWrite(nutes, manualNutes ? LOW : HIGH);
  digitalWrite(bloom, manualBlooms ? LOW : HIGH);
  digitalWrite(inlet, manualInlet ? LOW : HIGH);
  digitalWrite(outlet, manualOutlet ? LOW : HIGH);
}

void handleTimingData(String message) {
  // Remove the "T:" prefix
  message = message.substring(2);
  
  // Split the message into components
  int firstComma = message.indexOf(',');
  int secondComma = message.indexOf(',', firstComma + 1);
  int thirdComma = message.indexOf(',', secondComma + 1);
  int fourthComma = message.indexOf(',', thirdComma + 1);
  int fifthComma = message.indexOf(',', fourthComma + 1);
  
  // Extract timing values
  bloom_time = message.substring(0, firstComma).toInt();
  greens_time = message.substring(firstComma + 1, secondComma).toInt();
  nutes_time = message.substring(secondComma + 1, thirdComma).toInt();
  ph = message.substring(thirdComma + 1, fourthComma).toFloat();
  state = message.substring(fourthComma + 1, fifthComma);
  activate = message.substring(fifthComma + 1) == "1";

  // Debug print
  Serial.println(F("Received timing data:"));
  Serial.println("Bloom time: " + String(bloom_time));
  Serial.println("Greens time: " + String(greens_time));
  Serial.println("Nutes time: " + String(nutes_time));
  Serial.println("pH: " + String(ph));
  Serial.println("State: " + state);
  Serial.println("Activate: " + String(activate));
}

void loop() {
  wdt_reset();
  // Check if data is available to read
  if (Serial.available()) {
    String incomingData = Serial.readStringUntil('\n');
    
    // Print the received data for debugging
    Serial.print(F("Received Data: "));
    Serial.println(incomingData);

    // Check message type and handle accordingly
    if (incomingData.startsWith("M:")) {
      handleManualControls(incomingData);
    }
    else if (incomingData.startsWith("T:")) {
      handleTimingData(incomingData);
    }
  }

  // Only run automated control if no manual controls are active
  if (activate && !manualGreens && !manualNutes && !manualBlooms) {
    digitalWrite(bloom, HIGH);
    delay(bloom_time);
    digitalWrite(bloom, LOW);
    digitalWrite(nutes, HIGH);
    delay(nutes_time);
    digitalWrite(nutes, LOW);
    digitalWrite(greens, HIGH);
    delay(greens_time);
    digitalWrite(greens, LOW);
  }
  
  activate = false;
  delay(1000);
}
