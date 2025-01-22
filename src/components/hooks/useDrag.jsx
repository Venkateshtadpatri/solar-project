import { useState, useRef, useEffect, useCallback } from "react";

const useDrag = (workspaceRef, zoomLevel = 1) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const [cursorStyle, setCursorStyle] = useState("grab");

    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
        setCursorStyle("grabbing");

        const clientX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === "mousedown" ? e.clientY : e.touches[0].clientY;

        lastPos.current = { x: clientX, y: clientY };
    }, []);

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging) return;

            const clientX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === "mousemove" ? e.clientY : e.touches[0].clientY;

            const dx = clientX - lastPos.current.x;
            const dy = clientY - lastPos.current.y;

            // Calculate new position
            setPosition((prevPos) => {
                let newX = prevPos.x + dx;
                let newY = prevPos.y + dy;

                // Get workspace bounds
                const workspace = workspaceRef.current;
                if (workspace) {
                    const { offsetWidth, offsetHeight } = workspace;
                    const bounds = {
                        minX: 0,
                        minY: 0,
                        maxX: (offsetWidth - offsetWidth / zoomLevel),
                        maxY: (offsetHeight - offsetHeight / zoomLevel),
                    };

                    // Constrain position within bounds
                    newX = Math.min(Math.max(newX, bounds.minX), bounds.maxX);
                    newY = Math.min(Math.max(newY, bounds.minY), bounds.maxY);
                }

                return { x: newX, y: newY };
            });

            lastPos.current = { x: clientX, y: clientY };
        },
        [isDragging, zoomLevel, workspaceRef]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setCursorStyle("grab");
    }, []);

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchmove", handleMouseMove, { passive: false });
        document.addEventListener("touchend", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleMouseMove);
            document.removeEventListener("touchend", handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return {
        position,
        cursorStyle,
        handleMouseDown,
        setPosition,
    };
};

export default useDrag;
