// src/components/GenericFormModal.tsx

import type { ReactNode } from 'react';

interface GenericFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode; // O <form> será passado aqui
  // NOVO: Propriedade para controlar o fechamento externo
  closeOnOutsideClick?: boolean; 
}

export default function GenericFormModal({
  isOpen,
  onClose,
  title,
  children,
  closeOnOutsideClick = true, // Define 'true' como padrão
}: GenericFormModalProps) {
  if (!isOpen) {
    return null;
  }

  // Define qual função deve ser chamada no clique do overlay
  const handleOverlayClick = closeOnOutsideClick ? onClose : (e: React.MouseEvent) => e.stopPropagation();

  return (
    // Overlay de fundo
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-50 flex justify-center items-center"
      // Usa a nova função para controlar o fechamento
      onClick={handleOverlayClick} 
    >
      {/* Conteúdo do Modal */}
      <div
        className="relative z-50 bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()} // Impede de fechar ao clicar no modal
      >
        {/* Header do Modal */}
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-3xl font-light"
            aria-label="Fechar modal"
          >
            &times;
          </button>
        </div>

        {/* Corpo (onde o formulário será injetado) */}
        <div>{children}</div>
      </div>
    </div>
  );
}