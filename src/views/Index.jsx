import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbars/AuthNavbar";
import Footer from "../components/Footers/Footer";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

export default function Index() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "admin") navigate("/admin/dashboard");
  }, [user, navigate]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("http://localhost:3000/stock/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching stock summary:", err);
      }
      setLoading(false);
    };
    fetchSummary();
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="relative pt-16 pb-32 flex content-center items-center justify-center min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://scontent.ftun15-1.fna.fbcdn.net/v/t39.30808-6/305449144_578398250748774_4165199772637431939_n.png?_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=1DExC8eVZiMQ7kNvwH6YsEp&_nc_oc=AdmrfuF9CwlBBXfBP67LLl-NqVcdi_I5qO9sOTi8fmv4WXvFx_Ac9-Ul4B-fI6qSj08&_nc_zt=23&_nc_ht=scontent.ftun15-1.fna&_nc_gid=rm7LfmSnO1yppZE4SN7eZg&oh=00_AfL6PFa5_FwUzxyRo7oW-N0gdYOILpsgVPI2S3kTb1bb3w&oe=6831244D')",
            }}

           
          >
            <div className="w-full h-full absolute bg-black bg-opacity-70"></div>
          </div>
          <div className="container relative mx-auto text-center">
            <div className="w-full lg:w-6/12 px-4 mx-auto">
              <h1 className="text-white font-bold text-5xl">
                société Plastique Teboulba
              </h1>
              <p className="mt-4 text-lg text-gray-300">
                Gestion de stock - MatiÃ¨re premiÃ¨re, Produit semi-prÃªt et Produit final
              </p>
            </div>
          </div>
        </div>

        {/* Stock Dashboard Section */}
        <section className="pb-20 bg-gray-100 -mt-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap">
              {loading ? (
                <p className="text-center w-full text-gray-500 py-10">Chargement du stock...</p>
              ) : summary ? (
                <>
                  <div className="w-full md:w-4/12 px-4 text-center mt-6 md:mt-0">
                    <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-lg">
                      <div className="px-4 py-5 flex-auto">
                        <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-blue-500">
                          <i className="fas fa-cubes"></i>
                        </div>
                        <h6 className="text-xl font-semibold">MatiÃ¨re PremiÃ¨re</h6>
                        {summary.matierePremieres.length === 0 ? (
                          <p className="mt-2 mb-4 text-gray-500">Aucune matiÃ¨re en stock</p>
                        ) : (
                          <div className="mt-2 mb-4">
                            {summary.matierePremieres.map((m) => (
                              <div key={m._id} className="flex justify-between text-sm py-1 px-2">
                                <span className="text-gray-600">{m._id}</span>
                                <span className="font-bold text-blue-600">{m.totalKg} kg ({m.count})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-4/12 px-4 text-center mt-6 md:mt-0">
                    <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-lg">
                      <div className="px-4 py-5 flex-auto">
                        <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-yellow-500">
                          <i className="fas fa-cogs"></i>
                        </div>
                        <h6 className="text-xl font-semibold">Produit Semi-PrÃªt</h6>
                        {summary.produitsSemiPrets.length === 0 ? (
                          <p className="mt-2 mb-4 text-gray-500">Aucun produit semi-prÃªt</p>
                        ) : (
                          <div className="mt-2 mb-4">
                            {summary.produitsSemiPrets.map((s) => (
                              <div key={s._id} className="flex justify-between text-sm py-1 px-2">
                                <span className="text-gray-600">{s._id}</span>
                                <span className="font-bold text-yellow-600">{s.totalKg} kg ({s.count})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-4/12 px-4 text-center mt-6 md:mt-0">
                    <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-lg">
                      <div className="px-4 py-5 flex-auto">
                        <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-green-500">
                          <i className="fas fa-box"></i>
                        </div>
                        <h6 className="text-xl font-semibold">Produit Final</h6>
                        {summary.produitsFinals.length === 0 ? (
                          <p className="mt-2 mb-4 text-gray-500">Aucun produit final</p>
                        ) : (
                          <div className="mt-2 mb-4">
                            {summary.produitsFinals.map((f) => (
                              <div key={f._id} className="flex justify-between text-sm py-1 px-2">
                                <span className="text-gray-600">{f._id}</span>
                                <span className="font-bold text-green-600">{f.totalKg} kg ({f.count})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center w-full text-gray-500 py-10">Erreur de chargement</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
