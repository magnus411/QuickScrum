import { Resend } from "resend";

const resend = new Resend("re_YxCswMQA_2RVv33Qprpfms9rWDz272mp1");
const FROM_EMAIL = "notifications@sprint.heihai.no";

function getThreadHeaders(taskId: number) {
  const threadId = `<task-${taskId}@sprint.heihai.no>`;
  return {
    "In-Reply-To": threadId,
    References: threadId,
  };
}

function memberEmail(member: string): string {
  const map: Record<string, string> = {
    Magnus: "gjerstad@jotunheimenesport.no",
    Endre: "endre@jotunheimenesport.no",
    Selma: "selma@jotunheimenesport.no",
    Gustav: "gustav@jotunheimenesport.no",
  };
  return map[member] || `${member.toLowerCase()}@sprint.heihai.no`;
}

export async function sendAssignmentEmail(params: {
  taskId: number;
  taskTitle: string;
  assignee: string;
  assigner?: string;
}) {
  const { taskId, taskTitle, assignee, assigner } = params;
  const to = memberEmail(assignee);
  const subject = `[QuickScrum] Task #${taskId}: ${taskTitle}`;
  const body = `Hi ${assignee},

You have been assigned to a new task:

Title: ${taskTitle}
Task ID: #${taskId}
${assigner ? `Assigned by: ${assigner}` : ""}

View it on the board: https://sprint.heihai.no/board

— QuickScrum`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text: body,
      headers: getThreadHeaders(taskId),
    });
  } catch (err) {
    console.error("Failed to send assignment email:", err);
  }
}

export async function sendLogEmail(params: {
  taskId: number;
  taskTitle: string;
  logMessage: string;
  author: string;
  notifyee: string;
}) {
  const { taskId, taskTitle, logMessage, author, notifyee } = params;
  const to = memberEmail(notifyee);
  const subject = `[QuickScrum] Task #${taskId}: ${taskTitle}`;
  const body = `Hi ${notifyee},

A new log was added to a task you're involved in:

Task: ${taskTitle} (#${taskId})
Author: ${author}
Log:
${logMessage}

View it on the board: https://sprint.heihai.no/board

— QuickScrum`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text: body,
      headers: getThreadHeaders(taskId),
    });
  } catch (err) {
    console.error("Failed to send log email:", err);
  }
}
