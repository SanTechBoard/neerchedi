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
#define bloom 4
#define nutes 5
#define greens 18
#define inlet 13
#define outlet 12

void setup() {
  Serial.begin(115200);  // Initialize serial communication at 115200 baud rate
  
  // Set pins as output
  pinMode(bloom, OUTPUT);
  pinMode(nutes, OUTPUT);
  pinMode(greens, OUTPUT);
  pinMode(inlet, OUTPUT);
  pinMode(outlet, OUTPUT);
}

void loop() {
  // Check if data is available to read
  if (Serial.available()) {
    String incomingData = Serial.readStringUntil('\n'); // Read the incoming data until newline

    // Print the received data for debugging
    Serial.print("Received Data: ");
    Serial.println(incomingData);

    // Parse manual control states
    if (incomingData.indexOf("manual_greens:") >= 0) {
      int startIndex = incomingData.indexOf("manual_greens:") + 14;
      String value = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      manualGreens = (value == "1");
      digitalWrite(greens, manualGreens ? HIGH : LOW);
    }

    if (incomingData.indexOf("manual_nutes:") >= 0) {
      int startIndex = incomingData.indexOf("manual_nutes:") + 13;
      String value = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      manualNutes = (value == "1");
      digitalWrite(nutes, manualNutes ? HIGH : LOW);
    }

    if (incomingData.indexOf("manual_blooms:") >= 0) {
      int startIndex = incomingData.indexOf("manual_blooms:") + 14;
      String value = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      manualBlooms = (value == "1");
      digitalWrite(bloom, manualBlooms ? HIGH : LOW);
    }

    if (incomingData.indexOf("manual_inlet:") >= 0) {
      int startIndex = incomingData.indexOf("manual_inlet:") + 13;
      String value = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      manualInlet = (value == "1");
      digitalWrite(inlet, manualInlet ? HIGH : LOW);
    }

    if (incomingData.indexOf("manual_outlet:") >= 0) {
      int startIndex = incomingData.indexOf("manual_outlet:") + 14;
      String value = incomingData.substring(startIndex);
      manualOutlet = (value == "1");
      digitalWrite(outlet, manualOutlet ? HIGH : LOW);
    }

    // Parse other existing values
    if (incomingData.indexOf("bloom_time:") >= 0) {
      int startIndex = incomingData.indexOf("bloom_time:") + 11;
      String bloomTimeValue = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      bloom_time = bloomTimeValue.toInt();
      Serial.print("Received bloom_time: ");
      Serial.println(bloom_time);
    }

    if (incomingData.indexOf("nutes_time:") >= 0) {
      int startIndex = incomingData.indexOf("nutes_time:") + 11;
      String nutesTimeValue = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      nutes_time = nutesTimeValue.toInt();
      Serial.print("Received nutes_time: ");
      Serial.println(nutes_time);
    }

    if (incomingData.indexOf("greens_time:") >= 0) {
      int startIndex = incomingData.indexOf("greens_time:") + 12;
      String greensTimeValue = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      greens_time = greensTimeValue.toInt();
      Serial.print("Received greens_time: ");
      Serial.println(greens_time);
    }

    if (incomingData.indexOf("ph:") >= 0) {
      int startIndex = incomingData.indexOf("ph:") + 3;
      String phValue = incomingData.substring(startIndex, incomingData.indexOf(",", startIndex));
      ph = phValue.toFloat();
      Serial.print("Received pH: ");
      Serial.println(ph);
    }

    if (incomingData.indexOf("state:") >= 0) {
      int startIndex = incomingData.indexOf("state:") + 6;
      String stateValue = incomingData.substring(startIndex);
      state = stateValue;
      Serial.print("Received state: ");
      Serial.println(state);
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
  delay(100);  
}
