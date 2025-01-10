import { createContext, useState, useEffect } from 'react';
import { fetchForecastData, fetchWeatherData } from './WeatherAPI.jsx';

// Create the context
export const WeatherContext = createContext({
    weather: null,
    city: '',
    hourlyForecast: [],
    dailyForecast: [],
    loading: true,
});

// eslint-disable-next-line react/prop-types
export const WeatherProvider = ({ children }) => {
    const [weather, setWeather] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState([]); // Store hourly data
    const [dailyForecast, setDailyForecast] = useState([]); // Store 5-day data
    const [city, setCity] = useState('Fetching location...');
    const [loading, setLoading] = useState(true);

    const getWeatherData = async (latitude, longitude) => {
        try {
            const data = await fetchWeatherData(latitude, longitude); // Pass them separately
            setWeather(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getForecastData = async (latitude, longitude) => {
        try {
            const data = await fetchForecastData(latitude, longitude);
            // Separate hourly data (every 3 hours) from the 5-day data
            const hourlyData = data.list.filter((_, index) => index % 1 === 0); // Hourly data
            const dailyData = data.list.filter((_, index) => index % 8 === 0).slice(0, 5); // 5-day data

            setHourlyForecast(hourlyData);
            setDailyForecast(dailyData);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
        }
    };

    const fetchCityByLocation = async (latitude, longitude) => {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            return data.city || 'Unknown Location';
        } catch (error) {
            console.error('Error fetching city data:', error);
            return 'Location unavailable';
        }
    };

    const getUserLocationAndWeather = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    let { latitude, longitude } = position.coords;

                    // Round latitude and longitude to 2 decimal places
                    latitude = parseFloat(latitude.toFixed(2));
                    longitude = parseFloat(longitude.toFixed(2));

                    const detectedCity = await fetchCityByLocation(latitude, longitude);
                    setCity(detectedCity);
                    await getWeatherData(latitude, longitude);
                    await getForecastData(latitude, longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setCity('Location permission denied');
                    setLoading(false);
                }
            );
        } else {
            console.error('Geolocation not supported');
            setCity('Geolocation not supported');
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserLocationAndWeather();
    }, []);

    return (
        <WeatherContext.Provider value={{ weather, city, loading, hourlyForecast, dailyForecast }}>
            {children}
        </WeatherContext.Provider>
    );
};
