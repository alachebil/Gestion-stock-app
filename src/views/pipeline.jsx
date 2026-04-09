import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbars/AuthNavbar";
import Footer from "../components/Footers/Footer";
import { MdClose } from "react-icons/md";
import axios from "axios";

function PipelinePage() {
  const [pipelines, setPipelines] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [loadingStages, setLoadingStages] = useState(false);
  const [pipelineFinished, setPipelineFinished] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/pipeline/get-pipelines")
      .then((response) => setPipelines(response.data.data))
      .catch((err) =>
        setError(
          err.response?.data?.error ||
            "Erreur lors de la récupération des pipelines"
        )
      );
  }, []);

  const openModal = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPipeline(null);
    setIsModalOpen(false);
    setIsLaunching(false);
    setPipelineStages([]);
    setPipelineStatus("");
    setPipelineFinished(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const launchPipeline = async () => {
    if (!selectedPipeline) return;
    setIsLaunching(true);
    setPipelineStages([]);
    setLoadingStages(true);
    setPipelineFinished(false);
    setPipelineStatus("");

    try {
      await axios.post(
        `http://localhost:3000/pipeline/run-pipeline/${selectedPipeline.name}`
      );
      alert("✅ Pipeline lancé avec succès !");

      setTimeout(async () => {
        try {
          let buildStarted = false;
          let buildNumber;

          for (let attempt = 0; attempt < 15; attempt++) {
            const buildInfo = await axios.get(
              `http://localhost:3000/pipeline/building/${selectedPipeline.name}`
            );

            if (buildInfo.data.building) {
              buildStarted = true;
              buildNumber = buildInfo.data.number;
              break;
            }
            await new Promise((res) => setTimeout(res, 2000));
          }

          if (!buildStarted) {
            throw new Error("Le build n'a pas démarré.");
          }

          intervalRef.current = setInterval(async () => {
            const buildInfo = await axios.get(
              `http://localhost:3000/pipeline/building/${selectedPipeline.name}`
            );

            const stagesResponse = await axios.get(
              `http://localhost:3000/pipeline/stages/${selectedPipeline.name}`
            );

            const newStages = stagesResponse.data.data || [];
            setPipelineStages(newStages);

            if (!buildInfo.data.building) {
              clearInterval(intervalRef.current);

              if (buildInfo.data.result === "SUCCESS") {
                setPipelineStatus("success");
              } else {
                setPipelineStatus("failure");
              }

              setPipelineFinished(true);
            }
          }, 5000);
        } catch (e) {
          console.error("Erreur récupération des étapes", e);
          setPipelineFinished(true);
          setPipelineStatus("failure");
        } finally {
          setLoadingStages(false);
        }
      }, 5000);
    } catch (error) {
      alert("❌ Erreur lors de l'exécution du pipeline.");
      console.error(error);
      setLoadingStages(false);
      setPipelineFinished(true);
      setPipelineStatus("failure");
    } finally {
      setIsLaunching(false);
    }
  };

  const getStageColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "IN_PROGRESS":
      case "PAUSED_PENDING_INPUT":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const calculateProgress = () => {
    if (pipelineStages.length === 0) return 0;
    const completedStages = pipelineStages.filter(
      (stage) => stage.status === "SUCCESS"
    ).length;
    return Math.round((completedStages / pipelineStages.length) * 100);
  };

  return (
    <>
      <Navbar />
      <div className="relative pt-16 pb-32 flex content-start items-start justify-center min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-800">
        <div className="relative z-10 w-full max-w-6xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Mes Pipelines</h1>
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pipelines.map((pipeline) => (
              <div
                key={pipeline.name}
                onClick={() => openModal(pipeline)}
                className="bg-white hover:bg-gray-200 p-6 rounded-lg cursor-pointer shadow-2xl transform transition duration-200 hover:scale-105"
              >
                <p className="text-lg font-semibold text-gray-800">
                  {pipeline.name}
                </p>
              </div>
            ))}
          </div>

          {isModalOpen && selectedPipeline && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
              <div className="bg-white text-gray-900 p-8 rounded-2xl w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 shadow-2xl relative animate-fade-in transition-all duration-300 ease-in-out">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
                >
                  <MdClose />
                </button>
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                  Détails du Pipeline
                </h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <p>
                    <span className="font-semibold">Nom du Pipeline:</span>{" "}
                    {selectedPipeline.name}
                  </p>
                  <p>
                    <span className="font-semibold">URL:</span>{" "}
                    {selectedPipeline.url}
                  </p>
                  <p>
                    <span className="font-semibold">Dernière exécution:</span>{" "}
                    {selectedPipeline.lastExecution
                      ? new Date(
                          selectedPipeline.lastExecution
                        ).toLocaleString("fr-FR")
                      : "Jamais exécuté"}
                  </p>

                  <button
                    onClick={launchPipeline}
                    disabled={isLaunching}
                    className={`mt-4 px-4 py-2 rounded-lg text-white font-semibold transition duration-200 ${
                      isLaunching
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isLaunching
                      ? "Lancement en cours..."
                      : "Lancer ce pipeline"}
                  </button>
                  {loadingStages ? (
                    <p className="text-blue-500 mt-4">
                      Chargement des étapes du pipeline...
                    </p>
                  ) : (
                    pipelineStages.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-bold text-lg mb-2">
                          Étapes du pipeline :
                        </h3>
                        <div className="w-full bg-gray-300 rounded-full h-4 mb-4">
                          <div
                            className="bg-blue-600 h-4 rounded-full"
                            style={{ width: `${calculateProgress()}%` }}
                          ></div>
                        </div>
                        <ul className="space-y-2">
                          {pipelineStages.map((stage, index) => (
                            <li
                              key={index}
                              className={`p-3 rounded-lg ${getStageColor(
                                stage.status
                              )} text-white`}
                            >
                              <p>
                                <strong>Étape:</strong> {stage.name}
                              </p>
                              <p>
                                <strong>Statut:</strong> {stage.status}
                              </p>
                              <p>
                                <strong>Durée:</strong>{" "}
                                {(stage.durationMillis / 1000).toFixed(2)} sec
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
       {pipelineFinished && (
                    <div className="mt-6">
                      {pipelineStatus === "success" ? (
                        <div className="text-green-600 font-bold">
                          🎉 Le pipeline a été exécuté avec succès ! 🎉
                        </div>
                      ) : (
                        <div className="text-red-600 font-bold">
                          ❌ Le pipeline a échoué. Veuillez vérifier les logs pour plus de détails. ❌
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}

export default PipelinePage;
