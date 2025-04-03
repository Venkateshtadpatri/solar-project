import axios from 'axios';

/**
 * Fetches the weather data for the given location and date from the Visual Crossing
 * Weather API.
 *
 * @param {string} location The location to fetch weather data for. This should be a
 *     string in the format "latitude,longitude". For example, "37.7749,-122.4194"
 *     for San Francisco, California.
 * @param {string} date The date to fetch weather data for, in the format "YYYY-MM-DD".
 *     For example, "2022-07-25".
 *
 * @returns {Promise<Object[]>} A promise that resolves to an array of objects
 *     containing the weather data for each day in the given date range. Each object
 *     will have the following properties:
 *
 *     - `date`: The date of the weather data in the format "YYYY-MM-DDTHH:MM:SSZ"
 *     - `temperature`: The ambient temperature in degrees Celsius
 *     - `solarIrradiance`: The solar irradiance in Watts per square meter
 *     - `windSpeed`: The wind speed in meters per second
 *     - `humidity`: The humidity in percent
 *
 *     If an error occurs while fetching the weather data, the promise will be
 *     rejected with an error object.
 */
export const fetchWeatherData = async (location, date) => {
    const apiKey = 'HDABY7M2A2KC23AU6WJMVY7AM';
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${date}?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        // Extract relevant weather parameters
        const weatherData = data.days.map(day => ({
            date: day.datetime,
            temperature: day.temp, // Ambient Temperature (°C)
            solarIrradiance: day.solarradiation, // Solar Irradiance (W/m²)
            windSpeed: day.windspeed, // Wind Speed (m/s)
            humidity: day.humidity, // Humidity (%)
        }));

        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return [];
    }
};
