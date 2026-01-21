import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import Onboarding from './components/Onboarding';
import { ViewState, Post, PostStatus, CreatorProfile } from './types';
import { fetchPosts, createPost, updatePostStatus, updatePostMetrics } from './services/apiService';

const PROFILE_STORAGE_KEY = 'social_copilot_creator_profile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfile) {
      try {
        setCreatorProfile(JSON.parse(savedProfile));
      } catch {
        setShowOnboarding(true);
      }
    } else {
      setShowOnboarding(true);
    }
  }, []);

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

  const handleOnboardingComplete = (profile: CreatorProfile) => {
    setCreatorProfile(profile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    setShowOnboarding(false);
  };

  const handleEditProfile = () => {
    setShowOnboarding(true);
  };

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

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete} 
        existingProfile={creatorProfile}
      />
    );
  }

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
        return (
          <ContentGenerator 
            onSave={handleSavePost} 
            creatorProfile={creatorProfile}
          />
        );
      case 'calendar':
        return <CalendarView posts={posts} onUpdateStatus={handleUpdateStatus} />;
      case 'analytics':
        return <AnalyticsView posts={posts} onUpdateMetrics={handleUpdateMetrics} />;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView}
      creatorProfile={creatorProfile}
      onEditProfile={handleEditProfile}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
