// src/users/superadmin/components/CriarAdminModal.tsx

import { useState } from 'react';
import type { Empresa, AdminUsuarioRequestDTO } from '../types'; // Importa tipos necessários
import { superAdminService } from '../services/superAdminService'; // Importa o serviço
import GenericFormModal from '../../../components/GenericFormModal'; // Importa o modal genérico

interface Props {
    empresa: Empresa; // A empresa para a qual o Admin será criado
    onClose: () => void; // Função para fechar o modal
    onSuccess: () => void; // Função chamada após sucesso (ex: recarregar lista)
}

export default function CriarAdminModal({ empresa, onClose, onSuccess }: Props) {
    // Estados para controlar os campos do formulário
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Função de submit do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // Cria o DTO com os dados do formulário
            const data: AdminUsuarioRequestDTO = { nome, email, senha };
            // Chama o serviço da API passando o ID da empresa e os dados do admin
            await superAdminService.criarAdminUsuario(empresa.id, data);
            onSuccess(); // Chama a função de sucesso (ex: recarregar lista na página pai)
            onClose(); // Fecha o modal
        } catch (err: any) {
             // Trata erros da API
             setError(err.response?.data?.message || "Erro ao criar usuário admin. Verifique se o email já existe.");
        } finally {
            setLoading(false);
        }
    };
    
    // Validação simples para o botão de submit
    const isFormIncomplete = !nome || !email || !senha;

    return (
        <GenericFormModal 
            isOpen={true} // O modal é controlado pelo estado 'empresaParaCriarAdmin' na página pai
            onClose={onClose} 
            title={`Adicionar Novo Admin para ${empresa.nomeFantasia}`} 
            closeOnOutsideClick={false} // Não fecha ao clicar fora
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                 {/* Exibe erros do formulário */}
                 {error && <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">{error}</div>}
                
                {/* Campos do formulário */}
                <input 
                    type="text" 
                    placeholder="Nome do Novo Admin *" 
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    className="input-form w-full" 
                    required 
                />
                <input 
                    type="email" 
                    placeholder="Email do Novo Admin *" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="input-form w-full" 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Senha Inicial *" 
                    value={senha} 
                    onChange={e => setSenha(e.target.value)} 
                    className="input-form w-full" 
                    required 
                />
                
                {/* Botões */}
                <div className='mt-6 flex justify-end gap-3 border-t pt-4'>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={loading} 
                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading || isFormIncomplete} 
                        className={`text-white px-6 py-2 rounded transition ${loading || isFormIncomplete ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`} // Cor roxa para diferenciar
                    >
                        {loading ? 'Criando...' : 'Criar Novo Admin'}
                    </button>
                </div>
            </form>
        </GenericFormModal>
    );
}