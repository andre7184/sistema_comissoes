import { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { Building, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface LoginForm {
    email: string;
    senha: string;
}

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setLoginError(null);
        
        try {
            const res = await api.post('/api/auth/login', data);
            
            const token = res.data.token;
            const permissoes = res.data.permissoesModulos;

            if (token) {
                login(token, permissoes || []); 
                navigate('/dashboard');
            } else {
                setLoginError('Erro inesperado: Token não recebido.');
            }

        } catch (err: any) {
            console.error('Erro de Login:', err);
            if (err.response) {
                if (err.response.status === 401 || err.response.status === 403) {
                    setLoginError('E-mail ou senha incorretos.');
                } else {
                    setLoginError(`Erro no servidor (${err.response.status}). Tente novamente.`);
                }
            } else {
                setLoginError('Sem conexão com o servidor. Verifique sua internet.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4 sm:px-6 lg:px-8">
            
            {/* Card de Login */}
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-neutral-100">
                
                {/* Cabeçalho / Logo */}
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                        <Building className="h-8 w-8 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                        Gestão<span className="text-primary-600">Pro</span>
                    </h2>
                    <p className="mt-2 text-sm text-neutral-500">
                        Faça login para acessar seu painel
                    </p>
                </div>

                {/* Mensagem de Erro */}
                {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-pulse">
                        <AlertCircle size={20} />
                        <span>{loginError}</span>
                    </div>
                )}

                {/* Formulário */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        
                        {/* Input Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                                E-mail Corporativo
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="seu.nome@empresa.com"
                                    {...register('email', { required: 'E-mail é obrigatório' })}
                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 ${
                                        errors.email ? 'border-red-500 bg-red-50' : 'border-neutral-300'
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Input Senha */}
                        <div>
                            <label htmlFor="senha" className="block text-sm font-medium text-neutral-700 mb-1">
                                Senha
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-neutral-400" />
                                </div>
                                <input
                                    id="senha"
                                    type="password"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    {...register('senha', { required: 'Senha é obrigatória' })}
                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200 ${
                                        errors.senha ? 'border-red-500 bg-red-50' : 'border-neutral-300'
                                    }`}
                                />
                            </div>
                            {errors.senha && (
                                <p className="mt-1 text-xs text-red-600">{errors.senha.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Botão Entrar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-5 w-5" />
                                Autenticando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Entrar no Sistema
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                {/* Footer do Card */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-neutral-400">
                        &copy; {new Date().getFullYear()} Sistema de Comissões. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
}