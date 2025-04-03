/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAdminCount } from '../../redux/PlantSlice';
import ViewAdminModal from '../UI/ViewAdminModal';
import AdminUpdateModal from '../UI/AdminUpdateModal';
import AdminDeleteModal from '../UI/AdminDeleteModal';
const columns = [
  { field: 'Sno', header: 'Sno' },
  { field: 'AdminUserId', header: 'Admin User Id' },
  { field: 'Actions', header: 'Actions' },
];



/**
 * AdminDetailsTable component:
 *
 * This component renders a table with a list of administrators along with
 * their details. It also provides functionality to view, update and delete
 * the administrators. The component also includes pagination controls to
 * navigate through the list of administrators.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function AdminDetailsTable() {
  const dispatch = useDispatch();
  const [showViewAdminModal, setShowViewAdminModal] = useState(false);
  const [showAdminUpdateModal, setAdminUpdateModal] = useState(false);
  const [showAdminDeleteModal, setShowAdminDeleteModal] = useState(false);
  const [Admins, setAdmins] = useState([]); // Store full plant details here
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [filteredRows, setFilteredRows] = useState([]);
  const fetchInterval = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage);
  const rowsPerPage = 15;
  useEffect(() => {
    fetchAdminDetails();
    fetchInterval.current = setInterval(fetchAdminDetails, 5000);

    return () => {
      clearInterval(fetchInterval.current);
    };
  },[]);


/**
 * Fetches the list of administrators from the backend API and updates the component state.
 *
 * This function makes a GET request to the backend API to retrieve the details
 * of all administrators. Upon a successful response, it updates the `Admins`
 * state with the full list of administrators and transforms the data to update
 * `filteredRows`, containing select details for table display.
 * Additionally, it dispatches an action to set the admin count in the Redux store.
 *
 * If the API request fails, an error message is logged to the console.
 *
 * @async
 * @returns {Promise<void>} A promise that resolves when the administrator details are fetched and state is updated.
 */

  const fetchAdminDetails = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/admins/');
      const AdminsData = response.data.admins;
      setAdmins(AdminsData);
      // Update filtered rows to only include PlantID and PlantName
      const updatedRows = AdminsData.map(admin => ({
        AdminName: admin.user_id,
        // Store the full plant details in each row for access later
        fullDetails: admin,
      }));
      setFilteredRows(updatedRows);
      setAdminCount(filteredRows.length);
      dispatch(setAdminCount(filteredRows.length));
    } catch (error) {
      console.log('Error fetching Solar Plant Details: ', error);
    }
  };
/**
 * Handles a click on the view admin button.
 *
 * Updates the selected admin state to the currently clicked admin and
 * shows the view admin modal.
 *
 * @param {Object} admin - The admin object with full details.
 */
  const handleViewAdminClick = (admin) => {
    setSelectedAdmin(admin.fullDetails);
    setShowViewAdminModal(true);
  }
/**
 * Closes the view admin modal and resets the selected admin to null.
 *
 * This function is called when the user clicks the "Close" button in the
 * view admin modal. It sets the `showViewAdminModal` state to `false`, which
 * hides the modal, and resets the `selectedAdmin` state to `null`.
 */
  const handleCloseViewAdminModal = () => {
    setShowViewAdminModal(false);
    setSelectedAdmin(null);
  }

/**
 * Handles a click on the update admin button.
 *
 * Updates the selected admin state to the currently clicked admin and
 * shows the update admin modal.
 *
 * @param {Object} admin - The admin object with full details.
 */
  const handleAdminUpdateClick = (admin) => {
    setSelectedAdmin(admin.fullDetails);
    setAdminUpdateModal(true);
  }
  
/**
 * Closes the update admin modal and resets the selected admin to null.
 *
 * This function is called when the user clicks the "Close" button in the
 * update admin modal. It sets the `showAdminUpdateModal` state to `false`, which
 * hides the modal, and resets the `selectedAdmin` state to `null`.
 */
  const handleCloseAdminUpdateModal = () => {
    setAdminUpdateModal(false);
    setSelectedAdmin(null);
  }
/**
 * Handles a click on the delete admin button.
 *
 * Updates the selected admin state to the currently clicked admin and
 * shows the delete admin modal.
 *
 * @param {Object} admin - The admin object with full details.
 */
  const handleAdminDeleteClick = (admin) => {
    setSelectedAdmin(admin.fullDetails)
    setShowAdminDeleteModal(true);
  }
/**
 * Closes the delete admin modal and resets the selected admin to null.
 *
 * This function is called when the user clicks the "Close" button in the
 * delete admin modal. It sets the `showAdminDeleteModal` state to `false`, which
 * hides the modal, and resets the `selectedAdmin` state to `null`.
 */
  const handleCloseAdminDeleteModal = () => {
    setShowAdminDeleteModal(false);
    setSelectedAdmin(null);
  }
/**
 * Handles changes to the search input field.
 *
 * When the user types in the search input field, this function is called.
 * It filters the `filteredRows` state to only include rows that match
 * the search query, and resets the current page and page input to 1.
 *
 * @param {Event} event The event triggered when the user types in the input field.
 */
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredRows(
      Admins
        .filter(admin =>
          admin.PlantID.toLowerCase().includes(query.toLowerCase()) ||
          admin.username.toLowerCase().includes(query.toLowerCase())
        )
        .map(admin => ({
          PlantID: admin.PlantID,
          PlantName: admin.username,
          fullDetails: admin, // Include full details for access
        }))
    );
    setCurrentPage(1);
    setPageInput(1);
  };

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
 * Handles the "next page" button click by incrementing the `currentPage`
 * state variable and updating the `pageInput` state variable accordingly.
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
 * Handles changes to the page input field.
 *
 * When the user types in the page input field, this function is called.
 * It checks if the input value is a valid number, and if it is, it updates
 * the `pageInput` state variable with the new value.
 *
 * @param {Event} event The event triggered when the user types in the input field.
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
    <div className="flex justify-center flex-col">
      <div className=" w-full">
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
            <thead className="sticky top-0 z-10 bg-violet-900 text-white">
              <tr>
                {columns.map((col,index) => (
                  <th key={col.field} className={`px-2 py-3  font-bold text-sm ${
                    index === 0 ? 'rounded-tl-lg' : ''
                  } ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}>
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
              {filteredRows.length > 0 ? (
                filteredRows.map((row, index) => (
                  <tr key={row.AdminName}>
                    <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{index + 1}</td>
                    <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.AdminName}</td>
                    <td className="border-b-2 py-1 border-gray-300 font-bold text-sm text-center">
                        <div className="flex justify-center gap-2">
                        <button 
                        onClick={() => handleViewAdminClick(row)}
                        className="bg-violet-500 text-white px-4 py-2 rounded-md hover:bg-violet-600 transition duration-200">View</button>
                        <button 
                        onClick={() => handleAdminUpdateClick(row)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200">Update</button>
                        <button 
                        onClick={() => handleAdminDeleteClick(row)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200">Delete</button>
                        </div>
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
      <div className="flex justify-between mt-5">
     
      </div>
        </div>
      <div className="flex justify-between mt-5">
        <button
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-violet-500 ml-4 text-white rounded disabled:bg-gray-300"
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
        className="px-4 py-2 bg-violet-500 mr-4 text-white rounded disabled:bg-gray-300"
      >
        Next
      </button>
      </div>
        {/* Pagination controls */}
      <ViewAdminModal
      showModal={showViewAdminModal}
      handleCloseModal={handleCloseViewAdminModal}
      admin={selectedAdmin}
      />
      <AdminUpdateModal
      showModal={showAdminUpdateModal}
      handleCloseModal={handleCloseAdminUpdateModal}
      admin={selectedAdmin}
      />
      <AdminDeleteModal 
      showModal={showAdminDeleteModal}
      handleCloseModal={handleCloseAdminDeleteModal}
      admin={selectedAdmin}
      />
    </div>
    </div>
  );
}
