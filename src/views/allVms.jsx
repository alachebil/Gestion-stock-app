import { useEffect, useState } from "react";
import Navbar from "../components/Navbars/AuthNavbar";
import Footer from "../components/Footers/Footer";
import { MdClose } from "react-icons/md";
import axios from "axios";

function UserVms() {
  const [vms, setVms] = useState([]);
  const [selectedVm, setSelectedVm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [clickedVmId, setClickedVmId] = useState(null);
  const [serverNode, setServerNode] = useState("pve");
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [vmsPerPage] = useState(8);

  // Liste des serveurs disponibles
  const availableServers = ["pve", "pve2"];

  const fetchVms = (node) => {
    setLoading(true);
    setError(null);
    
    axios
      .get(`http://localhost:3000/proxmox/get-vms/${node}`)
      .then((response) => {
        setVms(response.data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            `Erreur lors de la récupération des VMs sur ${node}`
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVms(serverNode);
  }, [serverNode]);

  // Gestion du changement de serveur
  const handleServerChange = (e) => {
    const newServer = e.target.value;
    setServerNode(newServer);
    setCurrentPage(1); // Réinitialiser la pagination lors du changement de serveur
  };

  // Open the VM details modal
  const openModal = (vm) => {
    setSelectedVm(vm);
    setClickedVmId(vm.vmid); // garder la surbrillance
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedVm(null);
    setIsModalOpen(false);
  };

  // Get the current VMs to display on the current page
  const indexOfLastVm = currentPage * vmsPerPage;
  const indexOfFirstVm = indexOfLastVm - vmsPerPage;
  const currentVms = vms.slice(indexOfFirstVm, indexOfLastVm);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Navbar />

      <div className="relative pt-16 pb-32 flex content-start items-start justify-center min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-800">
        <div className="relative z-10 w-full max-w-6xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Mes VMs</h1>
            
            {/* Dropdown pour sélection de serveur */}
            <div className="flex items-center">
              <label htmlFor="serverSelect" className="mr-2 text-gray-800 font-medium">
                Serveur:
              </label>
              <select
                id="serverSelect"
                value={serverNode}
                onChange={handleServerChange}
                className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableServers.map((server) => (
                  <option key={server} value={server}>
                    {server}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Grille des VMs */}
              {vms.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {currentVms.map((vm) => (
                    <div
                      key={vm.vmid}
                      onClick={() => openModal(vm)}
                      className="bg-white hover:bg-gray-200 p-6 rounded-lg cursor-pointer shadow-2xl transform transition duration-200 hover:scale-105"
                    >
                      <p
                        className={`text-lg font-semibold ${
                          clickedVmId === vm.vmid ? "text-yellow-500" : "text-gray-800"
                        }`}
                      >
                        VMID: {vm.vmid}
                      </p>
                      <p
                        className={`text-md ${
                          clickedVmId === vm.vmid ? "text-yellow-500" : "text-gray-600"
                        }`}
                      >
                        Nom: {vm.name}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-600">Aucune VM trouvée sur le serveur {serverNode}</p>
                </div>
              )}

              {/* Pagination */}
              {vms.length > vmsPerPage && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 mx-1 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2 mx-1 text-lg">
                    Page {currentPage} sur {Math.ceil(vms.length / vmsPerPage)}
                  </span>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={indexOfLastVm >= vms.length}
                    className="px-4 py-2 mx-1 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}

          {/* Modal */}
          {isModalOpen && selectedVm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white text-gray-900 p-8 rounded-2xl w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 shadow-2xl relative animate-fade-in transition-all duration-300 ease-in-out">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                >
                  <MdClose />
                </button>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">🖥️ Détails de la VM</h2>
                <div className="space-y-3">
                  <p><span className="font-semibold">🆔 VMID:</span> {selectedVm.vmid}</p>
                  <p><span className="font-semibold">📛 Nom:</span> {selectedVm.name}</p>
                  <p><span className="font-semibold">🧠 CPU:</span> {selectedVm.cpus}</p>
                  <p><span className="font-semibold">💾 Mémoire:</span> {(parseInt(selectedVm.maxmem) / 1024 / 1024).toFixed(0)} MB</p>
                  <p><span className="font-semibold">🚦 Statut:</span> {selectedVm.status}</p>
                  <p><span className="font-semibold">⏱️ Uptime:</span> {selectedVm.uptime || "N/A"} s</p>
                  <p><span className="font-semibold">📦 Template:</span> {selectedVm.template ? "Oui" : "Non"}</p>
                  <p><span className="font-semibold">🖥️ Serveur:</span> {serverNode}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Animation */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

export default UserVms;