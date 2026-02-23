// src/users/admin/components/VendaForm.tsx

// Adiciona Venda à importação de tipos
import type { Vendedor, VendaRequestDTO, Venda } from '../types'; 
import { useForm, type SubmitHandler, Controller } from 'react-hook-form'; 
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useMemo, useEffect } from 'react';
import { formatarParaMoeda, desformatarMoeda } from '../../../utils/formatters';


// DTO para o formulário (continua VendaRequestDTO)
type VendaFormData = VendaRequestDTO;

// Schema de validação (com descricaoVenda opcional)
const schema = yup.object().shape({
  vendedorId: yup.number()
    .required('Você deve selecionar um vendedor')
    .min(1, 'Seleção de vendedor inválida')
    .typeError('Você deve selecionar um vendedor'),
  valorVenda: yup.number()
    .required('O valor da venda é obrigatório')
    .min(0, 'O valor da venda não pode ser negativo') 
    .typeError('O valor deve ser um número (use . para decimais)'),
  descricaoVenda: yup.string()
      .max(50, 'Máximo 50 caracteres')
      .optional() 
      .default(''), 
});

interface VendaFormProps {
  initialData?: Venda; // Aceita dados iniciais para edição
  vendedores: Vendedor[];
  onSubmit: (data: VendaRequestDTO) => Promise<void>; 
  loading: boolean;
  error?: string | null;
}

export default function VendaForm({ initialData, vendedores, onSubmit, loading, error }: VendaFormProps) {
  
  const isEditing = !!initialData; // Flag de modo edição

  // Função para gerar valores padrão (criação ou edição)
  const getDynamicDefaultValues = (data: Venda | undefined): VendaFormData => {
      if (data) {
          // Mapeia Venda para VendaFormData
          return {
              vendedorId: data.vendedor.idVendedor, 
              valorVenda: data.valorVenda,
              descricaoVenda: data.descricaoVenda || '', 
          };
      }
      // Padrão para criação
      return { vendedorId: 0, valorVenda: 0.0, descricaoVenda: '' };
  };

  const { register, handleSubmit, setValue, watch, control, reset, formState: { errors } } = useForm<VendaFormData>({
    resolver: yupResolver(schema),
    defaultValues: getDynamicDefaultValues(initialData), 
  });

  // Estados para a busca de vendedor
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [vendedorSelecionadoNome, setVendedorSelecionadoNome] = useState(''); 

  const vendedorId = watch('vendedorId');
  
  // Efeito para preencher o formulário e a busca na edição
  useEffect(() => {
    // Reseta o formulário com os valores corretos
    reset(getDynamicDefaultValues(initialData));
  
    // Preenche o campo de busca do vendedor se estiver editando
    if (isEditing && initialData?.vendedor) {
      // Tenta encontrar o vendedor na lista para exibir nome e comissão
      const vendedorNaLista = vendedores.find(v => v.id === initialData.vendedor.idVendedor);
      if (vendedorNaLista) {
          const fullText = `${vendedorNaLista.nome} (Comissão: ${vendedorNaLista.percentualComissao}%)`;
          setVendedorSelecionadoNome(fullText);
          setSearchTerm(fullText);
      } else {
          // Fallback se o vendedor da venda não estiver na lista
          setVendedorSelecionadoNome(initialData.vendedor.nome);
          setSearchTerm(initialData.vendedor.nome);
      }
    } else if (!isEditing) {
        // Limpa busca se for modo de criação
         setVendedorSelecionadoNome('');
         setSearchTerm('');
    }

  }, [initialData, isEditing, reset, vendedores]); 


  // Lógica de filtro para o dropdown de vendedores
  const filteredVendedores = useMemo(() => {
    const vendedoresValidos = vendedores.filter(v => typeof v.id === 'number' && v.id > 0);
    if (!searchTerm || vendedorId > 0 || isEditing) return vendedoresValidos; // Não filtra se já selecionou ou está editando
    return vendedoresValidos.filter(vendedor => 
      vendedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendedor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vendedores, searchTerm, vendedorId, isEditing]);

  // Handler para selecionar um vendedor do dropdown
  const handleSelectVendedor = (vendedor: Vendedor) => {
    if (isEditing) return; // Não permite seleção na edição
    if (typeof vendedor.id !== 'number' || vendedor.id <= 0) {
        console.error("[VendaForm] Erro: Tentativa de selecionar vendedor com ID inválido.", vendedor);
        return;
    }
    const fullText = `${vendedor.nome} (Comissão: ${vendedor.percentualComissao}%)`;
    setValue('vendedorId', vendedor.id, { shouldValidate: true });
    setVendedorSelecionadoNome(fullText);
    setSearchTerm(fullText);
    setIsDropdownOpen(false);
  };
  
  // Handler para a mudança no input de busca
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) return; // Não permite busca na edição
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    // Zera o ID se o texto não corresponder mais ao vendedor selecionado
    if (vendedorId > 0 && !vendedorSelecionadoNome.toLowerCase().includes(value.toLowerCase())) {
        setValue('vendedorId', 0, { shouldValidate: true }); 
    }
    setVendedorSelecionadoNome(value); 
  };
  
  // Handler do submit do formulário
  const handleFormSubmit: SubmitHandler<VendaRequestDTO> = (data) => {
    onSubmit(data); // Chama a função onSubmit passada pelo VendasPage
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Exibição de Erro */}
      {error && ( 
        <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">
          {error}
        </div> 
      )}

      {/* Seleção de Vendedor - DESABILITADO NA EDIÇÃO */}
      <div>
        <label htmlFor="vendedorId" className="block text-sm font-medium text-gray-700">Vendedor</label>
        <div className="relative">
          <input
            id="vendedorSearch"
            type="text"
            autoComplete="nope"
            placeholder={isEditing ? 'Vendedor (não pode ser alterado)' : 'Digite o nome ou email...'} 
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => !isEditing && setIsDropdownOpen(true)} 
            onBlur={() => { setTimeout(() => setIsDropdownOpen(false), 200); }} // Delay para permitir clique no dropdown
            disabled={isEditing} 
            className={`input-form ${errors.vendedorId ? 'border-red-500' : 'border-gray-300'} ${isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
          />
          <input type="hidden" {...register('vendedorId', { valueAsNumber: true })} /> 

          {/* Dropdown só aparece se não estiver editando */}
          {!isEditing && isDropdownOpen && filteredVendedores.length > 0 && ( 
             <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
              {filteredVendedores.map(v => ( 
                <li key={v.id} onMouseDown={() => handleSelectVendedor(v)} className={`p-2 cursor-pointer hover:bg-blue-100 ${v.id === vendedorId ? 'bg-blue-50 font-semibold' : ''}`} >
                  {v.nome} <span className="text-gray-500 text-sm">(Comissão: {v.percentualComissao}%)</span>
                </li> 
              ))}
            </ul>
          )}
        </div>
        {/* Mensagem de erro específica do vendedor */}
        {errors.vendedorId && <p className="text-xs text-red-500 mt-1">{errors.vendedorId.message}</p>}
        {/* Mostra o nome selecionado */}
        {vendedorId > 0 && vendedorSelecionadoNome && ( <p className="text-xs text-green-600 mt-1">Vendedor: {vendedorSelecionadoNome}</p> )}
      </div>

      {/* Valor da Venda (Com Controller para Moeda) */}
      <div>
        <label htmlFor="valorVenda" className="block text-sm font-medium text-gray-700">Valor da Venda (R$)</label>
        <Controller
            name="valorVenda"
            control={control}
            render={({ field }) => (
                <input
                    id="valorVenda"
                    type="text" 
                    value={formatarParaMoeda(field.value)} 
                    onChange={(e) => {
                        const numericValue = desformatarMoeda(e.target.value);
                        field.onChange(numericValue); 
                    }}
                    className={`input-form ${errors.valorVenda ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="R$ 0,00"
                />
            )}
        />
        {errors.valorVenda && <p className="text-xs text-red-500 mt-1">{errors.valorVenda.message}</p>}
      </div>
      
      {/* Descrição da Venda */}
      <div>
          <label htmlFor="descricaoVenda" className="block text-sm font-medium text-gray-700">Descrição da Venda (Opcional)</label>
          <input
            id="descricaoVenda" // ID corrigido
            type="text"
            {...register('descricaoVenda')} 
            className={`input-form ${errors.descricaoVenda ? 'border-red-500' : 'border-gray-300'}`}
            maxLength={50} 
          />
          {errors.descricaoVenda && <p className="text-xs text-red-500 mt-1">{errors.descricaoVenda.message}</p>}
      </div>
      
      {/* Botão de Submit (Texto dinâmico) */}
      <div className="pt-4 text-center">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Salvando...' : (isEditing ? 'Atualizar Venda' : 'Lançar Venda')} 
        </button>
      </div>
    </form>
  );
}