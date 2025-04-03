// getFormattedDateTime.js
const getFormattedDateTime = () => {
    const now = new Date();

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
     * Formats a Date object into a 12-hour time string with AM/PM suffix.
     * @returns {string} The formatted time string.
     */
    const formatTime = () => {
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const meridiem = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${meridiem}`;
    };

    /**
     * Formats a Date object into a string in the format of "Day of Week, Month DayOrdinal, Year", e.g. "Monday, July 1st, 2022"
     * @returns {string} The formatted date string
     */
    const formatDate = () => {
        const day = now.getDate();
        const ordinal = getOrdinalSuffix(day);
        const dayName = now.toLocaleString("en-US", { weekday: "long" });
        const month = now.toLocaleString("en-US", { month: "long" });
        const year = now.getFullYear();

        return `${dayName}, ${month} ${day}${ordinal}, ${year}`;
    };

    return `${formatDate()}, ${formatTime()}`;
};

export default getFormattedDateTime;
