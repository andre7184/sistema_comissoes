import { Link } from 'react-router-dom';
import { Wallet, PlusCircle, ArrowRight } from 'lucide-react';

export default function VendedorDashboard() {
  return (
    <div>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Portal do Vendedor</h2>
        <p className='text-gray-500 dark:text-gray-400 mt-1'>Acompanhe seu desempenho e registre suas vendas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lançamento Rápido */}
        <Link to="/portal-vendas/lancar" className="group relative overflow-hidden bg-brand-600 hover:bg-brand-700 dark:bg-brand-700 dark:hover:bg-brand-600 rounded-xl p-6 text-white shadow-lg transition-all duration-200">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <PlusCircle size={28} />
                </div>
            </div>
            <div className="mt-4">
                <h3 className="text-xl font-bold">Lançar Nova Venda</h3>
                <p className="text-brand-100 text-sm mt-1">Registre uma venda rapidamente para aprovação.</p>
            </div>
          </div>
        </Link>

        {/* Histórico */}
        <Link to="/portal-vendas" className="group block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-green-300 dark:hover:border-green-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg group-hover:bg-green-100 transition-colors">
                <Wallet size={28} />
            </div>
            <ArrowRight className="text-gray-300 dark:text-slate-600 group-hover:text-green-500" transition-colors />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400">Minhas Comissões</h3>
          <p className="mt-2 text-smtext-brand-500 dark:text-gray-400 leading-relaxed">
            Visualize histórico completo, status de aprovação e valores a receber.
          </p>
        </Link>

      </div>
    </div>
  );
}