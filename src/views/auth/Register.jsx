import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    number: "",
    image: "",
  });
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      navigate("/admin/dashboard");
    }
    if (currentUser && currentUser.role === "user") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { name, lastName, email, password, number, image } = formData;
    const userData = {
      name,
      lastName,
      email,
      password,
      phone: number,
      image,
    };

    try {
      await axios.post("http://localhost:3000/users/register", userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      navigate("/auth/login");
    } catch (error) {
      console.error(
        "Erreur lors de l'inscription :",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-4/12 px-4"> {/* Réduction de la largeur */}
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border border-blue-300">
            {/* Arrière-plan gris supprimé, bordure bleu ciel ajoutée */}
            <div className="rounded-t mb-0 px-6 py-6">
              <div className="text-center mb-3">
                <h6 className="block uppercase text-white text-xs font-bold mb-2">Inscription</h6>
              </div>
              <hr className="mt-6 border-b-1 border-blueGray-300" />
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form onSubmit={handleSubmit}>
                <div className="relative w-full mb-3">
                  <label className="block uppercase text-white text-xs font-bold mb-2" htmlFor="name">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="border px-3 py-3 placeholder-blueGray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Prénom"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative w-full mb-3">
                  <label className="block uppercase text-white text-xs font-bold mb-2" htmlFor="lastName">
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="border px-3 py-3 placeholder-blueGray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Nom de famille"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative w-full mb-3">
                  <label className="block uppercase text-white text-xs font-bold mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="border px-3 py-3 placeholder-blueGray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative w-full mb-3">
                  <label className="block uppercase text-white text-xs font-bold mb-2" htmlFor="password">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="border px-3 py-3 placeholder-blueGray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative w-full mb-3">
                  <label className="block uppercase text-white text-xs font-bold mb-2" htmlFor="number">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    className="border px-3 py-3 placeholder-blueGray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    placeholder="Numéro de téléphone"
                    value={formData.number}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative w-full mb-3">
                  <label className="block uppercase text-white text-xs font-bold mb-2" htmlFor="image">
                    Photo de profil
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="border px-3 py-3 placeholder-blueGray-300 text-gray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  />
                </div>

                <div className="text-center mt-6">
                  <button
                    className="bg-blue-500 text-white text-sm font-bold uppercase px-6 py-3 rounded shadow hover:bg-blue-400 focus:outline-none w-full ease-linear transition-all duration-150"
                    type="submit"
                  >
                    Créer un compte
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="flex flex-wrap mt-6 relative">
            <div className="w-full text-center">
              <Link className="text-blue-500" to="/auth/login">
                Connectez-vous
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
