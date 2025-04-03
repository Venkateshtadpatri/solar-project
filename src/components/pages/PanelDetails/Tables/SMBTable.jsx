/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const columns = [
  { field: 'smbId', header: 'SMB ID' },
  { field: 'StringCount', header: 'String Count' },
  { field: 'TotalEnergyOutput', header: 'Total Energy Output' },
];

/**
 * SMBTable component:
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
 * @returns {JSX.Element} The SMBTable component.
 */
const SMBTable = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const navigate = useNavigate();
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage);
  const rowsPerPage = 15;
  const fetchInterval = useRef(null);
// State for plantId

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else {
      fetchSMBs();
      fetchInterval.current = setInterval(fetchSMBs, 10000);
    }

    return () => {
      clearInterval(fetchInterval.current);
    };
  }, [isAuth, navigate]);
  /**
   * Fetches SMB data from the backend API and sets it to the component state.
   * The data is fetched at a 10-second interval.
   * The function only fetches data if the PlantId is set.
   * The data is transformed into a table format before being set to the state.
   * If the API request fails, an error message is logged to the console.
   */
    const fetchSMBs = async () => {
 // Fetch SMBs only if plantId is set
        try {
          // Use path parameter for the plantId
          const response = await axios.get(`http://127.0.0.1:8000/api/get-all-smbs/${PlantId}`);
          const smbs = response.data.smbs.map((smb) => ({
            smbId: smb.smb_id,
            StringCount: smb.String_count,
            TotalPowerOutput: smb.Power_output
          }));
          setFilteredRows(smbs);
        } catch (error) {
          console.error('Error fetching SMB data:', error);
        }
    };
  // Search functionality
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredRows(
      filteredRows.filter((row) =>
        row.smbId.toLowerCase().includes(query.toLowerCase())
      )
    );
    setCurrentPage(1);
    setPageInput(1); // Reset to first page when search query changes
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

/**
 * Decrements the current page number by 1 if the current page is greater than 1.
 * Updates both the `currentPage` and `pageInput` state variables to reflect the new page number.
 *
 * @returns {undefined}
 */

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(currentPage - 1);
    }
  };

  /**
   * Increments the current page number by 1 if the current page is less than
   * the total number of pages.
   * Updates both the `currentPage` and `pageInput` state variables to reflect
   * the new page number.
   *
   * @returns {undefined}
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(currentPage + 1);
    }
  };

/**
 * Handles the input change event for the page input field.
 * If the input value is a valid number, it updates the `pageInput` state
 * variable with the new value.
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
      <>
        <div className="flex justify-center flex-col relative">
        <div className="w-full">
          <div className="mb-3 flex justify-between">
            <input
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search SMB ID"
                style={{
                  width: '200px',
                  height: '40px',
                  border: '2px solid gray',
                  padding: '0.5rem',
                  borderRadius: '20px'
                }}
            />
          </div>
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

          {/* Table container with scrollable content */}
          <div className="overflow-y-auto" style={{maxHeight: '400px'}}>
            <table className="w-full text-center table-fixed">
              <tbody>
              {currentRows.map((row) => (
                  <tr key={`${row.smbId}`} className="bg-gray-50">
                    <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.smbId}</td>
                    <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.StringCount}</td>
                    <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.TotalPowerOutput}</td>
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
          </div>

          {/* Pagination controls */}
        </div>
       
      </div>
  <div className="flex gap-[450px] items-center fixed translate-y-[180px]">
    <button
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-500 ml-4 text-white rounded disabled:bg-gray-300"
    >
      Previous
    </button>

    {/* Input field to navigate to a specific page */}
    <div className="flex items-center justify-center">
      <span className="mr-2">Page:</span>
      <form onSubmit={handlePageInputSubmit}>
        <input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            className="border-2 border-gray-300 rounded-md px-2 py-1 text-center w-12"
            style={{height: '35px'}}
        />
      </form>
      <span className="ml-2">of</span>
      <span className="ml-2">{totalPages}</span>
    </div>

    <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-blue-500 mr-4 text-white rounded disabled:bg-gray-300"
    >
      Next
    </button>
  </div>
  </>
)
  ;
};

export default SMBTable;
