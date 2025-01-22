/* eslint-disable react/prop-types */

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
