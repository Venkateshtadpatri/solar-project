/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import MoonLoader from "react-spinners/MoonLoader";
import { useSelector, useDispatch } from "react-redux";
import { incrementReportNumber } from "../../../../redux/reportSlice.jsx";
import getFormattedDateTime from "../UI/getFormattedDateTime.jsx";
import {fetchWeatherData} from "../UI/fetchWeatherData.jsx";
import {Button} from "@mui/material";



/**
 * Creates a PDF report based on the given data and configuration.
 * 
 * @param {Object[]} reportData - Array of objects containing SMB ID and data points.
 * @param {number} reportNumber - The report number to be used in the filename.
 * @param {string} reportType - The type of report to generate. Can be "Daily", "Weekly", "Monthly", or "Yearly".
 * @param {Function} dispatch - The dispatch function from the Redux store.
 * @param {string} todayDate - The current date in the format "YYYY-MM-DD".
 * @param {string} PlantName - The name of the plant.
 * @param {string} StartDate - The start date of the report period in the format "YYYY-MM-DD".
 * @param {string} EndDate - The end date of the report period in the format "YYYY-MM-DD".
 * @returns {Promise<void>}
 */
const createPDF = async (reportData, reportNumber, reportType, dispatch, todayDate , PlantName, StartDate, EndDate) => {
  const now = new Date();
  const DATE = now.toISOString().slice(0, 10);
  const filename = `solar_report_${DATE.replace(/-/g, "")}_${String(reportNumber).padStart(3, "0")}_${reportType}.pdf`;
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageHeight = doc.internal.pageSize.height;
  let currentY = 65;

  /**
   * Checks if the given Y position is close to the bottom of the page.
   * If it is, adds a new page to the document and returns the new Y position.
   * Otherwise, simply returns the given Y position.
   * @param {number} yPosition - The Y position to check.
   * @returns {number} - The new Y position after adding a page if necessary.
   */
  const checkPageBreak = (yPosition) => {
    if (yPosition >= pageHeight - 20) {
      doc.addPage();
      return 20;
    }
    return yPosition;
  };


/**
 * Adds a table to the PDF document at the current Y position with a specified title.
 *
 * This function checks if the current Y position is close to the page bottom
 * and adds a new page if necessary. It then adds a table with the provided
 * title, headers, and data to the PDF document, updating the current Y position
 * for subsequent elements.
 *
 * @param {string} title - The title of the table to be displayed above the table.
 * @param {Array} head - An array representing the table headers.
 * @param {Array} body - A 2D array representing the table data, where each inner array corresponds to a row.
 */

  const addTable = (title, head, body) => {
    currentY = checkPageBreak(currentY);
    doc.setFontSize(14).setFont("helvetica", "bold").text(title, 10, currentY);
    currentY = checkPageBreak(currentY + 8);
    doc.autoTable({
      startY: currentY,
      head: [head],
      body,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 58, 138], textColor: "#fff", fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    currentY = doc.autoTable.previous.finalY + 20;
  };

  // Title & Metadata
  doc.setFont("helvetica", "bold").setFontSize(20).text("Solar Panel Monitoring Report", 150, 15, { align: "center" });
  doc.setFontSize(12).text(`Plant Name: ${PlantName}`,10, 25);
  doc.setFontSize(12).text(`Start Date: ${StartDate}`,10, 35);
  doc.setFontSize(12).text(`Report Created At: ${todayDate}`, 160, 25);
  doc.setFontSize(12).text(`End Date: ${EndDate}`, 160, 35);

  // Weather Data
  const weatherData = await fetchWeatherData("Hyderabad", DATE);
  if (weatherData.length > 0) {
    addTable("Weather Data:", ["Date", "Temp (°C)", "Solar Irradiance (W/m²)", "Wind Speed (m/s)", "Humidity (%)"],
        weatherData.map(wd => [wd?.date, wd?.temperature, wd?.solarIrradiance, wd?.windSpeed, wd?.humidity]));
  }

  const panelArea = 10, panelEfficiency = 18, installedCapacity = 10;

  reportData.forEach((smb) => {
    if (!smb?.smb_id) return;
    currentY = checkPageBreak(currentY);
    doc.setFontSize(14).text(`SMB ID: ${smb.smb_id}`, 10, currentY);
    currentY += 10;

    let totalEnergy = 0, peakPower = 0, totalIrradiance = 0, timeSum = 0;
    const analyticsData = [], faultsData = [];

    smb.data.forEach((entry) => {
      if (!entry?.date) return;
      currentY = checkPageBreak(currentY);
      (Array.isArray(entry.analytics) ? entry.analytics : [entry.analytics]).forEach((analytic) => {
        if (!analytic) return;
        const power = (analytic.voltage_real * analytic.current_real) / 1000;
        peakPower = Math.max(peakPower, power);
        totalEnergy += power;
        timeSum++;
        totalIrradiance += (power * 1000) / (panelArea * (panelEfficiency / 100));
        analyticsData.push([
          reportType === 'Daily' ? analytic.timestamp : entry.date,
          analytic.current_real, analytic.current_expected,
          analytic.voltage_real, analytic.voltage_expected,
          analytic.temperature, power.toFixed(2)
        ]);
      });
      entry.faults.forEach((fault) => {
        faultsData.push([
          entry.date, fault.alertID, fault.alert_name,
          fault.severity_level, fault.action_required,
          fault.status === 'inComplete' ? "INCOMPLETE" : 'COMPLETE'
        ]);
      });
    });

    const avgEfficiency = ((totalEnergy / (peakPower * timeSum)) * 100) || 0;
    const PR = ((totalEnergy / (totalIrradiance * panelArea)) * 100) || 0;
    const CUF = ((totalEnergy / (installedCapacity * timeSum)) * 100) || 0;

    addTable("Solar Performance Metrics:", ["Metric", "Value"], [
      ["Peak Power Output (kW)", peakPower.toFixed(2)],
      ["Total Energy Generated (kWh)", totalEnergy.toFixed(2)],
      ["Average Efficiency (%)", avgEfficiency.toFixed(2)],
      ["Performance Ratio (PR%)", PR.toFixed(2)],
      ["Capacity Utilization Factor (CUF%)", CUF.toFixed(2)]
    ]);

    if (analyticsData.length > 0) {
      addTable("Analytics Data:", ["Date", "Current Real (A)", "Current Expected (A)", "Voltage Real (V)", "Voltage Expected (V)", "Temperature (°C)", "Power (kW)"], analyticsData);
    }

    if (faultsData.length > 0) {
      addTable("Faults Detected:", ["Date", "Alert ID", "Name", "Severity", "Action Required", "Status"], faultsData);
    }
  });

  doc.save(`reports/${filename}`);
  dispatch(incrementReportNumber());
};




/**
 * ReportGeneration component
 *
 * This component renders a page for generating reports of solar performance
 * metrics for a selected solar plant. It fetches SMB data from the API and
 * provides a dropdown for selecting SMB IDs. The user can select a report type
 * and data type, and input start and end dates for the report. The component
 * then generates a PDF report based on the selected SMB IDs and date range.
 *
 * @param {boolean} isAuth - Whether the user is authenticated or not
 * @param {string} PlantName - The name of the selected plant
 * @returns {JSX.Element} The rendered component
 */


const ReportGeneration = ({ isAuth, PlantName }) => {
  const navigate = useNavigate(); // Navigation object for redirecting
  const PlantId = useSelector((state) => state.auth.PlantId); // Get PlantId from Redux store
  const dispatch = useDispatch();
  const reportNumber = useSelector((state) => state.report.reportNumber);
  const [smbData, setSmbData] = useState([]); // SMB data from API
  const [selectedIds, setSelectedIds] = useState([]); // Selected SMB IDs
  const [StartDate, setStartDate] = useState("");  // Start date
  const [EndDate, setEndDate] = useState(""); // End date
  const [searchSMB, setSearchSMB] = useState(""); // Search query for filtering SMB IDs
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Flag for dropdown visibility
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(""); // Selected report types
  const [selectedDataType, setSelectedDataType] = useState(""); // Selected data types
  const dropdownRef = useRef(null); // Ref for the dropdown
  const [loading, setLoading] = useState(false);
  const todayDate = getFormattedDateTime();

  useEffect(() => {
    if (!isAuth) {
      navigate("/"); // Redirect to home page if not authenticated
    }
  }, [isAuth, navigate]);
  // Close dropdown when clicking outside
  useEffect(() => {
    /**
     * Handles clicks outside the dropdown to close it.
     *
     * @param {Event} event - The event object
     */
    const handleClickOutside = (event) => {
      event.stopPropagation();
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Fetch SMB data on component mount and when PlantId changes
  useEffect(() => {

/**
 * Fetches SMB data for the selected plant.
 *
 * This asynchronous function makes a GET request to the backend API to 
 * retrieve all SMBs associated with the currently selected PlantId. 
 * The fetched SMB data is then set in the component's state.
 *
 * @returns {Promise<void>} A promise that resolves when the SMB data is fetched.
 * @throws Will log an error message if the API request fails.
 */

    const fetchSMBs = async () => {
      if (!PlantId) return; // Don't fetch if no PlantId is selected
      try {
        const response = await axios.get(
            `http://127.0.0.1:8000/api/get-all-smbs/${PlantId}`
        );
        setSmbData(response.data.smbs);
      } catch (error) {
        console.error("Error fetching SMBs:", error);
      }
    };
    fetchSMBs();
  }, [PlantId]);



  /**
   * Toggles the selection of all SMBs in the list.
   *
   * If all SMBs are currently selected, this function will deselect all of them.
   * If no SMBs are currently selected, this function will select all of them.
   *
   * @returns {void} No return value.
   */
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(smbData.map((smb) => smb.smb_id)); // Select all
    }
    setIsAllSelected(!isAllSelected); // Toggle the selection state
  };

/**
 * Toggles the selection state of a specified SMB ID.
 *
 * This function updates the list of selected SMB IDs by either adding
 * or removing the specified ID. If the ID is already selected, it will
 * be removed from the selection. If the ID is not selected, it will be
 * added.
 *
 * @param {string | number} id - The ID of the SMB to toggle selection for.
 * @returns {void} No return value.
 */

  const handleSmbIdSelection = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((smbId) => smbId !== id)); // Deselect
    } else {
      setSelectedIds([...selectedIds, id]); // Select
    }
  };

  useEffect(() => {
    setIsAllSelected(selectedIds.length === smbData.length && smbData.length > 0); // Update Select All state
  }, [selectedIds, smbData]);

/**
 * Generates a report based on selected parameters and creates a PDF file.
 *
 * This asynchronous function sends a POST request to the backend API with
 * report generation parameters including start and end dates, report type,
 * data type, and selected SMB IDs. Upon successful generation, it creates a
 * PDF report using the response data and updates the report number in the
 * Redux store. Handles loading state and logs any errors encountered.
 *
 * @returns {Promise<void>} A promise that resolves when the report generation
 * process is complete.
 */

  const generateReport = async () => {
    setLoading(true);
    try {
      const reportData = {
        start_date: StartDate,
        end_date: EndDate,
        report_type: selectedReportType,
        data_type: selectedDataType,
        smbs: selectedIds,
      }
      console.log(reportData);
      const response = await axios.post(`http://127.0.0.1:8000/api/generate_report/`, reportData);
      if (response.data.status === "success") {
        console.log("Report generated:", response.data);
        createPDF(response.data.report_data, reportNumber, selectedReportType, dispatch, todayDate, PlantName, StartDate, EndDate);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
      // setSelectedReportType(""); // Clear selections
      // setSelectedDataType("");
      // setSelectedIds([]);
      // setStartDate(""); // Clear dates
      // setEndDate("");
    }
  };

  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  return (
      <div className="mx-auto space-y-6">
        {/* Type of Report */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Type of Report:</h1>
          <div className="flex gap-20 space-x-4">
            {["Daily", "Weekly", "Monthly", "Yearly"].map((option) => (
                <div key={option} className="flex items-center  space-x-2">
                  <input
                      type="radio"
                      id={option}
                      name="reportType"
                      value={option}
                      checked={selectedReportType === option}
                      onChange={() => setSelectedReportType(option)}
                      className="rounded text-blue-600 focus:ring-2 focus:ring-blue-400"
                  />
                  <label htmlFor={option} className="text-gray-700 font-medium">
                    {option}
                  </label>
                </div>
            ))}
          </div>
        </div>

        {/* Type of Data */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Type of Data:</h1>
          <div className="flex gap-20 space-x-4">
            {["analytics", "faults", "all"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                      type="radio"
                      id={option}
                      name="dataType"
                      value={option}
                      checked={selectedDataType === option}
                      onChange={() => setSelectedDataType(option)}
                      className="rounded text-blue-600 focus:ring-2 focus:ring-blue-400"
                  />
                  <label htmlFor={option} className="text-gray-700 font-medium">
                    {option}
                  </label>
                </div>
            ))}
          </div>
        </div>

        {/* Date Pickers */}
        <div className="flex space-x-6 justify-between">
          <div className="flex flex-col">
            <label htmlFor="StartDate" className="text-gray-700 font-medium mb-2">
              Start Date
            </label>
            <input
                type="date"
                id="StartDate"
                value={StartDate}
                name="StartDate"
                onChange={(e) => setStartDate(e.target.value)}
                max={today}
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="EndDate" className="text-gray-700 font-medium mb-2">
              End Date
            </label>
            <input
                type="date"
                id="EndDate"
                value={EndDate}
                onChange={(e) => setEndDate(e.target.value)}
                name="EndDate"
                max={today}
                required
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex justify-center mt-[5px]">
            <div className="relative" ref={dropdownRef}>
              <label className="text-gray-700 font-medium mb-2">Select SMB IDs</label>
              <div
                  className="border border-gray-300 rounded-lg px-4 py-2 flex justify-between items-center cursor-pointer"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
            <span className="text-gray-700">
              {selectedIds.length > 0 ? `${selectedIds.length} SMB(s) selected` : "Select SMB IDs"}
            </span>
                <span className="text-gray-500">{isDropdownOpen ? "▲" : "▼"}</span>
              </div>
              {isDropdownOpen && (
                  <div
                      className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                    <input
                        type="text"
                        placeholder="Search SMB ID"
                        value={searchSMB}
                        onChange={(e) => setSearchSMB(e.target.value)}
                        className="w-full p-2 border-b border-gray-300 focus:outline-none"
                    />
                    <ul>
                      <li className="p-2 cursor-pointer flex items-center" onClick={handleSelectAll}>
                        <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} className="mr-2"/>
                        Select All
                      </li>
                      {smbData
                          .filter((smb) => smb.smb_id.toLowerCase().includes(searchSMB.toLowerCase()))
                          .map((smb) => (
                              <li
                                  key={smb.smb_id}
                                  className="p-2 cursor-pointer flex items-center"
                                  onClick={() => handleSmbIdSelection(smb.smb_id)}
                              >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(smb.smb_id)}
                                    onChange={() => handleSmbIdSelection(smb.smb_id)}
                                    className="mr-2"
                                />
                                {smb.smb_id}
                              </li>
                          ))}
                    </ul>
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-Select Dropdown for SMB IDs */}


        {/* Generate Report Button */}
        <div className="flex justify-center">
          <Button
              onClick={generateReport}
              type="submit"
              variant="contained"
              size="large"
              disabled={!StartDate || !EndDate || selectedIds.length === 0 || !selectedReportType || !selectedDataType}
              className="w-[20%] bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-600"
          >
            {loading ? <MoonLoader color="#fff" size={15} /> : "Generate Report"}
          </Button>
        </div>
      </div>
  );
};

export default ReportGeneration;
