const express = require("express");
const app = express();
app.use(express.json());

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const STATUS_EM_ANDAMENTO = "EM ANDAMENTO";

app.post("/webhook", async (req, res) => {
  const event = req.body;
  res.status(200).send("ok");
  const taskId = event.task_id;
  if (!taskId) return;
  try {
    if (event.event === "taskCreated") {
      const taskData = await getTask(taskId);
      if (!taskData.parent) return;
      const parentId = taskData.parent;
      await updateTaskStatus(parentId, STATUS_EM_ANDAMENTO);
      await ajustarDatasTaskMae(parentId);
    }
    if (event.event === "taskDueDateUpdated") {
      const taskData = await getTask(taskId);
      if (!taskData.parent) return;
      const parentId = taskData.parent;
      await ajustarDatasTaskMae(parentId);
    }
  } catch (err) {
    console.error("Erro ao processar evento:", err.message);
  }
});

async function ajustarDatasTaskMae(parentId) {
  const parent = await getTask(parentId);
  if (!parent.status || parent.status.status.toUpperCase() !== STATUS_EM_ANDAMENTO) return;
  const subtasks = await getSubtasks(parentId);
  if (!subtasks || subtasks.length === 0) return;
  let maxDueDate = null;
  for (const sub of subtasks) {
    if (sub.due_date) {
      const d = parseInt(sub.due_date);
      if (!maxDueDate || d > maxDueDate) maxDueDate = d;
    }
  }
  if (!maxDueDate) return;
  const startDate = parseInt(parent.date_created);
  await updateTaskDates(parentId, startDate, maxDueDate);
  console.log(`[Datas] Mãe ${parentId} atualizada → vencimento: ${new Date(maxDueDate).toLocaleDateString("pt-BR")}`);
}

async function getTask(taskId) {
  const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    headers: { Authorization: CLICKUP_API_KEY },
  });
  if (!res.ok) throw new Error(`Erro ao buscar tarefa ${taskId}: ${res.status}`);
  return res.json();
}

async function getSubtasks(parentId) {
  const res = await fetch(`https://api.clickup.com/api/v2/task/${parentId}?include_subtasks=true`, {
    headers: { Authorization: CLICKUP_API_KEY },
  });
  if (!res.ok) throw new Error(`Erro ao buscar subtarefas de ${parentId}: ${res.status}`);
  const data = await res.json();
  return data.subtasks || [];
}

async function updateTaskStatus(taskId, status) {
  const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: "PUT",
    headers: { Authorization: CLICKUP_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar status ${taskId}: ${res.status}`);
  return res.json();
}

async function updateTaskDates(taskId, startDate, dueDate) {
  const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: "PUT",
    headers: { Authorization: CLICKUP_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ start_date: startDate, due_date: dueDate }),
  });
  if (!res.ok) throw new Error(`Erro ao atualizar datas ${taskId}: ${res.status}`);
  return res.json();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
