import React from 'react';
import { LayoutDashboard, PenTool, Calendar as CalendarIcon, BarChart2, Zap } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'generator', label: 'Criador IA', icon: Zap },
    { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
    { id: 'analytics', label: 'Métricas', icon: BarChart2 },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
            <PenTool className="w-6 h-6" />
            <span>Social Copilot</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">AI Marketing Assistant</p>
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

        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-4 text-white">
            <h4 className="font-semibold text-sm mb-1">Pro Plan</h4>
            <p className="text-xs opacity-80 mb-3">Unlock unlimited AI generations.</p>
            <button className="w-full py-1.5 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-20">
         <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
            <PenTool className="w-5 h-5" />
            <span>Social Copilot</span>
         </div>
         <div className="flex gap-4">
             {navItems.map((item) => (
                 <button key={item.id} onClick={() => onChangeView(item.id as ViewState)} className={`${currentView === item.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <item.icon className="w-6 h-6" />
                 </button>
             ))}
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:pt-0 pt-16">
        <div className="max-w-5xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
