// Fetch the text file
fetch("https://soil-moisture-sensor-data.storage.googleapis.com/final-every-data.txt")
.then(response => response.text())
.then(data => {
  // Process the retrieved data
  const lines = data.split("\n").filter(line => line.trim() !== '');;
  const tableBody = document.getElementById("data-body");

  lines.forEach(line => {
    // Create a new table row
    const row = document.createElement("tr");
    const [temperature, humidity, soilMoisture] = line.split(',');
    // Create table cells for each data value
    const temperatureCell = document.createElement("td");
    temperatureCell.textContent = temperature;
    row.appendChild(temperatureCell);

    const humidityCell = document.createElement("td");
    humidityCell.textContent = humidity;
    row.appendChild(humidityCell);

    const soilMoistureCell = document.createElement("td");
    soilMoistureCell.textContent = soilMoisture;
    row.appendChild(soilMoistureCell);

    // Append the row to the table body
    tableBody.appendChild(row);
  });
})
.catch(error => {
  console.log("Error fetching sensor data:", error);
});