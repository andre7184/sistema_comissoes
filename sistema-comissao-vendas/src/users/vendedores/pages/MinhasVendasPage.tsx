import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import GenericFormModal from '../../../components/GenericFormModal';
import PortalVendaForm from '../components/PortalVendaForm';
import { portalVendasService } from '../services/portalVendasService';
import type { Venda, PortalVendaRequestDTO } from '../types';
import { formatarParaMoeda } from '../../../utils/formatters';

// Helper para formatar data
const formatarData = (dataISO: string) => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(dataISO));
  } catch (e) {
    return dataISO;
  }
};

export default function MinhasVendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  
  // --- ESTADOS DOS FILTROS ---
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFiltro, setStatusFiltro] = useState(''); // Novo filtro de status

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const data = await portalVendasService.listarMinhasVendas();
      setVendas(data);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);

  // --- LÓGICA DE FILTRO (Data + Status) ---
  const vendasFiltradas = useMemo(() => {
    return vendas.filter((venda) => {
      if (!venda.dataVenda) return false;
      
      const dataVendaStr = new Date(venda.dataVenda).toISOString().split('T')[0];
      
      // 1. Filtro de Data
      const inicioOk = !dataInicio || dataVendaStr >= dataInicio;
      const fimOk = !dataFim || dataVendaStr <= dataFim;

      // 2. Filtro de Status
      const statusOk = !statusFiltro || venda.status === statusFiltro;

      return inicioOk && fimOk && statusOk;
    });
  }, [vendas, dataInicio, dataFim, statusFiltro]); // Dependência adicionada

  // --- CÁLCULO DE TOTAIS (Baseado nos filtrados) ---
  const resumo = useMemo(() => {
    return vendasFiltradas.reduce((acc, curr) => {
      // Soma apenas se não estiver cancelada (opcional, dependendo da regra de negócio)
      if (curr.status === 'CANCELADA') return acc;

      return {
        totalVendas: acc.totalVendas + (curr.valorVenda || 0),
        totalComissao: acc.totalComissao + (curr.valorComissaoCalculado || 0),
        qtd: acc.qtd + 1
      };
    }, { totalVendas: 0, totalComissao: 0, qtd: 0 });
  }, [vendasFiltradas]);


  // --- HANDLERS ---
  const handleOpenModal = () => {
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (data: PortalVendaRequestDTO) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await portalVendasService.lancarMinhaVenda(data);
      await fetchVendas(); 
      handleCloseModal(); 
    } catch (err: any) {
      console.error('Erro ao lançar venda:', err.response?.data || err.message);
      setFormError('Falha ao lançar venda. Verifique os dados.');
    } finally {
      setFormLoading(false);
    }
  };

  // Função para limpar todos os filtros
  const limparFiltros = () => {
      setDataInicio('');
      setDataFim('');
      setStatusFiltro('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-green-700">Minhas Vendas</h2>
        <button
          onClick={handleOpenModal}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition w-full md:w-auto"
        >
          + Lançar Nova Venda
        </button>
      </div>

      {/* --- CARDS DE RESUMO --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-smtext-brand-500">Vendas Válidas (Período)</p>
            <p className="text-2xl font-bold text-blue-700">{resumo.qtd}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-smtext-brand-500">Total Vendido</p>
            <p className="text-2xl font-bold text-green-700">{formatarParaMoeda(resumo.totalVendas)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-600">
            <p className="text-smtext-brand-500 font-semibold">Comissão Prevista</p>
            <p className="text-2xl font-bold text-purple-700">{formatarParaMoeda(resumo.totalComissao)}</p>
        </div>
      </div>

      {/* --- BARRA DE FILTROS ATUALIZADA --- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
        {/* Data Início */}
        <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Data Início</label>
            <input 
                type="date" 
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-green-500 focus:border-green-500"
            />
        </div>
        
        {/* Data Fim */}
        <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Data Fim</label>
            <input 
                type="date" 
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-green-500 focus:border-green-500"
            />
        </div>

        {/* NOVO: Filtro de Status */}
        <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select 
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-green-500 focus:border-green-500 bg-white"
            >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="CANCELADA">Cancelada</option>
            </select>
        </div>

        <div>
            <button 
                onClick={limparFiltros}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm border transition"
            >
                Limpar
            </button>
        </div>
      </div>

      {/* --- LISTAGEM DE VENDAS --- */}
      {loading ? (
        <div className="text-center py-8text-brand-500">Carregando histórico...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-cell">Data</th>
                <th className="th-cell">Descrição</th>
                <th className="th-cell">Valor Venda</th>
                <th className="th-cell">Comissão</th>
                <th className="th-cell">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendasFiltradas.length > 0 ? (
                  vendasFiltradas.map((venda) => (
                    <tr key={venda.id} className="hover:bg-gray-50 transition">
                      <td className="td-cell">{formatarData(venda.dataVenda)}</td>
                      <td className="td-cell">{venda.descricaoVenda}</td>
                      <td className="td-cell text-green-600">
                          {formatarParaMoeda(venda.valorVenda)}
                      </td>
                      <td className="td-cell text-purple-700 font-bold">
                          {formatarParaMoeda(venda.valorComissaoCalculado)}
                      </td>
                      <td className="td-cell">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            venda.status === 'CONFIRMADA' 
                                ? 'bg-green-100 text-green-800' 
                                : venda.status === 'CANCELADA'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {venda.status}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={5} className="p-8 text-centertext-brand-500">
                          Nenhuma venda encontrada com os filtros selecionados.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <GenericFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Lançar Venda (Status Pendente)"
      >
        <PortalVendaForm
          onSubmit={handleSubmit}
          loading={formLoading}
          error={formError}
        />
      </GenericFormModal>
    </DashboardLayout>
  );
}