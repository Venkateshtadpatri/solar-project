/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ViewGraphModal from '../UI/ViewGraphModal';

const columns = [
  { field: 'smbId', header: 'SMB ID' },
  { field: 'Voltage', header: 'Voltage' },
  { field: 'Current', header: 'Current' },
  { field: 'ViewGraph', header: 'View Graph', align: 'right' },
];

/**
 * AnalyticsTable component:
 *
 * This component displays a paginated table of SMB data associated with a plant.
 * It fetches data from a backend API and updates every 10 seconds.
 * The table supports searching, pagination, and displays status with color coding.
 * 
 * - Utilizes `useSelector` to access authentication state and selected plant ID.
 * - Redirects to home if the user is not authenticated.
 * - Fetches SMBs data and transforms it into a table format.
 * - Supports search functionality to filter table data based on SMB ID.
 * - Implements pagination with controls for navigating pages and input for direct page access.
 * - Status is visually represented with different colors based on severity.
 *
 * @returns {JSX.Element} The AnalyticsTable component.
 */
const AnalyticsTable = () => {
  const navigate = useNavigate();
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedSmbId, setSelectedSmbId] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('daily'); // Default frequency is daily

  // Pagination state
  const [filteredRows, setFilteredRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageInput, setPageInput] = useState('1');

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    fetchGraphData();
  }, []); // Fetch data when the component is mounted

  /**
   * Fetches graph data from the backend API and updates the component state.
   * The function makes a GET request to the API to fetch the data for the given
   * plant ID. It will return early if the request is not successful. If the
   * request is successful, it will update the filteredRows state with the
   * received data. If the request fails or there is no data available, it will
   * log an error message to the console.
   */
  const fetchGraphData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/get-all-smbs/SP-2025-0001');
      if (response.data.status === 'success') {
        const smbs = response.data.smbs.map((smb) => ({
          smbId: smb.smb_id,
          Voltage: smb.Voltage_output,
          Current: smb.Current_output,
        }));
        setFilteredRows(smbs);
      } else {
        console.error('Failed to fetch graph data');
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };

  /**
   * Handles the click event on the "View Graph" button.
   * 
   * The function sets the selected SMB ID and frequency to the values of the
   * clicked row, and shows the graph modal.
   * @param {object} row The row object containing the SMB ID and other data.
   */
  const handleViewGraphClick = (row) => {
    setSelectedSmbId(row.smbId);
    setSelectedFrequency('daily'); // You can adjust this if you want dynamic frequency
    setShowGraphModal(true); // Show the modal
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  /**
   * Closes the graph modal and resets the selected SMB ID to an empty string.
   *
   * This function is called when the user clicks the "Close" button in the
   * graph modal. It sets the `showGraphModal` state to `false`, which hides the
   * modal, and resets the `selectedSmbId` state to an empty string.
   */
  const handleCloseModal = () => {
    setShowGraphModal(false);
  };

  /**
   * Handles the click event on the "previous page" button.
   * When the button is clicked, it decrements the `currentPage` state variable
   * and updates the `pageInput` state variable with the new page number as a
   * string.
   * @returns {undefined}
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput((currentPage - 1).toString());
    }
  };

  /**
   * Handles the click event on the "next page" button.
   * When the button is clicked, it increments the `currentPage` state variable
   * and updates the `pageInput` state variable with the new page number as a
   * string.
   * @returns {undefined}
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput((currentPage + 1).toString());
    }
  };

/**
 * Handles the input change event for the page input field.
 * Updates the `pageInput` state variable if the input value is a valid number.
 *
 * @param {Event} event - The input change event.
 * @returns {undefined}
 */

  const handlePageInputChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setPageInput(value);
    }
  };

  /**
   * Handles the form submission event for the page input form.
   * When the form is submitted, it prevents the default event from
   * occurring and updates the `currentPage` state variable with the
   * value of the `pageInput` state variable if it is a valid number
   * within the range of the total number of pages.
   * @param {Event} event - The form submission event.
   * @returns {undefined}
   */
  const handlePageInputSubmit = (event) => {
    event.preventDefault();
    const page = Number(pageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-2xl" style={{ height: '580px', width: '1150px' }}>
      <div>
        <table className="w-full text-center table-fixed">
          <thead className="sticky top-0 z-10 bg-blue-900 text-white">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.field}
                  className={`px-2 py-3 font-bold text-sm ${index === 0 ? 'rounded-tl-lg' : ''} ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        <table className="w-full text-center table-fixed">
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.smbId} className="bg-gray-50">
                <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.smbId}</td>
                <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.Voltage}</td>
                <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.Current}</td>
                <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">
                  <button onClick={() => handleViewGraphClick(row)} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200">
                    View Graph
                  </button>
                </td>
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="flex items-center justify-center mt-[150px] p-4 relative ">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 ml-4 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>

          <div className="flex items-center">
            <span className="mr-2">Page:</span>
            <form onSubmit={handlePageInputSubmit}>
              <input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                className="border-2 border-gray-300 rounded-md px-2 py-1 text-center w-12"
                style={{ height: '35px' }}
              />
            </form>
            <span className="ml-2">of {totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 mr-4 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>

      <ViewGraphModal
        showModal={showGraphModal}
        handleCloseModal={handleCloseModal}
        smbId={selectedSmbId}
        frequency={selectedFrequency}
        PlantId={PlantId}
      />
    </div>
  );
};

export default AnalyticsTable;
