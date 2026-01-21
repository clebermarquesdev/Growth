import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import { ViewState, Post, Platform, Objective, PostStatus } from './types';

// Mock Data para visualização do MVP
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    platform: Platform.LINKEDIN,
    objective: Objective.AUTHORITY,
    topic: 'Futuro do SaaS',
    content: {
      hook: 'O SaaS como conhecemos está mudando.',
      body: 'A era dos softwares gigantes e complexos está dando lugar a soluções de nicho...',
      cta: 'Em qual nicho você está apostando?',
      tip: 'Ganchos instigantes geram mais comentários.'
    },
    status: PostStatus.PUBLISHED,
    scheduledDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 dias atrás
    metrics: { likes: 45, comments: 12 },
    createdAt: Date.now()
  },
  {
    id: '2',
    platform: Platform.INSTAGRAM,
    objective: Objective.ENGAGEMENT,
    topic: 'Tour pelo Escritório',
    content: {
      hook: 'Onde a mágica acontece ✨',
      body: 'Finalmente organizei minha mesa. Espaço limpo = mente limpa.',
      cta: 'Me mostre seu setup nos stories!',
      tip: 'Conteúdo de bastidores gera confiança.'
    },
    status: PostStatus.PUBLISHED,
    scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Ontem
    metrics: { likes: 120, comments: 8 },
    createdAt: Date.now()
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);

  // Load from local storage on mount (Simple persistence for MVP)
  useEffect(() => {
    const savedPosts = localStorage.getItem('social-copilot-posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Save to local storage whenever posts change
  useEffect(() => {
    localStorage.setItem('social-copilot-posts', JSON.stringify(posts));
  }, [posts]);

  const handleSavePost = (post: Post) => {
    setPosts(prev => [post, ...prev]);
    setCurrentView('calendar');
  };

  const handleUpdateStatus = (id: string, status: PostStatus) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleUpdateMetrics = (id: string, likes: number, comments: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, metrics: { likes, comments } } : p));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            posts={posts} 
            onCreateClick={() => setCurrentView('generator')} 
            onAnalyticsClick={() => setCurrentView('analytics')}
          />
        );
      case 'generator':
        return <ContentGenerator onSave={handleSavePost} />;
      case 'calendar':
        return <CalendarView posts={posts} onUpdateStatus={handleUpdateStatus} />;
      case 'analytics':
        return <AnalyticsView posts={posts} onUpdateMetrics={handleUpdateMetrics} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout currentView={currentView} onChangeView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
