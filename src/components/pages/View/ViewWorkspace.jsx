/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import ControlPanel from "../../hooks/ControlPanel";
import axios from "axios";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ViewSMBSection from "./ViewSMBSection";
import useDrag from "../../hooks/useDrag";

const ViewWorkSpace = ({ SmbCount,StringCount,PanelCount,SelectedPlantId }) => {
    const viewworkspaceRef = useRef(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const { position, cursorStyle, handleMouseDown, setPosition } = useDrag();

    const [powerData, setPowerData] = useState([]);
    

    // Fetch power data for the selected plant at a 10-second interval
    useEffect(() => {
      if (!SelectedPlantId) return; // Do not make the call if no PlantId is selected
  
      const fetchPowerData = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:9000/app/get-power-output/${SelectedPlantId}/`);
          setPowerData(response.data); // Assuming power data is an array from the API
        } catch (error) {
          console.error("Error fetching power output data:", error);
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

    const handleZoom = (event) => {
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        setScaleFactor((prevScale) => {
            const newScale = prevScale * zoomFactor;
            return Math.max(0.1, Math.min(newScale, 5)); // Set limits for scaling
        });
    };

    useEffect(() => {
        const workspaceElement = viewworkspaceRef.current;
        if (workspaceElement) {
            workspaceElement.addEventListener("wheel", handleZoom, { passive: true });
        }
        return () => {
            if (workspaceElement) {
                workspaceElement.removeEventListener("wheel", handleZoom);
            }
        };
    }, []);

    useEffect(() => {
        setPosition({ x: 0, y: 0 }); // Keep position centered when zooming
    }, [scaleFactor, setPosition]);

    return (
        <div id="workspace" className="min-h-screen custom-background text-white w-[100%] h-[100%] p-1  -z-40">
            <TransformWrapper>
                
            <ControlPanel
                setScaleFactor={setScaleFactor}
                setPosition={setPosition}
                scaleFactor={scaleFactor}
            />
            <TransformComponent>

            <div
                ref={viewworkspaceRef}
                onMouseDown={handleMouseDown}
                style={{
                    transform: `scale(${scaleFactor}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: "center",
                    cursor: cursorStyle,
                    position: "relative",
                    width: "100%",
                    height: "100%",
                }}
                className="-ml-[300px]"
            >
                {layout.map((strings, smbIndex) => (
                    <ViewSMBSection
                        key={smbIndex}
                        smbIndex={smbIndex}
                        StringCount={StringCount}
                        PanelCount={PanelCount}
                        powerData={powerData} // Pass power data to ViewSMBSection
                        SelectedPlantId={SelectedPlantId} // Pass plant ID to ViewSMBSection
                    />
                ))}
            </div>
            </TransformComponent>
            </TransformWrapper>
        </div>
    );
};

export default ViewWorkSpace;
