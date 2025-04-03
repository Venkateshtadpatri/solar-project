/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import LayoutSubmitModal from "../../UI/LayoutSubmitModal";

/**
 * A Navbar component for the Generate page.
 *
 * This component renders a form with the following fields:
 * - A select dropdown for selecting a plant ID
 * - Three input fields for entering SMB Count, String Count, and Panel Count respectively
 * - A Generate button that generates the plant layout based on the given counts
 * - A Submit button that submits the generated layout to the backend API
 *
 * The component also renders a LayoutSubmitModal component that displays the generated layout
 * and allows the user to submit it to the backend API.
 *
 * @param {Function} setCounts - A function to set the counts in the parent component
 * @returns {JSX.Element} The Navbar component
 */
const Navbar = ({ setCounts }) => {
    const [Plants, setPlants] = useState([]);
    const [PlantId, setPlantId] = useState("");
    const [SmbCount, setSmbCount] = useState("");
    const [PanelCount, setPanelCount] = useState("");
    const [StringCount, setStringCount] = useState("");
    const [isGenerated, setIsGenerated] = useState(false);
    const [isView, setIsView] = useState(false);
    const [showLayoutModal, setShowLayoutModal] = useState(false);

/**
 * Handles the generation of plant layout based on the specified counts.
 *
 * This function prevents the default form submission behavior and updates
 * the parent component with the parsed integer values of SMB Count, String Count,
 * and Panel Count. It also sets the `isGenerated` state to `true` to show the
 * Submit button after the generation process.
 *
 * @param {Event} e - The event object from the form submission.
 */

    const handleGenerate = (e) => {
        e.preventDefault();
        setCounts({
            SmbCount: parseInt(SmbCount || 0, 10),
            StringCount: parseInt(StringCount || 0, 10),
            PanelCount: parseInt(PanelCount || 0, 10),
        });
        setIsGenerated(true); // Show the Submit button after generation
    };

/**
 * Handles the form submission to display the layout modal.
 *
 * This function prevents the default form submission behavior
 * and sets the `showLayoutModal` state to `true`, which triggers
 * the display of the layout submission modal.
 *
 * @param {Event} e - The form submission event.
 */

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowLayoutModal(true);
    };

/**
 * Closes the layout submission modal.
 *
 * This function simply sets the `showLayoutModal` state to `false`, which
 * hides the layout submission modal.
 */
    const handleCloseLayoutModal = () => {
        setShowLayoutModal(false);
    };

    useEffect(() => {
        /**
         * Fetches solar plant data from the backend API and updates the `Plants` state.
         *
         * This asynchronous function makes a GET request to the backend API to retrieve
         * a list of solar plants. Upon a successful request, the `Plants` state is updated
         * with the data received. If the request fails, an error message is logged to the console.
         *
         * @returns {Promise<void>} A promise that resolves when data fetching is complete.
         */
        const fetchData = async () => {
            try {

                const response = await axios.get("http://127.0.0.1:8000/api/solar-plants/");
                setPlants(response.data.plants);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    /**
     * Handles the change of the selected plant ID in the dropdown.
     *
     * This function updates the `PlantId` state with the selected value from the dropdown.
     *
     * @param {Event} event - The event object from the select element's change event.
     */
    const handlePlantChange = (event) => {
        setPlantId(event.target.value);
    };

    return (
        <header className="w-full h-[100px] bg-red-400 sticky top-0 z-50">
            <div className="ml-5 pt-4 pb-4">
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
                        <option value="" disabled className="text-gray-40">Select PlantID</option>
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
