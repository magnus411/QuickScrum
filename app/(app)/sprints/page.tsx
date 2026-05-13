import { getSprintsData } from "@/app/lib/actions";
import SprintsClient from "./SprintsClient";

export default async function SprintsPage() {
  const { sprints, activeSprint, allTasks } = await getSprintsData();
  return <SprintsClient sprints={sprints} activeSprint={activeSprint} allTasks={allTasks} />;
}
