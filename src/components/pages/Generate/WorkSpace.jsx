/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import ControlPanel from "../../hooks/ControlPanel";
import { TransformWrapper, TransformComponent, MiniMap } from "react-zoom-pan-pinch";
import SMBSection from "./SMBSection";
import useDrag from "../../hooks/useDrag";

const WorkSpace = ({ counts }) => {
    const workspaceRef = useRef(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const { position, cursorStyle, handleMouseDown, setPosition } = useDrag();
    const { SmbCount, StringCount, PanelCount } = counts;
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

    useEffect(() => {
        setPosition({ x: 0, y: 0 }); // Keep position centered when zooming
    }, [scaleFactor, setPosition]);

    return (
        <div id="workspace" className="min-h-screen  custom-background text-white w-[100%] flex items-center justify-center p-10 -z-10">
            <TransformWrapper>
                     <ControlPanel/>
            <TransformComponent>
            <div
                ref={workspaceRef}
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
                    <SMBSection
                        key={smbIndex}
                        smbIndex={smbIndex}
                        StringCount={StringCount}
                        PanelCount={PanelCount}
                    />
                ))}
            </div>
            </TransformComponent>
            <MiniMap
            position={position}  // Position to track the visible area
            scale={scaleFactor}  // Scale factor for the minimap
            scaleContent={true}  // Option to scale the content inside the minimap
            height={200} // Height of the minimap
            width={200} // Width of the minimap
            backgroundColor="rgba(0, 0, 0, 0.5)" // Background color of the minimap
            borderRadius="10px" // Border radius for aesthetics
            style={{
                position: 'absolute',  // Ensures the minimap is positioned over the workspace
                top: 20,               // Place it near the top
                right: 20,             // Place it near the right corner
                zIndex: 10            // Ensure it appears above other content
            }}
            />
            </TransformWrapper>
        </div>
    );
};

export default WorkSpace;
