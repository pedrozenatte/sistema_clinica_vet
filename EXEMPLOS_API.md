# Exemplos de Requisições API

Exemplos de como chamar a API usando cURL ou Postman.

## 🔌 Clientes

### Criar Cliente
```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "00301",
    "tipo_pessoa": "Física",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "(19) 9999-1111",
    "sexo": "F",
    "data_nascimento": "1990-05-15",
    "cpf_cnpj": "123.456.789-00",
    "rua": "Rua das Flores",
    "numero": "100",
    "complemento": "Apto 42",
    "bairro": "Centro",
    "cidade": "Mogi Mirim",
    "estado": "SP",
    "cep": "13800-000",
    "situacao": "Liberado"
  }'
```

### Listar Clientes
```bash
curl http://localhost:3000/api/clientes
```

### Buscar Cliente por Código
```bash
curl http://localhost:3000/api/clientes/search?codigo=00301
```

### Obter Cliente por ID
```bash
curl http://localhost:3000/api/clientes/1
```

### Atualizar Cliente
```bash
curl -X PUT http://localhost:3000/api/clientes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva Santos",
    "telefone": "(19) 8888-9999"
  }'
```

### Deletar Cliente
```bash
curl -X DELETE http://localhost:3000/api/clientes/1
```

---

## 🐕 Pets

### Criar Pet
```bash
curl -X POST http://localhost:3000/api/pets \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "nome": "Luna",
    "especie": "Canina",
    "raca": "Golden Retriever",
    "sexo": "F",
    "data_nascimento": "2020-03-10",
    "peso": 28.5,
    "cor": "Dourada",
    "microchip": "985XXXXXXXXXXXXXX",
    "alergias": "Frango",
    "observacoes": "Tem medo de trovão"
  }'
```

### Listar Todos os Pets
```bash
curl http://localhost:3000/api/pets
```

### Listar Pets de um Cliente
```bash
curl http://localhost:3000/api/pets/cliente/1
```

### Obter Pet por ID
```bash
curl http://localhost:3000/api/pets/1
```

### Atualizar Pet
```bash
curl -X PUT http://localhost:3000/api/pets/1 \
  -H "Content-Type: application/json" \
  -d '{
    "peso": 29.0,
    "observacoes": "Teve alergia diagnosticada"
  }'
```

### Deletar Pet
```bash
curl -X DELETE http://localhost:3000/api/pets/1
```

---

## 🗓️ Agendamentos

### Criar Agendamento
```bash
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "pet_id": 1,
    "veterinario_id": 1,
    "servico_id": 1,
    "data_agendamento": "2025-12-25",
    "hora_inicio": "14:00",
    "hora_fim": "14:30",
    "status": "Agendado",
    "observacoes": "Primeira consulta"
  }'
```

### Listar Agendamentos
```bash
curl http://localhost:3000/api/agendamentos
```

### Listar Agendamentos com Filtros
```bash
# Por status
curl "http://localhost:3000/api/agendamentos?status=Confirmado"

# Por período
curl "http://localhost:3000/api/agendamentos?data_inicio=2025-12-01&data_fim=2025-12-31"

# Combinado
curl "http://localhost:3000/api/agendamentos?status=Confirmado&data_inicio=2025-12-01&data_fim=2025-12-31"
```

### Obter Agendamento por ID
```bash
curl http://localhost:3000/api/agendamentos/1
```

### Agendamentos de um Cliente
```bash
curl http://localhost:3000/api/agendamentos/cliente/1
```

### Agenda de um Veterinário
```bash
curl http://localhost:3000/api/agendamentos/veterinario/1

# Com filtro de data
curl "http://localhost:3000/api/agendamentos/veterinario/1?data=2025-12-25"
```

### Atualizar Agendamento
```bash
curl -X PUT http://localhost:3000/api/agendamentos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Confirmado",
    "observacoes": "Cliente confirmou presença"
  }'
```

### Deletar Agendamento
```bash
curl -X DELETE http://localhost:3000/api/agendamentos/1
```

---

## 👨‍⚕️ Veterinários

### Criar Veterinário
```bash
curl -X POST http://localhost:3000/api/veterinarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Dra. Juliana Costa",
    "crmv": "CRMV-SP-98765",
    "email": "juliana@clinica.com",
    "telefone": "(19) 3333-5555",
    "especialidade": "Homeopatia Veterinária",
    "ativo": true
  }'
```

### Listar Veterinários
```bash
curl http://localhost:3000/api/veterinarios
```

### Obter Veterinário por ID
```bash
curl http://localhost:3000/api/veterinarios/1
```

### Atualizar Veterinário
```bash
curl -X PUT http://localhost:3000/api/veterinarios/1 \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "(19) 3333-6666",
    "especialidade": "Clínica Geral e Cirurgia"
  }'
```

### Desativar Veterinário
```bash
curl -X DELETE http://localhost:3000/api/veterinarios/1
```

---

## 🏥 Serviços

### Criar Serviço
```bash
curl -X POST http://localhost:3000/api/servicos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Acupuntura Veterinária",
    "descricao": "Tratamento de dor e reabilitação",
    "duracao_minutos": 45,
    "valor": 200.00,
    "ativo": true
  }'
```

### Listar Serviços
```bash
curl http://localhost:3000/api/servicos
```

### Obter Serviço por ID
```bash
curl http://localhost:3000/api/servicos/1
```

### Atualizar Serviço
```bash
curl -X PUT http://localhost:3000/api/servicos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 220.00,
    "duracao_minutos": 50
  }'
```

### Desativar Serviço
```bash
curl -X DELETE http://localhost:3000/api/servicos/1
```

---

## 🔍 Respostas de Exemplo

### Sucesso (200/201)
```json
{
  "mensagem": "Cliente criado com sucesso",
  "cliente": {
    "id": 7,
    "codigo": "00301",
    "tipo_pessoa": "Física",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "telefone": "(19) 9999-1111",
    "situacao": "Liberado",
    "createdAt": "2025-12-14T10:30:00.000Z",
    "updatedAt": "2025-12-14T10:30:00.000Z"
  }
}
```

### Erro (400/404/500)
```json
{
  "erro": "Código de cliente já existe"
}
```

---

## 💡 Dicas

### Testar no Windows PowerShell

Para escapar as aspas duplas corretamente no PowerShell:

```powershell
$body = @{
    codigo = "00301"
    nome = "Maria Silva"
    tipo_pessoa = "Física"
    email = "maria@email.com"
    telefone = "(19) 9999-1111"
    situacao = "Liberado"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/clientes" `
    -Method Post `
    -Body $body `
    -Headers $headers
```

### Usar com Postman

1. Abra o Postman
2. Crie uma nova requisição
3. Selecione o método (GET, POST, PUT, DELETE)
4. Coloque a URL: `http://localhost:3000/api/clientes`
5. Na aba "Body", selecione "raw" e "JSON"
6. Cole o JSON do exemplo
7. Clique em "Send"

---

## ⚠️ Códigos de Status

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 404 | Not Found - Recurso não encontrado |
| 500 | Server Error - Erro no servidor |

---

## 🔐 Notas de Segurança

⚠️ **Em produção:**
- Adicione autenticação (JWT)
- Valide todas as entradas
- Use variáveis de ambiente
- Implemente rate limiting
- Use HTTPS

---

Para mais detalhes sobre a API, consulte `DOCUMENTACAO.md`
