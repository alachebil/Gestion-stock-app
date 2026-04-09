import { useState, useEffect } from "react";
import Navbar from "../components/Navbars/AuthNavbar";
import Footer from "../components/Footers/Footer";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "../store/userSlice";
import { AiOutlineCloseCircle } from "react-icons/ai";
export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.currentUser);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({
    name: "",
    lastName: "",
    phone: "",
    password: "",
    image: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) navigate("/auth/login");
    if (user) {
      setUpdatedUser({
        name: user.name,
        lastName: user.lastName,
        phone: user.phone,
        password: "",
        image: user.image,
      });
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUpdatedUser({ ...updatedUser, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const response = await axios.put(
        `http://localhost:3000/users/${user._id}`,
        updatedUser
      );

      dispatch(setUser(response.data.user));
      setSuccessMessage("Utilisateur mis à jour avec succès!"); // Set success message
      setModalOpen(false); // Close modal on success
    } catch (error) {
      setSuccessMessage(""); // Clear the success message on error
      alert(
        "Erreur lors de la mise à jour de l'utilisateur: " +
          error.response?.data?.message || error.message
      );
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  return (
    <>
      <Navbar transparent />
      <main className="profile-page">
        <section className="relative block h-[500px]">
          <div
            className="absolute top-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')",
            }}
          >
            <span
              id="blackOverlay"
              className="w-full h-full absolute opacity-50 bg-black"
            ></span>
          </div>
        </section>
        <section className="relative py-16 bg-gray-200">
          <div className="container mx-auto px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
              <div className="px-6">
                <div className="flex flex-col items-center">
                  <div className="w-full flex justify-center items-center">
                    <div className="relative -mt-20">
                      <div className="w-[150px] h-[150px] overflow-hidden rounded-full">
                        <img
                          alt="Profile"
                          src={
                            updatedUser.image ||
                            "https://via.placeholder.com/150"
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-center my-10">
                    <h3 className="text-4xl font-semibold text-gray-700 mb-2">
                      {user?.name} {user?.lastName}
                    </h3>
                    <div className="mb-2 text-gray-600 mt-2">
                      <i className="fas fa-briefcase mr-2 text-lg text-gray-400"></i>
                      {user?.role === "admin"
                        ? "Administrateur"
                        : user?.role === "responsable"
                        ? "Responsable"
                        : "Utilisateur"}
                    </div>
                    <div className="mb-2 text-gray-600">
                      <i className="fas fa-envelope mr-2 text-lg text-gray-400"></i>
                      {user?.email}
                    </div>
                    <div className="mb-2 text-gray-600 mt-4">
                      <i className="fas fa-phone-alt mr-2 text-lg text-gray-400"></i>
                      {user?.phone || "Téléphone non fourni"}
                    </div>
                    <div className="flex justify-center mt-6 w-full">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-6 py-3 rounded-md shadow-md"
                        type="button"
                        onClick={handleOpenModal}
                      >
                        Mettre à jour
                      </button>
                    </div>
                    {/* Success Message */}
                    {successMessage && (
                      <p className="text-green-500 mt-4 text-sm">
                        {successMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-[90%] sm:w-[400px] relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-2xl text-black hover:text-gray-700"
            >
              <AiOutlineCloseCircle />
            </button>
            <h2 className="text-2xl mb-4">Mettre à jour les informations</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm">Nom</label>
                <input
                  type="text"
                  name="name"
                  value={updatedUser.name}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm">Prénom</label>
                <input
                  type="text"
                  name="lastName"
                  value={updatedUser.lastName}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm">Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  value={updatedUser.phone}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm">Photo de profil</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm">Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  value={updatedUser.password}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
