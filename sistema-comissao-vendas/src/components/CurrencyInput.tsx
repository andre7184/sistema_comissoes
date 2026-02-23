import { Controller, type Control } from 'react-hook-form';
// Importa as funções do seu utilitário existente
import { formatarParaMoeda, desformatarMoeda } from '../utils/formatters'; 

interface CurrencyInputProps {
  name: string;
  label: string;
  control: Control<any>;
  error?: string;
  placeholder?: string;
}

export default function CurrencyInput({ name, label, control, error, placeholder }: CurrencyInputProps) {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          
          // Lógica simplificada usando o seu utilitário
          const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // O seu 'desformatarMoeda' já extrai dígitos e divide por 100
            // Ex: digita "1500" -> retorna 15.00
            const valorNumerico = desformatarMoeda(e.target.value);
            
            // Atualiza o estado do formulário com o número float
            onChange(valorNumerico);
          };

          return (
            <input
              id={name}
              type="text"
              // O seu 'formatarParaMoeda' já trata null/undefined e formata para R$
              value={formatarParaMoeda(value)} 
              onChange={handleChange}
              placeholder={placeholder}
              className={`input-form ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            />
          );
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}