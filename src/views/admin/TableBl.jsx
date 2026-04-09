
import BlTable from "../../components/Cards/BlTable";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
export default function Tables() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  useEffect(() => {
    if (!user) navigate("/auth/login");
    if (user && user.role !== "admin") navigate("/");
  }, [user, navigate]);
  return (
    <>
      <div className="flex flex-wrap mt-4">
        <div className="w-full mb-12 px-4">
          <BlTable />
        </div>
      </div>
    </>
  );
}
