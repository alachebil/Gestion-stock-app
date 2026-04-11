import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000/caisse";

export default function CaisseCard() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: "depense", description: "", montant: "", date: "" });
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [entriesRes, summaryRes] = await Promise.all([
        axios.get(API),
        axios.get(`${API}/summary`),
      ]);
      setEntries(entriesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(null);
    if (Number(form.montant) <= 0) {
      setError("Le montant doit être supérieur à 0");
      return;
    }
    try {
      await axios.post(API, { ...form, montant: Number(form.montant) });
      setForm({ type: "depense", description: "", montant: "", date: "" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("fr-FR");

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement de la caisse...</p>;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
      <div className="px-6 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          <i className="fas fa-cash-register mr-2"></i>Gestion de Caisse
        </h3>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-800 mb-1"><i className="fas fa-file-invoice mr-1"></i>Dépenses Factures Prod.</h4>
              <p className="text-2xl font-bold text-red-700">{(summary.depensesFacturesProd || 0).toFixed(2)} TND</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-orange-800 mb-1"><i className="fas fa-file-invoice-dollar mr-1"></i>Dépenses Factures Service</h4>
              <p className="text-2xl font-bold text-orange-700">{(summary.depensesFacturesService || 0).toFixed(2)} TND</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-1"><i className="fas fa-hand-holding-usd mr-1"></i>Dépenses Manuelles</h4>
              <p className="text-2xl font-bold text-yellow-700">{(summary.depensesManuelles || 0).toFixed(2)} TND</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-1"><i className="fas fa-shopping-cart mr-1"></i>Total Ventes</h4>
              <p className="text-2xl font-bold text-green-700">{(summary.ventes || 0).toFixed(2)} TND</p>
            </div>
          </div>
        )}

        {/* Totals bar */}
        {summary && (
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Total Dépenses</p>
              <p className="text-xl font-bold text-red-600">{(summary.totalDepenses || 0).toFixed(2)} TND</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Total Ventes</p>
              <p className="text-xl font-bold text-green-600">{(summary.ventes || 0).toFixed(2)} TND</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-600">Solde</p>
              <p className={`text-xl font-bold ${(summary.solde || 0) >= 0 ? "text-green-700" : "text-red-700"}`}>
                {(summary.solde || 0).toFixed(2)} TND
              </p>
            </div>
          </div>
        )}

        {/* Add entry form */}
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 mb-6 items-end p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select className="border rounded px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="depense">Dépense</option>
              <option value="vente">Vente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Montant (TND)</label>
            <input className="border rounded px-3 py-2 text-sm w-32" type="number" min="0.01" step="0.01" placeholder="Montant" required value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input className="border rounded px-3 py-2 text-sm" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Ajouter</button>
        </form>

        {/* Entries table */}
        <table className="w-full text-sm text-left mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Montant</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-1 rounded ${e.type === "depense" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                    {e.type === "depense" ? "Dépense" : "Vente"}
                  </span>
                </td>
                <td className="px-4 py-2">{e.description}</td>
                <td className="px-4 py-2 font-semibold">{e.montant.toFixed(2)} TND</td>
                <td className="px-4 py-2">{formatDate(e.date)}</td>
                <td className="px-4 py-2">
                  <button onClick={() => handleDelete(e._id)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && <p className="text-gray-400 text-sm text-center mb-6">Aucune entrée manuelle</p>}
      </div>
    </div>
  );
}
