import { useEffect, useState } from "react";

/**
 * A React component that displays the current date and time in digital format.
 * The date is displayed in the format "Day of Week, Month DayOrdinal, Year" and
 * the time is displayed in 12-hour format with AM/PM suffix.
 * The component auto-updates every second.
 * @returns {JSX.Element} The rendered DigitalClock component.
 */
const DigitalClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);


    /**
     * Returns the ordinal suffix for a given day of the month.
     * 
     * @param {number} day The day of the month.
     * @returns {string} The ordinal suffix, e.g. "st", "nd", "rd", or "th".
     */
    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th"; // Covers 11th, 12th, 13th
        switch (day % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    };

    /**
     * Formats the current time into a 12-hour time string with AM/PM suffix.
     * @returns {string} The formatted time string.
     */
    const formatTime = () => {
        let hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const meridiem = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${meridiem}`;
    };

    /**
     * Formats the current date into a string in the format of "Day of Week, Month DayOrdinal, Year", e.g. "Monday, July 1st, 2022"
     * @returns {string} The formatted date string
     */
    const formatDate = () => {
        const day = time.getDate();
        const ordinal = getOrdinalSuffix(day);
        const dayName = time.toLocaleString("en-US", { weekday: "long" });
        const month = time.toLocaleString("en-US", { month: "long" });
        const year = time.getFullYear();

        return `${dayName}, ${month} ${day}${ordinal}, ${year}`;
    };


    return (
        <>
              <span>
                {formatDate()}, {formatTime()}
              </span>
        </>
    );
};

export default DigitalClock;
