# BebeuJá 🍺 — Guia de Deploy

Marketplace de delivery de bebidas. Abaixo estão as instruções para hospedar em **Hostinger** (arquivo estático) ou **Easypanel** (Docker).

---

## 📦 Pré-requisitos

- Node.js 20+
- npm ou bun

---

## 🏗️ Build local

```bash
npm install
npm run build
```

O build final fica na pasta `dist/`.

---

## 🌐 Hostinger (Hospedagem Estática)

### Passo a passo:

1. Execute o build:
   ```bash
   npm run build
   ```

2. Acesse o **hPanel** da Hostinger → **Gerenciador de Arquivos**

3. Navegue até `public_html/` (ou o domínio desejado)

4. **Delete** os arquivos existentes

5. **Faça upload** de TODO o conteúdo da pasta `dist/`
   - Inclui: `index.html`, `assets/`, `.htaccess`

6. O arquivo `.htaccess` já está incluído na pasta `public/` e será copiado automaticamente para `dist/` pelo Vite — ele garante que o roteamento do React funcione corretamente.

> ✅ O `.htaccess` está em `public/.htaccess` — o Vite copia automaticamente para `dist/.htaccess` no build.

### Subdomínio / Pasta específica

Se hospedar em subpasta (ex: `seusite.com/bebeuja`), altere o `vite.config.ts`:

```ts
export default defineConfig({
  base: '/bebeuja/', // adicione esta linha
  // ...restante da config
})
```

---

## 🐳 Easypanel (Docker)

### Opção A — Via Dockerfile (recomendado)

1. Suba o repositório para GitHub/GitLab

2. No Easypanel:
   - Crie um novo **App**
   - Tipo: **Dockerfile**
   - Aponte para o repositório
   - Branch: `main`
   - Porta: `80`

3. Clique em **Deploy** — o Easypanel fará o build automaticamente

4. Configure o domínio em **Domains** dentro do App

### Opção B — Build e push manual

```bash
# Build da imagem Docker
docker build -t bebeuja:latest .

# Testar localmente
docker run -p 3000:80 bebeuja:latest
# Acesse: http://localhost:3000

# Push para registry (se usar registry privado)
docker tag bebeuja:latest seu-registry/bebeuja:latest
docker push seu-registry/bebeuja:latest
```

### Variáveis de Ambiente (futuro backend)

No Easypanel, adicione em **Environment**:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

---

## ⚙️ Estrutura dos arquivos de deploy

| Arquivo | Finalidade |
|---------|------------|
| `Dockerfile` | Build + servidor Nginx para Easypanel |
| `nginx.conf` | Config do Nginx (SPA routing, gzip, cache) |
| `public/.htaccess` | Config do Apache para Hostinger |
| `.dockerignore` | Exclui arquivos desnecessários do Docker |

---

## 🔧 Problemas comuns

**Página em branco após deploy no Hostinger:**
- Verifique se o `.htaccess` foi enviado (pode estar oculto)
- Ative `mod_rewrite` no painel da Hostinger

**Rota não encontrada (404) no Easypanel:**
- Confirme que a porta configurada é `80`
- Verifique se o `nginx.conf` foi copiado corretamente

**Build falhou no Easypanel:**
- Verifique se o `Dockerfile` está na raiz do repositório
- Confirme que o `package.json` tem o script `build`
