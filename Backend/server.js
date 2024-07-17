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
        const { latitude, longitude } = req.query;

        // Validate latitude and longitude
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

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
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m,relative_humidity_2m,rain,evapotranspiration`;

        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}
