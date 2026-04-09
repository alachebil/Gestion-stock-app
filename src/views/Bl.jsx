import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AuthNavbar from "../components/Navbars/AuthNavbar";
import Footer from "../components/Footers/Footer";

function Bl() {
  const { id } = useParams(); // Get the BL ID from the URL
  const [bl, setBl] = useState(null);
  const [reclamations, setReclamations] = useState([]); // State to store reclamations
  const [livraisons, setLivraisons] = useState([]); // State to store livraisons
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null); // State to handle modal image

  useEffect(() => {
    const fetchBlDetails = async () => {
      try {
        // Fetch BL data
        const response = await axios.get(`http://localhost:3000/bl/${id}`);
        setBl(response.data); // Set BL data
        // Fetch reclamations related to the BL
        const reclamationResponse = await axios.get(
          `http://localhost:3000/bl/${id}/reclamations`
        );
        setReclamations(reclamationResponse.data); // Set reclamations data

        // Fetch livraisons related to the BL
        const livraisonResponse = await axios.get(
          `http://localhost:3000/bl/${id}/livraisons`
        );
        setLivraisons(livraisonResponse.data); // Set livraisons data
      } catch (error) {
        console.error(
          "Erreur lors de la récupération du BL, des réclamations ou des livraisons:",
          error
        );
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    fetchBlDetails(); // Call the function when the component loads
  }, [id]);

  // Function to open the modal with the selected image
  const openModal = (image) => {
    setModalImage(image);
  };

  // Function to close the modal
  const closeModal = () => {
    setModalImage(null);
  };

  if (loading) {
    return <div>Chargement...</div>; // Show loading spinner while fetching data
  }

  if (!bl) {
    return <div>BL introuvable</div>; // Show error message if no BL is found
  }

  return (
    <>
      <AuthNavbar />
      <div className="relative w-full h-20 bg-gray-800" />
      <div className="relative pt-16 pb-32 flex content-start items-start justify-center min-h-screen">
        <div className="relative z-10 w-full max-w-3xl p-6">
          <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg">
            <h1 className="text-2xl font-semibold mb-6">Détails du BL</h1>
            <p>
              <strong>Référence:</strong> {bl.ref}
            </p>
            <p>
              <strong>Code Client:</strong> {bl.codeClient || "N/A"}
            </p>
            <p>
              <strong>État Chauffeur:</strong> {bl.etatChauffeur || "N/A"}
            </p>
            <p>
              <strong>Date Chauffeur:</strong>{" "}
              {bl.dateChauffeur
                ? new Date(bl.dateChauffeur).toLocaleString("fr-FR")
                : "N/A"}
            </p>
            <p>
              <strong>État Dépôt:</strong> {bl.etatDepot || "N/A"}
            </p>
            <p>
              <strong>Date Dépôt:</strong>{" "}
              {bl.dateDepot
                ? new Date(bl.dateDepot).toLocaleString("fr-FR")
                : "N/A"}
            </p>
            <p>
              <strong>État Livreur:</strong> {bl.etatLivreur || "N/A"}
            </p>
            <p>
              <strong>Date Livreur:</strong>{" "}
              {bl.dateLivreur
                ? new Date(bl.dateLivreur).toLocaleString("fr-FR")
                : "N/A"}
            </p>

            {/* Articles Table */}
            <h2 className="text-xl font-semibold mt-6 mb-4">Articles</h2>
            {bl.articleScan && bl.articleScan.length > 0 ? (
              <table className="w-full text-left border-collapse border border-gray-700">
                <thead>
                  <tr>
                    <th className="border border-gray-600 p-2">Référence</th>
                    <th className="border border-gray-600 p-2">Poids</th>
                    <th className="border border-gray-600 p-2">Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  {bl.articleScan.map((article, index) => (
                    <tr key={index}>
                      <td className="border border-gray-600 p-2">
                        {article.referance || "N/A"}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {article.poids || "N/A"}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {article.nombre || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun article disponible.</p>
            )}

            {/* Reclamations */}
            <h2 className="text-xl font-semibold mt-6 mb-4">Réclamations</h2>
            {reclamations.length > 0 ? (
              <div>
                {reclamations.map((reclamation, index) => (
                  <div key={index} className="mb-6">
                    <p>
                      <strong>Type:</strong> {reclamation.type || "N/A"}
                    </p>
                    <p>
                      <strong>Référence Article:</strong>{" "}
                      {reclamation.refArticle || "N/A"}
                    </p>
                    <p>
                      <strong>Poids:</strong> {reclamation.poid || "N/A"}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {reclamation.nombre || "N/A"}
                    </p>
                    <p>
                      <strong>État:</strong> {reclamation.etat || "N/A"}
                    </p>
                    <p>
                      <strong>Justification:</strong>
                      <img
                        src={reclamation.justification}
                        alt="Justification"
                        className="h-32 w-32 object-cover rounded cursor-pointer"
                        onClick={() => openModal(reclamation.justification)}
                      />
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune réclamation disponible.</p>
            )}

            {/* Livraisons */}
            <h2 className="text-xl font-semibold mt-6 mb-4">Livraisons</h2>
            {livraisons.length > 0 ? (
              <div>
                {livraisons.map((livraison, index) => (
                  <div key={index} className="mb-6">
                    <p>
                      <strong>Date Livraison:</strong>{" "}
                      {new Date(livraison.dateLivraisonClient).toLocaleString(
                        "fr-FR"
                      ) || "N/A"}
                    </p>
                    <p>
                      <strong>État:</strong> {livraison.etatLivraison || "N/A"}
                    </p>
                    <p>
          
                      <strong>Confirmation:</strong>
                      <img
                        src={livraison.confirmation}
                        alt="Confirmation"
                        className="h-32 w-32 object-cover rounded cursor-pointer"
                        onClick={() => openModal(livraison.confirmation)}
                      />
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Aucune livraison disponible.</p>
            )}

            {/* Modal for Enlarged Image */}
            {modalImage && (
              <div
                className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50"
                onClick={closeModal}
              >
                <div className="relative bg-white p-4 rounded-lg">
                  <button
                    className="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2"
                    onClick={closeModal}
                  >
                    X
                  </button>
                  <img
                    src={modalImage}
                    alt="Enlarged Justification"
                    className="max-h-[80vh] max-w-[80vw] object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Bl;
