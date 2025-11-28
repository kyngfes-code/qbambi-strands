import NavBarAdmin from "@/components/NavBarAdmin";

function layout({ children }) {
  return (
    <div className="min-h-screen relative flex flex-col bg-linear-to-bl from-violet-100 to-stone-500">
      <NavBarAdmin />
      <div>{children}</div>
    </div>
  );
}

export default layout;
