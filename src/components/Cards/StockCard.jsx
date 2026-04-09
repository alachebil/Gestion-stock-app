import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000/stock";

export default function StockCard() {
  const [summary, setSummary] = useState(null);
  const [matieres, setMatieres] = useState([]);
  const [semiPrets, setSemiPrets] = useState([]);
  const [finals, setFinals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [matiereForm, setMatiereForm] = useState({ nom: "", type: "Type 1", quantiteKg: "" });
  const [semiPretForm, setSemiPretForm] = useState({ nom: "", type: "Type 1", quantiteKg: "", matiereSource: "" });
  const [finalForm, setFinalForm] = useState({ nom: "", quantiteKg: "", produitSemiPretSource: "" });

  // Transformation forms
  const [transfoSemi, setTransfoSemi] = useState({ matiereId: "", produitSemiPretId: "", quantiteKg: "" });
  const [transfoFinal, setTransfoFinal] = useState({ produitSemiPretId: "", produitFinalId: "", quantiteKg: "" });

  const [activeTab, setActiveTab] = useState("summary");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sumRes, matRes, semiRes, finRes] = await Promise.all([
        axios.get(`${API}/summary`),
        axios.get(`${API}/matiere`),
        axios.get(`${API}/semi-pret`),
        axios.get(`${API}/final`),
      ]);
      setSummary(sumRes.data);
      setMatieres(matRes.data);
      setSemiPrets(semiRes.data);
      setFinals(finRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAddMatiere = async (e) => {
    e.preventDefault();
    await axios.post(`${API}/matiere`, { ...matiereForm, quantiteKg: Number(matiereForm.quantiteKg) });
    setMatiereForm({ nom: "", type: "Type 1", quantiteKg: "" });
    fetchAll();
  };

  const handleAddSemiPret = async (e) => {
    e.preventDefault();
    const body = { ...semiPretForm, quantiteKg: Number(semiPretForm.quantiteKg) };
    if (!body.matiereSource) delete body.matiereSource;
    await axios.post(`${API}/semi-pret`, body);
    setSemiPretForm({ nom: "", type: "Type 1", quantiteKg: "", matiereSource: "" });
    fetchAll();
  };

  const handleAddFinal = async (e) => {
    e.preventDefault();
    const body = { ...finalForm, quantiteKg: Number(finalForm.quantiteKg) };
    if (!body.produitSemiPretSource) delete body.produitSemiPretSource;
    await axios.post(`${API}/final`, body);
    setFinalForm({ nom: "", quantiteKg: "", produitSemiPretSource: "" });
    fetchAll();
  };

  const handleTransfoSemi = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transformer/semi-pret`, { ...transfoSemi, quantiteKg: Number(transfoSemi.quantiteKg) });
      setTransfoSemi({ matiereId: "", produitSemiPretId: "", quantiteKg: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de transformation");
    }
  };

  const handleTransfoFinal = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/transformer/final`, { ...transfoFinal, quantiteKg: Number(transfoFinal.quantiteKg) });
      setTransfoFinal({ produitSemiPretId: "", produitFinalId: "", quantiteKg: "" });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur de transformation");
    }
  };

  const handleDelete = async (category, id) => {
    await axios.delete(`${API}/${category}/${id}`);
    fetchAll();
  };

  const tabBtn = (key, label) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
        activeTab === key ? "bg-white text-blue-700 border-b-2 border-blue-700" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {label}
    </button>
  );

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement du stock...</p>;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white">
      {/* Tabs */}
      <div className="flex space-x-1 px-6 pt-4">
        {tabBtn("summary", "Résumé du Stock")}
        {tabBtn("matiere", "Matière Première")}
        {tabBtn("semi", "Produit Semi-Prêt")}
        {tabBtn("final", "Produit Final")}
        {tabBtn("transform", "Transformations")}
      </div>

      <div className="block w-full overflow-x-auto p-6">
        {/* ============ SUMMARY ============ */}
        {activeTab === "summary" && summary && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Résumé global du stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Matière Première */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2"><i className="fas fa-cubes mr-2"></i>Matière Première</h4>
                {summary.matierePremieres.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucune matière en stock</p>
                ) : (
                  summary.matierePremieres.map((m) => (
                    <div key={m._id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">{m._id}</span>
                      <span className="font-bold text-blue-700">{m.totalKg} kg ({m.count} entrées)</span>
                    </div>
                  ))
                )}
              </div>
              {/* Semi-Prêt */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2"><i className="fas fa-cogs mr-2"></i>Produit Semi-Prêt</h4>
                {summary.produitsSemiPrets.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun produit semi-prêt en stock</p>
                ) : (
                  summary.produitsSemiPrets.map((s) => (
                    <div key={s._id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">{s._id}</span>
                      <span className="font-bold text-yellow-700">{s.totalKg} kg ({s.count} entrées)</span>
                    </div>
                  ))
                )}
              </div>
              {/* Final */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2"><i className="fas fa-box mr-2"></i>Produit Final</h4>
                {summary.produitsFinals.length === 0 ? (
                  <p className="text-gray-500 text-sm">Aucun produit final en stock</p>
                ) : (
                  summary.produitsFinals.map((f) => (
                    <div key={f._id} className="flex justify-between text-sm py-1">
                      <span className="text-gray-700">{f._id}</span>
                      <span className="font-bold text-green-700">{f.totalKg} kg ({f.count} entrées)</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============ MATIERE PREMIERE ============ */}
        {activeTab === "matiere" && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Matière Première</h3>
            <form onSubmit={handleAddMatiere} className="flex flex-wrap gap-3 mb-6 items-end">
              <input className="border rounded px-3 py-2 text-sm" placeholder="Nom" required value={matiereForm.nom} onChange={(e) => setMatiereForm({ ...matiereForm, nom: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={matiereForm.type} onChange={(e) => setMatiereForm({ ...matiereForm, type: e.target.value })}>
                <option>Type 1</option><option>Type 2</option><option>Type 3</option>
              </select>
              <input className="border rounded px-3 py-2 text-sm w-28" type="number" min="0" step="0.01" placeholder="Quantité (kg)" required value={matiereForm.quantiteKg} onChange={(e) => setMatiereForm({ ...matiereForm, quantiteKg: e.target.value })} />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">Ajouter</button>
            </form>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100"><tr><th className="px-4 py-2">Nom</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Quantité (kg)</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody>
                {matieres.map((m) => (
                  <tr key={m._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{m.nom}</td>
                    <td className="px-4 py-2"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{m.type}</span></td>
                    <td className="px-4 py-2 font-semibold">{m.quantiteKg}</td>
                    <td className="px-4 py-2"><button onClick={() => handleDelete("matiere", m._id)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {matieres.length === 0 && <p className="text-gray-400 text-sm text-center mt-4">Aucune matière première ajoutée</p>}
          </div>
        )}

        {/* ============ SEMI-PRET ============ */}
        {activeTab === "semi" && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Produit Semi-Prêt</h3>
            <form onSubmit={handleAddSemiPret} className="flex flex-wrap gap-3 mb-6 items-end">
              <input className="border rounded px-3 py-2 text-sm" placeholder="Nom" required value={semiPretForm.nom} onChange={(e) => setSemiPretForm({ ...semiPretForm, nom: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={semiPretForm.type} onChange={(e) => setSemiPretForm({ ...semiPretForm, type: e.target.value })}>
                <option>Type 1</option><option>Type 2</option><option>Type 3</option>
              </select>
              <input className="border rounded px-3 py-2 text-sm w-28" type="number" min="0" step="0.01" placeholder="Quantité (kg)" required value={semiPretForm.quantiteKg} onChange={(e) => setSemiPretForm({ ...semiPretForm, quantiteKg: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={semiPretForm.matiereSource} onChange={(e) => setSemiPretForm({ ...semiPretForm, matiereSource: e.target.value })}>
                <option value="">-- Matière source (optionnel) --</option>
                {matieres.map((m) => <option key={m._id} value={m._id}>{m.nom} ({m.type})</option>)}
              </select>
              <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600">Ajouter</button>
            </form>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100"><tr><th className="px-4 py-2">Nom</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Quantité (kg)</th><th className="px-4 py-2">Source</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody>
                {semiPrets.map((s) => (
                  <tr key={s._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{s.nom}</td>
                    <td className="px-4 py-2"><span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{s.type}</span></td>
                    <td className="px-4 py-2 font-semibold">{s.quantiteKg}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{s.matiereSource?.nom || "—"}</td>
                    <td className="px-4 py-2"><button onClick={() => handleDelete("semi-pret", s._id)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {semiPrets.length === 0 && <p className="text-gray-400 text-sm text-center mt-4">Aucun produit semi-prêt ajouté</p>}
          </div>
        )}

        {/* ============ FINAL ============ */}
        {activeTab === "final" && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-4">Produit Final</h3>
            <form onSubmit={handleAddFinal} className="flex flex-wrap gap-3 mb-6 items-end">
              <input className="border rounded px-3 py-2 text-sm" placeholder="Nom" required value={finalForm.nom} onChange={(e) => setFinalForm({ ...finalForm, nom: e.target.value })} />
              <input className="border rounded px-3 py-2 text-sm w-28" type="number" min="0" step="0.01" placeholder="Quantité (kg)" required value={finalForm.quantiteKg} onChange={(e) => setFinalForm({ ...finalForm, quantiteKg: e.target.value })} />
              <select className="border rounded px-3 py-2 text-sm" value={finalForm.produitSemiPretSource} onChange={(e) => setFinalForm({ ...finalForm, produitSemiPretSource: e.target.value })}>
                <option value="">-- Semi-prêt source (optionnel) --</option>
                {semiPrets.map((s) => <option key={s._id} value={s._id}>{s.nom} ({s.type})</option>)}
              </select>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">Ajouter</button>
            </form>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100"><tr><th className="px-4 py-2">Nom</th><th className="px-4 py-2">Quantité (kg)</th><th className="px-4 py-2">Source Semi-Prêt</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody>
                {finals.map((f) => (
                  <tr key={f._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{f.nom}</td>
                    <td className="px-4 py-2 font-semibold">{f.quantiteKg}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{f.produitSemiPretSource?.nom || "—"}</td>
                    <td className="px-4 py-2"><button onClick={() => handleDelete("final", f._id)} className="text-red-500 hover:text-red-700 text-xs"><i className="fas fa-trash"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {finals.length === 0 && <p className="text-gray-400 text-sm text-center mt-4">Aucun produit final ajouté</p>}
          </div>
        )}

        {/* ============ TRANSFORMATIONS ============ */}
        {activeTab === "transform" && (
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-6">Transformations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* MP -> Semi-Prêt */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h4 className="font-semibold text-blue-800 mb-3"><i className="fas fa-arrow-right mr-2"></i>Matière Première → Semi-Prêt</h4>
                <form onSubmit={handleTransfoSemi} className="space-y-3">
                  <select className="border rounded px-3 py-2 text-sm w-full" required value={transfoSemi.matiereId} onChange={(e) => setTransfoSemi({ ...transfoSemi, matiereId: e.target.value })}>
                    <option value="">-- Sélectionner matière première --</option>
                    {matieres.map((m) => <option key={m._id} value={m._id}>{m.nom} ({m.type}) — {m.quantiteKg} kg</option>)}
                  </select>
                  <select className="border rounded px-3 py-2 text-sm w-full" required value={transfoSemi.produitSemiPretId} onChange={(e) => setTransfoSemi({ ...transfoSemi, produitSemiPretId: e.target.value })}>
                    <option value="">-- Sélectionner produit semi-prêt --</option>
                    {semiPrets.map((s) => <option key={s._id} value={s._id}>{s.nom} ({s.type}) — {s.quantiteKg} kg</option>)}
                  </select>
                  <input className="border rounded px-3 py-2 text-sm w-full" type="number" min="0.01" step="0.01" placeholder="Quantité à transformer (kg)" required value={transfoSemi.quantiteKg} onChange={(e) => setTransfoSemi({ ...transfoSemi, quantiteKg: e.target.value })} />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 w-full">Transformer</button>
                </form>
              </div>
              {/* Semi-Prêt -> Final */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h4 className="font-semibold text-green-800 mb-3"><i className="fas fa-arrow-right mr-2"></i>Semi-Prêt → Produit Final</h4>
                <form onSubmit={handleTransfoFinal} className="space-y-3">
                  <select className="border rounded px-3 py-2 text-sm w-full" required value={transfoFinal.produitSemiPretId} onChange={(e) => setTransfoFinal({ ...transfoFinal, produitSemiPretId: e.target.value })}>
                    <option value="">-- Sélectionner produit semi-prêt --</option>
                    {semiPrets.map((s) => <option key={s._id} value={s._id}>{s.nom} ({s.type}) — {s.quantiteKg} kg</option>)}
                  </select>
                  <select className="border rounded px-3 py-2 text-sm w-full" required value={transfoFinal.produitFinalId} onChange={(e) => setTransfoFinal({ ...transfoFinal, produitFinalId: e.target.value })}>
                    <option value="">-- Sélectionner produit final --</option>
                    {finals.map((f) => <option key={f._id} value={f._id}>{f.nom} — {f.quantiteKg} kg</option>)}
                  </select>
                  <input className="border rounded px-3 py-2 text-sm w-full" type="number" min="0.01" step="0.01" placeholder="Quantité à transformer (kg)" required value={transfoFinal.quantiteKg} onChange={(e) => setTransfoFinal({ ...transfoFinal, quantiteKg: e.target.value })} />
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 w-full">Transformer</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
