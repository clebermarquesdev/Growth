import React from 'react';
import { Post, PostStatus } from '../types';
import { ArrowRight, PenTool, CheckCircle, CalendarClock } from 'lucide-react';

interface DashboardProps {
  posts: Post[];
  onCreateClick: () => void;
  onAnalyticsClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ posts, onCreateClick, onAnalyticsClick }) => {
  const publishedCount = posts.filter(p => p.status === PostStatus.PUBLISHED).length;
  const draftCount = posts.filter(p => p.status === PostStatus.DRAFT).length;
  
  // Calculate Engagement Rate (Simple average of interactions per published post)
  const totalInteractions = posts
    .filter(p => p.status === PostStatus.PUBLISHED)
    .reduce((acc, curr) => acc + (curr.metrics?.likes || 0) + (curr.metrics?.comments || 0), 0);
  
  const avgEngagement = publishedCount > 0 ? Math.round(totalInteractions / publishedCount) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, Creator.</h1>
          <p className="text-slate-500 mt-1">Ready to grow your audience today?</p>
        </div>
        <button 
          onClick={onCreateClick}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
          <PenTool className="w-5 h-5" />
          Create New Post
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
               <CalendarClock className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+2 this week</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Published Posts</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{publishedCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
               <PenTool className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Drafts Pending</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{draftCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onAnalyticsClick}>
           <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
               <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Avg. Engagement</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{avgEngagement}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center">per post <ArrowRight className="w-3 h-3 ml-1" /></p>
        </div>
      </div>

      {/* Recent Activity / Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
           <h3 className="font-bold text-lg text-slate-900 mb-4">Upcoming Schedule</h3>
           {posts.filter(p => p.status === PostStatus.SCHEDULED || p.status === PostStatus.DRAFT).length === 0 ? (
             <p className="text-slate-400 text-sm">Your calendar is clear. Time to create!</p>
           ) : (
             <div className="space-y-4">
               {posts
                 .filter(p => p.status === PostStatus.SCHEDULED || p.status === PostStatus.DRAFT)
                 .slice(0, 3)
                 .map(post => (
                   <div key={post.id} className="flex items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-colors">
                     <div className={`w-2 h-12 rounded-full mr-4 ${post.platform === 'LinkedIn' ? 'bg-blue-600' : 'bg-pink-500'}`}></div>
                     <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">{post.topic}</h4>
                        <p className="text-xs text-slate-500">{new Date(post.scheduledDate).toLocaleDateString()} • {post.status}</p>
                     </div>
                   </div>
                 ))
               }
             </div>
           )}
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
           <h3 className="font-bold text-lg mb-2 relative z-10">AI Growth Tip</h3>
           <p className="text-indigo-100 text-sm leading-relaxed mb-6 relative z-10">
             Educational carousels on LinkedIn are currently seeing a 40% higher engagement rate than text-only posts. Try converting your next tip into a slide format.
           </p>
           <button onClick={onCreateClick} className="bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded-lg font-medium transition-colors relative z-10">
             Try it now
           </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
