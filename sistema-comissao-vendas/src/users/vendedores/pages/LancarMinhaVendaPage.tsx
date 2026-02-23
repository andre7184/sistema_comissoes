// src/users/vendedor/pages/LancarMinhaVendaPage.tsx

import DashboardLayout from '../../../layouts/DashboardLayout';
import GenericFormModal from '../../../components/GenericFormModal';
import PortalVendaForm from '../components/PortalVendaForm';
import { portalVendasService } from '../services/portalVendasService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LancarMinhaVendaPage() {
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCloseModal = () => {
    // Após fechar o modal, redireciona para a lista
    navigate('/portal-vendas', { replace: true });
  };

  const handleSubmit = async (data: { valorVenda: number, descricaoVenda: string }) => {
    setFormLoading(true);
    setFormError(null);
    
    try {
      await portalVendasService.lancarMinhaVenda(data); 
      // Em caso de sucesso, mostra a mensagem e redireciona para a lista
      alert('Venda lançada com sucesso! (Status PENDENTE)'); 
      handleCloseModal();
    } catch (err: any) {
      console.error('Erro ao lançar venda:', err.response?.data || err.message);
      setFormError('Falha ao lançar venda. Verifique os dados.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
        <h2 className="text-2xl font-bold text-green-700 mb-6">Lançamento Rápido de Venda</h2>
        <div className="max-w-md mx-auto">
            <GenericFormModal
                isOpen={true} // Mantemos o modal sempre aberto nesta página
                onClose={handleCloseModal}
                title="Lançar Nova Venda (Pendente de Aprovação)"
            >
                 <PortalVendaForm
                    onSubmit={handleSubmit}
                    loading={formLoading}
                    error={formError}
                />
            </GenericFormModal>
        </div>
    </DashboardLayout>
  );
}