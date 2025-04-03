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
  { field: 'TaskDetails', header: 'Task Details' },
];

/**
 * A React component that displays a list of upcoming maintenance tasks for a specific plant.
 * The component fetches data from the backend API at a 10-second interval and displays it in a table.
 * The table has columns for the task ID, task name, schedule date, and status.
 * The component also includes a search bar to filter the displayed tasks, and pagination controls to navigate through the list of tasks.
 * If the user is not authenticated, the component redirects to the login page.
 * @returns {JSX.Element} The JSX element representing the component.
 */
const UpComingMaintenance = () => {
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
   * Fetches upcoming maintenance tasks for a given plant ID from the backend API and
   * updates the component state. The data is fetched at a 10-second interval.
   * The function only fetches data if the PlantId is set.
   * The data is transformed into a table format before being set to the state.
   * If the API request fails, an error message is logged to the console.
   */
  const fetchMaintenances = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/upcoming-maintenance/${PlantId}`);
      const MaintenanceData = response.data.tasks.map((Maintenance) => ({
        taskId: Maintenance.task_ID,
        taskName: Maintenance.task_name,
        schedule_date: Maintenance.schedule_date,
        status: Maintenance.status,
        taskDescription: Maintenance.task_description,
      }));
  
      setTasks(MaintenanceData);
      setFilteredRows(MaintenanceData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

/**
 * Handles the change event for the search input field.
 * Updates the search query state and filters the rows based on the query.
 * Resets the pagination to the first page when the search query changes.
 * 
 * @param {Event} event - The input change event containing the search query.
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

/**
 * Handles the event when a task is clicked.
 * Sets the selected task in the state and opens the update task modal.
 * 
 * @param {Object} task - The task that was clicked.
 */

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowUpdateTaskModal(true);
  };

  /**
   * Closes the update task modal and resets the selected task to null.
   * 
   * @function
   */
  const handleCloseUpdateTaskModal = () => {
    setShowUpdateTaskModal(false);
    setSelectedTask(null);
  
  };
  /**
   * Handles the "previous page" button click by decrementing the `currentPage`
   * state variable and updating the `pageInput` state variable accordingly.
   *
   * @returns {undefined}
   */
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(currentPage - 1); // Update page input when changing page
    }
  };

  /**
   * Handles the "next page" button click by incrementing the `currentPage`
   * state variable and updating the `pageInput` state variable accordingly.
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
                    <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200" onClick={() => handleTaskClick(row)}>
                      View
                     </button>
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
      <UpdateTaskModal 
      showModal={showUpdateTaskModal}
      handleCloseModal={handleCloseUpdateTaskModal}
      task={selectedTask}
      PlantId={PlantId}
      />
    </div>
  );
};

export default UpComingMaintenance;
