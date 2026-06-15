import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, User, Sparkles, RefreshCw, CheckCircle2, Trash2 } from "lucide-react";
import { LeaderboardPlayer } from "../types";

interface LeaderboardProps {
  players: LeaderboardPlayer[];
  userPoints: number;
  userDrillsCompleted: number;
  userName: string;
  onChangeName: (newName: string) => void;
  isOnline: boolean;
  onAddPlayer: (name: string, avatar: string, points: number, drillsCompleted: number) => void;
  onSelectPlayer: (name: string, points: number, drillsCompleted: number) => void;
  onDeletePlayer?: (playerId: string) => void;
  completedDrillIds?: Record<string, boolean>;
  playerPlans?: Record<string, any>;
  trainingPlan?: any;
  isPlayerViewMode?: boolean;
}

export default function Leaderboard({
  players,
  userPoints,
  userDrillsCompleted,
  userName,
  onChangeName,
  isOnline,
  onAddPlayer,
  onSelectPlayer,
  onDeletePlayer,
  completedDrillIds,
  playerPlans,
  trainingPlan,
  isPlayerViewMode = false,
}: LeaderboardProps) {
  const [editingName, setEditingName] = useState(false);
  const [inputName, setInputName] = useState(userName);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerAvatar, setNewPlayerAvatar] = useState("🏀");
  const [newPlayerPoints, setNewPlayerPoints] = useState("100");
  const [newPlayerDrills, setNewPlayerDrills] = useState("4");
  const [liveActivities, setLiveActivities] = useState<string[]>([
    "Registrando entrenamientos para el verano americano.",
  ]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync input name when selected player changes
  useEffect(() => {
    setInputName(userName);
  }, [userName]);

  // Handle name change submit
  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      onChangeName(inputName.trim());
      setEditingName(false);
    }
  };

  // Handle manual player creation Submit
  const handleCreatePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(
        newPlayerName.trim(),
        newPlayerAvatar,
        0, // Starts with 0 points
        0  // Starts with 0 drills completed
      );
      // Reset State
      setNewPlayerName("");
      setNewPlayerAvatar("🏀");
      setIsAddingPlayer(false);
    }
  };

  // Generate dynamic live commentary loops of classmates completing exercises to simulate real training environments
  useEffect(() => {
    const actions = [
      "completó un bloque de 12 minutos de Mikan Drill.",
      "anotó 20 tiros libres consecutivos en Stephen Curry Shooting.",
      "completó el desafío de agilidad 'Ickey Shuffle'.",
      "sincronizó su progreso diario en el calendario.",
      "registró una serie de crossovers de Kyrie Irving.",
      "completó la agilidad defensiva de zigzag NBA.",
    ];

    const interval = setInterval(() => {
      if (players.length === 0) return;
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const text = `🏀 ${randomPlayer.name} ${randomAction} (Hace unos instantes)`;

      setLiveActivities((prev) => [text, ...prev.slice(0, 4)]);
    }, 18000); // Add simulated activity every 18 seconds

    return () => clearInterval(interval);
  }, [players]);

  const getPlayerProgress = (playerName: string) => {
    const plan = (playerPlans && playerPlans[playerName.toLowerCase()]) || trainingPlan;
    if (!plan || !plan.weeks || !completedDrillIds) {
      // General fallback using p.drillsCompleted from the leaderboard data
      const playerObj = players.find(x => x.name.toLowerCase() === playerName.toLowerCase());
      const drillsCompleted = playerObj ? playerObj.drillsCompleted : 0;
      const simulatedTotal = 25; // standard drills across 4 weeks
      const percentage = Math.min(100, Math.round((drillsCompleted / simulatedTotal) * 100));
      return { completed: drillsCompleted, total: simulatedTotal, percentage };
    }
    
    let total = 0;
    let completed = 0;
    
    plan.weeks.forEach((w: any) => {
      w.days.forEach((d: any) => {
        d.drills.forEach((dr: any) => {
          total++;
          const key = `${playerName.toLowerCase()}_${w.weekName}_${d.dayName}_${dr.id}`;
          if (completedDrillIds[key]) {
            completed++;
          }
        });
      });
    });
    
    // Fallback if no checked checkboxes but player has logged completions in their statistics
    if (completed === 0) {
      const playerObj = players.find(x => x.name.toLowerCase() === playerName.toLowerCase());
      if (playerObj && playerObj.drillsCompleted > 0) {
        completed = playerObj.drillsCompleted;
      }
    }
    
    const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
    return { completed, total, percentage };
  };

  const sortedRankings = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-full">
      {/* Header section with basketball orange accent */}
      <div className="bg-slate-900 p-6 text-white relative">
        <div className="absolute right-4 top-4 text-orange-500 opacity-20">
          <Trophy className="w-24 h-24 stroke-[1.5]" />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl text-black">
            <Trophy className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg tracking-tight">Tabla de Clasificación</h3>
            <p className="text-xs text-slate-400">Verano Prep Academy de EE.UU.</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* User profile customization widget inside the board */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-orange-600" /> Jugador de Enfoque Activo
          </h4>
          {userName ? (
            editingName ? (
              <form onSubmit={handleSubmitName} className="flex gap-2">
                <input
                  id="id-player-username-input"
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  maxLength={20}
                  required
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1 text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-xs font-medium"
                />
                <button
                  type="submit"
                  id="id-save-username-btn"
                  className="bg-orange-500 text-white px-3 py-1 text-xs font-semibold rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  Guardar
                </button>
              </form>
            ) : (
              <div className="flex justify-between items-center bg-white border border-slate-200 p-2.5 rounded-xl">
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  ⭐️ <span className="text-rose-600 font-extrabold uppercase text-[10px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{isPlayerViewMode ? "Jugador Activo" : "Planificando"}</span>
                  <span className="text-slate-900 font-black text-sm">{userName}</span>
                </span>
                {!isPlayerViewMode && (
                  <button
                    onClick={() => setEditingName(true)}
                    id="id-edit-username-btn"
                    className="text-[10px] text-orange-500 hover:text-orange-600 hover:underline cursor-pointer font-bold uppercase"
                  >
                    Cambiar Nombre
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="text-center p-3 bg-white border border-orange-200/50 rounded-xl">
              <p className="text-slate-500 text-xs leading-relaxed font-bold">
                ⚠️ Ningún jugador seleccionado
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                Usa el formulario de abajo para registrar jugadores, y presiona el botón <span className="text-orange-600 font-bold">"Planificar"</span> o haz clic en su tarjeta para asignarles entrenamiento.
              </p>
            </div>
          )}

          {/* User Score overview badges */}
          {userName && (
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/60 text-center">
              <div className="bg-white py-1.5 px-2 rounded border border-slate-100">
                <span className="block text-[11px] text-slate-400 font-medium">PUNTOS</span>
                <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{userPoints}</span>
              </div>
              <div className="bg-white py-1.5 px-2 rounded border border-slate-100">
                <span className="block text-[11px] text-slate-400 font-medium">DRILLS COMPLETADOS</span>
                <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5">{userDrillsCompleted}</span>
              </div>
            </div>
          )}
        </div>

        {/* Manual Player Creator Widget */}
        {!isPlayerViewMode && (
          <div className="mb-6">
            {!isAddingPlayer ? (
              <button
                onClick={() => setIsAddingPlayer(true)}
                id="id-toggle-add-player-btn"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 border border-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Crear Jugador Manualmente
              </button>
            ) : (
              <form
                onSubmit={handleCreatePlayerSubmit}
                className="bg-orange-50/50 border border-orange-200 rounded-xl p-4 space-y-3 shadow-inner"
                id="id-add-player-form"
              >
                <div className="flex justify-between items-center pb-2 border-b border-orange-100">
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1">
                    🏀 Registro de Jugador
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingPlayer(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Cancelar
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Nombre del Player
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Michael 'Air' Jordan"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Seleccionar Avatar
                    </label>
                    <select
                      value={newPlayerAvatar}
                      onChange={(e) => setNewPlayerAvatar(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 text-xs focus:ring-1 focus:ring-orange-500 font-medium"
                    >
                      <option value="🏀">🏀 Baloncesto</option>
                      <option value="🔥">🔥 En Racha</option>
                      <option value="⚡">⚡ Relámpago</option>
                      <option value="👑">👑 Rey</option>
                      <option value="🎯">🎯 Francotirador</option>
                      <option value="⭐">⭐ Estrella</option>
                      <option value="🐯">🐯 Tigre</option>
                      <option value="👽">👽 Extraterrestre</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  id="id-submit-add-player-btn"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Registrar e Integrar en Leaderboard
                </button>
              </form>
            )}
          </div>
        )}

        {/* Players Lists Ranking Table */}
        <div className="overflow-hidden">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ranking de Jugadores Registrados</h4>
          
          {sortedRankings.length === 0 ? (
            <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <span className="block text-2xl mb-2">📋</span>
              <p className="text-xs font-bold text-slate-600">No hay jugadores registrados todavía</p>
              <p className="text-[10px] text-slate-400 mt-1">Crea tu primer jugador con el botón negro de arriba.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sortedRankings.map((p, index) => {
                const rank = index + 1;
                const isSelected = userName && p.name.toLowerCase() === userName.toLowerCase();

                let medalBadge = <span className="text-xs font-bold text-slate-400 w-5">{rank}</span>;
                if (rank === 1) medalBadge = <span className="text-base">🥇</span>;
                if (rank === 2) medalBadge = <span className="text-base">🥈</span>;
                if (rank === 3) medalBadge = <span className="text-base">🥉</span>;

                if (confirmDeleteId === p.id) {
                  return (
                    <div
                      key={p.id}
                      className="bg-red-50/90 border border-red-200 p-3.5 rounded-xl flex flex-col gap-2.5 transition-all shadow-xs animate-shake animate-duration-300"
                    >
                      <p className="text-[11px] font-black leading-tight text-red-950 flex items-start gap-1.5">
                        <span className="text-sm">⚠️</span>
                        <span>
                          ¿Seguro que quieres eliminar a <strong className="text-red-700 underline">{p.name}</strong>? Se perderá todo su progreso de entrenamiento.
                        </span>
                      </p>
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeletePlayer) {
                              onDeletePlayer(p.id);
                            }
                            setConfirmDeleteId(null);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Sí, eliminar
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (!isPlayerViewMode) {
                        onSelectPlayer(p.name, p.points, p.drillsCompleted);
                      }
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isPlayerViewMode ? "" : "cursor-pointer"
                    } ${
                      isSelected
                        ? "bg-orange-50 border-orange-400 shadow-sm ring-1 ring-orange-300"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="w-6 flex justify-center text-center">{medalBadge}</div>
                      <div className="text-sm bg-slate-100 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                        {p.avatar || "🏀"}
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-xs font-black flex items-center gap-1.5 ${isSelected ? "text-orange-950" : "text-slate-800"}`}>
                          {p.name}
                          {isSelected && (
                            <span className="text-[8px] bg-orange-600 text-white font-extrabold uppercase px-1 rounded">
                              Activo
                            </span>
                          )}
                        </h5>
                        {!isPlayerViewMode && (
                          <p className="text-[9px] text-slate-400 font-medium font-sans">Haga clic para ver perfil</p>
                        )}
                        {(() => {
                          const progress = getPlayerProgress(p.name);
                          if (progress.total === 0) return null;
                          return (
                            <div className="mt-1 w-32 sm:w-44" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono mb-0.5">
                                <span className="uppercase text-[7px] tracking-wider font-bold text-slate-400">Progreso:</span>
                                <span className="font-extrabold text-orange-600">{progress.percentage}% ({progress.completed}/{progress.total})</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden border border-slate-150">
                                <div
                                  className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${progress.percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-2.5">
                      <div className="shrink-0 leading-tight">
                        <span className="block text-xs font-black text-slate-800 font-mono">
                          {p.points} <span className="text-[9px] font-normal text-slate-400">PTS</span>
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {p.drillsCompleted} drills
                        </span>
                      </div>
                      
                      {!isPlayerViewMode && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPlayer(p.name, p.points, p.drillsCompleted);
                            }}
                            className={`text-[10px] uppercase font-black tracking-tight px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-orange-600 border-orange-600 text-white shadow-xs"
                                : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {isSelected ? "Listo" : "Plan"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteId(p.id);
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer hover:bg-red-50"
                            title="Eliminar jugador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live classroom events feed at the footer of the leaderboards */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Notificaciones del Campamento
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-orange-100 text-orange-800 uppercase tracking-widest font-mono">
              Live Feed
            </span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] text-slate-600 font-mono space-y-2 h-24 overflow-y-auto leading-relaxed">
            {liveActivities.map((act, idx) => (
              <div key={idx} className="border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                {act}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
