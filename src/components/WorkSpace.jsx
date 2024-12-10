import { useEffect, useRef, useState } from "react";

const WorkSpace = ({ counts }) => {
    const workspaceRef = useRef(null);
    const { SmbCount, StringCount, PanelCount } = counts;

    const [scaleFactor, setScaleFactor] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });

    // Handle mouse dragging
    const handleMouseDown = (e) => {
        setIsDragging(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;

        setPosition((prevPos) => ({
            x: prevPos.x + dx,
            y: prevPos.y + dy,
        }));

        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    useEffect(() => {
        const workspace = workspaceRef.current;
        if (!workspace) return;

        // Clear previous images
        workspace.innerHTML = "";

        const image = import.meta.env.VITE_SMB_IMAGE_URL || "/smb-image.png";
        const gapY = 50; // Vertical gap between images
        const imageWidth = 127;
        const imageHeight = 103;
        let y = 50; // Starting position for y

        // Render SMBs
        for (let i = 0; i < SmbCount; i++) {
            const img = document.createElement("img");
            img.src = image;
            img.alt = `SMB ${i + 1}`;
            img.style.width = `${imageWidth}px`;
            img.style.height = `${imageHeight}px`;
            img.style.position = "absolute";
            img.style.left = "350px"; // Fixed horizontal position for all images
            img.style.top = `${y}px`; // Vertical position increases with each SMB
            img.crossOrigin = "anonymous";
            img.setAttribute("draggable", "false");
            workspace.appendChild(img);

            y += imageHeight + gapY;
        }
    }, [SmbCount]);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                backgroundColor: "#0d1226",
                overflow: "hidden",
                position: "relative",
            }}
            className="flex flex-col sticky top-0"
        >
            {/* Zoom Control Buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                <button
                    className="bg-green-500 font-bold text-2xl text-white py-1 px-3 rounded shadow hover:bg-green-600"
                    onClick={() => setScaleFactor((prev) => Math.min(prev + 0.1, 5))} // Cap max zoom at 5
                >
                    +
                </button>
                <button
                    className="bg-red-500 font-bold text-2xl text-white py-1 px-3 rounded shadow hover:bg-red-600"
                    onClick={() => setScaleFactor((prev) => Math.max(prev - 0.1, 0.1))} // Prevent zoom below 0.1
                >
                    -
                </button>
                <button
                    className="bg-blue-500 font-bold text-md text-white py-1 px-3 rounded shadow hover:bg-blue-600"
                    onClick={() => {
                        setScaleFactor(1);
                        setPosition({ x: 0, y: 0 });
                    }}
                >
                    Reset
                </button>
            </div>

            {/* Workspace */}
            <div
                ref={workspaceRef}
                style={{
                    width: "100%",
                    height: "calc(100vh - 50px)",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    cursor: isDragging ? "grabbing" : "grab",
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scaleFactor})`,
                    transformOrigin: "0 0",
                    backgroundColor: "#0d1226",
                }}
                onMouseDown={handleMouseDown}
            />
        </div>
    );
};

export default WorkSpace;
