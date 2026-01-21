import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, User, Users, Package, MessageSquare, Target } from 'lucide-react';
import { 
  CreatorProfile, 
  CreatorPositioning, 
  AudienceLevel, 
  OfferType, 
  ContentFocus, 
  ToneOfVoice, 
  ContentLength, 
  ContentGoal, 
  Platform,
  PostFrequency
} from '../types';

interface OnboardingProps {
  onComplete: (profile: CreatorProfile) => void;
  existingProfile?: CreatorProfile | null;
}

const STEPS = [
  { id: 1, title: 'Identidade', icon: User, description: 'Quem é você?' },
  { id: 2, title: 'Público', icon: Users, description: 'Para quem você fala?' },
  { id: 3, title: 'Oferta', icon: Package, description: 'O que você oferece?' },
  { id: 4, title: 'Tom de Voz', icon: MessageSquare, description: 'Como você se comunica?' },
  { id: 5, title: 'Objetivos', icon: Target, description: 'O que você quer alcançar?' },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, existingProfile }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<CreatorProfile>>(existingProfile || {
    role: '',
    experienceYears: '',
    positioning: 'educator',
    audience: {
      profile: '',
      level: 'intermediate',
      mainPain: '',
      mainDesire: ''
    },
    offer: {
      type: 'none',
      mainBenefit: '',
      contentFocus: 'authority'
    },
    toneOfVoice: 'professional',
    contentLength: 'medium',
    styleReference: '',
    primaryGoal: 'grow_audience',
    mainChannels: [Platform.INSTAGRAM],
    postFrequency: 'few_times_week'
  });

  const updateProfile = (updates: Partial<CreatorProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const updateAudience = (updates: Partial<CreatorProfile['audience']>) => {
    setProfile(prev => ({
      ...prev,
      audience: { ...prev.audience!, ...updates }
    }));
  };

  const updateOffer = (updates: Partial<CreatorProfile['offer']>) => {
    setProfile(prev => ({
      ...prev,
      offer: { ...prev.offer!, ...updates }
    }));
  };

  const toggleChannel = (channel: Platform) => {
    const current = profile.mainChannels || [];
    if (current.includes(channel)) {
      updateProfile({ mainChannels: current.filter(c => c !== channel) });
    } else {
      updateProfile({ mainChannels: [...current, channel] });
    }
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete({
      ...profile as CreatorProfile,
      completedAt: Date.now()
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.role && profile.experienceYears && profile.positioning;
      case 2:
        return profile.audience?.profile && profile.audience?.mainPain && profile.audience?.mainDesire;
      case 3:
        return profile.offer?.type && (profile.offer.type === 'none' || profile.offer?.mainBenefit);
      case 4:
        return profile.toneOfVoice && profile.contentLength;
      case 5:
        return profile.primaryGoal && profile.mainChannels && profile.mainChannels.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Como você se define profissionalmente?
              </label>
              <input
                type="text"
                value={profile.role || ''}
                onChange={(e) => updateProfile({ role: e.target.value })}
                placeholder="ex: Fundador de SaaS, Social Media, Coach de Carreira..."
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Isso ajuda a IA a entender sua área de atuação</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Há quanto tempo atua nessa área?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Menos de 1 ano', '1-3 anos', '3-5 anos', '+5 anos'].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => updateProfile({ experienceYears: exp })}
                    className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                      profile.experienceYears === exp
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Como você se posiciona principalmente?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'educator', label: 'Educador', desc: 'Ensino e compartilho conhecimento' },
                  { value: 'authority', label: 'Autoridade', desc: 'Referência na minha área' },
                  { value: 'inspirational', label: 'Inspirador', desc: 'Motivo e transformo pessoas' },
                  { value: 'seller', label: 'Vendedor', desc: 'Foco em conversão e vendas' },
                ].map((pos) => (
                  <button
                    key={pos.value}
                    onClick={() => updateProfile({ positioning: pos.value as CreatorPositioning })}
                    className={`p-4 text-left rounded-lg border transition-all ${
                      profile.positioning === pos.value
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-medium ${profile.positioning === pos.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {pos.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{pos.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quem é seu público principal?
              </label>
              <input
                type="text"
                value={profile.audience?.profile || ''}
                onChange={(e) => updateAudience({ profile: e.target.value })}
                placeholder="ex: Empreendedores digitais, mães que trabalham, desenvolvedores..."
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nível do seu público
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'beginner', label: 'Iniciante', desc: 'Está começando' },
                  { value: 'intermediate', label: 'Intermediário', desc: 'Já tem experiência' },
                  { value: 'advanced', label: 'Avançado', desc: 'Busca aprofundamento' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => updateAudience({ level: level.value as AudienceLevel })}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.audience?.level === level.value
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-medium text-sm ${profile.audience?.level === level.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {level.label}
                    </div>
                    <div className="text-xs text-slate-500">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Principal dor do seu público hoje
              </label>
              <textarea
                value={profile.audience?.mainPain || ''}
                onChange={(e) => updateAudience({ mainPain: e.target.value })}
                placeholder="ex: Não consegue se organizar, falta de clientes, não sabe por onde começar..."
                className="w-full p-3 h-20 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Principal desejo ou objetivo do público
              </label>
              <textarea
                value={profile.audience?.mainDesire || ''}
                onChange={(e) => updateAudience({ mainDesire: e.target.value })}
                placeholder="ex: Ter mais tempo livre, aumentar renda, conquistar primeiro cliente..."
                className="w-full p-3 h-20 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Você vende algo atualmente?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'product', label: 'Produto', desc: 'Curso, ebook, template...' },
                  { value: 'service', label: 'Serviço', desc: 'Consultoria, mentoria...' },
                  { value: 'free_content', label: 'Conteúdo Gratuito', desc: 'Ainda não monetizo' },
                  { value: 'none', label: 'Nada ainda', desc: 'Estou começando' },
                ].map((offer) => (
                  <button
                    key={offer.value}
                    onClick={() => updateOffer({ type: offer.value as OfferType })}
                    className={`p-4 text-left rounded-lg border transition-all ${
                      profile.offer?.type === offer.value
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-medium ${profile.offer?.type === offer.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {offer.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{offer.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {profile.offer?.type && profile.offer.type !== 'none' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Qual o principal resultado que sua oferta entrega?
                </label>
                <textarea
                  value={profile.offer?.mainBenefit || ''}
                  onChange={(e) => updateOffer({ mainBenefit: e.target.value })}
                  placeholder="ex: Ajudo pessoas a venderem mais, ensino a criar conteúdo viral..."
                  className="w-full p-3 h-20 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seu conteúdo hoje é mais focado em:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'authority', label: 'Autoridade', desc: 'Mostrar expertise' },
                  { value: 'relationship', label: 'Relacionamento', desc: 'Conexão com público' },
                  { value: 'sales', label: 'Venda', desc: 'Converter seguidores' },
                ].map((focus) => (
                  <button
                    key={focus.value}
                    onClick={() => updateOffer({ contentFocus: focus.value as ContentFocus })}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.offer?.contentFocus === focus.value
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-medium text-sm ${profile.offer?.contentFocus === focus.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {focus.label}
                    </div>
                    <div className="text-xs text-slate-500">{focus.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seu tom de voz é mais:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'professional', label: 'Profissional', desc: 'Formal e técnico' },
                  { value: 'casual', label: 'Casual', desc: 'Leve e descontraído' },
                  { value: 'provocative', label: 'Provocativo', desc: 'Desafia o status quo' },
                  { value: 'educational', label: 'Didático', desc: 'Explica com clareza' },
                ].map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => updateProfile({ toneOfVoice: tone.value as ToneOfVoice })}
                    className={`p-4 text-left rounded-lg border transition-all ${
                      profile.toneOfVoice === tone.value
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-medium ${profile.toneOfVoice === tone.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {tone.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{tone.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Você prefere posts:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'short', label: 'Curtos', desc: 'Direto ao ponto' },
                  { value: 'medium', label: 'Médios', desc: 'Equilibrado' },
                  { value: 'long', label: 'Longos', desc: 'Mais profundos' },
                ].map((length) => (
                  <button
                    key={length.value}
                    onClick={() => updateProfile({ contentLength: length.value as ContentLength })}
                    className={`p-3 rounded-lg border transition-all ${
                      profile.contentLength === length.value
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-medium text-sm ${profile.contentLength === length.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {length.label}
                    </div>
                    <div className="text-xs text-slate-500">{length.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Existe alguém cujo estilo você admira? (opcional)
              </label>
              <input
                type="text"
                value={profile.styleReference || ''}
                onChange={(e) => updateProfile({ styleReference: e.target.value })}
                placeholder="ex: Gary Vee, Ícaro de Carvalho, Nathalia Arcuri..."
                className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Ajuda a IA a entender o estilo que você busca</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Qual seu principal objetivo com conteúdo hoje?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'grow_audience', label: 'Crescer Audiência', desc: 'Mais seguidores' },
                  { value: 'generate_leads', label: 'Gerar Leads', desc: 'Captar contatos' },
                  { value: 'sell', label: 'Vender', desc: 'Converter em vendas' },
                ].map((goal) => (
                  <button
                    key={goal.value}
                    onClick={() => updateProfile({ primaryGoal: goal.value as ContentGoal })}
                    className={`p-4 rounded-lg border transition-all ${
                      profile.primaryGoal === goal.value
                        ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`font-medium ${profile.primaryGoal === goal.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {goal.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{goal.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Em quais redes você quer focar?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(Platform).map((channel) => (
                  <button
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                      profile.mainChannels?.includes(channel)
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">Selecione uma ou mais plataformas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Com que frequência pretende postar?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'daily', label: 'Diariamente' },
                  { value: 'few_times_week', label: 'Algumas vezes por semana' },
                  { value: 'weekly', label: 'Semanalmente' },
                  { value: 'sporadic', label: 'Esporadicamente' },
                ].map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => updateProfile({ postFrequency: freq.value as PostFrequency })}
                    className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                      profile.postFrequency === freq.value
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h1 className="text-2xl font-bold mb-2">Configure seu Perfil de Criador</h1>
          <p className="text-indigo-100">Personalize a IA para criar conteúdo com a sua cara</p>
        </div>

        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step > s.id 
                      ? 'bg-green-500 text-white' 
                      : step === s.id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1 ${step === s.id ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">{STEPS[step - 1].description}</h2>
          </div>

          {renderStep()}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
              step === 1 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                canProceed()
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${
                canProceed()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" /> Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
