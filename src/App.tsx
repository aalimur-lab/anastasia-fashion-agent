import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Languages, Briefcase, GraduationCap, Award, Info, X } from 'lucide-react';
import { AnastasiaAgent, AnastasiaAgentConfig } from './services/anastasiaService';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const agentRef = useRef<AnastasiaAgent | null>(null);

  const toggleConnection = async () => {
    if (status === 'active' || status === 'connecting') {
      agentRef.current?.disconnect();
      setStatus('idle');
    } else {
      if (!agentRef.current) {
        agentRef.current = new AnastasiaAgent();
      }
      
      const config: AnastasiaAgentConfig = {
        onStatusChange: (s) => setStatus(s),
        onError: (e) => setError(e),
        voiceName: 'Puck'
      };
      
      await agentRef.current.connect(config);
    }
  };

  useEffect(() => {
    return () => {
      agentRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-luxury-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-luxury-ink/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation Rail (Recipe 11/12 style) */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-luxury-ink/10">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-luxury-ink/50 font-sans font-semibold">ESMOD Paris</span>
          <h1 className="serif text-2xl font-light tracking-tight">Anastasia Alimuradova</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setShowInfo(true)}
            className="text-[11px] uppercase tracking-[0.1em] hover:text-luxury-gold transition-colors flex items-center gap-2"
          >
            <Info size={14} />
            Background
          </button>
          <div className="h-4 w-[1px] bg-luxury-ink/10" />
          <div className="flex items-center gap-2">
            <Languages size={14} className="text-luxury-gold" />
            <span className="text-[11px] uppercase tracking-[0.1em]">EN / FR</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl w-full text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="serif text-5xl md:text-7xl font-extralight leading-tight mb-6">
              Professional <br />
              <span className="italic text-luxury-gold">Voice Assistant</span>
            </h2>
            <p className="text-luxury-ink/60 max-w-md mx-auto leading-relaxed font-light">
              Experience a sophisticated conversation about fashion marketing, 
              luxury brand strategy, and professional industry insights.
            </p>
          </motion.div>

          {/* Voice Interaction Orb */}
          <div className="relative flex items-center justify-center py-12">
            <AnimatePresence mode="wait">
              {status === 'active' ? (
                <motion.div
                  key="active-orb"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative"
                >
                  {/* Pulsing Rings */}
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 border border-luxury-gold rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute inset-0 border border-luxury-gold rounded-full"
                  />
                  
                  {/* Main Orb */}
                  <div className="w-48 h-48 rounded-full bg-luxury-ink flex items-center justify-center shadow-2xl relative z-10">
                    <div className="flex gap-1 items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [12, 40, 12] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          className="w-1 bg-luxury-gold rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle-orb"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-48 h-48 rounded-full border border-luxury-ink/10 flex items-center justify-center"
                >
                  <div className="w-40 h-40 rounded-full border border-luxury-ink/5 flex items-center justify-center">
                    <Mic size={32} className="text-luxury-ink/20" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={toggleConnection}
              disabled={status === 'connecting'}
              className={`
                group relative px-12 py-4 rounded-full overflow-hidden transition-all duration-500
                ${status === 'active' 
                  ? 'bg-luxury-ink text-luxury-cream' 
                  : 'bg-transparent border border-luxury-ink text-luxury-ink hover:bg-luxury-ink hover:text-luxury-cream'}
              `}
            >
              <span className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold">
                {status === 'active' ? (
                  <>
                    <MicOff size={16} />
                    End Session
                  </>
                ) : status === 'connecting' ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-luxury-gold border-t-transparent rounded-full"
                    />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mic size={16} />
                    Start Conversation
                  </>
                )}
              </span>
            </button>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-[10px] uppercase tracking-widest"
              >
                {error}
              </motion.p>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info Rail */}
      <footer className="relative z-10 grid grid-cols-1 md:grid-cols-3 border-t border-luxury-ink/10">
        <div className="p-8 border-r border-luxury-ink/10 flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-luxury-ink/40 font-semibold">Current Focus</span>
          <p className="text-xs leading-relaxed">Marketing & Communications Strategy in the Fashion Industry BS</p>
        </div>
        <div className="p-8 border-r border-luxury-ink/10 flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-luxury-ink/40 font-semibold">Experience</span>
          <p className="text-xs leading-relaxed">Victoria Beckham, Vivienne Westwood, Max Mara, Paris Fashion Week</p>
        </div>
        <div className="p-8 flex flex-col gap-2">
          <span className="text-[10px] uppercase tracking-widest text-luxury-ink/40 font-semibold">Expertise</span>
          <p className="text-xs leading-relaxed">Luxury Brand Positioning, Visual Merchandising, Trend Forecasting</p>
        </div>
      </footer>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-luxury-cream/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-2xl w-full bg-white p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
              <button 
                onClick={() => setShowInfo(false)}
                className="absolute top-8 right-8 p-2 hover:bg-luxury-cream rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-10">
                <div className="flex flex-col gap-2">
                  <span className="text-luxury-gold text-[10px] uppercase tracking-[0.3em] font-bold">About Anastasia</span>
                  <h3 className="serif text-4xl">Professional Profile</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-luxury-cream flex items-center justify-center shrink-0">
                        <Briefcase size={18} className="text-luxury-gold" />
                      </div>
                      <div>
                        <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">Experience</h4>
                        <p className="text-xs text-luxury-ink/60 leading-relaxed">
                          Showroom Assistant at Victoria Beckham & Vivienne Westwood. Backstage dresser at Paris Fashion Week.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-luxury-cream flex items-center justify-center shrink-0">
                        <GraduationCap size={18} className="text-luxury-gold" />
                      </div>
                      <div>
                        <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">Education</h4>
                        <p className="text-xs text-luxury-ink/60 leading-relaxed">
                          ESMOD Paris - Fashion Business. Institut Français de la Mode - Luxury immersion.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-luxury-cream flex items-center justify-center shrink-0">
                        <Award size={18} className="text-luxury-gold" />
                      </div>
                      <div>
                        <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">Certifications</h4>
                        <p className="text-xs text-luxury-ink/60 leading-relaxed">
                          Inside LVMH Certificate - Creation, Branding, Operations & Supply Chain.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-luxury-cream flex items-center justify-center shrink-0">
                        <Languages size={18} className="text-luxury-gold" />
                      </div>
                      <div>
                        <h4 className="text-[11px] uppercase tracking-widest font-bold mb-1">Languages</h4>
                        <p className="text-xs text-luxury-ink/60 leading-relaxed">
                          English (C1), French (B2), Russian (Native).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-luxury-ink/5">
                  <p className="text-xs italic text-luxury-ink/50 text-center">
                    "Specializing in the intersection of creative vision and consumer behavior."
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
