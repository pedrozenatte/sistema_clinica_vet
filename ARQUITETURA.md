# 🏗️ Arquitetura do Sistema

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      FRONTEND                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │  cadastro.   │  │ agendamentos.│  │  dashboard.  │    │  │
│  │  │  html/css/js │  │  html/css/js │  │  html/css/js │    │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │  │
│  │         │                 │                 │             │  │
│  │         └─────────────────┼─────────────────┘             │  │
│  │                           │                               │  │
│  │                    ┌──────▼──────┐                         │  │
│  │                    │  utils.js    │                         │  │
│  │                    │ (API calls,  │                         │  │
│  │                    │  máscaras,   │                         │  │
│  │                    │ notificações)│                         │  │
│  │                    └──────┬───────┘                         │  │
│  └───────────────────────────┼─────────────────────────────────┘  │
│                              │                                    │
│          HTTP/JSON (AJAX)   │                                    │
│                              ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌──────────────────────────────────────────────────┐
    │            SERVER (Node.js/Express)             │
    │              localhost:3000                      │
    │                                                  │
    │  ┌────────────────────────────────────────┐    │
    │  │        Middleware                       │    │
    │  │  - CORS                                │    │
    │  │  - Body Parser                         │    │
    │  │  - Static Files                        │    │
    │  └────────────────────────────────────────┘    │
    │                                                  │
    │  ┌────────────────────────────────────────┐    │
    │  │        Routes (/api/...)                │    │
    │  │  ┌────────────────────────────────┐   │    │
    │  │  │ /clientes      [CRUD]          │   │    │
    │  │  │ /pets          [CRUD]          │   │    │
    │  │  │ /agendamentos  [CRUD + filters]│   │    │
    │  │  │ /veterinarios  [CRUD]          │   │    │
    │  │  │ /servicos      [CRUD]          │   │    │
    │  │  └────────────────────────────────┘   │    │
    │  └────────────────────────────────────────┘    │
    │                                                  │
    │  ┌────────────────────────────────────────┐    │
    │  │        Controllers                      │    │
    │  │  - clienteController                  │    │
    │  │  - petController                      │    │
    │  │  - agendamentoController              │    │
    │  │  - veterinarioController              │    │
    │  │  - servicoController                  │    │
    │  └────────────────────────────────────────┘    │
    │                                                  │
    │  ┌────────────────────────────────────────┐    │
    │  │        Sequelize ORM                    │    │
    │  │  ┌────────────────────────────────┐   │    │
    │  │  │ Models:                         │   │    │
    │  │  │ - Cliente                      │   │    │
    │  │  │ - Pet                          │   │    │
    │  │  │ - Agendamento                  │   │    │
    │  │  │ - Veterinario                  │   │    │
    │  │  │ - Servico                      │   │    │
    │  │  └────────────────────────────────┘   │    │
    │  └────────────────────────────────────────┘    │
    └────────────────────┬───────────────────────────┘
                         │
                         │ SQL
                         ▼
    ┌──────────────────────────────────────────────────┐
    │         SQLite Database                          │
    │         (clinica.db)                             │
    │                                                  │
    │  ┌──────────┬──────────┬──────────┐             │
    │  │          │          │          │             │
    │  ▼          ▼          ▼          ▼             │
    │ clientes  pets    veterinarios  servicos        │
    │  │                              │               │
    │  └──────────────┬───────────────┘               │
    │                 │                               │
    │                 ▼                               │
    │            agendamentos                         │
    │                                                  │
    └──────────────────────────────────────────────────┘
```

---

## Fluxo de Dados

### 1. Criar Cliente

```
Frontend (cadastro.html)
    ↓
Usuário preenche formulário e clica "Salvar"
    ↓
JavaScript recolhe dados do formulário
    ↓
utils.js - fetchAPI() envia POST
    ↓
Backend - POST /api/clientes
    ↓
clienteController.js - createCliente()
    ↓
Validação de dados
    ↓
Sequelize - Cliente.create()
    ↓
SQLite - INSERT INTO clientes
    ↓
Resposta JSON (201 Created)
    ↓
Frontend - mostrarNotificacao()
    ↓
Recarrega lista de clientes
```

### 2. Criar Agendamento

```
Frontend (agendamentos.html)
    ↓
Usuário digita nome do tutor
    ↓
JavaScript faz busca automática
    ↓
agendamentos.js - buscarClientePorNome()
    ↓
utils.js - fetchAPI() GET /clientes/search
    ↓
Backend - clienteController - searchClienteByCodigo()
    ↓
Sequelize - Cliente.findOne()
    ↓
SQLite - SELECT FROM clientes WHERE codigo = ?
    ↓
Frontend carrega pets do cliente
    ↓
agendamentos.js - buscarPetPorNome()
    ↓
utils.js - fetchAPI() GET /pets/cliente/:id
    ↓
Backend - petController - getPetsByCliente()
    ↓
Sequelize - Pet.findAll(where: {cliente_id})
    ↓
SQLite - SELECT FROM pets WHERE cliente_id = ?
    ↓
Frontend preenche dados
    ↓
Usuário clica "Agendar"
    ↓
agendamentos.js - salvarAgendamento()
    ↓
Validação de conflito de horários
    ↓
utils.js - fetchAPI() POST /agendamentos
    ↓
Backend - POST /api/agendamentos
    ↓
agendamentoController - createAgendamento()
    ↓
Validações (cliente, pet, vet, serviço)
    ↓
Verificar conflito (Agendamento.findOne() mesmo horário)
    ↓
Sequelize - Agendamento.create()
    ↓
SQLite - INSERT INTO agendamentos
    ↓
Resposta JSON (201 Created)
    ↓
Frontend - mostrarNotificacao() sucesso
    ↓
Recarrega lista de agendamentos
```

---

## Relacionamentos do Banco de Dados

```
Cliente (1) ──┐
              ├──> (N) Pet
              │
              └──> (N) Agendamento

Agendamento (N) ──┬──> (1) Cliente
                  ├──> (1) Pet
                  ├──> (1) Veterinário
                  └──> (1) Serviço

Veterinário (1) ──> (N) Agendamento

Serviço (1) ──> (N) Agendamento
```

### Chaves Estrangeiras

```sql
-- Pet FK
ALTER TABLE pets ADD FOREIGN KEY (cliente_id) 
  REFERENCES clientes(id) ON DELETE CASCADE;

-- Agendamento FKs
ALTER TABLE agendamentos ADD FOREIGN KEY (cliente_id) 
  REFERENCES clientes(id) ON DELETE CASCADE;

ALTER TABLE agendamentos ADD FOREIGN KEY (pet_id) 
  REFERENCES pets(id) ON DELETE CASCADE;

ALTER TABLE agendamentos ADD FOREIGN KEY (veterinario_id) 
  REFERENCES veterinarios(id) ON DELETE RESTRICT;

ALTER TABLE agendamentos ADD FOREIGN KEY (servico_id) 
  REFERENCES servicos(id) ON DELETE RESTRICT;
```

---

## Stack Tecnológico

### Frontend
```
HTML5
  ↓
  └─ CSS3 (Estilo)
      └─ JavaScript ES6+
          ├─ DOM Manipulation
          ├─ Fetch API
          ├─ Event Listeners
          └─ Local/Sync Masks
```

### Backend
```
Node.js
  ↓
  └─ Express.js (Framework)
      ├─ Routing
      ├─ Middleware (CORS, JSON)
      ├─ Controllers (Lógica)
      └─ Error Handling

Sequelize (ORM)
  ├─ Models
  ├─ Validations
  ├─ Associations
  └─ Migrations

SQLite3
  ├─ Tables
  ├─ Indexes
  └─ Relations
```

---

## Fluxo de Requisição HTTP

### Request (Cliente → Servidor)

```
POST /api/clientes HTTP/1.1
Host: localhost:3000
Content-Type: application/json
Content-Length: 250

{
  "codigo": "00301",
  "tipo_pessoa": "Física",
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "(19) 9999-1111",
  "cpf_cnpj": "123.456.789-00",
  "situacao": "Liberado"
}
```

### Response (Servidor → Cliente)

```
HTTP/1.1 201 Created
Content-Type: application/json

{
  "mensagem": "Cliente criado com sucesso",
  "cliente": {
    "id": 7,
    "codigo": "00301",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "situacao": "Liberado",
    "createdAt": "2025-12-14T10:30:00.000Z",
    "updatedAt": "2025-12-14T10:30:00.000Z"
  }
}
```

---

## Padrões de Design Utilizados

### 1. MVC (Model-View-Controller)
```
Model  → Banco de dados (Sequelize)
View   → Frontend (HTML/CSS/JS)
Control→ Controllers (Node.js/Express)
```

### 2. REST (REpresentational State Transfer)
```
GET    /api/clientes     (Listar)
GET    /api/clientes/1   (Obter)
POST   /api/clientes     (Criar)
PUT    /api/clientes/1   (Atualizar)
DELETE /api/clientes/1   (Deletar)
```

### 3. AJAX (Asynchronous JavaScript and XML)
```javascript
const response = await fetch('/api/clientes');
// Sem recarregar a página
```

### 4. Soft Delete
```javascript
// Ao invés de DELETE, atualizar ativo = false
await Veterinario.update({ ativo: false });
```

---

## Segurança

### Frontend
- [x] Validação de entrada
- [x] Escape de dados
- [x] CSRF tokens (não implementado, recomendado)

### Backend
- [x] Validação de dados
- [x] Tratamento de erros
- [x] SQL injection prevention (Sequelize)
- [x] CORS habilitado
- [ ] Autenticação (não implementado)
- [ ] Rate limiting (não implementado)
- [ ] HTTPS (não implementado)

---

## Performance

### Otimizações Implementadas
- [x] Associations eager loading
- [x] Select apenas campos necessários
- [x] Filtros no servidor
- [x] Soft delete (não remove dados)

### Otimizações Sugeridas
- [ ] Paginação
- [ ] Cache
- [ ] Índices adicionais
- [ ] Compression gzip

---

## Escalabilidade

### Pronto para
- [x] Múltiplos clientes simultâneos
- [x] Centenas de registros
- [x] Múltiplos veterinários

### Pode melhorar com
- [ ] Load balancing
- [ ] Database replication
- [ ] Microserviços
- [ ] Message queues
- [ ] Caching layer (Redis)
