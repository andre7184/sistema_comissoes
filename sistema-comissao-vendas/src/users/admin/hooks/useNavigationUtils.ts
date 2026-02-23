// src/hooks/useNavigationUtils.ts

import { useNavigate } from 'react-router-dom';

/**
 * Hook customizado para encapsular lógica de navegação específica do projeto.
 * Deve ser chamado apenas dentro de um componente funcional.
 */
export const useNavigationUtils = () => {
    const navigate = useNavigate();

    /**
     * Navega para a página de detalhes/edição de um vendedor específico.
     * @param idVendedor O ID do vendedor.
     */
    const handleAbrirVendedor = (idVendedor: number) => {
        // A rota que você configurou em App.tsx é /vendedor/:id
        navigate(`/vendedor/${idVendedor}`); 
    };
    
    // Você pode adicionar mais funções de navegação aqui (ex: navigateToVendas, navigateToClientes, etc.)

    return {
        handleAbrirVendedor,
        // ... outras funções
    };
};