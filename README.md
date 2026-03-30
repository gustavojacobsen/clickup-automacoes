# ClickUp Webhook — Status automático "Em Andamento"

Quando uma subtarefa é criada em qualquer tarefa, o status da **tarefa mãe** é automaticamente alterado para **"Em Andamento"**.

---

## Pré-requisitos

- Node.js 18+
- Servidor com URL pública (ou use [ngrok](https://ngrok.com) para testes locais)

---

## Configuração

### 1. Instale as dependências

```bash
npm install
```

### 2. Descubra seu Team ID

Acesse: `https://app.clickup.com/api` → faça login → copie o **Team ID** do seu workspace.

### 3. Configure as variáveis

No `server.js`, ajuste esta linha com o nome **exato** do status no seu espaço ClickUp:

```js
const STATUS_EM_ANDAMENTO = "em andamento"; // case-insensitive no ClickUp
```

### 4. Suba o servidor

```bash
CLICKUP_API_KEY=sua_api_key node server.js
```

Para testar localmente com ngrok:

```bash
ngrok http 3000
# Copie a URL gerada (ex: https://abc123.ngrok.io)
```

### 5. Registre o webhook (uma vez só)

Edite `setup-webhook.js` com sua API Key, Team ID e a URL pública do servidor, depois execute:

```bash
node setup-webhook.js
```

---

## Como obter a API Key

1. Acesse **ClickUp → Configurações de usuário → Apps**
2. Clique em **"Generate"** em "Personal API Token"
3. Copie o token gerado

---

## Observações

- O nome do status precisa ser **idêntico** ao cadastrado no seu espaço (verifique em Settings > Statuses)
- O webhook escuta **criação de qualquer tarefa** — a lógica filtra apenas as que têm tarefa mãe
- Para rodar em produção, considere usar Railway, Render ou um VPS com PM2
