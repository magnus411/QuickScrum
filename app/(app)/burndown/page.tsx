import { getBurndownData } from "@/app/lib/actions";
import BurndownClient from "./BurndownClient";

export default async function BurndownPage() {
  const data = await getBurndownData();
  return <BurndownClient data={data} />;
}
