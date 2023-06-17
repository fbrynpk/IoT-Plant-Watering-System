#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#include <DHT_U.h>
DHT dht(D4, DHT11);

// Update with your Wi-Fi credentials
const char* ssid = "Pescadores";
const char* password = "penghunumber1";

// Update with your Cloud Run service URL
const char* cloudRunURL = "https://sensor-data-7uy7quia7q-de.a.run.app";

//Sensor data variables
float temperature;
float humidity;
// Initialize sensor readings (replace with your own sensor code)
//float sensorValue = analogRead(A0);
//pinMode(D0,OUTPUT); //output pin for relay board, this will sent signal to the relay
//pinMode(A0,INPUT); //input pin coming from soil sensor

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
}


void loop() {
  // Add any additional logic or sensor readings here
  temperature = readTemperature();
  humidity = readHumidity();

  // Create JSON payload
  String payload = "{\"temperature\": " + String(temperature) + ", \"humidity\": " + String(humidity) + "}";

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

  //Delay before sending the next data
  delay(5000);

 // float sensorValue = analogRead(A0);
  //if(sensorValue > 1) // if water level is full then cut the relay 
 // {
 // digitalWrite(D0,HIGH); // low is to cut the relay
 // }
 // else if(sensorValue == 1)
 // {
 // digitalWrite(D0,LOW); //high to continue proving signal and water supply
  //}
}

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
