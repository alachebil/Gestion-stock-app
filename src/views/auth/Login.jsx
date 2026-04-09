import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../store/userSlice";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    if (currentUser && currentUser.role === "admin") {
      navigate("/admin/dashboard");
    }
    if (currentUser && currentUser.role === "user") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/users/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { user, token } = response.data;
      dispatch(loginSuccess({ user, token }));

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(
        "Error during login",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border border-blue-300 rounded-md bg-transparent">
            <div className="rounded-t mb-0 px-4 py-4">
              <div className="text-center mb-3">
                <h6 className="text-white text-sm font-bold">
                  Connectez-vous
                </h6>
              </div>
              <hr className="mt-4 border-b-1 border-blue-300" />
            </div>
            <div className="flex-auto px-4 py-6">
              <form onSubmit={handleSubmit}>
                <div className="relative w-3/4 mx-auto mb-4">
                  <label
                    className="block uppercase text-white text-xs font-bold mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="border border-blue-300 px-3 py-2 placeholder-gray-400 text-gray-600 bg-white rounded text-sm focus:outline-none focus:ring focus:ring-blue-300 w-full ease-linear transition-all duration-150"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative w-3/4 mx-auto mb-4">
                  <label
                    className="block uppercase text-white text-xs font-bold mb-2"
                    htmlFor="password"
                  >
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="border border-blue-300 px-3 py-2 placeholder-gray-400 text-gray-600 bg-white rounded text-sm focus:outline-none focus:ring focus:ring-blue-300 w-full ease-linear transition-all duration-150"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="text-center mt-6">
                  <button
                    className="bg-blue-500 text-white hover:bg-blue-400 text-sm font-bold uppercase px-4 py-2 rounded shadow-md focus:outline-none w-3/4 mx-auto ease-linear transition-all duration-150"
                    type="submit"
                  >
                    Se connecter
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="flex flex-wrap mt-4 relative">
            <div className="w-full text-center">
              <Link to="/auth/register" className="text-blue-500">
                <small>Créer un nouveau compte</small>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
