// src/components/AlterarSenhaModal.tsx

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState } from 'react';
import api from '../services/api'; // Importa a instância do Axios
import GenericFormModal from './GenericFormModal';

interface AlterarSenhaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SenhaForm {
    senhaAtual: string;
    novaSenha: string;
    confirmarNovaSenha: string;
}

// Schema de validação
const schema = yup.object().shape({
  senhaAtual: yup.string().required('Senha atual é obrigatória.'),
  novaSenha: yup.string()
    .required('Nova senha é obrigatória.')
    .min(6, 'A nova senha deve ter no mínimo 6 caracteres.')
    .max(50, 'A nova senha deve ter no máximo 50 caracteres.'),
  confirmarNovaSenha: yup.string()
    .oneOf([yup.ref('novaSenha')], 'As senhas não coincidem.')
    .required('Confirmação de senha é obrigatória.'),
});


export default function AlterarSenhaModal({ isOpen, onClose }: AlterarSenhaModalProps) {
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<SenhaForm>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: SenhaForm) => {
        setLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        
        const requestBody = {
            senhaAtual: data.senhaAtual,
            novaSenha: data.novaSenha,
        };

        try {
            // PUT /api/usuarios/me/senha
            await api.put('/api/usuarios/me/senha', requestBody); 
            
            setSuccessMessage('Senha alterada com sucesso! Você pode continuar logado.');
            reset(); // Limpa o formulário após o sucesso

        } catch (err: any) {
            console.error('Erro ao alterar senha:', err.response?.data || err.message);
            // 400 Bad Request / 401 Unauthorized (se a senha atual for inválida)
            setErrorMessage(err.response?.data?.message || 'Falha ao alterar senha. Verifique se a senha atual está correta.');
        } finally {
            setLoading(false);
        }
    };
    
    // Handler para fechar e resetar o estado
    const handleClose = () => {
        reset();
        setSuccessMessage(null);
        setErrorMessage(null);
        onClose();
    };

    return (
        <GenericFormModal
            isOpen={isOpen}
            onClose={handleClose}
            title="Alterar Minha Senha"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {successMessage && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{successMessage}</div>}
                {errorMessage && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{errorMessage}</div>}

                {/* Senha Atual */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                    <input type="password" {...register('senhaAtual')} className="input-form w-full" />
                    {errors.senhaAtual && <p className="text-xs text-red-500 mt-1">{errors.senhaAtual.message}</p>}
                </div>

                {/* Nova Senha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                    <input type="password" {...register('novaSenha')} className="input-form w-full" />
                    {errors.novaSenha && <p className="text-xs text-red-500 mt-1">{errors.novaSenha.message}</p>}
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                    <input type="password" {...register('confirmarNovaSenha')} className="input-form w-full" />
                    {errors.confirmarNovaSenha && <p className="text-xs text-red-500 mt-1">{errors.confirmarNovaSenha.message}</p>}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={handleClose} className="bg-gray-300 text-gray-800 px-6 py-2 rounded">Cancelar</button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-6 py-2 rounded transition disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Alterar Senha'}
                    </button>
                </div>
            </form>
        </GenericFormModal>
    );
}