import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/userSlice";
import image from "../../assets/img/team-1-800x800.jpg";
import { Link, useNavigate } from "react-router-dom";

const UserDropdown = () => {
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const btnDropdownRef = useRef();
  const popoverDropdownRef = useRef();
  
  const user = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    setDropdownPopoverShow(false);
    navigate("/auth/login");
  };

  return (
    <>
      <button
        className="block"
        ref={btnDropdownRef}
        onClick={() => {
          setDropdownPopoverShow(!dropdownPopoverShow);
        }}
        aria-label="User menu"
      >
        <div className="items-center flex">
          <span className="w-12 h-12 text-sm text-white bg-gray-200 inline-flex items-center justify-center rounded-full overflow-hidden">
            <img
              alt="User Avatar"
              className="w-full h-full object-cover rounded-full"
              src={user && user.image ? user.image : image}
            />
          </span>
        </div>
      </button>

      <div
        ref={popoverDropdownRef}
        className={`${
          dropdownPopoverShow ? "block" : "hidden"
        } bg-white text-base z-50 py-2 list-none text-left rounded shadow-lg mt-2`}
        style={{
          position: "absolute",
          top: "100%",
          right: "0", 
          left: "auto", 
        }}
      >
        {user ? (
          <>
            <Link
              to="/profile"
              className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 text-right"
            >
              Profil
            </Link>
            <a
              href="#"
              className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 text-right"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              Déconnexion
            </a>
          </>
        ) : (
          <Link
            to="/auth/login"
            className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-gray-700 text-right"
          >
            Se connecter
          </Link>
        )}
      </div>
    </>
  );
};

export default UserDropdown;
