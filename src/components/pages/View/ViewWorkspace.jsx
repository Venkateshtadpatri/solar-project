/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import ControlPanel from "../../hooks/ControlPanel";
import SMBSection from "../../UI/SMBSection";
import useDrag from "../../hooks/useDrag";
import { SyncLoader } from "react-spinners"; // Importing a spinner from react-spinners

const ViewWorkSpace = ({ SmbCount, StringCount, PanelCount }) => {
    const viewworkspaceRef = useRef(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const [isLoading, setIsLoading] = useState(true); // State to manage loading status
    const { position, cursorStyle, handleMouseDown, setPosition } = useDrag();

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
        // Simulate loading delay to show the spinner
        const timer = setTimeout(() => {
            setIsLoading(false); // Set loading to false after 2 seconds (adjust as needed)
        }, 2000);

        return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }, []);

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
        setPosition({ x: -100, y: -200 }); // Keep position centered when zooming
    }, [scaleFactor, setPosition]);

    return (
        <div id="workspace" className="min-h-screen custom-background text-white w-[100%] h-[100%] p-80 -z-40">
            <ControlPanel
                setScaleFactor={setScaleFactor}
                setPosition={setPosition}
                scaleFactor={scaleFactor}
            />
            {isLoading ? (
                <div className="flex justify-center items-center -mt-[350px] -ml-[350px] w-full h-full absolute">
                    <SyncLoader color="#f87171" size={15} /> {/* Displaying the spinner while loading */}
                </div>
            ) : (
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
            )}
        </div>
    );
};

export default ViewWorkSpace;
