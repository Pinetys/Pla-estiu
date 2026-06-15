import React, { useState, useEffect } from "react";
import { Droplets, Sun, Play, Pause, RotateCcw, Timer, Sparkles, Bell } from "lucide-react";

interface SummerHydrationTrackerProps {
  addNotification: (title: string, body: string) => void;
}

export default function SummerHydrationTracker({ addNotification }: SummerHydrationTrackerProps) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [secondsSinceLastRemind, setSecondsSinceLastRemind] = useState<number>(0);
  const [targetIntervalSeconds] = useState<number>(45 * 60); // 45 minutes
  const [simulatedTemp] = useState<number>(37); // 37°C summer training camp heat

  // Format seconds to standard mm:ss or hh:mm:ss
  const formatSeconds = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Sound generator for professional water droplet alert
  const playHydrationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Frequency bubble sound
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Unable to play synthesised hydration audio signal", e);
    }
  };

  // Run countdown tickers
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        setSecondsSinceLastRemind((prevSeconds) => {
          const next = prevSeconds + 1;
          if (next >= targetIntervalSeconds) {
            triggerHydrationCheck();
            return 0; // reset
          }
          return next;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsSinceLastRemind]);

  const triggerHydrationCheck = () => {
    playHydrationSound();
    addNotification(
      "💧 Registro de Hidratación en Calor Extremo (Grind Prep)",
      "¡Llevas 45 minutos de entrenamiento intensivo! Bebe al menos 250ml de agua o bebida isotónica para prevenir la fatiga muscular en calor de 37°C."
    );
  };

  // Reset training timer
  const handleResetSession = () => {
    setIsActive(false);
    setElapsedSeconds(0);
    setSecondsSinceLastRemind(0);
  };

  // Dynamic Simulation feature for instantaneous verification
  const handleSimulate45Minutes = () => {
    // Add 45 minutes instantly
    setElapsedSeconds((prev) => prev + 45 * 60);
    playHydrationSound();
    addNotification(
      "💧 Recordatorio de Hidratación (Simulado +45m)",
      "¡Se alcanzaron 45 minutos continuos de drill físico a 37°C! Es hora de vaciar tu botella y recuperar sales minerales."
    );
    // Trigger reset countdown
    setSecondsSinceLastRemind(0);
  };

  const percentHydrationWait = Math.min(100, Math.round((secondsSinceLastRemind / targetIntervalSeconds) * 100));
  const remainingSeconds = targetIntervalSeconds - secondsSinceLastRemind;
  const remainingMinutesFormatted = `${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s`;

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/25 rounded-[32px] p-5 shadow-lg space-y-4 relative overflow-hidden" id="summer-hydration-tracker-widget">
      
      {/* Decorative Warm Backlighting */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-[#FF6B00]/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute left-10 bottom-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Info */}
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-0.5">
          <span className="text-[7.5px] font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.5 rounded-full inline-flex items-center gap-1 leading-normal">
            <Sun className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "12s" }} />
            Summer Heat Index • Nivel Prep USA
          </span>
          <h4 className="text-xs md:text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5 pt-1">
            <Droplets className="w-4 h-4 text-sky-400 animate-bounce" />
            Control de Hidratación Inteligente
          </h4>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-xl text-center">
          <span className="block text-[7px] text-amber-400 font-extrabold uppercase">CALOR</span>
          <span className="text-[11px] font-bold text-amber-300 font-mono">{simulatedTemp}°C 🔥</span>
        </div>
      </div>

      {/* Visual active workout ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-white/5 border border-white/5 rounded-2xl p-4 relative z-10">
        <div className="sm:col-span-5 text-center sm:text-left space-y-0.5">
          <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider">
            SESIÓN ADICIONAL DE CREADOR DE JUEGO (TIMER)
          </span>
          <div className="font-mono text-2xl font-black text-white leading-none">
            {formatSeconds(elapsedSeconds)}
          </div>
          <span className="text-[8.5px] text-slate-350 block max-w-xs leading-normal">
            {isActive ? "🟢 Entrenamiento activo..." : "⏸️ Sesión actualmente pausada"}
          </span>
        </div>

        {/* Buttons Controls */}
        <div className="sm:col-span-7 flex flex-wrap items-center justify-center sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all shadow-md ${
              isActive 
                ? "bg-amber-500 text-white hover:bg-amber-600" 
                : "bg-sky-500 text-white hover:bg-sky-600"
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pausar Sesión
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 font-bold" /> Iniciar Sesión
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResetSession}
            disabled={elapsedSeconds === 0}
            className={`p-2 rounded-xl border transition-all text-slate-300 cursor-pointer ${
              elapsedSeconds > 0 
                ? "bg-white/5 border-white/10 hover:bg-white/10" 
                : "bg-white/5 border-transparent text-slate-500 cursor-not-allowed"
            }`}
            title="Resetear cronómetro"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Simulator button */}
          <button
            type="button"
            onClick={handleSimulate45Minutes}
            className="bg-white/10 hover:bg-[#FF6B00]/20 border border-white/15 text-white hover:text-white px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Simular 45 minutos de entrenamiento en calor extremo"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            Simular +45m
          </button>
        </div>
      </div>

      {/* Hydration warning scale progress */}
      <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-3.5 space-y-2 relative z-10">
        <div className="flex justify-between items-center text-[10px]">
          <span className="font-extrabold text-[#FF6B00] uppercase flex items-center gap-1 bg-[#FF6B00]/10 px-2 py-0.5 rounded-md">
            💧 Próximo Sorbo de Agua
          </span>
          <span className="font-mono text-slate-300 font-bold">
            en: <strong className="text-white font-extrabold">{remainingMinutesFormatted}</strong>
          </span>
        </div>

        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-400 to-sky-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${percentHydrationWait}%` }}
          />
        </div>

        <div className="flex items-start gap-1.5 text-[9px] text-sky-200/80 leading-normal font-sans">
          <Bell className="w-3 h-3 text-sky-400 mt-0.5 shrink-0" />
          <span>
            Bajo temperaturas de verano, la pérdida de agua reduce el % de tiro en un 12%. Mantén la hidratación estautaria.
          </span>
        </div>
      </div>

    </div>
  );
}
