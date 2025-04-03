import DigitalClock from "../../Dashboard/UI/DigitalClock.jsx";

/**
 * A component that displays a live timestamp and a red live dot.
 * This is used in the PanelDetails page to show the current time and indicate
 * that the page is live.
 * @returns {JSX.Element} The TimePulse component.
 * @example
 * import TimePulse from '../components/pages/PanelDetails/UI/TimePulse';
 *
 * const Example = () => {
 *     return (
 *         <div>
 *             <TimePulse />
 *         </div>
 *     );
 * }
 */
const TimePulse = () => {
    return (
        <div className="flex justify-end gap-5">
            <div className="flex items-center space-x-2">
                <div className="live-dot"></div>
                <span className="text-red-500 font-semibold">LIVE</span>
            </div>
            <DigitalClock/>
        </div>
    )
}
export default TimePulse
