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

  const handleViewGraphClick = (row) => {
    setSelectedSmbId(row.smbId);
    setSelectedFrequency('daily'); // You can adjust this if you want dynamic frequency
    setShowGraphModal(true); // Show the modal
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const handleCloseModal = () => {
    setShowGraphModal(false);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput((currentPage - 1).toString());
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput((currentPage + 1).toString());
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
