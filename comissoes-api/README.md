# API de Gestão de Comissões - Documentação Técnica (v1.1.0)

Esta documentação detalhada serve como guia de referência para o consumo da API, incluindo descrições funcionais, requisitos de segurança e exemplos práticos de JSON para requisição (Request) e resposta (Response).

---
## 🌟 Visão Geral do Sistema

O **Sistema de Comissões** é uma aplicação **SaaS (Software as a Service)** construída com Spring Boot/JPA que segue a arquitetura **Multi-Tenant (Múltiplos Clientes)**.

* **Multi-Tenant:** Cada cliente (representado pela entidade `Empresa`) tem seus dados isolados e acessíveis apenas por seus próprios usuários (`ROLE_ADMIN`, `ROLE_VENDEDOR`).
* **Modularidade:** As funcionalidades (ex: **`COMISSAO_CORE`**) são produtos (`Modulo`) que o Super Admin pode "vender" e ativar para clientes específicos. O acesso aos endpoints do módulo de Comissões é protegido por essa checagem.

## 1. Detalhes Técnicos

- Base URL: http://localhost:8080/api
- Autenticação: Bearer Token (JWT). O token deve ser enviado no Header Authorization de todas as requisições protegidas.
- Formato de data: ISO-8601 (ex: "2025-11-18T10:30:00").
- Erros: Em caso de erro, a API retorna um JSON padrão com timestamp, status, error e message.

---

## 2. Autenticação e perfil

### Login
POST /auth/login  
- Descrição: Autentica um usuário (SuperAdmin, Admin ou Vendedor) e retorna o token de acesso.
- Acesso: Público.

Request Body:
```
{
  "email": "admin@empresa.com",
  "senha": "senhaSecreta123"
}
```
Response Body (200 OK):
```
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pb...",
  "permissoesModulos": [
    "COMISSAO_CORE",
    "DASHBOARD_VIEW"
  ]
}
```
---

### Alterar minha senha
PUT /usuarios/me/senha  
- Descrição: Permite que o usuário logado altere sua própria senha.
- Acesso: Qualquer usuário autenticado.

Request Body:
```
{
  "senhaAtual": "senhaAntiga123",
  "novaSenha": "novaSenhaForte!2025"
}
```
Response (204 No Content):  
Sem corpo de resposta. Sucesso indicado pelo status HTTP 204.

---

## 3. Módulo administrativo (Tenant)

### Obter detalhes da empresa
GET /empresa/me  
- Descrição: Retorna os dados cadastrais da empresa do usuário logado e contagem de admins.
- Acesso: ROLE_ADMIN.

Response Body (200 OK):
```
{
  "id": 10,
  "nomeFantasia": "Tech Solutions",
  "razaoSocial": "Tech Solutions LTDA",
  "cnpj": "12.345.678/0001-90",
  "dataCadastro": "2025-01-15T14:00:00",
  "qtdAdmins": 2
}
```
---

### Listar administradores
GET /empresa/admins  
- Descrição: Lista todos os usuários com perfil de Administrador da mesma empresa.
- Acesso: ROLE_ADMIN.

Response Body (200 OK):
```
[
  {
    "id": 5,
    "nome": "João Silva",
    "email": "joao@techsolutions.com",
    "role": "ROLE_ADMIN",
    "dataCriacao": "2025-02-01T09:00:00",
    "empresaId": 10,
    "ativo": true
  },
  {
    "id": 8,
    "nome": "Maria Souza",
    "email": "maria@techsolutions.com",
    "role": "ROLE_ADMIN",
    "dataCriacao": "2025-03-10T11:30:00",
    "empresaId": 10,
    "ativo": true
  }
]
```
---

### Cadastrar novo administrador
POST /empresa/admins  
- Descrição: Cria um novo usuário Admin para a empresa.
- Acesso: ROLE_ADMIN.

Request Body:
```
{
  "nome": "Carlos Pereira",
  "email": "carlos@techsolutions.com",
  "senha": "senhaInicial123"
}
```
Response Body (201 Created):
- Retorna o objeto do usuário criado (similar ao GET acima).

---

### Editar/Desativar administrador
PUT /empresa/admins/{id}  
- Descrição: Atualiza nome, email e status (ativo/inativo) de um administrador.
- Acesso: ROLE_ADMIN.

Request Body:
```
{
  "nome": "Carlos P. Pereira",
  "email": "carlos.new@techsolutions.com",
  "ativo": false
}
```
Response Body (200 OK):
- Retorna o objeto atualizado.

---

## 4. Gestão de vendedores

### Listar vendedores
GET /vendedores  
- Descrição: Lista todos os vendedores da empresa com métricas resumidas.
- Acesso: ROLE_ADMIN + Módulo COMISSAO_CORE.

Response Body (200 OK):
```
[
  {
    "idVendedor": 15,
    "percentualComissao": 5.0,
    "qtdVendas": 12,
    "valorTotalVendas": 15000.00,
    "idUsuario": 20,
    "nome": "Ana Vendedora",
    "email": "ana@techsolutions.com"
  }
]
```
---

### Cadastrar vendedor
POST /vendedores  
- Descrição: Cria um perfil de Vendedor e um Usuário de acesso associado. Gera uma senha temporária.
- Acesso: ROLE_ADMIN.

Request Body:
```
{
  "nome": "Lucas Vendedor",
  "email": "lucas@techsolutions.com",
  "percentualComissao": 4.5
}

Response Body (201 Created):
{
  "idVendedor": 16,
  "idUsuario": 21,
  "nome": "Lucas Vendedor",
  "email": "lucas@techsolutions.com",
  "percentualComissao": 4.5,
  "senhaTemporaria": "Xy9#mP2z"
}
```
---

### Detalhes do vendedor
GET /vendedores/{id}/detalhes  
- Descrição: Retorna dados detalhados, métricas acumuladas e histórico mensal.
- Acesso: ROLE_ADMIN.

Response Body (200 OK):
```
{
  "id": 15,
  "nome": "Ana Vendedora",
  "email": "ana@techsolutions.com",
  "percentualComissao": 5.0,
  "qtdVendas": 12,
  "valorTotalVendas": 15000.00,
  "mediaComissao": 62.50,
  "historicoRendimentos": [
    {
      "mesAno": "2025-11",
      "valorVendido": 5000.00,
      "valorComissao": 250.00
    },
    {
      "mesAno": "2025-10",
      "valorVendido": 10000.00,
      "valorComissao": 500.00
    }
  ]
}
```
---

## 5. Gestão de vendas e comissões

### Dashboard da empresa
GET /dashboard/empresa  
- Descrição: Retorna KPIs, rankings e gráficos para a visão gerencial.
- Acesso: ROLE_ADMIN.

Response Body (200 OK):
```
{
  "totalVendasMes": 45000.00,
  "totalComissoesMes": 2250.00,
  "qtdVendasMes": 15,
  "mediaVendaMes": 3000.00,
  "rankingVendedores": [
    { "nomeVendedor": "Ana", "valorTotal": 15000.00, "qtdVendas": 5 }
  ],
  "ultimasVendas": [],
  "maioresVendas": [],
  "historicoVendasMensal": []
}
```
---

### Listar vendas (com filtros)
GET /vendas?status=PENDENTE,CONFIRMADA  
- Descrição: Lista vendas. Se o parâmetro status for omitido, retorna todas.
- Acesso: ROLE_ADMIN.

Response Body (200 OK):
```
[
  {
    "id": 101,
    "valorVenda": 1000.00,
    "descricaoVenda": "Serviço de Consultoria",
    "valorComissaoCalculado": 50.00,
    "dataVenda": "2025-11-18T10:00:00",
    "vendedor": {
      "idVendedor": 15,
      "nome": "Ana Vendedora",
      "email": "ana@techsolutions.com",
      "percentualComissao": 5.0
    }
  }
]
```
---

### Lançar venda (pelo Admin)
POST /vendas  
- Descrição: Admin lança uma venda. Status Inicial: CONFIRMADA.
- Acesso: ROLE_ADMIN.

Request Body:
```
{
  "vendedorId": 15,
  "valorVenda": 2000.00,
  "descricaoVenda": "Venda Balcão"
}
```
Response Body (201 Created):
- Retorna o objeto Venda completo com ID e Data.

---

### Atualizar venda
PUT /vendas/{id}  
- Descrição: Atualiza valor/descrição. Recalcula a comissão automaticamente.
- Acesso: ROLE_ADMIN.

Request Body:
```
{
  "valorVenda": 2500.00,
  "descricaoVenda": "Correção de valor"
}
```
---

### Aprovar venda
PUT /vendas/{id}/aprovar  
- Descrição: Muda status de PENDENTE para CONFIRMADA.
- Acesso: ROLE_ADMIN.

---

### Cancelar venda
PUT /vendas/{id}/cancelar  
- Descrição: Muda status para CANCELADA (remove dos cálculos).
- Acesso: ROLE_ADMIN.

---

## 6. Portal do vendedor

### Lançar minha venda
POST /portal-vendas  
- Descrição: Vendedor lança sua própria venda. Status Inicial: PENDENTE.
- Acesso: ROLE_VENDEDOR.

Request Body:
```
{
  "valorVenda": 500.00,
  "descricaoVenda": "Venda Balcão"
}
```
Response Body (201 Created):
```
{
  "id": 105,
  "valorVenda": 500.00,
  "status": "PENDENTE",
  "dataVenda": "..."
}
```
---

### Listar minhas vendas
GET /portal-vendas  
- Descrição: Retorna o histórico de vendas do próprio vendedor logado.
- Acesso: ROLE_VENDEDOR.
