import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaFilePdf, FaEdit } from "react-icons/fa";
import { jsPDF } from "jspdf";

const API = "http://localhost:3000/facture";

export default function FactureTable() {
  const [factures, setFactures] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [facturesPerPage] = useState(5);
  const [editingFacture, setEditingFacture] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [form, setForm] = useState({
    nomFournisseur: "",
    numTelephone: "",
    refMatierePremiere: "",
    quantitePortee: "",
    prixTotal: "",
    dateLivraison: "",
  });

  const fetchFactures = () => {
    axios
      .get(API)
      .then((response) => setFactures(response.data))
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la récupération des factures"
        )
      );
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, {
        ...form,
        quantitePortee: Number(form.quantitePortee),
        prixTotal: Number(form.prixTotal),
      });
      setForm({
        nomFournisseur: "",
        numTelephone: "",
        refMatierePremiere: "",
        quantitePortee: "",
        prixTotal: "",
        dateLivraison: "",
      });
      fetchFactures();
    } catch (err) {
      setError(
        err.response
          ? err.response.data.message
          : "Erreur lors de l'ajout de la facture"
      );
    }
  };

  const deleteFacture = (id) => {
    axios
      .delete(`${API}/${id}`)
      .then(() => setFactures(factures.filter((f) => f._id !== id)))
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.message
            : "Erreur lors de la suppression"
        )
      );
  };

  const startEditFacture = (facture) => {
    setEditingFacture(facture._id);
    setEditForm({
      nomFournisseur: facture.nomFournisseur,
      numTelephone: facture.numTelephone,
      refMatierePremiere: facture.refMatierePremiere,
      quantitePortee: facture.quantitePortee,
      prixTotal: facture.prixTotal,
      dateLivraison: facture.dateLivraison ? facture.dateLivraison.split("T")[0] : "",
    });
  };

  const handleEditFacture = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/${editingFacture}`, {
        ...editForm,
        quantitePortee: Number(editForm.quantitePortee),
        prixTotal: Number(editForm.prixTotal),
      });
      setEditingFacture(null);
      setEditForm({});
      fetchFactures();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la modification");
    }
  };

  const generatePDF = (facture) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FACTURE", 105, 25, { align: "center" });

    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(1);
    doc.line(20, 32, 190, 32);

    // Company
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("société Plastique Teboulba", 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 150, 42);

    // Facture info box
    doc.setFillColor(236, 240, 241);
    doc.rect(20, 50, 170, 80, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Details de la Facture", 25, 62);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const startY = 72;
    const lineH = 12;

    doc.setFont("helvetica", "bold");
    doc.text("Nom Fournisseur:", 25, startY);
    doc.setFont("helvetica", "normal");
    doc.text(facture.nomFournisseur, 85, startY);

    doc.setFont("helvetica", "bold");
    doc.text("Telephone:", 25, startY + lineH);
    doc.setFont("helvetica", "normal");
    doc.text(facture.numTelephone, 85, startY + lineH);

    doc.setFont("helvetica", "bold");
    doc.text("Ref Matiere Premiere:", 25, startY + lineH * 2);
    doc.setFont("helvetica", "normal");
    doc.text(facture.refMatierePremiere, 85, startY + lineH * 2);

    doc.setFont("helvetica", "bold");
    doc.text("Quantite Portee:", 25, startY + lineH * 3);
    doc.setFont("helvetica", "normal");
    doc.text(`${facture.quantitePortee} kg`, 85, startY + lineH * 3);

    doc.setFont("helvetica", "bold");
    doc.text("Prix Total:", 25, startY + lineH * 4);
    doc.setFont("helvetica", "normal");
    doc.text(`${facture.prixTotal} TND`, 85, startY + lineH * 4);

    doc.setFont("helvetica", "bold");
    doc.text("Date de Livraison:", 25, startY + lineH * 5);
    doc.setFont("helvetica", "normal");
    doc.text(
      new Date(facture.dateLivraison).toLocaleDateString("fr-FR"),
      85,
      startY + lineH * 5
    );

    // Footer
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(20, 260, 190, 260);
    doc.setFontSize(9);
    doc.text("Document genere automatiquement", 105, 268, { align: "center" });

    doc.save(`facture_${facture.nomFournisseur}_${new Date(facture.dateLivraison).toISOString().split("T")[0]}.pdf`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  const indexOfLast = currentPage * facturesPerPage;
  const indexOfFirst = indexOfLast - facturesPerPage;
  const currentFactures = factures.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(factures.length / facturesPerPage);

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-gray-800">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-2xl text-white">
                Liste des Factures
              </h3>
            </div>
          </div>
        </div>

        {/* Add form */}
        <form
          onSubmit={handleAdd}
          className="flex flex-wrap gap-3 px-6 py-4 items-end bg-gray-700"
        >
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white placeholder-gray-400"
            placeholder="Nom Fournisseur"
            required
            value={form.nomFournisseur}
            onChange={(e) => setForm({ ...form, nomFournisseur: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white placeholder-gray-400"
            placeholder="Num Telephone"
            required
            value={form.numTelephone}
            onChange={(e) => setForm({ ...form, numTelephone: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white placeholder-gray-400"
            placeholder="Ref Matiere Premiere"
            required
            value={form.refMatierePremiere}
            onChange={(e) =>
              setForm({ ...form, refMatierePremiere: e.target.value })
            }
          />
          <input
            className="border rounded px-3 py-2 text-sm w-28 bg-gray-600 text-white placeholder-gray-400"
            type="number"
            min="0"
            step="0.01"
            placeholder="Quantite (kg)"
            required
            value={form.quantitePortee}
            onChange={(e) =>
              setForm({ ...form, quantitePortee: e.target.value })
            }
          />
          <input
            className="border rounded px-3 py-2 text-sm w-28 bg-gray-600 text-white placeholder-gray-400"
            type="number"
            min="0"
            step="0.01"
            placeholder="Prix Total"
            required
            value={form.prixTotal}
            onChange={(e) => setForm({ ...form, prixTotal: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white"
            type="date"
            required
            value={form.dateLivraison}
            onChange={(e) =>
              setForm({ ...form, dateLivraison: e.target.value })
            }
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            Ajouter
          </button>
        </form>

        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Nom Fournisseur
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Telephone
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Ref Matiere Premiere
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Quantite Portee
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Prix Total
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Date Livraison
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentFactures.map((f) => (
                <tr key={f._id} className="bg-gray-800 hover:bg-gray-700">
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white font-bold">
                    {f.nomFournisseur}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {f.numTelephone}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {f.refMatierePremiere}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {f.quantitePortee} kg
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {f.prixTotal} TND
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {formatDate(f.dateLivraison)}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4">
                    <button
                      className="text-blue-400 hover:text-blue-300 mr-3"
                      onClick={() => generatePDF(f)}
                      title="Telecharger PDF"
                    >
                      <FaFilePdf className="inline text-lg" />
                    </button>
                    <button
                      className="text-yellow-400 hover:text-yellow-300 mr-3"
                      onClick={() => startEditFacture(f)}
                      title="Modifier"
                    >
                      <FaEdit className="inline text-lg" />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteFacture(f._id)}
                      title="Supprimer"
                    >
                      <FaTrashAlt className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {factures.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6">
            Aucune facture ajoutee
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3">
            <nav>
              <ul className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <li key={index + 1}>
                    <button
                      onClick={() => setCurrentPage(index + 1)}
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
        )}
      </div>

      {/* Edit Modal */}
      {editingFacture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Modifier la Facture</h3>
            <form onSubmit={handleEditFacture} className="space-y-3">
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" placeholder="Nom Fournisseur" required value={editForm.nomFournisseur} onChange={(e) => setEditForm({ ...editForm, nomFournisseur: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" placeholder="Num Telephone" required value={editForm.numTelephone} onChange={(e) => setEditForm({ ...editForm, numTelephone: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" placeholder="Ref Matiere Premiere" required value={editForm.refMatierePremiere} onChange={(e) => setEditForm({ ...editForm, refMatierePremiere: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" type="number" min="0" step="0.01" placeholder="Quantite (kg)" required value={editForm.quantitePortee} onChange={(e) => setEditForm({ ...editForm, quantitePortee: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" type="number" min="0" step="0.01" placeholder="Prix Total" required value={editForm.prixTotal} onChange={(e) => setEditForm({ ...editForm, prixTotal: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" type="date" required value={editForm.dateLivraison} onChange={(e) => setEditForm({ ...editForm, dateLivraison: e.target.value })} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setEditingFacture(null); setEditForm({}); }} className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-400">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
