import { useState, useEffect } from "react";
import ViewNavbar from "../UI/ViewNavbar.jsx";
import axios from "axios";
import '../../components/pages/Generate/Generate.css'
import ViewWorkspace from "../UI/ViewWorkspace.jsx";

/**
 * The View component renders a page with a Navbar and a Workspace.
 *
 * It manages the state of the selected plant ID and SMB ID.
 * It fetches the list of all available solar plants and the details of the selected plant.
 * It renders a Navbar component with the list of plants, and a Workspace component with the details of the selected plant.
 *
 * @returns {JSX.Element} The rendered View component
 */
const View = () => {
  const [SelectedPlantId, setSelectedPlantId] = useState(""); // Manage SelectedPlantId here
  const [SelectedSMBID, setSelectedSMBID] = useState(""); // Manage SelectedSMBID here
  const [plantDetails, setPlantDetails] = useState([]); // Details of the selected plant
  const [Plants, setPlants] = useState([]);
  const [SMBs, setSMBs] = useState([]);
  // Extract SmbCount, StringCount, and PanelCount from plantDetails
  const SmbCount = plantDetails?.data?.SMBCount ? parseInt(plantDetails.data.SMBCount, 10) : 0;
  const StringCount = plantDetails?.data?.StringCount ? parseInt(plantDetails.data.StringCount, 10) : 0;
  const PanelCount = plantDetails?.data?.PanelCount ? parseInt(plantDetails.data.PanelCount, 10) : 0;

  // Fetch list of all available solar plants
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/solar-plants/");
        setPlants(response.data.plants);
      } catch (error) {
        console.error("Error fetching plant list:", error);
      }
    };
    fetchPlants();
  }, []);

  useEffect(() => {
  /**
   * Fetches the list of SMBs associated with the selected solar plant.
   *
   * This function is called whenever the SelectedPlantId state changes.
   * It fetches the list of SMBs from the backend API and updates the SMBs state.
   * If the API request fails, it logs an error message to the console.
   */
    const fetchSMBs  = async () => {
      if (!SelectedPlantId) return; // Don't fetch if no PlantId is selected
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/get-all-smbs/${SelectedPlantId}`);
        setSMBs(response.data.smbs);
      } catch (error) {
        console.error("Error fetching SMBs:", error);
      }
    };
    fetchSMBs();
  },[SelectedPlantId])

  // Fetch details of the selected plant when SelectedPlantId changes
  useEffect(() => {
/**
 * Fetches the details of the selected solar plant from the backend API.
 *
 * This asynchronous function makes a GET request to retrieve details of the plant
 * with the specified `SelectedPlantId`. Upon successful retrieval, it updates
 * the `plantDetails` state with the response data. If no `SelectedPlantId` is
 * provided, the function returns early without making a request.
 * If the request fails, an error message is logged to the console.
 */

    const fetchPlantDetails = async () => {
      if (!SelectedPlantId) return; // Don't fetch if no PlantId is selected

      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/get-details/${SelectedPlantId}/`);
        setPlantDetails(response.data); // Set plant details
      } catch (error) {
        console.error("Error fetching plant details:", error);
      }
    };
    fetchPlantDetails();
  }, [SelectedPlantId]);


  return (
      <>
        <ViewNavbar
            SelectedPlantId={SelectedPlantId} // Pass SelectedPlantId to ViewNavbar
            setSelectedPlantId={setSelectedPlantId} // Pass function to update it
            SelectedSMBID={SelectedSMBID}
            setSelectedSMBID={setSelectedSMBID}
            Plants={Plants}
            SMBs={SMBs}
            SmbCount={SmbCount}
            StringCount={StringCount}
            PanelCount={PanelCount}
        />
        <ViewWorkspace
            SmbCount={SmbCount}
            StringCount={StringCount}
            PanelCount={PanelCount}
            SelectedPlantId={SelectedPlantId} // Pass plant ID to ViewWorkspace
            SelectedSMBID={SelectedSMBID}
        />
      </>
  );
};

export default View;