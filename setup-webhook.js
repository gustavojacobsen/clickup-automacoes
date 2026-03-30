// Execute este script UMA VEZ para registrar o webhook no ClickUp
// node setup-webhook.js

const CLICKUP_API_KEY = "SUA_API_KEY_AQUI";
const TEAM_ID = "SEU_TEAM_ID_AQUI"; // Workspace ID (encontre em Settings > Integrations)
const WEBHOOK_URL = "https://SEU_DOMINIO.COM/webhook"; // URL pública do seu servidor

async function registerWebhook() {
  const res = await fetch(`https://api.clickup.com/api/v2/team/${TEAM_ID}/webhook`, {
    method: "POST",
    headers: {
      Authorization: CLICKUP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint: WEBHOOK_URL,
      events: ["taskCreated"], // dispara quando qualquer tarefa/subtarefa é criada
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Erro ao registrar webhook:", data);
    return;
  }

  console.log("Webhook registrado com sucesso!");
  console.log("ID do webhook:", data.id);
  console.log("Guarde este ID caso precise deletar depois:", data.id);
}

registerWebhook();
