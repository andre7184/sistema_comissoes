import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { adminService } from '../services/adminService';
import type { Venda, EmpresaDashboardData } from '../types';
import { formatarParaMoeda } from '../../../utils/formatters';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Link, useNavigate } from 'react-router-dom';

// --- COMPONENTE CARD PADRONIZADO ---
interface MetricCardProps {
    title: string;
    value: string | number;
    colorClass: string;
    borderColorClass: string; // Cor da borda explícita para funcionar com Tailwind
    subTitle?: string;        // Subtítulo opcional (ex: "1 aguardando")
    link?: string;            // Link opcional (ícone)
}

const MetricCard = ({ title, value, colorClass, borderColorClass, subTitle, link }: MetricCardProps) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${borderColorClass} flex justify-between items-start`}>
        <div>
            <p className="text-sm font-mediumtext-brand-500 uppercase tracking-wide">{title}</p>
            <p className={`mt-2 text-3xl font-bold ${colorClass}`}>
                {value}
            </p>
            {subTitle && (
                <p className="text-xstext-brand-500 mt-1 font-medium">
                    {subTitle}
                </p>
            )}
        </div>
        {/* Ícone de Link (se houver) */}
        {link && (
            <Link 
                to={link} 
                className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
                title="Ver detalhes"
            >
                {/* Ícone de seta simples */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </Link>
        )}
    </div>
);

export default function EmpresaDashboardPage() {
    const [data, setData] = useState<EmpresaDashboardData | null>(null);
    const [vendas, setVendas] = useState<Venda[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [dashboardResult, todasVendas] = await Promise.all([
                    adminService.buscarDashboardEmpresa(),
                    adminService.listarVendas()
                ]);
                setData(dashboardResult);
                setVendas(todasVendas);
            } catch (e: any) {
                toast.error("Erro ao carregar dados do dashboard.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- CÁLCULOS ---
    const metrics = useMemo(() => {
        if (!data) return null;

        const pendentes = vendas.filter(v => v.status === 'PENDENTE');
        const totalPendentes = pendentes.reduce((acc, v) => acc + (v.valorVenda || 0), 0);

        return {
            ...data,
            qtdPendentes: pendentes.length,
            totalPendentes: totalPendentes,
        };
    }, [data, vendas]);

    if (loading) return <DashboardLayout><div className="flex justify-center items-center h-64">Carregando...</div></DashboardLayout>;
    if (error) return <DashboardLayout><div className="p-6 bg-red-100 text-red-700 rounded">{error}</div></DashboardLayout>;
    if (!metrics) return null;

    const handleAbrirVendedor = (idVendedor: number) => {
        navigate(`/vendedores/${idVendedor}`);
    };

    return (
        <DashboardLayout>
            <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard Gerencial</h1>
            
            {/* --- GRID DE CARDS (Agora inclui Pendentes) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Qtd Vendas */}
                <MetricCard 
                    title="Qtd. Vendas (Mês)" 
                    value={metrics.qtdVendasMes} 
                    colorClass="text-purple-600"
                    borderColorClass="border-purple-600"
                />
                
                {/* 2. Valor Vendas */}
                <MetricCard 
                    title="Valor Vendas (Mês)" 
                    value={formatarParaMoeda(metrics.totalVendasMes)} 
                    colorClass="text-green-600"
                    borderColorClass="border-green-600"
                />
                
                {/* 3. Valor Comissões */}
                <MetricCard 
                    title="Valor Comissões (Mês)" 
                    value={formatarParaMoeda(metrics.totalComissoesMes)} 
                    colorClass="text-cyan-600" 
                    borderColorClass="border-cyan-600"
                />

                {/* 4. Média por Venda */}
                <MetricCard 
                    title="Média por Venda" 
                    value={formatarParaMoeda(metrics.mediaVendaMes)} 
                    colorClass="text-teal-600" 
                    borderColorClass="border-teal-600"
                />
                
                {/* 5. Média Comissão */}
                <MetricCard 
                    title="Média Comissão" 
                    value={`${(metrics.mediaComissaoMes ?? 0).toFixed(2)}%`} 
                    colorClass="text-yellow-600"
                    borderColorClass="border-yellow-600"
                />

                {/* 6. CARD DE VENDAS PENDENTES (Padronizado) */}
                <MetricCard 
                    title="Vendas Pendentes" 
                    value={formatarParaMoeda(metrics.totalPendentes)} 
                    colorClass="text-orange-600"
                    borderColorClass="border-orange-500"
                    subTitle={`${metrics.qtdPendentes} aguardando aprovação`}
                    link="/vendas?status=PENDENTE" // Link direto com filtro
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* GRÁFICO DE VENDAS MENSAIS */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Histórico de Vendas</h2>
                    {metrics.historicoVendasMensal?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={metrics.historicoVendasMensal}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mesAno" />
                                <YAxis yAxisId="valor" tickFormatter={(v) => `R$ ${v}`} />
                                <Tooltip formatter={(val: any) => formatarParaMoeda(Number(val))} />
                                <Legend />
                                <Bar yAxisId="valor" dataKey="valorVendido" name="Vendas" fill="#10B981" />
                                <Bar yAxisId="valor" dataKey="valorComissao" name="Comissões" fill="#2563EB" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-gray-500 py-10 text-center">Sem dados históricos.</p>}
                </div>
                
                {/* RANKING DE VENDEDORES (Vendas por Usuário) */}
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Ranking de Vendedores</h2>
                    {metrics.rankingVendedores?.length > 0 ? (
                        <>
                            <ul className="divide-y divide-gray-200 flex-1 overflow-y-auto max-h-[300px]">
                                {metrics.rankingVendedores.slice(0, 10).map((item, idx) => (
                                    <li key={item.idVendedor} className="py-3 flex justify-between items-center px-2 hover:bg-gray-50 rounded transition">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold w-6 text-center ${idx < 3 ? 'text-yellow-600 text-lg' : 'text-gray-400'}`}>
                                                {idx + 1}º
                                            </span>
                                            <div className="flex flex-col">
                                                <button 
                                                    onClick={() => handleAbrirVendedor(item.idVendedor)} 
                                                    className="text-sm font-medium text-blue-600 hover:underline text-left"
                                                >
                                                    {item.nomeVendedor}
                                                </button>
                                                <span className="text-xstext-brand-500">{item.qtdVendas} vendas</span>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600 text-sm">
                                            {formatarParaMoeda(item.valorTotal)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-2 border-t text-center">
                                <Link to="/vendedores" className="text-sm text-blue-600 hover:underline">
                                    Ver todos os vendedores
                                </Link>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-10">Nenhum dado de venda disponível.</p>
                    )}
                </div>
            </div>

            {/* ÚLTIMAS VENDAS */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Últimas Vendas Confirmadas</h2>
                    <Link to="/vendas?status=CONFIRMADA" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
                </div>
                {metrics.ultimasVendas?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50text-brand-500">
                                <tr>
                                    <th className="py-2 px-4">Vendedor</th>
                                    <th className="py-2 px-4">Valor</th>
                                    <th className="py-2 px-4">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics.ultimasVendas.map(venda => (
                                    <tr key={venda.idVenda} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 font-medium text-gray-900">{venda.nomeVendedor}</td>
                                        <td className="py-2 px-4 text-green-600 font-bold">{formatarParaMoeda(venda.valorVenda)}</td>
                                        <td className="py-2 px-4text-brand-500">{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-gray-500 py-4 text-center">Nenhuma venda recente.</p>}
            </div>
            
        </DashboardLayout>
    );
}