// src/components/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom';
import { useContext, type ReactNode } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // Papéis permitidos (ex: ROLE_ADMIN)
  requiredModule?: string; // Módulo obrigatório (ex: COMISSOES_CORE)
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requiredModule 
}: ProtectedRouteProps) {
  
  const { token, role, permissoes } = useContext(AuthContext);

  // 1. O usuário está logado?
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2. O Role está sendo carregado?
  if (!role) {
    return <div style={{padding: '20px', textAlign: 'center'}}>Carregando permissões...</div>;
  }

  // 3. O usuário tem o Role permitido?
  if (!allowedRoles.includes(role)) {
    // Se não tem o Role, redireciona para o dashboard (acesso negado)
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Esta rota exige um módulo específico?
  if (requiredModule) {
    // O usuário tem esse módulo?
    const temModulo = permissoes?.includes(requiredModule);
    if (!temModulo) {
      // Se não tem o módulo, redireciona para o dashboard (acesso negado)
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Se passou em todas as verificações, renderiza a página
  return <>{children}</>;
}