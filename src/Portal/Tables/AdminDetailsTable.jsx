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
  const handleViewAdminClick = (admin) => {
    setSelectedAdmin(admin.fullDetails);
    setShowViewAdminModal(true);
  }
  const handleCloseViewAdminModal = () => {
    setShowViewAdminModal(false);
    setSelectedAdmin(null);
  }

  const handleAdminUpdateClick = (admin) => {
    setSelectedAdmin(admin.fullDetails);
    setAdminUpdateModal(true);
  }
  
  const handleCloseAdminUpdateModal = () => {
    setAdminUpdateModal(false);
    setSelectedAdmin(null);
  }
  const handleAdminDeleteClick = (admin) => {
    setSelectedAdmin(admin.fullDetails)
    setShowAdminDeleteModal(true);
  }
  const handleCloseAdminDeleteModal = () => {
    setShowAdminDeleteModal(false);
    setSelectedAdmin(null);
  }
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(currentPage + 1);
    }
  };
  const handlePageInputChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setPageInput(value);
    }
  };
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
