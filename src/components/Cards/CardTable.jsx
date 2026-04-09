import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";

export default function CardTable() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/users/")
      .then((response) => setUsers(response.data.users))
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la récupération des utilisateurs"
        )
      );
  }, []);

  const deleteUser = (userId) => {
    axios
      .delete(`http://localhost:3000/users/${userId}`)
      .then(() => {
        setUsers(users.filter((user) => user._id !== userId));
      })
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la suppression de l'utilisateur"
        )
      );
  };

  const toggleRole = (userId) => {
    axios
      .put(`http://localhost:3000/users/role/${userId}`)
      .then((response) => {
        setUsers(
          users.map((user) =>
            user._id === userId
              ? { ...user, role: response.data.user.role }
              : user
          )
        );
      })
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la modification du rôle de l'utilisateur"
        )
      );
  };

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-gray-800">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-2xl text-white">
                Liste des utilisateurs
              </h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Image
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Nom
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Email
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Role
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="bg-gray-800 hover:bg-gray-700">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-left">
                    <img
                      src={user.image}
                      className="h-14 w-14 bg-white rounded-full border"
                      alt={user.name}
                    />
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-left">
                    <span className="ml-3 font-bold text-white">
                      {user.name} {user.lastName}
                    </span>
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {user.email}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {user.phone}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    <button
                      className={`w-32 px-4 py-2 mr-5 rounded-full text-white ${
                        user.role === "user"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-purple-500 hover:bg-purple-600"
                      }`}
                      onClick={() => toggleRole(user._id)}
                    >
                      {user.role === "user" ? "Utilisateur" : "Responsable"}
                    </button>
                    </td>
                    
                    <td>
                    <button
                      className="text-red-500 hover:text-red-700  border-t-0 px-6 align-middle"
                      onClick={() => deleteUser(user._id)}
                    >
                      <FaTrashAlt className="inline mr-2" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
