# Sistema de Gestão para Clínicas Veterinárias  
**SCC0219 - Introdução ao Desenvolvimento Web**  
Profa. Dra. Bruna Carolina Rodrigues da Cunha  
Primeira entrega: 15/09/2025  

## 👥 Membros
- Guilherme Augusto Fincatti da Silva — 13676986  
- Marco Antonio Gaspar Garcia — 11833581  
- Pedro Guilherme de Barros Zenatte — 13676919  

Alunos de Engenharia de Computação da USP São Carlos.  

| [<img loading="lazy" src="https://avatars.githubusercontent.com/u/117095562?v=4" width=115><br><sub>Guilherme Fincatti</sub>](https://github.com/GuilhermeFincatti) | [<img loading="lazy" src="https://avatars.githubusercontent.com/u/105023846?v=4" width=115><br><sub>Marco Garcia</sub>](https://github.com/marcogarcia2) | [<img loading="lazy" src="https://avatars.githubusercontent.com/u/107310680?v=4" width=115><br><sub>Pedro Zenatte</sub>](https://github.com/pedrozenatte) |
| :---: | :---: | :---: |  

---

## 📌 Descrição
A ideia central é fornecer um **site gratuito** de organização e gerenciamento para veterinários e clínicas veterinárias.  
O sistema visa **facilitar a gestão de cadastros, atendimentos, internações e prontuários**, além de **organizar agendamentos** e fornecer **relatórios em tempo real**.  

---

## ⚙️ Requisitos  
Com base na conversa com a cliente, levantamos os seguintes requisitos iniciais:  

### Funcionais
- [ ] Cadastro de animais e tutores.  
- [ ] Agendamento de consultas e procedimentos.  
- [ ] Registro de atendimentos realizados.  
- [ ] Gerenciamento de internações.  
- [ ] Emissão e consulta de prontuários.  
- [ ] Painel de indicadores (número de atendimentos, tempo médio, status etc.).  

### Não Funcionais
- [ ] Interface responsiva para desktop e mobile.  
- [ ] Navegação simples e intuitiva.  

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** e **CSS3** → estrutura e estilo  
- **JavaScript (ES6+)** → interatividade e lógica  

### Backend ✨ NOVO
- **Node.js** → runtime JavaScript
- **Express.js** → framework web  
- **Sequelize** → ORM para banco de dados  
- **SQLite3** → banco de dados relacional  
- **CORS** → comunicação frontend-backend  

### Versionamento
- **Git & GitHub** → versionamento e colaboração  

---

## 🚀 Como Começar

### Instalação Rápida

1. **Instalar dependências:**
```bash
npm install
```

2. **Criar banco com dados de exemplo (opcional):**
```bash
npm run seed
```

3. **Iniciar servidor:**
```bash
npm run dev
```

4. **Acessar a aplicação:**
```
http://localhost:3000
```

### 📚 Documentação
- **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** - Guia de início rápido
- **[DOCUMENTACAO.md](DOCUMENTACAO.md)** - Documentação técnica completa
- **[EXEMPLOS_API.md](EXEMPLOS_API.md)** - Exemplos de requisições
- **[RESUMO.md](RESUMO.md)** - Resumo da implementação

---

## ✅ Status de Implementação

### Funcionalidades Concluídas ✓

#### Cadastro de Clientes e Pets
- [x] Criar novo cliente (Física/Jurídica)
- [x] Cadastrar múltiplos pets por cliente
- [x] Editar informações de cliente e pet
- [x] Deletar cliente (cascata para pets)
- [x] Inativar cliente
- [x] Lista com filtros e busca
- [x] Validações completas

#### Agendamentos
- [x] Marcar consultas e procedimentos
- [x] Validação de conflito de horários
- [x] Filtro por período e status
- [x] Busca por cliente, pet, serviço
- [x] Cancelamento de agendamento
- [x] Próximos agendamentos
- [x] Agenda geral com detalhes

#### API RESTful
- [x] Endpoints para clientes (CRUD)
- [x] Endpoints para pets (CRUD)
- [x] Endpoints para agendamentos (CRUD)
- [x] Endpoints para veterinários
- [x] Endpoints para serviços
- [x] Tratamento de erros
- [x] Validações de dados

#### Banco de Dados
- [x] Modelos relacionais (Cliente, Pet, Agendamento, Veterinário, Serviço)
- [x] Relacionamentos (1:N)
- [x] Soft delete para veterinários e serviços
- [x] Integridade referencial
- [x] Seed com dados de exemplo

### Próximas Melhorias (Sugerido)
- [ ] Registro de atendimentos realizados
- [ ] Gerenciamento de internações  
- [ ] Prontuários e histórico médico
- [ ] Painel de indicadores/dashboard
- [ ] Responsividade mobile completa
- [ ] Autenticação e controle de acesso
- [ ] Relatórios em PDF
- [ ] Notificações (email/SMS)

---

## 🚀 Próximos Passos
- Modularizar componentes repetidos (barra lateral, cabeçalho, rodapé).  
- Implementar funcionalidades com **JavaScript**:  
  - Validação de formulários.  
  - Listagem dinâmica de dados.  
  - Filtros de pesquisa e ordenação.  
- Iniciar a integração com dados **mockados em JSON**.  
- Desenvolver protótipo inicial do **painel interativo** com gráficos.  

---

## 📸 Protótipo
![screenshot do dashboard](./images/dashboard.png)  
