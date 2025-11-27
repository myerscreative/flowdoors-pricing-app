'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'
import { GradientBackground } from '@/components/GradientBackground'

export default function DeepDivePage() {
  const router = useRouter()

  return (
    <>
      <style jsx>{`
        :root {
          --focus-color: #38bdf8;
          --language-color: #c026d3;
          --physiology-color: #f97316;
        }

        .bg-orbs {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.25;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: #a8e0eb;
          top: -100px;
          left: -100px;
        }

        .orb-2 {
          width: 400px;
          height: 400px;
          background: #f0c6d8;
          opacity: 0.12;
          top: 20%;
          right: -150px;
          animation-delay: -5s;
        }

        .orb-3 {
          width: 350px;
          height: 350px;
          background: #e8d4c8;
          opacity: 0.2;
          bottom: -100px;
          left: 30%;
          animation-delay: -10s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        @keyframes float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-icon {
          animation: float-icon 3s ease-in-out infinite;
        }

        .header { animation: fadeInUp 0.6s ease-out 0.1s both; }
        .hero { animation: fadeInUp 0.6s ease-out 0.2s both; }
        .content-card { animation: fadeInUp 0.6s ease-out 0.3s both; }
        .cta-card { animation: fadeInUp 0.6s ease-out 0.4s both; }
      `}</style>

      <div className="relative min-h-screen">
        <GradientBackground />
        
        {/* Additional animated background orbs */}
        <div className="bg-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="relative z-10 max-w-[720px] mx-auto px-5 py-6 md:px-6 lg:px-8 min-h-screen">
          {/* Header */}
          <header className="header flex justify-between items-center pb-5">
            <Link 
              href="/home"
              className="flex items-center gap-2 bg-white/70 border border-black/8 text-text-secondary px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md transition-all hover:bg-white/90 hover:text-text-primary hover:-translate-x-0.5"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
              </svg>
              Back to Dashboard
            </Link>
            <Logo variant="text" href="/home" />
          </header>

          {/* Hero */}
          <section className="hero text-center py-10 md:py-12 lg:py-14">
            <div className="hero-icon text-5xl md:text-6xl lg:text-7xl mb-4 inline-block">🧠</div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary mb-3 leading-tight">
              Understanding Your Emotional Patterns
            </h1>
            <p className="text-lg md:text-xl text-text-secondary font-normal leading-relaxed">
              Your moods aren&apos;t random. They&apos;re created by three ingredients you can observe and adjust.
            </p>
          </section>

          {/* Main Content */}
          <div className="bg-white/85 backdrop-blur-xl border border-white/50 rounded-[28px] p-6 md:p-8 lg:p-10 mb-6 shadow-lg">
            
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                Why Emotions Feel Confusing
              </h2>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                Most of the time, emotional states feel like one undifferentiated experience. You just &quot;feel stressed&quot; or &quot;feel good&quot; without understanding what&apos;s actually creating that state.
              </p>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                This happens because your brain fuses three separate elements together:
              </p>
              <ul className="my-4 ml-6 leading-loose">
                <li><strong style={{ color: '#38bdf8' }}>Mental imagery</strong> (what you&apos;re picturing)</li>
                <li><strong style={{ color: '#c026d3' }}>Internal dialogue</strong> (what you&apos;re telling yourself)</li>
                <li><strong style={{ color: '#f97316' }}>Physical sensations</strong> (what your body is doing)</li>
              </ul>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                When these are blended, you can&apos;t see which ingredient is driving the intensity. You just feel the result.
              </p>
            </section>

            {/* Three Ingredients */}
            <section id="ingredients" className="mb-12">
              <div 
                className="p-5 md:p-6 mb-6 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(192, 38, 211, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                  borderLeft: '4px solid #c026d3',
                  borderTop: '4px solid #c026d3',
                  borderTopLeftRadius: '0.75rem',
                  borderTopRightRadius: '0.75rem',
                  borderBottomLeftRadius: '0.75rem'
                }}
              >
                <p className="text-lg leading-relaxed text-text-primary font-medium">
                  But once you separate them, you gain clarity. And clarity gives you options.
                </p>
              </div>
              
              {/* Visual comparison: Blended vs Separated */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 my-8 py-4">
                {/* Blended - Tangled Thread */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-black/10 flex flex-col items-center relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-4" style={{ minWidth: '128px', minHeight: '128px' }}>
                    <svg width="128" height="128" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                      {/* More tangled and chaotic multi-color threads */}
                      <path d="M15,20 Q25,30 35,15 Q45,25 55,20 Q65,35 75,25 Q85,40 90,20" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round"/>
                      <path d="M20,35 Q30,45 40,30 Q50,50 60,35 Q70,55 80,40 Q90,60 95,35" stroke="#c026d3" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round"/>
                      <path d="M25,50 Q35,60 45,45 Q55,65 65,50 Q75,70 85,55 Q90,75 95,50" stroke="#f97316" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round"/>
                      <path d="M10,40 Q20,50 30,35 Q40,60 50,45 Q60,70 70,55 Q80,75 85,40" stroke="#38bdf8" strokeWidth="2.2" fill="none" opacity="0.7" strokeLinecap="round"/>
                      <path d="M30,30 Q40,20 50,35 Q60,25 70,40 Q80,30 90,45 Q95,20 100,30" stroke="#c026d3" strokeWidth="2.2" fill="none" opacity="0.7" strokeLinecap="round"/>
                      <path d="M17,55 Q27,65 37,50 Q47,75 57,60 Q67,80 77,65 Q87,85 92,55" stroke="#f97316" strokeWidth="2.2" fill="none" opacity="0.7" strokeLinecap="round"/>
                      <path d="M23,70 Q33,80 43,65 Q53,85 63,70 Q73,90 83,75 Q88,95 93,70" stroke="#38bdf8" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
                      <path d="M35,60 Q45,50 55,65 Q65,55 75,70 Q85,60 90,75 Q95,50 100,60" stroke="#c026d3" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
                      <path d="M13,80 Q23,90 33,75 Q43,95 53,80 Q63,100 73,85 Q83,100 88,80" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round"/>
                      <path d="M40,15 Q50,25 60,10 Q70,30 80,15 Q90,40 95,10" stroke="#38bdf8" strokeWidth="1.8" fill="none" opacity="0.5" strokeLinecap="round"/>
                      <path d="M45,90 Q55,100 65,85 Q75,100 85,90 Q90,100 95,85" stroke="#c026d3" strokeWidth="1.8" fill="none" opacity="0.5" strokeLinecap="round"/>
                      <path d="M12,25 Q22,35 32,20 Q42,40 52,25 Q62,50 72,35 Q82,55 87,25" stroke="#f97316" strokeWidth="1.8" fill="none" opacity="0.5" strokeLinecap="round"/>
                      <path d="M28,75 Q38,85 48,70 Q58,90 68,75 Q78,95 88,80 Q93,100 98,75" stroke="#38bdf8" strokeWidth="1.6" fill="none" opacity="0.4" strokeLinecap="round"/>
                      <path d="M18,45 Q28,55 38,40 Q48,60 58,45 Q68,65 78,50 Q88,70 93,45" stroke="#c026d3" strokeWidth="1.6" fill="none" opacity="0.4" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className="text-sm md:text-base text-text-primary text-center font-medium">Emotionally stuck and out of control</p>
                  {/* Red X icon */}
                  <div className="absolute bottom-2 right-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {/* Arrow - bolder and centered */}
                <div className="text-4xl md:text-5xl text-text-primary font-bold my-4 md:my-0" style={{ fontWeight: 700 }}>→</div>
                
                {/* Separated - Grouped Strings */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-black/10 flex flex-col items-center relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 mb-4 flex items-center justify-center" style={{ minWidth: '128px', minHeight: '128px' }}>
                    <svg width="128" height="128" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
                      {/* Mental imagery strings (blue) - top section, centered, 50% longer */}
                      <line x1="5" y1="15" x2="95" y2="15" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="20" x2="95" y2="20" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="25" x2="95" y2="25" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="30" x2="95" y2="30" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" opacity="0.7"/>
                      
                      {/* Internal dialogue strings (purple) - middle section, centered, 50% longer */}
                      <line x1="5" y1="45" x2="95" y2="45" stroke="#c026d3" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="50" x2="95" y2="50" stroke="#c026d3" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="55" x2="95" y2="55" stroke="#c026d3" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="60" x2="95" y2="60" stroke="#c026d3" strokeWidth="2.2" strokeLinecap="round" opacity="0.7"/>
                      
                      {/* Physical sensation strings (orange) - bottom section, centered, 50% longer */}
                      <line x1="5" y1="75" x2="95" y2="75" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="80" x2="95" y2="80" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="85" x2="95" y2="85" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
                      <line x1="5" y1="90" x2="95" y2="90" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" opacity="0.7"/>
                    </svg>
                  </div>
                  <p className="text-sm md:text-base text-text-primary text-center font-medium">Clarity that leads to control</p>
                  {/* Green checkmark icon */}
                  <div className="absolute bottom-2 right-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-6 md:mb-8">
                The Three Ingredients of Every Emotional State
              </h2>
              
              <div className="grid grid-cols-1 gap-6 md:gap-8 my-8">
                {/* Focus */}
                <div className="bg-white rounded-3xl p-6 md:p-7 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl border-2 flex flex-col" style={{ borderColor: 'var(--focus-color)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display text-lg font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: 'var(--focus-color)' }}
                    >
                      1
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-text-primary">Focus</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 font-medium">What you&apos;re mentally picturing</p>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary mb-4 flex-grow">
                    Your mind constantly generates images: future scenarios, memories, possibilities, fears. The characteristics of these images (brightness, size, distance, motion) directly influence emotional intensity.
                  </p>
                  <div className="bg-black/3 rounded-xl p-4 mt-auto">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Example</div>
                    <p className="text-sm leading-relaxed text-text-primary italic">
                      Imagining a close, bright, fast-moving scene of tomorrow&apos;s presentation creates different feelings than picturing it small, distant, and still.
                    </p>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-white rounded-3xl p-6 md:p-7 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl border-2 flex flex-col" style={{ borderColor: 'var(--language-color)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display text-lg font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: 'var(--language-color)' }}
                    >
                      2
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-text-primary">Language</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 font-medium">Your internal dialogue</p>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary mb-4 flex-grow">
                    The words you use internally and their tonality shape your emotional experience. &quot;This is challenging&quot; creates a different state than &quot;This is impossible.&quot; The pace, volume, and voice quality matter as much as the words.
                  </p>
                  <div className="bg-black/3 rounded-xl p-4 mt-auto">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Example</div>
                    <p className="text-sm leading-relaxed text-text-primary italic">
                      &quot;I&apos;m figuring this out&quot; (calm, steady tone) versus &quot;What if I can&apos;t handle this?&quot; (fast, sharp tone).
                    </p>
                  </div>
                </div>

                {/* Physiology */}
                <div className="bg-white rounded-3xl p-6 md:p-7 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl border-2 flex flex-col" style={{ borderColor: 'var(--physiology-color)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center font-display text-lg font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: 'var(--physiology-color)' }}
                    >
                      3
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-text-primary">Physiology</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3 font-medium">What your body is doing</p>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary mb-4 flex-grow">
                    Breathing patterns, muscle tension, posture, heart rate, and facial expressions don&apos;t just reflect emotion—they generate it. Your physical state is the foundation of your emotional state.
                  </p>
                  <div className="bg-black/3 rounded-xl p-4 mt-auto">
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Example</div>
                    <p className="text-sm leading-relaxed text-text-primary italic">
                      Shallow breathing with raised shoulders produces different feelings than slow, deep breathing with relaxed shoulders.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* How Separation Creates Control */}
            <section className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                How Separation Creates Control
              </h2>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                When you log a mood in Vibepoint, you&apos;re prompted to identify each ingredient separately:
              </p>
              <ul className="my-4 ml-6 leading-loose">
                <li>What were you focusing on?</li>
                <li>What were you telling yourself?</li>
                <li>What physical sensations were present?</li>
              </ul>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                This simple act of separation does two things:
              </p>
              
              <div className="flex flex-col gap-4 my-6">
                <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl transition-all hover:bg-white/80 hover:translate-x-1">
                  <span className="text-2xl flex-shrink-0">1️⃣</span>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary">
                    <strong>It breaks the fusion.</strong> The overwhelming &quot;emotional blob&quot; becomes three distinct, observable elements.
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl transition-all hover:bg-white/80 hover:translate-x-1">
                  <span className="text-2xl flex-shrink-0">2️⃣</span>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary">
                    <strong>It creates pattern data.</strong> Over time, you&apos;ll see which combinations consistently produce which states.
                  </p>
                </div>
              </div>

              <p className="text-base leading-relaxed text-text-primary mt-6">
                This is how you develop emotional literacy: recognizing the structure of your states, not just experiencing them.
              </p>
            </section>

            {/* Mood Shifts Section */}
            <section className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                Track Your Mood Shifts, Not Just Your Moods
              </h2>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                Your emotional state isn&apos;t fixed—it shifts throughout the day. And those shifts are where the learning happens.
              </p>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                You might feel:
              </p>
              <ul className="my-4 ml-6 leading-loose">
                <li>Anxious at 9am when checking email</li>
                <li>Focused and energized at 11am during deep work</li>
                <li>Drained at 3pm after meetings</li>
                <li>Calm at 8pm after exercise</li>
              </ul>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                Each shift reveals what changed in your three ingredients.
              </p>
              
              <div className="bg-gradient-to-br from-accent-magenta/8 to-accent-purple/8 border-l-4 border-accent-magenta p-5 md:p-6 rounded-xl my-6">
                <p className="text-lg leading-relaxed text-text-primary font-medium">
                  Log whenever you want throughout the day. Vibepoint automatically recognizes when your mood has shifted and shows you what changed.
                </p>
              </div>

              <p className="text-base leading-relaxed text-text-primary mt-6 mb-4">
                When you track these transitions, you discover:
              </p>
              
              <div className="flex flex-col gap-4 my-6">
                <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl transition-all hover:bg-white/80 hover:translate-x-1">
                  <span className="text-2xl flex-shrink-0">✨</span>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary">
                    Which activities, thoughts, or physical changes shift your state upward
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl transition-all hover:bg-white/80 hover:translate-x-1">
                  <span className="text-2xl flex-shrink-0">⚠️</span>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary">
                    What triggers downward shifts (and how to recognize them early)
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl transition-all hover:bg-white/80 hover:translate-x-1">
                  <span className="text-2xl flex-shrink-0">⏱️</span>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary">
                    Which states are temporary versus which ones linger
                  </p>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white/50 rounded-2xl transition-all hover:bg-white/80 hover:translate-x-1">
                  <span className="text-2xl flex-shrink-0">📊</span>
                  <p className="text-sm md:text-base leading-relaxed text-text-primary">
                    Your natural rhythms and energy patterns
                  </p>
                </div>
              </div>
            </section>

            {/* Example */}
            <section className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                Example: Deconstructing a State
              </h2>
              
              <div className="bg-gradient-to-br from-[var(--focus-color)]/8 to-accent-magenta/8 rounded-3xl p-6 my-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">😰</span>
                  <h3 className="font-display text-xl font-semibold text-text-primary">Before Separation</h3>
                </div>
                <p className="text-base leading-relaxed text-text-primary">&quot;I just feel anxious. I don&apos;t know why.&quot;</p>
              </div>

              <div className="bg-gradient-to-br from-[var(--focus-color)]/8 to-accent-magenta/8 rounded-3xl p-6 my-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🔍</span>
                  <h3 className="font-display text-xl font-semibold text-text-primary">After Separation</h3>
                </div>
                
                <div className="mb-5">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Focus</div>
                  <p className="text-base leading-relaxed text-text-primary">
                    Replaying a conversation from earlier, imagining worst-case outcomes
                  </p>
                </div>
                
                <div className="h-px bg-black/10 my-5"></div>
                
                <div className="mb-5">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Language</div>
                  <p className="text-base leading-relaxed text-text-primary">
                    &quot;They probably think I&apos;m incompetent&quot; (critical, fast-paced tone)
                  </p>
                </div>
                
                <div className="h-px bg-black/10 my-5"></div>
                
                <div>
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Physiology</div>
                  <p className="text-base leading-relaxed text-text-primary">
                    Tight chest, shallow breathing, tense jaw
                  </p>
                </div>
              </div>

              <p className="text-base leading-relaxed text-text-primary mt-6 mb-4">
                Now you have specific information. And specific information gives you specific interventions.
              </p>

              <p className="text-base leading-relaxed text-text-primary font-medium" style={{ color: 'var(--accent-magenta)' }}>
                Adjust any one ingredient, and the state shifts.
              </p>
            </section>

            {/* What You'll Learn */}
            <section className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                What You&apos;ll Learn Over Time
              </h2>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                After logging your moods and mood shifts, Vibepoint shows you:
              </p>
              
              <div className="grid gap-4 my-8">
                <div className="flex items-start gap-4 p-5 bg-white/60 rounded-3xl transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-magenta to-accent-purple text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-lg font-semibold text-text-primary mb-1.5">Recurring Patterns</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      Which thoughts, self-talk, and physical states correlate with which moods
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-white/60 rounded-3xl transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-magenta to-accent-purple text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-lg font-semibold text-text-primary mb-1.5">Your Triggers</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      What you were focusing on during low-energy or high-stress states
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-white/60 rounded-3xl transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-magenta to-accent-purple text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-lg font-semibold text-text-primary mb-1.5">Your Resources</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      What conditions reliably produce your best states
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-white/60 rounded-3xl transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-magenta to-accent-purple text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-lg font-semibold text-text-primary mb-1.5">Physical Signals</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      Which bodily sensations predict emotional shifts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-5 bg-white/60 rounded-3xl transition-all hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-magenta to-accent-purple text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-lg font-semibold text-text-primary mb-1.5">Transition Patterns</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      What helps you shift from difficult states to better ones
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-base leading-relaxed text-text-primary mt-6 mb-4">
                You&apos;re building a map of your own emotional patterns.
              </p>

              <div className="bg-gradient-to-br from-accent-magenta/8 to-accent-purple/8 border-l-4 border-accent-magenta p-5 md:p-6 rounded-xl mt-6">
                <p className="text-lg leading-relaxed text-text-primary font-medium">
                  This is practical self-knowledge. Not theory—data from your own experience.
                </p>
              </div>
            </section>

            {/* Why This Matters */}
            <section className="mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-text-primary mb-4">
                Why This Matters
              </h2>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                Most people develop their emotional patterns unconsciously and then live inside them for years, unaware they can be observed and adjusted.
              </p>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                Vibepoint makes the invisible visible.
              </p>
              <p className="text-base leading-relaxed text-text-primary mb-4">
                Once you see the structure of your states, you stop being at their mercy. You become able to recognize them as they form, understand what&apos;s driving them, and make adjustments before they fully take hold.
              </p>
              
              <div className="bg-gradient-to-br from-accent-magenta/8 to-accent-purple/8 border-l-4 border-accent-magenta p-5 md:p-6 rounded-xl mt-6">
                <p className="text-lg leading-relaxed text-text-primary font-medium">
                  This is the difference between reacting to your emotions and managing them.
                </p>
              </div>
            </section>

          </div>

          {/* CTA */}
          <div 
            className="cta-card rounded-[28px] p-8 md:p-10 text-center text-white shadow-2xl mt-12 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #c026d3 50%, #7c3aed 100%)',
              boxShadow: '0 12px 40px rgba(192, 38, 211, 0.3)'
            }}
          >
            <div 
              className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                transform: 'translate(30%, -50%)'
              }}
            ></div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-3 leading-tight">
                Start Building Your Emotional Map
              </h2>
              <p className="text-base md:text-lg opacity-90 mb-7 leading-relaxed">
                Track your patterns. Understand your moods. Take control of your emotional experience.
              </p>
              <button
                onClick={() => router.push('/mood/new')}
                className="inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-white border-none rounded-full font-semibold text-lg cursor-pointer shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                style={{ color: 'var(--accent-magenta)' }}
              >
                <span>Log Your First Mood</span>
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

