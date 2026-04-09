export default function FooterSmall(props) {
  return (
    <>
      <footer
        className={
          // eslint-disable-next-line react/prop-types
          (props.absolute
            ? "absolute w-full bottom-0 bg-gray-800"
            : "relative") + " pb-6"
        }
      >
        <div className="container mx-auto px-4">
          <hr className="mb-6 border-b-1 border-gray-600" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4">
              <div className="text-sm text-gray-500 font-semibold py-1 text-center md:text-left">
                Copyright © {new Date().getFullYear()} Wind Consulting Tunisia
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
