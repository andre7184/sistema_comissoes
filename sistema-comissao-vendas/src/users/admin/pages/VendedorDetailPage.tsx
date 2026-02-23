import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { VendedorDetalhado } from '../types';
import { adminService } from '../services/adminService';
import { formatarParaMoeda } from '../../../utils/formatters'; 
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import VendedorForm from '../components/VendedorForm';
import GenericFormModal from '../../../components/GenericFormModal';
import ConfirmationModal from '../../../components/ConfirmationModal'; // <-- NOVO IMPORT

// =====================================================================
// HELPERS
// =====================================================================

const formatarDataCadastro = (dataISO: string): string => {
    try {
        if (!dataISO) return 'N/A';
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date(dataISO));
    } catch (e) {
        return 'Data Inválida';
    }
};

interface MetricCardProps {
    title: string;
    value: string | number;
    colorClass: string;
}

const MetricCard = ({ title, value, colorClass }: MetricCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4" style={{ borderColor: colorClass }}>
        <p className="text-sm font-mediumtext-brand-500">{title}</p>
        <p className={`mt-1 text-3xl font-bold ${colorClass}`}>
            {value}
        </p>
    </div>
);


// =====================================================================
// COMPONENTE PRINCIPAL
// =====================================================================

export default function VendedorDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [vendedor, setVendedor] = useState<VendedorDetalhado | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para o Modal de Edição
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Estados para Reset de Senha
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false); // Controla o popup de confirmação
    const [resetLoading, setResetLoading] = useState(false); // Loading do botão de confirmar reset
    const [senhaGerada, setSenhaGerada] = useState<{ nome: string, senha: string } | null>(null); // Exibe a nova senha

    // Garante que o array de histórico é inicializado
    const historicoRendimentos = vendedor?.historicoRendimentos || [];

    // Busca os dados do vendedor (useCallback para permitir recarregamento)
    const fetchVendedorDetalhes = useCallback(async () => {
        const idVendedor = parseInt(id || '0', 10);

        if (!id || idVendedor <= 0) {
            setError('ID de Vendedor inválido ou não fornecido.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await adminService.buscarDetalhesVendedor(idVendedor);
            setVendedor(data);
        } catch (err) {
            toast.error("Erro ao carregar os detalhes do vendedor.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchVendedorDetalhes();
    }, [fetchVendedorDetalhes]);

    
    // --- AÇÃO 1: ATUALIZAR DADOS (NOME/EMAIL/COMISSÃO) ---
    const handleUpdate = async (data: any) => { 
        if (!vendedor) return;
        setFormLoading(true);
        setFormError(null);
        try {
            await adminService.atualizarComissaoVendedor(vendedor.id, data);
            fetchVendedorDetalhes(); // Recarrega os dados na tela
            setIsModalOpen(false);
        } catch (e: any) {
            toast.error("Erro ao atualizar dados do vendedor." + (e.response?.data?.message || ""));
            const errorMsg = e.response?.data?.message || 'Erro ao atualizar dados do vendedor.';
            setFormError(errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    // --- AÇÃO 2: RESETAR SENHA (Prepara o modal) ---
    const handleResetClick = () => {
        setIsResetConfirmOpen(true);
    };

    // --- AÇÃO 2.1: CONFIRMAR RESET (Versão Corrigida: Backend gera a senha) ---
    const handleConfirmResetSenha = async () => {
        if (!vendedor) return;
        
        setResetLoading(true);
        try {
            // 1. Chama o serviço SEM passar senha (o backend vai gerar)
            // O retorno 'res' conterá { novaSenha: "..." }
            const res = await adminService.resetarSenhaVendedor(vendedor.id);
            
            setIsResetConfirmOpen(false); // Fecha a confirmação
            
            // 2. Abre o modal de sucesso com a senha QUE O BACKEND RETORNOU
            setSenhaGerada({
                nome: vendedor.nome,
                senha: res.senhaTemporaria
            });
        } catch (err) {
            toast.error("Erro ao resetar a senha do vendedor.");
            setIsResetConfirmOpen(false);
        } finally {
            setResetLoading(false);
        }
    };


    if (loading) return <DashboardLayout><div className="flex justify-center items-center h-48"><p>Carregando...</p></div></DashboardLayout>;
    
    if (error) {
        return (
            <DashboardLayout>
                <div className="p-6 bg-red-100 text-red-700 rounded-lg border border-red-400">
                    <h1 className="text-2xl font-bold mb-4">Erro</h1>
                    <p>{error}</p>
                    <button onClick={() => navigate('/vendedores')} className="mt-4 text-blue-600 hover:text-blue-800">Voltar</button>
                </div>
            </DashboardLayout>
        );
    }

    if (!vendedor) return <DashboardLayout><p>Vendedor não encontrado.</p></DashboardLayout>;
    
    const { nome, email, percentualComissao, dataCadastro, qtdVendas, valorTotalVendas, mediaComissao } = vendedor;


    return (
        <DashboardLayout>
            {/* HEADER */}
            <header className="mb-6 pb-4 border-b flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">{nome}</h1>
                    <p className="text-lg text-gray-600">{email}</p>
                    <p className="text-smtext-brand-500">Cadastrado em: {formatarDataCadastro(dataCadastro)}</p>
                </div>
                
                <div className="flex flex-col gap-3 items-end">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition w-40"
                    >
                        Editar Vendedor
                    </button>
                    <button
                        onClick={handleResetClick}
                        className="bg-white border border-orange-500 text-orange-600 px-4 py-2 rounded shadow hover:bg-orange-50 transition w-40 text-sm font-medium"
                    >
                        Resetar Senha
                    </button>
                </div>
            </header>
            
            {/* CARDS DE MÉTRICAS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Comissão Atual" value={`${percentualComissao.toFixed(2)}%`} colorClass="text-indigo-600"/>
                <MetricCard title="Vendas Realizadas" value={qtdVendas} colorClass="text-blue-600"/>
                <MetricCard title="Valor Total Vendido" value={formatarParaMoeda(valorTotalVendas)} colorClass="text-green-600"/>
                <MetricCard title="Média de Comissão" value={`${mediaComissao.toFixed(2)}%`} colorClass="text-purple-600"/>
            </div>

            {/* GRÁFICOS E HISTÓRICO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Rendimento Mensal</h2>
                    {historicoRendimentos.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={historicoRendimentos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="mesAno" stroke="#6b7280" /> 
                                <YAxis yAxisId="left" stroke="#10B981" domain={[0, (dataMax: number) => dataMax * 1.2]} tickFormatter={(value) => `R$ ${value.toFixed(0)}`} />
                                <Tooltip formatter={(value: any) => typeof value === 'number' ? formatarParaMoeda(value) : value} />
                                <Legend />
                                <Bar dataKey="valorVendido" name="Valor Vendido" fill="#10B981" yAxisId="left" />
                                <Bar dataKey="valorComissao" name="Comissão (R$)" fill="#2563EB" yAxisId="left" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="h-64 bg-gray-50 flex items-center justify-center border border-dashed rounded-lg">
                             <p className="text-gray-500">Nenhum dado histórico disponível.</p>
                         </div>
                    )}
                </div>

                {/* Tabela */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Histórico Detalhado</h2>
                    <div className="overflow-y-auto h-72">
                        {historicoRendimentos.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="th-cell py-2 text-left">Mês</th>
                                        <th className="th-cell py-2 text-right">Comissão</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historicoRendimentos.slice().reverse().map((item, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="td-cell py-2">{item.mesAno}</td>
                                            <td className="td-cell py-2 text-right text-blue-600 font-semibold">
                                                {formatarParaMoeda(item.valorComissao)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-gray-500 pt-4">Nenhum histórico disponível.</p>}
                    </div>
                </div>
            </div>

            {/* --- MODAIS --- */}

            {/* 1. Modal de Edição */}
            <GenericFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormError(null);
                }}
                title="Editar Vendedor"
                closeOnOutsideClick={false} 
            >
                <VendedorForm
                    initialData={vendedor} 
                    onSubmit={handleUpdate}
                    loading={formLoading}
                    error={formError}
                />
            </GenericFormModal>

            {/* 2. Modal de Confirmação (Resetar Senha) - NOVO */}
            <ConfirmationModal
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                onConfirm={handleConfirmResetSenha}
                title="Resetar Senha de Acesso"
                message={`ATENÇÃO: Você está prestes a gerar uma NOVA senha para o vendedor ${nome}.\n\nA senha antiga deixará de funcionar imediatamente. Esta ação não pode ser desfeita.`}
                confirmText="Sim, Resetar Senha"
                cancelText="Cancelar"
                isDanger={true}
                isLoading={resetLoading}
            />

            {/* 3. Modal de Sucesso (Nova Senha Gerada) - REUTILIZADO/NOVO */}
            <GenericFormModal
                isOpen={!!senhaGerada}
                onClose={() => setSenhaGerada(null)}
                title="Senha Resetada com Sucesso"
            >
                <div className="text-center p-2">
                    <div className="mb-4 text-gray-600">
                        A senha de acesso para <strong>{senhaGerada?.nome}</strong> foi redefinida.
                        <br/>
                        Copie a nova senha abaixo e envie para o vendedor:
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded border border-gray-300 mb-6 flex justify-center items-center gap-2">
                        <span className="text-2xl font-mono font-bold text-blue-600 select-all">
                            {senhaGerada?.senha}
                        </span>
                    </div>

                    <button 
                        onClick={() => setSenhaGerada(null)}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition w-full"
                    >
                        Fechar
                    </button>
                </div>
            </GenericFormModal>

        </DashboardLayout>
    );
}