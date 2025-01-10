/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { SuccessIcon } from '../../../icons/icons';

const columns = [
  { field: 'smbId', header: 'SMB ID' },
  { field: 'stringId', header: 'String ID' },
  { field: 'alertName', header: 'Alert Name' },
  { field: 'SeverityLevel', header: 'Severity Level' },
  { field: 'TimeDetected', header: 'Time Detected' },
  { field: 'ActionRequired', header: 'Action Required' },
  { field: 'Status', header: 'Status' },
];

function createData(smbId, stringId, alertName, SeverityLevel, TimeDetected, ActionRequired, Status) {
  return { smbId, stringId, alertName, SeverityLevel, TimeDetected, ActionRequired, Status };
}

const generateActiveAlertsData = (smbId, panelCount) => {
  const statuses = ['Warning', 'Critical', 'Online'];
  const Alerts = ['bird waste', 'Dust', 'Crack'];
  const Actions = ['Cleaning', 'Repair'];
  const timeDetected = [
    '20-09-2024 08:30 am',
    '19-09-2024 04:15 pm',
    '18-09-2024 11:45 am',
    '17-09-2024 09:00 pm',
    '16-09-2024 06:20 am',
    '15-09-2024 03:35 pm',
    '14-09-2024 10:10 am',
    '13-09-2024 01:50 pm',
    '12-09-2024 07:25 am',
    '11-09-2024 05:55 pm',
  ];
  const status = [
    <div className="flex justify-center items-center"><img src={SuccessIcon} alt="success" className="w-7 h-7" /></div>,
    <span className="text-red-600 font-bold">INCOMPLETE</span>
  ];
  const rows = [];
  for (let i = 1; i <= panelCount; i++) {
    const stringId = String(i + smbId.slice(-3) * 100).padStart(3, '0');
    const SeverityLevel = statuses[Math.floor(Math.random() * statuses.length)];
    const alertName = Alerts[Math.floor(Math.random() * Alerts.length)];
    const ActionRequired = Actions[Math.floor(Math.random() * Actions.length)];
    const TimeDetected = timeDetected[Math.floor(Math.random() * timeDetected.length)];
    const Status = status[Math.floor(Math.random() * status.length)];

    rows.push(createData(smbId, stringId, alertName, SeverityLevel, TimeDetected, ActionRequired, Status));
  }
  return rows;
}

const rows = [
  ...generateActiveAlertsData('SMB001', 40),
  ...generateActiveAlertsData('SMB002', 40),
  ...generateActiveAlertsData('SMB003', 30),
  ...generateActiveAlertsData('SMB004', 28),
  ...generateActiveAlertsData('SMB005', 35),
];

const AlertHistory = () => {
  const [filteredRows, setFilteredRows] = useState(rows);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(currentPage);
  const rowsPerPage = 15;

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

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    setFilteredRows(
      rows.filter(
        (row) =>
          row.smbId.toLowerCase().includes(query.toLowerCase()) ||
          row.stringId.toLowerCase().includes(query.toLowerCase()) ||
          row.alertName.toLowerCase().includes(query.toLowerCase()) ||
          row.SeverityLevel.toLowerCase().includes(query.toLowerCase())
      )
    );
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

  return (
    <div className="bg-white rounded-2xl" style={{ height: '580px', width: '1200px' }}>
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
        {/* Scrollable tbody container */}
        <div className="overflow-y-auto" style={{maxHeight: '400px'}}>
            <table className="w-full text-center table-fixed">
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows
                  .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) // Pagination slice
                  .map((row) => (
                    <tr key={`${row.smbId}-${row.stringId}`} className="bg-gray-50">
                      <td className="border-b-2 py-2 border-gray-300 font-bold text-xs text-center">{row.smbId}</td>
                      <td className="border-b-2 border-gray-300  font-bold text-xs text-center">{row.stringId}</td>
                      <td className="border-b-2  border-gray-300 font-bold text-xs text-center">{row.alertName}</td>
                      <td className="border-b-2 py-1 border-gray-300 font-bold text-sm text-center">
                        <div className={`w-16 p-1 ${getStatusColor(row.SeverityLevel)} rounded-xl mx-auto`}>
                          {row.SeverityLevel}
                        </div>
                      </td>
                      <td className="border-b-2  border-gray-300 font-bold text-xs text-center">{row.TimeDetected}</td>
                      <td className="border-b-2 border-gray-300 font-bold text-xs text-center">{row.ActionRequired}</td>
                      <td className="border-b-2  border-gray-300 font-bold text-xs text-center ">
                        {row.Status}
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
