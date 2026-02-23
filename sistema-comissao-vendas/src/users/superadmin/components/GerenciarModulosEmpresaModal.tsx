// src/users/superadmin/components/GerenciarModulosEmpresaModal.tsx

import { useEffect, useState } from 'react';
import type { Empresa, Modulo } from '../types';
import { superAdminService } from '../services/superAdminService';
import GenericFormModal from '../../../components/GenericFormModal';

interface GerenciarModulosProps {
  empresa: Empresa | null; // Empresa que estamos editando
  onClose: () => void;
  onSuccess: () => void; // Para recarregar a lista na página principal
}

export default function GerenciarModulosEmpresaModal({ empresa, onClose, onSuccess }: GerenciarModulosProps) {
  const [modulosDisponiveis, setModulosDisponiveis] = useState<Modulo[]>([]);
  const [modulosSelecionados, setModulosSelecionados] = useState<Set<number>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Busca os módulos disponíveis quando o modal abre
  useEffect(() => {
    if (empresa) {
      setLoading(true);
      superAdminService.listarModulosDisponiveis()
        .then(data => {
          setModulosDisponiveis(data);
          
          // --- CORREÇÃO AQUI ---
          // O erro que você reportou prova que 'empresa.modulosAtivos' é Modulo[].
          // Portanto, precisamos usar .map() para extrair os IDs (números).
          const idsAtuais = new Set(empresa.modulosAtivos.map(m => m.id));
          setModulosSelecionados(idsAtuais);
        })
        .catch(() => setError('Não foi possível carregar os módulos disponíveis.'))
        .finally(() => setLoading(false));
    }
  }, [empresa]);

  const handleToggleModulo = (id: number) => {
    setModulosSelecionados(prev => {
      const novosIds = new Set(prev);
      if (novosIds.has(id)) {
        novosIds.delete(id);
      } else {
        novosIds.add(id);
      }
      return novosIds;
    });
  };

  const handleSubmit = async () => {
    if (!empresa) return;

    setLoading(true);
    setError(null);

    const dados: { moduloIds: number[] } = {
      moduloIds: Array.from(modulosSelecionados) // Envia o array de IDs
    };

    try {
      await superAdminService.associarModulosEmpresa(empresa.id, dados);
      onSuccess(); // Sucesso! Avisa a página principal para recarregar
      onClose(); // Fecha o modal
    } catch (err: any) {
      console.error('Erro ao associar módulos:', err.response?.data || err.message);
      setError('Erro ao salvar. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GenericFormModal
      isOpen={!!empresa}
      onClose={onClose}
      title={`Gerenciar Módulos de: ${empresa?.nomeFantasia || ''}`}
      closeOnOutsideClick={false}
    >
      <div className="space-y-4">
        {loading && <p>Carregando módulos...</p>}
        {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <div className="max-h-60 overflow-y-auto space-y-2">
          {modulosDisponiveis.map(modulo => (
            <div key={modulo.id} className="flex items-center p-2 border rounded">
              <input
                type="checkbox"
                id={`modulo-${modulo.id}`}
                checked={modulosSelecionados.has(modulo.id)}
                onChange={() => handleToggleModulo(modulo.id)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor={`modulo-${modulo.id}`} className="ml-3 flex flex-col">
                <span className="font-medium text-gray-900">{modulo.nome}</span>
                <span className="text-smtext-brand-500">(R$ {modulo.precoMensal.toFixed(2)})</span>
              </label>
            </div>
          ))}
        </div>
        
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Módulos'}
          </button>
        </div>
      </div>
    </GenericFormModal>
  );
}