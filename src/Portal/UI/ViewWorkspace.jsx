/* eslint-disable react/prop-types */
import { useRef, useState, useEffect, useCallback } from "react";
import ControlPanel from "../../components/hooks/ControlPanel.jsx";
import axios from "axios";
import ViewSMBSection from "./ViewSMBSection";
import MoonLoader from "react-spinners/MoonLoader";

const ViewWorkspace = ({ SmbCount, StringCount, PanelCount, SelectedPlantId, SelectedSMBID }) => {
    const viewworkspaceRef = useRef(null);
    const [scaleFactor, setScaleFactor] = useState(1);
    const [loading, setLoading] = useState(false);
    const [powerData, setPowerData] = useState({});

    const handleZoomIn = useCallback(() => {
        setScaleFactor((prev) => Math.min(prev * 1.1, 5)); // Limit max zoom
    }, []);

    const handleZoomOut = useCallback(() => {
        setScaleFactor((prev) => Math.max(prev * 0.9, 0.5)); // Limit min zoom
    }, []);

    const handleReset = useCallback(() => {
        setScaleFactor(1);
    }, []);

    // Fetch power data for the selected plant at a 10-second interval
    useEffect(() => {
        if (!SelectedPlantId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const endpoint = SelectedSMBID
                    ? `http://127.0.0.1:8000/api/get_details_by_smb_id/${SelectedPlantId}/${SelectedSMBID}/`
                    : `http://127.0.0.1:8000/api/power_output/${SelectedPlantId}`;

                const response = await axios.get(endpoint);

                if (response.data.status === "success") {
                    setPowerData(response?.data?.data); // Store data based on the response
                } else {
                    console.error("API response status not successful", response);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const interval = setInterval(() => {
            if (SelectedPlantId) {
                fetchData();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [SelectedPlantId, SelectedSMBID]);

    // Generate layout based on SMB selection
    const generateLayout = () => {
        if (typeof SmbCount !== "number" || typeof StringCount !== "number" || typeof PanelCount !== "number") {
            console.error("Invalid values for layout parameters");
            return [];
        }

        if (SelectedSMBID) {
            // Generate layout only for the selected SMB
            return [
                Array.from({ length: StringCount }, () => Array(PanelCount).fill(0)),
            ];
        }

        // Generate layout for all SMBs if none is specifically selected
        return Array.from({ length: SmbCount }, () =>
            Array.from({ length: StringCount }, () => Array(PanelCount).fill(0))
        );
    };

    const layout = generateLayout();

    useEffect(() => {
        const workspaceElement = viewworkspaceRef.current;
        if (workspaceElement) {
            workspaceElement.addEventListener("wheel", handleZoom, { passive: false });
        }

        return () => {
            if (workspaceElement) {
                workspaceElement.removeEventListener("wheel", handleZoom);
            }
        };
    }, []);

    const handleZoom = (event) => {
        event.preventDefault();
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        setScaleFactor((prev) => Math.max(0.5, Math.min(prev * zoomFactor, 5)));
    };

    return (
        <div id="workspace" className="min-h-screen absolute flex custom-background text-white w-full p-5 -z-40 scrollbar-corner-sky-500 scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300 overflow-x-auto">
            <ControlPanel
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
            />
            <div
                ref={viewworkspaceRef}
                style={{
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: "center",
                    cursor: "grab",
                    position: "relative",
                }}
                className="-ml-[400px] mb-5"
            >
                {loading && (
                    <div className="sticky inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
                        <MoonLoader color="#FFF" size={50} />
                    </div>
                )}
                {layout.length === 0 ? (
                    <div className="text-center text-red-500">No data available for the selected plant or SMB.</div>
                ) : (
                    layout.map((_, smbIndex) => (
                        <ViewSMBSection
                            key={smbIndex}
                            smbIndex={SelectedSMBID ? parseInt(SelectedSMBID, 10) - 1 : smbIndex}
                            StringCount={StringCount}
                            PanelCount={PanelCount}
                            powerData={powerData}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ViewWorkspace;
