// Function to clear the page content
function clearPage() {
    document.getElementById('cityName').textContent = '';
    document.getElementById('errorContainer').innerHTML = '';
    document.getElementById('irrigationPattern').textContent = '';
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

    // Send form data to the server
    axios.get('http://localhost:3000/weather', {
        params: {
            latitude: latitude,
            longitude: longitude
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
            <th>Precipitation (mm)</th>
            <th>Evapotranspiration (mm)</th>
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
            <td>${weatherData.hourly.rain[index]}</td>
            <td>${weatherData.hourly.evapotranspiration[index]}</td>
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
    const precipitation = weatherData.hourly.rain; 
    const temperature = weatherData.hourly.temperature_2m; 
    const humidity = weatherData.hourly.relative_humidity_2m; 

    // Define irrigation patterns and their conditions
    const irrigationPatterns = [
        { pattern: "Biweekly irrigation (every 3 days)", 
          condition: () => precipitation.every(value => value < 20) &&
                         temperature.every(value => value > 25) &&
                         humidity.every(value => value < 70)
        },
        { pattern: "Weekly irrigation (every 7 days)", 
          condition: () => precipitation.every(value => value < 30) &&
                         temperature.every(value => value > 20) &&
                         humidity.every(value => value < 60)
        },
        { pattern: "Twice a week irrigation (every 3-4 days)", 
          condition: () => precipitation.some(value => value >= 30) ||
                         temperature.some(value => value < 20) ||
                         humidity.some(value => value >= 70)
        }
    ];

    // Determine the most suitable irrigation pattern
    const pattern = irrigationPatterns.find(p => p.condition());
    return pattern ? pattern.pattern : "No suitable irrigation pattern found";
}

// Function to create weather chart
function createWeatherChart(weatherData) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    const chartData = {
        labels: weatherData.hourly.time,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: weatherData.hourly.temperature_2m,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                yAxisID: 'temperature',
            },
            {
                label: 'Humidity (%)',
                data: weatherData.hourly.relative_humidity_2m,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                yAxisID: 'humidity',
            },
            {
                label: 'Precipitation (mm)',
                data: weatherData.hourly.rain,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'precipitation',
            }
        ]
    };

    const chartOptions = {
        scales: {
            temperature: {
                type: 'linear',
                position: 'left',
                ticks: {
                    beginAtZero: true,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Temperature (°C)',
                },
            },
            humidity: {
                type: 'linear',
                position: 'right',
                ticks: {
                    beginAtZero: true,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Humidity (%)',
                },
            },
            precipitation: {
                type: 'linear',
                position: 'left',
                ticks: {
                    beginAtZero: true,
                },
                scaleLabel: {
                    display: true,
                    labelString: 'Precipitation (mm)',
                },
            }
        }
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

// Event listeners
document.getElementById('farmDetailsForm').addEventListener('submit', submitForm);
document.getElementById('getLocationBtn').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            document.getElementById('latitude').value = position.coords.latitude;
            document.getElementById('longitude').value = position.coords.longitude;
            submitForm();
        });
    } else {
        displayError('Geolocation is not supported by this browser.');
    }
});
