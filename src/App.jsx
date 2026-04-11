import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Admin from "./layouts/Admin";
import Auth from "./layouts/Auth";
import "./index.css";
import Dashboard from "./views/admin/Dashboard";
import Tables from "./views/admin/Tables";
import TableFacture from "./views/admin/TableFacture";
import StockManagement from "./views/admin/StockManagement";
import TableReclam from "./views/admin/TableReclam";
import ServiceDashboard from "./views/admin/ServiceDashboard";
import ServiceStockManagement from "./views/admin/ServiceStockManagement";
import ServiceTableFacture from "./views/admin/ServiceTableFacture";
import CaisseManagement from "./views/admin/CaisseManagement";

import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import Profile from "./views/Profile";
import Index from "./views/Index";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<Admin />}>
          <Route path="dashboard/*" element={<Dashboard />} />
          <Route path="tables" element={<Tables />} />
          <Route path="factures" element={<TableFacture />} />
          <Route path="tableReclam" element={<TableReclam />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="service-dashboard" element={<ServiceDashboard />} />
          <Route path="service-stock" element={<ServiceStockManagement />} />
          <Route path="service-factures" element={<ServiceTableFacture />} />
          <Route path="caisse" element={<CaisseManagement />} />

        </Route>
        <Route path="/auth/*" element={<Auth />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<Index />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
