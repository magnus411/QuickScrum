import { getBoardData } from "@/app/lib/actions";
import BoardClient from "./BoardClient";

export default async function BoardPage() {
  const { sprint, tasks, sprints } = await getBoardData();
  return <BoardClient sprint={sprint} initialTasks={tasks} sprints={sprints} />;
}
