const CLICKUP_API_KEY = "pk_55083083_H31RB7QQVAOFM5EHYKT69KP97RV4GTU7";
const TEAM_ID = "90132630278";
const WEBHOOK_URL = "https://clickup-automacoes-production.up.railway.app/webhook";

async function registerWebhook() {
  const res = await fetch(`https://api.clickup.com/api/v2/team/${TEAM_ID}/webhook`, {
    method: "POST",
    headers: {
      Authorization: CLICKUP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint: WEBHOOK_URL,
      events: ["taskCreated"],
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Erro ao registrar webhook:", data);
    return;
  }

  console.log("Webhook registrado com sucesso!");
  console.log("ID do webhook:", data.id);
}

registerWebhook();
