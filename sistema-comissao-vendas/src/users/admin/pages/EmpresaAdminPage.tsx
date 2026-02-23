// src/users/admin/pages/EmpresaAdminPage.tsx

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../layouts/DashboardLayout'; 
import type { AdminEmpresa, AdminEmpresaCreateDTO, AdminEmpresaUpdateDTO } from '../types';
import { adminService } from '../services/adminService';
import GenericFormModal from '../../../components/GenericFormModal'; 
import UsuarioAdminForm from '../components/AdminForm'; // Importa o novo form

export default function GerenciarUsuariosAdminPage() {
    const [usuariosAdmin, setUsuariosAdmin] = useState<AdminEmpresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para o modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editandoUsuario, setEditandoUsuario] = useState<AdminEmpresa | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Busca a lista de usuários Admin
    const fetchUsuariosAdmin = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.listarAdminsDaEmpresa();
            setUsuariosAdmin(data);
        } catch (err: any) {
            toast.error("Erro ao buscar usuários admin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuariosAdmin();
    }, []);

    // Abre modal para Criar
    const handleOpenModalCadastro = () => {
        setEditandoUsuario(null);
        setFormError(null);
        setIsModalOpen(true);
    };

    // Abre modal para Editar
    const handleOpenModalEdicao = (usuario: AdminEmpresa) => {
        setEditandoUsuario(usuario);
        setFormError(null);
        setIsModalOpen(true);
    };

    // Fecha o modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditandoUsuario(null);
        setFormError(null);
    };

    // Função de Submit (chamada pelo UsuarioAdminForm)
    const handleSubmit = async (data: AdminEmpresaCreateDTO | AdminEmpresaUpdateDTO) => {
        setFormLoading(true);
        setFormError(null);
        try {
            if (editandoUsuario) {
                // Atualiza (passando o ID e o DTO de Update)
                await adminService.atualizarAdminDaEmpresa(editandoUsuario.id, data as AdminEmpresaUpdateDTO);
            } else {
                // Cria (passando o DTO de Create)
                await adminService.criarAdminDaEmpresa(data as AdminEmpresaCreateDTO);
            }
            await fetchUsuariosAdmin(); // Recarrega a lista
            handleCloseModal(); // Fecha modal
        } catch (err: any) {
             const msg = err.response?.data?.message || `Erro ao ${editandoUsuario ? 'atualizar' : 'criar'} usuário. Verifique os dados.`;
             toast.error(msg);
        } finally {
            toast.success(`Usuário ${editandoUsuario ? 'atualizado' : 'criado'} com sucesso!`);
            setFormLoading(false);
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários Admin</h1>
                <button
                    onClick={handleOpenModalCadastro}
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition" // Use seu estilo
                >
                    + Novo Usuário Admin
                </button>
            </div>

            {loading && <p>Carregando usuários...</p>}
            {error && <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>}

            {/* Tabela/Lista de Usuários Admin */}
            {!loading && !error && (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="th-cell">Nome</th>
                                <th className="th-cell">Email (Login)</th>
                                <th className="th-cell">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuariosAdmin.length === 0 && (
                                <tr><td colSpan={3} className="p-4 text-centertext-brand-500">Nenhum usuário admin encontrado.</td></tr>
                            )}
                            {usuariosAdmin.map(usuario => (
                                <tr key={usuario.id}>
                                    <td className="td-cell">{usuario.nome}</td>
                                    <td className="td-cell">{usuario.email}</td>
                                    <td className="td-cell space-x-2">
                                        <button
                                            onClick={() => handleOpenModalEdicao(usuario)}
                                            className="text-yellow-600 hover:text-yellow-800 text-xs font-medium"
                                        >
                                            Editar Nome
                                        </button>
                                        {/* Futuro: Botão Desativar/Resetar Senha */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Criação/Edição */}
            <GenericFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editandoUsuario ? `Editar Usuário: ${editandoUsuario.nome}` : 'Criar Novo Usuário Admin'}
                closeOnOutsideClick={false}
            >
                <UsuarioAdminForm
                    initialData={editandoUsuario || undefined}
                    onSubmit={handleSubmit}
                    loading={formLoading}
                    error={formError}
                />
                 {/* Botão Cancelar fica DENTRO do modal mas FORA do <form> */}
                 <div className="mt-4 text-right border-t pt-4">
                     <button type="button" onClick={handleCloseModal} className="btn-secondary" disabled={formLoading}> Cancelar </button>
                 </div>
            </GenericFormModal>

        </DashboardLayout>
    );
}