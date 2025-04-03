import { useControls } from "react-zoom-pan-pinch";

/**
 * A component that renders a control panel with zoom-in, zoom-out and reset buttons.
 *
 * It uses the `useControls` hook from `react-zoom-pan-pinch` to get the functions to
 * manipulate the transform of the wrapped element.
 *
 * @returns {ReactElement} - a React element representing the control panel.
 */
const ControlPanel = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
        <div className="top-[320px] fixed right-[30px] z-10 flex flex-col items-center space-y-2">
            <button
                className="bg-green-500 font-bold text-3xl text-white w-[80px] h-[50px] rounded shadow hover:bg-green-600"
                onClick={() => zoomIn()} // Directly call zoomIn
            >
                +
            </button>
            <button
                className="bg-red-500 font-bold text-3xl text-white w-[80px] h-[50px] rounded shadow hover:bg-red-600"
                onClick={() => zoomOut()} // Directly call zoomOut
            >
                -
            </button>
            <button
                className="bg-blue-500 font-bold text-md text-white w-[80px] h-[50px] rounded shadow hover:bg-blue-600"
                onClick={() => resetTransform()} // Directly call resetTransform
            >
                Reset
            </button>
        </div>
    );
};

export default ControlPanel;
