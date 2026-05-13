import { getBacklogData } from "@/app/lib/actions";
import BacklogClient from "./BacklogClient";

export default async function BacklogPage() {
  const { tasks, sprints } = await getBacklogData();
  return <BacklogClient tasks={tasks} sprints={sprints} />;
}
