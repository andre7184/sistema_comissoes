// src/users/admin/components/VendedorForm.tsx

import type { Vendedor } from '../types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';

// Tipagem para os dados do formulário - AGORA USAMOS A MESMA TIPAGEM PARA CRIAÇÃO E EDIÇÃO NO FORM
interface VendedorFormData {
  nome: string;
  email: string;
  percentualComissao: number;
}

// Schema de validação
const schema = yup.object().shape({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres').max(100),
  email: yup.string().required('Email é obrigatório').email('Formato de email inválido').max(100),
  percentualComissao: yup.number()
    .required('Percentual é obrigatório')
    .min(0, 'Percentual não pode ser negativo')
    // --- ERRO ESTAVA AQUI ---
    // Corrigido para usar aspas duplas por fora
    .typeError("Percentual deve ser um número (use . para decimais)"),
});
// --- FIM DA CORREÇÃO ---

interface VendedorFormProps {
  // Passamos o Vendedor completo para preencher os campos
  initialData?: Vendedor; 
  // Função de submit que recebe os dados do formulário
  onSubmit: (data: VendedorFormData) => Promise<void>; 
  loading: boolean;
  error?: string | null;
}

export default function VendedorForm({ initialData, onSubmit, loading, error }: VendedorFormProps) {
  
  const isEditing = !!initialData;
  
  const defaultValues: VendedorFormData = {
    nome: initialData?.nome || '',
    email: initialData?.email || '',
    percentualComissao: initialData?.percentualComissao || 0.0,
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VendedorFormData>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues,
  });

  // Garante que o formulário seja redefinido se initialData mudar (útil para o modal)
  useEffect(() => {
    reset(defaultValues);
  }, [initialData]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
      )}

      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Vendedor</label>
        <input
          id="nome"
          type="text"
          {...register('nome')}
          className={`input-form ${errors.nome ? 'border-red-500' : 'border-gray-300'}`} // Removido 'bg-gray-100'
        />
        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Será o login)</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={`input-form ${errors.email ? 'border-red-500' : 'border-gray-300'}`} // Removido 'bg-gray-100'
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Percentual de Comissão */}
      <div>
        <label htmlFor="percentualComissao" className="block text-sm font-medium text-gray-700">Percentual de Comissão (%)</label>
        <input
          id="percentualComissao"
          type="number"
          step="0.01"
          {...register('percentualComissao', { valueAsNumber: true })} // Adicionado valueAsNumber para garantir que o register trate o input como number
          className={`input-form ${errors.percentualComissao ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: 5.50"
        />
        {errors.percentualComissao && <p className="text-xs text-red-500 mt-1">{errors.percentualComissao.message}</p>}
      </div>

      <div className="pt-4 text-center">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (isEditing ? 'Atualizar Vendedor' : 'Cadastrar Vendedor')}
        </button>
      </div>
    </form>
  );
}