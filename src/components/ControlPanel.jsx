const ControlPanel = ({ setScaleFactor, setPosition }) => {
    const handleZoomIn = () => {
        setScaleFactor((prev) => Math.min(prev + 0.1, 5)); // Cap max zoom at 5
        setPosition({ x: 0, y: 0 }); // Keep the position centered
    };

    const handleZoomOut = () => {
        setScaleFactor((prev) => Math.max(prev - 0.1, 0.1)); // Prevent zoom below 0.1
        setPosition({ x: 0, y: 0 }); // Keep the position centered
    };

    const handleReset = () => {
        setScaleFactor(1);
        setPosition({ x: 0, y: 0 }); // Reset position to center
    };

    return (
        <div className="absolute top-[100px] right-4 z-10 flex flex-col space-y-2">
            <button
                className="bg-green-500 font-bold text-2xl text-white py-1 px-3 rounded shadow hover:bg-green-600"
                onClick={handleZoomIn}
            >
                +
            </button>
            <button
                className="bg-red-500 font-bold text-2xl text-white py-1 px-3 rounded shadow hover:bg-red-600"
                onClick={handleZoomOut}
            >
                -
            </button>
            <button
                className="bg-blue-500 font-bold text-md text-white py-1 px-3 rounded shadow hover:bg-blue-600"
                onClick={handleReset}
            >
                Reset
            </button>
        </div>
    );
};

export default ControlPanel;
