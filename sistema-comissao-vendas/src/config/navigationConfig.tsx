// src/config/navigationConfig.tsx

import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ROLES, MODULES, type AllowedRoleType } from './constants';
import { comissaoCoreNavItems } from '../modulos/comissao-core/ComissaoCoreMenu';

// --- 1. NOVOS ÍCONES (LUCIDE REACT) ---
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  PackageSearch, 
  Wallet, 
  BadgeDollarSign,
  ChevronDown, 
  Folder,
  AlertCircle
} from 'lucide-react';

// Tipagem atualizada para aceitar componente React em vez de função que retorna JSX
export interface NavItem {
  icon: React.ElementType; 
  label: string;
  path: string;
  roles: AllowedRoleType[];
  module?: typeof MODULES[keyof typeof MODULES];
  groupLabel?: string;
}

interface FilterProps {
    currentRole: string | null;
    currentPermissoes: string[] | null;
}

// --- 2. LISTA BASE ATUALIZADA (Com Ícones Lucide) ---
const baseNavItems: NavItem[] = [
    // Admin da Empresa
    { icon: LayoutDashboard, label: 'Visão Geral', path: '/empresa/home', roles: [ROLES.ADMIN] },
    { icon: Users, label: 'Gerenciar Admins', path: '/empresa/admins', roles: [ROLES.ADMIN] },
    
    // Super Admin
    { icon: Building2, label: 'Gerenciar Empresas', path: '/empresas', roles: [ROLES.SUPER_ADMIN] },
    { icon: PackageSearch, label: 'Catálogo de Módulos', path: '/modulos', roles: [ROLES.SUPER_ADMIN] },
    
    // Vendedor
    { icon: Wallet, label: 'Minhas Vendas', path: '/portal-vendas', roles: [ROLES.VENDEDOR] },
    { icon: BadgeDollarSign, label: 'Lançar Venda', path: '/portal-vendas/lancar', roles: [ROLES.VENDEDOR] },
];

// --- Lista COMPLETA ---
const allNavItems: NavItem[] = [
    ...baseNavItems,
    ...comissaoCoreNavItems,
];

// --- Hook de Filtro (SUA LÓGICA ORIGINAL MANTIDA) ---
export function useFilteredNavItems({ currentRole, currentPermissoes }: FilterProps): NavItem[] {
  const filteredItems = useMemo(() => {
    if (!currentRole) return [];

    const roleAsLiteral = currentRole as AllowedRoleType;
    const permissoesSet = new Set(currentPermissoes || []);
    const hasComissaoModule = permissoesSet.has(MODULES.COMISSOES);

    const roleAllowedItems = allNavItems.filter(item => item.roles.includes(roleAsLiteral));

    if (roleAsLiteral === ROLES.ADMIN) {
      if (hasComissaoModule) {
        return roleAllowedItems.filter(item => item.module === MODULES.COMISSOES || !item.module);
      } else {
        return roleAllowedItems.filter(item => !item.module);
      }
    }
    else {
      return roleAllowedItems.filter(item => {
          if (item.module) return permissoesSet.has(item.module);
          return true;
      });
    }
  }, [currentRole, currentPermissoes]);

  return filteredItems;
}

// --- Componente SidebarMenu (DESIGN PROFISSIONAL APLICADO) ---

interface SidebarMenuProps {
    filteredItems: NavItem[];
    currentRole: string | null;
}

export const SidebarMenu = ({ filteredItems, currentRole }: SidebarMenuProps) => {
// --- ATUALIZAÇÃO PARA SUPORTE DARK MODE ---
    
    // 1. CLASSE DE LINK ATIVO 
    // Light: Fundo primary-50, Texto primary-700, Borda primary-500
    // Dark: Fundo primary-900/20 (laranja escuro e transparente), Texto primary-400 (laranja claro), Borda primary-500
    const activeLinkClass = "bg-primary-50 text-primary-700 border-r-4 border-primary-500 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-500"; 
    
    // 2. CLASSE DE LINK INATIVO
    // Light: Texto neutral-600, Hover neutral-100/neutral-900
    // Dark: Texto gray-400, Hover slate-700/gray-200
    const inactiveLinkClass = "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 border-r-4 border-transparent dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-gray-200";
    
    // 3. CLASSE DO HEADER DE GRUPO (ex: Gestão de Comissões)
    // Light: text-neutral-400
    // Dark: text-gray-500
    const baseGroupClass = "flex items-center justify-between w-full p-3 mt-4 text-xs font-bold text-neutral-400 uppercase tracking-wider hover:text-primary-600 transition-colors dark:text-gray-500 dark:hover:text-primary-400";
    
    const baseLinkClass = "flex items-center gap-3 p-3 text-sm font-medium transition-all duration-200";
    // Estilo para cabeçalho de grupo
    
    // Recuo para subitens
    const subItemBaseClass = "flex items-center gap-3 p-2 pl-9 text-sm font-medium transition-all duration-200";

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        filteredItems.forEach(item => { if (item.groupLabel && initialState[item.groupLabel] === undefined) { initialState[item.groupLabel] = true; } });
        return initialState;
    });

    const groupedItems = useMemo(() => {
        const groups: Record<string, NavItem[]> = {}; const ungrouped: NavItem[] = [];
        filteredItems.forEach(item => { if (item.groupLabel) { if (!groups[item.groupLabel]) groups[item.groupLabel] = []; groups[item.groupLabel].push(item); } else { ungrouped.push(item); } });
        return { groups, ungrouped };
    }, [filteredItems]);

    const toggleGroup = (label: string) => { setOpenGroups(prev => ({ ...prev, [label]: !prev[label] })); };

    return (
        <nav className="flex flex-col space-y-1">
            {/* 1. Itens NÃO agrupados */}
            {groupedItems.ungrouped.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/empresa/home'}
                    className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                    {/* Renderiza o ícone Lucide */}
                    <item.icon size={20} strokeWidth={1.5} />
                    <span>{item.label}</span>
                </NavLink>
            ))}

            {/* 2. Itens AGRUPADOS */}
            {Object.entries(groupedItems.groups).map(([groupLabel, items]) => {
                const isOpen = openGroups[groupLabel] ?? true;
                return (
                    <div key={groupLabel} className="border-t border-gray-100 mt-2 pt-1">
                        <button onClick={() => toggleGroup(groupLabel)} className={baseGroupClass}>
                             <span className="flex items-center gap-2"> 
                                <Folder size={14} /> 
                                <span>{groupLabel}</span> 
                             </span>
                             <ChevronDown size={14} className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {items.map(item => ( 
                                <NavLink key={item.path} 
                                    to={item.path} 
                                    end={item.path === '/empresa/dashboard'} 
                                    className={({ isActive }) => `${subItemBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                                    <item.icon size={18} /> 
                                    <span>{item.label}</span> 
                                </NavLink> 
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Mensagem de Módulo Inativo (Estilizada) */}
            {currentRole === ROLES.ADMIN && !filteredItems.some(i => i.module === MODULES.COMISSOES) && (
                 <div className='mx-3 mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2'>
                    <AlertCircle className="text-red-500 mt-0.5" size={16} />
                    {/* ... */}
                 </div>
            )}
        </nav>
    );
};