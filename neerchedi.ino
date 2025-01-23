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

void initializeFirebaseAndNTP() {
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    if (Firebase.signUp(&config, &auth, "", "")) {
        Serial.println("Firebase signup OK");
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
      // Serial.print("$$$$$$daysDifference: ");
      // Serial.println(daysDifference);
      // Serial.print("$$$$$$currentEpoch: ");
      // Serial.println(currentEpoch);
      // Serial.print("$$$$$$lastUpdatedEpoch: ");
      // Serial.println(lastUpdatedEpoch);
      if (daysDifference >= intervalDays) {
        unsigned long oldEpoch = lastUpdatedEpoch;
        lastUpdatedEpoch = currentEpoch;
        Serial.println("Desired interval reached. Updating the date...");
        printOldAndNewDates(oldEpoch, currentEpoch);
      } else {
        Serial.print("Days since last update: ");
        Serial.println(daysDifference);
      }
      delay(500);
    }

    void printOldAndNewDates(unsigned long oldEpoch, unsigned long currentEpoch) {
      Serial.print("@@@@@   old epoch: ");
      Serial.println(oldEpoch);
      if (oldEpoch == 0 || currentEpoch == 0) {
        Serial.println("Epoch time is not initialized properly.");
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

      Serial.print("Old Date: ");
      Serial.println(oldDate);
      Serial.print("Old Time: ");
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

      Serial.print("New Date: ");
      Serial.println(newDate);
      Serial.print("New Time: ");
      Serial.println(newTime);
    }

    unsigned long getDaysDifference() {
      return daysDifference;
    }

    unsigned long getlastUpdatedEpoch(){
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
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print("...");
  }
  Serial.println();
  Serial.println("Initializing Firebase...");
  initializeFirebaseAndNTP();
  Serial.println("Connected to WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  timeClient.begin();
  timeClient.update();
  
  
  if (lastUpdatedEpoch == 0) {
    lastUpdatedEpoch = currentEpoch;
    Serial.println("First time update - setting the last updated date.");
  }

  // Test network connectivity first
  Serial.println("Testing network connectivity...");
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi still connected");
    Serial.print("Signal strength (RSSI): ");
    Serial.println(WiFi.RSSI());
  } else {
    Serial.println("WiFi connection lost!");
    return;
  }
  Serial.println("Configuring Firebase...");
  Serial.println("Beginning Firebase connection...");
  unsigned long oldEpoch = lastUpdatedEpoch;
  lastUpdatedEpoch = currentEpoch;
}

void phval() {
  phsensorval = analogRead(phsensor);
  volts = phsensorval * (5.0 / 1023);
  ph = 3.5 * volts + 0.5;
  Serial.print("pH: ");
  Serial.println(ph, 1);
  delay(100);
}

void phmanage() {
  phval();
  
  if (ph > 6.5) {
    Serial.println("pH is high, acidifying medium");
    digitalWrite(acid, HIGH);
    delay(1000);
    digitalWrite(acid, LOW);
  } 
  else if (ph < 5.5) {
    Serial.println("pH is low, alkalizing medium");
    digitalWrite(base, HIGH);
    delay(1000);
    digitalWrite(base, LOW);
  } 
  else {
    Serial.println("pH is okay");
  }
}

void nutrient(int bloom_time, int nutes_time, int greens_time) {
  daydiff1.checkAndUpdateDate(currentEpoch);
  unsigned long daysDifference = daydiff1.getDaysDifference();
  
  if(daysDifference >= nutridaydiff) {
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
  if(Firebase.ready()){
    if(Firebase.setInt(fbdo, "/hydroponics/bloom_time", bloom_time) && 
      Firebase.setInt(fbdo, "/hydroponics/nutes_time", nutes_time) && 
      Firebase.setInt(fbdo, "/hydroponics/greens_time", greens_time) && 
      Firebase.setFloat(fbdo, "/hydroponics/ph", ph) &&
      Firebase.setString(fbdo, "/hydroponics/state", state) &&
      Firebase.setInt(fbdo, "/hydroponics/time/nutrients/lastUpdatedEpoch", daydiff1.getlastUpdatedEpoch()) &&
      Firebase.setInt(fbdo, "/hydroponics/time/nutrients/currentEpoch", currentEpoch))  
    {
      Serial.println("Data sent to Firebase successfully");
    } 
    else 
    {
      Serial.println("Failed to send data to Firebase");
      Serial.println("Reason: " + fbdo.errorReason());
    }
  }
  delay(500);
}

void receiveDataFromFirebase() { 
    if(Firebase.getInt(fbdo, "/hydroponics/bloom_time")) {
      if(fbdo.dataType() == "int") {
        bloom_time = fbdo.intData();
        Serial.print("Received bloom_time: ");
        Serial.println(bloom_time);
      }
    }

    if(Firebase.getInt(fbdo, "/hydroponics/nutes_time")) {
      if(fbdo.dataType() == "int") {
        nutes_time = fbdo.intData();
        Serial.print("Received nutes_time: ");
        Serial.println(nutes_time);
      }
    }

    if(Firebase.getInt(fbdo, "/hydroponics/greens_time")) {
      if(fbdo.dataType() == "int") {
        greens_time = fbdo.intData();
        Serial.print("Received greens_time: ");
        Serial.println(greens_time);
      }
    }

    
    if(Firebase.getInt(fbdo, "/hydroponics/time/nutrients/lastUpdatedEpoch")) {
      if(fbdo.dataType() == "int") {
        lastUpdatedEpoch = fbdo.intData();
        daydiff1.setLastUpdatedEpoch(lastUpdatedEpoch);
        Serial.print("Received lastUpdatedEpoch: ");
        Serial.println(lastUpdatedEpoch);
      }
    }
}

void updating_check(){
  String updating = "false";
  if(Firebase.getString(fbdo, "/hydroponics/updating")){
    if(fbdo.dataType() == "string"){
      updating = fbdo.stringData();
      if(updating == "true"){
        delay(100);
        Serial.println("Updating values");     
      }      
      else if(updating == "false"){
        sendDataToFirebase();    
      }
    }
  }
}

void manageState() {
  if (state == "off") {
    delay(1000);  
    return;
  } 
  else {
    timeClient.update();
    phmanage();
    updating_check();
  }
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi connection lost!");
        delay(1000);
        ESP.restart();
        return;
    }
    
    if (!signupOK || !Firebase.ready()) {
        Serial.println("Firebase not ready!");
        delay(1000);
        return; 
    }
    receiveDataFromFirebase();  
    delay(100);
    currentEpoch = timeClient.getEpochTime();
    daydiff1.printOldAndNewDates(lastUpdatedEpoch, currentEpoch);
    delay(1000);
    daydiff1.checkAndUpdateDate(currentEpoch);
    manageState();
}
