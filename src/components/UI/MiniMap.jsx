/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";

const MiniMap = ({ url }) => {
    const [scaleFactor, setScaleFactor] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const iframeRef = useRef(null);

    // Handle zooming (scaling) of the mini-map
    const handleZoom = (event) => {
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        setScaleFactor((prevScale) => {
            const newScale = prevScale * zoomFactor;
            return Math.max(0.1, Math.min(newScale, 5)); // Set limits for scaling
        });
    };

    // Handle panning (moving) of the mini-map
    const handleMouseDown = (event) => {
        const startX = event.clientX - position.x;
        const startY = event.clientY - position.y;

        const onMouseMove = (moveEvent) => {
            const newX = moveEvent.clientX - startX;
            const newY = moveEvent.clientY - startY;
            setPosition({ x: newX, y: newY });
        };

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
