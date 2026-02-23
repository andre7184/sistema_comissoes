// src/users/superadmin/services/superAdminService.ts

import api from '../../../services/api'; 
import type { 
    Empresa, 
    EmpresaRequestDTO, 
    EmpresaUpdateRequestDTO, 
    Modulo,
    ModuloRequestDTO,
    AtualizarModulosEmpresaRequestDTO,
    User, // <-- Importa User
    AdminUsuarioRequestDTO // <-- Importa AdminUsuarioRequestDTO
} from '../types';

export const superAdminService = {
  // *************************************************************
  // EMPRESAS
  // *************************************************************
  
  // GET /api/superadmin/empresas
  listarEmpresas: async (): Promise<Empresa[]> => {
    // A resposta da API deve corresponder à interface Empresa atualizada
    const response = await api.get<Empresa[]>('/api/superadmin/empresas'); 
    return response.data;
  },

  // POST /api/superadmin/empresas
  cadastrarEmpresa: async (dados: EmpresaRequestDTO): Promise<Empresa> => {
    const response = await api.post<Empresa>('/api/superadmin/empresas', dados); 
    return response.data;
  },

  // PUT /api/superadmin/empresas/{id}
  atualizarEmpresa: async (id: number, dados: EmpresaUpdateRequestDTO): Promise<Empresa> => {
    const response = await api.put<Empresa>(`/api/superadmin/empresas/${id}`, dados);
    return response.data;
  },

  // PUT /api/superadmin/empresas/{id}/modulos
  associarModulosEmpresa: async (idEmpresa: number, dados: AtualizarModulosEmpresaRequestDTO): Promise<Empresa> => {
    const response = await api.put<Empresa>(`/api/superadmin/empresas/${idEmpresa}/modulos`, dados);
    return response.data;
  },

  // --- FUNÇÃO ADICIONADA PARA CRIAR ADMINS ---
  /**
   * Cria um novo usuário Admin para uma empresa específica.
   * POST /api/superadmin/empresas/{empresaId}/admins
   */
  criarAdminUsuario: async (empresaId: number, dados: AdminUsuarioRequestDTO): Promise<User> => {
    const response = await api.post<User>(`/api/superadmin/empresas/${empresaId}/admins`, dados);
    return response.data;
  },

  // *************************************************************
  // MÓDULOS (CRUD DO CATÁLOGO)
  // *************************************************************

  // GET /api/superadmin/modulos
  listarModulos: async (): Promise<Modulo[]> => {
    const response = await api.get<Modulo[]>('/api/superadmin/modulos');
    return response.data;
  },

  // POST /api/superadmin/modulos
  cadastrarModulo: async (dados: ModuloRequestDTO): Promise<Modulo> => {
    const response = await api.post<Modulo>('/api/superadmin/modulos', dados);
    return response.data;
  },

  // PUT /api/superadmin/modulos/{id}
  atualizarModulo: async (id: number, dados: ModuloRequestDTO): Promise<Modulo> => {
    const response = await api.put<Modulo>(`/api/superadmin/modulos/${id}`, dados);
    return response.data;
  },

  // GET /api/superadmin/modulos/disponiveis
  listarModulosDisponiveis: async (): Promise<Modulo[]> => {
    const response = await api.get<Modulo[]>('/api/superadmin/modulos/disponiveis');
    return response.data;
  },

};