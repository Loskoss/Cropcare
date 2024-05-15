const express = require('express');
const app = express();
const axios = require('axios');
const open = require('open');
const cors = require('cors'); 
require('dotenv').config(); // Load environment variables from .env file
const port = process.env.PORT || 3000; 


app.use(cors());
app.use(express.static('public'));

app.get('/weather', async (req, res) => {
    try {
        // Get latitude and longitude from query parameters
        const latitude = req.query.latitude;
        const longitude = req.query.longitude;

        // Fetch weather data from Open-Meteo API
        const weatherData = await getWeatherData(latitude, longitude);

        // Send weather data as JSON response
        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

// Start the server and open the browser
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    open('Frontend/index.html').then(() => {
        console.log('Default browser opened');
    }).catch(err => {
        console.error('Error opening browser:', err);
    });
});

// Function to fetch weather data based on latitude and longitude
async function getWeatherData(latitude, longitude) {
    try {
        //const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&soil_temperature=0cm,6cm,18cm,54cm&soil_moisture=0-1cm,1-3cm,3-9cm,9-27cm,27-81cm`;
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,evapotranspiration,wind_speed_10m,wind_direction_10m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,soil_moisture_9_to_27cm,soil_moisture_27_to_81cm`;

        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}
