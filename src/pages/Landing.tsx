import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play, Zap, Crown, Check, Star, ChevronDown, ShieldCheck,
  Smartphone, Heart, Clapperboard, Globe, Clock, Sparkles,
} from 'lucide-react'
import { api } from '../lib/api'

// ===== VSL (Video Sales Letter) =====
// Cole aqui a URL do seu vídeo de vendas:
//  - YouTube:  'https://www.youtube.com/embed/SEU_ID'
//  - Vimeo:    'https://player.vimeo.com/video/SEU_ID'
//  - MP4:      'https://.../seu-video.mp4'
// Deixe '' (vazio) para mostrar o placeholder.
const VSL_URL = ''

export default function Landing() {
  const navigate = useNavigate()
  const [thumbs, setThumbs] = useState<string[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const isMp4 = /\.mp4($|\?)/i.test(VSL_URL)

  const goRegister = () => navigate('/register')
  const goLogin = () => navigate('/login')

  // Mosaico de capas reais pro hero (igual ao AuthGate)
  useEffect(() => {
    api.dramas.byCategory().then(({ categories }) => {
      const urls = categories
        .flatMap((c: any) => c.dramas.map((d: any) => d.thumbnailUrl))
        .filter(Boolean)
      if (urls.length > 0) {
        setThumbs(Array.from({ length: 24 }, (_: unknown, i: number) => urls[i % urls.length]))
      }
    }).catch(() => {})
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* ===== Top bar ===== */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 flex items-center justify-between"
        style={{
          height: 'var(--navbar-h)',
          background: 'rgba(10,10,15,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Play size={16} fill="white" color="white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight" style={{ color: '#fff' }}>Dramix</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={goLogin} className="btn-secondary" style={{ padding: '8px 16px' }}>Entrar</button>
          <button onClick={goRegister} className="btn-primary" style={{ boxShadow: '0 4px 20px var(--accent-glow)' }}>
            <Zap size={14} fill="white" /> Começar grátis
          </button>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden px-4 md:px-10"
        style={{ paddingTop: 'calc(var(--navbar-h) + 56px)', paddingBottom: 80 }}>
        {/* Fundo: mosaico de capas */}
        {thumbs.length > 0 && (
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, opacity: 0.18, transform: 'scale(1.1)' }}>
              {thumbs.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', borderRadius: 6 }} />
              ))}
            </div>
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse at center, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.92) 70%, var(--bg) 100%)',
            }} />
          </div>
        )}

        <div className="relative mx-auto text-center fade-up" style={{ zIndex: 1, maxWidth: 760 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'var(--accent-dim)', border: '1px solid rgba(225,29,72,0.3)' }}>
            <Sparkles size={13} color="var(--accent-light)" />
            <span className="text-xs font-bold" style={{ color: 'var(--accent-light)' }}>
              + DE 100 MINI DORAMAS DUBLADOS EM PORTUGUÊS
            </span>
          </div>

          <h1 className="font-extrabold mb-5" style={{ fontSize: 'clamp(32px, 6vw, 56px)', lineHeight: 1.05, color: '#fff' }}>
            Histórias que te prendem em <span className="text-gradient">minutos</span>,
            não em temporadas
          </h1>

          <p className="mx-auto mb-8" style={{ fontSize: 'clamp(15px, 2.5vw, 19px)', color: 'var(--text-dim)', maxWidth: 560 }}>
            Mini doramas completos, dublados e sem enrolação. Comece, termine e
            se emocione — tudo no seu tempo, por menos que um café por mês.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <button onClick={goRegister}
              className="w-full sm:w-auto py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: '0 8px 32px var(--accent-glow)' }}>
              <Zap size={18} fill="white" /> Quero testar grátis
            </button>
            <button onClick={goLogin}
              className="w-full sm:w-auto py-4 px-8 rounded-xl font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', fontSize: 16 }}>
              Já sou assinante
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1.5"><Check size={13} color="var(--green)" /> Cancele quando quiser</span>
            <span className="flex items-center gap-1.5"><Check size={13} color="var(--green)" /> Sem fidelidade</span>
            <span className="flex items-center gap-1.5"><Check size={13} color="var(--green)" /> Assista onde estiver</span>
          </div>
        </div>
      </section>

      {/* ===== VSL ===== */}
      <section className="px-4 md:px-10 pb-20" style={{ marginTop: -32 }}>
        <div className="mx-auto fade-up" style={{ maxWidth: 860 }}>
          <div className="rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(225,29,72,0.3)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
              {VSL_URL && isMp4 && (
                <video src={VSL_URL} controls playsInline
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
              )}
              {VSL_URL && !isMp4 && (
                <iframe src={VSL_URL} title="Dramix VSL" allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
              )}
              {!VSL_URL && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                  style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface-alt))' }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--accent)', boxShadow: '0 8px 32px var(--accent-glow)' }}>
                    <Play size={26} fill="#fff" color="#fff" />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-dim)' }}>Seu vídeo de vendas (VSL) entra aqui</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-6">
            <button onClick={goRegister}
              className="py-4 px-9 rounded-xl font-bold inline-flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, boxShadow: '0 8px 32px var(--accent-glow)' }}>
              <Zap size={17} fill="white" /> Quero começar agora
            </button>
          </div>
        </div>
      </section>

      {/* ===== DOR / IDENTIFICAÇÃO ===== */}
      <section className="px-4 md:px-10 py-16" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto" style={{ maxWidth: 820 }}>
          <h2 className="text-center font-extrabold mb-3" style={{ fontSize: 'clamp(24px, 4vw, 34px)', color: '#fff' }}>
            Você se identifica com isso?
          </h2>
          <p className="text-center mb-10" style={{ color: 'var(--text-dim)' }}>
            Se respondeu "sim" pra alguma, o Dramix foi feito pra você.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Cansada de séries longas que você nunca termina',
              'Sem tempo, mas amando uma boa história de amor e drama',
              'Pagando caro em streaming e mal usando',
              'Cansada de procurar doramas dublados de graça que travam',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-5 rounded-2xl fade-up"
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', animationDelay: `${i * 0.06}s` }}>
                <span className="text-xl flex-shrink-0">😩</span>
                <p className="text-sm" style={{ color: 'var(--text)' }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOLUÇÃO ===== */}
      <section className="px-4 md:px-10 py-20">
        <div className="mx-auto text-center fade-up" style={{ maxWidth: 720 }}>
          <span className="badge badge-red mb-4">A SOLUÇÃO</span>
          <h2 className="font-extrabold mb-5" style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', lineHeight: 1.1, color: '#fff' }}>
            Doramas <span className="text-gradient">completos</span> que cabem na sua rotina
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-dim)' }}>
            O Dramix reúne mini doramas dublados em português, cada um com começo,
            meio e fim. Nada de cliffhanger infinito: você assiste a história inteira
            numa sessão, no celular, tablet ou PC — quando e onde quiser.
          </p>
        </div>
      </section>

      {/* ===== BENEFÍCIOS ===== */}
      <section className="px-4 md:px-10 py-16" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto" style={{ maxWidth: 1040 }}>
          <h2 className="text-center font-extrabold mb-12" style={{ fontSize: 'clamp(24px, 4vw, 34px)', color: '#fff' }}>
            Por que vão amar o Dramix
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Clapperboard, title: 'Histórias completas', desc: 'Cada drama começa e termina. Sem temporadas intermináveis.' },
              { icon: Globe, title: 'Tudo dublado em PT-BR', desc: 'Esqueça legenda corrida. É só relaxar e assistir.' },
              { icon: Clock, title: 'No seu tempo', desc: 'Episódios curtos pra ver na fila, no ônibus ou antes de dormir.' },
              { icon: Smartphone, title: 'Em qualquer tela', desc: 'Celular, tablet ou computador. Sua conta vai com você.' },
              { icon: Heart, title: 'Sua lista de favoritos', desc: 'Salve o que quiser e continue de onde parou.' },
              { icon: Sparkles, title: 'Novidades toda semana', desc: 'Conteúdo novo entrando na plataforma o tempo todo.' },
            ].map((b, i) => (
              <div key={i} className="p-6 rounded-2xl card-hover fade-up"
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', animationDelay: `${i * 0.05}s` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-dim)' }}>
                  <b.icon size={20} color="var(--accent-light)" />
                </div>
                <h3 className="font-bold mb-1.5" style={{ color: '#fff' }}>{b.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="px-4 md:px-10 py-20">
        <div className="mx-auto" style={{ maxWidth: 900 }}>
          <h2 className="text-center font-extrabold mb-12" style={{ fontSize: 'clamp(24px, 4vw, 34px)', color: '#fff' }}>
            Comece em 3 passos
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '1', title: 'Crie sua conta', desc: 'Cadastro rápido em menos de 1 minuto. Só seu nome e e-mail.' },
              { n: '2', title: 'Escolha seu plano', desc: 'A partir de R$12,90/mês. Cancele quando quiser, sem multa.' },
              { n: '3', title: 'Comece a assistir', desc: 'Acesso liberado na hora a todo o catálogo dublado.' },
            ].map((s, i) => (
              <div key={i} className="text-center fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-extrabold"
                  style={{ background: 'var(--accent)', color: '#fff', fontSize: 20, boxShadow: '0 4px 20px var(--accent-glow)' }}>
                  {s.n}
                </div>
                <h3 className="font-bold mb-2" style={{ color: '#fff' }}>{s.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROVA SOCIAL ===== */}
      <section className="px-4 md:px-10 py-16" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto" style={{ maxWidth: 1040 }}>
          <h2 className="text-center font-extrabold mb-3" style={{ fontSize: 'clamp(24px, 4vw, 34px)', color: '#fff' }}>
            Quem assiste, ama
          </h2>
          <div className="flex items-center justify-center gap-1 mb-10">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill="var(--amber)" color="var(--amber)" />)}
            <span className="text-sm ml-2" style={{ color: 'var(--text-dim)' }}>4,9 de 5 — milhares de assinantes</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'Camila R.', text: 'Viciei! Consigo ver um drama inteiro na hora do almoço. E tudo dublado, amei.' },
              { name: 'Patrícia M.', text: 'Muito melhor que ficar caçando dorama de graça que vive travando. Vale cada centavo.' },
              { name: 'Juliana S.', text: 'O preço é simbólico perto do que outros streamings cobram. Recomendo demais.' },
            ].map((d, i) => (
              <div key={i} className="p-6 rounded-2xl fade-up"
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', animationDelay: `${i * 0.06}s` }}>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={13} fill="var(--amber)" color="var(--amber)" />)}
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>"{d.text}"</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>— {d.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== OFERTA / PREÇO ===== */}
      <section id="planos" className="px-4 md:px-10 py-20">
        <div className="mx-auto text-center" style={{ maxWidth: 980 }}>
          <span className="badge badge-red mb-4">OFERTA DE LANÇAMENTO</span>
          <h2 className="font-extrabold mb-3" style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', color: '#fff' }}>
            Acesso ilimitado por menos que um café
          </h2>
          <p className="mb-12" style={{ color: 'var(--text-dim)' }}>
            Escolha seu plano. Sem fidelidade, cancele quando quiser.
          </p>

          <div className="grid md:grid-cols-2 gap-5 text-left">
            {/* Básico */}
            <div className="p-7 rounded-3xl fade-up"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--blue)' }}>BÁSICO</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>R$49,90</span>
              </div>
              <div className="flex items-end gap-1 mb-5">
                <span className="font-extrabold" style={{ fontSize: 40, color: '#fff' }}>R$12,90</span>
                <span className="mb-2 text-sm" style={{ color: 'var(--text-dim)' }}>/mês</span>
              </div>
              <ul className="flex flex-col gap-3 mb-7">
                {['Catálogo completo dublado', 'Assista no celular e tablet', 'Sua lista de favoritos', 'Cancele quando quiser'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                    <Check size={16} color="var(--green)" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={goRegister}
                className="w-full py-3.5 rounded-xl font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
                Assinar básico
              </button>
            </div>

            {/* Premium — destaque */}
            <div className="p-7 rounded-3xl relative fade-up"
              style={{ background: 'linear-gradient(160deg, rgba(225,29,72,0.14), rgba(225,29,72,0.03))', border: '1px solid rgba(225,29,72,0.4)', animationDelay: '0.06s' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full flex items-center gap-1"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--accent-glow)' }}>
                <Crown size={12} fill="#fff" color="#fff" />
                <span className="text-xs font-bold text-white">MAIS POPULAR</span>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-light)' }}>PREMIUM</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>R$79,90</span>
              </div>
              <div className="flex items-end gap-1 mb-5">
                <span className="font-extrabold" style={{ fontSize: 40, color: '#fff' }}>R$24,90</span>
                <span className="mb-2 text-sm" style={{ color: 'var(--text-dim)' }}>/mês</span>
              </div>
              <ul className="flex flex-col gap-3 mb-7">
                {['Tudo do plano Básico', 'Qualidade máxima de vídeo', 'Vários perfis na mesma conta', 'Acesso antecipado a novidades', 'Sem qualquer interrupção'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                    <Check size={16} color="var(--green)" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={goRegister}
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2"
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px var(--accent-glow)' }}>
                <Zap size={16} fill="white" /> Assinar premium
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GARANTIA ===== */}
      <section className="px-4 md:px-10 py-12">
        <div className="mx-auto flex flex-col sm:flex-row items-center gap-5 p-7 rounded-3xl fade-up"
          style={{ maxWidth: 760, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'var(--green-dim)' }}>
            <ShieldCheck size={28} color="var(--green)" />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-bold mb-1" style={{ color: '#fff' }}>Risco zero pra você</h3>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Sem fidelidade e sem multa. Não gostou? Cancela em 1 clique, sem burocracia.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="px-4 md:px-10 py-16" style={{ background: 'var(--surface)' }}>
        <div className="mx-auto" style={{ maxWidth: 720 }}>
          <h2 className="text-center font-extrabold mb-10" style={{ fontSize: 'clamp(24px, 4vw, 34px)', color: '#fff' }}>
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'Os doramas são dublados em português?', a: 'Sim! Todo o catálogo é dublado em português brasileiro. É só assistir e relaxar.' },
              { q: 'Preciso pagar pra testar?', a: 'Você cria sua conta gratuitamente e conhece a plataforma. Para liberar o catálogo completo, escolhe um plano a partir de R$12,90/mês.' },
              { q: 'Posso cancelar quando quiser?', a: 'Pode sim. Não há fidelidade nem multa — você cancela em 1 clique a qualquer momento.' },
              { q: 'Em quais aparelhos funciona?', a: 'Funciona no celular, tablet e computador, direto pelo navegador. Sua conta acompanha você em todos.' },
              { q: 'Com que frequência entram novidades?', a: 'Adicionamos conteúdo novo na plataforma toda semana, e ele aparece na seção "Novos".' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <span className="font-semibold text-sm" style={{ color: '#fff' }}>{item.q}</span>
                  <ChevronDown size={18} color="var(--text-dim)"
                    style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-sm fade-in" style={{ color: 'var(--text-dim)' }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="px-4 md:px-10 py-24 text-center">
        <div className="mx-auto fade-up" style={{ maxWidth: 640 }}>
          <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(28px, 5vw, 44px)', lineHeight: 1.1, color: '#fff' }}>
            Sua próxima história favorita está a um clique
          </h2>
          <p className="mb-8" style={{ fontSize: 17, color: 'var(--text-dim)' }}>
            Junte-se a milhares de pessoas que já assistem no Dramix. Comece agora.
          </p>
          <button onClick={goRegister}
            className="py-4 px-10 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 17, boxShadow: '0 8px 32px var(--accent-glow)' }}>
            <Zap size={18} fill="white" /> Criar minha conta grátis
          </button>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Cadastro em menos de 1 minuto · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-4 md:px-10 py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4" style={{ maxWidth: 1040 }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Play size={14} fill="white" color="white" />
            </div>
            <span className="font-extrabold" style={{ color: '#fff' }}>Dramix</span>
          </div>
          <div className="flex items-center gap-5 text-xs" style={{ color: 'var(--text-dim)' }}>
            <button onClick={() => navigate('/termos')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Termos de uso</button>
            <button onClick={() => navigate('/privacidade')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Privacidade</button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© {new Date().getFullYear()} Dramix</p>
        </div>
      </footer>
    </div>
  )
}
