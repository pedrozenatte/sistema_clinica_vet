# Sistema de Clínica Veterinária

Sistema completo de gerenciamento para clínicas veterinárias com frontend responsivo e backend robusto.

## 📋 Características

- **Cadastro de Clientes e Pets** - Gerenciamento completo de tutores e animais
- **Agendamentos** - Sistema de marcação de consultas com validação de horários
- **Gerenciamento de Veterinários** - Controle de profissionais disponíveis
- **Catálogo de Serviços** - Listagem de serviços oferecidos
- **Interface Intuitiva** - Design limpo e responsivo
- **API RESTful** - Backend bem estruturado com Express e Sequelize

## 🚀 Começando

### Pré-requisitos

- Node.js 14+ instalado
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/pedrozenatte/sistema_clinica_vet.git
cd sistema_clinica_vet
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:

**Desenvolvimento (com hot-reload):**
```bash
npm run dev
```

**Produção:**
```bash
npm start
```

4. Acesse a aplicação:
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
sistema_clinica_vet/
├── backend/
│   ├── database/
│   │   ├── connection.js      # Configuração Sequelize
│   │   ├── index.js           # Inicialização do BD
│   │   └── clinica.db         # Arquivo SQLite (gerado)
│   ├── models/
│   │   ├── Cliente.js
│   │   ├── Pet.js
│   │   ├── Agendamento.js
│   │   ├── Veterinario.js
│   │   └── Servico.js
│   ├── controllers/
│   │   ├── clienteController.js
│   │   ├── petController.js
│   │   ├── agendamentoController.js
│   │   ├── veterinarioController.js
│   │   └── servicoController.js
│   ├── routes/
│   │   ├── clienteRoutes.js
│   │   ├── petRoutes.js
│   │   ├── agendamentoRoutes.js
│   │   ├── veterinarioRoutes.js
│   │   └── servicoRoutes.js
│   ├── server.js              # Servidor principal
│   └── README.md
├── clinica/                   # Frontend (HTML/CSS/JS)
│   ├── dashboard.html
│   ├── cadastro.html
│   ├── cadastro.js
│   ├── cadastro.css
│   ├── agendamentos.html
│   ├── agendamentos.js
│   ├── agendamentos.css
│   ├── utils.js              # Funções utilitárias
│   └── ... (outras páginas)
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Clientes
- `POST /api/clientes` - Criar cliente
- `GET /api/clientes` - Listar clientes
- `GET /api/clientes/search?codigo=...` - Buscar por código
- `GET /api/clientes/:id` - Obter cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

### Pets
- `POST /api/pets` - Criar pet
- `GET /api/pets` - Listar pets
- `GET /api/pets/cliente/:cliente_id` - Listar pets de um cliente
- `GET /api/pets/:id` - Obter pet
- `PUT /api/pets/:id` - Atualizar pet
- `DELETE /api/pets/:id` - Deletar pet

### Agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos` - Listar agendamentos
- `GET /api/agendamentos/:id` - Obter agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Deletar agendamento
- `GET /api/agendamentos/cliente/:cliente_id` - Agendamentos de um cliente
- `GET /api/agendamentos/veterinario/:veterinario_id` - Agenda de um veterinário

### Veterinários
- `POST /api/veterinarios` - Criar veterinário
- `GET /api/veterinarios` - Listar veterinários ativos
- `GET /api/veterinarios/:id` - Obter veterinário
- `PUT /api/veterinarios/:id` - Atualizar veterinário
- `DELETE /api/veterinarios/:id` - Desativar veterinário

### Serviços
- `POST /api/servicos` - Criar serviço
- `GET /api/servicos` - Listar serviços ativos
- `GET /api/servicos/:id` - Obter serviço
- `PUT /api/servicos/:id` - Atualizar serviço
- `DELETE /api/servicos/:id` - Desativar serviço

## 💾 Banco de Dados

O sistema utiliza **SQLite** com **Sequelize** ORM.

### Modelos e Relacionamentos

```
Cliente (1) -----> (N) Pet
  ↓
  └--------> (N) Agendamento <-- Veterinário
                      ↓
                    Serviço
```

### Campos Principais

**Cliente:**
- id, codigo, tipo_pessoa, nome, email, telefone, sexo
- data_nascimento, cpf_cnpj
- Endereço: rua, numero, bairro, cep, cidade, estado
- situacao (Liberado/Inativo/Bloqueado)

**Pet:**
- id, cliente_id, nome, especie, raca, sexo
- data_nascimento, peso, cor, microchip
- alergias, observacoes

**Agendamento:**
- id, cliente_id, pet_id, veterinario_id, servico_id
- data_agendamento, hora_inicio, hora_fim
- status (Agendado/Confirmado/Cancelado/Concluído)
- observacoes

**Veterinário:**
- id, nome, crmv (unique), email, telefone
- especialidade, ativo

**Serviço:**
- id, nome, descricao, duracao_minutos, valor, ativo

## 🎨 Frontend

### Páginas Implementadas com Funcionalidade

1. **Cadastro** (`cadastro.html`)
   - Criar/atualizar clientes e pets
   - Lista com filtros (tipo, situação)
   - Busca por nome, email, cidade
   - Botões de ação (Ver, Editar, Excluir)

2. **Agendamentos** (`agendamentos.html`)
   - Criar/atualizar agendamentos
   - Validação de conflito de horários
   - Próximos agendamentos
   - Agenda com filtros por data e status
   - Busca por pet, tutor ou serviço

### Funcionalidades JavaScript

- **utils.js** - Funções auxiliares
  - `fetchAPI()` - Requisições HTTP
  - `mostrarNotificacao()` - Notificações ao usuário
  - Máscaras de entrada (CPF, telefone, CEP)
  - Formatadores de data/hora
  - Manipulação de formulários

- **cadastro.js** - Página de cadastros
  - Carregar/exibir lista de clientes
  - Criar novo cliente e pet
  - Atualizar dados existentes
  - Deletar/inativar cliente
  - Filtros em tempo real

- **agendamentos.js** - Página de agendamentos
  - Buscar cliente por nome/código
  - Listar pets do cliente
  - Criar agendamento com validação
  - Confirmar/cancelar agendamento
  - Filtros por data, status, veterinário

## 🛠️ Tecnologias Utilizadas

**Backend:**
- Node.js
- Express.js
- Sequelize (ORM)
- SQLite3
- CORS

**Frontend:**
- HTML5
- CSS3
- JavaScript ES6+
- Fetch API

## 📝 Scripts Disponíveis

```bash
npm start   # Iniciar servidor em produção
npm run dev # Iniciar servidor em desenvolvimento com nodemon
```

## 🔍 Funcionalidades Principais

### Cadastro de Clientes
- Validação de código único
- Tipos: Pessoa Física e Jurídica
- Endereço completo
- Suporte para múltiplos pets por cliente
- Situação do cliente (Liberado/Inativo/Bloqueado)

### Gerenciamento de Pets
- Associação automática ao cliente
- Dados de saúde (alergias, microchip)
- Histórico de dados pessoais

### Sistema de Agendamentos
- Validação de conflito de horários
- Cálculo de duração baseado no serviço
- Filtros avançados por período
- Status customizável

## 🚨 Validações Implementadas

- Código de cliente único
- Email válido
- Pet obrigatoriamente vinculado a cliente
- Horário de agendamento sem conflitos
- CRMV único para veterinários
- Nome único para serviços

## 📊 Exemplos de Requisição

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "00001",
    "tipo_pessoa": "Física",
    "nome": "João Silva",
    "email": "joao@email.com",
    "telefone": "(19) 1234-5678",
    "cpf_cnpj": "123.456.789-00",
    "situacao": "Liberado"
  }'
```

### Criar Agendamento
```bash
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "pet_id": 1,
    "veterinario_id": 1,
    "servico_id": 1,
    "data_agendamento": "2025-09-21",
    "hora_inicio": "10:00",
    "status": "Agendado"
  }'
```

## 🤝 Contribuindo

Sinta-se livre para fazer fork, criar branches e enviar pull requests.

## 📄 Licença

ISC

## 👨‍💻 Autor

Pedro Zenatte
- GitHub: [@pedrozenatte](https://github.com/pedrozenatte)

## ❓ Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.
