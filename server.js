const express = require("express");
const app = express();
app.use(express.json());

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY; // sua API key
const STATUS_EM_ANDAMENTO = "em andamento"; // nome exato do status no seu espaço

// ClickUp envia eventos para esta rota
app.post("/webhook", async (req, res) => {
  const event = req.body;

  // Responde imediatamente para o ClickUp não retentar
  res.status(200).send("ok");

  // Só processa eventos de criação de subtarefa
  if (event.event !== "taskCreated") return;

  const subtask = event.task_id;
  if (!subtask) return;

  try {
    // Busca detalhes da subtarefa para pegar o parent
    const taskData = await getTask(subtask);

    // Se não tiver parent, não é subtarefa — ignora
    if (!taskData.parent) return;

    const parentId = taskData.parent;
    console.log(`Subtarefa criada: ${subtask} | Tarefa mãe: ${parentId}`);

    // Atualiza o status da tarefa mãe
    await updateTaskStatus(parentId, STATUS_EM_ANDAMENTO);
    console.log(`Status da tarefa mãe ${parentId} atualizado para "${STATUS_EM_ANDAMENTO}"`);
  } catch (err) {
    console.error("Erro ao processar evento:", err.message);
  }
});

async function getTask(taskId) {
  const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    headers: { Authorization: CLICKUP_API_KEY },
  });
  if (!res.ok) throw new Error(`Erro ao buscar tarefa ${taskId}: ${res.status}`);
  return res.json();
}

async function updateTaskStatus(taskId, status) {
  const res = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: CLICKUP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erro ao atualizar tarefa ${taskId}: ${res.status} - ${body}`);
  }
  return res.json();
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Webhook endpoint: POST http://localhost:${PORT}/webhook`);
});
