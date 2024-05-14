# CropCare

CropCare is a web application designed to provide farmers with essential weather forecast information and irrigation pattern suggestions, aiding in optimized crop management. Developed as the final project submission for GHW-Data, CropCare aims to enhance agricultural practices through data-driven insights.

## Features

- **Weather Forecast**: Displays a comprehensive weather forecast, including temperature, humidity, and precipitation probability.
- **Irrigation Pattern Suggestions**: Analyzes forecast data to suggest irrigation patterns based on predefined conditions. (*Further enhancements needed for crop-specific recommendations*)
- **Customizable Crop Selection**: Users can choose their crop type, though it currently doesn't influence functionality.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (with Axios for HTTP requests, and Chart.js for visualization)
- **Backend**: Node.js (server.js not included in this repository)
- **External APIs**: OpenWeather API (weather data), BigDataCloud API (reverse geocoding)
- **Development Tools**: Visual Studio Code, Git

## Usage

1. **Clone the repository**: 
    ```bash
    git clone https://github.com/Loskoss/Cropcare.git
    ```
2. **Navigate to the project directory**: 
    ```bash
    cd CropCare
    ```
3. **Start the backend server**: 
    ```bash
    node backend/server.js
    ```
    Ensure Node.js is installed and dependencies are installed via npm or yarn.
4. **Open `index.html` in a web browser**.
5. **Enter the latitude and longitude** of the farm location.
6. **Select the crop type** from the dropdown menu (not currently utilized).
7. **Click on the "Get Location"** button to use the current location (optional).
8. **Click on the "Submit"** button to fetch weather data and irrigation pattern suggestions.
9. **View the weather forecast** and irrigation pattern displayed.

## Future Work

1. **Enhanced Crop Selection**: Implement crop-specific weather recommendations and irrigation patterns.
2. **User Accounts**: Enable user registration to save farm locations and preferences.
3. **Email Alerts**: Provide email notifications for weather forecast changes and irrigation recommendations.
4. **Historical Data Analysis**: Analyze historical weather data to offer long-term farming insights and trends.
5. **Crop Suggestion** : suggest crop based on historical data.

## Contributing

Contributions, suggestions, feature requests, and bug reports are encouraged. Please open an issue or submit a pull request.
