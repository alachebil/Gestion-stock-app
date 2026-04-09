import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaChartLine, FaServer } from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function VmTable() {
  const [vms, setVms] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [selectedVmId, setSelectedVmId] = useState(null);
  const [vmStats, setVmStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  // État pour stocker le nœud actuellement sélectionné
  const [selectedNode, setSelectedNode] = useState("pve");
  // Liste des nœuds disponibles
  const [availableNodes, setAvailableNodes] = useState(["pve", "pve2"]);
  const [newVmData, setNewVmData] = useState({
    node: "pve",
    vmid: "100",
    name: "",
    memory: "2048",
    cores: "1",
    storage: "local-lvm",
  });
  
  // Données formatées pour les graphiques
  const [chartData, setChartData] = useState({
    cpu: [],
    memory: [],
    network: []
  });
  const [updateInterval, setUpdateInterval] = useState(null);
  
  // Fonction pour charger les VMs du nœud sélectionné
  const loadVmsFromNode = (node) => {
    axios
      .get(`http://localhost:3000/proxmox/get-vms/${node}`)
      .then((response) => setVms(response.data.data))
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.error
            : "Erreur lors de la récupération des VMs"
        )
      );
  };

  useEffect(() => {
    // Charger les VMs du nœud sélectionné chaque fois que le nœud change
    loadVmsFromNode(selectedNode);
    
    // Mettre à jour le nœud dans les données de la nouvelle VM
    setNewVmData(prevData => ({
      ...prevData,
      node: selectedNode
    }));
    
    // Nettoyer l'interval lorsque le composant est démonté
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [selectedNode]); // Dépendance à selectedNode

  // Fonction pour gérer le changement de nœud
  const handleNodeChange = (e) => {
    const newNode = e.target.value;
    setSelectedNode(newNode);
    // Réinitialiser la pagination lors du changement de nœud
    setCurrentPage(1);
  };

  const deleteVM = (vmid) => {
    axios
      .delete(`http://localhost:3000/proxmox/delete-vm/${selectedNode}/${vmid}`)
      .then(() => {
        setVms(vms.filter((vm) => vm.vmid !== vmid));
      })
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.error
            : "Erreur lors de la suppression de la VM"
        )
      );
  };

  const updateStats = (vmid) => {
    if (!vmid) return;
    
    axios
      .get(`http://localhost:3000/proxmox/get-vm-stats/${selectedNode}/${vmid}`)
      .then((response) => {
        const data = response.data.data;
        setVmStats(data);
        
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        // Calculer les nouvelles valeurs
        const cpuValue = data.cpu * 100; // Convertir en pourcentage
        const memTotal = data.maxmem;
        const memUsed = memTotal - data.freemem;
        const memPercentage = (memUsed / memTotal) * 100;
        const netIn = data.netin / 1024 / 1024; // Convertir en MB
        const netOut = data.netout / 1024 / 1024; // Convertir en MB
        
        // Mettre à jour les données pour les graphiques
        setChartData(prevData => {
          // Gérer les données CPU
          const newCpuData = [...prevData.cpu];
          if (newCpuData.length >= 10) newCpuData.shift();
          newCpuData.push({ time: timeString, value: cpuValue });
          
          // Gérer les données mémoire
          const newMemData = [...prevData.memory];
          if (newMemData.length >= 10) newMemData.shift();
          newMemData.push({ time: timeString, value: memPercentage });
          
          // Gérer les données réseau
          const newNetData = [...prevData.network];
          if (newNetData.length >= 10) newNetData.shift();
          newNetData.push({ time: timeString, in: netIn, out: netOut });
          
          return {
            cpu: newCpuData,
            memory: newMemData,
            network: newNetData
          };
        });
      })
      .catch((err) => {
        console.error("Erreur lors de la mise à jour des statistiques:", err);
      });
  };

  const fetchVmStats = (vmid) => {
    setStatsLoading(true);
    setSelectedVmId(vmid);
    
    axios
      .get(`http://localhost:3000/proxmox/get-vm-stats/${selectedNode}/${vmid}`)
      .then((response) => {
        setVmStats(response.data.data);
        
        // Génération de données simulées pour les graphiques basées sur les statistiques reçues
        const now = new Date();
        const timeData = Array.from({ length: 10 }, (_, i) => {
          const time = new Date(now);
          time.setSeconds(now.getSeconds() - (9 - i));
          return time.toLocaleTimeString();
        });
        
        // CPU data avec variation aléatoire autour de la valeur actuelle
        const cpuValue = response.data.data.cpu * 100; // Convertir en pourcentage
        const cpuData = timeData.map((time, index) => ({
          time,
          value: Math.max(0, Math.min(100, cpuValue * (0.7 + (index / 10) + Math.random() * 0.6)))
        }));
        
        // Memory data avec simulation de données historiques
        const memTotal = response.data.data.maxmem;
        const memUsed = memTotal - response.data.data.freemem;
        const memPercentage = (memUsed / memTotal) * 100;
        const memData = timeData.map((time, index) => ({
          time,
          value: Math.max(0, Math.min(100, memPercentage * (0.8 + (index / 10) + Math.random() * 0.4)))
        }));
        
        // Network data
        const netIn = response.data.data.netin;
        const netOut = response.data.data.netout;
        const netData = timeData.map((time, index) => ({
          time,
          in: netIn / 1024 / 1024 * (0.6 + (index / 10) + Math.random() * 0.8),
          out: netOut / 1024 / 1024 * (0.7 + (index / 10) + Math.random() * 0.6)
        }));
        
        setChartData({
          cpu: cpuData,
          memory: memData,
          network: netData
        });
        
        setIsStatsModalOpen(true);
        setStatsLoading(false);
        
        // Configurer l'intervalle de mise à jour automatique
        if (updateInterval) {
          clearInterval(updateInterval);
        }
        
        const interval = setInterval(() => {
          updateStats(vmid);
        }, 1000); // Mise à jour chaque seconde
        
        setUpdateInterval(interval);
      })
      .catch((err) => {
        setStatsLoading(false);
        setError(
          err.response
            ? err.response.data.error
            : "Erreur lors de la récupération des statistiques de la VM"
        );
      });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVms = vms.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(vms.length / itemsPerPage);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const closeStatsModal = () => {
    setIsStatsModalOpen(false);
    // Nettoyer l'intervalle quand le modal est fermé
    if (updateInterval) {
      clearInterval(updateInterval);
      setUpdateInterval(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVmData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCreateVM = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:3000/proxmox/create-vm", newVmData)
      .then((response) => {
        window.location.reload();
        setVms([...vms, response.data]);
        closeModal();
      })
      .catch((err) =>
        setError(
          err.response
            ? err.response.data.error
            : "Erreur lors de la création de la VM"
        )
      );
  };

  // Fonction pour ajouter dynamiquement un nouveau nœud
  const addNewNode = () => {
    const newNode = prompt("Entrez le nom du nouveau nœud:");
    if (newNode && !availableNodes.includes(newNode)) {
      setAvailableNodes([...availableNodes, newNode]);
    }
  };

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-gray-800">
        <div className="rounded-t mb-0 px-4 py-3 border-0 bg-blue-600">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full px-4 max-w-full flex-grow flex-1">
              <h3 className="font-semibold text-2xl text-white">Liste des VMs</h3>
            </div>
          </div>
        </div>
        
        {/* Sélection du nœud */}
        <div className="p-4 bg-gray-700 flex items-center space-x-4">
          <div className="flex items-center">
            <FaServer className="text-white mr-2" />
            <label htmlFor="nodeSelect" className="text-white font-medium">Nœud Proxmox:</label>
          </div>
          <div className="flex-1">
            <select
              id="nodeSelect"
              className="bg-gray-800 text-white p-2 rounded border border-gray-600 w-full md:w-48"
              value={selectedNode}
              onChange={handleNodeChange}
            >
              {availableNodes.map((node) => (
                <option key={node} value={node}>{node}</option>
              ))}
            </select>
          </div>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
            onClick={addNewNode}
          >
            + Ajouter
          </button>
        </div>
        
        <div className="block w-full overflow-x-auto">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  VMID
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Nom
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Mémoire
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  cpu
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-lg font-semibold text-left bg-gray-700 text-white border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentVms.length > 0 ? (
                currentVms.map((vm) => (
                  <tr key={vm.vmid} className="bg-gray-800 hover:bg-gray-700">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                      {vm.vmid}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                      <span className="ml-3 font-bold">{vm.name}</span>
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                      {vm.maxmem.toString().slice(0, 4)}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                      {vm.cpus}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-white">
                      {vm.status}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-sm p-4 text-left">
                      <div className="flex space-x-4">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => fetchVmStats(vm.vmid)}
                          disabled={statsLoading}
                        >
                          <FaChartLine className="inline mr-2" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteVM(vm.vmid)}
                        >
                          <FaTrashAlt className="inline mr-2" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-gray-800">
                  <td colSpan="6" className="text-center py-4 text-white">
                    Aucune VM trouvée sur ce nœud
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {vms.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-l"
              onClick={() => currentPage > 1 && paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-600 text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded-r"
              onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
        
        {/* Button to open the modal */}
        <div className="flex justify-center mt-4 mb-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={openModal}
          >
            Créer une VM
          </button>
        </div>
      </div>

      {/* Modal for creating a VM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Créer une nouvelle VM</h3>
            <form onSubmit={handleCreateVM}>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">Nœud</label>
                <select
                  name="node"
                  value={newVmData.node}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  {availableNodes.map((node) => (
                    <option key={node} value={node}>{node}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">VMID</label>
                <input
                  type="number"
                  name="vmid"
                  value={newVmData.vmid}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={newVmData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">Mémoire (MB)</label>
                <input
                  type="number"
                  name="memory"
                  value={newVmData.memory}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">cpus</label>
                <input
                  type="number"
                  name="cores"
                  value={newVmData.cores}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold">Stockage</label>
                <input
                  type="text"
                  name="storage"
                  value={newVmData.storage}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for VM Stats */}
      {isStatsModalOpen && vmStats && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-70 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-4/5 max-h-screen my-8 text-white overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-800 pt-2 pb-4 border-b border-gray-600">
              <h3 className="text-2xl font-semibold">
                Statistiques de la VM: {vmStats.name} (ID: {vmStats.vmid}) sur {selectedNode}
              </h3>
              <button
                onClick={closeStatsModal}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full w-8 h-8 flex items-center justify-center"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU Usage Graph */}
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="text-xl mb-4">Utilisation CPU ({(vmStats.cpu * 100).toFixed(2)}%)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.cpu}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="CPU (%)" 
                        stroke="#8884d8" 
                        strokeWidth={2} 
                        dot={{ r: 2 }} 
                        animationDuration={300}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Memory Usage Graph */}
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="text-xl mb-4">
                  Utilisation Mémoire ({((vmStats.maxmem - vmStats.freemem) / vmStats.maxmem * 100).toFixed(2)}%)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.memory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        name="Mémoire (%)" 
                        stroke="#82ca9d" 
                        strokeWidth={2} 
                        dot={{ r: 2 }} 
                        animationDuration={300}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Network Traffic Graph */}
              <div className="bg-gray-700 p-4 rounded md:col-span-2">
                <h4 className="text-xl mb-4">Trafic Réseau</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.network}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '4px' }} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="in" 
                        name="Entrée (MB)" 
                        stroke="#8884d8" 
                        strokeWidth={2} 
                        dot={{ r: 2 }} 
                        animationDuration={300}
                        isAnimationActive={true}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="out" 
                        name="Sortie (MB)" 
                        stroke="#82ca9d" 
                        strokeWidth={2} 
                        dot={{ r: 2 }} 
                        animationDuration={300}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* VM Details */}
            <div className="mt-6 bg-gray-700 p-4 rounded">
              <h4 className="text-xl mb-4">Détails supplémentaires</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="font-bold">Status</p>
                  <p>{vmStats.status}</p>
                </div>
                <div>
                  <p className="font-bold">Uptime</p>
                  <p>{Math.floor(vmStats.uptime / 3600)}h {Math.floor((vmStats.uptime % 3600) / 60)}m</p>
                </div>
                <div>
                  <p className="font-bold">Lecture disque</p>
                  <p>{(vmStats.diskread / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div>
                  <p className="font-bold">Écriture disque</p>
                  <p>{(vmStats.diskwrite / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
            
            {/* Bouton Fermer en bas */}
            <div className="flex justify-center mt-8 mb-4">
              <button
                onClick={closeStatsModal}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium transition-colors duration-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}