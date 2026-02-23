import { useEffect, useState, useContext } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext'; // Importar contexto

// Definir uma interface para o Módulo (baseado na API)
interface Modulo {
  id: number;
  nome: string;
  chave: string;
  status: string;
  // Adicione outros campos se necessário (descricaoCurta, precoMensal...)
  // A resposta de /api/empresa/meus-modulos é Set<Modulo> [cite: 137]
  // A entidade Módulo é definida em /api/superadmin/modulos [cite: 48-60]
}

export default function Modulos() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useContext(AuthContext); // Pegar permissões

  // Verificar se o admin tem o módulo de "Gestão de Módulos" (se houver um)
  // Por enquanto, vamos assumir que se ele é admin, pode ver seus módulos.

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        setLoading(true);
        // Endpoint para o admin da empresa ver seus próprios módulos ativos
        const response = await api.get('/api/empresa/meus-modulos'); // [cite: 132]
        setModulos(response.data); // A API retorna um Set<Modulo> [cite: 137]
        setError(null);
      } catch (err: any) {
        console.error("Erro ao buscar módulos:", err);
        if (err.response?.status === 403) { // [cite: 138]
          setError('Você não tem permissão para ver os módulos.');
        } else {
          setError('Falha ao carregar os módulos.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModulos();
  }, []);

  const getStatusClass = (status: string) => {
    // O status na API é 'PRONTO_PARA_PRODUCAO', 'EM_DESENVOLVIMENTO' etc [cite: 53]
    // O layout antigo usava 'ativo' (booleano)
    // Vamos adaptar:
    if (status === 'PRONTO_PARA_PRODUCAO') {
      return 'bg-green-500';
    }
    return 'bg-gray-500'; // Outros status
  };

  const getStatusText = (status: string) => {
     if (status === 'PRONTO_PARA_PRODUCAO') return 'Ativo';
     if (status === 'EM_DESENVOLVIMENTO') return 'Em Desenvolvimento';
     if (status === 'EM_TESTE') return 'Em Teste';
     if (status === 'ARQUIVADO') return 'Arquivado';
     return status;
  }

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-4">Módulos Ativos na sua Empresa</h2>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <table className="w-full bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Chave (Identificador)</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {modulos.map((modulo) => (
              <tr key={modulo.id} className="border-t">
                <td className="p-2">{modulo.id}</td>
                <td className="p-2">{modulo.nome}</td>
                <td className="p-2">{modulo.chave}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-white text-xs ${getStatusClass(modulo.status)}`}>
                    {getStatusText(modulo.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}