// src/config/constants.ts

// Define e exporta os papéis (Roles)
export const ROLES = {
    SUPER_ADMIN: 'ROLE_SUPER_ADMIN', 
    ADMIN: 'ROLE_ADMIN', 
    VENDEDOR: 'ROLE_VENDEDOR', 
} as const;

// Define e exporta as chaves dos Módulos
export const MODULES = {
  COMISSOES: 'COMISSAO_CORE',
  // Adicione outras chaves de módulo aqui
} as const;

// Tipagem auxiliar para Roles (pode ser útil em outros lugares)
export type AllowedRoleType = typeof ROLES[keyof typeof ROLES];