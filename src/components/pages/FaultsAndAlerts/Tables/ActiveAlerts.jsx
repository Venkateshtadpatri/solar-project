/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const columns = [
  { field: 'smbId', header: 'SMB ID' },
  { field: 'stringId', header: 'String ID' },
  { field: 'alertName', header: 'Alert Name' },
  { field: 'SeverityLevel', header: 'Severity Level' },
  { field: 'TimeDetected', header: 'Time Detected' },
  { field: 'ActionRequired', header: 'Action Required' },
];

const ActiveAlerts = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage);
  const rowsPerPage = 12;
  const fetchInterval = useRef(null);

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else {
      fetchAlerts();
      fetchInterval.current = setInterval(fetchAlerts, 10000);
    }

    return () => {
      clearInterval(fetchInterval.current);
    };
  }, [isAuth, navigate]);

  const getStatusColor = (SeverityLevel) => {
    switch (SeverityLevel) {
      case 'Warning':
        return 'bg-yellow-100 border-2 border-yellow-500 text-black';
      case 'Critical':
        return 'bg-red-100 border-2 border-red-500 text-black';
      case 'Online':
        return 'bg-green-100 border-2 border-green-500 text-black';
      default:
        return 'bg-gray-200 text-black';
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/active_alerts/${PlantId}`);
      const alertsData = response.data.alerts; // Adjusted according to backend response

      // Map through the alerts data to match table columns
      const rows = alertsData.map((alert) => ({
        alertId: alert.alertID,
        smbId: alert.SMB_ID,
        stringId: alert.STRING_ID,
        alertName: alert.alert_name,
        SeverityLevel: alert.severity_level,
        TimeDetected: alert.time_detected,
        ActionRequired: alert.action_required,
      }));

      setFilteredRows(rows);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredRows(
      filteredRows.filter(
        (row) =>
          row.smbId.toLowerCase().includes(query.toLowerCase()) ||
          row.stringId.toLowerCase().includes(query.toLowerCase()) ||
          row.alertName.toLowerCase().includes(query.toLowerCase()) ||
          row.SeverityLevel.toLowerCase().includes(query.toLowerCase())
      )
    );
    setCurrentPage(1); // Reset to first page when search query changes
    setPageInput(1); // Reset page input when search query changes
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setPageInput(currentPage - 1); // Update page input when changing page
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setPageInput(currentPage + 1); // Update page input when changing page
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
                  <tr key={`${row.smbId}-${row.stringId}-${index}`} className="bg-gray-50">
                    <td className="border-b-2 border-gray-300 py-2 font-bold text-sm text-center">
                      {row.smbId}
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-sm text-center">
                      {row.stringId}
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-sm text-center">
                      {row.alertName}
                    </td>
                    <td className="border-b-2 py-2 border-gray-300 font-bold text-sm text-center">
                      <div className={`w-16 p-1 ${getStatusColor(row.SeverityLevel)} rounded-xl mx-auto`}>
                        {row.SeverityLevel}
                      </div>
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-sm text-center">
                      {row.TimeDetected}
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-sm text-center">
                      {row.ActionRequired}
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

export default ActiveAlerts;
