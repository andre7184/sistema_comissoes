import { Link } from 'react-router-dom';
import { Building2, PackageSearch, ArrowRight } from 'lucide-react';

export default function SuperAdminDashboard() {
  return (
    <div>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Painel Super Administrador</h2>
        <p className='text-gray-500 dark:text-gray-400 mt-1'>Gerenciamento global de tenants (empresas) e catálogo de produtos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Empresas */}
        <Link to="/empresas" className="group block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                <Building2 size={28} />
            </div>
            <ArrowRight className="text-gray-300 dark:text-gray-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">Gerenciar Empresas-Clientes</h3>
          <p className="mt-2 text-smtext-brand-500 dark:text-gray-400 leading-relaxed">
            Criação e onboarding de novos Tenants. Gerencie CNPJs, status e administradores iniciais.
          </p>
        </Link>

        {/* Card Módulos */}
        <Link to="/modulos" className="group block bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                <PackageSearch size={28} />
            </div>
            <ArrowRight className="text-gray-300 dark:text-gray-600 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">Catálogo de Módulos SaaS</h3>
          <p className="mt-2 text-smtext-brand-500 dark:text-gray-400 leading-relaxed">
            Configure os produtos disponíveis para venda. Defina chaves de acesso, preços e status.
          </p>
        </Link>

      </div>
    </div>
  );
}