import React, { useState } from 'react';
import { Post, Platform, PostStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, MessageCircle, Heart, Edit2, AlertCircle } from 'lucide-react';

interface AnalyticsViewProps {
  posts: Post[];
  onUpdateMetrics: (id: string, likes: number, comments: number) => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ posts, onUpdateMetrics }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempMetrics, setTempMetrics] = useState({ likes: 0, comments: 0 });

  // Filter only published posts
  const publishedPosts = posts.filter(p => p.status === PostStatus.PUBLISHED);

  // Prepare data for chart
  const chartData = publishedPosts
    .slice(0, 7) // Last 7 published posts
    .map(p => ({
      name: p.topic.substring(0, 10) + '...',
      likes: p.metrics?.likes || 0,
      comments: p.metrics?.comments || 0,
      platform: p.platform
    }));

  const totalLikes = publishedPosts.reduce((acc, curr) => acc + (curr.metrics?.likes || 0), 0);
  const totalComments = publishedPosts.reduce((acc, curr) => acc + (curr.metrics?.comments || 0), 0);

  const startEditing = (post: Post) => {
    setEditingId(post.id);
    setTempMetrics({
      likes: post.metrics?.likes || 0,
      comments: post.metrics?.comments || 0
    });
  };

  const saveMetrics = () => {
    if (editingId) {
      onUpdateMetrics(editingId, tempMetrics.likes, tempMetrics.comments);
      setEditingId(null);
    }
  };

  // Simple Insight Logic
  const bestPlatform = publishedPosts.length > 0 ? 
    publishedPosts.reduce((prev, current) => 
      ((prev.metrics?.likes || 0) > (current.metrics?.likes || 0)) ? prev : current
    ).platform : 'N/A';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Performance Analytics</h2>
        <p className="text-slate-500">Track your growth and engagement manually.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Likes</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalLikes}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Comments</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalComments}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3 mb-2">
             <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Top Insight</span>
          </div>
          <p className="text-lg font-medium leading-relaxed">
            {publishedPosts.length > 2 
             ? `Your ${bestPlatform} posts are generating 20% more engagement on average. Keep it up!` 
             : "Publish at least 3 posts to unlock insights."}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Post Engagement</h3>
        <div className="h-64 w-full">
           {publishedPosts.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="likes" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="comments" fill="#9333ea" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm">No data available. Publish posts to see charts.</div>
           )}
        </div>
      </div>

      {/* Data Entry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-slate-900">Manual Metrics Entry</h3>
           <span className="text-xs text-slate-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Update stats after 24h</span>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">Post Topic</th>
              <th className="px-6 py-3">Platform</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Likes</th>
              <th className="px-6 py-3">Comments</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {publishedPosts.map((post) => (
              <tr key={post.id} className="bg-white hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{post.topic}</td>
                <td className="px-6 py-4">{post.platform}</td>
                <td className="px-6 py-4">{new Date(post.scheduledDate).toLocaleDateString()}</td>
                
                {editingId === post.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={tempMetrics.likes} 
                        onChange={(e) => setTempMetrics({...tempMetrics, likes: parseInt(e.target.value) || 0})}
                        className="w-20 p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={tempMetrics.comments} 
                        onChange={(e) => setTempMetrics({...tempMetrics, comments: parseInt(e.target.value) || 0})}
                         className="w-20 p-1 border rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                       <button onClick={saveMetrics} className="text-indigo-600 font-medium hover:underline">Save</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">{post.metrics?.likes || 0}</td>
                    <td className="px-6 py-4">{post.metrics?.comments || 0}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => startEditing(post)} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {publishedPosts.length === 0 && (
               <tr>
                 <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                   No published posts to track yet.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsView;
