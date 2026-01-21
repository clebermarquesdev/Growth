import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import { ViewState, Post, Platform, Objective, PostStatus } from './types';

// Mock Data for MVP visualization
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    platform: Platform.LINKEDIN,
    objective: Objective.AUTHORITY,
    topic: 'Future of SaaS',
    content: {
      hook: 'SaaS is dead. Long live Micro-SaaS.',
      body: 'The era of giant monolithic software is ending. Niche problems require niche solutions...',
      cta: 'What niche are you building for?',
      tip: 'Controversial hooks drive comments.'
    },
    status: PostStatus.PUBLISHED,
    scheduledDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    metrics: { likes: 45, comments: 12 },
    createdAt: Date.now()
  },
  {
    id: '2',
    platform: Platform.INSTAGRAM,
    objective: Objective.ENGAGEMENT,
    topic: 'Workspace Tour',
    content: {
      hook: 'Where the magic happens ✨',
      body: 'Finally organized my desk. A clear space = clear mind.',
      cta: 'Show me your desk setup in stories!',
      tip: 'Personal behind-the-scenes builds trust.'
    },
    status: PostStatus.PUBLISHED,
    scheduledDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
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
