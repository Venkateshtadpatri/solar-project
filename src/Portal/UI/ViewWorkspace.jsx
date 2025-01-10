/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import ControlPanel from "../../components/hooks/ControlPanel.jsx";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ViewSMBSection from "./ViewSMBSection";
import useDrag from "../../components/hooks/useDrag.jsx";
import MoonLoader from "react-spinners/MoonLoader";

const ViewWorkspace = ({ SmbCount, StringCount, PanelCount, SelectedPlantId }) => {
    const viewworkspaceRef = useRef(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const { position, cursorStyle, handleMouseDown, setPosition } = useDrag();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [powerData, setPowerData] = useState({});
    const [loading, setLoading] = useState(false); // New state for loading indicator

    // Fetch power data for the selected plant at a 10-second interval
    useEffect(() => {
        if (!SelectedPlantId) return; // Do not make the call if no PlantId is selected

        const fetchPowerData = async () => {
            setLoading(true); // Start loading
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/power_output/${SelectedPlantId}`);
                setPowerData(response?.data?.data); // Assuming power data is an array from the API
            } catch (error) {
                console.error("Error fetching power output data:", error);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        // Call API every 10 seconds
        const interval = setInterval(fetchPowerData, 10000);
        fetchPowerData(); // Call it initially too

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [SelectedPlantId]);

    const generateLayout = () => {
        const layout = [];
        for (let i = 0; i < SmbCount; i++) {
            const strings = [];
            for (let j = 0; j < StringCount; j++) {
                const panels = Array(PanelCount).fill(0);
                strings.push(panels);
            }
            layout.push(strings);
        }
        return layout;
    };

    const layout = generateLayout();

    useEffect(() => {
        const handleZoom = (event) => {
            event.preventDefault();

            if (!viewworkspaceRef.current) return;

            const rect = viewworkspaceRef.current.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;

            setMousePosition({ x: offsetX, y: offsetY });

            const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
            setScaleFactor((prevScale) => Math.max(0.1, Math.min(prevScale * zoomFactor, 5)));
        };

        const workspaceElement = viewworkspaceRef.current;
        if (workspaceElement) {
            workspaceElement.addEventListener("wheel", handleZoom, { passive: false });
        }

        return () => {
            if (workspaceElement) {
                workspaceElement.removeEventListener("wheel", handleZoom);
            }
        };
    }, []);

    // Reset Position on Zoom Change
    useEffect(() => {
        setPosition({ x: 0, y: 0 });
    }, [scaleFactor, setPosition]);

    return (
        <div id="workspace" className="min-h-screen custom-background text-white w-full h-full p-1 -z-40 relative">
            {loading && (
                <div className="absolute inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
                    <MoonLoader color="#FFF" size={50} />
                </div>
            )}
            <TransformWrapper>
                <ControlPanel />
                <TransformComponent>
                    <div
                        ref={viewworkspaceRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={(e) => {
                            const rect = viewworkspaceRef.current?.getBoundingClientRect();
                            setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                        }}
                        style={{
                            transform: `scale(${scaleFactor}) translate(${position.x}px, ${position.y}px)`,
                            transformOrigin: 'center',
                            cursor: cursorStyle,
                            position: "relative",
                            width: "100%",
                            height: "100%",
                        }}
                        className="-ml-[300px]"
                    >
                        {layout.map((_, smbIndex) => (
                            <ViewSMBSection
                                key={smbIndex}
                                smbIndex={smbIndex}
                                StringCount={StringCount}
                                PanelCount={PanelCount}
                                powerData={powerData}
                            />
                        ))}
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

export default ViewWorkspace;
