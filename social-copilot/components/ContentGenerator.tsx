import React, { useState } from 'react';
import { Wand2, Save, RotateCcw, Copy, CheckCircle2, Loader2, Info } from 'lucide-react';
import { Platform, Objective, GeneratedContentResponse, Post, PostStatus } from '../types';
import { generatePostContent } from '../services/aiService';

interface ContentGeneratorProps {
  onSave: (post: Post) => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onSave }) => {
  const [platform, setPlatform] = useState<Platform>(Platform.LINKEDIN);
  const [objective, setObjective] = useState<Objective>(Objective.AUTHORITY);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentResponse | null>(null);
  const [editedContent, setEditedContent] = useState<GeneratedContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePostContent(platform, objective, topic);
      setGeneratedContent(result);
      setEditedContent(result);
    } catch (e) {
      setError("Falha ao gerar conteúdo. Por favor, verifique sua chave de API e tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!editedContent) return;

    const newPost: Post = {
      id: crypto.randomUUID(),
      platform,
      objective,
      topic,
      content: {
        hook: editedContent.hook,
        body: editedContent.body,
        cta: editedContent.cta,
        tip: generatedContent?.tip // Keep original tip
      },
      status: PostStatus.DRAFT,
      scheduledDate: new Date().toISOString(), // Default to today
      metrics: { likes: 0, comments: 0 },
      createdAt: Date.now()
    };

    onSave(newPost);
    // Reset form after save
    setTopic('');
    setGeneratedContent(null);
    setEditedContent(null);
    alert('Post salvo nos Rascunhos!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900">Gerador de Conteúdo com IA</h2>
        <p className="text-slate-500">Crie posts de alta conversão em segundos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Plataforma</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(Platform).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                      platform === p
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as Objective)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {Object.values(Objective).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tópico / Ideia</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ex: 5 dicas de produtividade no home office..."
                className="w-full p-3 h-32 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Gerar Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {!editedContent ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-400">
              <Wand2 className="w-12 h-12 mb-3 opacity-20" />
              <p>Seu conteúdo gerado aparecerá aqui.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex justify-between items-center">
                <span className="text-xs font-semibold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3" /> Insight da IA
                </span>
                <span className="text-xs text-indigo-600 italic truncate max-w-[250px]">
                  {generatedContent?.tip}
                </span>
              </div>
              
              <div className="p-6 space-y-4 flex-1 overflow-auto">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hook</label>
                  <input
                    value={editedContent.hook}
                    onChange={(e) => setEditedContent({...editedContent, hook: e.target.value})}
                    className="w-full mt-1 p-2 font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Body</label>
                  <textarea
                    value={editedContent.body}
                    onChange={(e) => setEditedContent({...editedContent, body: e.target.value})}
                    className="w-full mt-1 p-2 text-slate-700 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 rounded outline-none h-48 resize-none leading-relaxed transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Call to Action</label>
                  <input
                    value={editedContent.cta}
                    onChange={(e) => setEditedContent({...editedContent, cta: e.target.value})}
                    className="w-full mt-1 p-2 text-indigo-600 font-medium bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                <button
                   onClick={handleGenerate} 
                   className="flex-1 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Gerar novamente
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Salvar no Calendário
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator;
