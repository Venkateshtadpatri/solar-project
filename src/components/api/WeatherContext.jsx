import { createContext, useState, useEffect, useCallback } from 'react';
import { fetchForecastData, fetchWeatherData } from './WeatherAPI.jsx';

// Create the context
const WeatherContext = createContext({
    weather: null,
    city: '',
    hourlyForecast: [],
    dailyForecast: [],
    loading: true,
});

// eslint-disable-next-line react/prop-types
const WeatherProvider = ({ children }) => {
    const [weather, setWeather] = useState(null);
    const [hourlyForecast, setHourlyForecast] = useState([]);
    const [dailyForecast, setDailyForecast] = useState([]);
    const [city, setCity] = useState('Fetching location...');
    const [loading, setLoading] = useState(true);

    const getWeatherData = async (latitude, longitude) => {
        try {
            const data = await fetchWeatherData(latitude, longitude);
            setWeather(data);
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getForecastData = async (latitude, longitude) => {
        try {
            const data = await fetchForecastData(latitude, longitude);
            const hourlyData = data.list;
            const dailyData = data.list.filter((_, index) => index % 8 === 0).slice(0, 5);
            setHourlyForecast(hourlyData);
            setDailyForecast(dailyData);
        } catch (error) {
            console.error('Failed to fetch forecast data:', error);
        }
    };

    const fetchCityByLocation = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            return data.city || 'Unknown Location';
        } catch (error) {
            console.error('Failed to fetch city name:', error);
            return 'Location unavailable';
        }
    };

    const getUserLocationAndWeather = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const latitude = parseFloat(position.coords.latitude.toFixed(2));
                    const longitude = parseFloat(position.coords.longitude.toFixed(2));
                    const detectedCity = await fetchCityByLocation(latitude, longitude);
                    setCity(detectedCity);
                    await getWeatherData(latitude, longitude);
                    await getForecastData(latitude, longitude);
                },
                (error) => {
                    console.error('Location access denied:', error.message);
                    setCity('Location permission denied');
                    setLoading(false);
                }
            );
        } else {
            console.error('Geolocation not supported');
            setCity('Geolocation not supported');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        getUserLocationAndWeather();
    }, [getUserLocationAndWeather]);

    return (
        <WeatherContext.Provider value={{ weather, city, loading, hourlyForecast, dailyForecast }}>
            {children}
        </WeatherContext.Provider>
    );
};

export { WeatherContext, WeatherProvider };
