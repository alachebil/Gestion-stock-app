import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AllBls() {
  const [bls, setBls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [clientArticles, setClientArticles] = useState([]); // State for articles of clients during the last 4 weeks
  const [sortedClientArticlesByFrequency, setSortedClientArticlesByFrequency] = useState([]); // State for articles sorted by frequency
  const itemsPerPage = 6; // Maximum number of items per page
  const [mostFaithfulClient, setMostFaithfulClient] = useState(null); // State to store the most faithful client
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBls = async () => {
      try {
        const response = await axios.get("http://localhost:3000/bl");
        setBls(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des BLs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBls();
  }, []);

  // Filter BLs based on search query
  const filteredBls = bls.filter((bl) =>
    bl.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate the total number of pages
  const totalPages = Math.ceil(filteredBls.length / itemsPerPage);

  // Get the current page's data
  const currentBls = filteredBls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //////////////////
  const fetchClientArticles = () => {
    const currentDate = new Date();
    const fourWeeksAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    // Filtrer les BLs des 4 dernières semaines
    const recentBls = filteredBls.filter((bl) => {
      const blDate = new Date(bl.dateChauffeur);
      return blDate >= fourWeeksAgo;
    });

    // Groupement des articles par client et calcul des poids/nombre
    const clientArticleData = {};

    recentBls.forEach((bl) => {
      const clientCode = bl.codeClient; // Code client
      const articles = bl.articleScan; // Liste des articles
      articles.forEach((article) => {
        const articleRef = article.referance; // Référence de l'article

        // Extraction et conversion du poids
        const rawWeight = article.poids.replace("KG", "").trim(); // Retirer "KG"
        const articleWeight = parseFloat(rawWeight); // Conversion en nombre

        const articleCount = parseInt(article.nombre); // Nombre d'appels de l'article

        if (!clientArticleData[clientCode]) {
          clientArticleData[clientCode] = {};
        }

        if (clientArticleData[clientCode][articleRef]) {
          clientArticleData[clientCode][articleRef].totalWeight += articleWeight;
          clientArticleData[clientCode][articleRef].totalCount += articleCount;
        } else {
          clientArticleData[clientCode][articleRef] = {
            totalWeight: articleWeight,
            totalCount: articleCount,
          };
        }
      });
    });

    // Préparer les résultats pour l'affichage
    const result = Object.keys(clientArticleData).map((clientCode) => {
      const articles = clientArticleData[clientCode];
      const sortedArticles = Object.entries(articles)
        .sort(([, dataA], [, dataB]) => dataB.totalWeight - dataA.totalWeight) // Trier par poids total
        .map(([articleRef, data]) => ({
          articleRef,
          weight: data.totalWeight.toFixed(3), // Conserver exactement 3 chiffres après la virgule
          count: data.totalCount, // Nombre total d'appels
        }));

      return {
        clientCode,
        articles: sortedArticles,
      };
    });

    setClientArticles(result);
  };

  // Function to fetch and sort articles by frequency (number of occurrences) for each client
  const fetchClientArticlesByFrequency = () => {
    const clientArticleFrequency = {};

    filteredBls.forEach((bl) => {
      const clientCode = bl.codeClient;
      const articles = bl.articleScan;
      articles.forEach((article) => {
        const articleRef = article.referance;

        if (!clientArticleFrequency[clientCode]) {
          clientArticleFrequency[clientCode] = {};
        }

        if (!clientArticleFrequency[clientCode][articleRef]) {
          clientArticleFrequency[clientCode][articleRef] = 0;
        }

        clientArticleFrequency[clientCode][articleRef]++;
      });
    });

    // Sort articles by frequency for each client
    const sortedArticlesByFrequency = Object.keys(clientArticleFrequency).map((clientCode) => {
      const articles = clientArticleFrequency[clientCode];
      const sortedArticles = Object.entries(articles)
        .sort(([, countA], [, countB]) => countB - countA) // Sort by frequency (count)
        .map(([articleRef, count]) => ({
          articleRef,
          frequency: count,
        }));

      return {
        clientCode,
        articles: sortedArticles,
      };
    });

    setSortedClientArticlesByFrequency(sortedArticlesByFrequency);
  };

  // Function to find the most faithful client based on the frequency of articles
  const findMostFaithfulClient = () => {
    const clientFrequency = {};

    // Count the frequency of each client
    filteredBls.forEach((bl) => {
      const clientCode = bl.codeClient;
      if (!clientFrequency[clientCode]) {
        clientFrequency[clientCode] = 0;
      }
      clientFrequency[clientCode]++;
    });

    // Find the client with the maximum frequency
    const mostFaithfulClient = Object.entries(clientFrequency).reduce(
      (max, [clientCode, count]) => (count > max.count ? { clientCode, count } : max),
      { clientCode: null, count: 0 }
    );

    setMostFaithfulClient(mostFaithfulClient);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        {/* Search input field */}
        <input
          type="text"
          placeholder="Rechercher par référence..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update the search query
          className="p-2 rounded-lg w-full border border-gray-300"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentBls.length === 0 ? (
          <div className="bg-gray-700 p-8 rounded-lg text-white">
            <h2 className="text-xl font-semibold">Aucun BL existant</h2>
          </div>
        ) : (
          currentBls.map((bl) => (
            <div
              key={bl._id}
              className="bg-gray-800 text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700"
              onClick={() => navigate(`/bl/${bl._id}`)}
            >
              <h2 className="text-2xl font-semibold text-center">
                Référence: {bl.ref}
              </h2>
            </div>
          ))
        )}
      </div>

{/* Pagination Controls */}
<div className="flex justify-center mt-6 space-x-4">
  <button
    onClick={() => setCurrentPage(currentPage - 1)}
    disabled={currentPage === 1}
    className="bg-gray-800 p-3 rounded-lg text-white w-full max-w-xs"
  >
    Précédent
  </button>
  <span className="bg-gray-800 p-3 rounded-lg text-white w-full max-w-xs text-center">
    {currentPage} / {totalPages}
  </span>
  <button
    onClick={() => setCurrentPage(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="bg-gray-800 p-3 rounded-lg text-white w-full max-w-xs"
  >
    Suivant
  </button>
</div>



      {/* Button to find and display the most faithful client */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={findMostFaithfulClient}
          className="bg-blue-800 text-white py-2 px-4 rounded w-full"
        >
          Voir le code client le plus fidèle
        </button>
      </div>

      {/* Display the most faithful client information */}
      {mostFaithfulClient && (
        <div className="mt-4 text-center font-bold text-lg">
          Le client le plus fidèle est: {mostFaithfulClient.clientCode} avec{" "}
          {mostFaithfulClient.count} BLs
        </div>
      )}

      {/* Button to fetch and display client articles for the last 4 weeks */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchClientArticles}
          className="bg-blue-800 text-white py-2 px-4 rounded w-full"
        >
          Voir les articles clients des 4 dernières semaines
        </button>
      </div>

      {/* Display client articles and references sorted by weight under this button */}
      {clientArticles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-center">
            Articles des clients triés par poids :
          </h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientArticles.map((client, index) => (
              <div key={index} className="mb-4 bg-gray-700 p-4 rounded-lg text-white">
                <h4 className="text-lg font-semibold text-center">
                  Client: {client.clientCode}
                </h4>
                <ul className="mt-2">
                  {client.articles.map((article, idx) => (
                    <li key={idx} className="text-center">
                      {article.articleRef} - {article.weight} kg
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button to fetch and display client articles sorted by frequency */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={fetchClientArticlesByFrequency}
          className="bg-blue-800 text-white py-2 px-4 rounded w-full"
        >
          Voir les articles triés par fréquence
        </button>
      </div>

      {/* Display client articles sorted by frequency under this button */}
      {sortedClientArticlesByFrequency.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-center">
            Articles des clients triés par fréquence :
          </h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedClientArticlesByFrequency.map((client, index) => (
              <div key={index} className="mb-4 bg-gray-700 p-4 rounded-lg text-white">
                <h4 className="text-lg font-semibold text-center">
                  Client: {client.clientCode}
                </h4>
                <ul className="mt-2">
                  {client.articles.map((article, idx) => (
                    <li key={idx} className="text-center">
                      {article.articleRef} - {article.frequency} fois
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}

export default AllBls;
