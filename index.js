const express = require('express');
const app = express();
const { Storage } = require('@google-cloud/storage');

// Replace with your Google Cloud Storage bucket name
const bucketName = 'soil-moisture-sensor-data';

// Middleware to parse JSON request body
app.use(express.json());

app.get('/data', (req, res) => {
  res.json(sensorData);
});

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
  const filename = `sensor-data-${Date.now()}.json`;

  // Create a new file in the specified bucket
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  // Define the sensor data as JSON
  const sensorData = JSON.stringify({ temperature, humidity, soil_moisture });

  // Write the sensor data to the file
  await file.save(sensorData, {
    contentType: 'application/json',
    gzip: true
  });

  console.log(`Sensor data saved to: gs://${bucketName}/${filename}`);
}

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
