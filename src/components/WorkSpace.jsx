import { useState, useRef, useEffect } from "react";
import ControlPanel from './ControlPanel'; // Import the ControlPanel component
import SMBSection from './SMBSection'; // Import the SMBSection component
import useDrag from "./useDrag";

const WorkSpace = ({ counts }) => {
    const workspaceRef = useRef(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const { position, cursorStyle, handleMouseDown, setPosition } = useDrag(); // Use setPosition from useDrag hook
    const { SmbCount = 0, StringCount = 0, PanelCount = 0 } = counts;

    // Generate the layout dynamically
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

    // Function to handle zoom (center zooming logic)
    const handleZoom = (event) => {
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9; // Zoom in or out depending on scroll direction
        setScaleFactor((prevScale) => {
            const newScale = prevScale * zoomFactor;
            return Math.max(0.1, Math.min(newScale, 5)); // Set limits for scaling (0.1 to 5)
        });
    };

    // Handling mouse wheel for zooming
    useEffect(() => {
        const workspaceElement = workspaceRef.current;
        if (workspaceElement) {
            workspaceElement.addEventListener("wheel", handleZoom, { passive: true });
        }

        return () => {
            if (workspaceElement) {
                workspaceElement.removeEventListener("wheel", handleZoom);
            }
        };
    }, []);

    return (
        <div className="min-h-screen custom-background text-white p-4 overflow-hidden">
            <ControlPanel setScaleFactor={setScaleFactor} setPosition={setPosition} />

            <div
                ref={workspaceRef}
                onMouseDown={handleMouseDown}
                style={{
                    transform: `scale(${scaleFactor}) translate(${position.x}px, ${position.y}px)`,
                    transformOrigin: "center",  // Ensure zooming occurs from the center
                    cursor: cursorStyle,
                }}
                className="relative w-full h-full"
            >
                {layout.map((strings, smbIndex) => (
                    <SMBSection
                        key={smbIndex}
                        smbIndex={smbIndex}
                        StringCount={StringCount}
                        PanelCount={PanelCount}
                    />
                ))}
            </div>
        </div>
    );
};

export default WorkSpace;
