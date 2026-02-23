import React from 'react';

const STATUS_OPTIONS = [
  'EM_DESENVOLVIMENTO',
  'EM_TESTE',
  'PRONTO_PARA_PRODUCAO',
  'ARQUIVADO',
];

// DTO de Requisição (Para o estado do formulário)
interface ModuloForm {
    nome: string;
    chave: string;
    status: string;
    descricaoCurta: string;
    precoMensal: number;
    isPadrao: boolean;
}

interface ModuloFormContentProps {
    form: ModuloForm;
    error: string | null;
    loading: boolean;
    editandoId: number | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleCancel: () => void;
}

export default function ModuloFormContent({ 
    form, 
    error, 
    loading, 
    editandoId, 
    handleChange, 
    handleSubmit, 
    handleCancel 
}: ModuloFormContentProps) {
    
    const isEditing = !!editandoId;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 border border-red-400 rounded text-sm">{error}</div>}

            {/* Linha 1: Nome e Chave */}
            <div className="flex gap-4">
                <input type="text" name="nome" placeholder="Nome do Módulo" value={form.nome} onChange={handleChange} required className="border p-2 rounded flex-1" />
                <input type="text" name="chave" placeholder="CHAVE_UNICA_MODULO" value={form.chave} onChange={handleChange} required disabled={isEditing} className="border p-2 rounded flex-1 disabled:bg-gray-100" />
            </div>

            {/* Linha 2: Status, Preço e Padrão */}
            <div className="flex gap-4 items-center">
                <select name="status" value={form.status} onChange={handleChange} required className="border p-2 rounded flex-1">
                    {STATUS_OPTIONS.map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                <input type="number" name="precoMensal" placeholder="Preço Mensal" value={form.precoMensal} onChange={handleChange} min="0" step="0.01" required className="border p-2 rounded w-40" />
                <label className="flex items-center space-x-2 w-auto">
                    <input type="checkbox" name="isPadrao" checked={form.isPadrao} onChange={handleChange} className="form-checkbox h-4 w-4" />
                    <span className='text-sm'>Módulo Padrão</span>
                </label>
            </div>
            
            {/* Linha 3: Descrição Curta */}
            <textarea name="descricaoCurta" placeholder="Descrição Curta (Opcional)" value={form.descricaoCurta} onChange={handleChange} rows={2} className="border p-2 rounded w-full"></textarea>

            {/* Botões */}
            <div className='flex gap-2 justify-end pt-4 border-t mt-4'>
                <button type="button" onClick={handleCancel} disabled={loading} className="px-6 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 transition">
                    Cancelar
                </button>
                <button type="submit" disabled={loading} className={`px-6 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}>
                    {loading ? 'Salvando...' : isEditing ? 'Atualizar Módulo' : 'Cadastrar Módulo'}
                </button>
            </div>
        </form>
    );
}