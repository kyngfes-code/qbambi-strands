import {
  HomeIcon,
  InfoIcon,
  LogInIcon,
  SchoolIcon,
  SearchIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ShopSideBar() {
  return (
    <aside
      className="
        fixed left-2 top-1/2 -translate-y-1/2 
         h-[80vh]
        bg-white/20 backdrop-blur-xl
        border border-white/30 
        shadow-xl shadow-black/10
        rounded-2xl 
        flex flex-col
        overflow-hidden
        z-40
      "
    >
      {/* TOP (Logo) */}
      <div className="px-6 py-4 border-b border-white/20">
        <div className=" group flex items-center gap-3">
          <Image
            src="/icon-gold.png"
            alt="Qbambi Strands"
            width={38}
            height={38}
            className="drop-shadow-md"
          />
          <div className=" hidden group-hover:inline group-focus-within:inline text-xl font-semibold text-gray-900">
            Qbambi <br /> Strands
          </div>
        </div>
      </div>

      {/* MENU (Centered Vertically) */}
      <nav className="flex-1 flex flex-col justify-between px-4">
        <ul className="space-y-2">
          <SidebarLink icon={<HomeIcon />} label="Home" href="/" />
          <SidebarLink icon={<ShoppingBagIcon />} label="Shop" href="/shop" />
          <SidebarLink
            icon={<SparklesIcon />}
            label="Make-up Studio"
            href="/makeUpStudio"
          />
          <SidebarLink icon={<SchoolIcon />} label="Academy" href="/academy" />
          <SidebarLink icon={<SearchIcon />} label="Search" href="/search" />
          <SidebarLink icon={<InfoIcon />} label="About" href="/about" />
        </ul>
        <div className="px-4 py-2 border-t border-white/20">
          <SidebarLink icon={<LogInIcon />} label="Sign in" href="/login" />
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({ icon, label, href }) {
  return (
    <li>
      <Link
        href={href}
        className="
        group
          flex items-center gap-3
          text-gray-800 font-medium
          hover:bg-white/30 hover:border-white/40
          px-3 py-2 rounded-xl
          transition-all
        "
      >
        <span className="text-xl">{icon}</span>
        <span
          className="hidden group-hover:inline
            group-focus-within:inline
            transition-all"
        >
          {label}
        </span>
      </Link>
    </li>
  );
}

// import {
//   EyeClosedIcon,
//   Home,
//   LogIn,
//   PersonStanding,
//   School,
//   Search,
//   ShoppingCart,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "./ui/sidebar";
// import Logo from "@/components/Logo";
// import Link from "next/link";

// // Menu items.
// const items = [
//   {
//     title: "Home",
//     url: "/",
//     icon: Home,
//   },
//   {
//     title: "Shop",
//     url: "/shop",
//     icon: ShoppingCart,
//   },
//   {
//     title: "Make-up Studio",
//     url: "makeUp",
//     icon: EyeClosedIcon,
//   },
//   {
//     title: "Qbambi's Academy",
//     url: "/academy",
//     icon: School,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "About",
//     url: "/contactUs",
//     icon: PersonStanding,
//   },
// ];
// const login = {
//   title: "Sign in",
//   url: "#",
//   icon: LogIn,
// };

// export function ShopSideBar() {
//   return (
//     <div>
//       <Sidebar>
//         <SidebarContent>
//           <SidebarGroup className="flex flex-col gap-y-8 mt-16">
//             <SidebarGroupLabel>
//               <Logo className="text-xl font-semibold" />
//             </SidebarGroupLabel>
//             <SidebarGroupContent>
//               <div className="flex flex-col flex-1 justify-center px-2">
//                 <SidebarMenu className="flex flex-col gap-4">
//                   {items.map((item) => (
//                     <SidebarMenuItem key={item.title}>
//                       <SidebarMenuButton asChild>
//                         <Link href={item.url}>
//                           <item.icon />
//                           <span>{item.title}</span>
//                         </Link>
//                       </SidebarMenuButton>
//                     </SidebarMenuItem>
//                   ))}
//                 </SidebarMenu>
//               </div>
//               <div className="px-4 py-6">
//                 <SidebarMenuItem>
//                   <SidebarMenuButton asChild>
//                     <Link href="#">
//                       <LogIn />
//                       <span>Sign in</span>
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               </div>
//             </SidebarGroupContent>
//           </SidebarGroup>
//         </SidebarContent>
//       </Sidebar>
//     </div>
//   );
// }
