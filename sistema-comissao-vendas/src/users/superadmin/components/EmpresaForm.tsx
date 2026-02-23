// src/users/superadmin/components/EmpresaForm.tsx

import { useState, useEffect } from 'react';
import type { Empresa } from '../types'; // Importa os tipos
import { formatarCnpj } from '../../../utils/formatters'; // Importa o formatador

// Define o tipo dos dados gerenciados pelo formulário
interface EmpresaFormData {
    nomeFantasia: string;
    cnpj: string;
    razaoSocial: string;
    adminNome?: string;
    adminEmail?: string;
    adminSenha?: string;
}

interface EmpresaFormProps {
    initialData?: Empresa; // Recebe a Empresa completa para edição
    onSubmit: (data: EmpresaFormData) => Promise<void>; // Função que será chamada no submit
    loading: boolean; // Estado de loading vindo do pai
    error: string | null; // Estado de erro vindo do pai
}

export default function EmpresaForm({ initialData, onSubmit, loading, error }: EmpresaFormProps) {
    const isEditing = !!initialData; // Verifica se está em modo de edição

    // Estado interno para gerenciar os dados do formulário
    const [formData, setFormData] = useState<EmpresaFormData>(() => {
        // Define os valores iniciais baseado se está editando ou criando
        if (isEditing && initialData) {
            return {
                nomeFantasia: initialData.nomeFantasia,
                cnpj: initialData.cnpj,
                razaoSocial: initialData.razaoSocial || '',
            };
        }
        // Valores padrão para criação
        return {
            nomeFantasia: '',
            cnpj: '',
            razaoSocial: '',
            adminNome: '',
            adminEmail: '',
            adminSenha: '',
        };
    });

    // Efeito para resetar o formulário se initialData mudar (útil no modal)
    useEffect(() => {
        if (isEditing && initialData) {
             setFormData({
                nomeFantasia: initialData.nomeFantasia,
                cnpj: initialData.cnpj,
                razaoSocial: initialData.razaoSocial || '',
            });
        } else if (!isEditing) {
            // Reseta para o estado inicial de criação se initialData for null/undefined
            setFormData({
                nomeFantasia: '',
                cnpj: '',
                razaoSocial: '',
                adminNome: '',
                adminEmail: '',
                adminSenha: '',
            });
        }
    }, [initialData, isEditing]);


    // Handler genérico para atualizar o estado dos inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler específico para o CNPJ com formatação
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valorFormatado = formatarCnpj(e.target.value);
        setFormData(prev => ({ ...prev, cnpj: valorFormatado }));
    };

    // Função que chama o onSubmit do pai ao submeter
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData); // Passa os dados do estado local para a função do pai
    };

    // Validação simples para habilitar/desabilitar botão submit
    const isFormIncomplete = isEditing ?
      !formData.nomeFantasia || !formData.cnpj :
      !formData.nomeFantasia || !formData.cnpj || !formData.razaoSocial || // Adicionado razaoSocial
      !formData.adminNome || !formData.adminEmail || !formData.adminSenha;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Exibe erros do formulário */}
            {error && <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">{error}</div>}

            {/* Campos Nome Fantasia, CNPJ, Razão Social */}
            <input
                type="text"
                name="nomeFantasia" // Importante ter o 'name' para o handleChange
                placeholder="Nome Fantasia *"
                value={formData.nomeFantasia}
                onChange={handleChange}
                className="input-form w-full"
                required
            />
            <input
                type="text"
                name="cnpj"
                placeholder="CNPJ *"
                value={formData.cnpj}
                onChange={handleCnpjChange}
                maxLength={18}
                className="input-form w-full"
                required
            />
             <input
                type="text"
                name="razaoSocial"
                placeholder="Razão Social *"
                value={formData.razaoSocial}
                onChange={handleChange}
                className="input-form w-full"
                required
            />

            {/* Campos do Admin (apenas para cadastro) */}
            {!isEditing && (
                <>
                    <h4 className="text-md font-medium mt-6 mb-2 border-t pt-4 text-gray-600">Dados do Primeiro Administrador</h4>
                    <input type="text" name="adminNome" placeholder="Nome do Admin *" value={formData.adminNome} onChange={handleChange} className="input-form w-full" required />
                    <input type="email" name="adminEmail" placeholder="Email do Admin *" value={formData.adminEmail} onChange={handleChange} className="input-form w-full" required />
                    <input type="password" name="adminSenha" placeholder="Senha Inicial *" value={formData.adminSenha} onChange={handleChange} className="input-form w-full" required />
                </>
            )}

            {/* Botão de Submit (O botão Cancelar fica no Modal pai) */}
            <div className='mt-6 flex justify-end border-t pt-4'>
                <button
                    type="submit"
                    className={`text-white px-6 py-2 rounded transition ${loading || isFormIncomplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    disabled={loading || isFormIncomplete}
                >
                    {loading ? 'Processando...' : isEditing ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
                </button>
            </div>
        </form>
    );
}