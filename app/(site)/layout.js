import GlobalNavbar from "@/components/navigation/GlobalNavbar";

export default function SiteLayout({ children }) {
  return (
    <>
      <GlobalNavbar />

      <main className="min-h-[calc(100vh-72px)]">{children}</main>
    </>
  );
}
