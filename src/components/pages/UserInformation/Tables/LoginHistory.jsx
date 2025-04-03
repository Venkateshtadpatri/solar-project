/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const columns = [
  { field: 'Sno', header: 'Sno', width: '10%' }, 
  { field: 'User ID', header: 'User ID', width: '50%' },
  { field: 'LoginTime', header: 'Login Time', width: '40%' }, 
];
/**
 * A component that displays a user's login history in a table.
 *
 * It fetches the login history from the server and renders it in a table with the
 * following columns: Sno, User ID, and Login Time. The table is scrollable and
 * responsive to the screen size.
 *
 * The component is also authenticated, meaning that it will only render if the user
 * is logged in. If the user is not logged in, it will redirect to the login page.
 *
 * @param {boolean} isAuth Whether the user is authenticated or not.
 * @returns {JSX.Element} The LoginHistory component.
 */
const LoginHistory = ({ isAuth }) => {
  const navigate = useNavigate();
  const [logins, setLogins] = useState([]);
  const PlantId = useSelector((state) => state.auth.PlantId);
  const fetchInterval = useRef(null);

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else {
      fetchLoginHistory();
      fetchInterval.current = setInterval(fetchLoginHistory, 10000);
    }

    return () => {
      clearInterval(fetchInterval.current);
    };
  }, [isAuth, navigate]);

/**
 * Fetches the login history of users for a specific plant from the server.
 *
 * This asynchronous function sends a GET request to the backend API to retrieve
 * the login history of users associated with the current plant ID. The login
 * history data is then set in the component's state.
 *
 * On successful retrieval, the login history is stored in the `logins` state.
 * If an error occurs during the request, it logs the error message to the console.
 */

  const fetchLoginHistory = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/users-login-history/${PlantId}/`);
      setLogins(response.data.data); // Assuming data is inside 'data.data'
    } catch (error) {
      console.log('Error fetching Login history: ', error);
    }
  };

  return (
    <div className="bg-white rounded-2xl" style={{ height: '580px', width: '1200px' }}>
      <div>
        <table className="w-full text-center table-fixed">
          <thead className="sticky top-0 z-10 bg-blue-900 text-white">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.field}
                  className={`px-2 py-3 font-bold text-center text-sm ${index === 0 ? 'rounded-tl-lg' : ''} ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                  style={{ width: col.width }} // Apply column width here
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>
      {/* Scrollable container for the table */}
      <div className="overflow-y-auto" style={{ maxHeight: '442px' }}>
        <table className="w-full text-center table-fixed">
          <tbody>
            {logins.map((user, index) => (
              <tr key={`${user.email}-${index}`} className="bg-gray-50"> {/* Combine email and index for a unique key */}
                <td className="border-b-2 border-gray-300 font-bold text-sm text-center" style={{ width: '10%' }}>{index + 1}</td>
                <td className="border-b-2 border-gray-300 py-2 font-bold text-sm text-center" style={{ width: '50%' }}>{user.user_id}</td>
                <td className="border-b-2 border-gray-300 py-2 font-bold text-sm text-center" style={{ width: '40%' }}>{user.logintime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginHistory;
