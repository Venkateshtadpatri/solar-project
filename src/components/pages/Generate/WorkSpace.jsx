/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useRef, useState, useEffect, useCallback } from "react";
import ControlPanel from "../../hooks/ControlPanel";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import SMBSection from "./SMBSection";
import useDrag from "../../hooks/useDrag";

/**
 * The WorkSpace component is a container for the solar panel monitoring system.
 * It renders SMBs with their respective strings and panels, and provides zooming and panning functionality.
 *
 * @param {object} counts - An object containing the counts of SMBs, strings, and panels.
 * @returns {JSX.Element} The rendered component.
 */
const WorkSpace = ({ counts }) => {
    const workspaceRef = useRef(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const { position, cursorStyle, handleMouseDown, setPosition } = useDrag();
    const { SmbCount, StringCount, PanelCount } = counts;
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Generate Layout
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

    // Zoom Handling
    useEffect(() => {
/**
 * Handles zooming functionality within the workspace.
 *
 * This function prevents the default scroll behavior and calculates the 
 * zoom factor based on the scroll direction. It adjusts the scale factor 
 * to zoom in or out, ensuring it stays within defined bounds.
 * It also updates the mouse position relative to the workspace.
 *
 * @param {WheelEvent} event - The wheel event triggered by the user.
 */

        const handleZoom = (event) => {
            event.preventDefault();

            if (!workspaceRef.current) return;

            const rect = workspaceRef.current.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;

            setMousePosition({ x: offsetX, y: offsetY });

            const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
            setScaleFactor((prevScale) => Math.max(0.1, Math.min(prevScale * zoomFactor, 5)));
        };

        const workspaceElement = workspaceRef.current;
        if (workspaceElement) {
            workspaceElement.addEventListener("wheel", handleZoom, { passive: false });
        }

        return () => {
            if (workspaceElement) {
                workspaceElement.removeEventListener("wheel", handleZoom);
            }
        };
    }, []);

    // Update Position Based on Zoom
    useEffect(() => {
        // Apply scaling to the position on zoom to maintain the correct position visually
        setPosition({
            x: position.x * scaleFactor,
            y: position.y * scaleFactor,
        });
    }, [scaleFactor, position, setPosition]);

    return (
        <div id="workspace" className="min-h-screen custom-background text-white w-full h-full p-1 -z-40">
            <TransformWrapper>
                <ControlPanel />
                <TransformComponent>
                    <div
                        ref={workspaceRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={(e) => {
                            const rect = workspaceRef.current?.getBoundingClientRect();
                            setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                        }}
                        style={{
                            transform: `scale(${scaleFactor}) translate(${position.x}px, ${position.y}px)`,
                            transformOrigin: `center`,
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
            </TransformWrapper>
        </div>
    );
};

export default WorkSpace;
