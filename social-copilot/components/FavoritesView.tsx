import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Copy, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { getTemplates, deleteTemplate, SavedTemplate } from '../services/templateService';

interface FavoritesViewProps {
  onUseTemplate?: (template: SavedTemplate) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ onUseTemplate }) => {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (e) {
      setError('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCopy = async (template: SavedTemplate) => {
    const content = `${template.content.hook}\n\n${template.content.body}\n\n${template.content.cta}`;
    const hashtags = template.content.hashtags?.map(h => `#${h}`).join(' ') || '';
    const fullText = hashtags ? `${content}\n\n${hashtags}` : content;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este favorito?')) return;
    
    setDeletingId(id);
    try {
      await deleteTemplate(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (e) {
      setError('Erro ao excluir favorito');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-100 rounded-lg">
          <Heart className="w-6 h-6 text-pink-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Favoritos</h1>
          <p className="text-slate-500">Seus conteúdos salvos para reutilizar</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {templates.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhum favorito salvo</h3>
          <p className="text-slate-400 text-sm">
            Gere conteúdo e clique em "Favoritar" para salvar aqui
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {template.name}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                      {template.platform}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {template.objective}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(template)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Copiar conteúdo"
                  >
                    {copiedId === template.id ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    disabled={deletingId === template.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Excluir"
                  >
                    {deletingId === template.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-slate-600 line-clamp-2">
                  <span className="font-medium text-slate-700">Hook:</span> {template.content.hook}
                </p>
                <p className="text-slate-500 line-clamp-2">
                  {template.content.body.substring(0, 150)}...
                </p>
              </div>

              {template.content.hashtags && template.content.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {template.content.hashtags.slice(0, 5).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                  {template.content.hashtags.length > 5 && (
                    <span className="text-xs text-slate-400">
                      +{template.content.hashtags.length - 5}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                Salvo em {new Date(template.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesView;
