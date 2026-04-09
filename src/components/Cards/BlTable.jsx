import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";

export default function CardTable() {
  const [bls, setBls] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [blsPerPage] = useState(5);

  useEffect(() => {
    // Fetch BLs from the backend
    axios
      .get("http://localhost:3000/bl/")
      .then((response) => setBls(response.data)) // Use response.data directly
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la récupération des Bls"
        )
      );
  }, []);

  const deleteBl = (blId) => {
    axios
      .delete(`http://localhost:3000/bl/${blId}`)
      .then(() => {
        // Remove deleted BL from the state
        setBls(bls.filter((bl) => bl._id !== blId));
      })
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la suppression de l'BL"
        )
      );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Will display date and time
  };

  // Get current bls for the current page
  const indexOfLastBl = currentPage * blsPerPage;
  const indexOfFirstBl = indexOfLastBl - blsPerPage;
  const currentBls = bls.slice(indexOfFirstBl, indexOfLastBl);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-gray-800">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-2xl text-white">
                Liste des BLs
              </h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Ref
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Code Client
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Date Chauffeur
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Etat Chauffeur
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Date Depot
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Etat Depot
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Date Livreur
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Etat Livreur
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentBls.map((bl) => (
                <tr key={bl._id} className="bg-gray-800 hover:bg-gray-700">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-left">
                    <span className="ml-3 font-bold text-white">{bl.ref}</span>
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {bl.codeClient}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {formatDate(bl.dateChauffeur)}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {bl.etatChauffeur}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {formatDate(bl.dateDepot)}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {bl.etatDepot}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {formatDate(bl.dateLivreur)}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {bl.etatLivreur}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-right">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteBl(bl._id)}
                    >
                      <FaTrashAlt className="inline mr-2" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="px-4 py-3">
          <nav>
            <ul className="flex justify-center space-x-2">
              {Array.from({ length: Math.ceil(bls.length / blsPerPage) }, (_, index) => (
                <li key={index + 1}>
                  <button
                    onClick={() => paginate(index + 1)}
                    className={`px-4 py-2 rounded ${
                      currentPage === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
