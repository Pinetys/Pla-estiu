import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Calendar,
  Zap,
  Plus,
  Send,
  CheckCircle,
  Award,
  Flame,
  Bell,
  BellRing,
  ChevronRight,
  User,
  Trophy,
  Lock,
  MessageSquare,
  Smile,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Activity,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from "recharts";
import {
  TrainingPlan,
  CustomObjective,
  NotificationLog
} from "../types";
import AIPlanAnalysis from "./AIPlanAnalysis";
import Leaderboard from "./Leaderboard";
import SummerHydrationTracker from "./SummerHydrationTracker";

function DrillDiagram({ drill }: { drill: any }) {
  const category = drill.category ? drill.category.toLowerCase() : "";
  
  const [isPlayingAdvice, setIsPlayingAdvice] = useState<boolean>(false);
  const [coachAdviceQuote, setCoachAdviceQuote] = useState<string>("");

  useEffect(() => {
    // Reset/Cancel speech whenever the drill or category changes, or the component unmounts
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [drill]);

  const getCOACH_QUOTES = () => {
    if (category === "tiro") {
      return "¡Atención! Prepara la base de apoyo con un paso rápido. Alinea el codo con la canasta a noventa grados y realiza una excelente extensión completa dejando colgar la muñeca para un arco de seda. ¡No bajes el balón antes de tirar!";
    } else if (category === "bote") {
      return "¡Dribla con fuerza demoledora golpeando el piso a nivel de la cadera o rodilla! Mantén la vista clavada al aro para anticipar defensas y estricto control de fintas con ambos perfiles.";
    } else if (category === "agilidad") {
      return "Mantén tu centro de gravedad sumamente bajo. Pisa rápido con las puntas de los pies en el centro de la escalera sin tocar las cuerdas de soporte. ¡Reacción máxima al contacto!";
    } else if (category === "resistencia") {
      return "Esprinta al cien por ciento como si quedaran tres segundos de partido. Inhala de manera nasal controlada y sopla fuerte con la boca para evitar acumular fatiga antes del cierre.";
    } else if (category === "finalizaciones" || category === "kobe") {
      return "Absorbe el contacto simulado con el hombro. Extiende tu mano lo más arriba posible cerca del cristal y suelta con un toque sumamente sutil. ¡Mantén el balón arriba del mentón!";
    } else {
      return "Mentalidad Mamba encendida: Visualiza al defensor protegiendo el aro en cada segundo del ejercicio. No regales ni una sola repetición y busca el acierto dinámico perfecto.";
    }
  };

  const speakAdvice = () => {
    const quote = getCOACH_QUOTES();
    setCoachAdviceQuote(quote);
    setIsPlayingAdvice(true);
    
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(quote);
      utterance.lang = "es-ES";
      utterance.rate = 1.0;
      utterance.pitch = 0.95; 
      utterance.onend = () => setIsPlayingAdvice(false);
      utterance.onerror = () => setIsPlayingAdvice(false);
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback
      setTimeout(() => setIsPlayingAdvice(false), 5800);
    }
  };
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-5 text-white max-w-full overflow-hidden mt-3 relative">
      {/* Basketball half-court outline schematic */}
      <div className="relative w-full max-w-[280px] md:w-52 aspect-[4/3] border border-slate-600 bg-slate-950/85 rounded-xl overflow-hidden shrink-0 mx-auto md:mx-0">
        <svg viewBox="0 0 200 150" className="w-full h-full select-none">
          {/* Outer Border */}
          <rect x="5" y="5" width="190" height="140" rx="3" stroke="rgba(255,255,255,0.45)" fill="none" strokeWidth="1.5" />
          
          {/* Key Area */}
          <rect x="75" y="95" width="50" height="50" stroke="rgba(255,255,255,0.45)" fill="rgba(255,255,255,0.02)" strokeWidth="1.5" />
          {/* Free throw lane semicircle (top) */}
          <path d="M 75 95 A 25 25 0 0 1 125 95" stroke="rgba(255,255,255,0.45)" fill="none" strokeWidth="1.5" />
          {/* Free throw lane semicircle (bottom, dashed) */}
          <path d="M 75 95 A 25 25 0 0 0 125 95" stroke="rgba(255,255,255,0.4)" strokeDasharray="3,3" fill="none" strokeWidth="1.5" />
          
          {/* Backboard & Net Center */}
          <line x1="85" y1="135" x2="115" y2="135" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
          <circle cx="100" cy="128" r="4.5" stroke="#FF6B00" fill="none" strokeWidth="2" />
          
          {/* Three-point arc */}
          <path 
            d="M 25 145 L 25 110 A 75 75 0 0 1 175 110 L 175 145" 
            stroke="rgba(255,255,255,0.45)" 
            fill="none" 
            strokeWidth="1.5" 
          />
          
          {/* Restricted area arc */}
          <path d="M 90 128 A 10 10 0 0 1 110 128" stroke="rgba(255,255,255,0.25)" fill="none" strokeWidth="1" />
          
          {/* Category-Specific Visual Assets */}
          {category === "tiro" && (
            <>
              {/* Pass origin feeder */}
              <circle cx="160" cy="70" r="7" fill="rgba(59,130,246,0.3)" stroke="#3B82F6" strokeWidth="1.5" />
              <text x="160" y="73" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">F</text>
              
              {/* Player shooting spot */}
              <circle cx="65" cy="80" r="7" fill="rgba(255,107,0,0.3)" stroke="#FF6B00" strokeWidth="1.5" />
              <text x="65" y="83" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">J</text>
              
              {/* Movement to shoot */}
              <path d="M 45 110 Q 55 90 65 80" stroke="#FF6B00" fill="none" strokeWidth="2" strokeDasharray="1,1" />
              
              {/* Ball pass path */}
              <path d="M 153 72 L 72 79" stroke="#3B82F6" fill="none" strokeWidth="2" strokeDasharray="4,4" />
              
              {/* Arrowhead */}
              <polygon points="72,79 80,74 78,82" fill="#3B82F6" />
              
              {/* Shot spots target hoops */}
              <circle cx="100" cy="128" r="7" stroke="rgba(239,68,68,0.4)" strokeWidth="2" strokeDasharray="2,2" fill="none" />
              <text x="100" y="112" fill="#EF4444" fontSize="6" fontWeight="bold" textAnchor="middle">ARO</text>
            </>
          )}

          {category === "bote" && (
            <>
              {/* Cone obstacles */}
              <polygon points="100,55 97,63 103,63" fill="#EF4444" stroke="#FFF" strokeWidth="0.5" />
              <polygon points="85,80 82,88 88,88" fill="#EF4444" stroke="#FFF" strokeWidth="0.5" />
              <polygon points="115,105 112,113 118,113" fill="#EF4444" stroke="#FFF" strokeWidth="0.5" />
              
              {/* Player handling origin */}
              <circle cx="100" cy="30" r="7" fill="rgba(255,107,0,0.3)" stroke="#FF6B00" strokeWidth="1.5" />
              <text x="100" y="33" fill="#FFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">J</text>
              
              {/* Dribble trail weaving in zig-zag */}
              <path d="M 100 37 Q 75 60 85 80 T 115 105 T 100 128" stroke="#FF6B00" fill="none" strokeWidth="2" />
              <circle cx="100" cy="128" r="4" fill="#10B981" />
            </>
          )}

          {category === "agilidad" && (
            <>
              {/* Coordination ladder */}
              <g stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none">
                <line x1="85" y1="40" x2="85" y2="105" />
                <line x1="115" y1="40" x2="115" y2="105" />
                <line x1="85" y1="40" x2="115" y2="40" />
                <line x1="85" y1="53" x2="115" y2="53" />
                <line x1="85" y1="66" x2="115" y2="66" />
                <line x1="85" y1="79" x2="115" y2="79" />
                <line x1="85" y1="92" x2="115" y2="92" />
                <line x1="85" y1="105" x2="115" y2="105" />
              </g>
              
              {/* Quick foot steps arrow dots */}
              <path d="M 75 45 Q 100 50 125 55 T 75 65 T 125 75 T 75 85 T 100 115" stroke="#7C3AED" fill="none" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="75" cy="45" r="3" fill="#7C3AED" />
              <circle cx="125" cy="55" r="3" fill="#7C3AED" />
              <circle cx="75" cy="65" r="3" fill="#7C3AED" />
              <circle cx="125" cy="75" r="3" fill="#7C3AED" />
              <circle cx="75" cy="85" r="3" fill="#7C3AED" />
              <circle cx="100" cy="115" r="4.5" fill="#10B981" />
            </>
          )}

          {category === "resistencia" && (
            <>
              {/* Sprint pathways */}
              <line x1="60" y1="140" x2="60" y2="20" stroke="#EF4444" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="100" y1="140" x2="100" y2="50" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="140" y1="140" x2="140" y2="90" stroke="#10B981" strokeWidth="1" strokeDasharray="2,2" />
              
              {/* Directional speed indicators */}
              <path d="M 60 140 L 60 20" stroke="#EF4444" fill="none" strokeWidth="2" />
              <polygon points="60,20 56,28 64,28" fill="#EF4444" />
              
              <path d="M 100 140 L 100 50" stroke="#3B82F6" fill="none" strokeWidth="2" />
              <polygon points="100,50 96,58 104,58" fill="#3B82F6" />
              
              <path d="M 140 140 L 140 90" stroke="#10B981" fill="none" strokeWidth="2" />
              <polygon points="140,90 136,98 144,98" fill="#10B981" />
              
              <text x="60" y="16" fill="#EF4444" fontSize="6" fontWeight="bold" textAnchor="middle">100% SPRINT</text>
            </>
          )}

          {category === "finalizaciones" && (
            <>
              {/* Mikan / Layup loop drawing */}
              <path d="M 85 90 Q 70 115 92 125" stroke="#10B981" fill="none" strokeWidth="2" />
              <polygon points="92,125 86,120 95,118" fill="#10B981" />

              <path d="M 115 90 Q 130 115 108 125" stroke="#10B981" fill="none" strokeWidth="2" />
              <polygon points="108,125 114,120 105,118" fill="#10B981" />
              
              {/* Cones guarding */}
              <polygon points="76,120 73,126 79,126" fill="#FBBF24" stroke="#FFF" strokeWidth="0.5" />
              <polygon points="124,120 121,126 127,126" fill="#FBBF24" stroke="#FFF" strokeWidth="0.5" />
              
              {/* Ball indicators */}
              <circle cx="85" cy="90" r="4.5" fill="#3B82F6" />
              <circle cx="115" cy="90" r="4.5" fill="#3B82F6" />
            </>
          )}

          {category === "kobe" && (
            <>
              {/* Mid-post or elbow fadeaway spot in Gold and Purple */}
              {/* Player symbol */}
              <circle cx="65" cy="95" r="7" fill="rgba(251,191,36,0.3)" stroke="#FBBF24" strokeWidth="1.5" />
              <text x="65" y="98" fill="#FBBF24" fontSize="7" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">24</text>
              
              {/* Turnaround fadeaway path */}
              <path d="M 65 95 Q 45 105 45 112" stroke="#FBBF24" fill="none" strokeWidth="2" strokeDasharray="2,2" />
              <polygon points="45,112 50,107 42,107" fill="#FBBF24" />
              
              {/* Turnaround spot */}
              <circle cx="45" cy="112" r="3" fill="#A855F7" />
              
              {/* Pure high trajectory arc to basket */}
              <path d="M 45 112 Q 72 65 100 128" stroke="#A855F7" fill="none" strokeWidth="2" strokeDasharray="4,4" />
              <polygon points="100,128 93,124 99,120" fill="#A855F7" />
              
              {/* Target Indicator near net */}
              <circle cx="100" cy="128" r="7" stroke="rgba(168,85,247,0.5)" strokeWidth="2" strokeDasharray="2,2" fill="none" />
              <text x="100" y="112" fill="#FBBF24" fontSize="6.5" fontWeight="bold" textAnchor="middle">MAMBA</text>
            </>
          )}
        </svg>
      </div>

      {/* Narrative instructions detailing the technical layout */}
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center gap-2">
          <h6 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5 font-sans">
            🎯 Guía Visual del Ejercicio
          </h6>
          <span className="text-[8.5px] bg-[#FF6B00]/25 text-[#FF6B00] px-2 py-0.5 rounded font-black font-sans uppercase">
            MAMBA LAB V5
          </span>
        </div>
        
        <p className="text-[10.5px] text-slate-350 leading-normal font-sans">
          {category === "tiro" && "Ubícate en la posición indicada 'J'. Recibe pases del alimentador 'F' para tirar tras esprintar al cono. Mantén el equilibrio físico en los plantones."}
          {category === "bote" && "Comienza arriba, supera el circuito de conos realizando fintas de cambio de mano a intensidad extrema. Termina con una bandeja fuerte junto al tablero."}
          {category === "agilidad" && "Sigue el recorrido en zig-zag sobre la escalera. Toca con rapidez de puntas cada cuadrante sin llegar a pisar los bordes, con el centro de gravedad bajo."}
          {category === "resistencia" && "Realiza sprints ida y vuelta a la línea de tiros libres (50%), triple (75%) y media cancha (100%). Recuperación de 10 segundos tope."}
          {category === "finalizaciones" && "Inicia desde el poste. Ejecuta bucles continuos (Mikan Drills) alternando mano derecha e izquierda sobre el aro en el aire sin bajar el balón."}
          {category === "kobe" && "Canasta Mamba: Inicia de espaldas al aro recibiendo pase firme '24', gira explosivamente con parada en desequilibrio compensado (Fadeaway) y lanza en retroceso suspendido."}
          {(!category || (category !== "tiro" && category !== "bote" && category !== "agilidad" && category !== "resistencia" && category !== "finalizaciones" && category !== "kobe")) && "Observa la posición de inicio, el recorrido programado en flechas punteadas y el objetivo de la canasta para el drill del día."}
        </p>

        {/* AI Voice trainer panel */}
        <div className="bg-slate-950/65 rounded-xl p-2.5 border border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              🎙️ Entrenador Vocal IA Activo
            </span>
            <button
              type="button"
              onClick={speakAdvice}
              className={`flex items-center gap-1 text-[8.5px] font-black uppercase text-white bg-[#FF6B00] hover:bg-orange-600 transition-colors px-2 py-0.5 rounded cursor-pointer ${
                isPlayingAdvice ? "animate-pulse" : ""
              }`}
            >
              <Volume2 className="w-3 h-3" />
              {isPlayingAdvice ? "Reproduciendo..." : "Oír en Pista"}
            </button>
          </div>

          {isPlayingAdvice || coachAdviceQuote ? (
            <div className="space-y-1">
              <p className="text-[9.5px] text-slate-200 italic leading-snug">
                "{coachAdviceQuote || getCOACH_QUOTES()}"
              </p>
              {isPlayingAdvice && (
                <div className="flex flex-col items-center justify-center py-2 bg-slate-950/90 rounded-lg border border-orange-500/10 px-4 mt-2">
                  <div className="flex gap-[3px] items-center justify-center h-10 w-full max-w-xs">
                    {[
                      0.35, 0.85, 0.45, 0.95, 0.3, 0.75, 1.2, 0.55, 1.05, 0.4, 0.8, 1.15,
                      0.65, 0.9, 0.35, 0.7, 1.1, 0.5, 0.95, 0.4, 0.85, 0.3, 0.75, 0.45
                    ].map((val, idx) => (
                      <motion.div
                        key={idx}
                        className="bg-gradient-to-t from-[#FF4C00] via-[#FF6B00] to-[#FFB800] w-[3px] rounded-full shadow-[0_0_8px_rgba(255,107,0,0.4)]"
                        animate={{ 
                          height: [4, val * 24, 4],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.5 + (idx % 5) * 0.08,
                          ease: "easeInOut",
                          delay: idx * 0.02
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[7.5px] font-black tracking-widest text-[#FF6B00] uppercase mt-1 animate-pulse">
                    Onda de Audio IA Activa • Procesando Indicación Vocal
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[8.5px] text-zinc-400 font-semibold leading-normal">
              Haz clic en "Oír en Pista" para reproducir indicaciones de postura y ajustes de footwork en voz alta.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface DrillStopwatchProps {
  drill: any;
  compositeKey: string;
  onSaveToNotes: (text: string) => void;
  drillNotes: Record<string, string>;
}

export function DrillStopwatch({ drill, compositeKey, onSaveToNotes, drillNotes }: DrillStopwatchProps) {
  const [timeMs, setTimeMs] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);
  const [showStopwatch, setShowStopwatch] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      const startTime = Date.now() - timeMs;
      interval = setInterval(() => {
        setTimeMs(Date.now() - startTime);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeMs]);

  const handleStartStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning(!isRunning);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRunning(false);
    setTimeMs(0);
    setLaps([]);
  };

  const handleLap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeMs > 0) {
      setLaps([timeMs, ...laps]);
    }
  };

  const formatTime = (totalMs: number) => {
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const centiseconds = Math.floor((totalMs % 1000) / 10);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const isBoteOrResistencia = drill.category === "bote" || drill.category === "resistencia";

  const handleCopyNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = formatTime(timeMs);
    let textToAppend = `⏱️ Tiempo: ${formatted}`;
    if (laps.length > 0) {
      const lapsFormatted = laps.map((lap, idx) => `V${laps.length - idx}: ${formatTime(lap)}`).reverse().join(", ");
      textToAppend += ` (Vueltas: ${lapsFormatted})`;
    }
    
    const existingNote = drillNotes[compositeKey] || "";
    const updatedNote = existingNote ? `${existingNote} | ${textToAppend}` : textToAppend;
    onSaveToNotes(updatedNote);
  };

  return (
    <div className="mt-2 text-left" id={`stopwatch-container-${drill.id}`}>
      {!showStopwatch ? (
        <button
          type="button"
          onClick={() => setShowStopwatch(true)}
          className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
            isBoteOrResistencia
              ? "bg-[#FF6B00] border-[#FF6B00] text-white hover:bg-orange-600 shadow-sm animate-pulse"
              : "bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800"
          }`}
        >
          <span>⏱️</span>
          <span>{isBoteOrResistencia ? "Cronómetro Mamba (Bote/Físico)" : "Medir Tiempo Real"}</span>
          {isBoteOrResistencia && (
            <span className="bg-amber-400 text-indigo-950 text-[7px] font-extrabold px-1 py-0.2 rounded shrink-0">
              RECOMENDADO
            </span>
          )}
        </button>
      ) : (
        <div className={`p-4 rounded-2xl border ${
          isBoteOrResistencia 
            ? "bg-amber-50/50 border-orange-500/30 ring-1 ring-orange-500/10" 
            : "bg-slate-50 border-slate-200"
        } transition-all space-y-3`}>
          
          <div className="flex items-center justify-between gap-2 border-b border-dashed border-slate-200 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⏱️</span>
              <div>
                <h6 className="text-[10px] font-black text-slate-755 uppercase leading-none">
                  Cronómetro de Ritmo y Frecuencia
                </h6>
                <span className="text-[8px] text-slate-450 font-medium">
                  {isBoteOrResistencia ? "Optimizado para medir bote y velocidad física" : "Control de ritmo técnico"}
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowStopwatch(false)}
              className="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 transition-colors"
            >
              Ocultar ✕
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-3xl font-black tracking-tight text-slate-900 flex items-baseline gap-1 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-xs w-full sm:w-auto justify-center">
              <span className="text-[#FF6B00]">{formatTime(timeMs).split('.')[0]}</span>
              <span className="text-xs text-slate-400 font-bold">.{formatTime(timeMs).split('.')[1]}</span>
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={handleStartStop}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all ${
                  isRunning 
                    ? "bg-amber-500 text-white hover:bg-amber-600" 
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3 h-3" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" /> Iniciar
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLap}
                disabled={!isRunning || timeMs === 0}
                className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all border ${
                  isRunning 
                    ? "bg-white border-slate-200 hover:bg-slate-50 text-slate-700" 
                    : "bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed"
                }`}
              >
                <span>➕</span> Lap
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={timeMs === 0}
                className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all border ${
                  timeMs > 0 
                    ? "bg-white border-slate-200 hover:bg-red-50 hover:text-red-900 text-slate-700" 
                    : "bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed"
                }`}
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {timeMs > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-dashed border-slate-200 text-[10px]">
              <span className="text-slate-450 italic">
                ¿Guardar este registro de tiempo en la bitácora del ejercicio?
              </span>
              <button
                type="button"
                onClick={handleCopyNotes}
                className="inline-flex items-center gap-1 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/25 text-[#FF6B00] border border-[#FF6B00]/20 text-[8.5px] font-black uppercase tracking-wider px-2 py-1 rounded-xl transition-all cursor-pointer animate-pulse"
              >
                ✍️ Guardar en Notas
              </button>
            </div>
          )}

          {laps.length > 0 && (
            <div className="bg-white border border-slate-150 rounded-xl p-2.5 max-h-28 overflow-y-auto space-y-1 text-[9px]">
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                Vueltas / Parciales de Velocidad
              </span>
              {laps.map((lap, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-750 border-b border-slate-50 pb-1">
                  <span className="font-bold text-slate-400 font-mono">Vuelta {laps.length - idx}</span>
                  <span className="font-extrabold font-mono text-slate-800">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PlayerProfileWorkspaceProps {
  userName: string;
  setUserName: (name: string) => void;
  userPoints: number;
  userDrillsCount: number;
  leaderboard: any[];
  ageGroup: string;
  setAgeGroup: (age: string) => void;
  selectedDays: string[];
  handleToggleDaySelection: (day: string) => void;
  focusAreas: string[];
  sessionDurationHours: number;
  setSessionDurationHours: (hours: number) => void;
  weeksCount: number;
  setWeeksCount: (weeks: number) => void;
  playerRole: string;
  setPlayerRole: (role: string) => void;
  trainingMode: string;
  setTrainingMode: (mode: string) => void;
  intensityLevel: string;
  setIntensityLevel: (level: string) => void;
  isGenerating: boolean;
  generatePlan: (isInitial: boolean, customPrompt?: string) => void;
  trainingPlan: TrainingPlan | null;
  completionPercentage: number;
  isPlanSubmitted: boolean;
  submittedToName: string;
  submitMedium: string;
  setSubmitMedium: (m: string) => void;
  destAddress: string;
  setDestAddress: (a: string) => void;
  handleSendPlanToPlayer: (e: React.FormEvent) => void;
  selectedDayTab: string;
  setSelectedDayTab: (t: string) => void;
  completedDrillIds: Record<string, boolean>;
  toggleDrillCompletion: (compositeKey: string, points: number, title: string) => void;
  getCategoryTheme: (cat: string) => { bg: string; badge: string };
  AVAILABLE_RETOS: any[];
  handleCompleteChallenge: (id: string) => void;
  isCreatingObjective: boolean;
  setIsCreatingObjective: (val: boolean) => void;
  newObjDesc: string;
  setNewObjDesc: (d: string) => void;
  newObjCategory: string;
  setNewObjCategory: (c: any) => void;
  newObjBadge: string;
  setNewObjBadge: (b: string) => void;
  newObjTarget: string;
  setNewObjTarget: (t: string) => void;
  handleCreateObjective: (e: React.FormEvent) => void;
  sendInstantReminder: () => void;
  notifications: NotificationLog[];
  addNotification: (title: string, body: string) => void;
  setActiveTab: (tab: "leaderboard" | "profiles") => void;
  objectives: CustomObjective[];
  WEEKLY_RETOS?: Record<string, any[]>;
  isPlayerViewMode: boolean;
}

export default function PlayerProfileWorkspace({
  userName,
  setUserName,
  userPoints,
  userDrillsCount,
  leaderboard,
  ageGroup,
  setAgeGroup,
  selectedDays,
  handleToggleDaySelection,
  focusAreas,
  sessionDurationHours,
  setSessionDurationHours,
  weeksCount,
  setWeeksCount,
  playerRole,
  setPlayerRole,
  trainingMode,
  setTrainingMode,
  intensityLevel,
  setIntensityLevel,
  isGenerating,
  generatePlan,
  trainingPlan,
  completionPercentage,
  isPlanSubmitted,
  submittedToName,
  submitMedium,
  setSubmitMedium,
  destAddress,
  setDestAddress,
  handleSendPlanToPlayer,
  selectedDayTab,
  setSelectedDayTab,
  completedDrillIds,
  toggleDrillCompletion,
  getCategoryTheme,
  AVAILABLE_RETOS,
  handleCompleteChallenge,
  isCreatingObjective,
  setIsCreatingObjective,
  newObjDesc,
  setNewObjDesc,
  newObjCategory,
  setNewObjCategory,
  newObjBadge,
  setNewObjBadge,
  newObjTarget,
  setNewObjTarget,
  handleCreateObjective,
  sendInstantReminder,
  notifications,
  addNotification,
  setActiveTab,
  objectives,
  WEEKLY_RETOS,
  isPlayerViewMode
}: PlayerProfileWorkspaceProps) {
  // Inner profile sub-tab controls
  const [profileTab, setProfileTab] = useState<"plans" | "calendar" | "challenges" | "logros" | "clasificacion">(() => isPlayerViewMode ? "calendar" : "plans");

  React.useEffect(() => {
    if (isPlayerViewMode && profileTab === "plans") {
      setProfileTab("calendar");
    } else if (!isPlayerViewMode && profileTab === "calendar") {
      setProfileTab("plans");
    }
  }, [isPlayerViewMode]);

  const [selectedWeekTab, setSelectedWeekTab] = useState<string>("Semana 1");
  const [retosWeekTab, setRetosWeekTab] = useState<string>("Semana 1");

  // Auto-sync active week tab when training plan changes
  React.useEffect(() => {
    if (trainingPlan?.weeks && trainingPlan.weeks.length > 0) {
      const exists = trainingPlan.weeks.some(w => w.weekName === selectedWeekTab);
      if (!exists) {
        setSelectedWeekTab(trainingPlan.weeks[0].weekName);
      }
      const retosExists = trainingPlan.weeks.some(w => w.weekName === retosWeekTab);
      if (!retosExists) {
        setRetosWeekTab(trainingPlan.weeks[0].weekName);
      }
    }
  }, [trainingPlan, selectedWeekTab, retosWeekTab]);

  // Dynamic Drill Stopwatch Timer & Interval Warning Buzzer
  const [activeTimerDrillId, setActiveTimerDrillId] = useState<string | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(0);

  // Performance Biometric Metric Tracker logs (Makes, Attempts, RPE scale, Heart Rate BPM)
  const [drillMetrics, setDrillMetrics] = useState<Record<string, { makes: number; attempts: number; rpe: number; hr: number }>>(() => {
    try {
      const saved = localStorage.getItem("grind_drill_metrics_v2");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Timer Countdown Ticker Effect
  useEffect(() => {
    let interval: any = null;
    if (timerIsRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setTimerIsRunning(false);
            // Play physical buzzer audio frequency
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = "sawtooth";
              osc.frequency.setValueAtTime(110, audioCtx.currentTime);
              osc.frequency.linearRampToValueAtTime(70, audioCtx.currentTime + 1.2);
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 1.2);
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerIsRunning, timerSecondsLeft]);

  const saveDrillMetric = (compositeKey: string, metrics: { makes: number; attempts: number; rpe: number; hr: number }) => {
    const updated = { ...drillMetrics, [compositeKey]: metrics };
    setDrillMetrics(updated);
    localStorage.setItem("grind_drill_metrics_v2", JSON.stringify(updated));
  };

  const [editingMetricKey, setEditingMetricKey] = useState<string | null>(null);
  const [metricMakes, setMetricMakes] = useState<number>(0);
  const [metricAttempts, setMetricAttempts] = useState<number>(20);
  const [metricRpe, setMetricRpe] = useState<number>(6);
  const [metricHr, setMetricHr] = useState<number>(130);

  const handleSaveMetric = (compositeKey: string) => {
    saveDrillMetric(compositeKey, {
      makes: Number(metricMakes),
      attempts: Number(metricAttempts),
      rpe: Number(metricRpe),
      hr: Number(metricHr)
    });
    setEditingMetricKey(null);
  };

  const [expandedDiagramDrillId, setExpandedDiagramDrillId] = useState<string | null>(null);
  const [drillCategoryFilter, setDrillCategoryFilter] = useState<string>("todos");
  const [celebrationDrill, setCelebrationDrill] = useState<{ title: string; points: number } | null>(null);
  const [iaInstructions, setIaInstructions] = useState<string>("");

  const [customPresetOptions, setCustomPresetOptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("grind_custom_presets_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      "Ejercicios de Stephen Curry (Tiro rápido tras bote)",
      "Recuperación activa y flexibilidad intensa",
      "Kyrie Irving Handle Challenge (Bote explosivo)",
      "Zancadas de agilidad y pliometría intensa",
      "Defensivo extremo Mamba Style",
      "Entrenamiento de transiciones rápidas y triples",
      "Simulación de fatiga de partido de torneo"
    ];
  });
  const [newPresetText, setNewPresetText] = useState("");

  const [completedWarmups, setCompletedWarmups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("grind_completed_warmups_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [completedRestStretches, setCompletedRestStretches] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("grind_completed_rest_stretches_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // AI Drill suggestion state by week/day
  const [suggestedDrillsByDay, setSuggestedDrillsByDay] = useState<Record<string, any>>(() => {
    try {
      const savedMap = localStorage.getItem("grind_ai_suggested_drills_map_v2");
      if (savedMap) return JSON.parse(savedMap);
      
      const oldSingle = localStorage.getItem("grind_ai_suggested_drill_v1");
      if (oldSingle) {
        return { "Semana 1_Lunes": JSON.parse(oldSingle) };
      }
      return {};
    } catch {
      return {};
    }
  });
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const activeDayKey = `${selectedWeekTab}_${selectedDayTab || "Dia"}`;
  const suggestedDrill = suggestedDrillsByDay[activeDayKey] || null;

  const handleSuggestSpecializedDrill = async () => {
    setIsSuggesting(true);
    setSuggestionError(null);
    try {
      // Determine focus area based on current category filter, defaulting to focusAreas[0] -> "tiro"
      let selectedFocus = drillCategoryFilter;
      if (selectedFocus === "todos") {
        selectedFocus = (focusAreas && focusAreas.length > 0) ? focusAreas[0] : "tiro";
      }

      const response = await fetch("/api/drill/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusArea: selectedFocus,
          intensityLevel: intensityLevel || "medium",
          ageGroup: ageGroup || "15-17",
          playerRole: playerRole || "all-round",
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el servidor de diseño de drills.");
      }

      const data = await response.json();
      if (data.success && data.drill) {
        const updated = { ...suggestedDrillsByDay, [activeDayKey]: data.drill };
        setSuggestedDrillsByDay(updated);
        localStorage.setItem("grind_ai_suggested_drills_map_v2", JSON.stringify(updated));
        
        // Add notification for the newly generated AI drill
        addNotification(
          "🤖 Nuevo Drill IA Sugerido",
          `Nuestra IA sugirió: ${data.drill.title} (${data.drill.intensity}) para hoy enfocado en ${selectedFocus}.`
        );
      } else {
        throw new Error(data.error || "No se pudo obtener una respuesta estructurada.");
      }
    } catch (e: any) {
      console.warn("Backend unavailable for suggestions, using local high-fidelity generator fallback.", e);
      
      let selectedFocus = drillCategoryFilter;
      if (selectedFocus === "todos") {
        selectedFocus = (focusAreas && focusAreas.length > 0) ? focusAreas[0] : "tiro";
      }

      const presets: Record<string, Array<{title: string, duration: string, sets: string, description: string}>> = {
        bote: [
          {
            title: "Drible de Pistón Estático con Tenacidad",
            duration: "10 mins",
            sets: "3 series x 45 seg",
            description: "Drible extremadamente fuerte a la altura de la rodilla con mano derecha y luego cambias a mano izquierda. El objetivo es empujar el balón contra el suelo para ganar máxima velocidad de manos."
          },
          {
            title: "Cruces en Forma de Ocho entre las Piernas",
            duration: "8 mins",
            sets: "4 series x 30 seg",
            description: "De pie, realiza botes continuos dibujando un ocho alrededor de tus piernas sin levantar la vista. Trabaja en la postura de base baja cargando el peso adecuadamente."
          }
        ],
        tiro: [
          {
            title: "Tiro Mecánico Form-Shooting de Cerca",
            duration: "12 mins",
            sets: "5 series de 10 aciertos",
            description: "A solo un metro de canasta, tira a una sola mano prestando entera atención al golpe de muñeca (flick) y la parábola perfecta. No avances de distancia hasta que consigas tiros limpios seguidos."
          },
          {
            title: "Lanzamientos del Reloj de Media Distancia",
            duration: "15 mins",
            sets: "5 posiciones x 5 aciertos",
            description: "Recorrido en arco por 5 posiciones de media distancia. Recibe el autopase tirando con flexión coordinada y salto vertical controlado sin fatiga de hombros."
          }
        ],
        resistencia: [
          {
            title: "Suicidios de Línea de Fondo a Canasta opuesta",
            duration: "15 mins",
            sets: "4 repeticiones a tope",
            description: "Sprints progresivos tocando la línea de tiros libres, línea de media pista, tiros libres opuesta y campo completo. Amortigua bien en los giros para proteger los talones."
          },
          {
            title: "Cardio-Drible Estival No-Stop",
            duration: "10 mins",
            sets: "3 series de 3 mins",
            description: "Bote de carrera continuo de canasta a canasta alternando cambios de dirección repentinos (en cruzado y por la espalda). Consumo calórico elevado."
          }
        ],
        agilidad: [
          {
            title: "Desplazamiento Defensivo Lateral en Z",
            duration: "10 mins",
            sets: "5 series de un minuto",
            description: "Sigue un patrón en zigzag (Z) de pared a pared con pasos de deslizamiento lateral puros, hombros bajos, manteniendo el centro de gravedad estable. No cruces los pies."
          },
          {
            title: "Saltos Pliométricos a un Solo Pie",
            duration: "8 mins",
            sets: "3 series x 8 saltos",
            description: "Saltos explosivos sobre un pie de lado a lado manteniendo el aterrizaje balanceado en el metatarso durante un segundo para ganar estabilidad articular y fuerza de frenado."
          }
        ],
        finalizaciones: [
          {
            title: "Mikan Drill para Tacto de Tablero",
            duration: "10 mins",
            sets: "3 series de 20 canastas",
            description: "Bote de canasta consecutivo alternando mano derecha y mano izquierda con tablero continuo. Desarrolla rebote rápido y toque suave de dedos."
          },
          {
            title: "Penetración con Eurostep Exagerado",
            duration: "12 mins",
            sets: "4 series x 6 entradas",
            description: "Dribla con ímpetu desde triple, planta un primer apoyo fuerte en una dirección y cambia bruscamente la zancada lateral en el segundo paso para esquivar al defensor imaginario."
          }
        ],
        kobe: [
          {
            title: "Mamba Shot: 100 Tiros en Fatiga Extrema",
            duration: "20 mins",
            sets: "100 lanzamientos completados",
            description: "Realiza series intensas de tiros en suspensión tras sprintar 15 metros. Exige temple mental, técnica perfecta y respiración regulada bajo una fuerte fatiga de ácido láctico."
          },
          {
            title: "Handles Mamba: Coordinación de Conos",
            duration: "15 mins",
            sets: "5 series x 4 recorridos",
            description: "Drible de drible bajo de increíble exigencia sorteando conos, finalizando en un step-back explosivo con fadeaway. Enfoque implacable de repetición."
          }
        ]
      };

      const options = presets[selectedFocus.toLowerCase()] || presets["tiro"];
      const randomPreset = options[Math.floor(Math.random() * options.length)];

      const customDrill = {
        id: "ai_local_" + Date.now(),
        title: `${randomPreset.title} ⚡`,
        category: selectedFocus.charAt(0).toUpperCase() + selectedFocus.slice(1),
        duration: randomPreset.duration,
        sets: randomPreset.sets,
        intensity: intensityLevel === "Bajo" ? "Moderado" : intensityLevel === "Élite Prep" ? "Extrema" : "Alta",
        description: `${randomPreset.description} [Modo de entrenamiento optimizado para rol ${playerRole} en categoría ${ageGroup}]`
      };

      const updated = { ...suggestedDrillsByDay, [activeDayKey]: customDrill };
      setSuggestedDrillsByDay(updated);
      localStorage.setItem("grind_ai_suggested_drills_map_v2", JSON.stringify(updated));
      
      addNotification(
        "🤖 Nuevo Drill Local Sugerido",
        `Se recomendó el ejercicio: ${customDrill.title} enfocado en tu especialidad de ${selectedFocus}.`
      );
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleDismissSuggestion = () => {
    const updated = { ...suggestedDrillsByDay };
    delete updated[activeDayKey];
    setSuggestedDrillsByDay(updated);
    localStorage.setItem("grind_ai_suggested_drills_map_v2", JSON.stringify(updated));
  };

  const toggleRestStretchItem = (key: string) => {
    const updated = { ...completedRestStretches, [key]: !completedRestStretches[key] };
    setCompletedRestStretches(updated);
    localStorage.setItem("grind_completed_rest_stretches_v1", JSON.stringify(updated));
  };

  const getRestDayRoutine = (restDay: string, week: any) => {
    if (!week?.days) return { categoryFocus: "tiro", drills: [] };

    // Count categories across active days
    const categoryCounts: Record<string, number> = {
      tiro: 0,
      bote: 0,
      agilidad: 0,
      resistencia: 0,
      finalizaciones: 0,
      kobe: 0
    };

    week.days.forEach((day: any) => {
      day.drills?.forEach((drill: any) => {
        const cat = drill.category || "tiro";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    // Find dominant categories
    const dominantCategories = Object.entries(categoryCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);

    const stretchingBases: Record<string, { name: string; duration: string; focus: string; explanation: string }[]> = {
      tiro: [
        {
          name: "Descompresión Escapular y Hombros con Toalla",
          duration: "3 series de 30s",
          focus: "Movilidad de hombro para alineación vertical del codo al tirar",
          explanation: "Sujeta una toalla con los brazos extendidos y llévala de adelante hacia atrás con suavidad para liberar pectorales y deltoides."
        },
        {
          name: "Estiramiento del Psoas con Extensión Torácica",
          duration: "2 series de 45s por pierna",
          focus: "Optimizar la transferencia de fuerza vertical (salto de suspensión)",
          explanation: "En posición de zancada en el suelo, empuja la cadera hacia adelante y gira el torso hacia la pierna delantera."
        },
        {
          name: "Estiramiento de Flexores de Muñeca y Dedos",
          duration: "2 series de 30s por lado",
          focus: "Prevenir tendinitis de antebrazo y afinar el 'follow-through'",
          explanation: "Extiende el brazo hacia el frente con la palma hacia arriba y tira suavemente de los dedos hacia abajo con la otra mano."
        }
      ],
      bote: [
        {
          name: "Liberación de Tobillo con Rodilla a la Pared (Dorsiflexión)",
          duration: "3 series de 10 reps por pie",
          focus: "Mejorar rango de dorsiflexión para cambios de dirección explosivos (crossovers)",
          explanation: "Coloca el pie a unos centímetros del muro y empuja la rodilla hacia la pared sin despegar el talón del suelo."
        },
        {
          name: "Rotación de Caderas en 90/90 Sentado",
          duration: "3 minutos alternando",
          focus: "Flexibilidad de cadera para driblar a baja altura y realizar giros cerrados",
          explanation: "Sentado con rodillas dobladas a 90 grados, rota ambas piernas hacia un lado tocando el suelo, luego hacia el otro."
        },
        {
          name: "Estiramiento de Lumbares en Torsión Lumbar Supina",
          duration: "2 series de 1 min por lado",
          focus: "Relajación lumbar tras botes de poder continuos en posición baja",
          explanation: "Bocarriba, cruza una pierna doblada sobre la otra estirada y gira la mirada hacia el brazo opuesto extendido."
        }
      ],
      agilidad: [
        {
          name: "Estiramiento Isométrico de Pantorrillas (Gastrocnemio/Sóleo)",
          duration: "3 series de 45s por pierna",
          focus: "Recuperación de tendón de Aquiles por frenadas bruscas y desplazamientos laterales",
          explanation: "Apóyate en una pared, estira una pierna hacia atrás presionando firmemente el talón contra el suelo, mantén la rodilla recta."
        },
        {
          name: "Apertura Dinámica de Cadera ('World's Greatest Stretch')",
          duration: "2 series de 6 reps por lado",
          focus: "Movilidad de cadera multi-direccional y descompresión pélvica",
          explanation: "Gran zancada adelante, coloca ambas manos al lado del pie delantero, luego rota el brazo del mismo lado hacia el cielo."
        },
        {
          name: "Deslizamiento del Nervio Ciático y Cadena Posterior",
          duration: "2 series de 15 reps por lado",
          focus: "Aliviar tensión nerviosa acumulada por cambios acelerados de caderas",
          explanation: "Sentado, dobla y estira la rodilla levantando el mentón sincrónicamente para elongar la fascia del muslo."
        }
      ],
      resistencia: [
        {
          name: "Elongación Profunda de Isquiotibiales con Correa",
          duration: "3 series de 45s por pierna",
          focus: "Prevenir tiranteces musculares causadas por sprints repetitivos de pista completa",
          explanation: "Bocarriba, coloca una banda en la planta del pie y eleva la pierna recta de manera vertical reteniendo de forma controlada."
        },
        {
          name: "Estiramiento de Cuádriceps tumbado de lado (con retroversión pélvica)",
          duration: "2 series de 1 min por muslo",
          focus: "Relajar la cadena anterior sobrecargada por saltos y suicidios cronometrados",
          explanation: "Acuéstate de lado, sujeta el tobillo superior y llévalo al glúteo contrayendo el abdomen para estabilizar la pelvis."
        },
        {
          name: "Sash de Apertura Torácica e Intercostales (Flexibilidad de Caja)",
          duration: "3 series de 45s",
          focus: "Expandir la capacidad respiratoria y descontracturar costillas",
          explanation: "Entrelaza los dedos por encima de la cabeza y flexiona el torso lateralmente sintiendo la apertura en las costillas."
        }
      ],
      finalizaciones: [
        {
          name: "Estiramiento de Aductores en Posición de Mariposa Progresiva",
          duration: "3 series de 1 min",
          focus: "Flexibilizar aductores para absorción de impactos al caer en doble ritmo",
          explanation: "Sentado con plantas de pies unidas, mantén la espalda erguida y presiona las rodillas hacia el suelo con los codos."
        },
        {
          name: "Estiramiento del Glúteo Medio (Paloma - Sleeping Pigeon)",
          duration: "2 series de 1 min por lado",
          focus: "Recuperar glúteos amortiguadores de saltos acrobáticos unilaterales",
          explanation: "Coloca una pierna doblada al frente en 90 grados y estira la otra atrás, inclinando el tronco sobre la rodilla delantera."
        },
        {
          name: "Estiramiento del Dorsal Ancho en la Pared",
          duration: "3 series de 30s",
          focus: "Flexibilidad de brazos para extender el balón arriba eludiendo bloqueos",
          explanation: "Coloca las manos en la pared con los brazos estirados, baja el pecho doblando la cadera a 90 grados sintiendo el estiramiento en axilas."
        }
      ],
      kobe: [
        {
          name: "Estiramiento Isométrico de Sóleo Profundo (Doblando rodilla)",
          duration: "3 series de 45s",
          focus: "Mantener la elasticidad del tendón trasero para el paso atrás (Kobe's step-back)",
          explanation: "Presiona el talón trasero al suelo pero con la rodilla de esa misma pierna ligeramente doblada para enfocar el sóleo abajo."
        },
        {
          name: "Enhebrar la Aguja Torácica (Thread the Needle)",
          duration: "2 series de 8 reps por lado",
          focus: "Movilidad espinal rotatoria indispensable para fadeaways en salto con giro",
          explanation: "En cuatro puntos de apoyo, pasa un brazo por debajo del pecho tocando el hombro en el suelo y luego elévalo apuntando al techo."
        },
        {
          name: "Estiramiento Dinámico de Fascia Plantar",
          duration: "2 minutos por pie",
          focus: "Prevenir fascitis plantar por juego de pies incansable en el poste medio",
          explanation: "Haz rodar una pelota de tenis aplicando presión media bajo toda la superficie del pie, desde el talón hasta las yemas."
        }
      ]
    };

    // Select routines matching the dominant categories in this week, or fallback
    const firstCategory = dominantCategories[0] || "tiro";
    const secondCategory = dominantCategories[1] || "agilidad";

    // Distribute routines across days of the week deterministically based on day name hash
    const dayIndex = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].indexOf(restDay) || 0;
    const routineSource = (dayIndex % 2 === 0) ? firstCategory : secondCategory;
    const selectedRoutine = stretchingBases[routineSource] || stretchingBases.tiro;

    return {
      categoryFocus: routineSource,
      drills: selectedRoutine
    };
  };

  const [isWarmupOpen, setIsWarmupOpen] = useState(false);

  const handleAddPreset = () => {
    if (!newPresetText.trim()) return;
    const updated = [...customPresetOptions, newPresetText.trim()];
    setCustomPresetOptions(updated);
    localStorage.setItem("grind_custom_presets_v1", JSON.stringify(updated));
    setNewPresetText("");
  };

  const handleRemovePreset = (index: number) => {
    const updated = customPresetOptions.filter((_, idx) => idx !== index);
    setCustomPresetOptions(updated);
    localStorage.setItem("grind_custom_presets_v1", JSON.stringify(updated));
  };

  const handleTogglePreset = (preset: string) => {
    if (iaInstructions.includes(preset)) {
      const cleaned = iaInstructions
        .replace(new RegExp(`${preset},?\\s*`, "g"), "")
        .replace(/,\s*$/, "")
        .replace(/^,\s*/, "")
        .trim();
      setIaInstructions(cleaned);
    } else {
      if (!iaInstructions.trim()) {
        setIaInstructions(preset);
      } else {
        const trimmed = iaInstructions.trim();
        const lastChar = trimmed.slice(-1);
        if (lastChar === "," || lastChar === ".") {
          setIaInstructions(`${trimmed} ${preset}`);
        } else {
          setIaInstructions(`${trimmed}, ${preset}`);
        }
      }
    }
  };

  const toggleWarmupItem = (key: string) => {
    const updated = { ...completedWarmups, [key]: !completedWarmups[key] };
    setCompletedWarmups(updated);
    localStorage.setItem("grind_completed_warmups_v1", JSON.stringify(updated));
  };

  // Drill logs notes stored locally for comments/feelings
  const [drillNotes, setDrillNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("hoops_drill_notes_v1");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [editingDrillNoteKey, setEditingDrillNoteKey] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");

  const saveDrillNote = (key: string, text: string) => {
    const updated = { ...drillNotes, [key]: text };
    setDrillNotes(updated);
    localStorage.setItem("hoops_drill_notes_v1", JSON.stringify(updated));
    setEditingDrillNoteKey(null);
    setNoteText("");
    addNotification("✍️ Nota Registrada", `Añadiste una nota física a tu ejercicio.`);
  };

  const getPlayerStatsByCategory = () => {
    let tiroPoints = 0;
    let botePoints = 0;
    let agilidadPoints = 0;
    let resistenciaPoints = 0;
    let finalizacionesPoints = 0;
    let kobePoints = 0;
    let drillsCount = 0;
    let totalPoints = userPoints;
    
    // Add rest day stretching points (5 points per completed rest day stretch)
    let restStretchingPoints = 0;
    Object.entries(completedRestStretches).forEach(([key, val]) => {
      if (val && key.startsWith(`${userName.toLowerCase()}_`)) {
        restStretchingPoints += 5;
      }
    });
    totalPoints += restStretchingPoints;

    const plan = trainingPlan;
    if (plan && plan.weeks) {
      plan.weeks.forEach((w) => {
        w.days.forEach((d) => {
          d.drills.forEach((dr) => {
            const key = `${userName.toLowerCase()}_${w.weekName}_${d.dayName}_${dr.id}`;
            if (completedDrillIds[key]) {
              drillsCount++;
              const pts = dr.intensity === "Alta" ? 30 : dr.intensity === "Media" ? 20 : 10;
              const catLower = dr.category ? dr.category.toLowerCase() : "";
              if (catLower === "tiro") tiroPoints += pts;
              else if (catLower === "bote") botePoints += pts;
              else if (catLower === "agilidad") agilidadPoints += pts;
              else if (catLower === "resistencia") resistenciaPoints += pts;
              else if (catLower === "finalizaciones") finalizacionesPoints += pts;
              else if (catLower === "kobe") kobePoints += pts;
            }
          });
        });
      });
    }
    
    return {
      tiroPoints,
      botePoints,
      agilidadPoints,
      resistenciaPoints,
      finalizacionesPoints,
      kobePoints,
      drillsCount,
      totalPoints
    };
  };

  const stats = getPlayerStatsByCategory();

  const getWeeklyPointsData = () => {
    if (!trainingPlan || !trainingPlan.weeks) {
      const defaultValue = [];
      for (let i = 1; i <= weeksCount; i++) {
        defaultValue.push({ name: `Semana ${i}`, Puntos: 0 });
      }
      return defaultValue;
    }

    const data = trainingPlan.weeks.map(w => ({
      name: w.weekName,
      Puntos: 0
    }));

    trainingPlan.weeks.forEach((week) => {
      const weekIdx = data.findIndex((d) => d.name === week.weekName);
      if (weekIdx !== -1) {
        week.days.forEach((day) => {
          day.drills.forEach((drill) => {
            const key = `${userName.toLowerCase()}_${week.weekName}_${day.dayName}_${drill.id}`;
            if (completedDrillIds[key]) {
              const points = drill.intensity === "Alta" ? 30 : drill.intensity === "Media" ? 20 : 10;
              data[weekIdx].Puntos += points;
            }
          });
        });
      }
    });

    return data;
  };

  const getCategoryData = () => {
    const categories = [
      { name: "Tiro", value: 0, color: "#FF6B00" },
      { name: "Bote", value: 0, color: "#1D4ED8" },
      { name: "Agilidad", value: 0, color: "#7C3AED" },
      { name: "Física", value: 0, color: "#059669" },
      { name: "Finalización", value: 0, color: "#10B981" },
      { name: "Kobe Mamba", value: 0, color: "#6D28D9" }
    ];

    if (trainingPlan && trainingPlan.weeks) {
      trainingPlan.weeks.forEach((week) => {
        week.days.forEach((day) => {
          day.drills.forEach((drill) => {
            const key = `${userName.toLowerCase()}_${week.weekName}_${day.dayName}_${drill.id}`;
            const isCompleted = completedDrillIds[key];
            const points = drill.intensity === "Alta" ? 30 : drill.intensity === "Media" ? 20 : 10;
            
            let idx = -1;
            const catLowerVal = drill.category ? drill.category.toLowerCase() : "";
            if (catLowerVal === "tiro") idx = 0;
            else if (catLowerVal === "bote") idx = 1;
            else if (catLowerVal === "agilidad") idx = 2;
            else if (catLowerVal === "resistencia") idx = 3;
            else if (catLowerVal === "finalizaciones") idx = 4;
            else if (catLowerVal === "kobe") idx = 5;

            if (idx !== -1) {
              if (isCompleted) {
                categories[idx].value += points;
              }
            }
          });
        });
      });
    }

    const hasWork = categories.some((c) => c.value > 0);
    if (!hasWork && trainingPlan && trainingPlan.weeks) {
      trainingPlan.weeks.forEach((week) => {
        week.days.forEach((day) => {
          day.drills.forEach((drill) => {
            let idx = -1;
            const catLowerVal = drill.category ? drill.category.toLowerCase() : "";
            if (catLowerVal === "tiro") idx = 0;
            else if (catLowerVal === "bote") idx = 1;
            else if (catLowerVal === "agilidad") idx = 2;
            else if (catLowerVal === "resistencia") idx = 3;
            else if (catLowerVal === "finalizaciones") idx = 4;
            else if (catLowerVal === "kobe") idx = 5;
            
            if (idx !== -1) {
              categories[idx].value += 1;
            }
          });
        });
      });
      return {
        title: "Reparto de la Rutina (General)",
        data: categories,
        hasProgress: false
      };
    }

    return {
      title: "Distribución de tus Puntos de Esfuerzo",
      data: categories,
      hasProgress: true
    };
  };

  const getPointsTrendOverTime = () => {
    if (!trainingPlan || !trainingPlan.weeks) {
      const defaultValue = [];
      const numWeeks = weeksCount || 4;
      let cumTarget = 0;
      for (let i = 1; i <= numWeeks; i++) {
        cumTarget += 60;
        defaultValue.push({
          name: `Sem. ${i}`,
          "Acumulado Real": 0,
          "Meta Sugerida": cumTarget,
          "Drills Hechos": 0
        });
      }
      return defaultValue;
    }

    let runningTotalPoints = 0;
    let runningTotalDrills = 0;
    let runningTotalTargetPoints = 0;

    const trendData = trainingPlan.weeks.map((week, wIndex) => {
      let weekPoints = 0;
      let weekDrills = 0;
      let weekTargetPoints = 0;

      week.days.forEach((day) => {
        day.drills.forEach((drill) => {
          const pts = drill.intensity === "Alta" ? 30 : drill.intensity === "Media" ? 20 : 10;
          weekTargetPoints += pts;

          const key = `${userName.toLowerCase()}_${week.weekName}_${day.dayName}_${drill.id}`;
          if (completedDrillIds[key]) {
            weekPoints += pts;
            weekDrills += 1;
          }
        });
      });

      runningTotalPoints += weekPoints;
      runningTotalDrills += weekDrills;
      runningTotalTargetPoints += Math.round(weekTargetPoints * 0.7) || 60;

      return {
        name: week.weekName.replace("Semana", "Sem."),
        "Acumulado Real": runningTotalPoints,
        "Meta Sugerida": runningTotalTargetPoints,
        "Drills Hechos": runningTotalDrills
      };
    });

    return trendData;
  };

  const activeWeek = trainingPlan?.weeks?.find((w) => w.weekName === selectedWeekTab) || trainingPlan?.weeks?.[0] || null;
  const activeTrainingDay = selectedDayTab 
    ? (activeWeek?.days?.find((d) => d.dayName === selectedDayTab) || null)
    : (activeWeek?.days?.[0] || null);

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {/* Dynamic Celebration Pop-up */}
      <AnimatePresence>
        {celebrationDrill && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-11/12 max-w-md"
          >
            <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(255,107,0,0.3)] border border-[#FF6B00] flex flex-col items-center gap-3 text-center overflow-hidden relative">
              {/* Background ambient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.15),transparent_70%)] pointer-events-none" />
              
              <div className="relative z-10 w-14 h-14 bg-[#FF6B00] rounded-full flex items-center justify-center text-3xl animate-bounce">
                🏀
              </div>
              
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">
                  ¡EJERCICIO COMPLETADO!
                </span>
                <h4 className="text-sm font-black uppercase text-white tracking-tight leading-tight">
                  {celebrationDrill.title}
                </h4>
                <p className="text-xl font-black text-emerald-400 font-mono">
                  +{celebrationDrill.points} PTS
                </p>
              </div>

              <div className="relative z-10 text-[10px] text-slate-300 font-bold italic mt-1 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
                {(() => {
                  const msgs = [
                    "¡Mamba Mentality activada! Sigue así. 🐍⚡",
                    "¡Stephen Curry estaría orgulloso de este tiro! 👌🔥",
                    "Esfuerzo de nivel Elite Prep USA. ¡A por más! 🇺🇸🏀",
                    "La repetición constante forma a las leyendas. 💪🎯",
                    "Cada drill te acerca un paso más al MVP. 🏆"
                  ];
                  return msgs[Math.abs(celebrationDrill.title.length) % msgs.length];
                })()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Player Context Bar */}
      <div className="bg-slate-900 rounded-[32px] p-6 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-[#FF6B00] flex items-center justify-center text-3xl font-bold shadow-inner">
            {leaderboard.find((p) => p.name.toLowerCase() === userName.toLowerCase())?.avatar || "🏀"}
          </div>
          <div>
            <span className="text-[10px] bg-[#FF6B00] text-slate-900 px-2 py-0.5 rounded font-black uppercase tracking-wider">
              PERFIL ACTIVO
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-white mt-1.5 leading-none">{userName}</h3>
            <p className="text-[11px] text-orange-500 font-extrabold uppercase mt-1 leading-normal">
              Entrenamiento de Nivel Prep Academy USA
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 shrink-0">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/5 py-1.5 px-3 rounded-lg border border-white/10 shrink-0">
              <span className="block text-[8px] text-slate-400 font-black uppercase">Puntos</span>
              <span className="text-sm font-black text-orange-400 font-mono">{userPoints} pts</span>
            </div>
            <div className="bg-white/5 py-1.5 px-3 rounded-lg border border-white/10 shrink-0">
              <span className="block text-[8px] text-slate-400 font-black uppercase">Física ok</span>
              <span className="text-sm font-black text-orange-400 font-mono">{userDrillsCount} drills</span>
            </div>
          </div>

          {!isPlayerViewMode && (
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setUserName("");
                  addNotification("🔄 Cambio de Jugador", "Volviste al directorio de jugadores.");
                }}
                className="bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl cursor-pointer transition-colors text-center shadow-xs"
              >
                ◀ Cambiar Jugador
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl cursor-pointer transition-colors text-center"
              >
                Ver Clasificaciones 🏆
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Player Profile Sub-Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:flex bg-slate-200 p-1.5 rounded-2xl gap-1 shadow-inner select-none md:flex-row w-full">
        {!isPlayerViewMode && (
          <button
            type="button"
            onClick={() => setProfileTab("plans")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              profileTab === "plans"
                ? "bg-white text-slate-900 shadow-sm border border-slate-100 font-black"
                : "text-slate-500 hover:text-slate-805 hover:bg-white/40"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            IA Planificador
          </button>
        )}
        <button
          type="button"
          onClick={() => setProfileTab("calendar")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            profileTab === "calendar"
              ? "bg-white text-slate-900 shadow-sm border border-slate-100 font-black"
              : "text-slate-500 hover:text-[#FF6B00] hover:bg-white/40"
          }`}
        >
          <Calendar className="w-4 h-4 text-[#FF6B00]" />
          Calendario de Verano y Ejercicios
        </button>
        <button
          type="button"
          onClick={() => setProfileTab("challenges")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            profileTab === "challenges"
              ? "bg-white text-slate-900 shadow-sm border border-slate-100 font-black"
              : "text-slate-500 hover:text-slate-850 hover:bg-white/40"
          }`}
        >
          <Zap className="w-4 h-4 text-[#FF6B00]" />
          {isPlayerViewMode ? "Mis Retos Especiales" : "Retos, Coach Board & Alertas"}
        </button>
        <button
          type="button"
          onClick={() => setProfileTab("logros")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            profileTab === "logros"
              ? "bg-white text-slate-900 shadow-sm border border-slate-100 font-black"
              : "text-slate-500 hover:text-slate-850 hover:bg-white/40"
          }`}
        >
          <Award className="w-4 h-4 text-[#FF6B00]" />
          Estadísticas y Logros
        </button>
        <button
          type="button"
          onClick={() => setProfileTab("clasificacion")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
            profileTab === "clasificacion"
              ? "bg-white text-slate-900 shadow-sm border border-slate-100 font-black"
              : "text-slate-500 hover:text-slate-850 hover:bg-white/40"
          }`}
        >
          <Trophy className="w-4 h-4 text-[#FF6B00]" />
          {isPlayerViewMode ? "Tabla de Posiciones" : "Clasificación"}
        </button>
      </div>


      {/* Sub-tab 1: Asistente de Planes (IA) */}
      {profileTab === "plans" && (
        <div className="max-w-2xl mx-auto w-full">
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200" id="id-setup-panel">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase flex items-center gap-1.5 tracking-tight text-slate-800">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                Generar Plan con IA para {userName}
              </h2>
              <span className="text-[9px] font-extrabold bg-blue-50 text-blue-800 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                Gemini Powered
              </span>
            </div>

            <div className="space-y-4">
              {/* Age selection */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1.5">
                  Edad de {userName}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { val: "8-11", label: "Infantil (8-11)" },
                    { val: "12-14", label: "Cadete (12-14)" },
                    { val: "15-17", label: "Junior (15-17)" },
                    { val: "18+", label: "Senior Pro (18+)" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setAgeGroup(item.val)}
                      type="button"
                      className={`text-[10px] py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                        ageGroup === item.val
                          ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-705 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weeks Selection (Semanas del Plan) */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Semanas de Duración del Plan</span>
                  <span className="text-[9px] text-[#FF6B00] font-black bg-orange-50 px-1.5 py-0.5 rounded uppercase font-sans">Personalizable</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 4, 6, 8].map((weeks) => (
                    <button
                      key={weeks}
                      onClick={() => setWeeksCount(weeks)}
                      type="button"
                      className={`text-[10px] py-2 px-1 rounded-xl border text-center transition-all cursor-pointer font-extrabold ${
                        weeksCount === weeks
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {weeks} {weeks === 1 ? "Sem" : "Sems"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Days Selection */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1.5">
                  Días de Entrenamiento Semanal
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDaySelection(day)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Focus areas */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1.5">
                  Áreas de Enfoque Obligatorias
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "tiro", label: "🎯 Tiro (Curry)" },
                    { id: "bote", label: "🏀 Bote (Kyrie)" },
                    { id: "agilidad", label: "⚡ Agilidad" },
                    { id: "resistencia", label: "🏃 Resistencia" },
                    { id: "finalizaciones", label: "🔥 Finalizaciones" },
                    { id: "kobe", label: "🐍 Drills de Kobe (Mamba)" },
                  ].map((focus) => (
                    <div
                      key={focus.id}
                      className="bg-slate-50 border border-slate-150 rounded-lg p-2 text-[10px] font-extrabold text-slate-700 flex items-center justify-between"
                    >
                      <span>{focus.label}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration slider */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1.5">
                  Duración de la Sesión Diaria
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 1.5, 2, 2.5, 3, 4].map((hours) => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => setSessionDurationHours(hours)}
                      className={`text-[9px] py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                        sessionDurationHours === hours
                          ? "bg-slate-900 border-slate-900 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {hours} {hours === 1 ? "Hora" : "H"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalización Especializada */}
              <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-4">
                <h6 className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1 font-sans">
                  ⚡ Ajustes de Estilo e Intensidad
                </h6>

                {/* Rol / Posición de Juego */}
                <div>
                  <label className="block text-[9.5px] font-black uppercase text-slate-500 mb-1.5 font-sans">
                    Estilo de Juego / Enfoque de Posición
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { val: "all-round", label: "🏀 Todoterreno", desc: "Balance completo de destrezas" },
                      { val: "shooter", label: "🎯 Sniper / Tirador", desc: "Tiro fluido, Catch & Shoot" },
                      { val: "guard", label: "⚡ Playmaker / Base", desc: "Kyrie handles, pick & roll" },
                      { val: "big", label: "🔥 Poste / Pivot", desc: "Ganchos bajo el aro, rebotes" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        onClick={() => setPlayerRole(item.val)}
                        type="button"
                        className={`text-left p-1.5 rounded-lg border transition-all cursor-pointer ${
                          playerRole === item.val
                            ? "bg-white border-[#FF6B00] shadow-2xs text-slate-900"
                            : "bg-white/40 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className="block text-[9px] font-black leading-tight font-sans">{item.label}</span>
                        <span className="block text-[8px] text-slate-400 mt-0.5 leading-tight font-sans">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modalidad: Solo vs Parejas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9.5px] font-black uppercase text-slate-500 mb-1.5 font-sans">
                      Modalidad
                    </label>
                    <div className="flex gap-1">
                      {[
                        { val: "solo", label: "👤 Individual" },
                        { val: "duo", label: "👥 Con Socio" }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setTrainingMode(item.val)}
                          className={`flex-1 text-[9.5px] py-1.5 px-1 rounded-xl border text-center font-extrabold cursor-pointer transition-all ${
                            trainingMode === item.val
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9.5px] font-black uppercase text-slate-500 mb-1.5 font-sans">
                      Ritmo / Intensidad
                    </label>
                    <div className="flex gap-1">
                      {[
                        { val: "casual", label: "Rec", color: "bg-emerald-500" },
                        { val: "medium", label: "Club", color: "bg-amber-500" },
                        { val: "elite", label: "NCAA", color: "bg-red-500" },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setIntensityLevel(item.val)}
                          className={`flex-1 text-[8.5px] py-1.5 px-0.5 rounded-xl border text-center font-extrabold cursor-pointer transition-all leading-none ${
                            intensityLevel === item.val
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${item.color}`}></span>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom AI Instructions (Gemini prompt) */}
              <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl space-y-1.5 shadow-inner">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black uppercase text-slate-700">
                    🧙‍♂️ Instrucciones Personalizadas para la IA
                  </label>
                  <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-sans">
                    Filtro Inteligente
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Escribe indicaciones directas para que la IA adapte los ejercicios a tu medida (ej: <em>"Enfocado en tiros libres y fintas para jugador fatigado"</em> o <em>"Rutina de agilidad para recuperación de rodilla"</em>).
                </p>
                <textarea
                  value={iaInstructions}
                  onChange={(e) => setIaInstructions(e.target.value)}
                  placeholder="Escribe aquí tus requerimientos (ej: Rutina intensiva de tiro de 3 puntos, juego de pies, recuperación, etc.)..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B00] min-h-[70px] resize-none leading-relaxed"
                />

                {/* Gestor avanzado de opciones personalizadas */}
                <div className="space-y-2 pt-1.5 border-t border-slate-200/60 mt-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      🏷️ OPCIONES DE INSTRUCCIÓN DISPONIBLES (MÁNAGER):
                    </span>
                    <span className="text-[7.5px] text-zinc-400 font-bold">Haz clic en la bola para aplicar/quitar</span>
                  </div>
                  
                  {/* Tags cloud */}
                  <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {customPresetOptions.map((tagOption, idx) => {
                      const isActive = iaInstructions.includes(tagOption);
                      return (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-1.5 text-[9px] rounded-lg border font-bold px-2 py-1 cursor-pointer transition-all ${
                            isActive
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-3xs"
                              : "bg-white border-slate-200 text-slate-705 hover:border-[#FF6B00] hover:text-[#FF6B00]"
                          }`}
                          onClick={() => handleTogglePreset(tagOption)}
                        >
                          <span className="select-none flex items-center gap-1 font-semibold text-slate-700">
                            {isActive ? "🔥" : "🏀"} {tagOption}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePreset(idx);
                            }}
                            className="text-slate-450 hover:text-red-500 hover:bg-slate-100 p-0.5 rounded transition-all cursor-pointer"
                            title="Eliminar esta opción"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add form */}
                  <div className="flex gap-1 items-center pt-1.5">
                    <input
                      type="text"
                      value={newPresetText}
                      onChange={(e) => setNewPresetText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPreset();
                        }
                      }}
                      placeholder="Escribe otra opción... (ej: Tiros libres en fatiga)"
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-[#FF6B00] leading-normal"
                    />
                    <button
                      type="button"
                      onClick={handleAddPreset}
                      className="bg-slate-900 text-white rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider hover:bg-[#FF6B00] cursor-pointer transition-colors shrink-0"
                    >
                      + Añadir
                    </button>
                  </div>
                </div>

                {iaInstructions && (
                  <button
                    type="button"
                    onClick={() => setIaInstructions("")}
                    className="text-[9px] text-slate-400 hover:text-red-500 font-extrabold uppercase tracking-wide float-right pt-2"
                  >
                    [Limpiar Instrucciones]
                  </button>
                )}
                <div className="clear-both" />
              </div>

              {/* Action trigger button */}
              <button
                onClick={() => generatePlan(false, iaInstructions)}
                disabled={isGenerating}
                type="button"
                className="w-full bg-[#FF6B00] hover:bg-[#e45a00] text-white py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-400 mt-2"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generando con la IA..." : "GENERAR CON IA"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Sub-tab 2: Calendario y Ejercicios Diarios */}
      {profileTab === "calendar" && (
        <div className="flex flex-col gap-6">
          {!trainingPlan ? (
            <div className="text-center bg-white border border-slate-200 rounded-[32px] p-12 shadow-xs">
              <span className="text-4xl text-slate-300">📅</span>
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight mt-3">
                {isPlayerViewMode ? "Todavía no tienes un Plan Activo" : "Todavía no hay un Plan Activo"}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-normal font-sans">
                {isPlayerViewMode 
                  ? "Pídele a tu entrenador que diseñe tu plan de entrenamiento de verano. Una vez guardado por el entrenador, podrás visualizar tus rutinas aquí diariamente."
                  : `Usa el Asistente de Planes (IA) en la pestaña de al lado para formular un plan de verano para ${userName}.`
                }
              </p>
            </div>
          ) : (
            <>
              {/* Summer Hydration Tracker & Active Workout Timer */}
              <SummerHydrationTracker addNotification={addNotification} />

              {/* Calendar Panel */}
              <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200" id="id-calendar-panel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm md:text-base font-black uppercase text-slate-800 flex items-center gap-1.5">
                      <Calendar className="w-5 h-5 text-[#FF6B00]" />
                      Calendario de Verano
                    </h3>
                    <p className="text-xs text-[#FF6B00] font-bold uppercase tracking-wider mt-0.5">
                      {trainingPlan.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Progreso Semanal:</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-black">
                      {completionPercentage}% COMPLETADO
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>

                {/* Week selector tabs */}
                <div className="flex flex-wrap gap-1 mb-5 bg-slate-100 p-1 rounded-2xl border border-slate-150">
                  {trainingPlan.weeks?.map((week) => {
                    const isSelected = selectedWeekTab === week.weekName;
                    return (
                      <button
                        key={week.weekName}
                        onClick={() => {
                          setSelectedWeekTab(week.weekName);
                          // Default select first day of this week
                          if (week.days?.length > 0) {
                            setSelectedDayTab(week.days[0].dayName);
                          }
                        }}
                        type="button"
                        className={`flex-1 py-2 px-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white shadow-xs font-black"
                            : "text-slate-500 hover:text-slate-805 hover:bg-slate-200"
                        }`}
                      >
                        {week.weekName}
                      </button>
                    );
                  })}
                </div>

                {activeWeek && (
                  <div className="mb-5 p-3.5 bg-orange-50 border border-orange-100/80 rounded-2xl">
                    <span className="text-[8px] font-black uppercase text-[#FF6B00] tracking-widest block mb-0.5">
                      Enfoque Temático Semanal • {activeWeek.weekName}
                    </span>
                    <p className="text-xs font-black text-slate-900 leading-tight">
                      {activeWeek.theme}
                    </p>
                  </div>
                )}



                {/* Enviar Plan de Entrenamiento al Jugador */}
                {!isPlayerViewMode && (
                  <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 md:p-5 mb-5 shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black uppercase text-orange-950 flex items-center gap-1.5 tracking-wider">
                          <Send className="w-3.5 h-3.5 text-orange-600 animate-bounce" />
                          Guardar y Asignar Plan al Jugador
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">
                          Guarda el plan activo de {trainingPlan.weeks?.length || 4} semanas completas con rutinas americanas e insértalo en la libreta de {userName}.
                        </p>
                      </div>

                      {isPlanSubmitted ? (
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                          <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl text-xs font-bold w-full md:w-auto flex flex-col gap-1.5 shadow-sm">
                            <span className="flex items-center gap-1.5">
                              <span>✅ ¡Plan guardado y asignado exitosamente a <span className="font-black text-emerald-800">{submittedToName}</span>!</span>
                            </span>
                          </div>
                          {submitMedium === "WhatsApp" && (
                            <div className="bg-[#E8F5E9] border border-emerald-200 rounded-2xl p-3 flex flex-col gap-2 shadow-xs max-w-sm sm:max-w-md">
                              <p className="text-[10px] text-emerald-900 font-bold leading-normal">
                                📱 ¡Plan listo para WhatsApp! Haz clic abajo para despachar el plan a {userName} con el enlace a su libreta digital:
                              </p>
                              <a
                                href={(() => {
                                  if (!trainingPlan) return "#";
                                  const phone = destAddress.replace(/\D/g, "");
                                  let planSummary = `🏀 *PLAN DE ENTRENAMIENTO PINETYS GRIND - ${userName.toUpperCase()}* 🏀\n\n`;
                                  planSummary += `Hola ${userName}, el Coach te ha asignado tus rutinas de baloncesto de este verano:\n\n`;
                                  planSummary += `📋 *Plan*: ${trainingPlan.title}\n`;
                                  planSummary += `⏳ *Intensidad*: ${trainingPlan.recommendedWeeklyHours} horas semanales\n\n`;
                                  
                                  trainingPlan.weeks?.slice(0, 2).forEach((week) => {
                                    planSummary += `🔹 *${week.weekName}*: ${week.theme}\n`;
                                    week.days?.forEach((day) => {
                                      planSummary += `   • *${day.dayName}*: ${day.theme}\n`;
                                    });
                                  });
                                  
                                  if ((trainingPlan.weeks?.length || 0) > 2) {
                                    planSummary += `\n... ¡y más semanas de drills de alto rendimiento!\n`;
                                  }
                                  
                                  planSummary += `\n📲 Accede aquí a tu libreta digital para marcar tus tareas diarias completas y entrar en las clasificaciones: ${window.location.origin}\n\n`;
                                  planSummary += `¡Vamos a romperla en la cancha! ⚡🏀`;
                                  
                                  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(planSummary)}`;
                                })()}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm text-center cursor-pointer"
                              >
                                📱 ENVIAR PLAN POR WHATSAPP
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={handleSendPlanToPlayer} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
                          <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden text-xs w-full sm:w-auto shadow-sm">
                            <select
                              value={submitMedium}
                              onChange={(e) => setSubmitMedium(e.target.value)}
                              className="bg-slate-50 hover:bg-slate-100 p-2 font-bold focus:outline-none border-r border-slate-200 shrink-0 cursor-pointer"
                            >
                              <option value="WhatsApp">📱 WhatsApp</option>
                              <option value="Email">📧 Correo</option>
                              <option value="App Interna">📋 Interno</option>
                            </select>
                            <input
                              type="text"
                              required
                              value={destAddress}
                              onChange={(e) => setDestAddress(e.target.value)}
                              placeholder={submitMedium === "WhatsApp" ? "+34 600 000 000" : submitMedium === "Email" ? "jugador@correo.com" : "Dispositivo de Campamento"}
                              className="p-2 w-full sm:w-44 focus:outline-none font-medium text-slate-700 font-sans"
                            />
                          </div>

                          <button
                            type="submit"
                            className="bg-[#FF6B00] hover:bg-orange-700 text-white font-black uppercase text-[10px] px-4 py-2.5 rounded-lg tracking-wider font-sans transition-all cursor-pointer w-full sm:w-auto shrink-0 shadow-sm"
                          >
                            Enviar a {userName}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}

            <div className="flex flex-col gap-5">
                  {/* Day navigation tabs */}
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
                    {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dayName) => {
                      const day = activeWeek?.days?.find((d) => d.dayName.toLowerCase() === dayName.toLowerCase());
                      const isSelected = selectedDayTab === dayName;

                      if (day) {
                        const done = day.drills?.length > 0 && day.drills?.every((dr) => completedDrillIds[`${userName.toLowerCase()}_${selectedWeekTab}_${day.dayName}_${dr.id}`]);
                        return (
                          <button
                            key={dayName}
                            onClick={() => setSelectedDayTab(dayName)}
                            type="button"
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm font-bold scale-[1.03]"
                                : "bg-slate-50 border-slate-100 text-slate-750 hover:bg-slate-100"
                            }`}
                          >
                            <span className="text-[9px] font-black uppercase tracking-wider block">
                              {dayName}
                            </span>
                            <div className="flex gap-1 mt-1">
                              {day.drills.map((_, dIdx) => {
                                const compositeKey = `${userName.toLowerCase()}_${selectedWeekTab}_${day.dayName}_${day.drills[dIdx].id}`;
                                const drillDone = !!completedDrillIds[compositeKey];
                                return (
                                  <div
                                    key={dIdx}
                                    className={`w-1 h-1 rounded-full ${
                                      isSelected
                                        ? drillDone ? "bg-white" : "bg-white/30"
                                        : drillDone ? "bg-emerald-500" : "bg-slate-300"
                                    }`}
                                  ></div>
                                );
                              })}
                            </div>
                          </button>
                        );
                      } else {
                        // Rest / Stretching day
                        const routineData = getRestDayRoutine(dayName, activeWeek);
                        const restKeyPrefix = `${userName.toLowerCase()}_${selectedWeekTab}_${dayName}`;
                        const totalStretches = routineData.drills?.length || 0;
                        const completedStretchesCount = routineData.drills?.filter((_, idx) => !!completedRestStretches[`${restKeyPrefix}_stretch_${idx}`]).length || 0;
                        const done = totalStretches > 0 && completedStretchesCount === totalStretches;

                        return (
                          <button
                            key={dayName}
                            onClick={() => setSelectedDayTab(dayName)}
                            type="button"
                            className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold scale-[1.03]"
                                : "bg-indigo-50/70 border-indigo-100 text-indigo-950 hover:bg-indigo-100/50"
                            }`}
                          >
                            <span className="text-[9px] font-black uppercase tracking-wider block">
                              {dayName}
                            </span>
                            <div className="flex items-center gap-0.5 mt-1 text-[8px] font-mono font-black border border-indigo-300/40 bg-white/40 px-1 py-0.5 rounded text-indigo-700">
                              <span>🧘‍♂️</span>
                              <span>{done ? "100%" : `${completedStretchesCount}/${totalStretches}`}</span>
                            </div>
                          </button>
                        );
                      }
                    })}
                  </div>

                  {activeTrainingDay ? (
                    <>
                      {/* Day Theme detail block */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-1">
                        <span className="text-[8px] font-black uppercase text-[#FF6B00] tracking-widest block mb-0.5">
                          Rutina Diaria • {activeTrainingDay.dayName}
                        </span>
                        <p className="text-xs font-black text-slate-800 leading-tight">
                          {activeTrainingDay.theme}
                        </p>
                      </div>

                      {/* Stretching & Quick Warm-up Widget */}
                      {(() => {
                    const getWarmUpRoutine = (mode: string, intensity: string) => {
                      const isSolo = mode !== "duo";
                      const stretches = [
                        {
                          name: "Estiramiento Dinámico de Pecho y Brazos",
                          duration: "45 segundos",
                          focus: "Lanzamiento y extensión de codos fluida"
                        },
                        {
                          name: "Zancadas con Torsión de Tronco",
                          duration: "1 minuto",
                          focus: "Estiramiento de isquiotibiales y movilidad torácica"
                        },
                        {
                          name: "Pantorrillas y Aquiles Dinámico",
                          duration: "1 minuto",
                          focus: "Acondicionar tobillos para aceleraciones bruscas"
                        }
                      ];

                      if (isSolo) {
                        stretches.push({
                          name: "Sensibilidad de Munecas Estática (Loch Ness)",
                          duration: "1.5 minutos",
                          focus: "Despertar la propiocepción con un balón"
                        });
                        stretches.push({
                          name: "Auto-Pases con Parada en 1 Tiempo",
                          duration: "1 minuto",
                          focus: "Establecer pie de pivote inmediato de forma individual"
                        });
                      } else {
                        stretches.push({
                          name: "Pases de Pecho Recíprocos en Desplazamiento Lateral",
                          duration: "2 minutos",
                          focus: "Activación ocular y sincronización de pase con compañero"
                        });
                        stretches.push({
                          name: "Ejercicio de Sombra Espejo (Defensivo)",
                          duration: "1.5 minutos",
                          focus: "Desplazamientos laterales rápidos siguiendo al compañero"
                        });
                      }

                      if (intensity === "elite") {
                        stretches.push({
                          name: "Box Sprints Mamba Mentality (6-6-6)",
                          duration: "3 minutos",
                          focus: "Alcanzar frecuencia cardíaca óptima pre-competición"
                        });
                      } else if (intensity === "casual") {
                        stretches.push({
                          name: "Trote Progresivo de Canasta a Canasta",
                          duration: "1.5 minutos",
                          focus: "Lubricación articular suave y calentamiento liviano"
                        });
                      } else {
                        stretches.push({
                          name: "Sprints Cortos a Media Canasta",
                          duration: "2 minutos",
                          focus: "Carrera de reacción con cambios de velocidad continuos"
                        });
                      }

                      return stretches;
                    };

                    const routine = getWarmUpRoutine(trainingMode, intensityLevel);

                    return (
                      <div className="bg-[#111827] text-slate-100 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3 mb-4 mt-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-[#FF6B00] animate-pulse" />
                            <div>
                              <h4 className="text-[12px] font-black uppercase tracking-wider text-slate-100">
                                ⚡ Calentamiento y Estiramientos Express
                              </h4>
                              <p className="text-[9px] text-slate-400 font-semibold">
                                Modo: {trainingMode === "duo" ? "👥 Pareja / Equipo" : "👤 Individual"} • Nivel: {intensityLevel === "elite" ? "🔥 Élite NCAA" : intensityLevel === "casual" ? "☕ Recreativo" : "💪 Competitivo"}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsWarmupOpen(!isWarmupOpen)}
                            className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-slate-800 hover:bg-[#FF6B00] hover:text-white transition-all text-slate-300 cursor-pointer"
                          >
                            {isWarmupOpen ? "Ocultar" : "⚡ Mostrar Rutina"}
                          </button>
                        </div>

                        {isWarmupOpen ? (
                          <div className="space-y-3 border-t border-slate-800/80 pt-3">
                            <p className="text-[10px] text-zinc-300 leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                              Evita lesiones y activa tus músculos con esta rutina dinámica adaptada a tu enfoque y configuración actual.
                            </p>
                            
                            <div className="space-y-2">
                              {routine.map((item, idx) => {
                                const key = `warmup_${trainingMode}_${intensityLevel}_${idx}`;
                                const isCompleted = !!completedWarmups[key];
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => toggleWarmupItem(key)}
                                    className={`flex items-start gap-2.5 p-2 rounded-xl cursor-pointer select-none transition-all border ${
                                      isCompleted 
                                        ? "bg-[#FF6B00]/10 border-[#FF6B00]/30 text-slate-300 opacity-60 line-through" 
                                        : "bg-slate-900/50 border-slate-800 text-slate-200 hover:border-slate-705"
                                    }`}
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isCompleted}
                                      onChange={() => {}}
                                      className="mt-0.5 rounded border-slate-700 text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer accent-[#FF6B00] shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold leading-tight truncate">
                                          {item.name}
                                        </span>
                                        <span className="text-[8px] bg-slate-900 border border-slate-800 text-[#FF6B00] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ml-1">
                                          ⏱️ {item.duration}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-tight truncate">
                                        🎯 {item.focus}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Dynamic Completion progress */}
                            {(() => {
                              const total = routine.length;
                              const completed = routine.filter((_, idx) => !!completedWarmups[`warmup_${trainingMode}_${intensityLevel}_${idx}`]).length;
                              const allDone = total > 0 && completed === total;

                              return (
                                <div className="space-y-2 pt-1">
                                  <div className="flex justify-between items-center text-[9px] font-black uppercase">
                                    <span className={`${allDone ? "text-green-400" : "text-amber-400"}`}>
                                      {allDone ? "🏆 ¡RUTINA COMPLETADA! LISTO PARA EL MANTRA MAMBA" : "🔥 ACTIVACIÓN EN PROGRESO"}
                                    </span>
                                    <span className="text-[#FF6B00]">
                                      {completed} / {total} Pasos
                                    </span>
                                  </div>
                                  <div className="w-full bg-[#1e293b] rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="bg-[#FF6B00] h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${(completed / total) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 flex justify-between items-center bg-slate-900/30 px-3 py-1.5 rounded-xl border border-slate-800/40">
                            <span>Sugerencia: {routine[0].name}...</span>
                            <span className="text-[#FF6B00] font-bold text-[8px] uppercase font-mono">⏱️ ~5 minutos</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Active Drills Exercises table checklist */}
                  <div className="space-y-2 mt-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
                      <h4 className="text-xs font-black uppercase text-slate-600 flex items-center gap-1.5 tracking-wider">
                        <span>Lista de Ejercicios del Día</span>
                        <span className="text-slate-400 font-normal">({activeTrainingDay?.drills?.length || 0})</span>
                      </h4>

                      {/* Filter Tag triggers */}
                      <div className="flex gap-1 overflow-x-auto pb-1 max-w-full no-scrollbar">
                        {[
                          { id: "todos", label: "🏀 Todos" },
                          { id: "tiro", label: "🎯 Tiro" },
                          { id: "bote", label: "⚡ Bote" },
                          { id: "agilidad", label: "👟 Agilidad" },
                          { id: "resistencia", label: "🏃 Física" },
                          { id: "finalizaciones", label: "🔥 Finales" },
                          { id: "kobe", label: "🐍 Kobe" }
                        ].map((btn) => {
                          const isSelected = drillCategoryFilter === btn.id;
                          return (
                            <button
                              key={btn.id}
                              type="button"
                              onClick={() => setDrillCategoryFilter(btn.id)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider shrink-0 transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-xs"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {btn.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Drill Suggestion Block */}
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/40 border border-indigo-200/80 rounded-2xl p-4 py-3.5 space-y-3 shadow-xs mb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="bg-indigo-600 text-white rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          </div>
                          <div>
                            <h5 className="text-[10px] font-black uppercase text-indigo-950 tracking-wider">
                              Sugeridor de Ejercicios IA
                            </h5>
                            <p className="text-[8.5px] text-indigo-600 font-extrabold uppercase tracking-wide">
                              Drill premium adaptado a {drillCategoryFilter === "todos" ? "tu perfil" : `enfoque de ${drillCategoryFilter}`} • {intensityLevel || "medium"}
                            </p>
                          </div>
                        </div>

                        {suggestedDrill ? (
                          <button
                            type="button"
                            onClick={handleDismissSuggestion}
                            className="self-start sm:self-center text-[9px] font-black uppercase text-indigo-700 hover:text-indigo-950 transition-colors bg-indigo-100/50 hover:bg-indigo-200/50 py-1.5 px-3 rounded-xl border border-indigo-200/50 cursor-pointer"
                          >
                            Ocultar sugerencia
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSuggestSpecializedDrill}
                            disabled={isSuggesting}
                            className="inline-flex items-center justify-center gap-1 text-[9.5px] font-black uppercase bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 px-3.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed self-start sm:self-center"
                          >
                            {isSuggesting ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Creando sugerencia...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                                Sugerir Ejercicio IA
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {suggestionError && (
                        <div className="text-[9.5px] font-black text-red-600 uppercase tracking-tight bg-red-50 border border-red-100 p-2.5 rounded-xl">
                          ⚠️ Error: {suggestionError}
                        </div>
                      )}

                      {suggestedDrill && (
                        <div className="bg-white border border-indigo-150 rounded-xl p-3.5 space-y-3.5 shadow-sm relative">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-xs font-black text-slate-800 flex-1 leading-snug">
                              {suggestedDrill.title}
                            </h4>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded border border-indigo-250 bg-indigo-50 text-indigo-700 uppercase tracking-wide font-mono">
                              {suggestedDrill.category ? getCategoryTheme(suggestedDrill.category).badge : "🏀 IA"}
                            </span>
                            <span className="text-[8px] bg-slate-100 text-[#FF6B00] px-1.5 py-0.5 rounded font-extrabold uppercase">
                              {suggestedDrill.intensity || "Media"}
                            </span>
                            <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold font-mono">
                              ⏱️ {suggestedDrill.durationMinutes || 12} min
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-normal font-sans pr-2">
                            {suggestedDrill.description}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <div className="bg-neutral-50/80 border border-slate-100 rounded-lg p-2 flex flex-col justify-between">
                              <span className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider block">Meta establecida</span>
                              <span className="text-[9.5px] text-slate-750 font-bold leading-tight mt-0.5">{suggestedDrill.targetReps}</span>
                            </div>
                            <div className="bg-neutral-50/80 border border-slate-100 rounded-lg p-2 flex flex-col justify-between">
                              <span className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider block">Objetivo Biomecánico</span>
                              <span className="text-[9.5px] text-slate-750 font-bold leading-tight mt-0.5">{suggestedDrill.assignedObjective}</span>
                            </div>
                          </div>

                          {/* Complete directly for this suggested drill */}
                          <div className="flex items-center gap-2 border-t border-dashed border-indigo-100 pt-3">
                            {(() => {
                              const customKey = `${userName.toLowerCase()}_${selectedWeekTab}_${activeTrainingDay?.dayName || "Dia"}_${suggestedDrill.id}`;
                              const isComp = !!completedDrillIds[customKey];
                              const pts = suggestedDrill.intensity === "Alta" ? 30 : suggestedDrill.intensity === "Media" ? 20 : 10;
                              return (
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleDrillCompletion(customKey, pts, suggestedDrill.title);
                                    if (!isComp) {
                                      setCelebrationDrill({ title: suggestedDrill.title, points: pts });
                                      setTimeout(() => setCelebrationDrill(null), 3800);
                                    }
                                  }}
                                  className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-colors cursor-pointer border ${
                                    isComp
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : "bg-indigo-650 hover:bg-indigo-700 text-white border-transparent shadow-xs"
                                  }`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                  {isComp ? "✓ ¡Completado con éxito y sumado!" : "Completar este drill (+Puntos)"}
                                </button>
                              );
                            })()}

                            <button
                              type="button"
                              onClick={handleSuggestSpecializedDrill}
                              disabled={isSuggesting}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                              title="Generar otra sugerencia diferente"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Otro drill
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {(() => {
                      const filteredDrills = activeTrainingDay?.drills?.filter((drill: any) => {
                        if (drillCategoryFilter === "todos") return true;
                        return drill.category === drillCategoryFilter;
                      }) || [];

                      if (filteredDrills.length === 0) {
                        return (
                          <div className="text-center py-8 bg-slate-50 border border-slate-150 rounded-2xl">
                            <Smile className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                            <p className="text-[11px] text-slate-450 font-black uppercase tracking-wider">Sin ejercicios de esta categoría hoy</p>
                            <p className="text-[9px] text-zinc-400 mt-0.5">Usa otros filtros o selecciona un día diferente del calendario.</p>
                          </div>
                        );
                      }

                      return filteredDrills.map((drill: any) => {
                        const compositeKey = `${userName.toLowerCase()}_${selectedWeekTab}_${activeTrainingDay.dayName}_${drill.id}`;
                        const isCompleted = !!completedDrillIds[compositeKey];
                        const metaStyle = getCategoryTheme(drill.category);
                        const drillPoints = drill.intensity === "Alta" ? 30 : drill.intensity === "Media" ? 20 : 10;
                        const userNoteText = drillNotes[compositeKey] || "";

                        return (
                          <div
                            key={drill.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                              isCompleted
                                ? "bg-emerald-50/20 border-emerald-300 opacity-95 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 w-full">
                              <div className="flex items-start gap-3 flex-1">
                                <button
                                  onClick={() => {
                                    toggleDrillCompletion(compositeKey, drillPoints, drill.title);
                                    if (!isCompleted) {
                                      // Trigger celebration toast
                                      setCelebrationDrill({ title: drill.title, points: drillPoints });
                                      setTimeout(() => setCelebrationDrill(null), 3800);
                                    }
                                  }}
                                  type="button"
                                  className={`w-6 h-6 mt-0.5 rounded-full border-2 cursor-pointer transition-all flex items-center justify-center shrink-0 ${
                                    isCompleted
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : "border-slate-300 hover:border-[#FF6B00] bg-white text-transparent"
                                  }`}
                                >
                                  <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>

                                <div className="space-y-0.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <h5
                                      className={`text-xs font-black ${
                                        isCompleted ? "text-slate-500 line-through font-bold" : "text-slate-800"
                                      }`}
                                    >
                                      {drill.title}
                                    </h5>
                                    <span
                                      className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${metaStyle.bg}`}
                                    >
                                      {metaStyle.badge}
                                    </span>
                                    <span className="text-[8px] bg-slate-100 text-[#FF6B00] px-1.5 py-0.5 rounded font-extrabold font-sans">
                                      {drill.intensity}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-500 leading-normal font-normal">
                                    {drill.description}
                                  </p>

                                  <div className="mt-1.5 mb-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDiagramDrillId(expandedDiagramDrillId === drill.id ? null : drill.id)}
                                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#FF6B00] hover:text-orange-700 cursor-pointer transition-colors bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded"
                                    >
                                      📐 {expandedDiagramDrillId === drill.id ? "Ocultar Esquema Táctico" : "Ver Esquema de Cancha"}
                                    </button>
                                  </div>

                                  {expandedDiagramDrillId === drill.id && (
                                    <DrillDiagram drill={drill} />
                                  )}

                                  {drill.assignedObjective && (
                                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold bg-slate-50/80 px-2 py-1 rounded border border-slate-100 w-max max-w-full">
                                      <Award className="w-3 h-3 text-yellow-600 shrink-0" />
                                      <span>Objetivo: <span className="font-normal text-slate-600">{drill.assignedObjective}</span></span>
                                    </div>
                                  )}

                                  {/* Visual real-time stopwatch especially helpful for dribbling/endurance training times */}
                                  <DrillStopwatch
                                    drill={drill}
                                    compositeKey={compositeKey}
                                    onSaveToNotes={(txt) => saveDrillNote(compositeKey, txt)}
                                    drillNotes={drillNotes}
                                  />
                                </div>
                              </div>

                              <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 text-[11px] font-mono shrink-0">
                                <div className="text-left md:text-right">
                                  <span className="block text-[8px] font-bold text-slate-400">DURACIÓN</span>
                                  <span className="font-black text-slate-800">{drill.durationMinutes} mins</span>
                                </div>

                                {/* Dynamic Track Stopwatch Countdown timer built directly into the exercise */}
                                <div className="mt-1 md:mt-1.5">
                                  {activeTimerDrillId === drill.id ? (
                                    <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono text-[10px]">
                                      <span className="text-[#FF6B00] font-black animate-pulse">
                                        ⏱️ {Math.floor(timerSecondsLeft / 60)}:{(timerSecondsLeft % 60).toString().padStart(2, "0")}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setTimerIsRunning(!timerIsRunning)}
                                        className="text-white hover:text-[#FF6B00] cursor-pointer"
                                        title={timerIsRunning ? "Pausar" : "Iniciar"}
                                      >
                                        {timerIsRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTimerSecondsLeft(drill.durationMinutes * 60);
                                          setTimerIsRunning(true);
                                        }}
                                        className="text-slate-400 hover:text-white cursor-pointer"
                                        title="Reiniciar"
                                      >
                                        <RotateCcw className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveTimerDrillId(null);
                                          setTimerIsRunning(false);
                                        }}
                                        className="text-red-400 hover:text-red-500 font-extrabold cursor-pointer text-xs ml-0.5"
                                        title="Cerrar"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveTimerDrillId(drill.id);
                                        setTimerSecondsLeft(drill.durationMinutes * 60);
                                        setTimerTotalDuration(drill.durationMinutes * 60);
                                        setTimerIsRunning(true);
                                      }}
                                      className="bg-slate-900 hover:bg-[#FF6B00] text-slate-100 hover:text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg transition-all cursor-pointer border border-slate-700 flex items-center gap-1.5 shrink-0"
                                    >
                                      <Play className="w-2.5 h-2.5" /> ⏱️ Medir Tiempo
                                    </button>
                                  )}
                                </div>

                                <div className="text-right mt-1 md:mt-2 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] shrink-0 font-sans font-bold">
                                  <span className="font-black text-orange-600 pr-1 truncate block max-w-28 text-right">
                                    {drill.targetReps}
                                  </span>
                                  <span className="text-[8px] bg-amber-100 text-amber-800 px-1 rounded font-bold inline-block">
                                    +{drillPoints} pts
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Short user comments / feedback physical note & Biometric Metrics Panel */}
                            <div className="pt-2.5 border-t border-dashed border-slate-100 flex flex-col gap-2">
                              
                              {/* METRICS RECORDING COMPONENT */}
                              {editingMetricKey === compositeKey ? (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 max-w-lg">
                                  <h6 className="text-[10px] font-black text-[#FF6B00] uppercase tracking-wider flex items-center gap-1">
                                    📊 Registro de Rendimiento Clínico y Biométrico del Drill
                                  </h6>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Shot/Reps counter */}
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-black text-slate-500 uppercase">
                                        {(drill.category ? drill.category.toLowerCase() : "") === "tiro" || (drill.category ? drill.category.toLowerCase() : "") === "finalizaciones" ? "🏀 Tiros Metidos / Totales" : "🔁 Reps Logradas / Planificadas"}
                                      </label>
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="number"
                                          min="0"
                                          value={metricMakes}
                                          onChange={(e) => setMetricMakes(Math.max(0, parseInt(e.target.value) || 0))}
                                          className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-black text-center text-slate-800"
                                        />
                                        <span className="text-slate-400 text-[9px] font-bold">/</span>
                                        <input
                                          type="number"
                                          min="1"
                                          value={metricAttempts}
                                          onChange={(e) => setMetricAttempts(Math.max(1, parseInt(e.target.value) || 1))}
                                          className="w-12 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-black text-center text-slate-800"
                                        />
                                      </div>
                                    </div>

                                    {/* Heart rate monitor */}
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-black text-slate-500 uppercase">
                                        💖 Pulso Promedio (BPM)
                                      </label>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="range"
                                          min="60"
                                          max="200"
                                          value={metricHr}
                                          onChange={(e) => setMetricHr(parseInt(e.target.value) || 120)}
                                          className="w-20 accent-red-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                                        />
                                        <span className="text-[9.5px] font-black text-slate-800 font-mono shrink-0">
                                          {metricHr} bpm
                                        </span>
                                      </div>
                                    </div>

                                    {/* Borg Scale RPE index */}
                                    <div className="space-y-1">
                                      <label className="block text-[8.5px] font-black text-slate-500 uppercase">
                                        🔥 Fatiga Borg (1 - 10)
                                      </label>
                                      <div className="flex items-center gap-1.5">
                                        <select
                                          value={metricRpe}
                                          onChange={(e) => setMetricRpe(parseInt(e.target.value) || 5)}
                                          className="bg-white border border-slate-200 rounded text-[9.5px] font-bold px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-500"
                                        >
                                          <option value="1">1 - Reposo Total</option>
                                          <option value="2">2 - Muy Suave</option>
                                          <option value="3">3 - Suave</option>
                                          <option value="4">4 - Moderado</option>
                                          <option value="5">5 - Algo Duro</option>
                                          <option value="6">6 - Activo</option>
                                          <option value="7">7 - Duro (Borg 15)</option>
                                          <option value="8">8 - Muy Duro</option>
                                          <option value="9">9 - Umbral Límite</option>
                                          <option value="10">10 - Esfuerzo Máximo</option>
                                        </select>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 justify-end pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setEditingMetricKey(null)}
                                      className="text-slate-400 hover:text-slate-600 text-[9px] font-black uppercase tracking-wider px-2 py-1"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveMetric(compositeKey)}
                                      className="bg-orange-500 hover:bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-lg shadow-sm cursor-pointer"
                                    >
                                      Guardar Biométricas
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  {drillMetrics[compositeKey] ? (
                                    <div className="text-[10px] bg-slate-950/80 border border-slate-800 text-slate-200 rounded-xl p-3 flex flex-wrap gap-4 items-center justify-between">
                                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center">
                                        <div className="flex items-center gap-1.5">
                                          <Activity className="w-3.5 h-3.5 text-[#FF6B00]" />
                                          <span className="text-slate-400 font-sans">Pulso:</span> 
                                          <span className="font-mono text-white font-extrabold">{drillMetrics[compositeKey].hr} BPM</span>
                                          <span className={`w-2 h-2 rounded-full ${drillMetrics[compositeKey].hr > 160 ? "bg-red-500 animate-pulse" : drillMetrics[compositeKey].hr > 130 ? "bg-amber-400" : "bg-green-400"}`} />
                                        </div>
                                        
                                        <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                                          <span className="text-slate-400 font-sans">Impulso RPE Borg:</span>
                                          <span className="font-mono text-[#FF6B00] font-extrabold">{drillMetrics[compositeKey].rpe}/10</span>
                                          <span className="text-[9px] text-slate-500 ml-1">
                                            ({drillMetrics[compositeKey].rpe >= 9 ? "Límite" : drillMetrics[compositeKey].rpe >= 7 ? "Muy Duro" : drillMetrics[compositeKey].rpe >= 5 ? "Duro" : "Moderado"})
                                          </span>
                                        </div>

                                        {drillMetrics[compositeKey].attempts > 0 && (
                                          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                                            <span className="text-slate-400 font-sans">Rendimiento:</span>
                                            <span className="font-mono text-green-400 font-black">
                                              {drillMetrics[compositeKey].makes}/{drillMetrics[compositeKey].attempts} 
                                              <span className="text-[8.5px] text-slate-400 ml-1">
                                                ({Math.round((drillMetrics[compositeKey].makes / drillMetrics[compositeKey].attempts) * 100)}%)
                                              </span>
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMetricKey(compositeKey);
                                          setMetricMakes(drillMetrics[compositeKey].makes || 0);
                                          setMetricAttempts(drillMetrics[compositeKey].attempts || 25);
                                          setMetricRpe(drillMetrics[compositeKey].rpe || 5);
                                          setMetricHr(drillMetrics[compositeKey].hr || 120);
                                        }}
                                        className="text-[8.5px] text-[#FF6B00] hover:text-orange-500 font-bold uppercase tracking-wider"
                                      >
                                        [Modificar Métricas]
                                      </button>
                                    </div>
                                  ) : (
                                    isCompleted && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingMetricKey(compositeKey);
                                          setMetricMakes(0);
                                          setMetricAttempts((drill.category ? drill.category.toLowerCase() : "") === "tiro" ? 25 : 10);
                                          setMetricRpe(5);
                                          setMetricHr(120);
                                        }}
                                        className="text-[9px] text-[#FF6B00] border border-orange-500/20 bg-orange-50/5 hover:bg-orange-50/10 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer w-max"
                                      >
                                        📊 Registrar Métricas de Esfuerzo / Tiros Convertidos
                                      </button>
                                    )
                                  )}
                                </div>
                              )}

                              {/* FREE FORM FEEDBACK NOTES COMPONENT */}
                              {editingDrillNoteKey === compositeKey ? (
                                <div className="flex gap-1.5 w-full max-w-md pt-1">
                                  <input
                                    type="text"
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Añadir notas libres... (ej. -5 tiros fallados, fatiga, cansancio muscular)"
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[10px] text-slate-700 focus:outline-none focus:border-[#FF6B00]"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => saveDrillNote(compositeKey, noteText)}
                                    className="bg-[#FF6B00] text-white px-3 py-1 rounded text-[9px] font-black uppercase cursor-pointer transition-colors"
                                  >
                                    Listo
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingDrillNoteKey(null)}
                                    className="text-slate-400 text-[10px] px-1.5 hover:text-slate-600 cursor-pointer"
                                  >
                                    X
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {userNoteText ? (
                                    <p className="text-[10px] text-slate-650 bg-orange-50/50 border border-orange-100/50 rounded-lg px-2.5 py-1 flex items-center gap-1.5 flex-1 max-w-full">
                                      <MessageSquare className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                                      <span>Bitácora de Esfuerzo: <strong className="font-semibold text-slate-800 font-sans italic">"{userNoteText}"</strong></span>
                                    </p>
                                  ) : (
                                    isCompleted && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDrillNoteKey(compositeKey);
                                          setNoteText("");
                                        }}
                                        className="text-[9px] text-[#FF6B00] font-black uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                                      >
                                        ✍️ Añadir notas de campo o comentarios adicionales
                                      </button>
                                    )
                                  )}
                                  {userNoteText && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingDrillNoteKey(compositeKey);
                                        setNoteText(userNoteText);
                                      }}
                                      className="text-[9px] text-slate-400 hover:text-[#FF6B00] font-black uppercase tracking-wide cursor-pointer ml-1"
                                    >
                                      [Editar Comentario]
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  </>
                  ) : (
                    <div className="bg-indigo-50/40 border border-indigo-100 rounded-[32px] p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🧘‍♂️</span>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 block">
                              Recuperación Activa • {selectedDayTab}
                            </span>
                            <h4 className="text-base font-black text-indigo-955 uppercase leading-none mt-1">
                              Rutina de Estiramiento y Movilidad Personalizada
                            </h4>
                          </div>
                        </div>
                        <div className="bg-white border border-indigo-200 text-indigo-800 font-extrabold text-[10px] px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shrink-0 shadow-xs">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                          <span>Día de Descanso Inteligente</span>
                        </div>
                      </div>

                      {(() => {
                        const routine = getRestDayRoutine(selectedDayTab, activeWeek);
                        const restKeyPrefix = `${userName.toLowerCase()}_${selectedWeekTab}_${selectedDayTab}`;
                        const totalStretches = routine.drills?.length || 0;
                        const completedCount = routine.drills?.filter((_, idx) => !!completedRestStretches[`${restKeyPrefix}_stretch_${idx}`]).length || 0;
                        const allStretchesDone = totalStretches > 0 && completedCount === totalStretches;

                        const categoryNames: Record<string, string> = {
                          tiro: "Tiro y Suspensión (Hombros, Muñecas y Flexibilidad vertical)",
                          bote: "Manejo y Dribling (Caderas, Tobillo y Lumbares bajos)",
                          agilidad: "Agilidad y Apoyo (Tobillo, Cadena posterior y Caderas)",
                          resistencia: "Resistencia e Isquiotibiales (Isquiotibiales, Cuádriceps e Intercostales)",
                          finalizaciones: "Finalizaciones y Elasticidad (Aductores, Glúteo Medio y Dorsales)",
                          kobe: "Juego de Pies Mamba (Sóleo, Movilidad Torácica y Fascia plantar)"
                        };

                        return (
                          <div className="space-y-4">
                            <div className="p-4 bg-white/80 border border-indigo-100/60 rounded-2xl shadow-xs">
                              <span className="text-[8px] font-black uppercase text-indigo-500 tracking-wider block">
                                Adaptación Semanal Activa
                              </span>
                              <p className="text-xs text-slate-705 leading-relaxed mt-1">
                                En base a los entrenamientos intensos de la semana, tu musculatura ha acumulado tensión en el área de <strong className="text-indigo-955 font-black font-sans">{categoryNames[routine.categoryFocus] || routine.categoryFocus}</strong>. 
                                Realiza estos estiramientos focalizados para disipar tensión residual y potenciar tu elasticidad articular.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* Stretch Metrics info cards */}
                              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5 shadow-md">
                                <span className="text-xl">⏱️</span>
                                <div>
                                  <span className="text-[8px] font-bold text-slate-400 block uppercase">Tiempo Estimado</span>
                                  <span className="text-xs font-black font-mono text-indigo-200">~10 Minutos</span>
                                </div>
                              </div>
                              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5 shadow-md">
                                <span className="text-xl">🔥</span>
                                <div>
                                  <span className="text-[8px] font-bold text-slate-400 block uppercase">Objetivo Clínico</span>
                                  <span className="text-xs font-black text-indigo-100">Prevenir Lesiones</span>
                                </div>
                              </div>
                              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5 shadow-md">
                                <span className="text-xl">💎</span>
                                <div>
                                  <span className="text-[8px] font-bold text-slate-400 block uppercase">Premio al Esfuerzo</span>
                                  <span className="text-xs font-black text-yellow-400 font-mono">+{totalStretches * 5} Puntos</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                                Pasos de Movilidad y Estiramiento
                              </h5>

                              {routine.drills?.map((item, idx) => {
                                const key = `${restKeyPrefix}_stretch_${idx}`;
                                const isCompleted = !!completedRestStretches[key];
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => toggleRestStretchItem(key)}
                                    className={`p-4 rounded-2xl cursor-pointer select-none border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 ${
                                      isCompleted 
                                        ? "bg-emerald-50/30 border-emerald-200 text-slate-500 opacity-70" 
                                        : "bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3 flex-1">
                                      <input 
                                        type="checkbox"
                                        checked={isCompleted}
                                        onChange={() => {}}
                                        className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                                      />
                                      <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <h6 className={`text-xs font-black ${isCompleted ? "line-through text-slate-400" : "text-indigo-955"}`}>
                                            {item.name}
                                          </h6>
                                          <span className="text-[8px] font-extrabold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase border border-indigo-200/40 font-mono">
                                            ⏱y {item.duration}
                                          </span>
                                        </div>
                                        <p className="text-[9.5px] text-indigo-805 font-semibold leading-tight">
                                          🎯 Foco: {item.focus}
                                        </p>
                                        <p className="text-[10px] text-slate-500 leading-normal mt-1.5 pl-2.5 border-l border-indigo-200 italic">
                                          "{item.explanation}"
                                        </p>
                                      </div>
                                    </div>
                                    <div className="shrink-0 text-right text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-black max-w-max self-end sm:self-center">
                                      +5 PTS
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Rest Day progress meter */}
                            <div className="p-4 bg-slate-950 text-white rounded-2xl border border-slate-900 shadow-md space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                <span className={allStretchesDone ? "text-green-400" : "text-indigo-300"}>
                                  {allStretchesDone ? "🏆 ¡RECUPERACIÓN COMPLETADA CON ÉXITO!" : "🧘 PROGRESO EN TU DÍA DE DESCANSO"}
                                </span>
                                <span className="text-[#FF6B00]">
                                  {completedCount} / {totalStretches} Completados
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                <div 
                                  className="bg-indigo-400 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(completedCount / totalStretches) * 100}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-slate-400 font-medium">
                                El descanso inteligente es un entrenamiento silencioso. Al terminar todos los estiramientos, mantendrás tus músculos oxigenados y reducirás el estrés metabólico para arrasar tu siguiente día de juego.
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </section>

              {/* AI Powered Training Plan Carga and Balance analysis */}
              <AIPlanAnalysis 
                trainingPlan={trainingPlan} 
                completedDrillIds={completedDrillIds}
                ageGroup={ageGroup}
                playerRole={playerRole}
                trainingMode={trainingMode}
                intensityLevel={intensityLevel}
              />
              </>
            )}
          </div>
        )}

      {/* Sub-tab 3: Retos, Objetivos y Alertas */}
      {profileTab === "challenges" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active challenges panel */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <section className="bg-[#FF6B00] rounded-[32px] p-6 text-white shadow-xl flex flex-col gap-4" id="id-challenges-section">
              <div className="flex items-center justify-between pointer-events-none">
                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-white">
                  <Zap className="w-4 h-4 text-white animate-bounce" />
                  Retos de Alto Rendimiento
                </h2>
                <span className="inline-block text-[9px] bg-white/20 text-white px-2 py-0.5 rounded font-black font-mono">
                  +PTS EXTRAS
                </span>
              </div>

              <p className="text-[10px] text-orange-100 font-medium leading-relaxed">
                ¡Los jugadores inician con <strong className="font-black text-white">0 puntos</strong>! Completa estos exigentes desafíos individuales en la cancha de entrenamiento para sumar puntos a tu récord instantáneamente:
              </p>

              {/* Weekly Selector for Retos */}
              <div className="flex flex-wrap bg-white/10 p-1 rounded-xl text-[10px] font-black uppercase text-center gap-1">
                {(trainingPlan?.weeks?.map(w => w.weekName) || Array.from({ length: weeksCount }, (_, i) => `Semana ${i + 1}`)).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setRetosWeekTab(w)}
                    className={`flex-1 py-1.5 px-1 rounded-lg transition-all cursor-pointer ${
                      retosWeekTab === w
                        ? "bg-white text-[#FF6B00] font-black shadow-sm scale-102"
                        : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {(() => {
                  if (WEEKLY_RETOS && WEEKLY_RETOS[retosWeekTab]) {
                    return WEEKLY_RETOS[retosWeekTab];
                  }
                  if (WEEKLY_RETOS) {
                    const weekNum = parseInt(retosWeekTab.replace(/\D/g, "")) || 1;
                    const fallbackKey = `Semana ${((weekNum - 1) % 4) + 1}`;
                    if (WEEKLY_RETOS[fallbackKey]) {
                      return WEEKLY_RETOS[fallbackKey];
                    }
                  }
                  return AVAILABLE_RETOS;
                })().map((reto) => (
                  <div key={reto.id} className="bg-white rounded-2xl p-4 text-slate-900 border border-orange-400/20 shadow-xs flex flex-col gap-2.5 transition-all">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-800 leading-tight">{reto.title}</h4>
                        <span className="inline-block text-[8px] font-black uppercase bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded mt-1 border border-orange-100 leading-none">
                          {reto.category}
                        </span>
                      </div>
                      <span className="text-xs font-black font-mono bg-orange-100 text-[#FF6B00] px-2 py-1 rounded-lg shrink-0">
                        +{reto.points} PTS
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold leading-normal">
                      {reto.description}
                    </p>

                    <button
                      onClick={() => handleCompleteChallenge(reto.id)}
                      type="button"
                      className="w-full bg-[#FF6B00] hover:bg-[#e45a00] text-white font-black uppercase text-[10px] tracking-wider py-2 rounded-xl transition-all cursor-pointer shadow-xs text-center"
                    >
                      🎯 ¡Conseguido! Sumar Puntos
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Objectives & notifications logs panel */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Objectives */}
            <section className="bg-slate-900 rounded-[32px] p-6 text-white shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between pointer-events-none">
                <h2 className="text-xs font-extrabold text-[#FF6B00] uppercase tracking-widest flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                  Coach's Board (USA Academy)
                </h2>
                <span className="inline-block text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded font-mono">
                  PRO NIVEL
                </span>
              </div>

              {/* Coach message intro */}
              <div className="bg-white/10 rounded-xl p-3 border border-white/5">
                <p className="text-[11px] italic text-slate-300 leading-relaxed font-sans">
                  "El tiro libre de Curry y los botes de Irving forjan verdaderos campeones. He marcado objetivos colectivos. Registra tus repeticiones para ganar insignias."
                </p>
              </div>

              {/* Objectives list */}
              <div className="space-y-3">
                {objectives.map((obj) => {
                  const percent = Math.min(100, Math.round((obj.currentCount / obj.targetCount) * 100));
                  return (
                    <div key={obj.id} className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden">
                      <span className="inline-block text-[8px] bg-[#FF6B00]/20 text-[#FF6B00] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest mb-1 leading-none">
                        {obj.category} - {obj.badge}
                      </span>
                      <p className="text-[11px] text-white leading-normal font-medium font-sans">
                        {obj.description}
                      </p>
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[9px] font-mono text-slate-400 leading-none">
                          <span>Progreso:</span>
                          <span className="text-[#FF6B00] font-black">{obj.currentCount} / {obj.targetCount}</span>
                        </div>
                        <div className="w-full bg-white/15 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-[#FF6B00] h-1 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Objective Form toggles */}
              {!isPlayerViewMode && (
                isCreatingObjective ? (
                  <form onSubmit={handleCreateObjective} className="bg-white/5 border border-white/15 rounded-2xl p-4 mt-1 space-y-2.5">
                    <span className="text-[11px] font-black uppercase text-white block">Asignar Nuevo Desafío</span>

                    <div>
                      <input
                        type="text"
                        placeholder="Descripción del objetivo"
                        value={newObjDesc}
                        onChange={(e) => setNewObjDesc(e.target.value)}
                        required
                        className="w-full bg-slate-800 text-xs text-white border border-white/20 rounded px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newObjCategory}
                        onChange={(e) => setNewObjCategory(e.target.value as any)}
                        className="w-full bg-slate-800 text-xs text-white border border-white/20 rounded p-1"
                      >
                        <option value="tiro">Tiro</option>
                        <option value="bote">Bote</option>
                        <option value="agilidad">Agilidad</option>
                        <option value="resistencia">Resistencia</option>
                        <option value="finalizaciones">Finalizaciones</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Insignia"
                        value={newObjBadge}
                        onChange={(e) => setNewObjBadge(e.target.value)}
                        className="w-full bg-slate-800 text-xs text-white border border-white/20 rounded px-2 py-1 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 items-center justify-between">
                      <input
                        type="number"
                        placeholder="Meta"
                        value={newObjTarget}
                        onChange={(e) => setNewObjTarget(e.target.value)}
                        className="bg-slate-800 text-xs text-white border border-white/20 rounded px-2 py-1 w-20 focus:outline-none"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsCreatingObjective(false)}
                          className="bg-slate-700 text-[10px] uppercase font-black text-slate-350 px-2.5 py-1.5 rounded"
                        >
                          X
                        </button>
                        <button
                          type="submit"
                          className="bg-[#FF6B00] text-[10px] uppercase font-black text-white px-3 py-1.5 rounded hover:bg-[#e45a00]"
                        >
                          Crear
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsCreatingObjective(true)}
                    type="button"
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-2 rounded-xl text-[10px] uppercase transition-all tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Asignar Objetivo Personalizado
                  </button>
                )
              )}
            </section>

            {/* Notifications & Reminders logs */}
            <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#FF6B00]" />
                  Alertas y Notificaciones
                </h3>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
              </div>

              {/* Instant reminder simulator */}
              {!isPlayerViewMode && (
                <div className="mb-4">
                  <button
                    onClick={sendInstantReminder}
                    type="button"
                    className="w-full bg-red-50 hover:bg-red-100 text-[#FF6B00] border border-red-200 py-2 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer font-sans"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    Simular Recordatorio Diarios
                  </button>
                </div>
              )}

              {/* Alert lists logs */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-[#FF6B00] uppercase tracking-wide">{notif.title}</span>
                      <span className="text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">{notif.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Logros y Medallas de Verano */}
      {profileTab === "logros" && (
        <div className="grid grid-cols-1 gap-6">
          {/* Progress Overview Hero Card */}
          <section className="bg-slate-900 rounded-[32px] p-6 text-white border border-slate-800 shadow-lg relative overflow-hidden">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FF6B00] opacity-15">
              <Trophy className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 space-y-2 max-w-lg">
              <span className="text-[10px] bg-[#FF6B00] text-slate-900 px-2.5 py-0.5 rounded font-black uppercase tracking-wider font-sans">
                PANEL DE RECOMPENSAS
              </span>
              <h3 className="text-xl font-black uppercase tracking-tight">Sala de Trofeos de {userName}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                Completa tus entrenamientos semanales, acumula puntos de intensidad y desbloquea insignias exclusivas aprobadas por el cuerpo técnico de Grind Prep Academy. ¡Sube tu nivel hoy!
              </p>

              {/* Achievements Tally Bar */}
              {(() => {
                const badgesList = [
                  { unlocked: stats.tiroPoints >= 50 },
                  { unlocked: stats.botePoints >= 50 },
                  { unlocked: stats.agilidadPoints >= 50 },
                  { unlocked: stats.resistenciaPoints >= 50 },
                  { unlocked: stats.totalPoints >= 150 },
                  { unlocked: stats.drillsCount >= 10 }
                ];
                const unlockedCount = badgesList.filter(b => b.unlocked).length;
                const percentUnlocked = Math.round((unlockedCount / badgesList.length) * 100);

                return (
                  <div className="pt-4 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-mono leading-none text-slate-400">
                      <span>OBJETIVOS GRIND COMPLETADOS:</span>
                      <span className="text-emerald-400 font-extrabold">{unlockedCount} de 6 Trofeos ({percentUnlocked}%)</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-400 h-2 rounded-full transition-all duration-500" style={{ width: `${percentUnlocked}%` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </section>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="id-analytics-charts">
            {/* Card 1: Puntos Semanales */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FF6B00]" />
                Evolución de Puntos Semanales
              </h3>
              <p className="text-[10px] text-slate-500 mb-4 font-sans font-medium">
                Puntos de intensidad acumulados al registrar ejercicios cada semana.
              </p>
              
              <div className="w-full h-64 text-[10px]" style={{ minHeight: "240px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyPointsData()} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "12px", border: "none" }}
                      itemStyle={{ color: "#FF6B00" }} 
                    />
                    <Bar dataKey="Puntos" fill="#FF6B00" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card 2: Reparto de Ejercicios */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200">
              {(() => {
                const categoryResult = getCategoryData();
                return (
                  <>
                    <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-1 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#FF6B00]" />
                      {categoryResult.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-4 font-sans font-medium">
                      {categoryResult.hasProgress 
                        ? "Distribución en base a los drills que has completado con éxito." 
                        : "Distribución planificada de categorías según tu rutina de verano."}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-around">
                      <div className="w-48 h-48 text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryResult.data}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {categoryResult.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "12px", border: "none" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-2 shrink-0">
                        {categoryResult.data.map((entry) => (
                          <div key={entry.name} className="flex items-center gap-2 text-[10.5px]">
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <strong className="text-slate-850 uppercase font-black">{entry.name}:</strong>
                            <span className="text-slate-500 font-bold font-mono">
                              {entry.value} {categoryResult.hasProgress ? "pts" : "drills"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Card 3: Tendencia de Progreso y Esfuerzo (Cumulative Area & Line Chart) */}
            <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-200 md:col-span-2">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider mb-1 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF6B00]" />
                Tendencia de Progreso y Puntos Acumulados
              </h3>
              <p className="text-[10px] text-slate-500 mb-4 font-sans font-medium">
                Sigue la curva de tu esfuerzo en tiempo real y compárala con la meta sugerida de la Mamba Mentality.
              </p>
              
              <div className="w-full h-72 text-[10px]" style={{ minHeight: "260px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getPointsTrendOverTime()} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#64748B" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'PUNTOS', angle: -90, position: 'insideLeft', offset: 0, style: { fontWeight: 'bold', fill: '#64748B' } }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#7C3AED" fontSize={10} axisLine={false} tickLine={false} label={{ value: 'DRILLS', angle: 90, position: 'insideRight', offset: 0, style: { fontWeight: 'bold', fill: '#7C3AED' } }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0F172A", color: "#FFF", borderRadius: "12px", border: "none" }}
                    />
                    <Legend wrapperStyle={{ position: 'relative', marginTop: '10px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="Acumulado Real" stroke="#FF6B00" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPoints)" name="Puntos Acumulados" />
                    <Line yAxisId="left" type="monotone" dataKey="Meta Sugerida" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} name="Curva Mamba de Referencia" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="Drills Hechos" stroke="#7C3AED" strokeWidth={2} name="Drills Completados" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Trofeos 3D Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {[
              {
                id: "sniper",
                title: "🎯 Francotirador",
                description: "Domina el arco de tiro.",
                reqText: "Acumular 50 puntos en drills de Tiro",
                current: stats.tiroPoints,
                target: 50,
                isUnlocked: stats.tiroPoints >= 50,
                colorTheme: "from-orange-500 to-amber-600",
                badgeName: "HAWK EYE"
              },
              {
                id: "kyrie_hand",
                title: "⚡ Kyrie Kyrie",
                description: "Manejo de balón irrompible.",
                reqText: "Acumular 50 puntos en drills de Bote",
                current: stats.botePoints,
                target: 50,
                isUnlocked: stats.botePoints >= 50,
                colorTheme: "from-blue-500 to-sky-600",
                badgeName: "CROSSOVER KING"
              },
              {
                id: "speed_demon",
                title: "👟 Rayo en Pista",
                description: "Juego de pies implacable.",
                reqText: "Acumular 50 puntos en drills de Agilidad",
                current: stats.agilidadPoints,
                target: 50,
                isUnlocked: stats.agilidadPoints >= 50,
                colorTheme: "from-purple-500 to-indigo-600",
                badgeName: "SPEED DEMON"
              },
              {
                id: "iron_lungs",
                title: "🏃 Pulmones de Acero",
                description: "Ningún cansancio te detiene.",
                reqText: "Acumular 50 puntos en drills de Resistencia",
                current: stats.resistenciaPoints,
                target: 50,
                isUnlocked: stats.resistenciaPoints >= 50,
                colorTheme: "from-emerald-500 to-teal-600",
                badgeName: "RESTLESS BEAST"
              },
              {
                id: "rising_star",
                title: "🏆 Promesa de Verano",
                description: "Subiendo los peldaños al éxito.",
                reqText: "Alcanzar 150 puntos acumulados en total",
                current: stats.totalPoints,
                target: 150,
                isUnlocked: stats.totalPoints >= 150,
                colorTheme: "from-amber-400 to-orange-600",
                badgeName: "CAMP STAR"
              },
              {
                id: "mamba",
                title: "🔥 Mentalidad Mamba",
                description: "Trabajo duro sin excusas.",
                reqText: "Completar por lo menos 10 ejercicios del plan",
                current: stats.drillsCount,
                target: 10,
                isUnlocked: stats.drillsCount >= 10,
                colorTheme: "from-rose-600 to-red-800",
                badgeName: "MAMBA SPIRIT"
              }
            ].map((trophy) => {
              const badgePercent = Math.min(100, Math.round((trophy.current / trophy.target) * 100));
              
              return (
                <div
                  key={trophy.id}
                  className={`bg-white rounded-3xl border p-5 transition-all shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[190px] ${
                    trophy.isUnlocked
                      ? "border-amber-400 bg-gradient-to-br from-white to-amber-50/15"
                      : "border-slate-200 opacity-80"
                  }`}
                >
                  {/* Lock badge overlay */}
                  <div className="absolute right-3.5 top-3.5 z-10">
                    {trophy.isUnlocked ? (
                      <span className="bg-amber-50 text-amber-600 text-[8px] font-black uppercase px-2 py-1 rounded border border-amber-200 font-sans">
                        ✨ {trophy.badgeName}
                      </span>
                    ) : (
                      <div className="bg-slate-100 p-1.5 rounded-full text-slate-400" title="Trofeo Bloqueado">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {/* Badge Emoji */}
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase text-slate-800 leading-tight">
                        {trophy.title}
                      </h4>
                    </div>

                    <p className="text-[10px] text-slate-400 font-bold leading-normal">
                      {trophy.description}
                    </p>
                    <p className="text-[9px] text-[#FF6B00] font-black uppercase tracking-wider leading-none">
                      Requisito: {trophy.reqText}
                    </p>
                  </div>

                  <div className="space-y-2 mt-4 pt-3 border-t border-slate-50">
                    <div className="flex justify-between items-center text-[9px] font-mono leading-none text-slate-500">
                      <span>Progreso:</span>
                      <strong className="font-extrabold text-slate-700">{trophy.current} / {trophy.target}</strong>
                    </div>
                    
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r ${
                          trophy.isUnlocked ? trophy.colorTheme : "from-slate-350 to-slate-450"
                        }`}
                        style={{ width: `${badgePercent}%` }}
                      />
                    </div>

                    {trophy.isUnlocked && (
                      <span className="block text-center text-[9px] text-emerald-600 font-black uppercase tracking-widest mt-1 animate-pulse font-sans">
                        ✓ ¡Trofeo Desbloqueado!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 5: Tabla de Clasificación para Jugadores */}
      {profileTab === "clasificacion" && (
        <div className="max-w-3xl mx-auto w-full">
          <Leaderboard
            players={leaderboard}
            userPoints={userPoints}
            userDrillsCompleted={userDrillsCount}
            userName={userName}
            onChangeName={setUserName}
            isOnline={true}
            onAddPlayer={() => {}}
            onSelectPlayer={() => {}}
            completedDrillIds={completedDrillIds}
            isPlayerViewMode={isPlayerViewMode}
            trainingPlan={trainingPlan}
          />
        </div>
      )}
    </div>
  );
}
