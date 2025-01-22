/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { SuccessIcon } from '../../../icons/icons';
import { useNavigate } from 'react-router-dom';

const columns = [
  { field: 'smbId', header: 'SMB ID' },
  { field: 'stringId', header: 'String ID' },
  { field: 'alertName', header: 'Alert Name' },
  { field: 'SeverityLevel', header: 'Severity Level' },
  { field: 'TimeDetected', header: 'Time Detected' },
  { field: 'ActionRequired', header: 'Action Required' },
  { field: 'Status', header: 'Status' },
];

const AlertHistory = () => {
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
      fetchAlertHistory();
      fetchInterval.current = setInterval(fetchAlertHistory, 10000);
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

  const fetchAlertHistory = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/alert_history/${PlantId}`);
      const alertsData = response.data.GeneratedData; // Adjusted according to backend response

      console.log(response.data);
      // Map through the alerts data to match table columns
      const rows = alertsData.map((alert) => ({
        alertId: alert.alertID,
        smbId: alert.SMB_ID,
        stringId: alert.STRING_ID,
        alertName: alert.alert_name,
        SeverityLevel: alert.severity_level,
        TimeDetected: alert.time_detected,
        ActionRequired: alert.action_required,
        Status: alert.status, // Assuming 'status' is available in your response data
      }));

      setFilteredRows(rows);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search query changes
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

  // Filter rows based on search query
  const filteredData = filteredRows.filter(
    (row) =>
      row.smbId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.stringId.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.alertName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.SeverityLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Header table */}
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
            {filteredData.length > 0 ? (
              filteredData
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) // Pagination slice
                .map((row,index) => (
                  <tr key={`${row.smbId}-${index}`} className="bg-gray-50">
                    <td className="border-b-2 py-2 border-gray-300 font-bold text-xs text-center">{row.smbId}</td>
                    <td className="border-b-2 border-gray-300 font-bold text-xs text-center">{row.stringId}</td>
                    <td className="border-b-2 border-gray-300 font-bold text-xs text-center">{row.alertName}</td>
                    <td className="border-b-2 py-1 border-gray-300 font-bold text-sm text-center">
                      <div className={`w-16 p-1 ${getStatusColor(row.SeverityLevel)} rounded-xl mx-auto`}>
                        {row.SeverityLevel}
                      </div>
                    </td>
                    <td className="border-b-2 border-gray-300 font-bold text-xs text-center">{row.TimeDetected}</td>
                    <td className="border-b-2 border-gray-300 font-bold text-xs text-center">{row.ActionRequired}</td>
                    <td className="border-b-2 border-gray-300 font-bold text-xs text-center">
                      {/* Conditional rendering for Status */}
                      {row.Status === 'success' ? (
                        <div className="flex justify-center items-center"><img src={SuccessIcon} alt="success" className="w-7 h-7" /></div>
                      ) : (
                        <span className="text-red-600 font-bold">INCOMPLETE</span>
                      )}
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

export default AlertHistory;
