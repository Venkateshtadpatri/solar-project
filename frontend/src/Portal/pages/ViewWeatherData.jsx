import WeatherCard from "../../components/hooks/WeatherCard.jsx";

/**
 * A React component for displaying weather data.
 *
 * This component renders a container with a specific styling and includes
 * the WeatherCard component, which displays the current weather information.
 *
 * @returns {JSX.Element} The styled container containing the WeatherCard component.
 */

const ViewWeatherData = () => {
    return (
        <div className="overflow-auto bg-violet-300 w-full h-full pt-4">
            <WeatherCard />
        </div>
    )
}
export default ViewWeatherData
