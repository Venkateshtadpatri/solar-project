/* eslint-disable react/prop-types */

const ControlPanel = ({ setScaleFactor, setPosition, scaleFactor }) => {
    const handleZoomIn = () => {
        const newScale = Math.min(scaleFactor + 0.1, 5);
        setScaleFactor(newScale);
        setPosition({ x: -100, y: -200 }); // Keep the position centered
    };

    const handleZoomOut = () => {
        const newScale = Math.max(scaleFactor - 0.1, 0.1);
        setScaleFactor(newScale);
        setPosition({ x: -100, y: -200 }); // Keep the position centered
    };

    const handleReset = () => {
        setScaleFactor(1);
        setPosition({ x: -100, y: -300 }); // Reset position to center
    };

    return (
        <div className="top-[320px] fixed right-[30px] z-10 flex flex-col items-center space-y-2">
                <button
                    className="bg-green-500 font-bold text-3xl text-white  w-[80px] h-[50px] rounded shadow hover:bg-green-600"
                    onClick={handleZoomIn}
                >
                    +
                </button>
                <button
                    className="bg-red-500 font-bold text-3xl text-white w-[80px] h-[50px] rounded shadow hover:bg-red-600"
                    onClick={handleZoomOut}
                >
                    -
                </button>
                <button
                    className="bg-blue-500 font-bold text-md text-white w-[80px] h-[50px] rounded shadow hover:bg-blue-600"
                    onClick={handleReset}
                >
                    Reset
                </button>

        </div>
    );
};

export default ControlPanel;