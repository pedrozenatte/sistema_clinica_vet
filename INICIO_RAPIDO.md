# 🚀 Guia de Início Rápido

## Instalação e Execução

### 1️⃣ Instalar Dependências

Abra o terminal na raiz do projeto e execute:

```bash
npm install
```

Isso instalará:
- Express.js (servidor web)
- Sequelize (ORM para banco de dados)
- SQLite3 (banco de dados)
- CORS (para comunicação frontend-backend)
- Nodemon (ferramenta de desenvolvimento)

### 2️⃣ Opção A: Iniciar com Dados de Exemplo (Recomendado)

Para criar o banco de dados com dados de exemplo:

```bash
npm run seed
```

Isso criará:
- 4 veterinários
- 6 serviços
- 6 clientes
- 6 pets
- 3 agendamentos de exemplo

### 2️⃣ Opção B: Iniciar com Banco Vazio

Se preferir começar do zero, pule o seed e vá direto ao passo 3.

### 3️⃣ Iniciar o Servidor

**Para Desenvolvimento (com auto-reload):**
```bash
npm run dev
```

**Para Produção:**
```bash
npm start
```

### 4️⃣ Acessar a Aplicação

Abra seu navegador e acesse:
```
http://localhost:3000
```

## 📝 Funcionalidades Implementadas

### ✅ Página de Cadastro (`/cadastro.html`)

**O que você pode fazer:**

1. **Criar Novo Cliente**
   - Clique em "Novo" ou limpe o formulário
   - Preencha os dados do tutor (código, nome, contato, endereço)
   - Preencha os dados do pet (nome, espécie, raça, etc)
   - Clique em "Salvar Cadastro"

2. **Visualizar/Editar Cliente**
   - Clique em "Ver" ou "Editar" na lista
   - O formulário será preenchido com os dados
   - Modifique o que precisar
   - Clique em "Salvar Cadastro" para atualizar

3. **Deletar Cliente**
   - Carregue um cliente
   - Clique em "Excluir"
   - Confirme a exclusão

4. **Inativar Cliente**
   - Carregue um cliente
   - Clique em "Inativar"
   - O cliente não aparecerá mais na lista de cadastros ativos

5. **Filtrar Cadastros**
   - Use os filtros na tabela:
     - Tipo: Física/Jurídica
     - Situação: Ativo/Inativo
     - Busca: Digite nome, email, cidade, CPF, etc

**Campos Obrigatórios:**
- Código (único)
- Nome
- Tipo de Pessoa
- Nome do Pet
- Espécie do Pet

### ✅ Página de Agendamentos (`/agendamentos.html`)

**O que você pode fazer:**

1. **Criar Novo Agendamento**
   - Clique em "Novo"
   - Digite o nome do tutor (busca automática)
   - Digite o nome do pet
   - Selecione o serviço desejado
   - Selecione o veterinário
   - Escolha data e hora
   - Clique em "Agendar"

2. **Validações Automáticas**
   - ✓ Não permite agendar dois atendimentos no mesmo horário para o mesmo veterinário
   - ✓ Obriga seleção válida de cliente e pet
   - ✓ Valida todos os campos obrigatórios

3. **Visualizar/Editar Agendamento**
   - Clique em uma linha da tabela "Agenda de Agendamentos"
   - Modifique os dados
   - Clique em "Salvar" para atualizar

4. **Cancelar Agendamento**
   - Carregue um agendamento
   - Clique em "Cancelar"
   - O status mudará para "Cancelado"

5. **Filtrar Agendamentos**
   - Use os filtros no topo:
     - De / Até: Filtrar por período
     - Status: Agendado, Confirmado, Realizado, Cancelado
     - Busca: Pet, tutor, serviço, veterinário

**Campos Obrigatórios:**
- Tutor (cliente válido)
- Pet (pertencente ao cliente)
- Veterinário
- Serviço
- Data
- Hora

## 🐛 Solução de Problemas

### Erro: "CORS Error" ou "Erro de conexão"
- Certifique-se de que o servidor está rodando em http://localhost:3000
- Execute: `npm run dev`

### Erro: "Porta 3000 já em uso"
- Encerre o processo na porta 3000 ou execute:
  ```bash
  npm start -- --port 3001
  ```

### Banco de dados não aparece
- O arquivo `clinica.db` é criado automaticamente em `/backend/database/`
- Se precisar resetar, delete o arquivo e execute `npm run seed` novamente

### Notificações não aparecem
- Verifique se você tem permissão para aceitar notificações do navegador
- A notificação aparecerá no canto superior direito por 3 segundos

## 📂 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `backend/server.js` | Servidor principal |
| `backend/database/clinica.db` | Banco de dados (gerado) |
| `backend/models/*` | Modelos de dados |
| `clinica/cadastro.html` | Página de cadastro |
| `clinica/cadastro.js` | Lógica da página de cadastro |
| `clinica/agendamentos.html` | Página de agendamentos |
| `clinica/agendamentos.js` | Lógica da página de agendamentos |
| `clinica/utils.js` | Funções auxiliares (API, máscaras, etc) |

## 🔄 Fluxo de Dados

```
Frontend (HTML/JS)
    ↓ (Requisição HTTP)
Backend (Express)
    ↓ (Sequelize)
Banco de Dados (SQLite)
    ↓ (Resposta JSON)
Frontend (Atualiza a página)
```

## ✨ Recursos Extras

### Máscaras de Entrada
- **CPF/CNPJ**: 123.456.789-00 ou 12.345.678/0001-90
- **Telefone**: (19) 1234-5678 ou (19) 99999-9999
- **CEP**: 13800-000

### Formatação
- **Datas**: 25/12/2025
- **Horas**: 14:30
- **Valores**: R$ 150,00

### Validações
- Código único para clientes
- CRMV único para veterinários
- Email válido (formato)
- Pet deve pertencer ao cliente
- Sem conflito de horários

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se todos os passos foram seguidos
2. Certifique-se de que o Node.js está instalado (versão 14+)
3. Delete `node_modules` e execute `npm install` novamente
4. Se o banco ficar corrompido, delete `backend/database/clinica.db`

---

**Pronto para começar!** 🎉

Qualquer dúvida, consulte a `DOCUMENTACAO.md` para informações completas sobre a API e funcionalidades.
