/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Dribbble,
  Calendar,
  Sparkles,
  Wifi,
  WifiOff,
  Bell,
  CheckCircle,
  Plus,
  TrendingUp,
  Award,
  Zap,
  Flame,
  User,
  Users,
  Clock,
  ArrowRight,
  ChevronRight,
  Database,
  RefreshCw,
  BellRing,
  Send,
  Lock
} from "lucide-react";
import ConnectivityStatus from "./components/ConnectivityStatus";
import Leaderboard from "./components/Leaderboard";
import PlayerProfileWorkspace from "./components/PlayerProfileWorkspace";
import logoUrl from "./assets/images/pinetys_grind_logo_1781118974554.png";
import {
  TrainingPlan,
  TrainingDay,
  Drill,
  CompletedDrill,
  LeaderboardPlayer,
  CustomObjective,
  NotificationLog
} from "./types";

const WEEKLY_RETOS: Record<string, { id: string; title: string; category: string; points: number; description: string }[]> = {
  "Semana 1": [
    {
      id: "reto-w1-1",
      title: "🏀 Simulación Crossover Irving",
      category: "bote",
      points: 100,
      description: "Realiza 5 series intensas de 1 minuto cruzando el balón pegado al suelo sin mirar en la Semana 1."
    },
    {
      id: "reto-w1-2",
      title: "⚡ Agilidad en Escalera Pro",
      category: "agilidad",
      points: 120,
      description: "Completa el Ickey Shuffle con velocidad explosiva en menos de 15 segundos sin tocar los bordes de la escalera."
    },
    {
      id: "reto-w1-3",
      title: "🏀 Bote Ciego Extremo",
      category: "bote",
      points: 130,
      description: "Bota con los ojos vendados o cerrados por 3 minutos seguidos para desarrollar memoria muscular y tacto."
    }
  ],
  "Semana 2": [
    {
      id: "reto-w2-1",
      title: "🎯 Stephen Curry Target Challenge",
      category: "tiro",
      points: 150,
      description: "Anota 25 tiros de media distancia consecutivos desde las esquinas del campo en la Semana 2."
    },
    {
      id: "reto-w2-2",
      title: "🎯 100 Tiros Libres Seguidos",
      category: "tiro",
      points: 180,
      description: "Registra 100 lanzamientos libres anotados metiendo rachas continuas de finta e impulsión."
    },
    {
      id: "reto-w2-3",
      title: "🎯 Catch & Shoot de Esquina",
      category: "tiro",
      points: 130,
      description: "Esprinta del poste medio a la esquina opuesta, planta los pies rápido, recibe y encesta 15 tiros de tres."
    }
  ],
  "Semana 3": [
    {
      id: "reto-w3-1",
      title: "⚡ Pies de Rayo en Zig-zag",
      category: "agilidad",
      points: 140,
      description: "Completa la defensa de zigzag barriendo la línea de banda a banda de la cancha de entrenamiento 6 veces sin resbalar."
    },
    {
      id: "reto-w3-2",
      title: "🏀 Manejo Dos Balones Simultáneos",
      category: "bote",
      points: 160,
      description: "Bota 2 balones al mismo tiempo (alto + bajo alternado) durante 3 minutos seguidos con total dominio."
    },
    {
      id: "reto-w3-3",
      title: "⚡ Test de Agilidad en T",
      category: "agilidad",
      points: 130,
      description: "Recorre el circuito en forma de T (esprint de frente, desplazamiento lateral y carrera de espaldas) en < 9 segundos."
    }
  ],
  "Semana 4": [
    {
      id: "reto-w4-1",
      title: "🏃 Test de Resistencia 3K",
      category: "resistencia",
      points: 150,
      description: "Completa la carrera continua de 3 kilómetros del Summer Camp a paso de competencia máxima."
    },
    {
      id: "reto-w4-2",
      title: "🏃 Suicidas 17 Tramos Ultimate",
      category: "resistencia",
      points: 200,
      description: "Supera el Test de Suicidios recorriendo la cancha a máxima velocidad en menos de 52 segundos."
    },
    {
      id: "reto-w4-3",
      title: "🏃 Acondicionamiento Mikan Máximo",
      category: "resistencia",
      points: 170,
      description: "Completa 45 encestes Mikan seguidos alternando tableros a toda velocidad bajo fatiga física acumulada."
    }
  ]
};

const AVAILABLE_RETOS = Object.values(WEEKLY_RETOS).flat();

export default function App() {
  // Connection and synchronization states
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<CompletedDrill[]>(() => {
    const saved = localStorage.getItem("hoops_offline_queue");
    return saved ? JSON.parse(saved) : [];
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // User details
  const [userName, setUserName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const playerParam = params.get("player");
      if (playerParam && params.get("view") === "player") {
        return playerParam;
      }
    }
    return localStorage.getItem("hoops_player_name") || "";
  });
  const [userPoints, setUserPoints] = useState<number>(() => {
    const saved = localStorage.getItem("hoops_player_points");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [userDrillsCount, setUserDrillsCount] = useState<number>(() => {
    const saved = localStorage.getItem("hoops_player_drills_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Top-level custom navigation: "leaderboard" (Página Principal) or "profiles" (Perfil del Jugador)
  const [activeTab, setActiveTab] = useState<"leaderboard" | "profiles">("leaderboard");

  // Track each player's customized generated plans to display actual percentages on leaderboard relative to their designated plans
  const [playerPlans, setPlayerPlans] = useState<Record<string, TrainingPlan>>(() => {
    const saved = localStorage.getItem("hoops_player_plans");
    return saved ? JSON.parse(saved) : {};
  });

  // Lock mode so player cannot change modes back to Coach configuration
  const [isPlayerLocked, setIsPlayerLocked] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("view") === "player";
    }
    return false;
  });

  // Coach authentication states to lock/unlock Coach Mode
  const [showCoachPinModal, setShowCoachPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  // Training configurations - secure by default if screen width of device is mobile (< 768)
  const [isPlayerViewMode, setIsPlayerViewMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "player") {
        return true;
      }
      if (params.get("view") === "coach") {
        return false;
      }
    }
    const saved = localStorage.getItem("hoops_player_view_mode");
    if (saved !== null) {
      return saved === "true";
    }
    // Default to player view mode on mobile screens to protect coach permissions by default, else coach mode
    return typeof window !== "undefined" && window.innerWidth < 768;
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const playerParam = params.get("player");
      if (params.get("view") === "player" && playerParam) {
        setUserName(playerParam);
        setIsPlayerViewMode(true);
        setIsPlayerLocked(true);
        setActiveTab("profiles");
        localStorage.setItem("hoops_player_name", playerParam);
        localStorage.setItem("hoops_player_view_mode", "true");
      }
    }
  }, []);

  React.useEffect(() => {
    if (!isPlayerLocked) {
      localStorage.setItem("hoops_player_view_mode", isPlayerViewMode ? "true" : "false");
    }
  }, [isPlayerViewMode, isPlayerLocked]);

  React.useEffect(() => {
    if (isPlayerViewMode && activeTab !== "profiles") {
      setActiveTab("profiles");
    }
  }, [isPlayerViewMode, activeTab]);

  const [ageGroup, setAgeGroup] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("age");
      if (val) return val;
    }
    return "15-17";
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("days");
      if (val) return val.split(",");
    }
    return ["Lunes", "Miércoles", "Viernes"];
  });

  const [focusAreas, setFocusAreas] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("focus");
      if (val) return val.split(",");
    }
    return ["tiro", "bote", "agilidad", "resistencia", "finalizaciones", "kobe"];
  });

  const [sessionDurationHours, setSessionDurationHours] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("hours");
      if (val) return parseFloat(val);
    }
    return 2;
  });

  const [weeksCount, setWeeksCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("weeks");
      if (val) return parseInt(val, 10);
    }
    return 4;
  });

  const [playerRole, setPlayerRole] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("role");
      if (val) return val;
    }
    return "all-round";
  });

  const [trainingMode, setTrainingMode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("mode");
      if (val) return val;
    }
    return "solo";
  });

  const [intensityLevel, setIntensityLevel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const val = params.get("intensity");
      if (val) return val;
    }
    return "medium";
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // States for saving and sending the plan to the player
  const [isPlanSubmitted, setIsPlanSubmitted] = useState<boolean>(false);
  const [submittedToName, setSubmittedToName] = useState<string>("");
  const [submitMedium, setSubmitMedium] = useState<string>("WhatsApp");
  const [destAddress, setDestAddress] = useState<string>("");

  // Active Training Plan
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [selectedDayTab, setSelectedDayTab] = useState<string>("");

  // DB Sync tables
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [objectives, setObjectives] = useState<CustomObjective[]>([]);

  // User completion checklist
  const [completedDrillIds, setCompletedDrillIds] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("hoops_completed_drill_ids");
    return saved ? JSON.parse(saved) : {};
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem("hoops_notifications");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "not-1",
        title: "🔥 ¡Inicio de Campamento de Verano!",
        body: "Coach Miller: 'Prepárate para entrenar como un Pro. Completa tus drills de Stephen Curry y registra tu progreso'.",
        timestamp: "Hace 5 minutos"
      },
      {
        id: "not-2",
        title: "🦖 Consejo Técnico del Día",
        body: "Bote de Kyrie Irving: Mantén siempre el centro de gravedad muy bajo y la vista al frente.",
        timestamp: "Hace 1 hora"
      }
    ];
  });

  // Create Coach Objective form states
  const [newObjDesc, setNewObjDesc] = useState("");
  const [newObjCategory, setNewObjCategory] = useState<"tiro" | "bote" | "agilidad" | "resistencia">("tiro");
  const [newObjBadge, setNewObjBadge] = useState("");
  const [newObjTarget, setNewObjTarget] = useState("50");
  const [isCreatingObjective, setIsCreatingObjective] = useState(false);



  // Persistent Storage synchronization
  useEffect(() => {
    localStorage.setItem("hoops_player_name", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("hoops_player_points", userPoints.toString());
  }, [userPoints]);

  useEffect(() => {
    localStorage.setItem("hoops_player_drills_count", userDrillsCount.toString());
  }, [userDrillsCount]);

  useEffect(() => {
    localStorage.setItem("hoops_completed_drill_ids", JSON.stringify(completedDrillIds));
  }, [completedDrillIds]);

  useEffect(() => {
    localStorage.setItem("hoops_offline_queue", JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    localStorage.setItem("hoops_notifications", JSON.stringify(notifications));
  }, [notifications]);



  // Fetch initial leaderboard & custom objectives
  useEffect(() => {
    fetchLeaderboard();
    fetchObjectives();
    syncAndGetCoachPlans();
  }, []);

  const syncAndGetCoachPlans = async () => {
    try {
      // Find current player name if any
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const urlPlayer = params ? params.get("player") : "";
      const activePlayerName = urlPlayer || userName;

      let fetchedPlans: Record<string, any> = {};
      const savedPlans = localStorage.getItem("hoops_player_plans");
      
      if (savedPlans) {
        const parsedPlans = JSON.parse(savedPlans);
        if (Object.keys(parsedPlans).length > 0) {
          const response = await fetch("/api/coach/plans/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plans: parsedPlans })
          });
          const data = await response.json();
          if (data.success && data.plans) {
            fetchedPlans = data.plans;
          }
        }
      }
      
      if (Object.keys(fetchedPlans).length === 0) {
        const res = await fetch("/api/coach/plans");
        const data = await res.json();
        if (data.success && data.plans) {
          fetchedPlans = data.plans;
        }
      }
      
      if (Object.keys(fetchedPlans).length > 0) {
        setPlayerPlans(fetchedPlans);
        localStorage.setItem("hoops_player_plans", JSON.stringify(fetchedPlans));
        
        // If there's an active player, and we have their customized plan, set it!
        if (activePlayerName) {
          const matchingPlan = fetchedPlans[activePlayerName.toLowerCase()];
          if (matchingPlan) {
            setTrainingPlan(matchingPlan);
            if (matchingPlan.weeks && matchingPlan.weeks.length > 0 && matchingPlan.weeks[0].days.length > 0) {
              setSelectedDayTab(matchingPlan.weeks[0].days[0].dayName);
            }
            // Successfully loaded the actual assigned/customized plan! No need to run generatePlan.
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Failed to sync coach plans", e);
    }
    
    // Fallback if no matching saved plan exists for this player yet
    generatePlan(true);
  };

  const handleToggleDaySelection = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      } else {
        addNotification("⚠️ Selección Requerida", "Debes entrenar al menos un día por semana.");
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Fetch functions with offline resilience
  const fetchLeaderboard = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (data.success) {
        if (data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard);
          localStorage.setItem("hoops_backup_leaderboard", JSON.stringify(data.leaderboard));
        } else {
          // Server is empty (e.g. freshly restarted on Render). Check local backup to restore!
          const backup = localStorage.getItem("hoops_backup_leaderboard");
          if (backup) {
            try {
              const parsedBackup = JSON.parse(backup);
              if (parsedBackup && parsedBackup.length > 0) {
                const restoreRes = await fetch("/api/leaderboard/restore", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ leaderboard: parsedBackup })
                });
                const restoreData = await restoreRes.json();
                if (restoreData.success) {
                  setLeaderboard(restoreData.leaderboard);
                  data.leaderboard = restoreData.leaderboard; // Update local variable for next checks
                }
              }
            } catch (err) {
              console.warn("Failed to restore leaderboard from backup", err);
            }
          } else {
            setLeaderboard([]);
          }
        }

        // Synchronize active player stats between mobile and backend
        if (userName) {
          const matchedPlayer = data.leaderboard.find(
            (p: any) => p.name.toLowerCase() === userName.toLowerCase()
          );
          if (matchedPlayer) {
            setUserPoints(matchedPlayer.points);
            setUserDrillsCount(matchedPlayer.drillsCompleted);
            if (matchedPlayer.completedDrills) {
              setCompletedDrillIds(matchedPlayer.completedDrills);
            }
          } else if (userPoints > 0) {
            // Re-register active player on server to restore their local stats automatically
            try {
              const regRes = await fetch("/api/leaderboard/player", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: userName,
                  avatar: "🏀",
                  points: userPoints,
                  drillsCompleted: userDrillsCount
                })
              });
              const regData = await regRes.json();
              if (regData.success) {
                setLeaderboard(regData.leaderboard);
                localStorage.setItem("hoops_backup_leaderboard", JSON.stringify(regData.leaderboard));
              }
            } catch (err) {
              console.warn("Failed to self-register player on server", err);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Could not load leaderboard from API, offline fallback applies.", e);
    }
  };

  const fetchObjectives = async () => {
    if (!isOnline) return;
    try {
      const res = await fetch("/api/objectives");
      const data = await res.json();
      if (data.success) {
        setObjectives(data.objectives);
      }
    } catch (e) {
      console.warn("Could not load coach objectives from API, offline fallback applies.", e);
    }
  };

  const handleSelectPlayer = (name: string, points: number, drillsCompleted: number) => {
    setUserName(name);
    setUserPoints(points);
    setUserDrillsCount(drillsCompleted);
    addNotification("👤 Jugador Activo Cambiado", `Ahora estás diseñando el plan de entrenamiento para: ${name}.`);
    
    const matchedPlayer = leaderboard.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (matchedPlayer && matchedPlayer.completedDrills) {
      setCompletedDrillIds(matchedPlayer.completedDrills);
    } else {
      setCompletedDrillIds({});
    }

    // Load player specific plan
    const playerPlan = playerPlans[name.toLowerCase()];
    if (playerPlan) {
      setTrainingPlan(playerPlan);
      if (playerPlan.weeks && playerPlan.weeks.length > 0 && playerPlan.weeks[0].days.length > 0) {
        setSelectedDayTab(playerPlan.weeks[0].days[0].dayName);
      }
    } else {
      const cached = localStorage.getItem("hoops_cached_plan");
      if (cached) {
        setTrainingPlan(JSON.parse(cached));
      }
    }

    // Reset submission state for the newly selected player
    setIsPlanSubmitted(false);
    setSubmittedToName("");
    
    // Auto transition to Player Profile workspace
    setActiveTab("profiles");
  };

  // Automatically select the first player when entering Player View Mode if none is active
  React.useEffect(() => {
    if (isPlayerViewMode && !userName && leaderboard.length > 0) {
      const firstPlayer = leaderboard[0];
      handleSelectPlayer(firstPlayer.name, firstPlayer.points, firstPlayer.drillsCompleted);
    }
  }, [isPlayerViewMode, userName, leaderboard]);



  const handleCompleteChallenge = (challengeId: string) => {
    if (!userName) {
      addNotification(
        "⚠️ Selección de Jugador Requerida",
        "Por favor, selecciona un jugador o crea uno en la Tabla de Clasificación antes de intentar superar un reto."
      );
      return;
    }

    const reto = AVAILABLE_RETOS.find((r) => r.id === challengeId);
    if (!reto) return;

    addNotification(
      "🏆 ¡Reto Superado!",
      `Has superado el reto "${reto.title}". Se han sumado +${reto.points} PTS al récord de ${userName}.`
    );

    // Update player points in the leaderboard
    setLeaderboard((prev) => {
      const updated = prev.map((p) => {
        if (p.name.toLowerCase() === userName.toLowerCase()) {
          const np = p.points + reto.points;
          // Update points state
          setUserPoints(np);
          return {
            ...p,
            points: np,
            drillsCompleted: p.drillsCompleted + 1,
            lastActive: "Superó un Reto 🔥"
          };
        }
        return p;
      });

      const exists = updated.some((p) => p.name.toLowerCase() === userName.toLowerCase());
      if (!exists) {
        updated.push({
          id: "p_" + Date.now(),
          name: userName,
          avatar: "🏀",
          points: reto.points,
          drillsCompleted: 1,
          lastActive: "Superó un Reto 🔥"
        });
        setUserPoints(reto.points);
      }
      return updated.sort((a, b) => b.points - a.points);
    });
  };

  // Generate / Customize Plan API Call with high levels of feedback
  const generatePlan = async (isInitialSeed = false, customPrompt = "") => {
    if (isGenerating) return;
    setIsGenerating(true);

    // Check if we have URL query parameters to load customized plan
    let currentAgeGroup = ageGroup;
    let currentDays = selectedDays;
    let currentFocus = focusAreas;
    let currentDuration = sessionDurationHours;
    let currentWeeks = weeksCount;
    let currentRole = playerRole;
    let currentIntensity = intensityLevel;
    let currentMode = trainingMode;
    let hasUrlParams = false;

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "player") {
        hasUrlParams = true;
        const playerParam = params.get("player");
        const age = params.get("age");
        if (age) currentAgeGroup = age;
        const weeks = params.get("weeks");
        if (weeks) currentWeeks = parseInt(weeks, 10);
        const days = params.get("days");
        if (days) currentDays = days.split(",");
        const focus = params.get("focus");
        if (focus) currentFocus = focus.split(",");
        const role = params.get("role");
        if (role) currentRole = role;
        const intensity = params.get("intensity");
        if (intensity) currentIntensity = intensity;
        const hours = params.get("hours");
        if (hours) currentDuration = parseFloat(hours);
        const mode = params.get("mode");
        if (mode) currentMode = mode;
      }
    }

    // Validate that a player is selected before generating!
    if (!userName && !isInitialSeed) {
      addNotification(
        "⚠️ Selección de Jugador Requerida",
        "Por favor, registra un jugador o selecciona uno de la lista de perfiles antes de generar un plan de IA."
      );
      setIsGenerating(false);
      return;
    }

    // Initial default caching
    if (isInitialSeed && !hasUrlParams) {
      const cached = localStorage.getItem("hoops_cached_plan");
      if (cached) {
        const parsed = JSON.parse(cached) as TrainingPlan;
        setTrainingPlan(parsed);
        if (parsed.weeks && parsed.weeks.length > 0 && parsed.weeks[0].days.length > 0) {
          setSelectedDayTab(parsed.weeks[0].days[0].dayName);
        }
        setIsGenerating(false);
        return;
      }
    }

    try {
      const response = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup: currentAgeGroup,
          daysOfWeek: currentDays,
          focusAreas: currentFocus,
          sessionDurationHours: currentDuration,
          customPrompt,
          weeksCount: currentWeeks,
          playerRole: currentRole,
          trainingMode: currentMode,
          intensityLevel: currentIntensity,
        })
      });

      if (!response.ok) {
        throw new Error(`Servidor de IA no disponible o fuera de línea (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (data && data.success && data.plan) {
        setTrainingPlan(data.plan);
        // Save to cache
        localStorage.setItem("hoops_cached_plan", JSON.stringify(data.plan));
        if (userName) {
          setPlayerPlans((prev) => {
            const next = { ...prev, [userName.toLowerCase()]: data.plan };
            localStorage.setItem("hoops_player_plans", JSON.stringify(next));
            // Sync with backend server
            fetch("/api/coach/plan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ playerName: userName, plan: data.plan })
            }).catch(err => console.warn("Failed to sync plan to server", err));
            return next;
          });
        }
        if (data.plan.weeks && data.plan.weeks.length > 0 && data.plan.weeks[0].days.length > 0) {
          setSelectedDayTab(data.plan.weeks[0].days[0].dayName);
        }

        // Reset submit flow states
        setIsPlanSubmitted(false);
        setSubmittedToName("");

        addNotification(
          "📋 Plan Creado Exitosamente",
          `Nuevo plan de entrenamiento para U-${currentAgeGroup} generado basados en metodologías de campamentos americanos.`
        );
      } else {
        throw new Error("La IA no devolvió un plan estructurado adaptable.");
      }
    } catch (e) {
      console.warn("API offline or unavailable, generating custom plan locally with biomechanical compiler", e);
      
      const activeDays = currentDays.length > 0 ? currentDays : ["Lunes", "Miércoles", "Viernes"];
      const activeCategories = currentFocus.length > 0 ? currentFocus : ["tiro", "bote"];
      const activeWeeks = currentWeeks || 2;

      // Define presets for high-fidelity drills
      const drillDatabase: Record<string, Array<{title: string, duration: string, sets: string, description: string}>> = {
        tiro: [
          {
            title: "Mecánica de Tiro Autocontroles",
            duration: "15 mins",
            sets: "3 series de 15 tiros",
            description: "Ejecución de tiro a corta distancia de canasta, prestando atención a la flexión del pulgar, codo cerrado y muñeca libre en arco solar."
          },
          {
            title: "Catch and Shoot en Esquinas",
            duration: "20 mins",
            sets: "5 series de 10 canastas",
            description: "Desplazamiento a 45 grados y esquina, simulando recepción tras pase y tiro rápido con amortiguación de talón."
          },
          {
            title: "Tiro tras Bloqueo Indirecto",
            duration: "20 mins",
            sets: "4 series de 8 triples",
            description: "Rizo ofensivo y salida rápida sobre pantalla en poste bajo. Entrenamiento del equilibrio del tren inferior en el aire."
          },
          {
            title: "Lanzamientos tras Drible de Separación",
            duration: "18 mins",
            sets: "4 series de 10 tiros",
            description: "Paso atrás (Step-back) en suspensión tras finta de penetración corta con cambio de mano instantáneo."
          },
          {
            title: "Tiros Libres en Fatiga Extrema",
            duration: "12 mins",
            sets: "3 series de 10 tiros libres",
            description: "Lanzamientos desde el tiro libre tras esprintar la pista. Control respiratorio bajo alta fatiga competitiva."
          },
          {
            title: "Parada en 2 Tiempos y Elevación Rápida",
            duration: "15 mins",
            sets: "4 series de 12 tiros",
            description: "Ataque frontal rápido, parada estable en dos tiempos y tiro de media distancia elevando la bola en su punto más álgido."
          }
        ],
        bote: [
          {
            title: "Drible de Pistón Estacionario",
            duration: "10 mins",
            sets: "4 series de 45 seg",
            description: "Drible ultra-rápido abajo de la rodilla alternando mano dominante y no dominante a ritmo acelerado."
          },
          {
            title: "Crossover en Conos con Cambio de Ritmo",
            duration: "15 mins",
            sets: "5 series de un minuto",
            description: "Cambios de manos cruzados por delante, por la espalda y entrepiernas al pasar obstáculos imaginarios."
          },
          {
            title: "Doble In & Out con Ataque Explosivo",
            duration: "12 mins",
            sets: "4 series de 6 repeticiones",
            description: "Finta de drible hacia dentro y salida explosiva por fuera sin recoger el balón, destrozando la cadera de la defensa."
          },
          {
            title: "Bote Traslacional de Espaldas",
            duration: "15 mins",
            sets: "3 series de pista completa",
            description: "Bote defensivo de espaldas para proteger el esfero. Gran esfuerzo físico de flexión y empuje con cadera."
          },
          {
            title: "Combinación de Control Mamba Combo",
            duration: "12 mins",
            sets: "4 series de 1 minuto",
            description: "Encadenar sin pausa: bote cruzado, entrepierna y detrás de la espalda, elevando y ralentizando el ritmo alternadamente."
          },
          {
            title: "Manejo de Balón Virtual Ciego",
            duration: "10 mins",
            sets: "3 series de 90 segundos",
            description: "Botar el balón con dureza manteniendo la vista estrictamente levantada hacia los conos del coach sin mirar el esférico."
          }
        ],
        resistencia: [
          {
            title: "Sprint de Suicidio Linea-Linea",
            duration: "15 mins",
            sets: "4 series consecutivas",
            description: "Sprints encadenados tocando líneas de tiro libre, media pista y extremo contrario amortiguando pisada."
          },
          {
            title: "Intervalos de Carrera Estival",
            duration: "12 mins",
            sets: "3 series de 3 mins",
            description: "Trotar ligero 1 minuto alternando esprint de máxima potencia elástica durante 30 segundos continuos."
          },
          {
            title: "Defensa Sombra de Todo el Campo",
            duration: "15 mins",
            sets: "4 rondas de ida y vuelta",
            description: "Deslizamiento defensivo imitando la defensa presionante a un base en toda la longitud de la cancha."
          },
          {
            title: "Sprints de Caja en Diagonal",
            duration: "12 mins",
            sets: "4 series de 2 minutos",
            description: "Esprintar al cono en esquina, correr de espaldas al poste lateral, esprintar en diagonal y retroceder con agilidad."
          },
          {
            title: "Carrera Eléctrica de 17 Segundos",
            duration: "10 mins",
            sets: "5 repeticiones de sprint",
            description: "Cruzar la pista a lo ancho tocando las líneas el mayor número de veces antes del límite de 17 segundos cortos."
          },
          {
            title: "Intervalos de Saltos Reactivos HIIT",
            duration: "12 mins",
            sets: "3 series de 12 saltos + tiro",
            description: "Multisaltos explosivos pies juntos en el sitio seguidos inmediatamente por zancada y drible fuerte al lado."
          }
        ],
        agilidad: [
          {
            title: "Deslizamiento Lateral Defensivo",
            duration: "10 mins",
            sets: "4 series de 1 min",
            description: "Desplazamientos laterales bajos sin cruzar los pies, protegiendo rodillas y manteniendo los brazos extendidos."
          },
          {
            title: "Pliometría Saltos en Cruz",
            duration: "10 mins",
            sets: "3 series de 12 saltos",
            description: "Saltar con dos pies imitando los cuatro cuadrantes para entrenar frenado rápido y reactividad del tobillo."
          },
          {
            title: "Escalera de Agilidad: Doble Entrada",
            duration: "12 mins",
            sets: "5 pasadas completas",
            description: "Frecuencia de pies alta introduciendo ambos zapatos en cada intervalo de la escalera con braceo coordinado."
          },
          {
            title: "Juego de Espejo Reactivo con Pivotes",
            duration: "10 mins",
            sets: "4 series de 45 segundos",
            description: "Frenar en seco, pivotar sobre el pie retrasado y esprintar en sentido opuesto tras la señal visual externa."
          },
          {
            title: "Trabajo de Pies en el Poste Bajo",
            duration: "12 mins",
            sets: "3 series de 10 pivotes",
            description: "Trabajo de pies exquisito: reverso, finta de tiro (Up & Under) y canasta contraria protegiendo balón."
          },
          {
            title: "Agilidad en Estrella con Conos",
            duration: "15 mins",
            sets: "4 pasadas de circuito",
            description: "Moverse rápido desde el centro a 5 conos exteriores simulando el cierre de líneas de pase defensivas."
          }
        ],
        finalizaciones: [
          {
            title: "Mikan Drill Inteligente",
            duration: "10 mins",
            sets: "3 series de 20 aciertos",
            description: "Bandejas fluidas con rotación de muñeca bajo el aro alternando perfiles de derecha e izquierda continuamente."
          },
          {
            title: "Entrada Eurostep Exagerada",
            duration: "12 mins",
            sets: "4 series de 8 bandejas",
            description: "Drible frontal fuerte frenando en dos apoyos laterales contrarios para evadir tapones de pívots gigantes."
          },
          {
            title: "Bandeja tras Pérdida de Paso (Runner)",
            duration: "12 mins",
            sets: "4 series de 10 intentos",
            description: "Lanzar en un solo apoyo sorpresivo descolocando el tiempo de salto del bloqueador directo."
          },
          {
            title: "Finalización con Contacto Alto (Muro)",
            duration: "15 mins",
            sets: "5 series de 6 bandejas",
            description: "Entrar a canasta recibiendo choque controlado con escudo para entrenar el balance muscular aéreo."
          },
          {
            title: "Aro Pasado tras Penetración Inversa",
            duration: "10 mins",
            sets: "3 series de 10 canastas",
            description: "Penetración por línea de fondo, esquivando el tablero, y soltando un aro pasado sutil con efecto rotatorio."
          },
          {
            title: "Bandeja Flotante (Floater) en Parada",
            duration: "15 mins",
            sets: "4 series de 10 floáters",
            description: "Parada rápida a una mano a 3 metros del aro soltando el balón alto por encima de manos defensivas estiradas."
          }
        ],
        kobe: [
          {
            title: "Mentalidad Mamba: 100 Lanzamientos",
            duration: "25 mins",
            sets: "100 tiros con salto",
            description: "Tiros exigentes en suspensión media-larga tras sprintar. Demuestra resistencia pulmonar y control cortical."
          },
          {
            title: "Reto Kobe: 50 Triples Convertidos",
            duration: "30 mins",
            sets: "50 aciertos obligatorios",
            description: "Serie de triples alrededor de la línea de tres puntos. Cada fallo consecutivo resta un acierto del cómputo."
          },
          {
            title: "Aro Invencible: Tiros Libres Seguidos",
            duration: "15 mins",
            sets: "15 aciertos continuos",
            description: "Anotar 15 tiros libres seguidos. Si fallas uno solo, se inicia la cuenta desde cero para templar los nervios."
          },
          {
            title: "Entrenamiento de Pivote en Suspensión",
            duration: "20 mins",
            sets: "5 series de 8 canastas",
            description: "Simulador de tiros legendarios de Kobe Bryant: finta de reverso, pivote en el sitio y tiro sutil cayéndose hacia atrás (fadeaway)."
          },
          {
            title: "Kobe Footwork de Poste Medio",
            duration: "18 mins",
            sets: "4 series de 10 tiros",
            description: "Recibir balón de espaldas al aro, pivote y paso cruzado directo con suspensión rápida alineando hombros."
          },
          {
            title: "Resistencia Extrema con Tiro Final",
            duration: "20 mins",
            sets: "3 rondas completas",
            description: "Sprints defensivos por 45 segundos e inmediatamente ejecutar tiro de tres puntos ganando el partido virtual."
          }
        ]
      };

      const localWeeks: any[] = [];
      for (let w = 1; w <= activeWeeks; w++) {
        const localDays = activeDays.map((dayName, dayIdx) => {
          // Select drills based on the focus areas
          const dayDrills: any[] = [];
          
          activeCategories.forEach((cat, index) => {
            const list = drillDatabase[cat.toLowerCase()] || drillDatabase["tiro"];
            // INTELlIGENT VARIANCE FORMULA: Shift index based on week w and dayIdx recursively to ensure absolute diversity
            const listIndex = (index * 7 + w * 17 + dayIdx * 11) % list.length;
            const drillData = list[listIndex];
            
            // Generate progressive sets based on week
            const repsMultiplier = 1 + (w - 1) * 0.15;
            const setsNumber = parseInt(drillData.sets.match(/\d+/)?.[0] || "3", 10);
            const progressiveSets = Math.min(setsNumber + Math.floor((w - 1) / 2), 8);
            const progressiveSetsText = drillData.sets.replace(/\d+ series/g, `${progressiveSets} series`).replace(/\d+ rondas/g, `${progressiveSets} rondas`);

            const technicalFocusByWeek = [
              "Estabilidad básica y biomecánica pulcra",
              "Velocidad de ejecución y aceleración explosiva",
              "Ajuste defensivo sombra bajo presión pasiva",
              "Toma de decisiones rápidas ante fatiga cortical",
              "Resistencia de juego extendido avanzado",
              "Automatismo puro y mentalidad resolutiva instantánea"
            ][(w - 1) % 6];

            dayDrills.push({
              id: `${cat}_w${w}_idx${index}_d${dayIdx}`,
              title: `${drillData.title} (Fase ${w})`,
              category: cat.charAt(0).toUpperCase() + cat.slice(1),
              duration: drillData.duration,
              sets: progressiveSetsText,
              intensity: intensityLevel === "casual" ? "Casual / Rec" : intensityLevel === "elite" ? "Élite NCAA" : "Alta / Club",
              description: `${drillData.description} [Sección de Verano: Enfoque en ${technicalFocusByWeek}] 🔄 Progresión e Incremento de Dificultad (Evolución): Nivel avanzado con un estimado de ${Math.round(repsMultiplier * 100)}% de carga de volumen.`
            });
          });

          // Always add at least 3 drills per training day (fill with shooting/finishing if we didn't pick enough)
          while (dayDrills.length < 3) {
            const fillerCat = dayDrills.length % 2 === 0 ? "tiro" : "finalizaciones";
            const list = drillDatabase[fillerCat];
            const fillerIndex = (dayDrills.length * 5 + w * 13 + dayIdx * 7) % list.length;
            const drillData = list[fillerIndex];
            
            const technicalFocusByWeekFiller = [
              "Trabajo de pies estricto",
              "Desplazamiento explosivo",
              "Ajuste en el aire",
              "Fatiga controlada"
            ][(w - 1) % 4];

            dayDrills.push({
              id: `filler_w${w}_idx${dayDrills.length}_d${dayIdx}`,
              title: `${drillData.title} (Volumen Progresivo)`,
              category: fillerCat.charAt(0).toUpperCase() + fillerCat.slice(1),
              duration: drillData.duration,
              sets: drillData.sets,
              intensity: intensityLevel === "casual" ? "Casual / Rec" : intensityLevel === "elite" ? "Élite NCAA" : "Alta / Club",
              description: `${drillData.description} [Enfoque de apoyo: ${technicalFocusByWeekFiller}]`
            });
          }

          return {
            dayName,
            drills: dayDrills
          };
        });

        localWeeks.push({
          weekName: `Semana ${w}`,
          days: localDays
        });
      }

      const localPlan: any = {
        title: userName ? `Plan de Verano de ${userName}` : "Plan Personalizado de Contingencia",
        weeks: localWeeks
      };

      setTrainingPlan(localPlan);
      localStorage.setItem("hoops_cached_plan", JSON.stringify(localPlan));
      if (userName) {
        setPlayerPlans((prev) => {
          const next = { ...prev, [userName.toLowerCase()]: localPlan };
          localStorage.setItem("hoops_player_plans", JSON.stringify(next));
          // Sync with backend server
          fetch("/api/coach/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerName: userName, plan: localPlan })
          }).catch(err => console.warn("Failed to sync plan to server", err));
          return next;
        });
      }

      if (localWeeks.length > 0 && localWeeks[0].days.length > 0) {
        setSelectedDayTab(localWeeks[0].days[0].dayName);
      }

      setIsPlanSubmitted(false);
      setSubmittedToName("");

      addNotification(
        "📋 Plan Programado",
        `Plan de contingencia para U-${ageGroup} compilado localmente de forma ultra-rápida.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Synchronize queue when communication changes to Online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      triggerAutomaticSync();
    }
  }, [isOnline]);

  const triggerAutomaticSync = async () => {
    if (offlineQueue.length === 0 || isSyncing) return;
    setIsSyncing(true);
    addNotification(
      "🔄 Sincronizando datos...",
      `Enviando ${offlineQueue.length} ejecuciones guardadas sin conexión al servidor central.`
    );

    try {
      const response = await fetch("/api/leaderboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: userName,
          items: offlineQueue,
          completedDrillIds: completedDrillIds
        })
      });

      const data = await response.json();
      if (data.success) {
        // Sync points on client just to reflect updated DB stats
        setLeaderboard(data.leaderboard);
        if (data.updatedObjectives) {
          setObjectives(data.updatedObjectives);
        }

        addNotification(
          "✅ Sincronización exitosa",
          `¡Tu progreso offline se ha fusionado! Ganaste ${offlineQueue.reduce((acc, i) => acc + i.points, 0)} PTS de verano.`
        );

        // Clear queue
        setOfflineQueue([]);
      }
    } catch (e) {
      console.error("Hubo un error al sincronizar con el backend, reintentaremos luego.", e);
      addNotification(
        "⚡ Error de Sincronización",
        "El servidor está temporalmente inaccesible. Tu progreso sigue guardado de forma segura en tu dispositivo."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Helper helper to register notification logs
  const addNotification = (title: string, body: string) => {
    const newNotif: NotificationLog = {
      id: "not-" + Date.now(),
      title,
      body,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);
  };

  const handleVerifyPin = () => {
    if (enteredPin === "2026" || enteredPin.toLowerCase() === "grind" || enteredPin === "1234") {
      setIsPlayerViewMode(false);
      setShowCoachPinModal(false);
      setEnteredPin("");
      setPinError(null);
      addNotification("🔓 Modo Entrenador", "Has ingresado al panel completo del entrenador.");
    } else {
      setPinError("⚠️ Clave incorrecta. Inténtalo de nuevo.");
    }
  };

  const toggleDrillCompletion = (compositeKey: string, drillPoints: number, drillTitle: string) => {
    const currentlyCompleted = !!completedDrillIds[compositeKey];

    // Update visual checked state
    const nextStates = { ...completedDrillIds, [compositeKey]: !currentlyCompleted };
    setCompletedDrillIds(nextStates);

    if (!currentlyCompleted) {
      const newPoints = userPoints + drillPoints;
      const newCount = userDrillsCount + 1;
      setUserPoints(newPoints);
      setUserDrillsCount(newCount);

      const loggedItem: CompletedDrill = {
        id: "completed_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        dayName: compositeKey.split("_")[1] || "Día",
        drillId: compositeKey.split("_")[2] || "drillId",
        drillTitle,
        category: "tiro",
        points: drillPoints,
        completedAt: new Date().toISOString(),
        offline: !isOnline
      };

      if (isOnline) {
        sendDirectSync(loggedItem, nextStates);
      } else {
        setOfflineQueue((prev) => [...prev, loggedItem]);
        addNotification(
          "💾 Guardado Offline",
          `Drill "${drillTitle}" completado offline (+${drillPoints} PTS). Se sincronizará al recuperar señal.`
        );
      }
    } else {
      // Undo transition
      setUserPoints(Math.max(0, userPoints - drillPoints));
      setUserDrillsCount(Math.max(0, userDrillsCount - 1));
      addNotification("↩️ Ejercicio Desmarcado", `Se retiraron los puntos de "${drillTitle}".`);

      if (isOnline) {
        sendUndoSync(compositeKey, drillPoints, nextStates);
      }
    }
  };

  const sendDirectSync = async (completedItem: CompletedDrill, updatedDrillIdsMap?: Record<string, boolean>) => {
    try {
      const response = await fetch("/api/leaderboard/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: userName,
          items: [completedItem],
          completedDrillIds: updatedDrillIdsMap || completedDrillIds
        })
      });
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
        if (data.updatedObjectives) {
          setObjectives(data.updatedObjectives);
        }
        addNotification(
          "⭐️ ¡Progreso Registrado!",
          `Has completado el ejercicio "${completedItem.drillTitle}" (+${completedItem.points} PTS). ¡Sincronizado!`
        );
      }
    } catch (e) {
      setOfflineQueue((prev) => [...prev, completedItem]);
      addNotification(
        "💾 Caída de Red Detectada",
        `Fallo al conectar. El progreso de "${completedItem.drillTitle}" se resguardó en modo Offline.`
      );
    }
  };

  const sendUndoSync = async (compositeKey: string, drillPoints: number, updatedCompletedIds: Record<string, boolean>) => {
    try {
      const response = await fetch("/api/leaderboard/sync/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: userName,
          compositeKey,
          pointsToRemove: drillPoints,
          completedDrillIds: updatedCompletedIds
        })
      });
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.warn("Could not sync uncheck on server, retaining locally.", e);
    }
  };

  const handleCreateObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjDesc.trim()) return;

    const body = {
      description: newObjDesc,
      category: newObjCategory,
      badge: newObjBadge || undefined,
      assignedBy: `Coach ${userName.replace(" (Tú)", "") || "Principal"}`,
      targetCount: parseInt(newObjTarget, 10) || 10
    };

    if (!isOnline) {
      addNotification(
        "🚫 Acción Bloqueada",
        "Disculpa, debes estar Conectado en Línea para publicar nuevos objetivos globales."
      );
      return;
    }

    try {
      const response = await fetch("/api/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (data.success) {
        setObjectives(data.objectives);
        setNewObjDesc("");
        setNewObjBadge("");
        setNewObjCategory("tiro");
        setIsCreatingObjective(false);
        addNotification("📣 Nuevo Objetivo", `Se ha asignado el desafío: "${body.description}".`);
      }
    } catch (e) {
      console.error(e);
      addNotification("🚨 Error de Red", "No se pudo transmitir el objetivo al servidor.");
    }
  };

  const sendInstantReminder = () => {
    const alerts = [
      "Coach Miller: '¡No dejes que tu rival gane hoy! Pon a rodar tus pies en la cancha de entrenamiento.'",
      "Coach Miller: 'La autodisciplina en verano forja leyendas en invierno. Registra tus drills hoy.'",
      "Prep Coach USA: 'Recuerda hidratarte y realizar estiramientos intensos antes del test de resistencia.'"
    ];
    const pickedAlert = alerts[Math.floor(Math.random() * alerts.length)];
    addNotification("🔔 Alerta Diaria (Campamento)", pickedAlert);
  };

  const handleSendPlanToPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) {
      addNotification("⚠️ Error de Envío", "No se puede enviar un plan si no hay un jugador activo seleccionado.");
      return;
    }

    setIsPlanSubmitted(true);
    setSubmittedToName(userName);

    setLeaderboard((prev) => {
      const updated = prev.map((p) => {
        if (p.name.toLowerCase() === userName.toLowerCase()) {
          const np = p.points + 50;
          setUserPoints(np);
          return {
            ...p,
            points: np,
            lastActive: "Envió plan"
          };
        }
        return p;
      });
      const exists = updated.some((p) => p.name.toLowerCase() === userName.toLowerCase());
      if (!exists) {
        updated.push({
          id: "p_" + Date.now(),
          name: userName,
          avatar: "🏀",
          points: 50,
          drillsCompleted: 0,
          lastActive: "Plan asignado"
        });
        setUserPoints(50);
      }
      return updated.sort((a, b) => b.points - a.points);
    });

    addNotification(
      "📨 Plan Asignado y Guardado",
      `¡Plan guardado con éxito! Se ha asignado a ${userName} usando ${submitMedium} (${destAddress || "Alerta de Dispositivo"}).`
    );
  };

  const handleAddPlayer = async (name: string, avatar: string, points: number, drillsCompleted: number) => {
    const newPlayerTemp: LeaderboardPlayer = {
      id: "p_temp_" + Date.now(),
      name,
      avatar,
      points,
      drillsCompleted,
      lastActive: "¡Justo ahora!"
    };

    setLeaderboard((prev) => [...prev, newPlayerTemp].sort((a, b) => b.points - a.points));
    addNotification("👤 Nuevo jugador registrado", `Se ha añadido a ${name} con ${points} PTS.`);

    setUserName(name);
    setUserPoints(points);
    setUserDrillsCount(drillsCompleted);
    setActiveTab("profiles");

    try {
      const res = await fetch("/api/leaderboard/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar, points, drillsCompleted })
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.warn("Could not save new player on the server, retaining in local state.", e);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    const playerToDelete = leaderboard.find(p => p.id === playerId);
    const deletedName = playerToDelete ? playerToDelete.name : "Jugador";

    setLeaderboard((prev) => prev.filter((p) => p.id !== playerId));
    addNotification("👤 Jugador eliminado", `Se ha eliminado a ${deletedName} de la academia.`);

    // If active player is deleted, reset the active focus
    if (playerToDelete && userName.toLowerCase() === playerToDelete.name.toLowerCase()) {
      setUserName("");
      setUserPoints(0);
      setUserDrillsCount(0);
      setTrainingPlan(null);
    }

    try {
      const res = await fetch(`/api/leaderboard/player/${playerId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.warn("Could not delete player from server, removed locally only.", e);
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category ? category.toLowerCase() : "") {
      case "tiro":
        return { bg: "bg-red-50 text-red-650 border-red-200/60", badge: "🎯 TIRO" };
      case "bote":
        return { bg: "bg-rose-50 text-rose-650 border-rose-200/60", badge: "🏀 BOTE" };
      case "agilidad":
        return { bg: "bg-amber-50 text-amber-650 border-amber-200/60", badge: "⚡ AGILIDAD" };
      case "resistencia":
        return { bg: "bg-blue-50 text-blue-650 border-blue-200/60", badge: "🏃 RESI" };
      case "finalizaciones":
        return { bg: "bg-emerald-50 text-emerald-650 border-emerald-200/60", badge: "🔥 FINALES" };
      case "kobe":
        return { bg: "bg-purple-50 text-purple-750 border-purple-200/60", badge: "🐍 KOBE MAMBA" };
      default:
        return { bg: "bg-slate-50 text-slate-505 border-slate-205", badge: "🏀 DRILL" };
    }
  };

  const totalDrillsInPlan = trainingPlan && trainingPlan.weeks
    ? trainingPlan.weeks.reduce((acc, w) => acc + w.days.reduce((sum, d) => sum + d.drills.length, 0), 0)
    : 0;
  const completedDrillsInPlanCount = trainingPlan && trainingPlan.weeks
    ? trainingPlan.weeks.reduce((acc, w) => {
        return acc + w.days.reduce((sum, d) => {
          return sum + d.drills.filter((dr) => !!completedDrillIds[`${w.weekName}_${d.dayName}_${dr.id}`]).length;
        }, 0);
      }, 0)
    : 0;
  const completionPercentage = totalDrillsInPlan > 0 ? Math.round((completedDrillsInPlanCount / totalDrillsInPlan) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col font-sans overflow-x-hidden text-slate-900">
      {/* 1. Offline & Sync Bar Widget */}
      <ConnectivityStatus
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        offlineQueueLength={offlineQueue.length}
        onManualSync={triggerAutomaticSync}
        isSyncing={isSyncing}
      />

      {/* 2. Header component matching standard styling details */}
      <header className="bg-slate-900 px-6 py-4 md:px-8 md:py-5 flex flex-col md:flex-row items-center justify-between text-white shadow-lg shrink-0 gap-4" id="id-app-header">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="bg-slate-950 p-1 rounded-2xl flex items-center justify-center shadow-lg text-white border border-slate-800 shrink-0 overflow-hidden w-16 h-16">
            <img 
              src={logoUrl} 
              alt="Pinetys Grind Logo" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase leading-none text-white">
              Pinetys Grind
            </h1>
            <p className="text-xs md:text-sm font-bold text-orange-500 uppercase tracking-widest mt-1">
              Planes de Baloncesto de Verano • Rutinas Prep School USA
            </p>
          </div>
        </div>

        {/* User profile inside header details */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold opacity-80 uppercase text-slate-400">JUGADOR DE ENFOQUE</p>
            <p className="text-sm font-black whitespace-nowrap text-orange-400">{userName || "Ninguno Seleccionado"}</p>
          </div>
          <div 
            onClick={() => {
              if (isPlayerViewMode) {
                setShowCoachPinModal(true);
              }
            }}
            title={isPlayerViewMode ? "Acceso Coach (Clave)" : "Modo Administrador Activo"}
            className={`flex items-center gap-3 bg-white/10 p-1.5 pr-4 rounded-full border border-white/20 shadow-inner select-none transition-all ${
              isPlayerViewMode ? "cursor-pointer hover:bg-white/15" : ""
            }`}
          >
            <div className={`w-10 h-10 rounded-full bg-[#FF6B00]/90 border-2 border-white flex items-center justify-center font-black text-white shadow transition-all ${
              isPlayerViewMode ? "hover:scale-[1.03] active:scale-[0.97]" : ""
            }`}>
              {userName ? userName.substring(0, 2).toUpperCase() : "?"}
            </div>
            <div className="leading-none sm:hidden">
              <p className="text-sm font-bold">{userName || "Ningun Jugador"}</p>
              <p className="text-[9px] opacity-80 uppercase text-slate-400 font-sans">Pinetys Grind App</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2.5 Navigation Bar */}
      {!isPlayerLocked && (
        <div className="bg-slate-900 border-t border-b border-slate-800 shrink-0 select-none">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex gap-1 w-full sm:w-auto overflow-x-auto">
              {!isPlayerViewMode && (
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  id="id-tab-leaderboard-view"
                  className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === "leaderboard"
                      ? "border-[#FF6B00] text-white font-black bg-white/5"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Trophy className="w-4 h-4 text-[#FF6B00]" />
                  Clasificaciones (Página Principal)
                </button>
              )}
              <button
                onClick={() => setActiveTab("profiles")}
                id="id-tab-profiles-view"
                className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === "profiles" || isPlayerViewMode
                    ? "border-[#FF6B00] text-white font-black bg-white/5"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                <User className="w-4 h-4 text-[#FF6B00]" />
                {isPlayerViewMode ? "📱 Mi Libreta Diaria" : "Perfil de Jugador"} {userName && <span className="ml-1 bg-[#FF6B00]/90 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">{userName}</span>}
              </button>
            </div>

            {/* Player View Mode Toggle Switch */}
            {!isPlayerViewMode && (
              <div className="py-2.5 sm:py-0 w-full sm:w-auto flex items-center justify-end">
                <button
                  onClick={() => {
                    setIsPlayerViewMode(true);
                    setActiveTab("profiles");
                  }}
                  type="button"
                  className="bg-slate-800 text-slate-400 border border-slate-700 hover:text-white px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 leading-none"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  📋 ACTIVAR MODO JUGADOR
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "leaderboard" ? (
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div id="id-navigation-leaderboard-centered">
            <Leaderboard
              players={leaderboard}
              userPoints={userPoints}
              userDrillsCompleted={userDrillsCount}
              userName={userName}
              onChangeName={setUserName}
              isOnline={isOnline}
              onAddPlayer={handleAddPlayer}
              onSelectPlayer={(name, points, drillsCompleted) => {
                handleSelectPlayer(name, points, drillsCompleted);
                setActiveTab("profiles");
              }}
              onDeletePlayer={handleDeletePlayer}
              completedDrillIds={completedDrillIds}
              playerPlans={playerPlans}
              trainingPlan={trainingPlan}
              isPlayerViewMode={isPlayerViewMode}
            />
          </div>
        </main>
      ) : (
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
          {!userName ? (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
              <div className="text-center max-w-xl mx-auto mb-2">
                <h2 className="text-xl md:text-2xl font-black uppercase text-slate-800 tracking-tight flex justify-center items-center gap-2 leading-none">
                  👤 Directorio de Jugadores Creados
                </h2>
                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed font-sans">
                  Selecciona uno de los jugadores creados de forma manual para entrar a su perfil individual y comenzar a planificar su verano con entrenamientos avanzados.
                </p>
              </div>

              {leaderboard.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-[32px] p-12 text-center shadow-xs">
                  <span className="text-3xl">👟</span>
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight mt-3">
                    {isPlayerViewMode ? "No hay jugadores registrados" : "Aún no has creado ningún jugador"}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal font-sans">
                    {isPlayerViewMode 
                      ? "Pídele a tu entrenador que te registre en el sistema para poder llevar el control de tus entrenamientos de baloncesto."
                      : "Regresa a la pestaña de la Página Principal para registrar a tus jugadores manualmente en el ranking del campamento."
                    }
                  </p>
                  {!isPlayerViewMode && (
                    <button
                      onClick={() => setActiveTab("leaderboard")}
                      className="mt-4 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer shadow-sm transition-colors"
                    >
                      Crear Primer Jugador
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaderboard.map((p) => {
                    const isCurrent = userName && p.name.toLowerCase() === userName.toLowerCase();
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPlayer(p.name, p.points, p.drillsCompleted)}
                        className={`bg-white border rounded-3xl p-5 hover:border-[#FF6B00] transition-colors cursor-pointer flex flex-col justify-between group ${
                          isCurrent ? "ring-2 ring-orange-500/30 border-[#FF6B00]" : "border-slate-200 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-100 text-3xl w-14 h-14 rounded-full flex items-center justify-center border border-slate-200 shadow-inner shrink-0">
                            {p.avatar || "🏀"}
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase text-slate-900 flex items-center gap-1.5 leading-none">
                              {p.name}
                              {isCurrent && (
                                <span className="text-[8px] bg-[#FF6B00] text-slate-900 font-extrabold uppercase px-1.5 py-0.5 rounded leading-none font-sans">
                                  Seleccionado
                                </span>
                              )}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mt-1.5 font-sans">Campamento de Verano Prep</p>
                            <div className="flex gap-2 mt-2 select-none">
                              <span className="bg-orange-50 text-[#FF6B00] border border-orange-100 text-[9px] px-2 py-0.5 rounded font-black uppercase leading-none font-mono">
                                {p.points} pts
                              </span>
                              <span className="bg-slate-50 text-slate-500 border border-slate-100 text-[9px] px-2 py-0.5 rounded font-black uppercase leading-none font-mono">
                                {p.drillsCompleted} drills
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[9px] text-slate-400 font-mono font-bold">Último logro: {p.lastActive || "Pendiente"}</span>
                          <span
                            className="bg-slate-150 text-slate-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all group-hover:bg-[#FF6B00] group-hover:text-white"
                          >
                            {isPlayerViewMode ? "Ver Mi Libreta" : "Diseñar Plan"} <ChevronRight className="w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <PlayerProfileWorkspace
              userName={userName}
              setUserName={setUserName}
              userPoints={userPoints}
              userDrillsCount={userDrillsCount}
              leaderboard={leaderboard}
              ageGroup={ageGroup}
              setAgeGroup={setAgeGroup}
              selectedDays={selectedDays}
              handleToggleDaySelection={handleToggleDaySelection}
              focusAreas={focusAreas}
              sessionDurationHours={sessionDurationHours}
              setSessionDurationHours={setSessionDurationHours}
              weeksCount={weeksCount}
              setWeeksCount={setWeeksCount}
              playerRole={playerRole}
              setPlayerRole={setPlayerRole}
              trainingMode={trainingMode}
              setTrainingMode={setTrainingMode}
              intensityLevel={intensityLevel}
              setIntensityLevel={setIntensityLevel}
              isGenerating={isGenerating}
              generatePlan={generatePlan}
              trainingPlan={trainingPlan}
              completionPercentage={completionPercentage}
              isPlanSubmitted={isPlanSubmitted}
              submittedToName={submittedToName}
              submitMedium={submitMedium}
              setSubmitMedium={setSubmitMedium}
              destAddress={destAddress}
              setDestAddress={setDestAddress}
              handleSendPlanToPlayer={handleSendPlanToPlayer}
              selectedDayTab={selectedDayTab}
              setSelectedDayTab={setSelectedDayTab}
              completedDrillIds={completedDrillIds}
              toggleDrillCompletion={toggleDrillCompletion}
              getCategoryTheme={getCategoryTheme}
              AVAILABLE_RETOS={AVAILABLE_RETOS}
              handleCompleteChallenge={handleCompleteChallenge}
              isCreatingObjective={isCreatingObjective}
              setIsCreatingObjective={setIsCreatingObjective}
              newObjDesc={newObjDesc}
              setNewObjDesc={setNewObjDesc}
              newObjCategory={newObjCategory}
              setNewObjCategory={setNewObjCategory}
              newObjBadge={newObjBadge}
              setNewObjBadge={setNewObjBadge}
              newObjTarget={newObjTarget}
              setNewObjTarget={setNewObjTarget}
              handleCreateObjective={handleCreateObjective}
              sendInstantReminder={sendInstantReminder}
              notifications={notifications}
              addNotification={addNotification}
              setActiveTab={setActiveTab}
              objectives={objectives}
              WEEKLY_RETOS={WEEKLY_RETOS}
              isPlayerViewMode={isPlayerViewMode}
            />
          )}
        </main>
      )}

      {/* 4. Bottom Tab Bar inspired by original theme design */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400 shrink-0 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-[#FF6B00] text-black w-6 h-6 rounded-lg flex items-center justify-center font-black">
              H
            </span>
            <span className="font-bold text-white uppercase tracking-wider">HOOPS PRO SUMMER CAMPS</span>
          </div>
          <div className="flex items-center gap-3">
            <p>© 2026 USA Prep Academy. Diseñado para entrenamientos de baloncesto de alto rendimiento en verano.</p>
            {isPlayerViewMode && (
              <button
                onClick={() => setShowCoachPinModal(true)}
                className="text-slate-600 hover:text-slate-400 p-1.5 rounded-full transition-colors cursor-pointer"
                title="Acceso Entrenador"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* 5. Password/PIN modal to unlock Coach Mode */}
      {showCoachPinModal && (
        <div id="id-coach-pin-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-white border border-slate-200 rounded-[32px] max-w-sm w-full p-6 text-center shadow-2xl relative space-y-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto text-[#FF6B00]">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-slate-800 tracking-tight">Acceso Exclusivo de Entrenadores</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-sans">
                Para salir del Modo Jugador y acceder a las herramientas de planificación y registro, introduce la clave de entrenador.
              </p>
            </div>
            <div className="space-y-1.5">
              <input
                type="password"
                placeholder="Introducir Clave (Ej: 2026)"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyPin();
                  }
                }}
                className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-center text-sm font-black text-slate-800 tracking-widest focus:outline-none focus:border-orange-500 leading-normal"
                autoFocus
              />
              {pinError && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">
                  {pinError}
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCoachPinModal(false);
                  setEnteredPin("");
                  setPinError(null);
                }}
                className="flex-1 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl py-2 px-3 text-xs font-black uppercase tracking-wider cursor-pointer border-none"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleVerifyPin}
                className="flex-1 bg-[#FF6B00] hover:bg-[#e45a00] text-white rounded-xl py-2 px-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-xs border-none"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
