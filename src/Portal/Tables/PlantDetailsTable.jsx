/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setPlantCount } from '../../redux/PlantSlice';
import axios from 'axios';
import ViewPlantModal from '../UI/ViewPlantModal';
import PlantUpdateModal from '../UI/PlantUpdateModal';
import PlantDeleteModal from '../UI/PlantDeleteModal';

const columns = [
  { field: 'PlantID', header: 'Plant ID' },
  { field: 'PlantName', header: 'Plant Name' },
  { field: 'Actions', header: 'Actions'},
];

export default function PlantDetailsTable() {
  const dispatch = useDispatch();
  const [showViewPlantModal, setShowViewPlantModal] = useState(false);
  const [showPlantUpdateModal,setShowPlantUpdateModal] = useState(false);
  const [showPlantDeleteModal, setShowPlantDeleteModal] = useState(false);
  const [plants, setPlants] = useState([]); // Store full plant details here
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [filteredRows, setFilteredRows] = useState([]);
  const fetchInterval = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage);
  const rowsPerPage = 15;

  useEffect(() => {
    fetchPlantDetails();
    fetchInterval.current = setInterval(fetchPlantDetails, 5000);

    return () => {
      clearInterval(fetchInterval.current);
    };
  }, []);

  const fetchPlantDetails = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/solar-plants/');
      const plantsData = response.data.plants;
      setPlants(plantsData);
      console.log(plantsData);
      // Update filtered rows to only include PlantID and PlantName
      const updatedRows = plantsData.map(plant => ({
        PlantID: plant.Plant_ID,
        PlantName: plant.Plant_name,
        // Store the full plant details in each row for access later
        fullDetails: plant,
      }));
      setFilteredRows(updatedRows);
      const count = updatedRows.length; // Update this to count filteredRows correctly
      dispatch(setPlantCount(count));
      
    } catch (error) {
      console.log('Error fetching Solar Plant Details: ', error);
    }
  };

  const handleViewPlantClick = (plant) => {
    setSelectedPlant(plant.fullDetails); // Pass the full details to the modal
    setShowViewPlantModal(true);
  };

  const handleCloseViewPlantModal = () => {
    setShowViewPlantModal(false);
    setSelectedPlant(null);
  };
  
  const handlePlantUpdateClick = (plant) => {
    setSelectedPlant(plant.fullDetails); // Pass the full details to the modal
    setShowPlantUpdateModal(true);
  };

  const handleClosePlantUpdateModal = () => {
    setShowPlantUpdateModal(false);
    setSelectedPlant(null);
  };

  const handlePlantDeleteClick = (plant) => {
    setSelectedPlant(plant.fullDetails); 
    setShowPlantDeleteModal(true);
  }

  const handleClosePlantDeleteModal = () => {
    setShowPlantDeleteModal(false);
    setSelectedPlant(null);
  }

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredRows(
      plants
        .filter(plant =>
          plant.Plant_ID.toLowerCase().includes(query.toLowerCase()) ||
          plant.Plant_name.toLowerCase().includes(query.toLowerCase())
        )
        .map(plant => ({
          PlantID: plant.Plant_ID,
          PlantName: plant.Plant_name,
          fullDetails: plant, // Include full details for access
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
    <div className="flex flex-col items-center justify-center">
      <div className="w-full bg-white rounded-lg">
        {/* Search Bar */}
        <div className="mb-3 p-4">
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center table-fixed">
            <thead className="sticky top-0 z-10 bg-violet-900 text-white">
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
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows
                  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                  .map((row) => (
                    <tr key={row.PlantID}>
                      <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.PlantID}</td>
                      <td className="border-b-2 border-gray-300 font-bold px-4 py-2 text-center">{row.PlantName}</td>
                      <td className="border-b-2 py-1 border-gray-300 font-bold text-sm text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewPlantClick(row)}
                            className="bg-violet-500 text-white px-5 py-2 rounded-md hover:bg-violet-600 transition duration-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handlePlantUpdateClick(row)}
                            className="bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition duration-200"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handlePlantDeleteClick(row)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center p-10">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        <div className="flex justify-between mt-5">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-violet-500 text-white rounded disabled:bg-gray-300"
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
            className="px-4 py-2 bg-violet-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
        </div>
        <ViewPlantModal
          plant={selectedPlant}
          showModal={showViewPlantModal}
          handleCloseModal={handleCloseViewPlantModal}
        />

        <PlantUpdateModal
          plant={selectedPlant}
          showModal={showPlantUpdateModal}
          handleCloseModal={handleClosePlantUpdateModal}
        />
        <PlantDeleteModal
          plant={selectedPlant}
          showModal={showPlantDeleteModal}
          handleCloseModal={handleClosePlantDeleteModal}
        />
    </div>
  );
}
