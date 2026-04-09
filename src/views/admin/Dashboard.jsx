import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Chart } from "chart.js/auto";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!user) navigate("/auth/login");
    if (user && user.role !== "admin") navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    const fetchReclamations = async () => {
      try {
        const response = await axios.get("http://localhost:3000/reclamation");
        console.log(response);
        const etatCount = response.data.filter(
          (rec) => rec.type === "Etat"
        ).length;
        const quantiteCount = response.data.filter(
          (rec) => rec.type === "Quantite"
        ).length;

        renderChart(etatCount, quantiteCount);
      } catch (error) {
        console.error("Error fetching reclamations:", error);
      }
    };

    fetchReclamations();

    // Cleanup chart on component unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const renderChart = (etatCount, quantiteCount) => {
    // Destroy existing chart if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = document.getElementById("reclamationChart").getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Etat", "Quantité"],
        datasets: [
          {
            label: "Reclamations Statistics",
            data: [etatCount, quantiteCount],
            backgroundColor: ["#FF6384", "#36A2EB"],
            borderColor: ["#FF6384", "#36A2EB"],
            borderWidth: 1,
          },
        ],
      },
    });
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-36 shadow-lg rounded bg-gray-800">
      <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full px-4 max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-2xl text-white">Statistique</h3>
          </div>
        </div>
      </div>
      <div className="flex justify-center w-full overflow-x-auto">
        <canvas id="reclamationChart" width="50" height="50"></canvas>
      </div>
    </div>
  );
}
