import { Link } from "react-router-dom";
import { useState } from "react";
import UserDropdown from "../Dropdowns/UserDropdown";

export default function Sidebar() {
  const [collapseShow, setCollapseShow] = useState("hidden");
  const [activeRoute, setActiveRoute] = useState("/admin/dashboard");

  const handleSetActiveRoute = (route) => {
    setActiveRoute(route);
  };

  const linkClass = (route) =>
    "text-xs uppercase py-3 font-bold block relative transition-all duration-300 " +
    (activeRoute === route
      ? "text-blue-700 bg-gray-200 rounded-md px-4"
      : "text-gray-700 hover:text-blue-700 hover:bg-gray-300 rounded-md px-4");

  const iconClass = (route) =>
    "fas text-sm mr-2 transition-all duration-300 " +
    (activeRoute === route ? "text-blue-700" : "text-gray-4000");

  return (
    <>
      <nav className="md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-md bg-gray-100 flex flex-wrap items-center justify-between relative md:w-64 z-50 py-4 px-6">
        <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
          <button
            className="cursor-pointer text-gray-700 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded"
            type="button"
            onClick={() => setCollapseShow("bg-white m-2 py-3 px-6")}
          >
            <i className="fas fa-bars"></i>
          </button>

          <Link
  className="md:block text-left md:pb-2 text-gray-800 mr-0 inline-block whitespace-nowrap text-sm uppercase font-bold p-4 px-0 relative"
  to="/admin/dashboard"
  onClick={() => handleSetActiveRoute("/admin/dashboard")}             
>
  <span className="absolute inset-0 -z-10 before:content-[''] before:absolute before:inset-0 before:bg-blue-500 before:opacity-80 before:blur-xl before:rounded-full before:w-full before:h-full before:animate-pulse">
  </span>
  <span className="text-gray-900 drop-shadow-lg">société plastique Teboulba</span>
</Link>


          <div className="md:hidden items-center flex flex-wrap list-none">
            <div className="inline-block relative">
              <UserDropdown />
            </div>
          </div>

          <div
            className={
              "md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 shadow-none absolute top-0 left-0 right-0 z-50 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
              collapseShow
            }
          >
            <ul className="md:flex-col md:min-w-full flex flex-col list-none">
              <li className="items-center">
                <Link
                  className={linkClass("/admin/dashboard")}
                  to="/admin/dashboard"
                  onClick={() => handleSetActiveRoute("/admin/dashboard")}
                >
                  <i className={`${iconClass("/admin/dashboard")} fa-tv`}></i>{" "}
                  <span className="relative">
                    <span className="absolute inset-0 text-black opacity-30 blur-md -z-10">
                      Tableau de bord
                    </span>
                    <span className="drop-shadow-lg">Tableau de bord</span>
                  </span>
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={linkClass("/admin/tables")}
                  to="/admin/tables"
                  onClick={() => handleSetActiveRoute("/admin/tables")}
                >
                  <i className={`${iconClass("/admin/tables")} fa-table`}></i>{" "}
                  <span className="relative">
                    <span className="absolute inset-0 text-black opacity-30 blur-md -z-10">
                      Gestion Utilisateur
                    </span>
                    <span className="drop-shadow-lg">Gestion Utilisateur</span>
                  </span>
                </Link>
             </li>

              <li className="items-center">
                <Link
                  className={linkClass("/admin/factures")}
                  to="/admin/factures"
                  onClick={() => handleSetActiveRoute("/admin/factures")}
                >
                  <i className={`${iconClass("/admin/factures")} fa-file-invoice`}></i>{" "}
                  <span className="relative">
                    <span className="absolute inset-0 text-black opacity-30 blur-md -z-10">
                      Gestion Factures
                    </span>
                    <span className="drop-shadow-lg">Gestion Factures</span>
                  </span>
                </Link>
              </li>

              <li className="items-center">
                <Link
                  className={linkClass("/admin/tableReclam")}
                  to="/admin/tableReclam"
                  onClick={() => handleSetActiveRoute("/admin/tableReclam")}
                >
                  <i className={`${iconClass("/admin/tableReclam")} fa-table`}></i>{" "}
                  <span className="relative">
                    <span className="absolute inset-0 text-black opacity-30 blur-md -z-10">
                      Gestion Réclamations
                    </span>
                    <span className="drop-shadow-lg">Gestion Réclamations</span>
                  </span>
                </Link>
              </li>

              {/* <li className="items-center">
                <Link
                  className={linkClass("/admin/tableVM")}
                  to="/admin/tableVM"
                  onClick={() => handleSetActiveRoute("/admin/tableVM")}
                >
                  <i className={`${iconClass("/admin/tableVM")} fa-table`}></i>{" "}
                  <span className="relative">
                    <span className="absolute inset-0 text-black opacity-30 blur-md -z-10">
                      Gestion des VMS
                    </span>
                    <span className="drop-shadow-lg">Gestion des VMS</span>
                  </span>
                </Link>
              </li> */}

              <li className="items-center">
                <Link
                  className={linkClass("/admin/stock")}
                  to="/admin/stock"
                  onClick={() => handleSetActiveRoute("/admin/stock")}
                >
                  <i className={`${iconClass("/admin/stock")} fa-boxes-stacked`}></i>{" "}
                  <span className="relative">
                    <span className="absolute inset-0 text-black opacity-30 blur-md -z-10">
                      Gestion du Stock
                    </span>
                    <span className="drop-shadow-lg">Gestion du Stock</span>
                  </span>
                </Link>
              </li>

            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
