// src/utils/formatters.ts

export function formatarCnpj(valor: string): string {
    // 1. Remove qualquer caractere não numérico
    const numeros = valor.replace(/\D/g, '');

    // 2. Aplica a máscara: XX.XXX.XXX/XXXX-XX
    return numeros
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18); // Limita o tamanho máximo do CNPJ formatado
}

// Função auxiliar para formatar o valor como moeda R$
export const formatarParaMoeda = (valor: string | number | undefined): string => {
    const numericValue = Number(valor);

    if (isNaN(numericValue) || valor === undefined || valor === null) {
        return '';
    }
    
    // NOTA: O RHF armazena o float (Ex: 1.00), e Intl o formata para R$ 1,00.
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(numericValue);
};

// Função auxiliar para remover a formatação e obter o valor numérico (float)
export const desformatarMoeda = (valorFormatado: string): number => {
    // 1. Extrai APENAS os dígitos (ignora R$, vírgulas, pontos e texto)
    const digits = valorFormatado.replace(/\D/g, ''); 

    if (!digits) return 0;

    // 2. Converte para centavos (inteiro)
    const intCentavos = parseInt(digits, 10);
    
    // 3. Retorna o valor em Reais (float)
    // Ex: Digitando "100" -> 1.00
    return intCentavos / 100;
};