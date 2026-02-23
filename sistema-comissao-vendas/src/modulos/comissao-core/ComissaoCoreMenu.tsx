// src/modules/comissao-core/ComissaoCoreMenu.tsx

import type { NavItem } from '../../config/navigationConfig'; 
import { ROLES, MODULES } from '../../config/constants'; 

// --- 1. NOVOS ÍCONES (LUCIDE) ---
import { 
    LayoutDashboard, 
    Users, 
    BadgeDollarSign 
} from 'lucide-react';

const GROUP_LABEL = "Gestão de Comissões";

export const comissaoCoreNavItems: NavItem[] = [
    { 
        path: "/empresa/dashboard",        
        label: "Dashboard Gerencial",        
        icon: LayoutDashboard, // Passa o componente direto            
        roles: [ROLES.ADMIN],            
        module: MODULES.COMISSOES,
        groupLabel: GROUP_LABEL       
    },
    { 
        path: "/vendedores",             
        label: "Vendedores",   
        icon: Users,              
        roles: [ROLES.ADMIN],            
        module: MODULES.COMISSOES,
        groupLabel: GROUP_LABEL       
    },
    { 
        path: "/vendas",                 
        label: "Vendas e Aprovações",      
        icon: BadgeDollarSign,                 
        roles: [ROLES.ADMIN],            
        module: MODULES.COMISSOES,
        groupLabel: GROUP_LABEL        
    },
];