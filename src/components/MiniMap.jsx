import React, { useState, useRef, useEffect } from 'react';

const MiniMap = ({ workspaceRef, scaleFactor, position }) => {
    const miniMapRef = useRef(null);

    const [miniMapPosition, setMiniMapPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Update the mini-map position based on the workspace position and scale
        setMiniMapPosition({
            x: (position.x / scaleFactor) * 100,
            y: (position.y / scaleFactor) * 100,
        });
    }, [position, scaleFactor]);

    const handleMiniMapClick = (e) => {
        const miniMap = miniMapRef.current;
        const rect = miniMap.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        // Adjust the workspace position based on mini-map click
        workspaceRef.current.style.transform = `scale(${scaleFactor}) translate(-${offsetX}px, -${offsetY}px)`;
    };

    return (
        <div
            ref={miniMapRef}
            onClick={handleMiniMapClick}
            className="mini-map border-2 border-gray-500 w-[150px] h-[150px] overflow-hidden relative bg-gray-200"
        >
            <div
                className="mini-map-preview"
                style={{
                    position: 'absolute',
                    top: `${miniMapPosition.y}%`,
                    left: `${miniMapPosition.x}%`,
                    width: '10%',
                    height: '10%',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '2px solid black',
                }}
            />
        </div>
    );
};

export default MiniMap;
