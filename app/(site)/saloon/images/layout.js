import NavBar from "@/components/NavBar";
import NavBarSaloonImages from "@/components/NavBarSaloonImages";

function layout({ children }) {
  return (
    <div className="flex flex-col">
      <NavBar />
      <div className="flex items-center justify-center">
        <h1 className="text-white text-3xl sm:text-5xl font-bold leading-tight drop-shadow-lg m-4">
          Book an experience with us today
        </h1>
      </div>
      {children}
    </div>
  );
}

export default layout;
