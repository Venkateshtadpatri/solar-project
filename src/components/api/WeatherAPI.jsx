import axios from 'axios';

const API_KEY = 'e1af6165d08f13c2590e5de12207488e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_URL_TWO = 'https://api.openweathermap.org/data/2.5/forecast/';
const cnt = 40;
/**
 * Fetches current weather data from openweathermap.org for the given
 * latitude and longitude.
 *
 * @param {number} latitude The latitude of the location.
 * @param {number} longitude The longitude of the location.
 * @returns {Promise<Object>} An object containing the weather data.
 * @throws {Error} If the latitude or longitude is invalid, or if the
 *                 request to the API fails.
 */
export const fetchWeatherData = async (latitude, longitude) => {
    try {
        if (!latitude || !longitude) {
            throw new Error('Invalid latitude or longitude');
        }
        const response = await axios.get(
            `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};



/**
 * Fetches the forecast weather data for the given latitude and longitude.
 *
 * @param {number} latitude The latitude of the location.
 * @param {number} longitude The longitude of the location.
 * @returns {Promise<Object>} An object containing the forecast weather data.
 * @throws {Error} If the latitude or longitude is invalid, or if the
 *                 request to the API fails.
 */
export const fetchForecastData = async (latitude, longitude) => {
    try {
        if (!latitude || !longitude) {
            throw new Error('Invalid latitude or longitude');
        }
        const response = await axios.get(
            `${BASE_URL_TWO}?lat=${latitude}&lon=${longitude}&cnt=${cnt}&appid=${API_KEY}&units=metric`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching forecast data:', error);
        throw error;
    }
};
