import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaFilePdf, FaEdit } from "react-icons/fa";
import { jsPDF } from "jspdf";
import SmartPagination from "../Pagination/SmartPagination";

const API = "http://localhost:3000/facture";

export default function FactureTable() {
  const [factures, setFactures] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [facturesPerPage] = useState(5);
  const [editingFacture, setEditingFacture] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchFournisseur, setSearchFournisseur] = useState("");
  const [searchDateFrom, setSearchDateFrom] = useState("");
  const [searchDateTo, setSearchDateTo] = useState("");
  const [form, setForm] = useState({
    nomFournisseur: "",
    numTelephone: "",
    adresse: "",
    refMatierePremiere: "",
    quantitePortee: "",
    prixTotal: "",
    prixUnite: "",
    prixDiverse: "",
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
    setError(null);
    const todayStr = new Date().toISOString().split("T")[0];
    if (form.dateLivraison > todayStr) {
      setError("La date de facture ne peut pas dépasser la date d'aujourd'hui");
      return;
    }
    if (!/^\d{8}$/.test(form.numTelephone)) {
      setError("Le numéro de téléphone doit contenir exactement 8 chiffres");
      return;
    }
    if (Number(form.quantitePortee) <= 0) {
      setError("La quantité doit être supérieure à 0");
      return;
    }
    if (Number(form.prixTotal) < Number(form.prixDiverse)) {
      setError("Le prix total doit être supérieur ou égal au prix diversé");
      return;
    }
    try {
      await axios.post(API, {
        ...form,
        quantitePortee: Number(form.quantitePortee),
        prixTotal: Number(form.prixTotal),
        prixUnite: Number(form.prixUnite),
        prixDiverse: Number(form.prixDiverse),
      });
      setForm({
        nomFournisseur: "",
        numTelephone: "",
        adresse: "",
        refMatierePremiere: "",
        quantitePortee: "",
        prixTotal: "",
        prixUnite: "",
        prixDiverse: "",
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
      adresse: facture.adresse || "",
      refMatierePremiere: facture.refMatierePremiere,
      quantitePortee: facture.quantitePortee,
      prixTotal: facture.prixTotal,
      prixUnite: facture.prixUnite || 0,
      prixDiverse: facture.prixDiverse || 0,
      dateLivraison: facture.dateLivraison ? facture.dateLivraison.split("T")[0] : "",
    });
  };

  const handleEditFacture = async (e) => {
    e.preventDefault();
    setError(null);
    const todayStr = new Date().toISOString().split("T")[0];
    if (editForm.dateLivraison > todayStr) {
      setError("La date de facture ne peut pas dépasser la date d'aujourd'hui");
      return;
    }
    if (!/^\d{8}$/.test(editForm.numTelephone)) {
      setError("Le numéro de téléphone doit contenir exactement 8 chiffres");
      return;
    }
    if (Number(editForm.quantitePortee) <= 0) {
      setError("La quantité doit être supérieure à 0");
      return;
    }
    if (Number(editForm.prixTotal) < Number(editForm.prixDiverse)) {
      setError("Le prix total doit être supérieur ou égal au prix diversé");
      return;
    }
    try {
      await axios.put(`${API}/${editingFacture}`, {
        ...editForm,
        quantitePortee: Number(editForm.quantitePortee),
        prixTotal: Number(editForm.prixTotal),
        prixUnite: Number(editForm.prixUnite),
        prixDiverse: Number(editForm.prixDiverse),
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
    doc.text("RPL industrie", 20, 42);
    doc.text(`Date: ${new Date().toLocaleDateString("fr-FR")}`, 150, 42);

    // Facture info box
    doc.setFillColor(236, 240, 241);
    doc.rect(20, 50, 170, 116, "F");

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
    doc.text("Adresse:", 25, startY + lineH * 2);
    doc.setFont("helvetica", "normal");
    doc.text(facture.adresse || "—", 85, startY + lineH * 2);

    doc.setFont("helvetica", "bold");
    doc.text("Ref Matiere Premiere:", 25, startY + lineH * 3);
    doc.setFont("helvetica", "normal");
    doc.text(facture.refMatierePremiere, 85, startY + lineH * 3);

    doc.setFont("helvetica", "bold");
    doc.text("Quantite Portee:", 25, startY + lineH * 4);
    doc.setFont("helvetica", "normal");
    doc.text(`${facture.quantitePortee} kg`, 85, startY + lineH * 4);

    doc.setFont("helvetica", "bold");
    doc.text("Prix Total:", 25, startY + lineH * 5);
    doc.setFont("helvetica", "normal");
    doc.text(`${facture.prixTotal} TND`, 85, startY + lineH * 5);

    doc.setFont("helvetica", "bold");
    doc.text("Prix Unitaire:", 25, startY + lineH * 6);
    doc.setFont("helvetica", "normal");
    doc.text(`${facture.prixUnite || 0} TND`, 85, startY + lineH * 6);

    doc.setFont("helvetica", "bold");
    doc.text("Prix Diverse (Paye):", 25, startY + lineH * 7);
    doc.setFont("helvetica", "normal");
    doc.text(`${facture.prixDiverse || 0} TND`, 85, startY + lineH * 7);

    doc.setFont("helvetica", "bold");
    doc.text("Date de Livraison:", 25, startY + lineH * 8);
    doc.setFont("helvetica", "normal");
    doc.text(
      new Date(facture.dateLivraison).toLocaleDateString("fr-FR"),
      85,
      startY + lineH * 8
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

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortIcon = (field) =>
    sortField === field ? (sortOrder === "asc" ? " ↑" : " ↓") : " ↕";

  const sortedFactures = [...factures]
    .filter((f) => {
      const matchFournisseur = !searchFournisseur || f.nomFournisseur.toLowerCase().includes(searchFournisseur.toLowerCase());
      const dateStr = f.dateLivraison ? f.dateLivraison.split("T")[0] : "";
      const matchFrom = !searchDateFrom || (dateStr && dateStr >= searchDateFrom);
      const matchTo = !searchDateTo || (dateStr && dateStr <= searchDateTo);
      return matchFournisseur && matchFrom && matchTo;
    })
    .sort((a, b) => {
    if (!sortField) return 0;
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === "dateLivraison") {
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const indexOfLast = currentPage * facturesPerPage;
  const indexOfFirst = indexOfLast - facturesPerPage;
  const currentFactures = sortedFactures.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedFactures.length / facturesPerPage);

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
            placeholder="Num Telephone (8 chiffres)"
            required
            maxLength={8}
            pattern="\d{8}"
            value={form.numTelephone}
            onChange={(e) => setForm({ ...form, numTelephone: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white placeholder-gray-400"
            placeholder="Adresse (optionnel)"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
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
            min="1"
            step="0.01"
            placeholder="Quantite (kg)"
            required
            value={form.quantitePortee}
            onChange={(e) => {
              const qty = e.target.value;
              const total = qty && form.prixUnite ? (Number(qty) * Number(form.prixUnite)).toFixed(2) : form.prixTotal;
              setForm({ ...form, quantitePortee: qty, prixTotal: total });
            }}
          />

          <input
            className="border rounded px-3 py-2 text-sm w-28 bg-gray-600 text-white placeholder-gray-400"
            type="number"
            min="0"
            step="0.01"
            placeholder="Prix Unitaire"
            required
            value={form.prixUnite}
            onChange={(e) => {
              const pu = e.target.value;
              const total = form.quantitePortee && pu ? (Number(form.quantitePortee) * Number(pu)).toFixed(2) : form.prixTotal;
              setForm({ ...form, prixUnite: pu, prixTotal: total });
            }}
          />

          <input
            className="border rounded px-3 py-2 text-sm w-28 bg-gray-600 text-white placeholder-gray-400"
            type="number"
            min="0"
            step="0.01"
            placeholder="Prix Total"
            required
            value={form.prixTotal}
            readOnly
          />
          
          <input
            className="border rounded px-3 py-2 text-sm w-32 bg-gray-600 text-white placeholder-gray-400"
            type="number"
            min="0"
            step="0.01"
            placeholder="Prix Diversé (Payé)"
            required
            value={form.prixDiverse}
            onChange={(e) => setForm({ ...form, prixDiverse: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white"
            type="date"
            required
            max={new Date().toISOString().split("T")[0]}
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

        {/* Search filters */}
        <div className="flex flex-wrap gap-3 px-6 py-3 items-center bg-gray-700">
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white placeholder-gray-400"
            placeholder="Rechercher par fournisseur..."
            value={searchFournisseur}
            onChange={(e) => { setSearchFournisseur(e.target.value); setCurrentPage(1); }}
          />
          <label className="text-white text-sm">Du:</label>
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white"
            type="date"
            value={searchDateFrom}
            onChange={(e) => { setSearchDateFrom(e.target.value); setCurrentPage(1); }}
          />
          <label className="text-white text-sm">Au:</label>
          <input
            className="border rounded px-3 py-2 text-sm bg-gray-600 text-white"
            type="date"
            value={searchDateTo}
            onChange={(e) => { setSearchDateTo(e.target.value); setCurrentPage(1); }}
          />
          {(searchFournisseur || searchDateFrom || searchDateTo) && (
            <button
              className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-400"
              onClick={() => { setSearchFournisseur(""); setSearchDateFrom(""); setSearchDateTo(""); setCurrentPage(1); }}
            >
              Réinitialiser
            </button>
          )}
        </div>

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
                  Adresse
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Ref Matiere Premiere
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white cursor-pointer select-none" onClick={() => toggleSort("quantitePortee")}>
                  Quantite Portee{sortIcon("quantitePortee")}
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Prix Total
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                  Prix Unitaire
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white cursor-pointer select-none" onClick={() => toggleSort("prixDiverse")}>
                  Prix Diversé (Payé){sortIcon("prixDiverse")}
                </th>
                <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white cursor-pointer select-none" onClick={() => toggleSort("dateLivraison")}>
                  Date Livraison{sortIcon("dateLivraison")}
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
                    {f.adresse || "—"}
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
                    {f.prixUnite || 0} TND
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {f.prixDiverse || 0} TND
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

        {/* Sum of Prix Diversé */}
        {factures.length > 0 && (
          <div className="px-6 py-3 bg-gray-700 border-t border-gray-600">
            <div className="flex flex-wrap justify-end gap-6">
              <p className="text-white text-sm font-semibold">
                Quantité Totale {(searchFournisseur || searchDateFrom || searchDateTo) ? "(filtrée)" : ""} :{" "}
                <span className="text-yellow-300 text-lg">
                  {sortedFactures.reduce((sum, f) => sum + (Number(f.quantitePortee) || 0), 0).toFixed(2)} kg
                </span>
              </p>
              <p className="text-white text-sm font-semibold">
                Total Prix Diversé (Payé) {(searchFournisseur || searchDateFrom || searchDateTo) ? "(filtré)" : ""} :{" "}
                <span className="text-green-400 text-lg">
                  {sortedFactures.reduce((sum, f) => sum + (f.prixDiverse || 0), 0).toFixed(2)} TND
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        <SmartPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setPage={setCurrentPage}
          activeClass="bg-blue-500 text-white"
          inactiveClass="bg-gray-700 text-white"
        />
      </div>

      {/* Edit Modal */}
      {editingFacture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Modifier la Facture</h3>
            <form onSubmit={handleEditFacture} className="space-y-3">
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" placeholder="Nom Fournisseur" required value={editForm.nomFournisseur} onChange={(e) => setEditForm({ ...editForm, nomFournisseur: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" placeholder="Num Telephone" required value={editForm.numTelephone} onChange={(e) => setEditForm({ ...editForm, numTelephone: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" placeholder="Adresse (optionnel)" value={editForm.adresse || ""} onChange={(e) => setEditForm({ ...editForm, adresse: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" placeholder="Ref Matiere Premiere" required value={editForm.refMatierePremiere} onChange={(e) => setEditForm({ ...editForm, refMatierePremiere: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" type="number" min="0" step="0.01" placeholder="Quantite (kg)" required value={editForm.quantitePortee} onChange={(e) => {
                const qty = e.target.value;
                const total = qty && editForm.prixUnite ? (Number(qty) * Number(editForm.prixUnite)).toFixed(2) : editForm.prixTotal;
                setEditForm({ ...editForm, quantitePortee: qty, prixTotal: total });
              }} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" type="number" min="0" step="0.01" placeholder="Prix Total" required value={editForm.prixTotal} readOnly />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" type="number" min="0" step="0.01" placeholder="Prix Unitaire" required value={editForm.prixUnite} onChange={(e) => {
                const pu = e.target.value;
                const total = editForm.quantitePortee && pu ? (Number(editForm.quantitePortee) * Number(pu)).toFixed(2) : editForm.prixTotal;
                setEditForm({ ...editForm, prixUnite: pu, prixTotal: total });
              }} />
              <input className="border rounded px-3 py-2 text-sm w-full bg-gray-600 text-white" type="number" min="0" step="0.01" placeholder="Prix Diversé (Payé)" required value={editForm.prixDiverse} onChange={(e) => setEditForm({ ...editForm, prixDiverse: e.target.value })} />
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
