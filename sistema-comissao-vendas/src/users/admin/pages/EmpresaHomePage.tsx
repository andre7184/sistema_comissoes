// src/users/admin/pages/EmpresaHomePage.tsx

import { useEffect, useState, useContext, useMemo } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { adminService } from '../services/adminService';
import type { EmpresaInfo, ModuloDetalhe } from '../types';
import { AuthContext } from '../../../contexts/AuthContext'; // Para pegar permissões (módulos ativos)
import { formatarParaMoeda, formatarCnpj } from '../../../utils/formatters'; // Formatadores
import { Link } from 'react-router-dom'; // Para o link de Gerenciar Módulos

export default function EmpresaHomePage() {
    const { permissoes } = useContext(AuthContext); // Módulos ativos do usuário logado
    const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo | null>(null);
    const [modulosCatalogo, setModulosCatalogo] = useState<ModuloDetalhe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Busca dados da empresa e catálogo de módulos em paralelo
                const [info, catalogo] = await Promise.all([
                    adminService.buscarInfoEmpresa(),
                    adminService.listarDetalhesModulos(),
                ]);
                setEmpresaInfo(info);
                setModulosCatalogo(catalogo);
            } catch (e: any) {
                toast.error("Erro ao carregar dados da home da empresa.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filtra os módulos do catálogo para separar ativos e disponíveis
    const modulosAtivos = useMemo(() => {
        const permissoesSet = new Set(permissoes || []);
        return modulosCatalogo.filter(modulo => permissoesSet.has(modulo.chave));
    }, [modulosCatalogo, permissoes]);

    const modulosDisponiveis = useMemo(() => {
        const permissoesSet = new Set(permissoes || []);
        // Retorna módulos que NÃO estão na lista de permissões
        return modulosCatalogo.filter(modulo => !permissoesSet.has(modulo.chave));
    }, [modulosCatalogo, permissoes]);


    if (loading) {
        return <DashboardLayout><p className="p-6 text-center text-gray-600">Carregando Home da Empresa...</p></DashboardLayout>;
    }

    if (error) {
        return <DashboardLayout><div className="p-6 bg-red-100 text-red-700 rounded-lg">{error}</div></DashboardLayout>;
    }

    return (
        <DashboardLayout>
            <h1 className="text-xl font-bold text-gray-800 mb-6">Bem-vindo(a)!</h1>

            {/* SEÇÃO 1: DADOS DA EMPRESA */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Sua Empresa</h2>
                {empresaInfo ? (
                    <div className="space-y-3 text-gray-600">
                        <p><span className="font-medium text-gray-800">Nome Fantasia:</span> {empresaInfo.nomeFantasia}</p>
                        <p><span className="font-medium text-gray-800">Razão Social:</span> {empresaInfo.razaoSocial}</p>
                        <p><span className="font-medium text-gray-800">CNPJ:</span> {formatarCnpj(empresaInfo.cnpj)}</p>
                    </div>
                ) : (
                    <p className="text-gray-500">Dados da empresa não disponíveis.</p>
                )}
                 {/* Link Opcional para editar dados da empresa (se houver essa funcionalidade) */}
                 {/* <div className="mt-4 text-right border-t pt-4">
                    <Link to="/empresa/editar" className="text-blue-600 hover:underline text-sm font-medium">
                        Editar Dados &rarr;
                    </Link>
                </div> */}
            </section>

            {/* SEÇÃO 2: MÓDULOS ATIVOS */}
            <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-green-700">Módulos Ativos</h2>
                    <Link to="/empresa/meus-modulos" className="text-blue-600 hover:underline text-sm font-medium">
                        Gerenciar &rarr;
                    </Link>
                </div>
                {modulosAtivos.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {modulosAtivos.map(modulo => (
                            <li key={modulo.id} className="py-4 flex justify-between items-center flex-wrap gap-2">
                                <div>
                                    <p className="font-semibold text-gray-800">{modulo.nome} <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">{modulo.chave}</span></p>
                                    <p className="text-smtext-brand-500 mt-1">{modulo.descricaoCurta || 'Sem descrição.'}</p>
                                </div>
                                <span className="font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                                    {formatarParaMoeda(modulo.precoMensal)} / mês
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 py-4">Você ainda não possui módulos ativos.</p>
                )}
            </section>

            {/* SEÇÃO 3: MÓDULOS DISPONÍVEIS */}
            <section className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-semibold text-blue-700">Módulos Disponíveis</h2>
                     <Link to="/empresa/meus-modulos" className="text-blue-600 hover:underline text-sm font-medium">
                        Contratar &rarr;
                    </Link>
                </div>
                {modulosDisponiveis.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {modulosDisponiveis.map(modulo => (
                            <li key={modulo.id} className="py-4 flex justify-between items-center flex-wrap gap-2">
                                <div>
                                    <p className="font-semibold text-gray-800">{modulo.nome}</p>
                                    <p className="text-smtext-brand-500 mt-1">{modulo.descricaoCurta || 'Sem descrição.'}</p>
                                </div>
                                <div className='text-right'>
                                     <span className="font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm block mb-1 whitespace-nowrap">
                                        {formatarParaMoeda(modulo.precoMensal)} / mês
                                    </span>
                                    {/* Link direto para a página de gerenciamento */}
                                    <Link to="/empresa/meus-modulos" className="text-blue-600 hover:underline text-xs font-medium">
                                        Ver detalhes
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 py-4">Todos os módulos disponíveis já estão ativos ou o catálogo está indisponível.</p>
                )}
            </section>

        </DashboardLayout>
    );
}