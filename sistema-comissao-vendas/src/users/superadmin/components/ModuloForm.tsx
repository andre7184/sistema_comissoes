// src/users/superadmin/components/ModuloForm.tsx

import type { ModuloRequestDTO, ModuloStatus } from '../types';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// IMPORTANTE: Importar ObjectSchema
import * as yup from 'yup';
import type { ObjectSchema } from 'yup'; 
import { useEffect } from 'react';

// Define as opções de Status do Módulo
const statusOptions: { value: ModuloStatus; label: string }[] = [
  { value: 'EM_DESENVOLVIMENTO', label: 'Em Desenvolvimento' },
  { value: 'EM_TESTE', label: 'Em Teste' },
  { value: 'PRONTO_PARA_PRODUCAO', label: 'Pronto para Produção' },
  { value: 'ARQUIVADO', label: 'Arquivado' },
];

// --- MUDANÇA 1: Tipar explicitamente o schema ---
// Força o schema a bater 100% com a interface ModuloRequestDTO
const schema: ObjectSchema<ModuloRequestDTO> = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(3, 'Mínimo 3 caracteres').max(100),
  chave: yup.string().required('Chave é obrigatória').min(3, 'Mínimo 3 caracteres').max(50),
  status: yup.string<ModuloStatus>().required('Status é obrigatório').oneOf(statusOptions.map(s => s.value)),
  
  // --- MUDANÇA 2: Corrigir o campo opcional ---
  // 1. O formulário usará '', então 'transform' converte '' para 'undefined'
  // 2. 'optional()' marca o campo como opcional no schema, batendo com 'descricaoCurta?:'
  descricaoCurta: yup.string()
    .transform((value) => (value === '' ? undefined : value))
    .max(500, 'Máximo 500 caracteres')
    .optional(), //
  
  precoMensal: yup.number().required('Preço é obrigatório').min(0, 'Preço não pode ser negativo').typeError('Preço deve ser um número'),
  isPadrao: yup.boolean().required(),
});

interface ModuloFormProps {
  initialData?: ModuloRequestDTO;
  onSubmit: (data: ModuloRequestDTO) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export default function ModuloForm({ initialData, onSubmit, loading, error }: ModuloFormProps) {
  
  // --- MUDANÇA 3: Ajustar os valores padrão ---
  // O formulário DEVE usar '' (string vazia) para campos de texto controlados
  const getDynamicDefaultValues = (data: ModuloRequestDTO | undefined): ModuloRequestDTO => {
    if (data) {
      // Se está editando, garante que 'undefined' ou 'null' vire ''
      return {
        ...data,
        descricaoCurta: data.descricaoCurta || '', 
      };
    }
    // Se está criando, usa os padrões com ''
    return {
      nome: '',
      chave: '',
      status: 'EM_DESENVOLVIMENTO',
      descricaoCurta: '', // O input de texto DEVE ser controlado com '', não 'undefined'
      precoMensal: 0.0,
      isPadrao: false,
    };
  };

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ModuloRequestDTO>({
    resolver: yupResolver(schema),
    // Define os valores padrão dinamicamente
    defaultValues: getDynamicDefaultValues(initialData), 
  });

  // Reseta o formulário se o initialData mudar (ex: ao selecionar outro item para editar)
  useEffect(() => {
    // A função 'getDynamicDefaultValues' garante que os valores de reset estão corretos
    reset(getDynamicDefaultValues(initialData));
  }, [initialData, reset]);

  return (
    // --- MUDANÇA 4: O erro em handleSubmit(onSubmit) foi resolvido pelas mudanças 1, 2 e 3 ---
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4"> 
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
      )}

      {/* Nome */}
      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome do Módulo</label>
        <input
          id="nome"
          type="text"
          {...register('nome')}
          className={`input-form ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome.message}</p>}
      </div>

      {/* Chave */}
      <div>
        <label htmlFor="chave" className="block text-sm font-medium text-gray-700">Chave (Identificador Único)</label>
        <input
          id="chave"
          type="text"
          {...register('chave')}
          className={`input-form ${errors.chave ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: COMISSOES_CORE"
        />
        {errors.chave && <p className="text-xs text-red-500 mt-1">{errors.chave.message}</p>}
      </div>
      
      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <select
              id="status"
              {...field}
              className={`input-form ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}
        />
        {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
      </div>
      
      {/* Preço Mensal */}
      <div>
        <label htmlFor="precoMensal" className="block text-sm font-medium text-gray-700">Preço Mensal (R$)</label>
        <input
          id="precoMensal"
          type="number"
          step="0.01"
          {...register('precoMensal')}
          className={`input-form ${errors.precoMensal ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: 49.90"
        />
        {errors.precoMensal && <p className="text-xs text-red-500 mt-1">{errors.precoMensal.message}</p>}
      </div>
      
      {/* Descrição Curta */}
      <div>
        <label htmlFor="descricaoCurta" className="block text-sm font-medium text-gray-700">Descrição Curta (Opcional)</label>
        <textarea
          id="descricaoCurta"
          {...register('descricaoCurta')}
          rows={3}
          className={`input-form ${errors.descricaoCurta ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.descricaoCurta && <p className="text-xs text-red-500 mt-1">{errors.descricaoCurta.message}</p>}
      </div>

      {/* Checkbox: Módulo Padrão? */}
      <div className="flex items-center">
        <Controller
          name="isPadrao"
          control={control}
          render={({ field }) => (
            <input
              id="isPadrao"
              type="checkbox"
              // Ajuste para garantir que o checkbox seja controlado corretamente
              checked={!!field.value} 
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          )}
        />
        <label htmlFor="isPadrao" className="ml-2 block text-sm text-gray-900">
          Módulo Padrão? (Associado automaticamente no cadastro de novas empresas)
        </label>
      </div>

      {/* Botão de Submit (O botão de Cancelar fica no Modal) */}
      <div className="pt-4 text-right">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar Módulo'}
        </button>
      </div>
    </form>
  );
}