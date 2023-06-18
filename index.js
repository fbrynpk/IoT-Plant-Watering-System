const express = require('express');
const app = express();
const { Storage } = require('@google-cloud/storage');

// Replace with your Google Cloud Storage bucket name
const bucketName = 'soil-moisture-sensor-data';

// Middleware to parse JSON request body
app.use(express.json());
app.use(express.static('public'));

// Route to handle incoming sensor data
app.post('/', async (req, res) => {
  try {
    // Extract temperature and humidity from the request body
    const { temperature, humidity, soil_moisture } = req.body;

    // Store sensor data in Google Cloud Storage
    await storeSensorData(temperature, humidity, soil_moisture);

    // Send response
    res.status(200).send('Sensor data recorded successfully');
  } catch (error) {
    console.error('Error recording sensor data:', error);
    res.status(500).send('Error recording sensor data');
  }
});

// Function to store sensor data in Google Cloud Storage
async function storeSensorData(temperature, humidity, soil_moisture) {
  const storage = new Storage();

  // Generate a unique filename for each data entry
  const filename = `whole-data.txt`;
  
  // Create a new file in the specified bucket
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  // Define the sensor data as JSON
  const jsonTemperature = JSON.stringify(temperature);
  const jsonHumidity = JSON.stringify(humidity);
  const jsonSoil_moisture = JSON.stringify(soil_moisture);

  // Read existing file content
  let existingData = '';
  try {
    const [fileExists] = await file.exists();
    if (fileExists) {
      const [fileContent] = await file.download();
      existingData = fileContent.toString();
    }
  } catch (err) {
    console.error('Error reading existing file content:', err);
  }

  // Append new data to existing content
  const newData = "Temperature: " + jsonTemperature + "," + "Humidity: " + jsonHumidity + "," + "Soil Moisture:" + jsonSoil_moisture;
  const updatedData = newData + "\n"+ existingData;

  // Save the updated data to the file
  try {
    await file.save(updatedData);
    console.log('Data appended to file successfully');
  } catch (err) {
    console.error('Error saving data to file:', err);
  }

  // Send a response back
  res.send('Data received and stored successfully');
}

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
