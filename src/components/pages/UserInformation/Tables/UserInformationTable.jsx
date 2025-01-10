/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AddUserModal from '../UI/AddUserModal';
import UpdateUserModal from '../UI/UpdateUserModal';
import DeleteUserModal from '../UI/DeleteUserModal';

const columns = [
  { field: 'Sno', header: 'Sno', width: '10%' },
  { field: 'Email', header: 'Email', width: '30%' },
  { field: 'DateCreated', header: 'Date Created', width: '20%' },
  { field: 'Actions', header: 'Actions', width: '30%' },
];

const UserInformationTable = ({ isAuth }) => {
  const navigate = useNavigate();
  const PlantId = useSelector((state) => state.auth.PlantId);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const fetchInterval = useRef(null);

  useEffect(() => {
    if (!isAuth) {
      navigate('/');
    } else {
      fetchUsers();
      fetchInterval.current = setInterval(fetchUsers, 10000);
    }

    return () => {
      clearInterval(fetchInterval.current);
    };
  }, [isAuth, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/get_all_users/${PlantId}`);
      if (response.data.status === 'success') {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUserClick = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);

  const handleUpdateUserClick = (user) => {
    setSelectedUser(user);
    setShowUpdateUserModal(true);
  };

  const handleCloseUpdateUserModal = () => {
    setShowUpdateUserModal(false);
    setSelectedUser(null);
  };

  const handleUserAdded = (newUser) => {
    setUsers((prevUsers) => [
      ...prevUsers,
      {
        user_id: newUser.user_id,
        email: newUser.email,
        dateCreated: new Date().toLocaleString(),
      },
    ]);
  };

  const handleDeleteUserClick = (user) => {
    setShowDeleteUserModal(true);
    setSelectedUser(user);
  };

  const handleCloseDeleteUserModal = () => {
    setShowDeleteUserModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="bg-white rounded-2xl" style={{ height: '580px', width: '1200px' }}>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search"
          className="border-2 border-gray-300 rounded-md px-4 py-2 mt-3"
          style={{ width: '200px', height: '40px' }}
        />
        <button
          className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
          onClick={handleAddUserClick}
        >
          Add User
        </button>
      </div>

      <div>
        <table className="w-full text-center table-fixed">
          <thead className="sticky top-0 z-10 bg-blue-900 text-white">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.field}
                  className={`px-2 py-3 font-bold text-center text-sm ${index === 0 ? 'rounded-tl-lg' : ''} ${index === columns.length - 1 ? 'rounded-tr-lg' : ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '442px' }}>
        <table className="w-full text-center table-fixed">
          <tbody>
            {users.map((user, index) => (
              <tr key={user.user_id} className="bg-gray-50">
                <td className="border-b-2 border-gray-300 font-bold text-sm text-center" style={{ width: '10%' }}>{index + 1}</td>
                <td className="border-b-2 border-gray-300 py-2 font-bold text-sm text-center" style={{ width: '30%' }}>{user.email}</td>
                <td className="border-b-2 border-gray-300 py-2 font-bold text-sm text-center" style={{ width: '20%' }}>{user.dateCreated}</td>
                <td className="border-b-2 border-gray-300 py-2 font-bold text-sm text-center" style={{ width: '30%' }}>
                  <div className="flex justify-center gap-2">
                    <button
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition duration-200"
                      onClick={() => handleUpdateUserClick(user)}
                    >
                      Update
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition duration-200"
                      onClick={() => handleDeleteUserClick(user)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserModal
        showModal={showAddUserModal}
        handleCloseModal={handleCloseAddUserModal}
        onUserAdded={handleUserAdded}
      />
      <UpdateUserModal
        showModal={showUpdateUserModal}
        handleCloseModal={handleCloseUpdateUserModal}
        user={selectedUser}
      />
      <DeleteUserModal
        showModal={showDeleteUserModal}
        handleCloseModal={handleCloseDeleteUserModal}
        user={selectedUser}
      />
    </div>
  );
};

export default UserInformationTable;
