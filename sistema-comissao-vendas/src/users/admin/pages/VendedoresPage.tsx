import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../../layouts/DashboardLayout';
import type { Vendedor, VendedorRequestDTO, VendedorUpdateRequestDTO } from '../types';
import { adminService } from '../services/adminService';
import GenericFormModal from '../../../components/GenericFormModal';
import VendedorForm from '../components/VendedorForm';

// Tipagem para o formulário
interface VendedorFormData {
  nome: string;
  email: string;
  percentualComissao: number;
}

export default function VendedoresPage() {
  const navigate = useNavigate();
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoVendedor, setEditandoVendedor] = useState<Vendedor | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<{nome: string, senha: string} | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchVendedores = async () => {
    setLoading(true);
    try {
      const data = await adminService.listarVendedores();
      setVendedores(data);
    } catch (err) {
      toast.error("Erro ao buscar vendedores.");  
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendedores();
  }, []);

  const handleOpenModalCadastro = () => {
    setEditandoVendedor(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenModalEdicao = (vendedor: Vendedor) => {
    setEditandoVendedor(vendedor);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditandoVendedor(null);
    setFormError(null);
  };

  const handleSubmit = async (data: VendedorFormData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (editandoVendedor) {
        const updateData: VendedorUpdateRequestDTO = { 
            nome: data.nome, 
            email: data.email,
            percentualComissao: data.percentualComissao 
        };
        await adminService.atualizarComissaoVendedor(editandoVendedor.id, updateData);
      } else {
        const createData: VendedorRequestDTO = {
          nome: data.nome,
          email: data.email,
          percentualComissao: data.percentualComissao
        };
        const response = await adminService.cadastrarVendedor(createData);
        setSenhaGerada({nome: response.nome, senha: response.senhaTemporaria});
      }
      await fetchVendedores();
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || `Erro ao salvar vendedor.`);
    } finally {
      toast.success("Vendedor salvo com sucesso!");
      setFormLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Gerenciar Vendedores</h2>
        <button
          onClick={handleOpenModalCadastro}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
        >
          + Novo Vendedor
        </button>
      </div>

      <GenericFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editandoVendedor ? 'Editar Vendedor' : 'Cadastrar Novo Vendedor'}
      >
        <VendedorForm
          onSubmit={handleSubmit}
          initialData={editandoVendedor || undefined}
          loading={formLoading}
          error={formError}
        />
      </GenericFormModal>

      <GenericFormModal
        isOpen={!!senhaGerada}
        onClose={() => setSenhaGerada(null)}
        title="Vendedor Cadastrado com Sucesso!"
      >
        <div>
          <p className="mb-2">O vendedor <strong>{senhaGerada?.nome}</strong> foi criado.</p>
          <p className="mb-4">Por favor, anote a senha temporária e a envie para o vendedor:</p>
          <div className="bg-gray-100 p-3 rounded text-center">
            <strong className="text-lg text-blue-600 select-all">{senhaGerada?.senha}</strong>
          </div>
          <div className="text-right mt-6">
            <button onClick={() => setSenhaGerada(null)} className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition">OK</button>
          </div>
        </div>
      </GenericFormModal>

      {loading ? <p>Carregando vendedores...</p> : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="th-cell">Nome</th>
                <th className="th-cell">Email</th>
                <th className="th-cell">Comissão (%)</th>
                <th className="th-cell text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendedores.map((vendedor) => (
                <tr key={vendedor.id} className="hover:bg-gray-50">
                  <td className="td-cell font-medium text-gray-900">{vendedor.nome}</td>
                  <td className="td-cell">{vendedor.email}</td>
                  <td className="td-cell">{vendedor.percentualComissao.toFixed(2)}%</td>
                  <td className="td-cell text-right">
                    <div className="flex justify-end gap-2 items-center">
                        
                        {/* Botão Ver Detalhes (Olho ou Link) */}
                        <button
                          onClick={() => navigate(`/vendedor/${vendedor.id}`)}
                          className="text-gray-500 hover:text-blue-600 text-xs font-medium border border-gray-300 px-2 py-1 rounded hover:bg-gray-100"
                        >
                          Ver Detalhes
                        </button>

                        {/* ÍCONE DE EDITAR (PADRONIZADO) */}
                        <button
                          onClick={() => handleOpenModalEdicao(vendedor)}
                          className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition text-lg"
                          title="Editar Dados Básicos"
                        >
                          ✏️
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}