import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import { ViewState, Post, PostStatus } from './types';
import { fetchPosts, createPost, updatePostStatus, updatePostMetrics } from './services/apiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handleSavePost = async (post: Post) => {
    try {
      const savedPost = await createPost({
        platform: post.platform,
        objective: post.objective,
        topic: post.topic,
        content: post.content,
        status: post.status,
        scheduledDate: post.scheduledDate,
        metrics: post.metrics
      });
      setPosts(prev => [savedPost, ...prev]);
      setCurrentView('calendar');
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Erro ao salvar post. Tente novamente.');
    }
  };

  const handleUpdateStatus = async (id: string, status: PostStatus) => {
    try {
      await updatePostStatus(id, status);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleUpdateMetrics = async (id: string, likes: number, comments: number) => {
    try {
      await updatePostMetrics(id, likes, comments);
      setPosts(prev => prev.map(p => p.id === id ? { ...p, metrics: { likes, comments } } : p));
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
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
