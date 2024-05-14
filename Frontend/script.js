// Function to clear the page content
function clearPage() {
    document.getElementById('cityName').textContent = '';
    document.getElementById('errorContainer').innerHTML = '';
    document.getElementById('irrigationPattern').textContent = ' ';
    document.getElementById('oneDayTableContainer').innerHTML = '';
}

// Function to handle form submission
function submitForm(event) {
    if (event) {
        event.preventDefault(); // Prevent form submission
    }

    // Clear the page
    clearPage();

    // Get form values
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const cropType = document.getElementById('cropType').value;

    // Send form data to the server
    axios.get('http://localhost:3000/weather', {
        params: {
            latitude: latitude,
            longitude: longitude,
            cropType: cropType
        }
    })
    .then(response => {
        // Handle response from server (weather data)
        const weatherData = response.data;
        const irrigationPattern = analyzeForecast(weatherData);
        displayIrrigationPattern(irrigationPattern);
        displayWeatherData(weatherData, latitude, longitude);
        createWeatherChart(weatherData); // Add weather chart visualization
    })
    .catch(error => {
        console.error('Error fetching weather data:', error);
        displayError('Error fetching weather data. Please try again later.');
    });
}

// Function to display weather data on the webpage
function displayWeatherData(weatherData, latitude, longitude) {
    const oneDayTableContainer = document.getElementById('oneDayTableContainer');
    const cityName = document.getElementById('cityName');

    // Clear previous weather data, if any
    oneDayTableContainer.innerHTML = '';
    cityName.innerHTML = '';

    // Display city name
    axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
    .then(response => {
        const city = response.data.locality;
        cityName.textContent = `Forecast for ${city}`;
    })
    .catch(error => {
        console.error('Error fetching city name:', error);
        displayError('Error fetching city name. Please try again later.');
    });

    const table = createWeatherTable(weatherData);
    const scrollableContainer = document.createElement('div');
    scrollableContainer.classList.add('table-responsive', 'scrollable-table');
    scrollableContainer.appendChild(table);
    oneDayTableContainer.appendChild(scrollableContainer);
}

// Function to display irrigation pattern suggestion
function displayIrrigationPattern(irrigationPattern) {
    const irrigationPatternContainer = document.getElementById('irrigationPattern');
    if (irrigationPatternContainer) {
        irrigationPatternContainer.textContent = `Recommended Irrigation Pattern: ${irrigationPattern}`;
    } else {
        console.error('Irrigation pattern container not found in the DOM.');
    }
}

// Function to create a weather table
function createWeatherTable(weatherData) {
    const table = document.createElement('table');
    table.classList.add('table');

    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th>Time</th>
            <th>Temperature (°C)</th>
            <th>Humidity (%)</th>
            <th>Precipitation Probability (%)</th>
            <th>Evapotranspiration</th>
            <th>Wind Speed (m/s)</th>
            <th>Wind Direction (°)</th>
            <th>Soil Temperature (0 cm)</th>
            <th>Soil Temperature (6 cm)</th>
            <th>Soil Temperature (18 cm)</th>
            <th>Soil Temperature (54 cm)</th>
            <th>Soil Moisture (0-1 cm)</th>
            <th>Soil Moisture (1-3 cm)</th>
            <th>Soil Moisture (3-9 cm)</th>
            <th>Soil Moisture (9-27 cm)</th>
            <th>Soil Moisture (27-81 cm)</th>
        </tr>
    `;
    table.appendChild(tableHeader);

    // Create table body
    const tableBody = document.createElement('tbody');
    weatherData.hourly.time.forEach((time, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateTime(time)}</td>
            <td>${weatherData.hourly.temperature_2m[index]}</td>
            <td>${weatherData.hourly.relative_humidity_2m[index]}</td>
            <td>${weatherData.hourly.precipitation_probability[index]}</td>
            <td>${weatherData.hourly.evapotranspiration[index]}</td>
            <td>${weatherData.hourly.wind_speed_10m[index]}</td>
            <td>${weatherData.hourly.wind_direction_10m[index]}</td>
            <td>${weatherData.hourly.soil_temperature_0cm[index]}</td>
            <td>${weatherData.hourly.soil_temperature_6cm[index]}</td>
            <td>${weatherData.hourly.soil_temperature_18cm[index]}</td>
            <td>${weatherData.hourly.soil_temperature_54cm[index]}</td>
            <td>${weatherData.hourly.soil_moisture_0_to_1cm[index]}</td>
            <td>${weatherData.hourly.soil_moisture_1_to_3cm[index]}</td>
            <td>${weatherData.hourly.soil_moisture_3_to_9cm[index]}</td>
            <td>${weatherData.hourly.soil_moisture_9_to_27cm[index]}</td>
            <td>${weatherData.hourly.soil_moisture_27_to_81cm[index]}</td>
        `;
        tableBody.appendChild(row);
    });
    table.appendChild(tableBody);

    return table;
}

// Function to format date and time
function formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    return formattedDate;
}

// Function to display error message
function displayError(message) {
    clearPage(); // Clear the page
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    errorMessage.classList.add('text-danger');
    document.getElementById('errorContainer').appendChild(errorMessage);
}

// Function to analyze weather forecast data and suggest irrigation pattern
function analyzeForecast(weatherData) {
    // Get relevant weather data
    const precipitation = weatherData.hourly.precipitation_probability; 
    const temperature = weatherData.hourly.temperature_2m; 
    const humidity = weatherData.hourly.relative_humidity_2m; 
    const soilMoisture = weatherData.hourly.soil_moisture_0_to_1cm; 

    // Define irrigation patterns and their conditions
    const irrigationPatterns = [
        { pattern: "Biweekly irrigation (every 3 days)", 
          condition: () => precipitation.every(value => value < 20) &&
                         temperature.every(value => value > 25) &&
                         humidity.every(value => value < 70) &&
                         soilMoisture.every(value => value < 50) 
        },
        { pattern: "Weekly irrigation (every 7 days)", 
          condition: () => precipitation.every(value => value < 30) &&
                         temperature.every(value => value > 20) &&
                         humidity.every(value => value < 60) &&
                         soilMoisture.every(value => value < 60) 
        },
        { pattern: "Twice a week irrigation (every 3-4 days)", 
          condition: () => precipitation.every(value => value < 40) &&
                         temperature.every(value => value > 18) &&
                         humidity.every(value => value < 65) &&
                         soilMoisture.every(value => value < 70) 
        },
    ];
    const suggestedPattern = irrigationPatterns.find(pattern => pattern.condition());
    if (suggestedPattern) {
        return suggestedPattern.pattern;
    } else {
        return "Standard irrigation pattern";
    }
}

// Function to create weather chart
function createWeatherChart(weatherData) {
    const existingChart = Chart.getChart('weatherChart');
    if (existingChart) {
        existingChart.destroy();
    }
    const ctx = document.getElementById('weatherChart').getContext('2d');
    const timeLabels = weatherData.hourly.time.map(time => formatDateTime(time));
    const temperatureData = weatherData.hourly.temperature_2m;
    const humidityData = weatherData.hourly.relative_humidity_2m;
    const precipitationData = weatherData.hourly.precipitation_probability;

    const weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: 'Temperature (°C)',
                yAxisID: 'temperature',
                borderColor: 'rgb(255, 99, 132)',
                data: temperatureData
            }, {
                label: 'Humidity (%)',
                yAxisID: 'humidity',
                borderColor: 'rgb(54, 162, 235)',
                data: humidityData
            }, {
                label: 'Precipitation Probability (%)',
                yAxisID: 'precipitation',
                borderColor: 'rgb(75, 192, 192)',
                data: precipitationData
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    id: 'temperature',
                    type: 'linear',
                    position: 'left',
                    scaleLabel: {
                        display: true,
                        labelString: 'Temperature (°C)'
                    }
                }, {
                    id: 'humidity',
                    type: 'linear',
                    position: 'right',
                    scaleLabel: {
                        display: true,
                        labelString: 'Humidity (%)'
                    }
                }, {
                    id: 'precipitation',
                    type: 'linear',
                    position: 'right',
                    scaleLabel: {
                        display: true,
                        labelString: 'Precipitation Probability (%)'
                    }
                }]
            }
        }
    });
}

// Function to get user's location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                document.getElementById('latitude').value = latitude;
                document.getElementById('longitude').value = longitude;
            },
            error => {
                console.error('Error getting location:', error);
                displayError('Error getting location. Please try again or enter manually.');
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        displayError('Geolocation is not supported by this browser.');
    }
}

// Add event listeners
document.getElementById('getLocationBtn').addEventListener('click', getLocation);
document.getElementById('farmDetailsForm').addEventListener('submit', submitForm);
