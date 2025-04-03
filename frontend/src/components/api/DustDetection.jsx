/**
 * Determine the risk level of dust accumulation based on weather conditions.
 *
 * @param {object} weather - The weather data as returned by the OpenWeatherMap API.
 * @returns {object} An object with the risk level and a message, e.g.
 * {
 *   riskLevel: 'High',
 *   message: 'High risk of dust accumulation detected! Maintenance recommended.'
 * }
 */
export const detectDustRisk = (weather) => {
    const { humidity } = weather.main;
    const windSpeed = weather.wind.speed;

    let riskLevel = 'Low';

    if (humidity < 30 && windSpeed < 3) {
        riskLevel = 'High';
    } else if (humidity < 50 && windSpeed < 5) {
        riskLevel = 'Moderate';
    }

    return {
        riskLevel,
        message: riskLevel === 'High'
            ? '⚠️ High risk of dust accumulation detected! Maintenance recommended.'
            : riskLevel === 'Moderate'
                ? '⚠️ Moderate risk of dust accumulation. Monitor conditions closely.'
                : '✅ Low risk of dust accumulation. No immediate action needed.',
    };
};
