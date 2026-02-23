// src/users/admin/components/AdminForm.tsx

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import type { AdminEmpresa, AdminEmpresaCreateDTO, AdminEmpresaUpdateDTO } from '../types'; 

interface AdminFormData {
    nome: string;
    email: string;
    senha: string; // Já corrigido para string
}

// Schema de validação DINÂMICO (inalterado)
const createValidationSchema = (isEditing: boolean) => yup.object().shape({
    nome: yup.string().required('Nome é obrigatório').min(3).max(100),
    email: yup.string().required('Email é obrigatório').email('Formato inválido').max(100),
    senha: isEditing 
        ? yup.string().optional().default('') 
        : yup.string().required('Senha inicial é obrigatória').min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

interface AdminFormProps {
    initialData?: AdminEmpresa; 
    onSubmit: (data: AdminEmpresaCreateDTO | AdminEmpresaUpdateDTO) => Promise<void>;
    loading: boolean;
    error: string | null;
}

export default function AdminForm({ initialData, onSubmit, loading, error }: AdminFormProps) {
    const isEditing = !!initialData;

    // Função para gerar valores padrão (só para useForm)
    const getDynamicDefaultValues = (data: AdminEmpresa | undefined): AdminFormData => {
        return {
            nome: data?.nome || '',
            email: data?.email || '',
            senha: '', 
        };
    };

    const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminFormData>({
        resolver: yupResolver(createValidationSchema(isEditing)), 
        defaultValues: getDynamicDefaultValues(initialData),
    });

    // Efeito para resetar (AJUSTADO PARA SER MAIS EXPLÍCITO)
    useEffect(() => {
        // Verifica explicitamente o modo
        if (isEditing && initialData) {
            // Modo Edição: Reseta com os dados iniciais
            reset({
                nome: initialData.nome || '',
                email: initialData.email || '',
                senha: '', // Senha nunca é preenchida na edição
            });
        } else if (!isEditing) {
            // Modo Cadastro: Reseta explicitamente para os valores vazios
            reset({
                nome: '',
                email: '',
                senha: '',
            });
        }
    // Adiciona 'isEditing' às dependências
    }, [initialData, isEditing, reset]);

    // Função interna de submit (inalterada)
    const handleFormSubmit = (formData: AdminFormData) => {
        if (isEditing && initialData) {
            const updateData: AdminEmpresaUpdateDTO = { 
                nome: formData.nome,
                email: formData.email,
             };
            onSubmit(updateData);
        } else {
            const createData: AdminEmpresaCreateDTO = { 
                nome: formData.nome, 
                email: formData.email, 
                senha: formData.senha!,
            };
            onSubmit(createData);
        }
    };

    return (
        // O JSX do formulário permanece o mesmo
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm border border-red-300">{error}</div>}

            {/* Nome */}
            <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                <input id="nome" type="text" {...register('nome')} className={`input-form w-full mt-1 ${errors.nome ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Login)</label>
                <input id="email" type="email" {...register('email')} disabled={isEditing} className={`input-form w-full mt-1 ${errors.email ? 'border-red-500' : 'border-gray-300'} ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                {isEditing && <p className="text-xstext-brand-500 mt-1">O email não pode ser alterado após o cadastro.</p>}
            </div>

            {/* Senha (Apenas na Criação) */}
            {!isEditing && (
                <div>
                    <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha Inicial</label>
                    <input id="senha" type="password" {...register('senha')} className={`input-form w-full mt-1 ${errors.senha ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.senha && <p className="text-xs text-red-500 mt-1">{errors.senha.message}</p>}
                </div>
            )}

            {/* Botão Submit */}
            <div className="pt-5 text-right">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline disabled:opacity-50" disabled={loading}>
                    {loading ? 'Salvando...' : (isEditing ? 'Atualizar Usuário' : 'Criar Usuário')}
                </button>
            </div>
        </form>
    );
}