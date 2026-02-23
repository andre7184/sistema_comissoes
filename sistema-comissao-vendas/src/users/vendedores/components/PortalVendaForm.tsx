import type { PortalVendaRequestDTO } from '../types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// 1. Importe o componente CurrencyInput
import CurrencyInput from '../../../components/CurrencyInput';

const schema = yup.object().shape({
  valorVenda: yup.number()
    .required('O valor da venda é obrigatório')
    .moreThan(0, 'O valor da venda deve ser maior que zero'),
  descricaoVenda: yup.string()
    .required('A descrição é obrigatória')
    .min(5, 'Descrição muito curta.'),
});

interface PortalVendaFormProps {
  onSubmit: (data: PortalVendaRequestDTO) => Promise<void>; 
  loading: boolean;
  error?: string | null;
}

export default function PortalVendaForm({ onSubmit, loading, error }: PortalVendaFormProps) {
  
  // 2. Adicione 'control' aqui para passar ao CurrencyInput
  const { register, handleSubmit, control, formState: { errors } } = useForm<PortalVendaRequestDTO>({
    resolver: yupResolver(schema),
    defaultValues: { valorVenda: 0.0, descricaoVenda: '' }, 
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">{error}</div>
      )}

      {/* --- CAMPO 1: VALOR DA VENDA (Padronizado com CurrencyInput) --- */}
      <CurrencyInput
        name="valorVenda"
        label="Valor da Venda"
        control={control}
        error={errors.valorVenda?.message}
        placeholder="R$ 0,00"
      />

      {/* --- CAMPO 2: DESCRIÇÃO DA VENDA --- */}
      <div>
        <label htmlFor="descricaoVenda" className="block text-sm font-medium text-gray-700 mb-1">Descrição da Venda</label>
        <textarea
          id="descricaoVenda"
          {...register('descricaoVenda')}
          rows={3}
          className={`input-form resize-none ${errors.descricaoVenda ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: Venda de consultoria, Pacote Premium..."
        />
        {errors.descricaoVenda && <p className="text-xs text-red-500 mt-1">{errors.descricaoVenda.message}</p>}
      </div>

      <div className="pt-4 border-t flex justify-end">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 transition disabled:bg-gray-400 font-medium"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Lançar Venda'}
        </button>
      </div>
    </form>
  );
}