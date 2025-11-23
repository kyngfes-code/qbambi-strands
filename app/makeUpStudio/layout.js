// import Image from "next/image";
// import bgImage from "@/public/bg-make-up1.png";
// import NavBarMakeUpStudio from "@/components/NavBarMakeUpStudio";
// import { CheckCheckIcon } from "lucide-react";

// export default function Layout({ children }) {
//   return (
//     <div className="min-h-screen bg-linear-to-r from-black via-[#521f3d] to-[#521f3d] flex flex-col">
//       <NavBarMakeUpStudio />

//       <div className="w-full ml-4 flex  sm:justify-between items-center min-h-[60vh] ">
//         <div className="text-white mr-2 max-w-sm lg:ml-16 lg:mb-8">
//           <h2 className="text-3xl font-semibold mb-4 ml-2 sm:ml-0">
//             Our Services
//           </h2>
//           <ul className="space-y-2 ml-2 sm:ml-0 ">
//             <li className="flex items-center gap-2">
//               <CheckCheckIcon className="w-4 h-4 text-pink-300" />
//               Bridal make-up
//             </li>
//             <li className="flex items-center gap-2">
//               <CheckCheckIcon className="w-4 h-4 text-pink-300" />
//               Birthday and other events make-up
//             </li>
//             <li className="flex items-center gap-2">
//               <CheckCheckIcon className="w-4 h-4 text-pink-300" />
//               Movie set make-up
//             </li>
//             <li className="flex items-center gap-2">
//               <CheckCheckIcon className="w-4 h-4 text-pink-300" />
//               Home service
//             </li>
//           </ul>
//         </div>
//         <div className="flex items-center justify-center mr-2 sm:mr-25">
//           <Image
//             src={bgImage}
//             alt="make-up image"
//             className="object-contain max-h-full w-auto"
//           />
//         </div>
//       </div>

//       <div className=" mb-4 w-full px-4 lg:-mt-40 lg:z-30 flex justify-center">
//         {children}
//       </div>
//     </div>
//   );
// }

import Image from "next/image";
import bgImage from "@/public/bg-make-up1.png";
import NavBarMakeUpStudio from "@/components/NavBarMakeUpStudio";
import { CheckCheckIcon } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="h-screen overflow-hidden bg-linear-to-r from-black via-[#521f3d] to-[#521f3d] relative flex flex-col">
      <NavBarMakeUpStudio />

      <div className="flex flex-1 h-[65%] px-6 justify-between items-center relative z-10">
        <div className="text-white mb-65 max-w-sm">
          <h2 className="text-3xl mb-4 font-semibold">Our Services</h2>

          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Bridal make-up
            </li>
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Birthday & other events make-up
            </li>
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Movie set make-up
            </li>
            <li className="flex items-center gap-2">
              <CheckCheckIcon className="w-4 h-4 text-pink-300" />
              Home service
            </li>
          </ul>
        </div>

        <div className="flex justify-center items-center">
          <Image
            src={bgImage}
            alt="make-up image"
            className="object-contain max-h-full w-auto"
          />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full flex justify-center px-4 z-30 -mb-4">
        {children}
      </div>
    </div>
  );
}
