import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function AuthNavbar() {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const user = useSelector((state) => state.user?.currentUser);

  return (
    <>
 <nav className="top-0 absolute z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg bg-gradient-to-r from-blue-100 to-blue-300 shadow-md">
  <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
    <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
      <Link
        className="text-blue-900 text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase"
        to={
          user ? (user.role === "admin" ? "/admin/dashboard" : "/") : "/"
        }
      >
        Wind Consulting Tunisia
      </Link>
      <button
        className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
        type="button"
        onClick={() => setNavbarOpen(!navbarOpen)}
      >
        <i className="text-blue-900 fas fa-bars"></i>
      </button>
    </div>

    <div
      className={
        "lg:flex flex-grow items-center bg-blue-100 lg:bg-transparent lg:shadow-none transition-all duration-300 ease-in-out" +
        (navbarOpen ? " block rounded shadow-lg" : " hidden")
      }
      id="example-navbar-warning"
    >
      <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
        <li className="text-blue-900 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold hover:text-blue-700 transition">
          {user ? (
            user.role === "admin" ? (
              <Link to="/admin/dashboard">Tableau de bord</Link>
            ) : (
              <Link to="/">Accueil</Link>
            )
          ) : (
            <Link to="/">Accueil</Link>
          )}
        </li>

        {user && (
          <li className="text-blue-900 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold hover:text-blue-700 transition">
            <Link
              to={
                user.role === "user"
                  ? "/user/bl"
                  : user.role === "responsable"
                  ? "/responsable/bl"
                  : "/"
              }
            >
              BL
            </Link>
          </li>
        )}

        {user && (
          <li className="text-blue-900 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold hover:text-blue-700 transition">
            <Link
              to={
                user.role === "user"
                  ? "/allVms"
                  : user.role === "responsable"
                  ? "/allVms"
                  : "/"
              }
            >
              VMS
            </Link>
          </li>
        )}

{user && (
          <li className="text-blue-900 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold hover:text-blue-700 transition">
            <Link
              to={
                user.role === "user"
                  ? "/Pipeline"
                  : user.role === "responsable"
                  ? "/Pipeline"
                  : "/"
              }
            >
              Pipeline
            </Link>
          </li>
        )}

        {user ? (
          <li className="relative">
            <div className="flex items-center">
              <UserDropdown />
            </div>
          </li>
        ) : (
          <li className="text-blue-900 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold hover:text-blue-700 transition">
            <Link to="/auth/login">Se connecter</Link>
          </li>
        )}
      </ul>
    </div>
  </div>
</nav>

    </>
  );
}
