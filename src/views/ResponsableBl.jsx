import { useEffect, useState } from "react";
import Navbar from "../components/Navbars/AuthNavbar";
import Footer from "../components/Footers/Footer";
import { MdClose } from "react-icons/md";
import QrScanner from "react-qr-scanner";
import axios from "axios";
import { useSelector } from "react-redux";
import AllBls from "./AllBls";
import { useNavigate } from "react-router-dom";

function ResponsableBl() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [error, setError] = useState(null);
  const [blData, setBlData] = useState(null);
  const [etatDepot, setEtatDepot] = useState("");
  const [isReclamationFormOpen, setIsReclamationFormOpen] = useState(false);
  const [reclamationImage, setReclamationImage] = useState(null);
  const [reclamationType, setReclamationType] = useState("");
  const user = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "admin") navigate("/admin/dashboard");
    if (user && user.role === "user") navigate("/user/bl");
    if (!user) navigate("/auth/login");
  }, [user, navigate]);

  const openModal = () => {
    setIsModalOpen(true);
    setIsScannerActive(true);
    setError(null);
    setScanResult(null);
    setBlData(null);
    setEtatDepot("");
    setIsReclamationFormOpen(false); // Ensure reclamation form is closed initially
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsScannerActive(false);
  };

  const handleScan = (data) => {
    if (data) {
      const rawText = typeof data === "string" ? data : data?.text;
      const parsedData = parseScanData(rawText);
      if (parsedData) {
        setScanResult(parsedData);
        setIsScannerActive(false);
        checkIfBlExists(parsedData);
      } else {
        setError("Données QR invalides. Veuillez scanner un QR code valide.");
      }
    }
  };

  const handleError = (err) => {
    console.error("Erreur lors du scan du QR code: ", err);
    setError("Erreur lors de la scan du QR code. Veuillez réessayer.");
  };

  const parseScanData = (data) => {
    try {
      const parsedData = {};
      const refMatch = data.match(/refBL\s*:\s*([^\s]+)/i); // Adjusted regex for refBL
      const clientCodeMatch = data.match(/codeClient\s*:\s*([^\s]+)/i); // Adjusted regex for codeClient

      if (refMatch) parsedData.Referance = refMatch[1];
      if (clientCodeMatch) parsedData.codeClient = clientCodeMatch[1];

      // Matching articles in the format: PTEVD2 1,62KG 4
      const articlesSection = data.match(
        /([A-Za-z0-9]+)\s+([0-9,.]+KG)\s+([0-9]+)/g
      );
      if (articlesSection) {
        const articles = articlesSection.map((line) => {
          const parts = line.trim().split(/\s+/);
          return {
            referance: parts[0],
            poids: parts[1],
            nombre: parseInt(parts[2], 10),
          };
        });
        parsedData.articles = articles;
      }

      return parsedData.Referance &&
        parsedData.codeClient &&
        parsedData.articles
        ? parsedData
        : null;
    } catch (err) {
      console.error("Erreur lors de l'analyse des données du scan: ", err);
      return null;
    }
  };

  const checkIfBlExists = async (parsedData) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/bl/ref/${parsedData.Referance}`
      );
      setBlData(response.data || null);
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'existence du BL:",
        error
      );
    }
  };

  const handleConfirm = async () => {
    if (!etatDepot) {
      alert("Veuillez sélectionner un 'État' pour le dépôt.");
      return;
    }

    const updatedData = {
      etatDepot,
      dateDepot: new Date(),
      $addToSet: { users: user._id },
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/bl/${blData.ref}`,
        updatedData
      );
      setBlData(response.data);
      alert("État du dépôt mis à jour avec succès!");
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du BL:", error);
    }
  };

  const handleImageUploadReclamation = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReclamationImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setReclamationImage(null);
    }
  };

  const formatScanData = (data) => (
    <div>
      <p>
        <strong>Référence:</strong> {data.Referance}
      </p>
      <p>
        <strong>Code Client:</strong> {data.codeClient}
      </p>
      <p>
        <strong>Articles:</strong>
      </p>
      <ul>
        {data.articles.map((article, index) => (
          <li key={index}>
            <strong>Référence:</strong> {article.referance}{" "}
            <strong>Poids:</strong> {article.poids} <strong>Nombre:</strong>{" "}
            {article.nombre}
          </li>
        ))}
      </ul>

      <label className="block mt-4">État du Dépôt:</label>
      <select
        value={etatDepot}
        onChange={(e) => setEtatDepot(e.target.value)}
        className="border p-2 mt-2 bg-gray-700 text-white"
      >
        <option value="" disabled>
          Sélectionner l&apos;état
        </option>
        <option value="Bon">Bon</option>
        <option value="Mal">Mal</option>
      </select>

      <button
        className="bg-blue-800 text-white py-2 px-4 rounded mt-4"
        onClick={handleConfirm}
      >
        Valider
      </button>
    </div>
  );

  const handleReclamationSubmit = async (e) => {
    e.preventDefault();

    const reclamationData = {
      type: reclamationType || null,
      refArticle: e.target.refArticle.value || null,
      poid: e.target.poid ? e.target.poid.value || null : null,
      nombre: e.target.nombre ? e.target.nombre.value || null : null,
      etat: e.target.etat ? e.target.etat.value || null : null,
      justification: reclamationImage || null,
      blId: blData?._id || null,
      userId: user._id || null,
      depottraite: e.target.depottraite ? e.target.depottraite.value || "Non" : "Non", // Ajout de depottraite
      usinetraite: e.target.usinetraite ? e.target.usinetraite.value || "Non" : "Non"  // Ajout de usinetraite
    };
    

    try {
      await axios.post("http://localhost:3000/reclamation", reclamationData);
      alert("Réclamation soumise avec succès!");
      closeModal();
    } catch (error) {
      console.error("Erreur lors de la soumission de la réclamation:", error);
    }
  };

  const renderReclamationForm = () => (
    <form className="text-white" onSubmit={handleReclamationSubmit}>
      <label className="block">Type:</label>
      <select
        name="type"
        required
        className="border p-2 mt-2 w-full bg-gray-700 text-white"
        value={reclamationType}
        onChange={(e) => setReclamationType(e.target.value)}
      >
        <option value="" disabled>
          Sélectionner le type
        </option>
        <option value="Etat">État</option>
        <option value="Quantite">Quantité</option>
      </select>
      <label className="block mt-4">Référence Article:</label>
      <input
        type="text"
        name="refArticle"
        required
        className="border p-2 mt-2 w-full bg-gray-700 text-white"
      />
      {reclamationType === "Etat" && (
        <>
          <label className="block mt-4">État:</label>
          <input
            type="text"
            name="etat"
            required
            className="border p-2 mt-2 w-full bg-gray-700 text-white"
          />

          <label className="block mt-4">Justification (Image):</label>
          <input
            type="file"
            required
            onChange={handleImageUploadReclamation}
            className="mt-2 w-full bg-gray-700 text-white border p-2"
          />
        </>
      )}

      {reclamationType === "Quantite" && (
        <>
          <label className="block mt-4">POID:</label>
          <input
            type="text"
            name="poid"
            required
            className="border p-2 mt-2 w-full bg-gray-700 text-white"
          />

          <label className="block mt-4">Nombre:</label>
          <input
            type="number"
            name="nombre"
            required
            className="border p-2 mt-2 w-full bg-gray-700 text-white"
          />

          <label className="block mt-4">Justification (Image):</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={handleImageUploadReclamation}
            className="mt-2 w-full bg-gray-700 text-white border p-2"
          />
        </>
      )}

      <button
        type="submit"
        className="bg-red-800 text-white py-2 px-4 rounded mt-4"
      >
        Soumettre
      </button>
    </form>
  );

  return (
    <>
      <Navbar />
      
      <div className="relative pt-16 pb-32 flex content-start items-start justify-center min-h-screen">
        <div className="relative z-10 w-full max-w-3xl p-6">
          <div className="flex justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-500">
              Mes vms
            </h1>
            <button
              className="bg-blue-800 text-white py-2 px-4 rounded"
              onClick={openModal}
            >
              CodeQR
            </button>
          </div>

          <AllBls />

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center z-20 bg-black bg-opacity-50 text-white">
              <div className="bg-gray-800 p-6 rounded-lg w-11/12 sm:w-1/2 md:w-1/3 relative">
                <button
                  onClick={closeModal}
                  className="absolute top-2 right-2 text-gray-500 text-xl"
                >
                  <MdClose />
                </button>
                <h2 className="text-xl font-bold mb-4 text-white">
                  {isReclamationFormOpen
                    ? "Formulaire de Réclamation"
                    : "Modifier Bon Livraison"}
                </h2>
                <div className="mt-4">
                  {isReclamationFormOpen ? (
                    renderReclamationForm()
                  ) : isScannerActive ? (
                    <QrScanner
                      delay={300}
                      style={{ width: "100%" }}
                      facingMode="environment"
                      onError={handleError}
                      onScan={handleScan}
                    />
                  ) : (
                    formatScanData(scanResult)
                  )}
                  {error && <p className="text-red-500">{error}</p>}
                </div>
                {!isReclamationFormOpen && scanResult && (
                  <button
                    className="bg-red-800 text-white py-2 px-4 rounded mt-4"
                    onClick={() => setIsReclamationFormOpen(true)}
                  >
                    Réclamation
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ResponsableBl;
