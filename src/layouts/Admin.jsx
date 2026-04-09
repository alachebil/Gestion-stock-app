import Sidebar from "../components/Sidebar/Sidebar";
import AdminNavbar from "../components/Navbars/AdminNavbar";
import FooterAdmin from "../components/Footers/FooterAdmin";
import { Outlet } from "react-router-dom";

function Admin() {    
  return (
    <div className="flex flex-col min-h-screen bg-gray-200">
      <Sidebar />
      <div className="relative md:ml-64 flex-grow flex flex-col">
        <AdminNavbar />
        <div className="relative bg-gray-800 md:pt-32 pb-32 pt-12"></div>
        <div className="px-4 md:px-10 mx-auto w-full -m-24 flex-grow">
          <Outlet />
        </div>
        <FooterAdmin />
      </div>
    </div>
  );
}

export default Admin;
