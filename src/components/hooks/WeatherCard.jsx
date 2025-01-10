import { useContext } from 'react';
import { WeatherContext } from '../api/WeatherContext.jsx';
import { detectDustRisk } from '../api/DustDetection.jsx';

// Helper function to format the date with "st", "nd", "rd", "th"
const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });

    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    return { day, suffix, month, dayOfWeek };
};

const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours > 12 ? hours - 12 : hours}:${minutes < 10 ? '0' + minutes : minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
    return formattedTime;
};

const WeatherCard = () => {
    const { weather, city, loading, hourlyForecast, dailyForecast } = useContext(WeatherContext);

    if (loading) return <p className="text-center mt-[350px] text-3xl text-black">Loading weather data...</p>;
    if (!weather || !weather.main) return <p className="text-center text-lg text-gray-600">Unable to fetch weather data.</p>;

    const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
    const dustAlert = detectDustRisk(weather);

    // Ensure dailyForecast is not undefined and has data
    const nextFiveDays = dailyForecast && dailyForecast.length > 0 ? dailyForecast.map((dayData) => {
        const date = new Date(dayData.dt * 1000); // Convert Unix timestamp to date
        const { day, suffix, month, dayOfWeek } = formatDate(date);
        return { day, suffix, month, dayOfWeek, temp: dayData.main.temp, humidity: dayData.main.humidity, description: dayData.weather[0].description, icon: dayData.weather[0].icon };
    }) : [];

    return (
        <div className="p-4 max-w-3xl mx-auto bg-blue-300 shadow-md rounded-lg space-y-4">
            <h2 className="text-2xl font-bold text-black text-center">{city || weather.name}</h2>
            <img src={iconUrl} alt="Weather Icon" className="w-20 h-20 mx-auto" />
            <div className="text-center space-y-2">
                <p className="text-black">🌡️ <span className="font-bold">{weather.main.temp}°C</span></p>
                <p className="text-black">☁️ <span className="font-bold">{weather.clouds.all}% Cloud Cover</span></p>
                <p className="text-black">💨 <span className="font-bold">{weather.wind.speed} m/s</span> Wind Speed</p>
                <p className="text-black">🌦️ <span className="font-bold capitalize">{weather.weather[0].description}</span></p>
            </div>
            <div
                className={`p-3 rounded text-center text-sm font-medium ${dustAlert.riskLevel === 'High'
                    ? 'bg-red-100 text-red-800'
                    : dustAlert.riskLevel === 'Moderate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'}`}
            >
                <h3 className="text-lg font-semibold">🛡️ Dust Risk: {dustAlert.riskLevel}</h3>
                <p>{dustAlert.message}</p>
            </div>

            {/* Forecast Section */}
            {nextFiveDays.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">Next 5 Days</h3>
                    <div className="flex justify-between space-x-2">
                        {nextFiveDays.map((day, index) => (
                            <div
                                key={index}
                                className="flex-1 p-2 bg-blue-200 rounded-lg text-center shadow-sm"
                            >
                                <p className="text-sm font-semibold text-black">{`${day.day}${day.suffix} ${day.month}`}</p>
                                <p className="text-sm font-semibold text-black">{`${day.dayOfWeek}`}</p>
                                <img
                                    src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                                    alt="Weather Icon"
                                    className="w-12 h-12 mx-auto"
                                />
                                <p className="text-sm font-bold text-black">🌡️ {day.temp}°C</p>
                                <p className="text-sm font-bold text-black">💧 {day.humidity}%</p>
                                <p className="text-sm font-bold text-black capitalize">{day.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hourly Forecast Section */}
            {hourlyForecast.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">Hourly Forecast</h3>
                    <div className="flex justify-between space-x-2">
                        {hourlyForecast.slice(0, 5).map((hour, index) => (
                            <div
                                key={index}
                                className="flex-1 p-2 bg-blue-200 rounded-lg text-center shadow-sm"
                            >
                                <p className="text-sm font-semibold text-black">{formatTime(new Date(hour.dt * 1000))}</p> {/* Display time */}
                                <img
                                    src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                                    alt="Weather Icon"
                                    className="w-12 h-12 mx-auto"
                                />
                                <p className="text-sm font-bold text-black">🌡️ {hour.main.temp}°C</p>
                                <p className="text-sm font-bold text-black">💧 {hour.main.humidity}%</p>
                                <p className="text-sm font-bold text-black capitalize">{hour.weather[0].description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeatherCard;
