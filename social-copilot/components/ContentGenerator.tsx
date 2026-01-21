import React, { useState, useMemo } from 'react';
import { Wand2, Save, RotateCcw, Copy, CheckCircle2, Loader2, Info, Hash, FileText, Sparkles, User, Heart, X } from 'lucide-react';
import { Platform, Objective, GeneratedContentResponse, Post, PostStatus, ContentTemplate, CreatorProfile } from '../types';
import { generatePostContent } from '../services/aiService';
import { saveTemplate, SavedTemplate } from '../services/templateService';

interface ContentGeneratorProps {
  onSave: (post: Post) => void;
  creatorProfile?: CreatorProfile | null;
}

const TEMPLATES: ContentTemplate[] = [
  {
    id: 'listicle',
    name: 'Lista de Dicas',
    description: 'X dicas/erros/passos sobre um tema',
    platforms: [Platform.LINKEDIN, Platform.INSTAGRAM, Platform.FACEBOOK],
    promptHint: 'Liste 5 dicas práticas sobre'
  },
  {
    id: 'story',
    name: 'História Pessoal',
    description: 'Conte uma experiência transformadora',
    platforms: [Platform.LINKEDIN, Platform.INSTAGRAM, Platform.FACEBOOK],
    promptHint: 'Conte uma história pessoal sobre'
  },
  {
    id: 'controversial',
    name: 'Opinião Polêmica',
    description: 'Compartilhe uma visão diferente',
    platforms: [Platform.LINKEDIN, Platform.TWITTER, Platform.THREADS],
    promptHint: 'Defenda uma opinião controversa sobre'
  },
  {
    id: 'howto',
    name: 'Tutorial Rápido',
    description: 'Ensine algo passo a passo',
    platforms: [Platform.INSTAGRAM, Platform.TIKTOK, Platform.LINKEDIN],
    promptHint: 'Ensine como fazer'
  },
  {
    id: 'beforeafter',
    name: 'Antes e Depois',
    description: 'Mostre uma transformação',
    platforms: [Platform.INSTAGRAM, Platform.LINKEDIN, Platform.FACEBOOK],
    promptHint: 'Mostre a transformação de'
  },
  {
    id: 'question',
    name: 'Pergunta Engajadora',
    description: 'Inicie um debate com seu público',
    platforms: [Platform.LINKEDIN, Platform.TWITTER, Platform.THREADS, Platform.FACEBOOK],
    promptHint: 'Faça uma pergunta provocativa sobre'
  },
  {
    id: 'myth',
    name: 'Mito x Verdade',
    description: 'Desmistifique crenças comuns',
    platforms: [Platform.LINKEDIN, Platform.INSTAGRAM, Platform.TIKTOK],
    promptHint: 'Desmistifique mitos sobre'
  },
  {
    id: 'trend',
    name: 'Comentário de Tendência',
    description: 'Opine sobre algo em alta',
    platforms: [Platform.TWITTER, Platform.THREADS, Platform.TIKTOK],
    promptHint: 'Comente sobre a tendência de'
  }
];

const CHAR_LIMITS: Record<Platform, number> = {
  [Platform.LINKEDIN]: 3000,
  [Platform.INSTAGRAM]: 2200,
  [Platform.TWITTER]: 280,
  [Platform.TIKTOK]: 2200,
  [Platform.FACEBOOK]: 500,
  [Platform.THREADS]: 500
};

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onSave, creatorProfile }) => {
  const [platform, setPlatform] = useState<Platform>(
    creatorProfile?.mainChannels?.[0] || Platform.LINKEDIN
  );
  const [objective, setObjective] = useState<Objective>(Objective.AUTHORITY);
  const [topic, setTopic] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentResponse | null>(null);
  const [editedContent, setEditedContent] = useState<GeneratedContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter(t => t.platforms.includes(platform));
  }, [platform]);

  const handleTemplateSelect = (template: ContentTemplate) => {
    if (selectedTemplate === template.id) {
      setSelectedTemplate(null);
    } else {
      setSelectedTemplate(template.id);
      if (!topic) {
        setTopic(template.promptHint + ' ');
      }
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generatePostContent(platform, objective, topic, creatorProfile || undefined);
      setGeneratedContent(result);
      setEditedContent(result);
    } catch (e) {
      setError("Falha ao gerar conteúdo. Por favor, verifique sua chave de API e tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullContent = () => {
    if (!editedContent) return '';
    return `${editedContent.hook}\n\n${editedContent.body}\n\n${editedContent.cta}`;
  };

  const charCount = useMemo(() => {
    return getFullContent().length;
  }, [editedContent]);

  const charLimit = CHAR_LIMITS[platform];
  const isOverLimit = charCount > charLimit;

  const handleCopyContent = async () => {
    const content = getFullContent();
    const hashtags = editedContent?.hashtags?.map(h => `#${h}`).join(' ') || '';
    const fullText = hashtags ? `${content}\n\n${hashtags}` : content;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyHashtags = async () => {
    if (!editedContent?.hashtags) return;
    const hashtags = editedContent.hashtags.map(h => `#${h}`).join(' ');
    try {
      await navigator.clipboard.writeText(hashtags);
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = hashtags;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!editedContent || !templateName.trim()) return;
    
    setIsSavingTemplate(true);
    try {
      await saveTemplate({
        name: templateName.trim(),
        platform,
        objective,
        topic,
        content: {
          hook: editedContent.hook,
          body: editedContent.body,
          cta: editedContent.cta,
          tip: editedContent.tip || '',
          hashtags: editedContent.hashtags || []
        }
      });
      setTemplateSaved(true);
      setTimeout(() => {
        setShowSaveTemplateModal(false);
        setTemplateName('');
        setTemplateSaved(false);
      }, 1500);
    } catch (e) {
      setError('Erro ao salvar template');
    } finally {
      setIsSavingTemplate(false);
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
        tip: generatedContent?.tip
      },
      status: PostStatus.DRAFT,
      scheduledDate: new Date().toISOString(),
      metrics: { likes: 0, comments: 0 },
      createdAt: Date.now()
    };

    onSave(newPost);
    setTopic('');
    setGeneratedContent(null);
    setEditedContent(null);
    setSelectedTemplate(null);
    alert('Post salvo nos Rascunhos!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-slate-900">Gerador de Conteúdo com IA</h2>
        <p className="text-slate-500">Crie posts de alta conversão em segundos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plataforma</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(Platform).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPlatform(p);
                      setSelectedTemplate(null);
                    }}
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Objetivo / Tom</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(Objective).map((o) => (
                  <button
                    key={o}
                    onClick={() => setObjective(o)}
                    className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                      objective === o
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Templates (opcional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      selectedTemplate === template.id
                        ? 'bg-purple-50 border-purple-200 ring-1 ring-purple-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`text-sm font-medium ${selectedTemplate === template.id ? 'text-purple-700' : 'text-slate-700'}`}>
                      {template.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
                  </button>
                ))}
              </div>
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
                  <Sparkles className="w-5 h-5" /> Gerar Post
                </>
              )}
            </button>
          </div>
        </div>

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

                {editedContent.hashtags && editedContent.hashtags.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Hash className="w-3 h-3" /> Hashtags
                      </label>
                      <button
                        onClick={handleCopyHashtags}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        {copiedHashtags ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedHashtags ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editedContent.hashtags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-100 text-slate-600 text-sm rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-xs text-right ${isOverLimit ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                  {charCount} / {charLimit} caracteres
                  {isOverLimit && ' (acima do limite!)'}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                <button
                  onClick={handleCopyContent}
                  className="py-2 px-4 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={() => setShowSaveTemplateModal(true)}
                  className="py-2 px-4 text-pink-600 bg-white border border-pink-200 hover:bg-pink-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" /> Favoritar
                </button>
                <button
                   onClick={handleGenerate} 
                   className="py-2 px-4 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Gerar novamente
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Salvar como Favorito
              </h3>
              <button
                onClick={() => {
                  setShowSaveTemplateModal(false);
                  setTemplateName('');
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              {templateSaved ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-medium text-slate-900">Favorito salvo!</p>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dê um nome para este favorito
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Post sobre produtividade"
                    className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    Plataforma: {platform} | Objetivo: {objective}
                  </p>
                </>
              )}
            </div>
            {!templateSaved && (
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => {
                    setShowSaveTemplateModal(false);
                    setTemplateName('');
                  }}
                  className="flex-1 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim() || isSavingTemplate}
                  className="flex-1 py-2 text-white bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  {isSavingTemplate ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  Salvar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;
