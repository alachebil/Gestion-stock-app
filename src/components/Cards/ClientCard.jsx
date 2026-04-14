import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000/client";

export default function ClientCard() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nom: "", telephone: "", adresse: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Ventes history
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientVentes, setClientVentes] = useState([]);
  const [ventesLoading, setVentesLoading] = useState(false);
  const [venteSearch, setVenteSearch] = useState("");

  // Pagination
  const clientsPerPage = 10;
  const [clientPage, setClientPage] = useState(1);
  const ventesPerPage = 5;
  const [ventePage, setVentePage] = useState(1);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API);
      setClients(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API, form);
      setForm({ nom: "", telephone: "", adresse: "" });
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce client ?")) return;
    await axios.delete(`${API}/${id}`);
    if (selectedClient?._id === id) { setSelectedClient(null); setClientVentes([]); }
    fetchClients();
  };

  const startEdit = (client) => {
    setEditingId(client._id);
    setEditForm({ nom: client.nom, telephone: client.telephone, adresse: client.adresse });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/${editingId}`, editForm);
      setEditingId(null);
      setEditForm({});
      fetchClients();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const viewVentes = async (client) => {
    setSelectedClient(client);
    setVentesLoading(true);
    setVentePage(1);
    setVenteSearch("");
    try {
      const res = await axios.get(`${API}/${client._id}/ventes`);
      setClientVentes(res.data);
    } catch (err) {
      console.error(err);
    }
    setVentesLoading(false);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone.includes(search) ||
      c.adresse.toLowerCase().includes(search.toLowerCase())
  );

  const clientTotalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const paginatedClients = filteredClients.slice((clientPage - 1) * clientsPerPage, clientPage * clientsPerPage);

  const filteredVentes = clientVentes.filter(
    (v) =>
      v.chauffeur?.toLowerCase().includes(venteSearch.toLowerCase()) ||
      v.matriculation?.toLowerCase().includes(venteSearch.toLowerCase()) ||
      v.source?.toLowerCase().includes(venteSearch.toLowerCase()) ||
      new Date(v.dateVente).toLocaleDateString("fr-FR").includes(venteSearch)
  );

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement des clients...</p>;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
      <div className="block w-full overflow-x-auto p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4"><i className="fas fa-users mr-2"></i>Gestion des Clients</h3>

        {/* Add form */}
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 mb-6 items-end">
          <input className="border rounded px-3 py-2 text-sm" placeholder="Nom" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          <input className="border rounded px-3 py-2 text-sm" placeholder="Téléphone" required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
          <input className="border rounded px-3 py-2 text-sm flex-1" placeholder="Adresse" required value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">Ajouter</button>
        </form>

        {/* Search */}
        <input className="border rounded px-3 py-2 text-sm mb-4 w-full" placeholder="Rechercher par nom, téléphone ou adresse..." value={search} onChange={(e) => setSearch(e.target.value)} />

        {/* Table */}
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Nom</th>
              <th className="px-4 py-2">Téléphone</th>
              <th className="px-4 py-2">Adresse</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.map((c) => (
              <tr key={c._id} className={`border-b hover:bg-gray-50 ${selectedClient?._id === c._id ? "bg-indigo-50" : ""}`}>
                <td className="px-4 py-2 font-semibold">{c.nom}</td>
                <td className="px-4 py-2">{c.telephone}</td>
                <td className="px-4 py-2">{c.adresse}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button onClick={() => viewVentes(c)} className="text-indigo-500 hover:text-indigo-700 text-xs" title="Historique achats"><i className="fas fa-history"></i></button>
                  <button onClick={() => startEdit(c)} className="text-blue-500 hover:text-blue-700 text-xs"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && <p className="text-gray-400 text-sm text-center mt-4">Aucun client trouvé</p>}
        {clientTotalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: clientTotalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setClientPage(i + 1)} className={`px-3 py-1 rounded text-sm ${clientPage === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Ventes History Panel */}
        {selectedClient && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-gray-700"><i className="fas fa-receipt mr-2"></i>Historique des achats: {selectedClient.nom}</h4>
              <button onClick={() => { setSelectedClient(null); setClientVentes([]); }} className="text-gray-400 hover:text-gray-600 text-sm"><i className="fas fa-times"></i></button>
            </div>
            <input className="border rounded px-3 py-2 text-sm mb-3 w-full" placeholder="Rechercher par date, chauffeur, matriculation, source..." value={venteSearch} onChange={(e) => { setVenteSearch(e.target.value); setVentePage(1); }} />
            {ventesLoading ? (
              <p className="text-gray-400 text-sm">Chargement...</p>
            ) : filteredVentes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center">Aucun achat trouvé</p>
            ) : (
              <>
              <div className="space-y-3">
                {filteredVentes.slice((ventePage - 1) * ventesPerPage, ventePage * ventesPerPage).map((v) => (
                  <div key={v._id} className="bg-gray-50 border rounded p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">{new Date(v.dateVente).toLocaleDateString("fr-FR")} à {new Date(v.dateVente).toLocaleTimeString("fr-FR")}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${v.source === "production" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>{v.source}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">Chauffeur: {v.chauffeur} | Matriculation: {v.matriculation}</div>
                    <div className="text-xs mb-1">
                      {v.prixParType.map((pt) => (
                        <span key={pt.type} className="mr-3">{pt.type}: {pt.totalKg.toFixed(2)} kg × {pt.prixKg.toFixed(2)} TND = <strong>{pt.sousTotal.toFixed(2)} TND</strong></span>
                      ))}
                    </div>
                    <div className="text-sm font-bold text-green-700">Total: {v.totalGeneral.toFixed(2)} TND</div>
                  </div>
                ))}
              </div>
              {Math.ceil(filteredVentes.length / ventesPerPage) > 1 && (
                <div className="flex justify-center space-x-2 mt-3">
                  {Array.from({ length: Math.ceil(filteredVentes.length / ventesPerPage) }, (_, i) => (
                    <button key={i + 1} onClick={() => setVentePage(i + 1)} className={`px-3 py-1 rounded text-sm ${ventePage === i + 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Modifier le client</h3>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                <input className="border rounded px-3 py-2 text-sm w-full" required value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
                <input className="border rounded px-3 py-2 text-sm w-full" required value={editForm.telephone} onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Adresse</label>
                <input className="border rounded px-3 py-2 text-sm w-full" required value={editForm.adresse} onChange={(e) => setEditForm({ ...editForm, adresse: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
                <button type="submit" className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
