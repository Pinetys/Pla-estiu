import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw, Database } from "lucide-react";

interface ConnectivityStatusProps {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  offlineQueueLength: number;
  onManualSync: () => void;
  isSyncing: boolean;
}

export default function ConnectivityStatus({
  isOnline,
  setIsOnline,
  offlineQueueLength,
  onManualSync,
  isSyncing,
}: ConnectivityStatusProps) {
  const [actualOnLine, setActualOnLine] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setActualOnLine(true);
      // Only set output state if they are in auto mode
      setIsOnline(true);
    };
    const handleOffline = () => {
      setActualOnLine(false);
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setIsOnline]);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white py-2 px-4 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
        {/* Connection status display */}
        <div className="flex items-center gap-3">
          {isOnline ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-semibold text-xs tracking-wider flex items-center gap-1.5 font-mono uppercase">
                <Wifi className="w-3.5 h-3.5" /> En Línea / Sincronizado
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-amber-400 font-semibold text-xs tracking-wider flex items-center gap-1.5 font-mono uppercase">
                <WifiOff className="w-3.5 h-3.5 animate-pulse" /> Modo Offline Activado
              </span>
            </div>
          )}

          {/* Actual internet connection feedback if overridden by simulation */}
          {actualOnLine !== isOnline && (
            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
              *Simulado
            </span>
          )}
        </div>

        {/* Sync queue indicator & Offline Mode Simulator */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          {offlineQueueLength > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/40 text-amber-300 border border-amber-900/40 px-3 py-1 rounded-full text-xs font-mono animate-pulse">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>{offlineQueueLength} registros pendientes</span>
              {isOnline && (
                <button
                  onClick={onManualSync}
                  disabled={isSyncing}
                  className="ml-1 text-xs font-bold text-amber-200 hover:text-white underline cursor-pointer flex items-center gap-1 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                  Sincronizar Ya
                </button>
              )}
            </div>
          )}

          {/* Connection Simulator toggle */}
          <div className="flex items-center gap-2 bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-[11px] font-medium text-slate-300">Simulador de Conexión:</span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                isOnline ? "bg-emerald-600" : "bg-amber-600"
              }`}
              id="id-connection-simulator-toggle"
              aria-label="Toggle Simulated connection"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isOnline ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-[11px] font-bold font-mono">
              {isOnline ? "CONECTADO" : "SIN RED"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
