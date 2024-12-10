import { useState, useRef, useEffect } from "react";

const useDrag = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const [cursorStyle, setCursorStyle] = useState("default");

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setCursorStyle("grabbing");  // Change cursor to 'grabbing' on mousedown
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
        setCursorStyle("grab");  // Change cursor to 'grab' when mouseup occurs
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    // Return both position and cursor style
    return {
        position,
        cursorStyle, // Add cursorStyle to return object
        handleMouseDown,
        setPosition,
    };
};

export default useDrag;
