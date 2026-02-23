// src/users/admin/services/adminService.ts

import api from '../../../services/api'; // Importa a instância global do Axios

import type {
  AdminEmpresa,                   
  AdminEmpresaCreateDTO, 
  AdminEmpresaUpdateDTO,
  Vendedor, // Tipo BÁSICO
  VendedorDetalhado, // <-- NOVO: Tipo DETALHADO
  VendedorCriadoResponseDTO,
  VendedorRequestDTO,
  VendedorUpdateRequestDTO,
  Venda,
  VendaRequestDTO,
  VendaUpdateRequestDTO,
  VendedorNested,
  EmpresaDashboardData,
  EmpresaInfo, // <-- NOVO
  ModuloDetalhe, // <-- NOVO
} from '../types';

interface VendedorListAPIDTO {
    idVendedor: number; // O campo ID da API
    percentualComissao: number;
    idUsuario: number; // NOVO: Campo da API
    nome: string;
    email: string;
    qtdVendas: number; 
    valorTotalVendas: number; 
    idEmpresa: number; // A API retorna, mesmo que VendedorDetalhado já tenha
    [key: string]: any; 
}

// DTO interno para o que a API REALMENTE retorna de VENDA (para listarVendas)
interface VendaAPIDTO {
    id: number;
    descricaoVenda: string;
    valorVenda: number;
    dataVenda: string;
    valorComissaoCalculado: number;
    vendedor: VendedorNested; // O objeto aninhado que a API agora retorna
    [key: string]: any; 
} 

export const adminService = {
  
  /**
   * Lista os usuários com ROLE_ADMIN da empresa do Admin logado
   * GET /api/empresa/admins (Backend filtra pela empresa do token)
   */
  listarAdminsDaEmpresa: async (): Promise<AdminEmpresa[]> => { // Retorna array de User
    const response = await api.get<AdminEmpresa[]>('/api/empresa/admins'); 
    return response.data;
  },

  /**
   * Cria um novo usuário com ROLE_ADMIN para a empresa do Admin logado
   * POST /api/empresa/admins
   */
  criarAdminDaEmpresa: async (dados: AdminEmpresaCreateDTO): Promise<AdminEmpresa> => { // Retorna User
    const response = await api.post<AdminEmpresa>('/api/empresa/admins', dados);
    return response.data; 
  },

  /**
   * Atualiza os dados de um usuário Admin da empresa do Admin logado
   * PUT /api/empresa/admins/{id}
   */
  atualizarAdminDaEmpresa: async (idUsuario: number, dados: AdminEmpresaUpdateDTO): Promise<AdminEmpresa> => { // Retorna User
    const response = await api.put<AdminEmpresa>(`/api/empresa/admins/${idUsuario}`, dados);
    return response.data;
  },
  
  /**
   * Opcional: Busca detalhes de um usuário específico (se necessário)
   * GET /api/empresa/admins/{id}
   */
  buscarAdminDaEmpresa: async (idUsuario: number): Promise<AdminEmpresa> => {
     const response = await api.get<AdminEmpresa>(`/api/empresa/admins/${idUsuario}`);
     return response.data;
  },  

  // --- GERENCIAMENTO DE VENDEDORES ---

  /**
   * Lista todos os vendedores da empresa logada
   * GET /api/vendedores
   */
  listarVendedores: async (): Promise<Vendedor[]> => {
    // 1. Usa a DTO da API para receber os dados
    const response = await api.get<VendedorListAPIDTO[]>('/api/vendedores');
    
    // 2. Mapeamento dos campos da API para a sua interface Vendedor
    // NOTA: É necessário que a interface Vendedor em types.ts tenha os campos:
    // qtdVendas, valorTotalVendas e idUsuario
    return response.data.map(item => ({
        // Mapeamento: 'idVendedor' da API vira 'id' na sua interface
        id: item.idVendedor,
        
        // Mapeamento direto (nomes iguais)
        nome: item.nome,
        email: item.email,
        percentualComissao: item.percentualComissao,
        idEmpresa: item.idEmpresa,
        
        // CAMPOS DE LISTAGEM (que DEVEM ser adicionados em types.ts)
        // Se Vendedor não tiver estes, a linha abaixo dará erro de tipagem.
        qtdVendas: item.qtdVendas,
        valorTotalVendas: item.valorTotalVendas,
        idUsuario: item.idUsuario,

    // Como VendedorDetalhado é usado para /detalhes, 
    // é mais simples fazer VendedorDetalhado extends Vendedor
    // e adicionar estes campos faltantes na interface Vendedor
    // para que a listagem /vendedores funcione sem erros.

    } as Vendedor)); // Cast para Vendedor para garantir a tipagem de retorno
  },

  /**
   * Cria um novo vendedor para a empresa logada
   * POST /api/vendedores
   */
  cadastrarVendedor: async (dados: VendedorRequestDTO): Promise<VendedorCriadoResponseDTO> => {
    const response = await api.post<VendedorCriadoResponseDTO>('/api/vendedores', dados);
    return response.data;
  },

  /**
   * Atualiza o percentual de comissão de um vendedor
   * PUT /api/vendedores/{id}
   */
  atualizarComissaoVendedor: async (idVendedor: number, dados: VendedorUpdateRequestDTO): Promise<Vendedor> => {
    const response = await api.put<Vendedor>(`/api/vendedores/${idVendedor}`, dados);
    return response.data;
  },

  buscarDetalhesVendedor: async (idVendedor: number): Promise<VendedorDetalhado> => {
    // Aqui usamos VendedorDetalhado, pois a API já deve retornar o objeto formatado
    const response = await api.get<VendedorDetalhado>(`/api/vendedores/${idVendedor}/detalhes`);
    return response.data;
  },

  /**
   * Reseta a senha do vendedor (JÁ EXISTENTE).
   */
  /**
   * Solicita ao backend o reset de senha.
   * PUT /api/vendedores/{id}/reset-senha
   */
  resetarSenhaVendedor: async (idVendedor: number): Promise<{ senhaTemporaria: string }> => {
    // Não enviamos mais corpo na requisição (segundo parâmetro é null ou vazio)
    const response = await api.put<{ senhaTemporaria: string }>(`/api/vendedores/${idVendedor}/reset-senha`);
    return response.data; // O backend retorna { "novaSenha": "..." }
  },
  /**
   * NOVO SERVIÇO: Busca os dados detalhados de um vendedor, incluindo métricas
   * GET /api/vendedores/{id}/detalhes
   * Retorna VendedorDetalhado
   */

  // --- GERENCIAMENTO DE VENDAS ---

  /**
   * Lista todas as vendas da empresa logada
   * GET /api/vendas
   */
  listarVendas: async (): Promise<Venda[]> => {
    // Usa VendaAPIDTO para garantir que o mapeamento é correto
    const response = await api.get<VendaAPIDTO[]>('/api/vendas'); 
    
    // Mapeamento: Transforma o DTO da API para o tipo Venda esperado
    return response.data.map(item => ({
      id: item.id,
      valorVenda: item.valorVenda,
      descricaoVenda: item.descricaoVenda,
      dataVenda: item.dataVenda,
      valorComissaoCalculado: item.valorComissaoCalculado,
      vendedor: item.vendedor, // Objeto Vendedor aninhado
      status: item.status, // Novo campo de status
    })) as Venda[]; // Fazemos um cast para Venda[]
  },

  /**
   * Lança uma nova venda para um vendedor
   * POST /api/vendas
   */
  lancarVenda: async (dados: VendaRequestDTO): Promise<Venda> => {
    const response = await api.post<Venda>(`/api/vendas`, dados);
    return response.data;
  },

  /**
   * Atualiza uma venda
   * POST /api/vendas/{id}
   */
  atualizarVenda: async (idVenda: number, dados: VendaUpdateRequestDTO): Promise<Venda> => {
    const response = await api.put<Venda>(`/api/vendas/${idVenda}`, dados);
    // Mapeamento: Transforma o DTO da API para o tipo Venda esperado
    return response.data;
  },
  
  /**
   * Aprova uma venda pendente
   * Retorna a o objeto da venda aprovada
   * PUT /api/vendas/{id}/aprovar
   * @param idVenda
   * @returns Venda
   */
  aprovarVenda: async (idVenda: number): Promise<Venda> => {
    const response = await api.put<Venda>(`/api/vendas/${idVenda}/aprovar`);
    return response.data;
  },

  /**
   * Cancela uma venda pendente
   * Retorna o objeto da venda cancelada
   * PUT /api/vendas/{id}/cancelar
   * @param idVenda
   * @returns Venda
   */
  cancelarVenda: async (idVenda: number): Promise<Venda> => {
    const response = await api.put<Venda>(`/api/vendas/${idVenda}/cancelar`);
    return response.data;
  },


  // --- DASHBOARD GERENCIAL ---

  /**
   * NOVO SERVIÇO: Busca todos os dados gerenciais da empresa para o Dashboard.
   * GET /api/dashboard/empresa
   */
  buscarDashboardEmpresa: async (): Promise<EmpresaDashboardData> => {
    const response = await api.get<EmpresaDashboardData>('/api/dashboard/empresa');
    return response.data;
  },

  buscarInfoEmpresa: async (): Promise<EmpresaInfo> => {
    const response = await api.get<EmpresaInfo>('/api/empresa/me');
    return response.data;
  },

  /**
   * Busca detalhes dos módulos disponíveis no catálogo geral
   * GET /api/modulos/catalogo (Exemplo de endpoint)
   */
  listarDetalhesModulos: async (): Promise<ModuloDetalhe[]> => {
    // Retorna a lista completa de módulos com nome, chave, preço, etc.
    const response = await api.get<ModuloDetalhe[]>('/api/modulos/catalogo'); 
    return response.data;
  },
};