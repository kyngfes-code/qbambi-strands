import NavBarShop from "@/components/NavBarShop";

function layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ffcfd8] to-[#ff7aa2] flex flex-col">
      <NavBarShop />

      <main>{children}</main>
    </div>
  );
}

export default layout;
