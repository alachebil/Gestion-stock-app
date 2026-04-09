import UserDropdown from "../Dropdowns/UserDropdown";

export default function AdminNavbar() {
  return (
    <nav className="absolute top-0 left-0 w-full z-10 bg-gradient-to-b from-blue-500 to-blue-700 shadow-2xl md:flex-row md:flex-nowrap md:justify-between flex items-center p-4 rounded-b-2xl">
      <div className="w-full mx-auto flex items-center justify-between md:px-10 px-4">
        <h1 className="text-white text-lg uppercase font-bold tracking-wide relative">
          <span className="absolute -z-10 inset-0 text-black opacity-40 blur-md">
            Tableau de bord
          </span>
          Tableau de bord
        </h1>
        <ul className="hidden md:flex flex-row list-none items-center">
          <UserDropdown />
        </ul>
      </div>
    </nav>
  );
}
