// src/users/superadmin/pages/ModulosPage.tsx

import { useEffect, useState } from 'react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { Modulo, ModuloRequestDTO } from '../types';
import { superAdminService } from '../services/superAdminService';
import GenericFormModal from '../../../components/GenericFormModal';
import ModuloForm from '../components/ModuloForm'; // Certifique-se que este componente existe

// Helper para formatar o Status para exibição
const getStatusClass = (status: string) => {
  switch (status) {
    case 'PRONTO_PARA_PRODUCAO': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'; // Adicionando dark mode
    case 'EM_DESENVOLVIMENTO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'; // Adicionando dark mode
    case 'ARQUIVADO': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'; // Adicionando dark mode
    default: return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'; // Adicionando dark mode
  }
};
const getStatusText = (status: string) => status.replace('_', ' ');

export default function ModulosPage() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoModulo, setEditandoModulo] = useState<Modulo | null>(null);
  
  const [loading, setLoading] = useState(false); // Loading da lista
  const [formLoading, setFormLoading] = useState(false); // Loading do submit do form
  const [formError, setFormError] = useState<string | null>(null);

  const fetchModulos = async () => {
    setLoading(true);
    try {
      const data = await superAdminService.listarModulos();
      setModulos(data);
    } catch (err) {
      console.error("Erro ao buscar módulos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModulos();
  }, []);

  const handleOpenModalCadastro = () => {
    setEditandoModulo(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenModalEdicao = (modulo: Modulo) => {
    setEditandoModulo(modulo);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditandoModulo(null);
    setFormError(null);
  };

  const handleSubmit = async (data: ModuloRequestDTO) => {
    setFormLoading(true);
    setFormError(null);
    
    try {
      if (editandoModulo) {
        // ATUALIZAR (PUT)
        await superAdminService.atualizarModulo(editandoModulo.id, data);
      } else {
        // CADASTRAR (POST)
        await superAdminService.cadastrarModulo(data);
      }
      
      await fetchModulos(); // Recarrega a lista
      handleCloseModal(); // Fecha o modal
      
    } catch (err: any) {
      console.error('Erro ao salvar módulo:', err.response?.data || err.message);
      const msg = err.response?.data?.message || `Erro ao ${editandoModulo ? 'atualizar' : 'cadastrar'}. Verifique os dados (ex: a Chave já existe?)`;
      setFormError(msg); // Exibe o erro dentro do modal
    } finally {
      setFormLoading(false);
    }
  };
  
  const getInitialFormData = (): ModuloRequestDTO | undefined => {
    if (!editandoModulo) return undefined;
    
    return {
      nome: editandoModulo.nome,
      chave: editandoModulo.chave,
      status: editandoModulo.status,
      descricaoCurta: editandoModulo.descricaoCurta || '',
      precoMensal: editandoModulo.precoMensal,
      isPadrao: editandoModulo.isPadrao,
    };
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gerenciar Catálogo de Módulos</h2>
        <button
          onClick={handleOpenModalCadastro}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
        >
          + Novo Módulo
        </button>
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO (Mantido) */}
      <GenericFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editandoModulo ? 'Editar Módulo' : 'Cadastrar Novo Módulo'}
        closeOnOutsideClick={false}
      >
        <ModuloForm
          onSubmit={handleSubmit}
          initialData={getInitialFormData()}
          loading={formLoading}
          error={formError}
        />
      </GenericFormModal>

      {/* LISTAGEM DE MÓDULOS */}
      
      {/* 1. Aplica a borda superior com a cor primária no título */}

      {loading ? (
        <p className="text-gray-500">Carregando módulos...</p>
      ) : modulos.length === 0 ? (
         <p className="text-gray-500">Nenhum módulo cadastrado ainda.</p>
      ) : (
        // 2. Transforma a listagem em UL/LI para usar o estilo de cartão com borda lateral
        <ul className="space-y-4"> 
          {modulos.map((modulo) => (
            <li 
              key={modulo.id} 
              // Aplica fundo, sombra e a borda lateral com a cor primária
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow border-l-4 border-secondary-500 dark:border-primary-300"
            >
              <div className="flex justify-between items-start flex-col sm:flex-row gap-3">
                
                {/* Informações Principais (Nome, Chave, Descrição) */}
                <div className='flex-1 min-w-[200px] space-y-1'>
                  <strong className="text-lg text-gray-800 dark:text-gray-100">{modulo.nome}</strong> 
                  <p className="text-sm text-gray-600 dark:text-gray-300">Chave: <span className="text-primary-500 dark:text-primary-300">{modulo.chave}</span></p>
                  {modulo.descricaoCurta && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">{modulo.descricaoCurta}</p>
                  )}
                </div>
                
                {/* Detalhes (Status, Preço, Padrão) - Alinhado no topo */}
                <div className="flex flex-col space-y-2 w-full sm:w-auto text-sm">
                    {/* Status */}
                    <div className="flex justify-between sm:justify-end items-center">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 sm:hidden mr-2">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClass(modulo.status)}`}>
                            {getStatusText(modulo.status)}
                        </span>
                    </div>

                    {/* Preço */}
                    <div className="flex justify-between sm:justify-end items-center text-gray-700 dark:text-gray-200">
                        <span className="text-xs font-medium sm:hidden mr-2">Preço Mensal:</span>
                        <strong className="whitespace-nowrap">R$ {modulo.precoMensal.toFixed(2).replace('.', ',')}</strong>
                    </div>

                    {/* Padrão */}
                    <div className="flex justify-between sm:justify-end items-center text-gray-700 dark:text-gray-200">
                         <span className="text-xs font-medium sm:hidden mr-2">Padrão:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${modulo.isPadrao ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-800'}`}>
                            {modulo.isPadrao ? 'PADRÃO' : 'OPCIONAL'}
                        </span>
                    </div>

                </div>

                {/* BOTÃO DE AÇÃO */}
                <div className="flex items-center w-full sm:w-auto">
                    <button
                        onClick={() => handleOpenModalEdicao(modulo)}
                        className="w-full sm:w-auto text-sm px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded text-center whitespace-nowrap transition duration-150 ease-in-out"
                    >
                        Editar Módulo
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardLayout>
  );
}