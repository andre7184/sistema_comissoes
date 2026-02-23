// DTO de Requisição para Lançar Minha Venda (Vendedor)
export interface PortalVendaRequestDTO {
  valorVenda: number;
  descricaoVenda: string; // Adicionado com base na documentação [cite: 462, 463]
}

// O DTO de Resposta da Venda é o mesmo (Venda)
// Já deve estar definido com os campos: id, valorVenda, status, dataVenda, etc. [cite: 468-471]
export interface Venda {
  id: number;
  valorVenda: number;
  valorComissaoCalculado: number;
  descricaoVenda: string;
  dataVenda: string; 
  status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA'; // Exemplo de Status [cite: 470]
  // O vendedor aninhado pode ser omitido aqui, já que o vendedor sabe quem ele é.
}