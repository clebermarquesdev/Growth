import React from 'react';
import { Post, Platform, PostStatus } from '../types';
import { Calendar as CalendarIcon, MoreHorizontal, Instagram, Linkedin, Twitter, Check } from 'lucide-react';

interface CalendarViewProps {
  posts: Post[];
  onUpdateStatus: (id: string, status: PostStatus) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ posts, onUpdateStatus }) => {
  // Helper to get platform icon
  const getIcon = (p: Platform) => {
    switch (p) {
      case Platform.INSTAGRAM: return <Instagram className="w-4 h-4 text-pink-600" />;
      case Platform.LINKEDIN: return <Linkedin className="w-4 h-4 text-blue-700" />;
      case Platform.TWITTER: return <Twitter className="w-4 h-4 text-sky-500" />;
    }
  };

  // Helper to get status color
  const getStatusStyle = (s: PostStatus) => {
    switch (s) {
      case PostStatus.PUBLISHED: return 'bg-green-100 text-green-700 border-green-200';
      case PostStatus.SCHEDULED: return 'bg-blue-50 text-blue-700 border-blue-200';
      case PostStatus.DRAFT: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Group posts by date (Simple implementation: just listing them sorted)
  const sortedPosts = [...posts].sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Content Calendar</h2>
           <p className="text-slate-500">Review your scheduled and published content.</p>
        </div>
        <div className="flex gap-2">
           <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Draft</span>
           <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-blue-300"></div> Scheduled</span>
           <span className="flex items-center gap-1 text-xs text-slate-500"><div className="w-2 h-2 rounded-full bg-green-300"></div> Published</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {sortedPosts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No posts yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm">Use the AI Creator to generate your first post and fill up your calendar.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 rounded-lg border border-slate-200">
                       <span className="text-xs font-bold text-slate-500 uppercase">{new Date(post.scheduledDate).toLocaleString('default', { month: 'short' })}</span>
                       <span className="text-lg font-bold text-slate-800">{new Date(post.scheduledDate).getDate()}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getIcon(post.platform)}
                        <span className="text-sm font-medium text-slate-900">{post.topic}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusStyle(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1 max-w-md">{post.content.hook}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.status !== PostStatus.PUBLISHED && (
                      <button 
                        onClick={() => onUpdateStatus(post.id, PostStatus.PUBLISHED)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg text-xs font-medium flex items-center gap-1"
                        title="Mark as Published"
                      >
                        <Check className="w-4 h-4" /> Mark Published
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
