import { getHairs } from "@/lib/data-service";
import Haircard from "./Haircard";

async function HairList() {
  const hairs = await getHairs();
  if (!hairs.length) return null;
  return (
    <div className="grid grid-cols-1 justify-items-center sm:grid-cols-2 sm:mx-3  lg:grid-cols-3 lg:mx-2 xl:grid-cols-4 xl:mr-1 gap-x-6 gap-y-2 px-4 min-h-screen">
      {hairs.map((hair) => (
        <Haircard hair={hair} key={hair.id} />
      ))}
    </div>
  );
}

export default HairList;
