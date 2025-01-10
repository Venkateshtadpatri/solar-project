import axios from 'axios';

const API_KEY = 'e1af6165d08f13c2590e5de12207488e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const BASE_URL_TWO = 'https://api.openweathermap.org/data/2.5/forecast/';
const cnt = 40;
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
