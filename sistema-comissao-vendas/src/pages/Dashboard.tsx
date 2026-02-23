// src/pages/Dashboard.tsx

import { useContext } from 'react'; 
import { AuthContext } from '../contexts/AuthContext'; 
import DashboardLayout from '../layouts/DashboardLayout'; 

// Importa os componentes específicos de Role
import SuperAdminDashboard from '../components/SuperAdminDashboard';
// AdminDashboard não é mais necessário aqui, pois o Admin não chega nesta página
import AdminDashboard from '../components/AdminDashboard'; 
// Importa o componente do Vendedor
import VendedorDashboard from '../components/VendedorDashboard';
// Importa ROLES para a verificação
import { ROLES } from '../config/constants';

export default function Dashboard() { 
  const { role } = useContext(AuthContext); 

  // REMOVIDO: useEffect de redirecionamento

  const renderContent = () => {
    // A lógica agora só precisa lidar com os roles que chegam aqui
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return <SuperAdminDashboard />;
      case ROLES.ADMIN: 
        return <AdminDashboard />;
      case ROLES.VENDEDOR:
        return <VendedorDashboard />;
      default:
        // Caso o Role ainda não tenha sido carregado ou seja inesperado
        return <div className="p-6 text-center text-red-500">Papel de usuário não reconhecido para este Dashboard.</div>;
    }
  };

  // Estado de carregamento inicial (mantido)
  if (role === null) {
      return (
        <DashboardLayout>
           <div className="flex justify-center items-center h-full">Carregando Dashboard...</div>
        </DashboardLayout>
      );
  }

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
}