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
import TableBl from "./views/admin/TableBl";
import TableReclam from "./views/admin/TableReclam";
import TableVM from "./views/admin/tablesVM";
import TableVmStats from "./views/admin/TableVmStats";
import StockManagement from "./views/admin/StockManagement";

import Login from "./views/auth/Login";
import Register from "./views/auth/Register";
import Profile from "./views/Profile";
import Index from "./views/Index";
import UserBl from "./views/UserBl";
import ResponsableBl from "./views/ResponsableBl";
import AllVms from "./views/allVms";
import Pipeline from "./views/pipeline";
import Bl from "./views/Bl";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<Admin />}>
          <Route path="dashboard/*" element={<Dashboard />} />
          <Route path="tables" element={<Tables />} />
          <Route path="tablebl" element={<TableBl />} />
          <Route path="tableReclam" element={<TableReclam />} />
          <Route path="tableVM" element={<TableVM />} />
          <Route path="stats/:vmid" element={<TableVmStats />} />
          <Route path="stock" element={<StockManagement />} />
          

        </Route>
        <Route path="/auth/*" element={<Auth />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/bl" element={<UserBl />} />
        <Route path="/responsable/bl" element={<ResponsableBl />} />
        <Route path="/allVms" element={<AllVms />} />
        <Route path="/Pipeline" element={<Pipeline />} />
        <Route path="/bl/:id" element={<Bl />} />
        <Route path="/" element={<Index />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
