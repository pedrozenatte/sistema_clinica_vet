# 🔧 Guia de Troubleshooting

## Problemas Comuns e Soluções

---

## ❌ Erro: "Cannot find module 'express'"

### Causa
Dependências não foram instaladas

### Solução
```bash
npm install
```

Verifique se o arquivo `package.json` existe na raiz do projeto.

---

## ❌ Erro: "Port 3000 is already in use"

### Causa
Outro processo está usando a porta 3000

### Solução

**Opção 1: Encerrar processo na porta 3000**

Windows (PowerShell):
```powershell
Get-Process -Name "node" | Stop-Process -Force
```

Windows (CMD):
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Opção 2: Usar outra porta**
```bash
set PORT=3001 && npm run dev
```

---

## ❌ Erro: "Cannot GET /"

### Causa
Servidor está rodando mas não consegue servir os arquivos estáticos

### Solução
1. Verifique se a pasta `clinica/` existe
2. Verifique se `dashboard.html` existe em `clinica/`
3. Reinicie o servidor: `npm run dev`

---

## ❌ Erro: "CORS Error" ou "Blocked by CORS"

### Causa
Frontend e backend em domínios/portas diferentes

### Solução
Já está implementado no `server.js`:
```javascript
app.use(cors());
```

Se ainda tiver problema:
1. Certifique-se de que está acessando: `http://localhost:3000`
2. Não use `127.0.0.1` ou domínio específico
3. Verifique se o servidor está realmente rodando

---

## ❌ Erro: "Cannot POST /api/clientes"

### Causa
API endpoint não encontrado ou servidor não está rodando

### Solução
1. Certifique-se de que `npm run dev` está executando
2. Verifique se vê: "✓ Servidor rodando em http://localhost:3000"
3. Teste com: `curl http://localhost:3000/api/clientes`

---

## ❌ Erro: "Database locked"

### Causa
Arquivo `clinica.db` está corrompido ou travado

### Solução
1. Encerre o servidor (Ctrl+C)
2. Delete o arquivo do banco:
   ```bash
   rm backend/database/clinica.db
   ```
3. Reinicie o servidor:
   ```bash
   npm run dev
   ```
4. Repovoar com dados:
   ```bash
   npm run seed
   ```

---

## ❌ Notificações não aparecem

### Causa
Arquivo `utils.js` não está sendo carregado corretamente

### Solução
1. Verifique se `<script src="utils.js"></script>` está em `cadastro.html` e `agendamentos.html`
2. Verifique se `utils.js` existe em `/clinica/utils.js`
3. Verifique o console do navegador (F12) para erros

---

## ❌ Tabela não carrega dados

### Causa
Página não está fazendo requisição à API ou campos HTML estão errados

### Solução
1. Abra o Console (F12)
2. Verifique se há erros
3. Verifique se `carregarCadastros()` está sendo chamado
4. Teste manualmente:
   ```javascript
   fetch('http://localhost:3000/api/clientes')
     .then(r => r.json())
     .then(d => console.log(d))
   ```

---

## ❌ Formulário não salva

### Causa
Campos têm nomes incorretos ou função `salvarCliente` não está vinculada

### Solução
1. Verifique os atributos `name` dos campos HTML
2. Compare com os nomes em `cadastro.js`
3. Verifique se `<button type="submit">` está no formulário
4. Verifique console para erros

---

## ❌ Máscaras não funcionam

### Causa
Arquivo `utils.js` não está carregado ou seletores estão incorretos

### Solução
1. Verifique o console para erros de seletor
2. Confirme que `adicionarMascaras()` está sendo chamada
3. Verifique os seletores CSS nos campos:
   ```javascript
   // Correto:
   document.querySelector('input[placeholder="000.000.000-00"]')
   
   // Incorreto:
   document.querySelector('input.cpf')  // sem classe
   ```

---

## ❌ Filtros não funcionam

### Causa
Seletores dos filtros estão errados ou `filtrarCadastros()` não está vinculada

### Solução
1. Verifique IDs dos filtros:
   - `#fTipo`
   - `#fSituacao`
   - `#fBusca`
2. Verifique se estão no HTML com IDs corretos
3. Verifique console para erros

---

## ❌ "Cliente não encontrado" ao buscar

### Causa
Cliente não existe no banco de dados

### Solução
1. Crie um cliente através do formulário
2. Ou execute `npm run seed` para popular com dados de exemplo
3. Verifique se o nome está correto

---

## ❌ "Conflito de horários" ao agendar

### Causa
Veterinário já tem agendamento no mesmo horário

### Solução
1. Escolha outro horário
2. Escolha outro veterinário
3. Escolha outra data

---

## ⚠️ Sem dados após `npm run seed`

### Causa
Seed não executou corretamente

### Solução
1. Verifique se não há erro no console
2. Delete o banco: `rm backend/database/clinica.db`
3. Execute novamente: `npm run seed`
4. Verifique se ver: "✅ Seed concluído com sucesso!"

---

## ⚠️ "Pet não encontrado" ao agendar

### Causa
Pet foi criado mas não está carregando automaticamente

### Solução
1. Verifique se o cliente está correto
2. Certifique-se de que o pet está associado ao cliente
3. Tente digitar exatamente o nome do pet
4. Recarregue a página

---

## ⚠️ Página em branco

### Causa
Erro JavaScript não tratado

### Solução
1. Abra o Console (F12)
2. Veja a mensagem de erro exata
3. Pesquise pelo erro neste documento
4. Se necessário, consulte `DOCUMENTACAO.md`

---

## 🔍 Debug Mode

### Ativar logs do Sequelize

No `backend/database/connection.js`, mude:
```javascript
logging: false  // Mude para:
logging: console.log
```

Isso mostrará todas as queries SQL no console.

---

## 🔍 Testar API com cURL

### Listar clientes
```bash
curl http://localhost:3000/api/clientes
```

### Criar cliente
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{"codigo":"TEST","nome":"Teste","tipo_pessoa":"Física","situacao":"Liberado"}'
```

### Se não funcionar com cURL

Use a página do navegador:
1. Acesse `http://localhost:3000/cadastro.html`
2. Abra o Console (F12)
3. Teste:
```javascript
await fetch('http://localhost:3000/api/clientes').then(r => r.json()).then(console.log)
```

---

## 📞 Checklist de Diagnóstico

Se algo não funcionar, verifique:

### Backend
- [ ] Node.js está instalado? (`node -v`)
- [ ] npm está instalado? (`npm -v`)
- [ ] `npm install` foi executado?
- [ ] Servidor está rodando? (`npm run dev`)
- [ ] Vê mensagem "✓ Servidor rodando"?
- [ ] Porta 3000 está disponível?
- [ ] Arquivo `package.json` existe?

### Banco de Dados
- [ ] Arquivo `clinica.db` existe em `backend/database/`?
- [ ] Se não existe, execute `npm run seed`
- [ ] Banco não está corrompido? Tente deletar e recriar
- [ ] Sequelize está sincronizado? Verifique logs

### Frontend
- [ ] Arquivos HTML estão em `/clinica/`?
- [ ] Arquivos CSS estão em `/clinica/`?
- [ ] Arquivos JS estão em `/clinica/`?
- [ ] `utils.js` existe?
- [ ] `cadastro.js` existe?
- [ ] `agendamentos.js` existe?
- [ ] Scripts estão importados no HTML?

### Navegador
- [ ] Está acessando `http://localhost:3000`?
- [ ] Console está aberto (F12)?
- [ ] Não há erros vermelhos no console?
- [ ] Tentou fazer refresh (Ctrl+R)?
- [ ] Limpou cache (Ctrl+Shift+Delete)?

---

## 📝 Relatório de Bug

Se encontrar um bug não listado aqui:

1. **Anote a mensagem de erro exata**
2. **Abra o Console (F12) e copie o erro**
3. **Tente reproduzir o problema**
4. **Verifique a documentação** (`DOCUMENTACAO.md`)
5. **Crie uma issue no GitHub** com:
   - Título descritivo
   - Passos para reproduzir
   - Mensagem de erro exata
   - Sistema operacional
   - Versão do Node.js

---

## 💡 Dicas Gerais

1. **Sempre verifique o Console** (F12) para erros
2. **Reinicie o servidor** quando mudar código
3. **Limpe o cache do navegador** se mudar frontend
4. **Use `npm run seed`** para resetar dados
5. **Leia as notificações** - elas indicam sucesso/erro
6. **Verifique Network** (F12 > Network) para ver requisições HTTP

---

## 🎯 Próximos Passos se Persistir o Erro

1. Verifique se está usando a versão correta do Node.js (14+)
2. Tente em outro navegador
3. Tente em outro computador (se possível)
4. Verifique se não há conflito de firewall
5. Consulte a documentação do Express/Sequelize/SQLite

---

**Última Atualização:** 14 de Dezembro de 2025

Se este documento não resolver seu problema, consulte:
- `DOCUMENTACAO.md` - Documentação técnica
- `ARQUITETURA.md` - Diagramas de fluxo
- `EXEMPLOS_API.md` - Exemplos de requisições
