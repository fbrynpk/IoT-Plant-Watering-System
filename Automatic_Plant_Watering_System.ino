#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#include <DHT_U.h>
#include <ArduinoJson.h>
DHT dht(D4, DHT11);

// Update with your Wi-Fi credentials
const char* ssid = "Pescadores";
const char* password = "penghunumber1";

// Update with your Cloud Run service URL
const char* cloudRunURL = "https://sensor-data-7uy7quia7q-de.a.run.app";

// JSON document size
const size_t JSON_DOC_SIZE = JSON_OBJECT_SIZE(4);

// Create a DynamicJsonDocument
DynamicJsonDocument jsonDoc(JSON_DOC_SIZE);

//Sensor data variables
float temperature;
float humidity;
// Initialize sensor readings
int soilMoisture = A0;
const int relayPin = D0;
const int moistureThreshold = 600;

float readTemperature() {
  // Read temperature from the DHT sensor
  float temperature = dht.readTemperature();

  // Check if any errors occurred during reading
  if (isnan(temperature)) {
    Serial.println("Failed to read temperature from the DHT sensor!");
    return -1; // Return an error value or handle the error as needed
  }
  return temperature;
}

float readHumidity() {
  // Read humidity from the DHT sensor
  float humidity = dht.readHumidity();

  // Check if any errors occurred during reading
  if (isnan(humidity)) {
    Serial.println("Failed to read humidity from the DHT sensor!");
    return -1; // Return an error value or handle the error as needed
  }
  return humidity;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");

  dht.begin();

  pinMode(soilMoisture, INPUT);
  pinMode(relayPin, OUTPUT); //Set relay pin as output
  digitalWrite(relayPin, LOW); //Set initial state to off
}


void loop() {
  // Add any additional logic or sensor readings here
  temperature = readTemperature();
  humidity = readHumidity();
  int soil_moisture = analogRead(soilMoisture);
  
  // Add the sensor data to the JSON document
  jsonDoc["temperature"] = temperature;
  jsonDoc["humidity"] = humidity;
  jsonDoc["soil_moisture"] = soil_moisture;

  String payload;
  serializeJson(jsonDoc, payload);
  Serial.println(payload);

  // Send sensor data to Cloud Run
  std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);
  client->setInsecure();
  HTTPClient https;
  https.begin(*client, cloudRunURL);
  https.addHeader("Content-Type", "application/json");

  int httpResponseCode = https.POST(payload);

  if (httpResponseCode == 200) {
    Serial.print("Data sent successfully\n");
  } else {
    Serial.print("Error sending data. HTTP Error code: ");
    Serial.println(httpResponseCode);
  }

  //Free resources
  https.end();

  if(soil_moisture > moistureThreshold) // if water level is low then give the relay power 
  {
   digitalWrite(relayPin,HIGH); // high is to give the relay power
   delay(5000);
   digitalWrite(relayPin, LOW); // low is to cut the relay
   Serial.println("Water Pump Turned On for 1 second");
  }
  //Delay before sending the next data
  delay(10000);
}