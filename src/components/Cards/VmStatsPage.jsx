import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function StatsPage() {
  const { vmid } = useParams();
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/proxmox/get-vm-stats/pve/${vmid}`)
      .then((res) => {
        const data = res.data.data;

        // Transforme les données en un tableau de stats affichables
        setStats([
          {
            name: "Utilisation",
            cpu: data.cpu * 100, // CPU usage en %
            memory: (data.mem / data.maxmem) * 100, // RAM usage en %
            netin: data.netin / 1000000, // Réseau entrant en MB
            netout: data.netout / 1000000 // Réseau sortant en MB
          }
        ]);
      })
      .catch((err) => {
        console.error("Erreur Axios:", err);
        setError(
          err.response?.data?.error || "Erreur lors de la récupération des statistiques."
        );
      });
  }, [vmid]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Statistiques VM {vmid}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {stats.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU (%)" />
            <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="RAM (%)" />
            <Line type="monotone" dataKey="netin" stroke="#ffc658" name="Réseau Entrant (MB)" />
            <Line type="monotone" dataKey="netout" stroke="#ff7300" name="Réseau Sortant (MB)" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Chargement des statistiques...</p>
      )}
    </div>
  );
}
