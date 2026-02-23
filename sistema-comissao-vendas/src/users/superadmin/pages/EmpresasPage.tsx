// src/users/superadmin/pages/EmpresasPage.tsx

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout'; 
// Garante que Modulo e User estão importados se usados nos tipos
import type { Empresa, EmpresaRequestDTO, EmpresaUpdateRequestDTO } from '../types'; 
import { superAdminService } from '../services/superAdminService';
import { formatarCnpj } from '../../../utils/formatters';
import GenericFormModal from '../../../components/GenericFormModal'; 
import GerenciarModulosEmpresaModal from '../components/GerenciarModulosEmpresaModal'; 
// Importa o modal de criar Admin - CERTIFIQUE-SE QUE ESTE ARQUIVO EXISTE
import CriarAdminModal from '../components/CriarAdminModal'; 
// Importa o formulário de Empresa separado
import EmpresaForm from '../components/EmpresaForm';

// Helper para formatar data
const formatarDataSimples = (dataISO: string | null | undefined): string => {
    if (!dataISO) return 'N/A';
    try {
        return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(dataISO));
    } catch {
        return 'Data Inválida';
    }
};

export default function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [editandoEmpresa, setEditandoEmpresa] = useState<Empresa | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [loading, setLoading] = useState(false); // Loading da página
    const [formLoading, setFormLoading] = useState(false); // Loading do submit do form
    const [formError, setFormError] = useState<string | null>(null); // Erro do form

    const [empresaParaModulos, setEmpresaParaModulos] = useState<Empresa | null>(null);
    const [empresaParaCriarAdmin, setEmpresaParaCriarAdmin] = useState<Empresa | null>(null);

    // Função para buscar a lista de empresas
    const fetchEmpresas = async () => {
        setLoading(true);
        // Não limpa formError aqui, pois pertence ao modal
        try {
            const data = await superAdminService.listarEmpresas();
            setEmpresas(data);
        } catch (err: any) {
            console.error('Erro ao listar empresas:', err.response?.data || err.message);
            // Poderia definir um erro geral da página aqui, se desejado
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    // --- Funções para controlar o Modal de Cadastro/Edição de Empresa ---
    const handleOpenModalCadastro = () => {
        setEditandoEmpresa(null);
        setFormError(null);
        setIsFormModalOpen(true);
    };

    const handleOpenModalEdicao = (empresa: Empresa) => {
        setEditandoEmpresa(empresa);
        setFormError(null);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditandoEmpresa(null);
        setFormError(null);
    };

    // Função chamada pelo onSubmit do EmpresaForm
    const handleSubmitEmpresa = async (formData: any) => { 
        setFormError(null);
        setFormLoading(true);
        try {
            if (editandoEmpresa) {
                const updateData: EmpresaUpdateRequestDTO = { 
                    nomeFantasia: formData.nomeFantasia, 
                    cnpj: formData.cnpj, 
                    razaoSocial: formData.razaoSocial
                };
                await superAdminService.atualizarEmpresa(editandoEmpresa.id, updateData);
            } else {
                const createData: EmpresaRequestDTO = {
                    nomeFantasia: formData.nomeFantasia,
                    cnpj: formData.cnpj,
                    razaoSocial: formData.razaoSocial, // Adicione se DTO/API aceitar
                    adminNome: formData.adminNome,
                    adminEmail: formData.adminEmail,
                    adminSenha: formData.adminSenha,
                };
                // CORRIGIDO: Usa 'cadastrarEmpresa'
                await superAdminService.cadastrarEmpresa(createData); 
            }
            await fetchEmpresas();
            handleCloseFormModal();
        } catch (err: any) {
            console.error('Erro ao salvar empresa:', err.response?.data || err.message);
            const msg = err.response?.data?.message || `Erro ao ${editandoEmpresa ? 'atualizar' : 'cadastrar'} empresa. Verifique os dados.`;
            setFormError(msg); 
        } finally {
            setFormLoading(false);
        }
    };

    // --- Funções para abrir outros Modais ---
    const handleOpenGerenciarModulos = (empresa: Empresa) => {
        setEmpresaParaModulos(empresa);
    };
    const handleOpenCriarAdmin = (empresa: Empresa) => {
        setEmpresaParaCriarAdmin(empresa);
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Gerenciamento de Empresas</h2>
                <button 
                    onClick={handleOpenModalCadastro} 
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
                >
                    + Nova Empresa
                </button>
            </div>
            
            {/* Erro Geral da Página (se houver) */}
            {/* {error && !isFormModalOpen && <div className="p-3 mb-4 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>} */}

            {/* MODAL DE CADASTRO/EDIÇÃO EMPRESA */}
            <GenericFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                title={editandoEmpresa ? 'Atualizar Empresa' : 'Cadastrar Nova Empresa'}
                closeOnOutsideClick={false}
            >
                {/* Renderiza o componente de formulário separado */}
                <EmpresaForm
                    initialData={editandoEmpresa || undefined}
                    onSubmit={handleSubmitEmpresa}
                    loading={formLoading}
                    error={formError} // Passa o erro para ser exibido dentro do form
                />
                {/* Botão Cancelar fica AQUI, fora do <form> do EmpresaForm */}
                 <div className="mt-4 text-right border-t pt-4">
                     <button
                         type="button"
                         onClick={handleCloseFormModal}
                         className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
                         disabled={formLoading}
                     >
                         Cancelar
                     </button>
                 </div>
            </GenericFormModal>

            {/* MODAL PARA GERENCIAR MÓDULOS */}
            {empresaParaModulos && (
                <GerenciarModulosEmpresaModal
                    empresa={empresaParaModulos}
                    onClose={() => setEmpresaParaModulos(null)}
                    onSuccess={fetchEmpresas} 
                />
            )}
            
            {/* MODAL PARA CRIAR ADMIN */}
            {empresaParaCriarAdmin && (
                <CriarAdminModal
                    empresa={empresaParaCriarAdmin}
                    onClose={() => setEmpresaParaCriarAdmin(null)}
                    onSuccess={() => {
                        console.log("Admin criado, recarregando lista...");
                        fetchEmpresas(); // Recarrega a lista para mostrar o novo admin
                    }}
                />
            )}

            {/* LISTAGEM DE EMPRESAS */}
            {loading && empresas.length === 0 ? (
                <p className="text-gray-500">Carregando lista de empresas...</p>
            ) : !loading && empresas.length === 0 ? (
                <p className="text-gray-500">Nenhuma empresa cadastrada ainda.</p>
            ) : (
                <ul className="space-y-4"> 
                    {empresas.map((empresa) => (
                        <li 
                            key={empresa.id} 
                            // [MUDANÇA APLICADA AQUI] Fundo cinza/dark e borda lateral LARANJA
                            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow border-l-4 border-secondary-500 dark:border-primary-300"
                        >
                            <div className="flex justify-between items-start flex-col md:flex-row gap-4"> 
                                {/* Informações da Empresa */}
                                <div className='flex-1 min-w-[250px] space-y-1'>
                                    {/* Garantindo cor do texto */}
                                    <strong className="text-lg text-gray-800 dark:text-gray-100">{empresa.nomeFantasia}</strong> 
                                    <p className="text-sm text-gray-600 dark:text-gray-300">CNPJ: {formatarCnpj(empresa.cnpj)}</p>
                                    <p className="text-xstext-brand-500 dark:text-gray-400">Cadastro: {formatarDataSimples(empresa.dataCadastro)} (ID: {empresa.id})</p>
                                    
                                    {/* Exibição dos Admins */}
                                    <div className="pt-1">
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-200">Admins:</p>
                                        {/* ... (restante do código) */}
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {empresa.usuariosAdmin.map(admin => (
                                                // Corrigindo o fundo dos chips dos admins para serem visíveis no dark mode
                                                <span key={admin.id} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                                    {admin.email} {admin.nome ? `(${admin.nome})` : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* BOTÕES DE AÇÃO (Layout Vertical e Estilo de Botão) */}
                                <div className="flex flex-col space-y-2 items-stretch w-full md:w-auto mt-4 md:mt-0"> {/* Layout vertical */}
                                    <button 
                                        onClick={() => handleOpenModalEdicao(empresa)} 
                                        className="text-sm px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded text-center whitespace-nowrap transition duration-150 ease-in-out"
                                    > 
                                        Editar Dados 
                                    </button>
                                    <button 
                                        onClick={() => handleOpenGerenciarModulos(empresa)} 
                                        className="text-sm px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded text-center whitespace-nowrap transition duration-150 ease-in-out"
                                    > 
                                        Gerenciar Módulos 
                                    </button>
                                    <button 
                                        onClick={() => handleOpenCriarAdmin(empresa)} 
                                        className="text-sm px-4 py-2 bg-purple-500 hover:bg-purple-600 text-black rounded text-center whitespace-nowrap transition duration-150 ease-in-out"
                                    > 
                                        Adicionar Admin 
                                    </button>
                                </div>
                            </div>
                            {/* Módulos Ativos */}
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200 mr-2">Módulos Ativos:</span>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                    {empresa.modulosAtivos && empresa.modulosAtivos.length > 0
                                      ? empresa.modulosAtivos.map(m => m.nome).join(' | ') 
                                      : <span className="text-gray-400 italic">Nenhum</span>}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </DashboardLayout>
    );
}