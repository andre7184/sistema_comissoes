// src/layouts/DashboardLayout.tsx

import { useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useFilteredNavItems, SidebarMenu } from '../config/navigationConfig';
import AlterarSenhaModal from '../components/AlterarSenhaModal';
import { useTheme } from '../contexts/ThemeContext'; // <-- Importe o Hook
import NeuronoLogo from '../assets/images/neurono-logo.svg?react';

// Ícones
import { Menu, X, User, LogOut, KeyRound, ChevronDown, Moon, Sun } from 'lucide-react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { role, permissoes, userNome, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme(); // <-- Use o Hook
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);

  const filteredNavItems = useFilteredNavItems({ currentRole: role, currentPermissoes: permissoes });

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    // Aplica cores de fundo para Light (bg-surface) e Dark (dark:bg-slate-900)
    <div className="flex h-screen bg-surface dark:bg-slate-900 text-gray-800 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-300">
      
      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 shadow-sm transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16  border-b border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400">
            <div className="p-4 flex items-center">
                <a href="/dashboard"> 
                    <NeuronoLogo 
                        className="h-14 w-auto text-orange-500 dark:text-orange-400" 
                        alt="Neurono - Gerenciar Comissões" 
                    />
                </a>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 dark:text-gray-400 hover:text-brand-600">
            <X size={24} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
            <SidebarMenu filteredItems={filteredNavItems} currentRole={role} />
        </div>
        
        {/* Footer Sidebar */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-slate-600 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-xs">
                    {userNome?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{userNome || 'Usuário'}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase">{role?.replace('ROLE_', '')}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 h-16 border-b border-gray-200 dark:border-slate-700 flex justify-end items-center px-4 sm:px-6 lg:px-8 shadow-sm relative z-30">
          {/* NOVO BLOCO (Aparece apenas em mobile/small screens) */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-gray-400 p-1 rounded-md">
              <Menu size={24} />
            </button>
            
            <div className="p-4 flex items-center">
                <a href="/dashboard"> 
                    <NeuronoLogo 
                        className="h-12 w-auto text-orange-500 dark:text-orange-400" 
                        alt="Neurono - Gerenciar Comissões" 
                    />
                </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* BOTÃO TOGGLE THEME */}
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700 transition-colors"
                title="Alternar Tema"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Dropdown de Usuário */}
            <div className="relative">
                <button 
                onClick={toggleMenu} 
                className="flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-gray-50 dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all focus:outline-none"
                >
                <div className="hidden md:flex flex-col items-end mr-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 leading-none">{userNome?.split(' ')[0]}</span>
                </div>
                <div className="p-1 bg-brand-50 dark:bg-slate-600 rounded-full text-brand-600 dark:text-brand-300">
                    <User size={18} />
                </div>
                <ChevronDown size={14} className={`text-gray-400 dark:text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMenuOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={closeMenu}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-30 divide-y divide-gray-100 dark:divide-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right border border-gray-100 dark:border-slate-700">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-t-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Logado como</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userNome}</p>
                    </div>
                    <div className="py-1">
                        <button 
                        onClick={() => { setIsSenhaModalOpen(true); closeMenu(); }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-700 transition-colors"
                        >
                        <KeyRound size={16} className="mr-3 text-gray-400 dark:text-gray-500 group-hover:text-brand-600" />
                        Alterar Senha
                        </button>
                    </div>
                    <div className="py-1 bg-gray-50 dark:bg-slate-700/50 rounded-b-lg">
                        <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                        <LogOut size={16} className="mr-3" />
                        Sair do Sistema
                        </button>
                    </div>
                    </div>
                </>
                )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-surface dark:bg-slate-900 p-4 sm:p-6 lg:p-8 relative scroll-smooth transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>

      <AlterarSenhaModal
        isOpen={isSenhaModalOpen}
        onClose={() => setIsSenhaModalOpen(false)}
      />
    </div>
  );
}