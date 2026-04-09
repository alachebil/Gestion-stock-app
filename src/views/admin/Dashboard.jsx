import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Chart } from "chart.js/auto";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const chartRef = useRef(null);
  const [transformations, setTransformations] = useState([]);

  useEffect(() => {
    if (!user) navigate("/auth/login");
    if (user && user.role !== "admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        const response = await axios.get("http://localhost:3000/stock/summary");
        const { matierePremieres, produitsSemiPrets, produitsFinals } = response.data;

        const mpTotal = matierePremieres.reduce((sum, m) => sum + m.totalKg, 0);
        const spTotal = produitsSemiPrets.reduce((sum, s) => sum + s.totalKg, 0);
        const pfTotal = produitsFinals.reduce((sum, f) => sum + f.totalKg, 0);

        const mpCount = matierePremieres.reduce((sum, m) => sum + m.count, 0);
        const spCount = produitsSemiPrets.reduce((sum, s) => sum + s.count, 0);
        const pfCount = produitsFinals.reduce((sum, f) => sum + f.count, 0);

        renderChart(
          [mpTotal, spTotal, pfTotal],
          [mpCount, spCount, pfCount]
        );
      } catch (error) {
        console.error("Error fetching stock summary:", error);
      }
    };

    fetchStockSummary();

    const fetchTransformations = async () => {
      try {
        const response = await axios.get("http://localhost:3000/stock/transformations");
        setTransformations(response.data);
      } catch (error) {
        console.error("Error fetching transformations:", error);
      }
    };
    fetchTransformations();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const renderChart = (totals, counts) => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById("stockChart").getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Matière Première", "Produit Semi-Prêt", "Produit Final"],
        datasets: [
          {
            label: "Quantité totale (kg)",
            data: totals,
            backgroundColor: ["#3B82F6", "#F59E0B", "#10B981"],
            borderColor: ["#2563EB", "#D97706", "#059669"],
            borderWidth: 1,
          },
          {
            label: "Nombre de produits",
            data: counts,
            backgroundColor: ["#93C5FD", "#FCD34D", "#6EE7B7"],
            borderColor: ["#3B82F6", "#F59E0B", "#10B981"],
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
            text: "État du Stock",
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
      <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-2xl text-white">Statistiques du Stock</h3>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full overflow-x-auto p-4">
        <canvas id="stockChart" width="400" height="200"></canvas>
      </div>

      {/* Historique des Transformations */}
      <div className="rounded-t mb-0 px-4 py-3 border-0 bg-green-600 mt-6">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-2xl text-white">
              Historique des Transformations
            </h3>
          </div>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <table className="items-center w-full bg-transparent border-collapse">
          <thead>
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                Date
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                Type
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                Source
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                Destination
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-left bg-gray-700 text-white">
                Quantité (kg)
              </th>
            </tr>
          </thead>
          <tbody>
            {transformations.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 py-6">
                  Aucune transformation enregistrée
                </td>
              </tr>
            ) : (
              transformations.map((t) => (
                <tr key={t._id} className="bg-gray-800 hover:bg-gray-700">
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {new Date(t.dateTransformation).toLocaleString("fr-FR")}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        t.type === "MP→SemiPret"
                          ? "bg-blue-200 text-blue-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {t.type === "MP→SemiPret"
                        ? "MP → Semi-Prêt"
                        : "Semi-Prêt → Final"}
                    </span>
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {t.sourceNom}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white">
                    {t.destinationNom}
                  </td>
                  <td className="border-t-0 px-6 align-middle text-sm p-4 text-white font-bold">
                    {t.quantiteKg}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
