// src/users/vendedor/services/portalVendasService.ts

import api from '../../../services/api';
import type { PortalVendaRequestDTO, Venda } from '../types';

export const portalVendasService = {

  /**
   * Vendedor lança sua própria venda. Status Inicial: PENDENTE.
   * POST /portal-vendas
   * 
   */
  lancarMinhaVenda: async (dados: PortalVendaRequestDTO): Promise<Venda> => {
    const response = await api.post<Venda>('/api/portal-vendas', dados);
    return response.data;
  },

  /**
   * Retorna o histórico de vendas do próprio vendedor logado.
   * GET /portal-vendas
   * 
   */
  listarMinhasVendas: async (): Promise<Venda[]> => {
    const response = await api.get<Venda[]>('/api/portal-vendas');
    return response.data;
  },
};