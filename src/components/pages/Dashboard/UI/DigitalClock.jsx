import { useEffect, useState } from "react";

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

    const formatTime = () => {
        let hours = time.getHours();
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const meridiem = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${meridiem}`;
    };

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
