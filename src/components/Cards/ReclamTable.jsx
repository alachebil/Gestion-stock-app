import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";

export default function ReclamationTable() {
  const [reclamations, setReclamations] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    axios
      .get("http://localhost:3000/reclamation/")
      .then((response) => setReclamations(response.data))
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la récupération des réclamations"
        )
      );
  }, []);

  const deleteReclamation = (reclamationId) => {
    axios
      .delete(`http://localhost:3000/reclamation/${reclamationId}`)
      .then(() => {
        setReclamations(reclamations.filter((reclamation) => reclamation._id !== reclamationId));
      })
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la suppression de la réclamation"
        )
      );
  };

  const toggleTraite = (reclamationId, type) => {
    const updatedReclamations = reclamations.map((reclamation) => {
      if (reclamation._id === reclamationId) {
        const updatedReclamation = { ...reclamation };
        updatedReclamation[type] = updatedReclamation[type] === "Oui" ? "Non" : "Oui";

        // Update the reclamation in the backend
        axios
          .put(`http://localhost:3000/reclamation/${reclamationId}`, updatedReclamation)
          .then(() => {
            setReclamations(
              reclamations.map((r) =>
                r._id === reclamationId ? updatedReclamation : r
              )
            );
          })
          .catch((err) =>
            setError(
              err.response
                ? err.response.data.message
                : "Erreur lors de la mise à jour de la réclamation"
            )
          );

        return updatedReclamation;
      }
      return reclamation;
    });

    setReclamations(updatedReclamations);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReclamations = reclamations.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(reclamations.length / itemsPerPage);

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-gray-800">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-2xl text-white">
                Liste des Réclamations
              </h3>
            </div>
          </div>
        </div>
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Type
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Ref Article
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Poids
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Nombre
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Justification
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Etat
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Depot Traite
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Usine Traite
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentReclamations.map((reclamation) => (
                <tr key={reclamation._id} className="bg-gray-800 hover:bg-gray-700">
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-left">
                    <img
                      src={reclamation.justification}
                      className="h-14 w-14 bg-white rounded-full border"
                      alt={reclamation.justification}
                    />
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-left">
                    <span className="ml-3 font-bold text-white">{reclamation.type}</span>
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {reclamation.refArticle}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {reclamation.poid}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {reclamation.nombre}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                    {reclamation.etat}
                  </td>
                  <td
                    className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white cursor-pointer"
                    onClick={() => toggleTraite(reclamation._id, "depottraite")}
                  >
                    <input
                      type="checkbox"
                      checked={reclamation.depottraite === "Oui"}
                      onChange={() => toggleTraite(reclamation._id, "depottraite")}
                    />
                    {reclamation.depottraite || 'Non'}
                  </td>
                  <td
                    className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white cursor-pointer"
                    onClick={() => toggleTraite(reclamation._id, "usinetraite")}
                  >
                    <input
                      type="checkbox"
                      checked={reclamation.usinetraite === "Oui"}
                      onChange={() => toggleTraite(reclamation._id, "usinetraite")}
                    />
                    {reclamation.usinetraite || 'Non'}
                  </td>
                  <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-right">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteReclamation(reclamation._id)}
                    >
                      <FaTrashAlt className="inline mr-2" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-l"
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-600 text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-r"
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
