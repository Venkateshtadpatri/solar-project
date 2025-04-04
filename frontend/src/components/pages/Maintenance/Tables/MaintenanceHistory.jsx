/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UpdateTaskModal from '../UI/UpdateTaskModal';


const columns = [
  { field: 'taskId', header: 'Task ID' },
  { field: 'taskName', header: 'Task Name' },
  { field: 'ScheduleDate', header: 'Schedule Date' },
  { field: 'Status', header: 'Status' },
  { field: 'completedDate', header: 'Completed Date' },
];

/**
 * A React component that displays the maintenance history for a specific plant.
 * @constructor
 * @returns {JSX.Element} The JSX element representing the component.
 */
const MaintenanceHistory = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const [tasks, setTasks] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage);
  const rowsPerPage = 12;


  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else {
      fetchMaintenances();
      const interval = setInterval(fetchMaintenances, 10000);
      
      return () => clearInterval(interval);
    }
  }, [isAuth, navigate]); 

  /**
   * Fetches maintenance history data from the backend API and sets it to the component state.
   * The data is fetched at a 10-second interval.
   * The function only fetches data if the PlantId is set.
   * The data is transformed into a table format before being set to the state.
   * If the API request fails, an error message is logged to the console.
   */
  const fetchMaintenances = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_maintenace_history/${PlantId}`);
      const MaintenanceData = response.data.tasks.map((Maintenance) => ({
        taskId: Maintenance.task_ID,
        taskName: Maintenance.task_name,
        schedule_date: Maintenance.schedule_date,
        status: Maintenance.status,
        completed_date: Maintenance.completed_date,
      }));
  
      setTasks(MaintenanceData);
      setFilteredRows(MaintenanceData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

/**
 * Handles changes in the search input field.
 * Updates the search query state and filters the rows based on the query.
 * Filters rows by checking if the query is included in any of the row's
 * taskId, taskName, schedule_date, or status fields (case insensitive).
 * Resets the current page and page input to the first page upon search query change.
 *
 * @param {Object} event - The input change event containing the search query.
 */

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredRows(
      filteredRows.filter(
        (row) =>
          row.taskId.toLowerCase().includes(query.toLowerCase()) ||
          row.taskName.toLowerCase().includes(query.toLowerCase()) ||
          row.schedule_date.toLowerCase().includes(query.toLowerCase()) ||
          row.status.toLowerCase().includes(query.toLowerCase())
      )
    );
    setCurrentPage(1); // Reset to first page when search query changes
    setPageInput(1); // Reset page input when search query changes
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowUpdateTaskModal(true);
  };

  const handleCloseUpdateTaskModal = () => {
    setShowUpdateTaskModal(false);
    setSelectedTask(null);
  
  };
/**
 * Decrements the current page number by 1 if the current page is greater than 1.
 * Updates both the `currentPage` and `pageInput` state variables to reflect
 * the new page number.
 */

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(currentPage - 1); // Update page input when changing page
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
      setPageInput(currentPage + 1); // Update page input when changing page
    }
  };

/**
 * Handles the input change event for the page input field.
 * Validates the input to ensure it consists only of digits.
 * If valid, updates the `pageInput` state with the new value.
 * 
 * @param {Object} event - The input change event containing the new value.
 */

  const handlePageInputChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setPageInput(value);
    }
  };

/**
 * Handles the form submission event for the page input form.
 * Prevents the default form submission behavior and updates the
 * current page if the input page number is valid.
 *
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
      <div className="mb-2 ml-2">
        <input
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search"
          className="border-2 border-gray-300 rounded-md px-4 py-2 mt-3"
          style={{ width: '200px', height: '40px' }}
        />
      </div>
      
      {/* Header (thead) */}
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

      {/* Scrollable tbody container */}
      <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
        <table className="w-full text-center table-fixed">
          <tbody>
            {filteredRows.length > 0 ? (
              currentRows.map((row, index) => (
                  <tr key={`${row.taskId}`} className="bg-gray-50">
                    <td className="border-b-2 border-gray-300 py-2 font-bold text-sm text-center">
                      {row.taskId}
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-sm text-center">
                      {row.taskName}
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-sm text-center">
                      {row.schedule_date}
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-sm text-center">
                      {row.status}
                    </td>
                    <td className="border-b-2 p-2 border-gray-300 font-bold text-sm text-center">
                      {row.completed_date}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center p-4">
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 ml-4 text-white rounded disabled:bg-gray-300"
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
  );
};

export default MaintenanceHistory;
