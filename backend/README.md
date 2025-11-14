# Sistema Clínica Veterinária - Backend

## Instalação

1. Instale as dependências:
```bash
npm install
```

## Executar

### Desenvolvimento (com auto-reload):
```bash
npm run dev
```

### Produção:
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## Estrutura do Projeto

- `/models` - Modelos Sequelize
- `/controllers` - Lógica de negócio
- `/routes` - Definição das rotas da API
- `/database` - Configuração do banco de dados
- `/backend` - Servidor Express

## Endpoints da API

### Clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes` - Listar todos os clientes
- `GET /api/clientes/search?codigo=...` - Buscar cliente por código
- `GET /api/clientes/:id` - Obter cliente por ID
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

### Pets
- `POST /api/pets` - Criar pet
- `GET /api/pets` - Listar todos os pets
- `GET /api/pets/cliente/:cliente_id` - Listar pets de um cliente
- `GET /api/pets/:id` - Obter pet por ID
- `PUT /api/pets/:id` - Atualizar pet
- `DELETE /api/pets/:id` - Deletar pet

### Agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos` - Listar agendamentos (com filtros opcionais: status, data_inicio, data_fim)
- `GET /api/agendamentos/:id` - Obter agendamento por ID
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Deletar agendamento
- `GET /api/agendamentos/cliente/:cliente_id` - Listar agendamentos de um cliente
- `GET /api/agendamentos/veterinario/:veterinario_id` - Listar agendamentos de um veterinário

### Veterinários
- `POST /api/veterinarios` - Criar veterinário
- `GET /api/veterinarios` - Listar veterinários ativos
- `GET /api/veterinarios/:id` - Obter veterinário por ID
- `PUT /api/veterinarios/:id` - Atualizar veterinário
- `DELETE /api/veterinarios/:id` - Desativar veterinário

### Serviços
- `POST /api/servicos` - Criar serviço
- `GET /api/servicos` - Listar serviços ativos
- `GET /api/servicos/:id` - Obter serviço por ID
- `PUT /api/servicos/:id` - Atualizar serviço
- `DELETE /api/servicos/:id` - Desativar serviço

## Banco de Dados

O banco de dados SQLite é armazenado em `/database/clinica.db`
