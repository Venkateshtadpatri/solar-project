/* eslint-disable react/prop-types */

/**
 * A component that renders a control panel with zoom-in, zoom-out and reset buttons.
 *
 * @param {function} onZoomIn - a function that is called when the zoom-in button is clicked.
 * @param {function} onZoomOut - a function that is called when the zoom-out button is clicked.
 * @param {function} onReset - a function that is called when the reset button is clicked.
 *
 * @returns {ReactElement} - a React element representing the control panel.
 */
const ControlPanel = ({ onZoomIn, onZoomOut, onReset }) => {
    return (
        <div className="top-[100px] fixed left-[30px] z-10 flex flex-col items-center space-y-2">
            <button
                className="bg-green-500 font-bold text-3xl text-white w-[80px] h-[50px] rounded shadow hover:bg-green-600"
                onClick={onZoomIn} // Trigger zoomIn
            >
                +
            </button>
            <button
                className="bg-red-500 font-bold text-3xl text-white w-[80px] h-[50px] rounded shadow hover:bg-red-600"
                onClick={onZoomOut} // Trigger zoomOut
            >
                -
            </button>
            <button
                className="bg-blue-500 font-bold text-md text-white w-[80px] h-[50px] rounded shadow hover:bg-blue-600"
                onClick={onReset} // Trigger reset
            >
                Reset
            </button>
        </div>
    );
};

export default ControlPanel;
