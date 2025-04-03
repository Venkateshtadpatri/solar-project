/* eslint-disable react/prop-types */
import { useRef, useState, useEffect, useCallback } from "react";
import ControlPanel from "../../components/hooks/ControlPanel.jsx";
import axios from "axios";
import ViewSMBSection from "./ViewSMBSection";
import MoonLoader from "react-spinners/MoonLoader";

/**
 * The main workspace component for the solar panel monitoring portal.
 *
 * This component generates a layout based on the selected SMB or plant.
 * It fetches power output data for the selected plant or SMB at a 10-second interval.
 * The component also handles zooming, resetting, and loading states.
 *
 * @param {number} SmbCount The number of SMBs in the plant.
 * @param {number} StringCount The number of strings in the plant.
 * @param {number} PanelCount The number of panels in the plant.
 * @param {string} SelectedPlantId The ID of the selected plant.
 * @param {string} SelectedSMBID The ID of the selected SMB, if any.
 *
 * @returns {React.ReactElement}
 */
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

/**
 * Fetches power data for the selected plant or SMB.
 *
 * If a SelectedSMBID is provided, it fetches details specific to that SMB.
 * Otherwise, it fetches power output data for the entire plant.
 * The data is retrieved from an API and stored in the `powerData` state.
 *
 * @async
 * @throws Will log an error message in case of a failed API request or unsuccessful response status.
 */

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
            return [
                Array.from({ length: StringCount }, () => Array(PanelCount).fill(0)),
            ];
        }

        return Array.from({ length: SmbCount }, () =>
            Array.from({ length: StringCount }, () => Array(PanelCount).fill(0))
        );
    };

    const layout = generateLayout();

    return (
        <div id="workspace" className="min-h-screen absolute flex custom-background text-white w-full p-5 -z-40 scrollbar-corner-sky-500 scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300 overflow-x-auto">
            <ControlPanel
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
            />
            {loading && (
                <div className="fixed inset-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <MoonLoader color="#FFF" size={50} />
                </div>
            )}
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
