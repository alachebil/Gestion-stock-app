import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbars/AuthNavbar";
import FooterSmall from "../components/Footers/FooterSmall";
import image from "../assets/img/register_bg_2.png";

function Auth() {
  return (
    <>
      <Navbar transparent />
      <main>
        <section className="relative w-full h-full py-40 min-h-screen">
          <div
            className="absolute top-0 w-full h-full bg-gray-800 bg-no-repeat bg-full"
            style={{
              backgroundImage: `url(${image})`,
            }}
          ></div>
          <Outlet />
          <FooterSmall absolute />
        </section>
      </main>
    </>
  );
}

export default Auth;
