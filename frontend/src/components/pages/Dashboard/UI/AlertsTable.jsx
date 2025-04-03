/* eslint-disable react-hooks/exhaustive-deps */
import { ColorAlertIcon } from '../../../icons/icons';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
const columns = [
  { field: 'smbId', header: 'SMB ID' },
  { field: 'alertName', header: 'Alert Name' },
  { field: 'SeverityLevel', header: 'Severity Level' },
];
import { useNavigate } from 'react-router-dom';

/**
 * AlertsTable component:
 *
 * This component displays a compact, stylized table of alerts for a specific plant.
 * It fetches alert history data from a backend API and updates every 10 seconds.
 * The table visually represents alerts with color coding based on severity level.
 *
 * - Utilizes `useSelector` to access authentication state and selected plant ID.
 * - Redirects to the home page if the user is not authenticated.
 * - Fetches alert history and transforms it into a table format.
 * - Implements an interval to periodically refresh alert data.
 * - Provides a function to return CSS class names for styling alerts based on severity.
 *
 * @returns {JSX.Element} The AlertsTable component.
 */

const AlertsTable = () => {
  const isAuth = useSelector((state) => state.auth.isAuthenticated);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const [alertsData, setAlertsData] = useState([]);
  const navigate = useNavigate();
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

/**
 * Returns a Tailwind CSS class string that represents the background color, border color, and text color
 * based on the severity level of the alert. The colors are chosen to visually differentiate the severity
 * levels and maintain consistency with the application's theme.
 *
 * @param {string} SeverityLevel - The severity level of the alert ('Warning', 'Critical', 'Online', etc.).
 * @returns {string} A Tailwind CSS class string for styling an HTML element based on the severity level.
 */

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

/**
 * Fetches alert history data from the backend API and updates the `alertsData` state.
 * The data is fetched at a 10-second interval.
 * The function only fetches data if the PlantId is set.
 * The data is transformed into a table format before being set to the state.
 * If the API request fails, an error message is logged to the console.
 */
  const fetchAlertHistory = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/alert_history/${PlantId}`);
      const alertsData = response.data.GeneratedData; // Adjusted according to backend response
      // Map through the alerts data to match table columns
      const rows = alertsData.map((alert) => ({
        alertId: alert.alertID,
        smbId: alert.SMB_ID,
        alertName: alert.alert_name,
        SeverityLevel: alert.severity_level,
      }));

      setAlertsData(rows);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };
  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 shadow-md rounded-2xl p-4" style={{ height: '450px', width: '390px' }}>
      <div className="text-2xl mb-2 font-semibold flex items-center">
        <img src={ColorAlertIcon} alt="Alert icon" className="w-12 h-12 mr-4" />
        <h3 className="mt-[20px] text-3xl">Alerts</h3>
      </div>
      <div>
        <table className="w-full text-left table-fixed">
          <thead className="sticky top-0 bg-blue-900 text-white">
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
      {/* Scrollable table */}
      <div className="overflow-y-auto" style={{ maxHeight: '290px' }}>
        <table className="w-full text-center">
          <tbody>
            {alertsData.map((alert, index) => (
              <tr key={index} className="bg-white">
                <td className="border-b font-bold border-gray-900 py-2 text-sm pl-5">{alert.smbId}</td>
                <td className="border-b border-gray-900 py-2 text-sm font-bold">{alert.alertName}</td>
                <td className="border-b border-black py-2">
                  <div
                    className={`w-20 p-1 rounded-xl mx-auto font-bold text-sm 
                      
                     ${getStatusColor(alert.SeverityLevel)}
                      `}
                  >
                    {alert.SeverityLevel}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlertsTable;
