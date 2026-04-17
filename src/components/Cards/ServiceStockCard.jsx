import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const API = "http://localhost:3000/service-stock";
const CLIENT_API = "http://localhost:3000/client";
const VENTE_API = "http://localhost:3000/vente";

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

  // Pagination
  const itemsPerPage = 10;
  const [semiPage, setSemiPage] = useState(1);
  const [finalPage, setFinalPage] = useState(1);

  // Vente states
  const [selectedIds, setSelectedIds] = useState([]);
  const [showVentePopup, setShowVentePopup] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [prixKgBase, setPrixKgBase] = useState("");
  const [prixKgBargatere, setPrixKgBargatere] = useState("");
  const [chauffeur, setChauffeur] = useState("");
  const [matriculation, setMatriculation] = useState("");
  const [montantPaye, setMontantPaye] = useState("");

  // Demo states
  const [showDemoPopup, setShowDemoPopup] = useState(false);
  const [demoProducts, setDemoProducts] = useState([]);
  const [demoPrixKgBase, setDemoPrixKgBase] = useState("");
  const [demoPrixKgBargatere, setDemoPrixKgBargatere] = useState("");
  const [demoChauffeur, setDemoChauffeur] = useState("");
  const [demoMatriculation, setDemoMatriculation] = useState("");
  const [demoSelectedClientId, setDemoSelectedClientId] = useState("");

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

  // Vente helpers
  const toggleSelectProduct = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllDispo = () => {
    const dispoIds = filteredFinals.filter((f) => f.etat === "dispo").map((f) => f._id);
    setSelectedIds((prev) => {
      const allSelected = dispoIds.every((id) => prev.includes(id));
      if (allSelected) return prev.filter((id) => !dispoIds.includes(id));
      return [...new Set([...prev, ...dispoIds])];
    });
  };

  const openVentePopup = async () => {
    if (selectedIds.length === 0) { alert("Sélectionnez au moins un produit"); return; }
    try {
      const res = await axios.get(CLIENT_API);
      setClients(res.data);
    } catch { /* ignore */ }
    setMontantPaye("");
    setShowVentePopup(true);
  };

  const openDemoPopup = async () => {
    if (selectedIds.length === 0) { alert("Sélectionnez au moins un produit"); return; }
    try {
      const res = await axios.get(CLIENT_API);
      setClients(res.data);
    } catch { /* ignore */ }
    setDemoProducts(finals.filter((f) => selectedIds.includes(f._id)).map((p) => ({ ...p, demoQuantiteKg: p.quantiteKg })));
    setDemoPrixKgBase("");
    setDemoPrixKgBargatere("");
    setDemoChauffeur("");
    setDemoMatriculation("");
    setDemoSelectedClientId("");
    setShowDemoPopup(true);
  };

  const selectedProducts = finals.filter((f) => selectedIds.includes(f._id));
  const groupedSelected = selectedProducts.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = { totalKg: 0, count: 0 };
    acc[p.type].totalKg += p.quantiteKg;
    acc[p.type].count += 1;
    return acc;
  }, {});

  const calcTotal = () => {
    let total = 0;
    if (groupedSelected.base && prixKgBase) total += groupedSelected.base.totalKg * Number(prixKgBase);
    if (groupedSelected.bargatere && prixKgBargatere) total += groupedSelected.bargatere.totalKg * Number(prixKgBargatere);
    return total;
  };

  const generateVentePDF = (vente, clientObj, montantPayeValue) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Sté RPL industrie", 10, 18, { align: "left" });
    doc.setFontSize(7);
    doc.text("Z.I : Avenue.Janvier 1952 Téboulba", 10, 23, { align: "left" });
    doc.setFontSize(7);
    doc.text("Tél: 29 501 019", 10, 28, { align: "left" });
    doc.setFontSize(7);
    doc.text("T.V.A: 1978076 L/A/M/000", 10, 33, { align: "left" });
    doc.setFontSize(20);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text("Bon de Livraison", pageWidth - 10, 18, { align: "right" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date(vente.dateVente).toLocaleDateString("fr-FR")} , Téboulba`, 20, 38);
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(20, 42, 190, 42);

    let y = 50;
    doc.setFont("helvetica", "bold");
    doc.text("Client:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${clientObj.nom}  |  Tél: ${clientObj.telephone}  |  Adresse: ${clientObj.adresse}`, 45, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Chauffeur:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${vente.chauffeur}  |  Immatriculation: ${vente.matriculation}`, 50, y);
    y += 12;

    doc.setFont("helvetica", "bold");
    doc.text("Produits vendus:", 20, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Nom", "Type", "Quantité (kg)"]],
      body: vente.produits.map((p) => [p.nom, p.type, p.quantiteKg]),
      theme: "grid",
      headStyles: { fillColor: [156, 39, 176] },
    });
    y = (doc.lastAutoTable?.finalY || y) + 10;

    doc.setFont("helvetica", "bold");
    doc.text("Récapitulatif par type:", 20, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Type", "Quantité totale (kg)", "Prix/kg (TND)", "Sous-total (TND)"]],
      body: vente.prixParType.map((pt) => [pt.type, pt.totalKg.toFixed(2), pt.prixKg.toFixed(2), pt.sousTotal.toFixed(2)]),
      theme: "grid",
      headStyles: { fillColor: [233, 30, 99] },
    });
    y = (doc.lastAutoTable?.finalY || y) + 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Montant TOTAL: ${vente.totalGeneral.toFixed(2)} TND`, 20, y);
    if (montantPayeValue !== undefined && montantPayeValue !== null) {
      y += 8;
      doc.text(`Montant Payé: ${Number(montantPayeValue).toFixed(2)} TND`, 20, y);
      const reste = vente.totalGeneral - Number(montantPayeValue);
      if (reste > 0) {
        y += 8;
        doc.setTextColor(255, 0, 0);
        doc.text(`Reste à payer: ${reste.toFixed(2)} TND`, 20, y);
        doc.setTextColor(0, 0, 0);
      }
    }

    doc.save(`bon_de_vente_service_${clientObj.nom}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Demo grouped/total helpers
  const demoGroupedSelected = demoProducts.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = { totalKg: 0, count: 0 };
    acc[p.type].totalKg += Number(p.demoQuantiteKg) || 0;
    acc[p.type].count += 1;
    return acc;
  }, {});

  const calcDemoTotal = () => {
    let total = 0;
    if (demoGroupedSelected.base && demoPrixKgBase) total += demoGroupedSelected.base.totalKg * Number(demoPrixKgBase);
    if (demoGroupedSelected.bargatere && demoPrixKgBargatere) total += demoGroupedSelected.bargatere.totalKg * Number(demoPrixKgBargatere);
    return total;
  };

  const updateDemoQuantity = (id, val) => {
    setDemoProducts((prev) => prev.map((p) => p._id === id ? { ...p, demoQuantiteKg: val } : p));
  };

  const handleSubmitDemo = () => {
    if (!demoSelectedClientId) { alert("Sélectionnez un client"); return; }
    if (!demoChauffeur || !demoMatriculation) { alert("Remplissez chauffeur et immatriculation"); return; }
    const clientObj = clients.find((c) => c._id === demoSelectedClientId);
    const prixParTypeData = [];
    if (demoGroupedSelected.base) {
      if (!demoPrixKgBase || Number(demoPrixKgBase) <= 0) { alert("Entrez un prix/kg pour le type Base"); return; }
      prixParTypeData.push({ type: "base", totalKg: demoGroupedSelected.base.totalKg, prixKg: Number(demoPrixKgBase), sousTotal: demoGroupedSelected.base.totalKg * Number(demoPrixKgBase) });
    }
    if (demoGroupedSelected.bargatere) {
      if (!demoPrixKgBargatere || Number(demoPrixKgBargatere) <= 0) { alert("Entrez un prix/kg pour le type Bargatère"); return; }
      prixParTypeData.push({ type: "bargatere", totalKg: demoGroupedSelected.bargatere.totalKg, prixKg: Number(demoPrixKgBargatere), sousTotal: demoGroupedSelected.bargatere.totalKg * Number(demoPrixKgBargatere) });
    }
    const demoVente = {
      dateVente: new Date(),
      chauffeur: demoChauffeur,
      matriculation: demoMatriculation,
      produits: demoProducts.map((p) => ({ nom: p.nom, type: p.type, quantiteKg: Number(p.demoQuantiteKg) || 0 })),
      prixParType: prixParTypeData,
      totalGeneral: calcDemoTotal(),
    };
    generateVentePDF(demoVente, clientObj);
    setShowDemoPopup(false);
    setSelectedIds([]);
  };

  const handleSubmitVente = async () => {
    if (!selectedClientId) { alert("Sélectionnez un client"); return; }
    if (!chauffeur || !matriculation) { alert("Remplissez chauffeur et matriculation"); return; }
    const prixParType = [];
    if (groupedSelected.base) {
      if (!prixKgBase || Number(prixKgBase) <= 0) { alert("Entrez un prix/kg pour le type Base"); return; }
      prixParType.push({ type: "base", prixKg: Number(prixKgBase) });
    }
    if (groupedSelected.bargatere) {
      if (!prixKgBargatere || Number(prixKgBargatere) <= 0) { alert("Entrez un prix/kg pour le type Bargatère"); return; }
      prixParType.push({ type: "bargatere", prixKg: Number(prixKgBargatere) });
    }
    const montantPayeVal = montantPaye ? Number(montantPaye) : null;
    try {
      const res = await axios.post(VENTE_API, {
        clientId: selectedClientId,
        produitIds: selectedIds,
        prixParType,
        chauffeur,
        matriculation,
        source: "service",
        ...(montantPayeVal !== null && { montantPaye: montantPayeVal }),
      });
      const clientObj = clients.find((c) => c._id === selectedClientId);
      generateVentePDF(res.data, clientObj, montantPayeVal);
      setShowVentePopup(false);
      setSelectedIds([]);
      setSelectedClientId("");
      setPrixKgBase("");
      setPrixKgBargatere("");
      setChauffeur("");
      setMatriculation("");
      setMontantPaye("");
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la vente");
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

  // Pagination helpers
  const paginatedSemiPrets = filteredSemiPrets.slice((semiPage - 1) * itemsPerPage, semiPage * itemsPerPage);
  const semiTotalPages = Math.ceil(filteredSemiPrets.length / itemsPerPage);

  const paginatedFinals = filteredFinals.slice((finalPage - 1) * itemsPerPage, finalPage * itemsPerPage);
  const finalTotalPages = Math.ceil(filteredFinals.length / itemsPerPage);

  const PaginationBar = ({ currentPage, totalPages, setPage }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded text-sm ${currentPage === i + 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

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
                {paginatedSemiPrets.map((s) => (
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
            <PaginationBar currentPage={semiPage} totalPages={semiTotalPages} setPage={setSemiPage} />
          </div>
        )}

        {/* ============ FINAL ============ */}
        {activeTab === "final" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-700">Produit Final</h3>
              {selectedIds.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={openVentePopup}
                    className="bg-pink-600 text-white px-4 py-2 rounded text-sm hover:bg-pink-700 flex items-center gap-2"
                  >
                    <i className="fas fa-shopping-cart"></i> Vendre ({selectedIds.length})
                  </button>
                  <button
                    onClick={openDemoPopup}
                    className="bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 flex items-center gap-2"
                  >
                    <i className="fas fa-file-pdf"></i> Demo ({selectedIds.length})
                  </button>
                </div>
              )}
            </div>
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
              <thead className="bg-gray-100"><tr><th className="px-4 py-2"><input type="checkbox" onChange={selectAllDispo} checked={filteredFinals.filter(f => f.etat === "dispo").length > 0 && filteredFinals.filter(f => f.etat === "dispo").every(f => selectedIds.includes(f._id))} /></th><th className="px-4 py-2">Nom</th><th className="px-4 py-2">Type</th><th className="px-4 py-2 cursor-pointer select-none" onClick={() => toggleSort(finalSortOrder, setFinalSortOrder)}>Quantité (kg) {sortIcon(finalSortOrder)}</th><th className="px-4 py-2">État</th><th className="px-4 py-2">Actions</th></tr></thead>
              <tbody>
                {paginatedFinals.map((f) => (
                  <tr key={f._id} className={`border-b hover:bg-gray-50 ${selectedIds.includes(f._id) ? "bg-pink-50" : ""}`}>
                    <td className="px-4 py-2">
                      {f.etat === "dispo" && (
                        <input type="checkbox" checked={selectedIds.includes(f._id)} onChange={() => toggleSelectProduct(f._id)} />
                      )}
                    </td>
                    <td className="px-4 py-2">{f.nom}</td>
                    <td className="px-4 py-2"><span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">{f.type}</span></td>
                    <td className="px-4 py-2 font-semibold">{f.quantiteKg}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`w-24 inline-block text-center px-3 py-1 rounded-full text-white text-xs font-bold ${f.etat === "vendu" ? "bg-red-500" : "bg-green-500"}`}
                      >
                        {f.etat === "vendu" ? "Vendu" : "Dispo"}
                      </span>
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
            <PaginationBar currentPage={finalPage} totalPages={finalTotalPages} setPage={setFinalPage} />
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

      {/* Vente Popup */}
      {/* Demo Popup */}
      {showDemoPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-700 mb-4"><i className="fas fa-file-pdf mr-2"></i>Demo — Génération PDF uniquement</h3>

            {/* Client */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Client</label>
              <select className="border rounded px-3 py-2 text-sm w-full" value={demoSelectedClientId} onChange={(e) => setDemoSelectedClientId(e.target.value)}>
                <option value="">-- Sélectionner un client --</option>
                {clients.map((c) => (<option key={c._id} value={c._id}>{c.nom} - {c.telephone}</option>))}
              </select>
            </div>

            {/* Products with editable quantities */}
            <div className="mb-4 bg-gray-50 rounded p-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Produits sélectionnés ({demoProducts.length}) — quantités modifiables</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {demoProducts.map((p) => (
                  <div key={p._id} className="flex justify-between items-center text-xs py-1 border-b">
                    <span>{p.nom} <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded ml-1">{p.type}</span></span>
                    <input className="border rounded px-2 py-1 text-sm w-24 text-right" type="number" min="0.01" step="0.01" value={p.demoQuantiteKg} onChange={(e) => updateDemoQuantity(p._id, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Prix par type */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {demoGroupedSelected.base && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h5 className="font-semibold text-purple-800 text-sm mb-1">Base</h5>
                  <p className="text-xs text-gray-600">{demoGroupedSelected.base.count} produit(s) - {demoGroupedSelected.base.totalKg.toFixed(2)} kg</p>
                  <input className="border rounded px-3 py-2 text-sm w-full mt-2" type="number" min="0.01" step="0.01" placeholder="Prix / kg (TND)" value={demoPrixKgBase} onChange={(e) => setDemoPrixKgBase(e.target.value)} />
                  {demoPrixKgBase && <p className="text-xs text-purple-700 mt-1 font-bold">Sous-total: {(demoGroupedSelected.base.totalKg * Number(demoPrixKgBase)).toFixed(2)} TND</p>}
                </div>
              )}
              {demoGroupedSelected.bargatere && (
                <div className="bg-pink-50 border border-pink-200 rounded p-3">
                  <h5 className="font-semibold text-pink-800 text-sm mb-1">Bargatère</h5>
                  <p className="text-xs text-gray-600">{demoGroupedSelected.bargatere.count} produit(s) - {demoGroupedSelected.bargatere.totalKg.toFixed(2)} kg</p>
                  <input className="border rounded px-3 py-2 text-sm w-full mt-2" type="number" min="0.01" step="0.01" placeholder="Prix / kg (TND)" value={demoPrixKgBargatere} onChange={(e) => setDemoPrixKgBargatere(e.target.value)} />
                  {demoPrixKgBargatere && <p className="text-xs text-pink-700 mt-1 font-bold">Sous-total: {(demoGroupedSelected.bargatere.totalKg * Number(demoPrixKgBargatere)).toFixed(2)} TND</p>}
                </div>
              )}
            </div>

            {/* Chauffeur / Matriculation */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Chauffeur</label>
                <input className="border rounded px-3 py-2 text-sm w-full" placeholder="Nom du chauffeur" value={demoChauffeur} onChange={(e) => setDemoChauffeur(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Immatriculation</label>
                <input className="border rounded px-3 py-2 text-sm w-full" placeholder="Immatriculation véhicule" value={demoMatriculation} onChange={(e) => setDemoMatriculation(e.target.value)} />
              </div>
            </div>

            {/* Total */}
            <div className="mb-4 bg-orange-50 border border-orange-300 rounded p-3 text-center">
              <span className="text-lg font-bold text-orange-800">Total Général: {calcDemoTotal().toFixed(2)} TND</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDemoPopup(false)} className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
              <button onClick={handleSubmitDemo} className="px-4 py-2 text-sm bg-orange-500 text-white rounded hover:bg-orange-600"><i className="fas fa-file-pdf mr-1"></i>Générer PDF</button>
            </div>
          </div>
        </div>
      )}

      {showVentePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-700 mb-4"><i className="fas fa-shopping-cart mr-2"></i>Nouvelle Vente (Service)</h3>

            {/* Client */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Client</label>
              <select className="border rounded px-3 py-2 text-sm w-full" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                <option value="">-- Sélectionner un client --</option>
                {clients.map((c) => (<option key={c._id} value={c._id}>{c.nom} - {c.telephone}</option>))}
              </select>
            </div>

            {/* Selected products summary */}
            <div className="mb-4 bg-gray-50 rounded p-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Produits sélectionnés ({selectedProducts.length})</h4>
              <div className="max-h-32 overflow-y-auto">
                {selectedProducts.map((p) => (
                  <div key={p._id} className="flex justify-between text-xs py-1 border-b">
                    <span>{p.nom}</span>
                    <span><span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded">{p.type}</span> - {p.quantiteKg} kg</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantities by type + prix/kg */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupedSelected.base && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h5 className="font-semibold text-purple-800 text-sm mb-1">Base</h5>
                  <p className="text-xs text-gray-600">{groupedSelected.base.count} produit(s) - {groupedSelected.base.totalKg.toFixed(2)} kg</p>
                  <input className="border rounded px-3 py-2 text-sm w-full mt-2" type="number" min="0.01" step="0.01" placeholder="Prix / kg (TND)" value={prixKgBase} onChange={(e) => setPrixKgBase(e.target.value)} />
                  {prixKgBase && <p className="text-xs text-purple-700 mt-1 font-bold">Sous-total: {(groupedSelected.base.totalKg * Number(prixKgBase)).toFixed(2)} TND</p>}
                </div>
              )}
              {groupedSelected.bargatere && (
                <div className="bg-pink-50 border border-pink-200 rounded p-3">
                  <h5 className="font-semibold text-pink-800 text-sm mb-1">Bargatère</h5>
                  <p className="text-xs text-gray-600">{groupedSelected.bargatere.count} produit(s) - {groupedSelected.bargatere.totalKg.toFixed(2)} kg</p>
                  <input className="border rounded px-3 py-2 text-sm w-full mt-2" type="number" min="0.01" step="0.01" placeholder="Prix / kg (TND)" value={prixKgBargatere} onChange={(e) => setPrixKgBargatere(e.target.value)} />
                  {prixKgBargatere && <p className="text-xs text-pink-700 mt-1 font-bold">Sous-total: {(groupedSelected.bargatere.totalKg * Number(prixKgBargatere)).toFixed(2)} TND</p>}
                </div>
              )}
            </div>

            {/* Chauffeur / Matriculation */}
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Chauffeur</label>
                <input className="border rounded px-3 py-2 text-sm w-full" placeholder="Nom du chauffeur" value={chauffeur} onChange={(e) => setChauffeur(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Immatriculation</label>
                <input className="border rounded px-3 py-2 text-sm w-full" placeholder="Immatriculation véhicule" value={matriculation} onChange={(e) => setMatriculation(e.target.value)} />
              </div>
            </div>

            {/* Total */}
            <div className="mb-4 bg-green-50 border border-green-300 rounded p-3 text-center">
              <span className="text-lg font-bold text-green-800">Total Général: {calcTotal().toFixed(2)} TND</span>
            </div>

            {/* Montant Payé */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Montant Payé (TND) — sera enregistré dans la caisse</label>
              <input className="border rounded px-3 py-2 text-sm w-full" type="number" min="0" step="0.01" placeholder={`Par défaut: ${calcTotal().toFixed(2)} TND (total)`} value={montantPaye} onChange={(e) => setMontantPaye(e.target.value)} />
              {montantPaye && Number(montantPaye) < calcTotal() && (
                <p className="text-xs text-orange-600 mt-1">Reste à payer: {(calcTotal() - Number(montantPaye)).toFixed(2)} TND</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowVentePopup(false)} className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400">Annuler</button>
              <button onClick={handleSubmitVente} className="px-4 py-2 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"><i className="fas fa-check mr-1"></i>Terminer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
