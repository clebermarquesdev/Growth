import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ContentGenerator from './components/ContentGenerator';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import Onboarding from './components/Onboarding';
import AuthPage from './components/AuthPage';
import { ViewState, Post, PostStatus, CreatorProfile } from './types';
import { fetchPosts, createPost, updatePostStatus, updatePostMetrics, fetchProfile, saveProfile } from './services/apiService';
import { getCurrentUser, logout, User } from './services/authService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        if (profile) {
          setCreatorProfile(profile);
        } else {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setShowOnboarding(true);
      }
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
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
  }, [user]);

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setCreatorProfile(null);
    setPosts([]);
    setShowOnboarding(false);
    setCurrentView('dashboard');
  };

  const handleOnboardingComplete = async (profile: CreatorProfile) => {
    try {
      const savedProfile = await saveProfile(profile);
      setCreatorProfile(savedProfile);
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setCreatorProfile(profile);
      setShowOnboarding(false);
    }
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

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
      user={user}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
