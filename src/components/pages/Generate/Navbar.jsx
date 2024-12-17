/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutSubmitModal from "../../UI/LayoutSubmitModal";

const Navbar = ({ setCounts }) => {
    const [Plants, setPlants] = useState([]);
    const [PlantId, setPlantId] = useState("");
    const [SmbCount, setSmbCount] = useState("");
    const [PanelCount, setPanelCount] = useState("");
    const [StringCount, setStringCount] = useState("");
    const [isGenerated, setIsGenerated] = useState(false);
    const [isView, setIsView] = useState(false);
    const [showLayoutModal, setShowLayoutModal] = useState(false);

    const handleGenerate = (e) => {
        e.preventDefault();
        setCounts({
            SmbCount: parseInt(SmbCount || 0, 10),
            StringCount: parseInt(StringCount || 0, 10),
            PanelCount: parseInt(PanelCount || 0, 10),
        });
        setIsGenerated(true); // Show the Submit button after generation
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowLayoutModal(true);
    };

    const handleCloseLayoutModal = () => {
        setShowLayoutModal(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:9000/app/solar-plants/");
                setPlants(response.data.plants);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const handlePlantChange = (event) => {
        setPlantId(event.target.value);
    };

    return (
        <header className="w-full h-[75px] bg-red-400 sticky top-0 z-50">
            <div className="ml-5 pt-4">
                <form>
                    <label htmlFor="Plant_ID" className="font-bold">Plant_ID</label>
                    <select
                        name="Plant_ID"
                        value={PlantId}
                        id="Plant_ID"
                        required
                        className="w-[200px] font-semibold ml-3 p-2 rounded-xl"
                        onChange={handlePlantChange}
                    >
                        <option value="" disabled>Select PlantID</option>
                        {Plants.map((plant) => (
                            <option key={plant.Plant_ID} value={plant.Plant_ID}>
                                {plant.Plant_ID}
                            </option>
                        ))}
                    </select>
                    <label htmlFor="SmbCount" className="font-bold ml-4">SMB Count:</label>
                    <input
                        type="number"
                        name="SmbCount"
                        id="SmbCount"
                        placeholder="Enter SMB Count"
                        value={SmbCount}
                        onChange={(e) => setSmbCount(e.target.value)}
                        className="w-[200px] font-semibold ml-3 p-2 rounded-xl"
                    />
                    <label htmlFor="StringCount" className="font-bold ml-5">String Count:</label>
                    <input
                        type="number"
                        name="StringCount"
                        id="StringCount"
                        placeholder="Enter String Count"
                        value={StringCount}
                        onChange={(e) => setStringCount(e.target.value)}
                        className="w-[200px] font-semibold ml-3 p-2 rounded-xl"
                    />
                    <label htmlFor="PanelCount" className="font-bold ml-5">Panel Count:</label>
                    <input
                        type="number"
                        name="PanelCount"
                        id="PanelCount"
                        placeholder="Enter Panel Count"
                        value={PanelCount}
                        onChange={(e) => setPanelCount(e.target.value)}
                        className="w-[200px] font-semibold ml-3 p-2 rounded-xl"
                    />
                    <button
                        onClick={handleGenerate}
                        className="ml-3 rounded-xl w-[100px] h-10 bg-violet-500 text-white font-bold hover:bg-violet-400 hover:scale-105 duration-200"
                    >
                        Generate
                    </button>
                    {isGenerated && (
                        <button
                            onClick={handleSubmit}
                            className="ml-3 rounded-xl w-[100px] h-10 bg-blue-500 text-white font-bold hover:bg-blue-400 hover:scale-105 duration-200"
                        >
                            Submit
                        </button>
                    )}
                </form>
            </div>
            <LayoutSubmitModal
                plant={PlantId}
                smbCount={SmbCount}
                stringCount={StringCount}
                panelCount={PanelCount}
                showModal={showLayoutModal}
                handleCloseModal={handleCloseLayoutModal}
            />
        </header>
    );
};

export default Navbar;
