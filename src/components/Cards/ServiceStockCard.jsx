import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API = "http://localhost:3000/service-stock";

export default function ServiceStockCard() {
  const [summary, setSummary] = useState(null);
  const [semiPrets, setSemiPrets] = useState([]);
  const [finals, setFinals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [semiPretForm, setSemiPretForm] = useState({ nom: "", type: "base", quantiteKg: "" });
  const [finalForm, setFinalForm] = useState({ type: "base", quantiteKg: "" });

  const [activeTab, setActiveTab] = useState("summary");
  const [counters, setCounters] = useState({ semiPretBase: 0, semiPretBargatere: 0, finalBase: 0, finalBargatere: 0 });

  // Sort & Search states
  const [semiSortOrder, setSemiSortOrder] = useState("none");
  const [finalSortOrder, setFinalSortOrder] = useState("none");
  const [semiSearch, setSemiSearch] = useState("");
  const [finalSearch, setFinalSearch] = useState("");
  const [finalEtatFilter, setFinalEtatFilter] = useState("tous");

  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sumRes, semiRes, finRes, cntRes] = await Promise.all([
        axios.get(`${API}/summary`),
        axios.get(`${API}/semi-pret`),
        axios.get(`${API}/final`),
        axios.get(`${API}/counters`),
      ]);
      setSummary(sumRes.data);
      setSemiPrets(semiRes.data);
      setFinals(finRes.data);
      setCounters(cntRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddSemiPret = async (e) => {
    e.preventDefault();
    if (Number(semiPretForm.quantiteKg) <= 0) {
      alert("La quantité doit être supérieure à 0");
      return;
    }
    try {
      const body = { nom: semiPretForm.nom, type: semiPretForm.type, quantiteKg: Number(semiPretForm.quantiteKg) };
      await axios.post(`${API}/semi-pret`, body);
      setSemiPretForm({ nom: "", type: "base", quantiteKg: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const handleAddFinal = async (e) => {
    e.preventDefault();
    if (Number(finalForm.quantiteKg) <= 0) {
      alert("La quantité doit être supérieure à 0");
      return;
    }
    try {
      const body = { type: finalForm.type, quantiteKg: Number(finalForm.quantiteKg) };
      await axios.post(`${API}/final`, body);
      setFinalForm({ type: "base", quantiteKg: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (category, id) => {
    await axios.delete(`${API}/${category}/${id}`);
    fetchAll();
  };

  const startEdit = (category, item) => {
    setEditingItem({ category, id: item._id });
    setEditForm({ ...item });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const { _id, __v, createdAt, updatedAt, etat, ...body } = editForm;
      await axios.put(`${API}/${editingItem.category}/${editingItem.id}`, body);
      cancelEdit();
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la modification");
    }
  };

  const toggleEtat = async (id) => {
    try {
      const res = await axios.put(`${API}/final/etat/${id}`);
      setFinals(finals.map((f) => (f._id === id ? res.data : f)));
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du changement d'état");
    }
  };

  const sortByQuantity = (arr, order) => {
    if (order === "none") return arr;
    return [...arr].sort((a, b) =>
      order === "asc" ? a.quantiteKg - b.quantiteKg : b.quantiteKg - a.quantiteKg
    );
  };

  const toggleSort = (current, setter) => {
    const next = current === "none" ? "asc" : current === "asc" ? "desc" : "none";
    setter(next);
  };

  const sortIcon = (order) =>
    order === "asc" ? "↑" : order === "desc" ? "↓" : "↕";

  const filteredSemiPrets = sortByQuantity(
    semiPrets.filter(
      (s) =>
        s.nom.toLowerCase().includes(semiSearch.toLowerCase()) ||
        (s.type && s.type.toLowerCase().includes(semiSearch.toLowerCase()))
    ),
    semiSortOrder
  );

  const filteredFinals = sortByQuantity(
    finals.filter((f) => {
      const matchSearch = f.nom.toLowerCase().includes(finalSearch.toLowerCase()) ||
        (f.type && f.type.toLowerCase().includes(finalSearch.toLowerCase()));
      const matchEtat = finalEtatFilter === "tous" || f.etat === finalEtatFilter;
      return matchSearch && matchEtat;
    }),
    finalSortOrder
  );

  const generateStockPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Etat du Stock Service", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Genere le: ${new Date().toLocaleString("fr-FR")}`, 105, 28, { align: "center" });

    doc.setDrawColor(156, 39, 176);
    doc.setLineWidth(1);
    doc.line(20, 32, 190, 32);

    let y = 40;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Produit Semi-Pret (Service)", 20, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [["Nom", "Type", "Quantite (kg)"]],
      body: semiPrets.map((s) => [s.nom, s.type, s.quantiteKg]),
      theme: "grid",
      headStyles: { fillColor: [156, 39, 176] },
    });
    y = (doc.lastAutoTable?.finalY || y) + 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Produit Final (Service)", 20, y);
    y += 5;
    autoTable(doc, {
      startY: y,
      head: [["Nom", "Type", "Quantite (kg)"]],
      body: finals.map((f) => [f.nom, f.type, f.quantiteKg]),
      theme: "grid",
      headStyles: { fillColor: [233, 30, 99] },
    });

    doc.save(`stock_service_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const tabBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
        activeTab === key ? "bg-white text-purple-700 border-b-2 border-purple-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement du stock service...</p>;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
      <div className="flex space-x-1 px-6 pt-4">
        {tabBtn("summary", "Résumé du Stock")}
        {tabBtn("semi", "Produit Semi-Prêt")}
        {tabBtn("final", "Produit Final")}
      </div>

      <div className="block w-full overflow-x-auto p-6">
        {/* ============ SUMMARY ============ */}
        {activeTab === "summary" && summary && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-700">Résumé du stock service</h3>
              <button
                onClick={generateStockPDF}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex items-center gap-2"
              >
                <i className="fas fa-file-pdf"></i> Exporter Stock en PDF
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2"><i className="fas fa-cogs mr-2"></i>Produit Semi-Prêt</h4>
                {summary.produitsSemiPrets.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun produit semi-prêt en stock</p>
                ) : (
                  summary.produitsSemiPrets.map((s) => (
                    <div key={s._id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">{s._id}</span>
                      <span className="font-bold text-purple-700">{s.totalKg} kg ({s.count} entrées)</span>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h4 className="font-semibold text-pink-800 mb-2"><i className="fas fa-box mr-2"></i>Produit Final</h4>
                {summary.produitsFinals.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun produit final en stock</p>
                ) : (
                  summary.produitsFinals.map((f) => (
                    <div key={f._id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">{f._id}</span>
                      <span className="font-bold text-pink-700">{f.totalKg} kg ({f.count} entrées)</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ SEMI-PRET ============ */}
        {activeTab === "semi" && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Produit Semi-Prêt (Achat direct)</h3>
            <input
              className="border rounded px-3 py-2 text-sm mb-4 w-full"
              placeholder="Rechercher par nom ou type..."
              value={semiSearch}
              onChange={(e) => setSemiSearch(e.target.value)}
            />
            <form onSubmit={handleAddSemiPret} className="flex flex-wrap gap-3 mb-6 items-end">
              <input className="border rounded px-3 py-2 text-sm" placeholder="Nom" required value={semiPretForm.nom} onChange={(e) => setSemiPretForm({ ...semiPretForm, nom: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={semiPretForm.type} onChange={(e) => setSemiPretForm({ ...semiPretForm, type: e.target.value })}>
                <option>base</option><option>bargatere</option>
              </select>
              <input className="border rounded px-3 py-2 text-sm w-28" type="number" min="0.01" step="0.01" placeholder="Quantité (kg)" required value={semiPretForm.quantiteKg} onChange={(e) => setSemiPretForm({ ...semiPretForm, quantiteKg: e.target.value })} />
              <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">Ajouter</button>
            </form>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100"><tr><th className="px-4 py-2">Nom</th><th className="px-4 py-2">Type</th><th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort(semiSortOrder, setSemiSortOrder)}>Quantité (kg) {sortIcon(semiSortOrder)}</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody>
                {filteredSemiPrets.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{s.nom}</td>
                    <td className="px-4 py-2"><span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{s.type}</span></td>
                    <td className="px-4 py-2 font-semibold">{s.quantiteKg}</td>
                    <td className="px-4 py-2">
                      <button onClick={() => startEdit("semi-pret", s)} className="text-blue-500 hover:text-blue-700 text-xs mr-2"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDelete("semi-pret", s._id)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSemiPrets.length === 0 && <p className="text-gray-400 text-sm text-center mt-4">Aucun produit semi-prêt trouvé</p>}
          </div>
        )}

        {/* ============ FINAL ============ */}
        {activeTab === "final" && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Produit Final</h3>
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <input
                className="border rounded px-3 py-2 text-sm flex-1"
                placeholder="Rechercher par nom ou type..."
                value={finalSearch}
                onChange={(e) => setFinalSearch(e.target.value)}
              />
              <select
                className="border rounded px-3 py-2 text-sm"
                value={finalEtatFilter}
                onChange={(e) => setFinalEtatFilter(e.target.value)}
              >
                <option value="tous">Tous les états</option>
                <option value="dispo">Disponible</option>
                <option value="vendu">Vendu</option>
              </select>
            </div>
            <form onSubmit={handleAddFinal} className="flex flex-wrap gap-3 mb-6 items-end">
              <select className="border rounded px-3 py-2 text-sm" value={finalForm.type} onChange={(e) => setFinalForm({ ...finalForm, type: e.target.value })}>
                <option value="base">Base</option><option value="bargatere">Bargatère</option>
              </select>
              <input className="border rounded px-3 py-2 text-sm w-28" type="number" min="0.01" step="0.01" placeholder="Quantité (kg)" required value={finalForm.quantiteKg} onChange={(e) => setFinalForm({ ...finalForm, quantiteKg: e.target.value })} />
              <span className="text-sm text-gray-500">Stock SP Base: <strong className="text-purple-700">{(counters.semiPretBase || 0).toFixed(2)} kg</strong> | SP Bargatère: <strong className="text-purple-700">{(counters.semiPretBargatere || 0).toFixed(2)} kg</strong></span>
              <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded text-sm hover:bg-pink-700">Ajouter</button>
            </form>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100"><tr><th className="px-4 py-2">Nom</th><th className="px-4 py-2">Type</th><th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort(finalSortOrder, setFinalSortOrder)}>Quantité (kg) {sortIcon(finalSortOrder)}</th><th className="px-4 py-2">État</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody>
                {filteredFinals.map((f) => (
                  <tr key={f._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{f.nom}</td>
                    <td className="px-4 py-2"><span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">{f.type}</span></td>
                    <td className="px-4 py-2 font-semibold">{f.quantiteKg}</td>
                    <td className="px-4 py-2">
                      <button
                        className={`w-24 px-3 py-1 rounded-full text-white text-xs font-bold ${f.etat === "vendu" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                        onClick={() => toggleEtat(f._id)}
                      >
                        {f.etat === "vendu" ? "Vendu" : "Dispo"}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => startEdit("final", f)} className="text-blue-500 hover:text-blue-700 text-xs mr-2"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDelete("final", f._id)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredFinals.length === 0 && <p className="text-gray-400 text-sm text-center mt-4">Aucun produit final trouvé</p>}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Modifier le produit</h3>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                <input className="border rounded px-3 py-2 text-sm w-full" required value={editForm.nom || ""} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} />
              </div>
              {(editingItem.category === "semi-pret" || editingItem.category === "final") && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Type</label>
                  <select className="border rounded px-3 py-2 text-sm w-full" value={editForm.type || "base"} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                    <option>base</option><option>bargatere</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Quantité (kg)</label>
                <input className="border rounded px-3 py-2 text-sm w-full" type="number" min="0" step="0.01" required value={editForm.quantiteKg || ""} onChange={(e) => setEditForm({ ...editForm, quantiteKg: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
