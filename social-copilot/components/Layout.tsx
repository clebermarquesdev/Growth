import React from 'react';
import { LayoutDashboard, PenTool, Calendar as CalendarIcon, BarChart2, Zap, Settings, User, LogOut, Heart } from 'lucide-react';
import { ViewState, CreatorProfile } from '../types';
import { User as AuthUser } from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  creatorProfile?: CreatorProfile | null;
  onEditProfile?: () => void;
  user?: AuthUser | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, creatorProfile, onEditProfile, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'generator', label: 'Criador IA', icon: Zap },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
    { id: 'analytics', label: 'Métricas', icon: BarChart2 },
  ];

  const positioningLabels: Record<string, string> = {
    educator: 'Educador',
    authority: 'Autoridade',
    inspirational: 'Inspirador',
    seller: 'Vendedor'
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <PenTool className="w-6 h-6" />
            <span>Social Copilot</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Assistente de Marketing IA</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {creatorProfile && (
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                      {creatorProfile.role}
                    </p>
                    <p className="text-xs text-slate-500">
                      {positioningLabels[creatorProfile.positioning] || creatorProfile.positioning}
                    </p>
                  </div>
                </div>
                {onEditProfile && (
                  <button
                    onClick={onEditProfile}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="Editar perfil"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {creatorProfile.mainChannels.slice(0, 3).map((channel) => (
                  <span key={channel} className="px-2 py-0.5 bg-white text-xs text-slate-600 rounded border border-slate-200">
                    {channel}
                  </span>
                ))}
                {creatorProfile.mainChannels.length > 3 && (
                  <span className="px-2 py-0.5 bg-white text-xs text-slate-500 rounded border border-slate-200">
                    +{creatorProfile.mainChannels.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-sm text-slate-600 truncate">{user.email}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
         <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <PenTool className="w-5 h-5" />
            <span>Social Copilot</span>
         </div>
         <div className="flex gap-3">
             {navItems.map((item) => (
                 <button key={item.id} onClick={() => onChangeView(item.id as ViewState)} className={`${currentView === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <item.icon className="w-5 h-5" />
                 </button>
             ))}
             {onEditProfile && (
               <button onClick={onEditProfile} className="text-slate-400">
                 <Settings className="w-5 h-5" />
               </button>
             )}
             {onLogout && (
               <button onClick={onLogout} className="text-slate-400 hover:text-red-500">
                 <LogOut className="w-5 h-5" />
               </button>
             )}
         </div>
      </div>

      <main className="flex-1 overflow-auto md:pt-0 pt-16">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
