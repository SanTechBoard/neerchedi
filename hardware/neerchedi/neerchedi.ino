#include <WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#include <TimeLib.h>
#include <FirebaseESP32.h>
#include "top_secret.h"
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define phsensor 2
#define bloom 4
#define nutes 5
#define greens 18
#define acid 19
#define base 21
#define inlet 13
#define outlet 12 //solenoid valve

int bloom_time;
int nutes_time;
int greens_time;
int phsensorval;
bool activate = false;
int nutridaydiff = 1;
float volts;
float ph;
String state = "on";
bool signupOK = false;

const char* ntpServer = "time.nist.gov";
const long gmtOffset_sec = 19800;
const int daylightOffset_sec = 0;
WiFiUDP udp;
NTPClient timeClient(udp, ntpServer, gmtOffset_sec, 60000);
unsigned long lastUpdatedEpoch = 0;
unsigned long currentEpoch = 0;
unsigned long daysDifference = 0;

// Firebase setup
FirebaseData fbdo;
FirebaseConfig config;
FirebaseAuth auth;

// Add these variables at the top with other global variables
bool manualGreens = false;
bool manualNutes = false;
bool manualBlooms = false;
bool manualInlet = false;
bool manualOutlet = false;

void initializeFirebaseAndNTP() {
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    if (Firebase.signUp(&config, &auth, "", "")) {
        Serial.println(F("Firebase signup OK"));
        signupOK = true;
    }
    config.token_status_callback = tokenStatusCallback;  // Now this will work
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    timeClient.begin();
}

class DateUpdater {
  private:
    unsigned long lastUpdatedEpoch;
    unsigned long intervalDays;
    unsigned long daysDifference;

  public:
    DateUpdater(unsigned long interval) {
      lastUpdatedEpoch = 0;
      intervalDays = interval;
      daysDifference = 0;
    }

    void checkAndUpdateDate(unsigned long currentEpoch) {
      daysDifference = (currentEpoch - lastUpdatedEpoch) / 86400;
      if (daysDifference >= intervalDays) {
        unsigned long oldEpoch = lastUpdatedEpoch;
        lastUpdatedEpoch = currentEpoch;
        Serial.println(F("Desired interval reached. Updating the date..."));
        printOldAndNewDates(oldEpoch, currentEpoch);
      } else {
        Serial.print(F("Days since last update: "));
        Serial.println(daysDifference);
      }
      delay(500);
    }

    void printOldAndNewDates(unsigned long oldEpoch, unsigned long currentEpoch) {
      Serial.print(F("@@@@@   old epoch: "));
      Serial.println(oldEpoch);                         
      if (oldEpoch == 0 || currentEpoch == 0) {
        Serial.println(F("Epoch time is not initialized properly."));
        return;
      }

      tmElements_t oldTm;
      breakTime(oldEpoch, oldTm);
      String oldTmyear = String(oldTm.Year + 1970);
      String oldTmmonth = String(oldTm.Month);
      String oldTmday = String(oldTm.Day);
      String oldTmhour = String(oldTm.Hour);
      String oldTmminute = String(oldTm.Minute);
      String oldTmsecond = String(oldTm.Second);
      String oldDate = oldTmday + "/" + oldTmmonth + "/" + oldTmyear;
      String oldTime = oldTmhour + ":" + oldTmminute + ":" + oldTmsecond;

      Serial.print(F("Old Date: "));
      Serial.println(oldDate);
      Serial.print(F("Old Time: "));
      Serial.println(oldTime);

      tmElements_t newTm;
      breakTime(currentEpoch, newTm);
      String newTmyear = String(newTm.Year + 1970);
      String newTmmonth = String(newTm.Month);
      String newTmday = String(newTm.Day);
      String newTmhour = String(newTm.Hour);
      String newTmminute = String(newTm.Minute);
      String newTmsecond = String(newTm.Second);
      String newDate = newTmday + "/" + newTmmonth + "/" + newTmyear;
      String newTime = newTmhour + ":" + newTmminute + ":" + newTmsecond;

      Serial.print(F("New Date: "));
      Serial.println(newDate);
      Serial.print(F("New Time: "));
      Serial.println(newTime);
    }

    unsigned long getDaysDifference() {
      return daysDifference;
    }

    unsigned long getLastUpdatedEpoch() {
      return lastUpdatedEpoch;
    }

    void setLastUpdatedEpoch(unsigned long epoch) {
      lastUpdatedEpoch = epoch;  
    }
};

DateUpdater daydiff1(nutridaydiff);

void setup() {
  // Set pins as output
  pinMode(phsensor, OUTPUT);
  pinMode(bloom, OUTPUT);
  pinMode(nutes, OUTPUT);
  pinMode(greens, OUTPUT);
  pinMode(acid, OUTPUT);
  pinMode(base, OUTPUT);
  pinMode(inlet, OUTPUT);
  pinMode(outlet, INPUT);
  
  Serial.begin(115200);
  
  // Connect to Wi-Fi
  Serial.println(F("Connecting to WiFi..."));
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(F("..."));
  }
  Serial.println();
  Serial.println(F("Initializing Firebase..."));
  initializeFirebaseAndNTP();
  Serial.println(F("Connected to WiFi!"));
  Serial.print(F("IP Address: "));
  Serial.println(WiFi.localIP());

  timeClient.begin();
  timeClient.update();
  
  currentEpoch = timeClient.getEpochTime();  // Get the current epoch time from NTP
  if (lastUpdatedEpoch == 0) {
    lastUpdatedEpoch = currentEpoch; // Set it initially when it's 0
    Serial.println(F("First time update - setting the last updated date."));
  }

  // Test network connectivity first
  Serial.println(F("Testing network connectivity..."));
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("WiFi still connected"));
    Serial.print(F("Signal strength (RSSI): "));
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println(F("WiFi connection lost!"));
    return;
  }
  Serial.println(F("Configuring Firebase..."));
  Serial.println(F("Beginning Firebase connection..."));
  unsigned long oldEpoch = lastUpdatedEpoch;
  lastUpdatedEpoch = currentEpoch;
}

void phval() {
  phsensorval = analogRead(phsensor);
  volts = phsensorval * (5.0 / 1023);
  ph = 3.5 * volts + 0.5;
  Serial.print(F("pH: "));
  Serial.println(ph, 1);
  delay(100);
}

void phmanage() {
  phval();
  
  if (ph > 6.5) {
    Serial.println(F("pH is high, acidifying medium"));
    digitalWrite(acid, HIGH);
    delay(1000);
    digitalWrite(acid, LOW);
  } 
  else if (ph < 5.5) {
    Serial.println(F("pH is low, alkalizing medium"));
    digitalWrite(base, HIGH);
    delay(1000);
    digitalWrite(base, LOW);
  } 
  else {
    Serial.println(F("pH is okay"));
  }
}

void nutrient(int bloom_time, int nutes_time, int greens_time) {
  daydiff1.checkAndUpdateDate(currentEpoch);
  unsigned long daysDifference = daydiff1.getDaysDifference();
  
  if (daysDifference >= nutridaydiff) {
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
  delay(500);
}

void sendDataToFirebase() {
  if (Firebase.ready()) {
    if (Firebase.setInt(fbdo, "/hydroponics/bloom_time", bloom_time) &&
        Firebase.setInt(fbdo, "/hydroponics/nutes_time", nutes_time) &&
        Firebase.setInt(fbdo, "/hydroponics/greens_time", greens_time) &&
        Firebase.setFloat(fbdo, "/hydroponics/ph", ph) &&
        Firebase.setString(fbdo, "/hydroponics/state", state) &&
        Firebase.setInt(fbdo, "/hydroponics/time/nutrients/lastUpdatedEpoch", daydiff1.getLastUpdatedEpoch()) &&
        Firebase.setInt(fbdo, "/hydroponics/time/nutrients/currentEpoch", currentEpoch)) {
      
      // Update pump states
      Firebase.setBool(fbdo, "/controls/greensPump", manualGreens);
      Firebase.setBool(fbdo, "/controls/nutesPump", manualNutes);
      Firebase.setBool(fbdo, "/controls/bloomsPump", manualBlooms);
      
      Serial.println(F("Data sent to Firebase successfully"));
    } else {
      Serial.println(F("Failed to send data to Firebase"));
      Serial.println("Reason: " + fbdo.errorReason());
    }
  }
  delay(500);
}

void receiveDataFromFirebase() {
  // Existing timing data
  if (Firebase.getInt(fbdo, "/hydroponics/bloom_time")) {
    if (fbdo.dataType() == "int") {
      bloom_time = fbdo.intData();
      Serial.print(F("Received bloom_time: "));
      Serial.println(bloom_time);
    }
  }

  if (Firebase.getInt(fbdo, "/hydroponics/nutes_time")) {
    if (fbdo.dataType() == "int") {
      nutes_time = fbdo.intData();
      Serial.print(F("Received nutes_time: "));
      Serial.println(nutes_time);
    }
  }

  if (Firebase.getInt(fbdo, "/hydroponics/greens_time")) {
    if (fbdo.dataType() == "int") {
      greens_time = fbdo.intData();
      Serial.print(F("Received greens_time: "));
      Serial.println(greens_time);
    }
  }

  if (Firebase.getInt(fbdo, "/hydroponics/time/nutrients/lastUpdatedEpoch")) {
    if (fbdo.dataType() == "int") {
      lastUpdatedEpoch = fbdo.intData();
      daydiff1.setLastUpdatedEpoch(lastUpdatedEpoch);
      Serial.print(F("Received lastUpdatedEpoch: "));
      Serial.println(lastUpdatedEpoch);
    }
  }

  // Add manual control state retrieval
  if (Firebase.getBool(fbdo, "/controls/greens")) {
    if (fbdo.dataType() == "boolean") {
      manualGreens = fbdo.boolData();
      Serial.print(F("Received manualGreens: "));
      Serial.println(manualGreens);
      // Update pump status back to Firebase
      Firebase.setBool(fbdo, "/controls/greensPump", manualGreens);
    }
  }

  if (Firebase.getBool(fbdo, "/controls/nutes")) {
    if (fbdo.dataType() == "boolean") {
      manualNutes = fbdo.boolData();
      Serial.print(F("Received manualNutes: "));
      Serial.println(manualNutes);
      // Update pump status back to Firebase
      Firebase.setBool(fbdo, "/controls/nutesPump", manualNutes);
    }
  }

  if (Firebase.getBool(fbdo, "/controls/blooms")) {
    if (fbdo.dataType() == "boolean") {
      manualBlooms = fbdo.boolData();
      Serial.print(F("Received manualBlooms: "));
      Serial.println(manualBlooms);
      // Update pump status back to Firebase
      Firebase.setBool(fbdo, "/controls/bloomsPump", manualBlooms);
    }
  }

  if (Firebase.getBool(fbdo, "/controls/inlet")) {
    if (fbdo.dataType() == "boolean") {
      manualInlet = fbdo.boolData();
      Serial.print(F("Received manualInlet: "));
      Serial.println(manualInlet);
    }
  }

  if (Firebase.getBool(fbdo, "/controls/outlet")) {
    if (fbdo.dataType() == "boolean") {
      manualOutlet = fbdo.boolData();
      Serial.print(F("Received manualOutlet: "));
      Serial.println(manualOutlet);
    }
  }
}

void updating_check() {
  String updating = "false";
  if (Firebase.getString(fbdo, "/hydroponics/updating")) {
    if (fbdo.dataType() == "string") {
      updating = fbdo.stringData();
      if (updating == "true") {
        delay(100);
        Serial.println(F("Updating values"));
      } else if (updating == "false") {
        sendDataToFirebase();
      }
    }
  }
}

void manageState() {
  if (state == "off") {
    delay(1000);
    return;
  } else {
    timeClient.update();
    phmanage();
    updating_check();
    sendDataToFirebase();
    sendDataToArduino();
    activate = false;
  }
}

void sendDataToArduino() {
  // Send timing data in the format: T:bloom_time,greens_time,nutes_time,ph,state,activate
  Serial.print(F("T:"));
  Serial.print(bloom_time);
  Serial.print(F(","));
  Serial.print(greens_time);
  Serial.print(F(","));
  Serial.print(nutes_time);
  Serial.print(F(","));
  Serial.print(ph, 1);  // send the pH value with 1 decimal place
  Serial.print(F(","));
  Serial.print(state);
  Serial.print(F(","));
  Serial.println(activate ? "1" : "0");

  // Send manual control data in the format: M:greens,nutes,blooms,inlet,outlet
  Serial.print(F("M:"));
  Serial.print(manualGreens ? "1" : "0");
  Serial.print(F(","));
  Serial.print(manualNutes ? "1" : "0");
  Serial.print(F(","));
  Serial.print(manualBlooms ? "1" : "0");
  Serial.print(F(","));
  Serial.print(manualInlet ? "1" : "0");
  Serial.print(F(","));
  Serial.println(manualOutlet ? "1" : "0");

  // Reset timing values
  bloom_time = 0;
  greens_time = 0;
  nutes_time = 0;
  sendDataToFirebase();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(F("WiFi connection lost!"));
    delay(1000);
    ESP.restart();
    return;
  }

  if (!signupOK || !Firebase.ready()) {
    Serial.println(F("Firebase not ready!"));
    delay(1000);
    return;
  }
  
  receiveDataFromFirebase();
  delay(100);
  
  currentEpoch = timeClient.getEpochTime();
  daydiff1.checkAndUpdateDate(currentEpoch);  // Update the date

  delay(1000);
  daydiff1.printOldAndNewDates(lastUpdatedEpoch, currentEpoch);
  manageState();
}
