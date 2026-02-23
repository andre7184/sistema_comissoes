import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import DashboardLayout from '../../../layouts/DashboardLayout';
import type { Venda, Vendedor, VendaRequestDTO, VendaUpdateRequestDTO } from '../types';
import { adminService } from '../services/adminService';
import GenericFormModal from '../../../components/GenericFormModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import VendaForm from '../components/VendaForm';
import { formatarParaMoeda } from '../../../utils/formatters';


const formatarData = (dataISO: string) => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dataISO));
  } catch (e) {
    return 'Data inválida';
  }
};

export default function VendasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoVenda, setEditandoVenda] = useState<Venda | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'APROVAR' | 'CANCELAR', id: number } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
      const statusUrl = searchParams.get('status');
      if (statusUrl) setStatusFilter(statusUrl);
  }, [searchParams]);

  const fetchData = async () => {
    if (vendas.length === 0) setLoading(true);
    try {
      const [vendasData, vendedoresData] = await Promise.all([
        adminService.listarVendas(),
        adminService.listarVendedores()
      ]);
      setVendas(vendasData);
      setVendedores(vendedoresData);
    } catch (err) {
      toast.error("Erro ao buscar vendas");
    } finally {
      toast.success("Vendas carregadas com sucesso!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const vendasFiltradas = vendas.filter(v => !statusFilter || v.status === statusFilter);

  const handleStatusChange = (novoStatus: string) => {
      setStatusFilter(novoStatus);
      if (novoStatus) setSearchParams({ status: novoStatus });
      else setSearchParams({});
  };

  const handleOpenModalCadastro = () => { setEditandoVenda(null); setFormError(null); setIsModalOpen(true); };
  const handleOpenModalEdicao = (venda: Venda) => { setEditandoVenda(venda); setFormError(null); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditandoVenda(null); setFormError(null); };
  
  const handleSubmit = async (data: VendaRequestDTO) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editandoVenda) {
        const updateData: VendaUpdateRequestDTO = { valorVenda: data.valorVenda, descricaoVenda: data.descricaoVenda || '' };
        await adminService.atualizarVenda(editandoVenda.id, updateData);
      } else {
        await adminService.lancarVenda(data);
      }
      await fetchData();
      handleCloseModal();
    } catch (err: any) {
      setFormError(err.response?.data?.message || `Erro ao salvar.`);
      toast.error(err.response?.data?.message || `Erro ao salvar.`);
    } finally {
      toast.success("Venda salva com sucesso!");
      setFormLoading(false);
    }
  };

  const handleActionClick = (type: 'APROVAR' | 'CANCELAR', id: number) => setConfirmAction({ type, id });
  
  const confirmActionHandler = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
        if (confirmAction.type === 'APROVAR') await adminService.aprovarVenda(confirmAction.id);
        else await adminService.cancelarVenda(confirmAction.id);
        await fetchData();
        setConfirmAction(null);
    } catch (error: any) {
        toast.error("Erro na ação: " + (error.response?.data?.message || ""));
    } finally {
        toast.success("Venda Confirmada com sucesso!");
        setActionLoading(false);
    }
  };

  const goToVendedor = (id: number) => navigate(`/vendedores/${id}`);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Vendas</h2>
        
        <div className="flex gap-4 w-full sm:w-auto">
            <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Todas as Vendas</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="CONFIRMADA">Confirmadas</option>
                <option value="CANCELADA">Canceladas</option>
            </select>

            <button
            onClick={handleOpenModalCadastro}
            disabled={vendedores.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition disabled:bg-gray-400 text-sm whitespace-nowrap"
            >
            + Lançar Venda
            </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8text-brand-500">Carregando vendas...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="th-cell w-24">Data</th>
                  <th className="th-cell">Vendedor</th>
                  <th className="th-cell">Descrição</th>
                  <th className="th-cell">Valor</th>
                  <th className="th-cell">Comissão</th>
                  <th className="th-cell w-48 text-center">Status / Aprovação</th> {/* Coluna Alargada */}
                  <th className="th-cell w-16 text-center">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendasFiltradas.length > 0 ? (
                    vendasFiltradas.map((venda) => (
                    <tr key={venda.id} className="hover:bg-gray-50 transition-colors">
                        <td className="td-cell text-gray-600">{formatarData(venda.dataVenda)}</td>
                        <td className="td-cell">
                        <button onClick={() => goToVendedor(venda.vendedor.idVendedor)} className="text-left hover:bg-gray-100 p-1 rounded -ml-1 transition">
                            <div className="font-medium text-indigo-600 hover:underline">{venda.vendedor.nome}</div>
                            <div className="text-xstext-brand-500">{venda.vendedor.email}</div>
                        </button>
                        </td>
                        <td className="td-celltext-brand-500 text-sm max-w-[200px] truncate" title={venda.descricaoVenda}>{venda.descricaoVenda || '-'}</td>
                        <td className="td-cell text-green-600 font-medium">{formatarParaMoeda(venda.valorVenda)}</td>
                        <td className="td-cell text-blue-600 font-medium">{formatarParaMoeda(venda.valorComissaoCalculado)}</td>
                        
                        {/* COLUNA STATUS + AÇÕES (FLEX) */}
                        <td className="td-cell">
                            <div className="flex items-center justify-center gap-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold inline-block min-w-[80px] text-center ${
                                    venda.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                                    venda.status === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {venda.status}
                                </span>

                                {/* Ícones de Ação (Só aparecem se PENDENTE) */}
                                {venda.status === 'PENDENTE' && (
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => handleActionClick('APROVAR', venda.id)}
                                            className="p-1.5 rounded-full hover:bg-green-100 text-green-600 transition"
                                            title="Aprovar Venda"
                                        >
                                            ✅
                                        </button>
                                        <button 
                                            onClick={() => handleActionClick('CANCELAR', venda.id)}
                                            className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition"
                                            title="Cancelar Venda"
                                        >
                                            🚫
                                        </button>
                                    </div>
                                )}
                            </div>
                        </td>

                        {/* COLUNA EDITAR (Ícone) */}
                        <td className="td-cell text-center">
                            <button
                                onClick={() => handleOpenModalEdicao(venda)}
                                className="text-gray-500 hover:text-blue-600 p-2 rounded hover:bg-blue-50 transition text-lg"
                                title="Editar Venda"
                            >
                                ✏️
                            </button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={7} className="p-8 text-centertext-brand-500">
                            Nenhuma venda encontrada.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <GenericFormModal isOpen={isModalOpen} onClose={handleCloseModal} title={editandoVenda ? `Editar Venda #${editandoVenda.id}` : 'Lançar Nova Venda'} closeOnOutsideClick={false}>
        <VendaForm initialData={editandoVenda || undefined} onSubmit={handleSubmit} vendedores={vendedores} loading={formLoading} error={formError} />
      </GenericFormModal>

      <ConfirmationModal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={confirmActionHandler}
        title={confirmAction?.type === 'APROVAR' ? "Aprovar Venda" : "Cancelar Venda"}
        message={confirmAction?.type === 'APROVAR' ? "Confirma a aprovação desta venda?" : "Tem certeza que deseja cancelar esta venda?"}
        confirmText={confirmAction?.type === 'APROVAR' ? "Sim, Aprovar" : "Sim, Cancelar"}
        cancelText="Voltar" isDanger={confirmAction?.type === 'CANCELAR'} isLoading={actionLoading}
      />
    </DashboardLayout>
  );
}