import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Lock, Users, BadgeDollarSign, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { permissoes, userNome } = useContext(AuthContext);
  const temComissoesCore = permissoes?.includes('COMISSAO_CORE'); 

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Olá, {userNome?.split(' ')[0]} 👋</h2>
        <p className='text-gray-500 dark:text-gray-400 mt-1'>Bem-vindo ao painel de gestão da sua empresa.</p>
      </header>

      {temComissoesCore ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card Dashboard */}
            <Link to="/empresa/dashboard" className="group block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-brand-50 dark:bg-blue-900/20 text-brand-600 dark:text-blue-400 rounded-lg group-hover:bg-brand-100 transition-colors">
                        <LayoutDashboard size={24} />
                    </div>
                    <ArrowRight className="text-gray-300 dark:text-slate-600 group-hover:text-brand-500" size={20} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Dashboard Gerencial</h3>
                <p className="mt-1 text-smtext-brand-500 dark:text-gray-400">KPIs, gráficos e ranking.</p>
            </Link>

            {/* Card Vendas */}
            <Link to="/vendas" className="group block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg group-hover:bg-green-100 transition-colors">
                        <BadgeDollarSign size={24} />
                    </div>
                    <ArrowRight className="text-gray-300 dark:text-slate-600 group-hover:text-green-500" size={20} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Gestão de Vendas</h3>
                <p className="mt-1 text-smtext-brand-500 dark:text-gray-400">Aprovar pendências e lançar.</p>
            </Link>

            {/* Card Vendedores */}
            <Link to="/vendedores" className="group block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-100 transition-colors">
                        <Users size={24} />
                    </div>
                    <ArrowRight className="text-gray-300 dark:text-slate-600 group-hover:text-indigo-500" size={20} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">Equipe de Vendas</h3>
                <p className="mt-1 text-smtext-brand-500 dark:text-gray-400">Gerenciar comissões e cadastros.</p>
            </Link>

          </div>
      ) : (
           <div className="p-8 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-xl shadow-sm text-center max-w-2xl mx-auto mt-10">
              <div className="inline-flex p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full mb-4">
                  <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Módulo Inativo</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Contrate o módulo para liberar.</p>
          </div>
      )}
    </div>
  );
}