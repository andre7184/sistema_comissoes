// src/users/admin/types.ts

// Entidade User (Como retornado por GET /api/empresa/admins e POST/PUT)
// Ajustada para corresponder à API
export interface AdminEmpresa {
    id: number;
    nome: string;
    email: string;
    role: string; // Ex: ROLE_ADMIN
    dataCriacao: string;
    empresaId: number; // A API retorna o ID da empresa
}

// DTO para Criação de Usuário Admin (POST /api/empresa/admins)
// Já estava correto, mas renomeado para clareza
export interface AdminEmpresaCreateDTO {
  nome: string;
  email: string;
  senha: string; // A API espera 'senha'
}

// DTO para Atualização de Usuário Admin (PUT /api/empresa/admins/{id})
// Baseado na documentação da API
export interface AdminEmpresaUpdateDTO {
    nome: string;
    email: string; // A API permite atualizar email
    senha?: string; // Senha pode ser opcional na atualização
}

// Interface base para a entidade Vendedor (usada em listarVendedores e VendaForm)
export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  percentualComissao: number;
  idEmpresa: number;
  // A entidade Vendedor completa pode ter mais campos, ajuste conforme necessário
}

export interface VendedorDetalhado extends Vendedor {
  dataCadastro: string; // Ex: '2023-01-15T10:00:00Z'
  qtdVendas: number;
  valorTotalVendas: number;
  mediaComissao: number;
  
  // Estrutura para dados de gráfico
  historicoRendimentos?: Array<{
    mesAno: string; // Ex: "2024-06"
    valorVendido: number;
    valorComissao: number;
  }>;
}

// DTO para a resposta de criação de Vendedor
export interface VendedorCriadoResponseDTO {
  idVendedor: number;
  idUsuario: number;
  nome: string;
  email: string;
  percentualComissao: number;
  idEmpresa: number;
  senhaTemporaria: string;
}

// DTO para a requisição de criação de Vendedor
export interface VendedorRequestDTO {
  nome: string;
  email: string;
  percentualComissao: number;
}

// DTO para a requisição de atualização de Vendedor
export interface VendedorUpdateRequestDTO {
  nome: string;
  email: string;
  percentualComissao: number;
}

// NOVO: Interface para o objeto Vendedor aninhado dentro da Venda
export interface VendedorNested {
  idVendedor: number; // A API retorna o ID com este nome
  nome: string;
  email: string;
  percentualComissao: number;
}


// Interface base para a entidade Venda
// (ATUALIZADO para incluir o objeto vendedor aninhado)
export interface Venda {
  id: number;
  valorVenda: number;
  dataVenda: string; // A API retorna uma data (provavelmente string ISO)
  valorComissaoCalculado: number;
  descricaoVenda: string;
  // ATUALIZADO: Adicionado o objeto completo do vendedor
  vendedor: VendedorNested; 
  status: string; // NOVO campo de status
}

// DTO para a requisição de Lançamento de Venda
export interface VendaRequestDTO {
  vendedorId: number;
  descricaoVenda: string;
  valorVenda: number;
}

export interface VendaUpdateRequestDTO {
  descricaoVenda: string;
  valorVenda: number;
}

// NOVO: Estrutura para Vendas de Destaque (USADA NO DASHBOARD)
export interface VendaDestaque {
    idVenda: number; // <-- ID DA VENDA (campo que faltava ou estava inconsistente)
    nomeVendedor: string;
    idVendedor: number; // Para navegação
    valorVenda: number;
    dataVenda: string;
}

// NOVO: Estrutura para o Ranking de Vendedores
export interface RankingItem {
    nomeVendedor: string;
    idVendedor: number;
    valorTotal: number;
    qtdVendas: number;
}

// NOVO: Estrutura para os dados do gráfico mensal (Histórico)
export interface HistoricoVendasMensalItem {
  mesAno: string; // Ex: "2024-06"
  valorVendido: number; // Valor total vendido no mês
}

// Estrutura completa do Dashboard Gerencial (AJUSTADA PARA NOVOS NOMES)
export interface EmpresaDashboardData {
  // Métricas Globais (Nomes conforme definido)
  qtdVendedores: number;         // NOVO NOME (ou campo adicionado)
  totalVendasMes: number;         
  totalComissoesMes: number;
  qtdVendasMes: number;          
  mediaVendaMes: number;
  mediaComissaoMes: number;    // NOVO NOME
  
  // Campos que a API NÃO retorna devem ser opcionais
  // totalVendedores?: number; // Removido se qtdVendedores é o nome correto
  // mediaComissaoEmpresa?: number; // Removido se  é o nome correto
  
  // Dados de Tabela/Lista (verificar se API também mudou nomes aqui)
  rankingVendedores: RankingItem[];
  maioresVendas: VendaDestaque[];
  ultimasVendas: VendaDestaque[];
  
  // Dados de Gráfico (verificar se API também mudou nomes aqui)
  historicoVendasMensal: Array<{
    mesAno: string;
    valorVendido: number; // Verificar nome
    valorComissao: number; // Verificar nome
  }>;
}

// NOVO: Interface para informações básicas da Empresa (retornada pela API)
export interface EmpresaInfo {
    id: number;
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    // Adicione outros campos relevantes que a API retornar (ex: data de criação)
}

// NOVO: Interface para detalhes de um Módulo (vindo do catálogo da API)
export interface ModuloDetalhe {
    id: number;
    nome: string;
    chave: string; // Ex: COMISSAO_CORE
    descricaoCurta?: string;
    precoMensal: number;
    // status?: string; // Se relevante
}