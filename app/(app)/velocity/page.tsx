import { getVelocityData } from "@/app/lib/actions";
import VelocityClient from "./VelocityClient";

export default async function VelocityPage() {
  const { data, average } = await getVelocityData();
  return <VelocityClient data={data} average={average} />;
}
