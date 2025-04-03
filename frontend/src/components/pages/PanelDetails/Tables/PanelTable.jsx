/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const columns = [
  { field: 'smbId', header: 'SMB ID' },
  { field: 'stringId', header: 'String ID' },
  { field: 'status', header: 'String Status' },
  { field: 'totalEnergyOutput', header: 'Total Energy Output (kWh)', align: 'right' },
];

/**
 * PanelTable component:
 *
 * This component displays a paginated table of string data associated with a plant.
 * It fetches data from a backend API and updates every 10 seconds.
 * The table supports searching, pagination, and displays status with color coding.
 * 
 * - Utilizes `useSelector` to access authentication state and selected plant ID.
 * - Redirects to home if the user is not authenticated.
 * - Fetches strings data and transforms it into a table format.
 * - Supports search functionality to filter table data based on SMB ID, String ID, and status.
 * - Implements pagination with controls for navigating pages and input for direct page access.
 * - Status is visually represented with different colors based on severity.
 *
 * @returns {JSX.Element} The PanelTable component.
 */

export default function PanelTable() {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const navigate = useNavigate();
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage);
  const rowsPerPage = 15;
  const fetchInterval = useRef(null);

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else {
      fetchStrings();
      fetchInterval.current = setInterval(fetchStrings, 10000);
    }

    return () => {
      clearInterval(fetchInterval.current);
    };
  }, [isAuth, navigate]);

/**
 * Returns a string representing CSS classes for background and text color
 * based on the status provided.
 *
 * @param {string} status - The status which can be 'Critical', 'Online', 'Warning', or any other string.
 * @returns {string} A string containing the CSS classes for styling.
 * - 'Critical' returns red background and border with black text.
 * - 'Online' returns green background and border with black text.
 * - 'Warning' returns yellow background and border with black text.
 * - Any other status returns gray background.
 */

  const getStatusColor = (status) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-100 border-2 border-red-500 text-black';
      case 'Online':
        return 'bg-green-100 border-2 border-green-500 text-black';
      case 'Warning':
        return 'bg-yellow-100 border-2 border-yellow-500 text-black';
      default:
        return 'bg-gray-200';
    }
  };

/**
 * Fetches string data from the backend API and updates the `filteredRows` state.
 *
 * @async
 * @throws Will log an error message in case of a failed API request or unsuccessful response status.
 */
  const fetchStrings = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_all_strings/${PlantId}`);
      const stringsData = response.data.Strings_Data;

      // Flatten the Strings_Data and transform it into a proper table format
      const rows = stringsData.flatMap((data) =>
        data.Strings.map((string) => ({
          smbId: string.SMB_ID,
          stringId: string.String_ID,
          status: string.Status,
          totalEnergyOutput: string.Power_Output,
        }))
      );

      setFilteredRows(rows);
    } catch (error) {
      console.error('Error fetching strings data:', error);
    }
  };

  // Search functionality
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredRows(
      filteredRows.filter((row) =>
        row.smbId.toLowerCase().includes(query.toLowerCase()) ||
        row.stringId.toLowerCase().includes(query.toLowerCase()) ||
        row.status.toLowerCase().includes(query.toLowerCase())
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
   * Handles the "previous page" button click by decrementing the `currentPage`
   * state variable and updating the `pageInput` state variable accordingly.
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
 * Advances to the next page by incrementing the `currentPage` state variable
 * and updating the `pageInput` state variable accordingly. The function
 * ensures that the current page does not exceed the total number of pages.
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
          <div className="mb-3">
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search"
              style={{
                width: '200px',
                height: '40px',
                border: '2px solid gray',
                padding: '0.5rem',
                borderRadius: '20px',
              }}
            />
          </div>
          {/* Header table */}
          <div>
            <table className="w-full text-center table-fixed">
              <thead className="sticky top-0 z-10 bg-blue-900 text-white">
                <tr>
                  {columns.map((col, index) => (
                    <th
                      key={col.field}
                      className={`px-2 py-3 font-bold text-sm ${
                        index === 0 ? 'rounded-tl-lg' : ''
                      } ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '400px', marginBottom: '2rem' }}>
            <table className="w-full text-center table-fixed">
              <tbody>
                {filteredRows.length > 0 ? (
                  currentRows.map((row) => (
                    <tr key={`${row.smbId}-${row.stringId}`}>
                      <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.smbId}</td>
                      <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.stringId}</td>
                      <td className="border-b-2 py-1 border-gray-300 font-bold text-sm text-center">
                        <div className={`w-16 p-1 ${getStatusColor(row.status)} rounded-xl mx-auto`}>
                          {row.status}
                        </div>
                      </td>
                      <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">
                        {row.totalEnergyOutput.toFixed(2)} KWh
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="flex items-center justify-center mt-[150px] p-4 relative">
                      No results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between items-center -mt-4 px-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>

          {/* Input field to navigate to a specific page */}
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
            <span className="ml-2">of</span>
            <span className="ml-2">{totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
