const express = require('express');
const app = express();
const { Storage } = require('@google-cloud/storage');

// Replace with your Google Cloud Storage bucket name
const bucketName = 'soil-moisture-sensor-data';

// Middleware to parse JSON request body
app.use(express.json());
//app.use(express.static('public'));

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
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
  const filename = `sensor-data.json`;

  // Define the sensor data as JSON
  const sensorData = JSON.stringify({ temperature, humidity, soil_moisture });
  
  // Create a new file in the specified bucket
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);
  //Check if the file exists or not
  const exists = await file.exists();
  if(exists[0]){
    const currentData = await file.download();
    const existingData = JSON.parse(currentData.toString());
    const newData = {...existingData, ...data};
  }else{
    await file.save(sensorData)
  }

  // Write the sensor data to the file
  await file.save(sensorData, {
    contentType: 'application/json',
    gzip: true
  });

  console.log(`Sensor data saved to: gs://${bucketName}/${filename}`);
}

// Endpoint to handle GET requests
app.get('/', async (req, res) => {
  try {
    // Get the file reference
    const file = Storage.bucket(bucketName).file(fileName);

    // Download the file as a string
    const [content] = await file.download();

    // Parse the JSON content
    const sensorData = JSON.parse(content);

    // Send the sensor data as the response
    res.json(sensorData);
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
