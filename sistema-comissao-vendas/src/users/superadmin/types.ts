// src/users/superadmin/types.ts
import type { ReactNode } from 'react';
/**
 * Define os status possíveis para um Módulo, conforme a API
 */
export type ModuloStatus = 
  | 'EM_DESENVOLVIMENTO'
  | 'EM_TESTE'
  | 'PRONTO_PARA_PRODUCAO'
  | 'ARQUIVADO';

/**
 * Interface para a entidade Módulo (Catálogo do SaaS)
 */
export interface Modulo {
  descricao: ReactNode;
  id: number;
  nome: string;
  chave: string;
  status: ModuloStatus;
  descricaoCurta?: string;
  precoMensal: number;
  isPadrao: boolean;
}

/**
 * Interface para representar um usuário Admin associado a uma Empresa (na listagem)
 */
export interface Usuarios {
  id: number; // ID do usuário
  email: string;
  nome: string;
}

/**
 * Interface para a entidade Empresa (Tenant) - ATUALIZADA
 */
export interface Empresa {
  id: number;
  nomeFantasia: string; 
  cnpj: string;         
  dataCadastro: string; 
  razaoSocial: string | null; 
  modulosAtivos: Modulo[]; 
  
  // Array de usuários Admin associados
  usuariosAdmin: Usuarios[]; 
}

// DTO para POST /api/superadmin/modulos
export interface ModuloRequestDTO {
  nome: string;
  chave: string;
  status: ModuloStatus;
  descricaoCurta?: string;
  precoMensal: number;
  isPadrao: boolean;
}

// DTO para POST /api/superadmin/empresas
export interface EmpresaRequestDTO {
  nomeFantasia: string;
  cnpj: string;
  razaoSocial: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
}

// DTO para PUT /api/superadmin/empresas/{id}
export interface EmpresaUpdateRequestDTO {
    nomeFantasia: string;
    cnpj: string;
    razaoSocial: string;
}

/**
 * DTO para PUT /api/superadmin/empresas/{id}/modulos
 */
export interface AtualizarModulosEmpresaRequestDTO {
  moduloIds: number[]; // Array de IDs
}

// --- NOVOS TIPOS PARA USUÁRIOS ADMIN ---

/**
 * Entidade Usuário (retornada ao criar um Admin via API SuperAdmin)
 */
export interface User {
    id: number;
    nome: string;
    email: string;
    role: string; // Ex: ROLE_ADMIN
    dataCriacao: string;
    empresa: { 
        id: number;
        nomeFantasia: string;
        cnpj: string;
    };
}

/**
 * DTO para Criação de Usuário Admin (Body do POST /empresas/{id}/admins)
 */
export interface AdminUsuarioRequestDTO {
  nome: string;
  email: string;
  senha: string;
}