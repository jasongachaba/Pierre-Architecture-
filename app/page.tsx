import Navbar from "@/components/layout/Navbar";
import ArchitectureHome from "@/components/home/ArchitectureHome";

import { getHomeData } from "@/components/home/data/homeData";

export default async function HomePage() {
  const data = await getHomeData();

  return <ArchitectureHome data={data} />;
}