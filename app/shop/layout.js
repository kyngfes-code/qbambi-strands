import NavBarShop from "@/components/NavBarShop";

function layout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <NavBarShop />

      <main>{children}</main>
    </div>
  );
}

export default layout;
