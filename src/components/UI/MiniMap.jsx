/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";

/**
 * MiniMap component:
 *
 * This component renders a mini-map of a specified URL in an iframe.
 * It provides zooming (scaling) and panning (moving) functionality.
 * The mini-map is scaled between 0.1 and 5, and its position is adjusted
 * based on the mouse events.
 *
 * @param {{ url: string }} props
 * @prop {string} url - The URL of the mini-map.
 * @returns {JSX.Element} The rendered component.
 */
const MiniMap = ({ url }) => {
    const [scaleFactor, setScaleFactor] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const iframeRef = useRef(null);

    
/**
 * Handles the zoom functionality for the mini-map.
 *
 * This function adjusts the scaling factor based on the direction of 
 * the scroll event. It increases the scale factor when scrolling up 
 * (zooming in) and decreases it when scrolling down (zooming out).
 * The scaling factor is constrained between 0.1 and 5 to ensure 
 * proper visibility and usability of the mini-map.
 *
 * @param {WheelEvent} event - The wheel event triggered by the user.
 */

    const handleZoom = (event) => {
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        setScaleFactor((prevScale) => {
            const newScale = prevScale * zoomFactor;
            return Math.max(0.1, Math.min(newScale, 5)); // Set limits for scaling
        });
    };

 
/**
 * Initiates the drag functionality for the mini-map.
 *
 * This function is triggered when the user presses the mouse button down 
 * on the mini-map. It calculates the starting position of the drag relative 
 * to the current position of the mini-map. It also sets up event listeners 
 * for mousemove and mouseup events to handle the panning functionality 
 * and to clean up the event listeners once the drag is complete.
 *
 * @param {MouseEvent} event - The mousedown event triggered by the user.
 */

    const handleMouseDown = (event) => {
        const startX = event.clientX - position.x;
        const startY = event.clientY - position.y;

/**
 * Updates the position state of the mini-map based on mouse movement.
 * 
 * This function is triggered when the mouse is moved while the user is 
 * dragging the mini-map. It calculates the new position by subtracting 
 * the starting mouse coordinates from the current mouse coordinates, 
 * and updates the position state accordingly.
 * 
 * @param {MouseEvent} moveEvent - The mousemove event triggered by the user.
 */

        const onMouseMove = (moveEvent) => {
            const newX = moveEvent.clientX - startX;
            const newY = moveEvent.clientY - startY;
            setPosition({ x: newX, y: newY });
        };

        /**
         * Removes the event listeners for mousemove and mouseup when the user releases the mouse button.
         * This is used to stop the panning functionality when the user is no longer dragging the mini-map.
         */
        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };
    console.log(iframeRef.current)

    useEffect(() => {
        const iframeElement = iframeRef.current;
        if (iframeElement) {
            iframeElement.addEventListener("wheel", handleZoom, { passive: true });
        }
        return () => {
            if (iframeElement) {
                iframeElement.removeEventListener("wheel", handleZoom);
            }
        };
    }, []);

    return (
        <div className="fixed border-red-500 ml-[1350px] -mt-[740px] z-50 text-white w-[150px] h-[200px] border-4">
            <div
                className="mini-map-container"
                onMouseDown={handleMouseDown}
                style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <iframe
                    ref={iframeRef}
                    src={url}
                    style={{
                        transform: `scale(${scaleFactor}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: "top left",
                        width: "100%",
                        height: "100%",
                        border: "none",
                        position: "absolute",
                        top: "0",
                        left: "0",
                    }}
                    title="MiniMap"
                />
            </div>
        </div>
    );
};

export default MiniMap;
