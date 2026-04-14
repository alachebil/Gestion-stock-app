import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Chart } from "chart.js/auto";

export default function ServiceDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const chartRef = useRef(null);
  const [transformations, setTransformations] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const historyPerPage = 10;
  const [historyDateSearch, setHistoryDateSearch] = useState("");
  const [historyDateSort, setHistoryDateSort] = useState("desc");

  useEffect(() => {
    if (!user) navigate("/auth/login");
    if (user && user.role !== "admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        const response = await axios.get("http://localhost:3000/service-stock/summary");
        const { produitsSemiPrets, produitsFinals } = response.data;

        const spTotal = produitsSemiPrets.reduce((sum, s) => sum + s.totalKg, 0);
        const pfTotal = produitsFinals.reduce((sum, f) => sum + f.totalKg, 0);

        const spCount = produitsSemiPrets.reduce((sum, s) => sum + s.count, 0);
        const pfCount = produitsFinals.reduce((sum, f) => sum + f.count, 0);

        renderChart([spTotal, pfTotal], [spCount, pfCount]);
      } catch (error) {
        console.error("Error fetching service stock summary:", error);
      }
    };

    fetchStockSummary();

    const fetchTransformations = async () => {
      try {
        const response = await axios.get("http://localhost:3000/service-stock/transformations");
        setTransformations(response.data);
      } catch (error) {
        console.error("Error fetching service transformations:", error);
      }
    };
    fetchTransformations();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const refreshTransformations = async () => {
    try {
      const response = await axios.get("http://localhost:3000/service-stock/transformations");
      setTransformations(response.data);
    } catch (error) {
      console.error("Error fetching service transformations:", error);
    }
  };

  const deleteTransformation = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/service-stock/transformations/${id}`);
      await refreshTransformations();
    } catch (error) {
      console.error("Error deleting transformation:", error);
    }
  };

  const filteredTransformations = transformations
    .filter((t) => {
      if (!historyDateSearch) return true;
      return new Date(t.dateTransformation).toLocaleDateString("fr-FR").includes(historyDateSearch) ||
        new Date(t.dateTransformation).toISOString().split("T")[0] === historyDateSearch;
    })
    .sort((a, b) => {
      const dA = new Date(a.dateTransformation);
      const dB = new Date(b.dateTransformation);
      return historyDateSort === "asc" ? dA - dB : dB - dA;
    });

  const historyTotalPages = Math.ceil(filteredTransformations.length / historyPerPage);
  const paginatedTransformations = filteredTransformations.slice(
    (historyPage - 1) * historyPerPage,
    historyPage * historyPerPage
  );

  const renderChart = (totals, counts) => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById("serviceStockChart").getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Produit Semi-Prêt", "Produit Final"],
        datasets: [
          {
            label: "Quantité totale (kg)",
            data: totals,
            backgroundColor: ["#9C27B0", "#E91E63"],
            borderColor: ["#7B1FA2", "#C2185B"],
            borderWidth: 1,
          },
          {
            label: "Nombre de produits",
            data: counts,
            backgroundColor: ["#CE93D8", "#F48FB1"],
            borderColor: ["#9C27B0", "#E91E63"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: { color: "#fff" },
          },
          title: {
            display: true,
            text: "État du Stock Service",
            color: "#fff",
            font: { size: 16 },
          },
        },
        scales: {
          x: { ticks: { color: "#ccc" }, grid: { color: "#374151" } },
          y: { ticks: { color: "#ccc" }, grid: { color: "#374151" } },
        },
      },
    });
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-36 shadow-lg rounded bg-gray-800">
      <div className="rounded-t mb-0 px-4 py-3 border-0 bg-purple-600">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-2xl text-white">Statistiques du Stock Service</h3>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full overflow-x-auto p-4">
        <canvas id="serviceStockChart" width="400" height="200"></canvas>
      </div>

      <div className="rounded-t mb-0 px-4 py-3 border-0 bg-pink-600 mt-6">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-2xl text-white">
              Historique des Transformations Service
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Sort for Transformations */}
      <div className="flex flex-wrap gap-3 px-6 py-3 items-center">
        <input
          className="border rounded px-3 py-2 text-sm bg-gray-700 text-white placeholder-gray-400"
          type="text"
          placeholder="Rechercher par date (ex: 14/04/2026 ou 2026-04-14)"
          value={historyDateSearch}
          onChange={(e) => { setHistoryDateSearch(e.target.value); setHistoryPage(1); }}
        />
        <button
          className="bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-500"
          onClick={() => setHistoryDateSort(historyDateSort === "asc" ? "desc" : "asc")}
        >
          Date {historyDateSort === "asc" ? "↑" : "↓"}
        </button>
      </div>

      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">Date</th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">Type</th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">Source</th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">Destination</th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">Quantité (kg)</th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransformations.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-400 py-6">
                  Aucune transformation enregistrée
                </td>
              </tr>
            ) : (
              paginatedTransformations.map((t) => (
                <tr key={t._id} className="bg-gray-800 hover:bg-gray-700">
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {new Date(t.dateTransformation).toLocaleString("fr-FR")}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4">
                    <span className="px-2 py-1 rounded text-xs font-bold bg-purple-200 text-purple-800">
                      Semi-Prêt → Final
                    </span>
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">{t.sourceNom}</td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">{t.destinationNom}</td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white font-bold">{t.quantiteKg}</td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4">
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteTransformation(t._id)}
                      title="Supprimer"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {historyTotalPages > 1 && (
        <div className="px-4 py-3">
          <nav>
            <ul className="flex justify-center space-x-2">
              {Array.from({ length: historyTotalPages }, (_, index) => (
                <li key={index + 1}>
                  <button
                    onClick={() => setHistoryPage(index + 1)}
                    className={`px-4 py-2 rounded ${
                      historyPage === index + 1
                        ? "bg-pink-500 text-white"
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
  );
}
