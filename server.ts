import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("Waring: GEMINI_API_KEY is not defined in environment variables. Gemini features will use standard offline fallbacks.");
}

app.use(express.json());

// In-Memory Database for Leaderboard and Objectives
// Seed some realistic compañero teammate performance for the leaderboard
interface LeaderboardPlayer {
  id: string;
  name: string;
  avatar: string;
  points: number;
  drillsCompleted: number;
  lastActive: string;
  completedDrills?: Record<string, boolean>;
}

let leaderboard: LeaderboardPlayer[] = [];
let coachPlayerPlans: Record<string, any> = {};

interface CustomObjective {
  id: string;
  playerTarget: string; // "Todos" or individual name
  description: string;
  category: string; // tiro, bote, agilidad, resistencia
  badge: string;
  assignedBy: string;
  targetCount: number;
  currentCount: number;
  deadline: string;
}

let objectives: CustomObjective[] = [
  {
    id: "obj1",
    playerTarget: "Todos",
    description: "Completar 100 tiros libres anotados en total en Rutina de Tiro de Stephen Curry",
    category: "tiro",
    badge: "Francotirador de Verano",
    assignedBy: "Coach Miller (USA Academy)",
    targetCount: 100,
    currentCount: 40,
    deadline: "2026-06-15"
  },
  {
    id: "obj2",
    playerTarget: "Todos",
    description: "Mantener una racha del calendario de 5 días seguidos de bote a toda velocidad",
    category: "bote",
    badge: "Rey del Crossover",
    assignedBy: "Coach Miller (USA Academy)",
    targetCount: 5,
    currentCount: 2,
    deadline: "2026-06-20"
  },
  {
    id: "obj3",
    playerTarget: "Todos",
    description: "Dominar la Resistencia con el Test de Suicidios de 17 tramos en menos de 55 segundos",
    category: "resistencia",
    badge: "Motor Incombustible",
    assignedBy: "Coach Miller (USA Academy)",
    targetCount: 1,
    currentCount: 0,
    deadline: "2026-06-25"
  }
];

// Firebase Firestore persistent cloud storage
const DATA_DIR = path.join(process.cwd(), "data");
const LEADERBOARD_FILE = path.join(DATA_DIR, "leaderboard.json");
const PLANS_FILE = path.join(DATA_DIR, "coachPlayerPlans.json");
const OBJECTIVES_FILE = path.join(DATA_DIR, "objectives.json");

let db: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    db = getFirestore(firebaseApp, config.firestoreDatabaseId);
    console.log("Firebase Firestore initialized with custom database ID:", config.firestoreDatabaseId);
  } else {
    console.warn("firebase-applet-config.json not found, using memory/local backups");
  }
} catch (error) {
  console.error("Failed to initialize Firebase SDK:", error);
}

async function loadData() {
  try {
    if (db) {
      console.log("Fetching persistent data from Cloud Firestore...");
      const leaderboardDoc = await getDoc(doc(db, "app_data", "leaderboard"));
      if (leaderboardDoc.exists()) {
        leaderboard = leaderboardDoc.data().players || [];
        console.log(`Loaded ${leaderboard.length} players from Firestore.`);
      }
      
      const plansDoc = await getDoc(doc(db, "app_data", "plans"));
      if (plansDoc.exists()) {
        coachPlayerPlans = plansDoc.data().coachPlayerPlans || {};
        console.log(`Loaded ${Object.keys(coachPlayerPlans).length} player plans from Firestore.`);
      }
      
      const objectivesDoc = await getDoc(doc(db, "app_data", "objectives"));
      if (objectivesDoc.exists()) {
        objectives = objectivesDoc.data().objectives || [];
        console.log(`Loaded ${objectives.length} custom objectives from Firestore.`);
      }
    }
  } catch (err) {
    console.error("Error loading persisted data from Firestore, checking local backups...", err);
  }

  // Dual-shield backup: load from local files if memory lists are still empty
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (leaderboard.length === 0 && fs.existsSync(LEADERBOARD_FILE)) {
      leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, "utf-8"));
      console.log(`Loaded ${leaderboard.length} players from local backup.`);
    }
    if (Object.keys(coachPlayerPlans).length === 0 && fs.existsSync(PLANS_FILE)) {
      coachPlayerPlans = JSON.parse(fs.readFileSync(PLANS_FILE, "utf-8"));
      console.log(`Loaded ${Object.keys(coachPlayerPlans).length} player plans from local backup.`);
    }
    if (objectives.length <= 3 && fs.existsSync(OBJECTIVES_FILE)) {
      const localObjectives = JSON.parse(fs.readFileSync(OBJECTIVES_FILE, "utf-8"));
      if (localObjectives.length > 0) {
        objectives = localObjectives;
        console.log(`Loaded ${objectives.length} custom objectives from local backup.`);
      }
    }
  } catch (err) {
    console.error("Error loading local backup files:", err);
  }
}

async function saveData() {
  // 1. Immediately write to local file as an instant fail-safe
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
    fs.writeFileSync(PLANS_FILE, JSON.stringify(coachPlayerPlans, null, 2));
    fs.writeFileSync(OBJECTIVES_FILE, JSON.stringify(objectives, null, 2));
    console.log("Local filesystem backups updated.");
  } catch (err) {
    console.error("Error saving local backups:", err);
  }

  // 2. Sync to Cloud Firestore asynchronously (no block on main thread)
  if (db) {
    try {
      await setDoc(doc(db, "app_data", "leaderboard"), { players: leaderboard });
      await setDoc(doc(db, "app_data", "plans"), { coachPlayerPlans: coachPlayerPlans });
      await setDoc(doc(db, "app_data", "objectives"), { objectives: objectives });
      console.log("Persistent Cloud Firestore successfully updated!");
    } catch (err) {
      console.error("Failed to sync data to Cloud Firestore:", err);
    }
  }
}

// Fallback plans in case GEMINI_API_KEY is not defined or fails, using authentic American basketball drills!
const MOCK_PLANS: Record<string, any> = {
  default: {
    title: "Plan de Desarrollo de Destrezas Elite (American Prep Style)",
    description: "Rutinas clásicas inspiradas en colegios secundarios de EE.UU. (Prep Schools) destinadas a forjar un juego completo de tiro, bote, agilidad y resistencia durante el verano.",
    recommendedWeeklyHours: 6,
    days: [
      {
        theme: "Dominio Tecnológico y Trabajo de Canasta",
        drills: [
          {
            id: "fb-d1",
            title: "Mikan Drill Clásico",
            category: "finalizaciones",
            description: "Terminación progresiva debajo del aro alternando manos con pivoteos rápidos y saltos explosivos sin bajar el balón abajo del mentón para máxima eficiencia.",
            durationMinutes: 10,
            intensity: "Media",
            targetReps: "40 encestes seguidos",
            assignedObjective: "Trabajar la flexión rápida al recibir."
          },
          {
            id: "fb-d2",
            title: "Stephen Curry: '100-Make Challenge'",
            category: "tiro",
            description: "Esprinta de esquina a ala, recibe, planta los pies con fuerza y tira. Repite hasta lograr 100 tiros anotados desde 5 puntos clave de media distancia.",
            durationMinutes: 15,
            intensity: "Alta",
            targetReps: "Anotar 100 tiros de media distancia",
            assignedObjective: "Mantener el codo alto y alineación perfecta al cansar."
          },
          {
            id: "fb-d3",
            title: "Agility Pivot Ladder Drill",
            category: "agilidad",
            description: "Trabajo coordinado en conos simulando el legendario pivotaje en reverso y fintas rápidas. Pivota sobre el pie de apoyo de manera explosiva y haz finta de tiro.",
            durationMinutes: 10,
            intensity: "Alta",
            targetReps: "10 rondas de juego de pies perfecto",
            assignedObjective: "Mantener centro de gravedad bajo y el pie de pivote fijo."
          }
        ]
      },
      {
        dayName: "Miércoles",
        theme: "Bote de Control y Resistencia Extrema",
        drills: [
          {
            id: "fb-d4",
            title: "Kyrie Irving Handle Challenge",
            category: "bote",
            description: "Dribbles de control ultra-bajos buscando la máxima velocidad. Alterna crossover rápido con simulación de tiro en suspensión de manera súbita e inmediata.",
            durationMinutes: 15,
            intensity: "Alta",
            targetReps: "4 minutos por mano sin interrupción",
            assignedObjective: "Bote explosivo y vista al frente para leer defensas."
          },
          {
            id: "fb-d5",
            title: "Full-Court Suicide Burner",
            category: "resistencia",
            description: "Tradicional acondicionamiento extremo: Corre ida y vuelta a 3 puntos distintos de la cancha (tiro libre, triple opuesto, cancha completa) repitiendo 6 veces bajo presión de tiempo.",
            durationMinutes: 12,
            intensity: "Alta",
            targetReps: "6 series completas de ida y vuelta",
            assignedObjective: "Esprintar al 100% incluso bajo máxima fatiga muscular."
          },
          {
            id: "fb-d-k1",
            title: "Kobe's Sunset Elbo-to-Elbo Shooting",
            category: "kobe",
            description: "Acondicionamiento Mamba real: muévete continuamente entre los codos de la zona, frena en suspensión y tira tras recibir un pase rápido. Sigue durante el tiempo estipulado.",
            durationMinutes: 15,
            intensity: "Alta",
            targetReps: "Anotar 25 suspensiones desde el codo",
            assignedObjective: "Ejercitar la mentalidad inquebrantable de Kobe en fatiga."
          }
        ]
      },
      {
        dayName: "Viernes",
        theme: "Tiro Suspendido de Media Pista y Agilidad de Piernas",
        drills: [
          {
            id: "fb-d6",
            title: "Signature Elbow-to-Elbow Jumper",
            category: "tiro",
            description: "Recibe en el poste alto, finta la penetración lateral, realiza un paso hacia atrás con pivotaje inverso para suspenderte en el aire con un tiro clásico de alta parábola.",
            durationMinutes: 15,
            intensity: "Alta",
            targetReps: "20 triples anotados",
            assignedObjective: "Elevación perpendicular óptima y suspensión perfecta."
          },
          {
            id: "fb-d7",
            title: "Lateral Shuffle Reaction Drill",
            category: "agilidad",
            description: "Acondicionamiento defensivo de pies, esprintando del poste al perímetro, deslizamiento lateral a máxima velocidad baja, y tapón defensivo explosivo.",
            durationMinutes: 10,
            intensity: "Alta",
            targetReps: "8 repeticiones fluidas e intensas",
            assignedObjective: "Mantener brazos activos y no cruzar nunca los tobillos."
          },
          {
            id: "fb-d-k2",
            title: "Kobe Bryant 100-Make Challenge",
            category: "kobe",
            description: "Haz esprint de esquina a ala, frena en seco simulando marca defensiva férrea y encesta con un fadeaway de Kobe. Acaba cuando logres el objetivo de acierto.",
            durationMinutes: 15,
            intensity: "Alta",
            targetReps: "100 canastas totales con saltos exigentes",
            assignedObjective: "Forjar juego de pies perfecto bajo presión."
          }
        ]
      }
    ]
  }
};

// GET Objectives API
app.get("/api/objectives", (req, res) => {
  res.json({ success: true, objectives });
});

// POST Objective API (Allows coaches to assign a new objective)
app.post("/api/objectives", (req, res) => {
  const { description, category, badge, assignedBy, targetCount } = req.body;
  if (!description || !category || !targetCount) {
    return res.status(400).json({ success: false, error: "Faltan campos obligatorios para el objetivo" });
  }

  const newObjective: CustomObjective = {
    id: "obj_" + Date.now(),
    playerTarget: "Todos",
    description,
    category,
    badge: badge || "Insignia Personalizada",
    assignedBy: assignedBy || "Entrenador Invitado",
    targetCount: Number(targetCount),
    currentCount: 0,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 15 días plazo
  };

  objectives.unshift(newObjective);
  saveData();
  res.json({ success: true, objectives });
});

// POST Create manual player API
app.post("/api/leaderboard/player", (req, res) => {
  const { name, avatar, points, drillsCompleted } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, error: "El nombre del jugador es requerido." });
  }

  const newPlayer: LeaderboardPlayer = {
    id: "p_" + Date.now(),
    name: name.trim(),
    avatar: avatar || "🏀",
    points: points !== undefined ? Number(points) : 0,
    drillsCompleted: drillsCompleted !== undefined ? Number(drillsCompleted) : 0,
    lastActive: "¡Justo ahora!"
  };

  leaderboard.push(newPlayer);
  saveData();
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});

// GET Leaderboard API
app.get("/api/leaderboard", (req, res) => {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});

// DELETE player endpoint
app.delete("/api/leaderboard/player/:id", (req, res) => {
  const { id } = req.params;
  leaderboard = leaderboard.filter(p => p.id !== id);
  saveData();
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});

// POST Restore complete leaderboard from client backup
app.post("/api/leaderboard/restore", (req, res) => {
  const { leaderboard: restoredLeaderboard } = req.body;
  if (Array.isArray(restoredLeaderboard) && restoredLeaderboard.length > 0) {
    leaderboard = restoredLeaderboard;
    saveData();
  }
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});

// POST Sync Points / Exercises API (Handles offline queuing syncs)
app.post("/api/leaderboard/sync", (req, res) => {
  const { playerName, items, completedDrillIds } = req.body;
  // items is an array of completed drills, e.g. [{ drillId: string, drillTitle: string, points: 20 }]
  if (!playerName || !items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, error: "Datos de sincronización inválidos." });
  }

  // Find or create player on leaderboard
  let p = leaderboard.find(player => player.name.toLowerCase() === playerName.toLowerCase());
  
  const pointsGained = items.reduce((acc: number, item: any) => acc + (item.points || 15), 0);
  const drillsGained = items.length;

  if (p) {
    p.points += pointsGained;
    p.drillsCompleted += drillsGained;
    p.lastActive = "¡Justo ahora!";
    if (completedDrillIds) {
      p.completedDrills = {
        ...(p.completedDrills || {}),
        ...completedDrillIds
      };
    }
  } else {
    // Add new user to the leaderboard
    p = {
      id: "p_" + Date.now(),
      name: playerName,
      avatar: "⭐",
      points: 150 + pointsGained, // base 150 + synced points
      drillsCompleted: 5 + drillsGained,
      lastActive: "¡Justo ahora!",
      completedDrills: completedDrillIds || {}
    };
    leaderboard.push(p);
  }

  // Also increment corresponding objectives current counts to show progress syncing!
  items.forEach((item: any) => {
    const category = item.category || "tiro";
    objectives.forEach(obj => {
      if (obj.category === category && obj.currentCount < obj.targetCount) {
        obj.currentCount += 1;
      }
    });
  });

  saveData();
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard, syncedPoints: pointsGained, updatedObjectives: objectives });
});

// POST Sync Undo API (Handles unselecting a drill)
app.post("/api/leaderboard/sync/undo", (req, res) => {
  const { playerName, compositeKey, pointsToRemove, completedDrillIds } = req.body;
  if (!playerName) {
    return res.status(400).json({ success: false, error: "Datos de sincronización inválidos." });
  }

  let p = leaderboard.find(player => player.name.toLowerCase() === playerName.toLowerCase());
  if (p) {
    p.points = Math.max(0, p.points - (pointsToRemove || 15));
    p.drillsCompleted = Math.max(0, p.drillsCompleted - 1);
    p.lastActive = "¡Justo ahora!";
    if (completedDrillIds) {
      p.completedDrills = completedDrillIds;
    }
  }

  saveData();
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);
  res.json({ success: true, leaderboard: sortedLeaderboard });
});

// GET Coach Plans (Saves and synchronizes coach plans across devices)
app.get("/api/coach/plans", (req, res) => {
  res.json({ success: true, plans: coachPlayerPlans });
});

// POST Coach Plan for single player
app.post("/api/coach/plan", (req, res) => {
  const { playerName, plan } = req.body;
  if (playerName && plan) {
    coachPlayerPlans[playerName.toLowerCase()] = plan;
  }
  saveData();
  res.json({ success: true, plans: coachPlayerPlans });
});

// POST Batch Sync Coach Plans (Used to merge local storage plans to server on first connection)
app.post("/api/coach/plans/sync", (req, res) => {
  const { plans } = req.body;
  if (plans && typeof plans === "object") {
    coachPlayerPlans = {
      ...coachPlayerPlans,
      ...plans
    };
  }
  saveData();
  res.json({ success: true, plans: coachPlayerPlans });
});

app.post("/api/plan/generate", async (req, res) => {
  const { 
    ageGroup, 
    daysOfWeek, 
    focusAreas, 
    sessionDurationHours, 
    customPrompt,
    weeksCount,
    playerRole,
    trainingMode,
    intensityLevel
  } = req.body;

  if (!ageGroup || !daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
    return res.status(400).json({ success: false, error: "Se requieren edad de jugadores y al menos un día asignado." });
  }

  const selectedFocus = focusAreas && Array.isArray(focusAreas) && focusAreas.length > 0 
    ? focusAreas.join(", ") 
    : "tiro, bote, agilidad, resistencia física y finalizaciones";

  const durationHours = sessionDurationHours ? Number(sessionDurationHours) : 2;
  const numWeeks = weeksCount ? Number(weeksCount) : 4;

  const roleText = playerRole === "shooter" ? "Enfoque Francotirador (Tiro, Catch & Shoot, Salidas de bloqueos)"
    : playerRole === "guard" ? "Desarrollo de Base / Escolta (Manejo de balón, pick & roll y creación de juego estilo NBA/NCAA)"
    : playerRole === "big" ? "Juego de Poste / Pivote (Pivoteos, ganchos, rebote y mikan drill avanzado)"
    : "Equilibrado Todoterreno (Completo, todas las facetas)";

  const modeText = trainingMode === "duo"
    ? "Entrenamiento en Compañero / Con Pasador (drills asistidos con alimentación de pase o defensa ligera)"
    : "Entrenamiento Individual (diseñado para un solo jugador con un balón y la pista)";

  const intensityText = intensityLevel === "casual" ? "Intensidad Recreativa (Fundamentos relajados y mecánica de tiro fluida)"
    : intensityLevel === "elite" ? "Intensidad Élite Prep / NCAA (Ritmo infernal con fatiga acumulada y metas de acierto altas)"
    : "Intensidad Competitiva Club (Nivel de entrenamiento de cantera formal)";

  const systemPrompt = `You are an expert American Basketball Coach specializing in summer development camps and Prep School training logic (NCAA / NBA skills trainer standard).
You speak fluent Spanish with an authentic, encouraging coaching tone.
Always adapt the training plan's drills and vocabulary strictly to the physical and cognitive development of the target age group:
- For '8-11' years old (Junior Infantil): Only use gamified, coordinate-based, playful drills (e.g., 'Crossover del Semáforo', 'Tiro de Jirafa'). Strictly prohibit high intensity physical conditioning like full-court suicides, weighted workouts, or high-fatigue setups. Focus on light body weight coordination. Intensity MUST be Low-to-Medium.
- For '12-14' years old (Cadete): Focus on basic transition flows, speed drills, moderate strength/bodyweight agility, and form shooting. Intensity is Medium.
- For '15-17' years old (Junior): Intense high school prep drills. Use high-volume shooting challenges, suicides, separation footwork, euro steps, and transitions. Intensity is Medium-to-High.
- For '18+' years old (Senior Pro): Elite college/pro training, maximum physical load (RPE 8-10), complex NBA movements, fadeaways, defensive coverage, and full speed drills. Intensity is High.

CRITICAL PROGRESIÓN DE DIFICULTAD Y VARIADORES ADICIONALES: Cada ejercicio (drill) propuesto en el plan de entrenamiento DEBE incluir en su descripción una sección obligatoria y sumamente detallada titulada "🔄 Progresión e Incremento de Dificultad (Evolución):". En esta sección, detalla cómo evoluciona técnicamente el ejercicio para evitar que sea repetitivo o monótono. Por ejemplo:
- Si el ejercicio es de tiro y empieza recibiendo y tirando directo (Catch & Shoot), el nivel evolutivo debe pasar a añadir una finta de tiro (shot fake) seguida de un bote de escape lateral o una penetración explosiva hacia la canasta para tirar en parada de un tiempo o flotadora.
- Si es de bote estático (como manejo con una mano), progresará a meter botes en velocidad en zig-zag sobre conos con dos balones, fintas cruzadas o doble crossover rápido.
- Si es defensivo o agilidad, progresará de deslizamiento lateral básico a cambios drásticos de caderas de 180°, retrocesos coordinados a esprint y saltos con caída isométrica balanceada.
Aplica esta regla de progresión y crecimiento técnico a absolutamente todos los ejercicios que propongas para el plan.

CRITICAL UNIQUE DRILLS RULE: Every single drill in the entire multi-week plan MUST have a completely unique name AND unique description containing the baseline drill instruction and its progressive evolution. You are strictly forbidden from reusing drill titles or pasting similar descriptions twice. Create technical variations for different weeks to ensure 100% variety.
Always output purely valid, clean JSON strings matching the requested JSONschema perfectly. DO NOT output any markdown blocks like \`\`\`json or backticks. Just output the raw JSON object.`;

  let weeksSpec = "";
  for (let w = 1; w <= numWeeks; w++) {
    weeksSpec += `"Semana ${w}", `;
  }
  weeksSpec = weeksSpec.slice(0, -2);

  const prompt = `Crea un plan de entrenamiento de baloncesto de verano personalizado de ${numWeeks} semanas de duración basado en las mejores rutinas de preparatoria estadounidense, con las siguientes características:
- Edad de los jugadores: ${ageGroup} años. ADAPTA COMPLETAMENTE la intensidad, tipo de ejercicios, vocabulario, metas y nivel de fatiga a este rango de edad. Bajo nivel físico-metabólico para niños (8-11) y máxima intensidad pro para adultos (18+).
- Días de la semana para entrenar cada semana: ${daysOfWeek.join(", ")}.
- Áreas de enfoque requeridas: ${selectedFocus}. El plan DEBE incluir un conjunto de ejercicios que cubran de manera equilibrada y obligatoria las áreas de enfoque tradicionales (tiro, bote, agilidad, resistencia física y finalizaciones) y que ADEMÁS incorpore la categoría dedicada 'kobe' (ejercicios reales o inspirados directamente en la ética de trabajo de Kobe Bryant / Mamba Mentality).
- EQUILIBRIO DE METODOLOGÍA: No limites todo el plan únicamente a drills de Kobe Bryant. Mantén y utiliza los drills y metodologías americanas tradicionales existentes para tiro, bote, agilidad, resistencia y finalizaciones (ej: entrenamientos estilo Curry, Kyrie, Prep Schools clásicos), y simplemente añade los drills específicos de Kobe Bryant bajo la categoría/enfoque 'kobe'. Ambas metodologías deben coexistir equilibradamente en cada semana de entrenamiento, garantizando que se apliquen todos los focos de forma balanceada.
- REQUISITO DE KOBE BRYANT (MAMBA MENTALITY): Bajo la categoría específica 'kobe', es de carácter obligatorio proponer excelentes ejercicios reales o directamente inspirados en Kobe Bryant (tales como: "Kobe's Sunset Elbow-to-Elbow Shooting", "Kobe Bryant 100-Make Challenge", "Kobe's Signature Fadeaway & Pivot", "Mamba 6-6-6 Speed Work", "Mamba Mentality Handle Challenge", "Kobe Footwork Layups"), explicándolos al detalle en español y nivel de ajuste acorde a la edad.
- REQUISITO DE ORIGINALIDAD EXTREMA (SIN REPETICIONES): Cada ejercicio (drill) propuesto en el plan de ${numWeeks} semanas DEBE ser completamente único y exclusivo. No se permite repetir ningún título de ejercicio ni descripción en ninguna semana o día. Inventa variaciones de ejercicios, combinaciones de fundamentos y mecánicas de entrenamiento progresivas para que no haya duplicaciones de ningún tipo. Cada día tiene que proponer retos nuevos y técnicos.
- NOMBRES DE LOS EJERCICIOS (MANDATORIO): Solo los ejercicios de la categoría específica 'kobe' deben llevar nombres relacionados con Kobe Bryant o Mamba Mentality. Los ejercicios de las demás categorías ('tiro', 'bote', 'agilidad', 'resistencia', 'finalizaciones') DEBEN llevar sus nombres reales tradicionales, profesionales y auténticos (ej: 'Stephen Curry Star Shooting', 'Kyrie Irving Handles', 'Classic Full-Court Suicides', 'Mikan Finishes Pro') y NO contener la palabra 'Kobe' o 'Mamba' en sus títulos, reflejando fielmente el título del ejercicio preciso que estás proponiendo.
- Duración total de cada sesión de entrenamiento diaria: ${durationHours} horas (${durationHours * 60} minutos en total).
- Rol de Juego: ${roleText}.
- Formato: ${modeText}.
- Nivel de Intensidad: ${intensityText}.
- CONSTRICCIÓN CRÍTICA DE TIEMPO: Cada ejercicio propuesto en la lista de ejercicios (drills) DEBE durar obligatoria y estrictamente entre 10 y 15 minutos (por ejemplo, 10, 11, 12, 13, 14, 15 minutos). Nunca propongas ejercicios con duraciones mayores a 15 minutos ni menores a 10 minutos.
- Debes incluir suficientes ejercicios para cada día (drills en la secuencia) de modo que la suma de sus 'durationMinutes' complete exactamente o de forma muy aproximada la duración de la sesión diaria, es decir, ${durationHours * 60} minutos en total. Por ejemplo, si la duración total es de 2 horas (120 minutos), debes proponer aproximadamente 8-12 ejercicios diferentes de entre 10 y 15 minutos cada uno hasta sumar 120 minutos. El plan de entrenamiento DEBE detallar biomecánicas correctas (como mantener los codos alineados a 90 grados o bajar el centro de gravedad buscando estabilidad) tanto en la explicación como en los objetivos físicos asignados. EN CADA EJERCICIO, explica primero la mecánica básica del drill y luego añade de forma obligatoria el bloque "🔄 Progresión e Incremento de Dificultad (Evolución):" ampliando el drill con fintas de tiro, desbordes, cambios de ritmo o penetraciones complejas para potenciar el repertorio del jugador.
- Énfasis de cansancio e Índice de Esfuerzo de Borg: incluye recomendaciones sobre el esfuerzo aeróbico/anaeróbico y metas de fatiga saludables para la edad.
${customPrompt ? `- INSTRUCCIONES ESPECÍFICAS DE ADAPTACIÓN (CRÍTICO): El usuario ha solicitado expresamente la siguiente personalización especial: "${customPrompt}". Adapta por completo el enfoque del plan, los tipos de ejercicios, la intensidad, progresión e introducción basándote en este requisito crucial.` : ""}

Genera un plan con ${numWeeks} semanas completas: de "Semana 1" a "Semana ${numWeeks}". Cada una con una temática de desarrollo semanal diferente.
Combina y secuencia de manera fluida y retadora ejercicios tradicionales americanos de primer nivel junto con la intensidad Mamba de los drills de Kobe Bryant.

El objeto JSON que devuelvas debe estructurarse obligatoriamente de la siguiente manera:
{
  "title": "Nombre profesional y emocionante del plan de ${numWeeks} semanas de duración",
  "description": "Una motivadora introducción y contexto del plan (citando la influencia de entrenamientos de baloncesto de primer nivel, bajo el programa 'Pinetys Grind' adaptado para rol ${playerRole}, formato ${trainingMode} y nivel ${intensityLevel})",
  "recommendedWeeklyHours": (número estimado de horas de dedicación en una semana, ej: ${daysOfWeek.length * durationHours}),
  "weeks": [
    {
      "weekName": "Semana 1",
      "theme": "Enfoque principal o tema conductor de esta semana (ej: Dominio del Balón y Fundamento)",
      "days": [
        {
          "dayName": "Nombre del día de la semana que el usuario seleccionó de entre: ${daysOfWeek.join(", ")}",
          "theme": "Tema conductor americano para ese día (ej. 'Ball Handling Speed & Transition')",
          "drills": [
            {
              "id": "identificador único corto (p. ej. 'w1d1-d1', 'w1d1-d2')",
              "title": "Nombre auténtico de la rutina de entrenamiento (ej. Mikan Finishes)",
              "category": "Una de las siguientes: 'tiro', 'bote', 'agilidad', 'resistencia', 'finalizaciones', 'kobe'",
              "description": "Explicación clara en español de la mecánica, ejecución y posicionamiento del ejercicio, sin repetir descripciones previas",
              "durationMinutes": (un número entero obligatorio que debe estar ESTRICTAMENTE en el rango habitual de 10 a 15 minutos, de forma que el sumatorio de los ejercicios de este día sea exactamente de ${durationHours * 60} minutos),
              "intensity": "Una de las siguientes: 'Baja', 'Media', 'Alta'",
              "targetReps": "Meta específica de la práctica, ideal para medirse (ej. 'Anotar 15 tiros consecutivos' o 'Completar 10 vueltas')",
              "assignedObjective": "Objetivo personalizado asignado por defecto para el jugador"
            }
          ]
        }
      ]
    }
  ]
}

Asegúrate de que las ${numWeeks} semanas (${weeksSpec}) aparezcan detalladas, y que TODOS los días seleccionados (${daysOfWeek.join(", ")}) figuren dentro de cada semana, con drills de entre 10 y 15 minutos cada uno secuenciados hasta completar la duración diaria y aplicando de forma balanceada y obligatoria todas las categorías indicadas.`;

  if (!ai) {
    console.log("No AI client. Serving fallback database plan.");
    return res.json({ success: true, plan: adaptMockPlan(ageGroup, daysOfWeek, durationHours, numWeeks, playerRole, trainingMode, intensityLevel, customPrompt) });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "description", "recommendedWeeklyHours", "weeks"],
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            recommendedWeeklyHours: { type: Type.INTEGER },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["weekName", "theme", "days"],
                properties: {
                  weekName: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  days: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["dayName", "theme", "drills"],
                      properties: {
                        dayName: { type: Type.STRING },
                        theme: { type: Type.STRING },
                        drills: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            required: ["id", "title", "category", "description", "durationMinutes", "intensity", "targetReps", "assignedObjective"],
                            properties: {
                              id: { type: Type.STRING },
                              title: { type: Type.STRING },
                              category: { type: Type.STRING },
                              description: { type: Type.STRING },
                              durationMinutes: { type: Type.INTEGER },
                              intensity: { type: Type.STRING },
                              targetReps: { type: Type.STRING },
                              assignedObjective: { type: Type.STRING }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        temperature: 0.8,
      }
    });

    const outputText = response.text?.trim() || "";
    const parsedPlan = JSON.parse(outputText);
    return res.json({ success: true, plan: parsedPlan });
  } catch (error) {
    console.error("Gemini Generation Error, falling back to clean static generation:", error);
    return res.json({ success: true, plan: adaptMockPlan(ageGroup, daysOfWeek, durationHours, numWeeks, playerRole, trainingMode, intensityLevel, customPrompt) });
  }
});

// POST Analyze Plan API (AI intensity and balance feedback)
app.post("/api/plan/analyze", async (req, res) => {
  const { plan, ageGroup, playerRole, trainingMode, intensityLevel, completedCount = 0 } = req.body;
  if (!plan) {
    return res.status(400).json({ success: false, error: "El plan es requerido para ser analizado." });
  }

  // Count localized exercises to provide context for both online and offline routes
  let boteCount = 0;
  let tiroCount = 0;
  let resistenciaCount = 0;
  let agilidadCount = 0;
  let finalizacionesCount = 0;
  let kobeCount = 0;
  let totalDrills = 0;

  plan.weeks?.forEach((week: any) => {
    week.days?.forEach((day: any) => {
      day.drills?.forEach((drill: any) => {
        totalDrills++;
        const cat = (drill.category || "").toLowerCase();
        if (cat === "bote") boteCount++;
        else if (cat === "tiro") tiroCount++;
        else if (cat === "resistencia") resistenciaCount++;
        else if (cat === "agilidad") agilidadCount++;
        else if (cat === "finalizaciones") finalizacionesCount++;
        else if (cat === "kobe") kobeCount++;
      });
    });
  });

  const botePercent = totalDrills > 0 ? Math.round((boteCount / totalDrills) * 100) : 0;
  const tiroPercent = totalDrills > 0 ? Math.round((tiroCount / totalDrills) * 100) : 0;
  const resistenciaPercent = totalDrills > 0 ? Math.round((resistenciaCount / totalDrills) * 100) : 0;
  const agilidadPercent = totalDrills > 0 ? Math.round((agilidadCount / totalDrills) * 100) : 0;
  const finalizacionesPercent = totalDrills > 0 ? Math.round((finalizacionesCount / totalDrills) * 100) : 0;
  const kobePercent = totalDrills > 0 ? Math.round((kobeCount / totalDrills) * 100) : 0;

  const getMockAnalysis = () => {
    let baseScore = 40;
    if (intensityLevel === "Bajo") baseScore = 30;
    else if (intensityLevel === "Moderado") baseScore = 55;
    else if (intensityLevel === "Élite Prep") baseScore = 80;

    const score = Math.min(100, Math.max(20, baseScore + (resistenciaCount * 5) + (kobeCount * 6) - (ageGroup?.includes("U12") ? 12 : 0)));
    let intensityLabel = `Intensidad Moderada (RPE 5-6) para ${playerRole || "Monejo Balón"}`;
    if (score > 75) intensityLabel = `Intensidad Élite Prep / Alta Carga (RPE 8-10) para ${playerRole || "Monejo Balón"}`;
    else if (score < 50) intensityLabel = `Intensidad Recreativa / Baja Carga (RPE 3-4) para ${playerRole || "Monejo Balón"}`;

    let critique = `Evaluación biomecánica adaptada para un perfil de rol "${playerRole || "Jugador"}" y categoría de edad "${ageGroup || "General"}". `;
    critique += `Se analiza una sesión estival con ${totalDrills} ejercicios diseñados. `;
    if (completedCount > 0) {
      critique += `Has completado exitosamente ${completedCount} ejercicios, estimulando la adaptación muscular y la memoria propioceptiva. `;
    } else {
      critique += `Comienza a registrar tus ejercicios completados para ver el impacto biológico real de la sesión. `;
    }
    critique += `La distribución cuenta con un ${botePercent}% de bote, ${tiroPercent}% de tiro a canasta, y un ${resistenciaPercent}% de acondicionamiento de alta potencia. `;
    
    if (ageGroup?.includes("U12") || ageGroup?.includes("Infantil")) {
      critique += "En este rango infantil, la atención se centra en la coordinación general de la zancada y el cuidado contra la fatiga de sobreúso articular precoz.";
    } else {
      critique += "Apto para el desarrollo del ácido láctico controlado y el fortalecimiento rotuliano mediante repeticiones mecánicas seguras.";
    }

    const recommendations = [
      `Foco de Postura (${playerRole || "Jugador"}): Mantén el torso bien erguido al driblear para optimizar tu campo de visión periférica.`,
      `Prevención de Tirador: Con un ${tiroPercent}% de volumen de tiro, estira los deltoides y flexores de muñeca para prevenir tendinitis estivales.`,
      `Biomecánica de Pisada: En las series explosivas, aterriza con suavidad en metatarsos amortiguando la flexión de rodilla para proteger tendones.`
    ];

    return {
      intensityScore: score,
      intensityLabel,
      balance: {
        bote: botePercent,
        tiro: tiroPercent,
        resistencia: resistenciaPercent,
        agilidad: agilidadPercent,
        finalizaciones: finalizacionesPercent,
        kobe: kobePercent
      },
      critique,
      recommendations
    };
  };

  if (!ai) {
    console.log("No AI client available for analyze. Serving fallback analysis.");
    return res.json({ success: true, analysis: getMockAnalysis() });
  }

  try {
    const systemPromptMessage = `You are an expert American Basketball Coach, Biomechanics Specialist and Athletic Trainer specializing in physical load, intensity metrics, sports medicine, joint health, and training balance analysis (NCAA and NBA skills training standard).
You speak fluent Spanish with an encouraging, highly professional coaching tone.
Your task is to analyze the training plan provided, taking into account the player's biographical and active workout stats, and output a structured JSON analysis indicating the exact physical balance and fatigue expectations. Be highly precise, clinical but motivating. Avoid generic fluff.`;

    const promptText = `Analiza el siguiente plan de entrenamiento de baloncesto y calcula su equilibrio técnico y nivel de intensidad física para:
- Nombre / Perfil de Jugador: ${plan.title || 'Personalizado'}
- Categoría de Edad: ${ageGroup || "No especificado"}
- Rol táctico del Jugador: ${playerRole || "No especificado"}
- Modo de Entrenamiento: ${trainingMode || "No especificado"}
- Nivel de Intensidad Objetivo: ${intensityLevel || "No especificado"}
- Ejercicios ya completados en esta sesión: ${completedCount || 0} de ${totalDrills} entrenamientos totales.

Plan Completo a evaluar: ${JSON.stringify(plan)}

De un total de ${totalDrills} ejercicios planificados:
- Bote: ${boteCount} drills (${botePercent}%)
- Tiro: ${tiroCount} drills (${tiroPercent}%)
- Resistencia: ${resistenciaCount} drills (${resistenciaPercent}%)
- Agilidad: ${agilidadCount} drills (${agilidadPercent}%)
- Finalizaciones: ${finalizacionesCount} drills (${finalizacionesPercent}%)
- Enfoque Mamba (Kobe): ${kobeCount} drills (${kobePercent}%)

Por favor, genera un análisis biometrológico riguroso, motivador y personalizado en español adaptado específicamente a su edad (${ageGroup}) y rol (${playerRole}). 
En 'critique', proporciona de 3 a 5 líneas con consideraciones científicas sobre sus niveles de lactato, fatiga neuromuscular y biomecánica (por ejemplo, fatiga del manguito rotador para tiradores, o cuidado articular para pívots).
En 'recommendations', redacta exactamente 3 consejos biomecánicos personalizados prácticos y aplicables de recuperación o postura para evitar lesiones de verano.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPromptMessage,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["intensityScore", "intensityLabel", "balance", "critique", "recommendations"],
          properties: {
            intensityScore: { 
              type: Type.INTEGER, 
              description: "Calificación numérica del nivel de carga física, de 0 a 100" 
            },
            intensityLabel: { 
              type: Type.STRING, 
              description: "Etiqueta descriptiva del tipo de intensidad (ej: 'Intensidad Élite Prep / RPE Alta' o 'Junior Moderado')" 
            },
            balance: {
              type: Type.OBJECT,
              required: ["bote", "tiro", "resistencia", "agilidad", "finalizaciones", "kobe"],
              properties: {
                bote: { type: Type.INTEGER },
                tiro: { type: Type.INTEGER },
                resistencia: { type: Type.INTEGER },
                agilidad: { type: Type.INTEGER },
                finalizaciones: { type: Type.INTEGER },
                kobe: { type: Type.INTEGER }
              }
            },
            critique: { 
              type: Type.STRING, 
              description: "Breve comentario técnico y motivador de 3 a 5 líneas sobre el equilibrio entre los ejercicios de bote, tiro, resistencia y enfoque mamba." 
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 observaciones o consejos prácticos de biomecánica o recuperación para abordar este plan específico."
            }
          }
        },
        temperature: 0.7
      }
    });

    const outputText = response.text?.trim() || "";
    const parsedAnalysis = JSON.parse(outputText);
    return res.json({ success: true, analysis: parsedAnalysis });
  } catch (error) {
    console.error("Gemini analysis error, using fallback analysis:", error);
    return res.json({ success: true, analysis: getMockAnalysis() });
  }
});

// POST Suggest Drill API (uses Gemini API to suggest one specialized drill based on focusArea and intensityLevel)
app.post("/api/drill/suggest", async (req, res) => {
  const { focusArea, intensityLevel, ageGroup, playerRole } = req.body;
  
  const selectedFocus = focusArea || "tiro";
  const intensityLabel = intensityLevel === "casual" ? "Baja" : intensityLevel === "elite" ? "Alta" : "Media";

  const getMockDrill = () => {
    return {
      id: "suggested-" + Date.now(),
      title: `Especializado en ${selectedFocus.toUpperCase()} Grind`,
      category: selectedFocus,
      description: `Un ejercicio sugerido personalizado para la mejora en ${selectedFocus} adaptado a un nivel de intensidad ${intensityLabel}. Enfócate en mantener el codo alineado a 90 grados, zancada balanceada y bajando el centro de gravedad. 🔄 Progresión e Incremento de Dificultad (Evolución): Añade fintas rápidas o cambios de direcciones impredecibles.`,
      durationMinutes: 12,
      intensity: intensityLabel,
      targetReps: "Repetir 4 series de 8 aciertos perfectos.",
      assignedObjective: `Controlar la estabilidad y biomecánica en cada paso.`
    };
  };

  if (!ai) {
    console.log("No AI client available. Serving fallback suggested drill.");
    return res.json({ success: true, drill: getMockDrill() });
  }

  try {
    const systemPromptMessage = `You are an expert American Basketball Coach and Athletic Trainer specializing in summer development camps and Prep School skill training (NCAA & NBA standard).
You speak fluent Spanish with an encouraging and high-performance coaching voice.
Your task is to suggest ONE highly specialized, professional basketball drill and return it in a structured JSON.`;

    const promptText = `Sugiere un único y innovador ejercicio (drill) de baloncesto personalizado en español:
- Área de enfoque: ${selectedFocus} ('tiro', 'bote', 'agilidad', 'resistencia', 'finalizaciones' o 'kobe')
- Intensidad de entrenamiento: ${intensityLevel} (intensidad del ejercicio recomendada: '${intensityLabel}')
- Edad o categoría del jugador: ${ageGroup || "15-17"} años
- Rol de juego: ${playerRole || "all-round"}

REQUISITO CRÍTICO DE EVOLUCIÓN COMPORTAMENTAL:
En la 'description' del ejercicio, detalla los pasos de ejecución técnica de forma emocionante e incorpora obligatoriamente una sección titulada "🔄 Progresión e Incremento de Dificultad (Evolución):" en español explicando detalladamente un reto adicional para llevar el ejercicio al siguiente nivel. El ejercicio debe ser estimulante y estar adaptado a este contexto veraniego.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPromptMessage,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["id", "title", "category", "description", "durationMinutes", "intensity", "targetReps", "assignedObjective"],
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: "Nombre auténtico de la rutina de entrenamiento en español" },
            category: { type: Type.STRING, description: "Categoría exacta del ejercicio" },
            description: { type: Type.STRING, description: "Explicación clara de la ejecución con su bloque de Progresión e Incremento de Dificultad (Evolución)" },
            durationMinutes: { type: Type.INTEGER, description: "Duración en minutos (por ejemplo, entre 10 y 15)" },
            intensity: { type: Type.STRING, description: "Intensidad: 'Baja', 'Media', o 'Alta'" },
            targetReps: { type: Type.STRING, description: "Meta cuantitativa de aciertos, repeticiones o series" },
            assignedObjective: { type: Type.STRING, description: "Objetivo biomecánico asignado" }
          }
        },
        temperature: 0.85
      }
    });

    const outputText = response.text?.trim() || "";
    const parsedDrill = JSON.parse(outputText);
    // Overwrite the ID with a dynamic frontend timestamp to avoid duplicates upon repeats
    parsedDrill.id = "suggested-" + Date.now();
    return res.json({ success: true, drill: parsedDrill });
  } catch (error) {
    console.error("Gemini suggest drill API error, using fallback format:", error);
    return res.json({ success: true, drill: getMockDrill() });
  }
});


// Procedural generator that constructs professional, 100% unique drills tailored toStyle, PlayerRole, TrainingMode, IntensityLevel, and Age Group.
function adaptMockPlan(
  ageGroup: string,
  daysOfWeek: string[],
  sessionDurationHours?: number,
  weeksCount?: number,
  playerRole?: string,
  trainingMode?: string,
  intensityLevel?: string,
  customPrompt?: string
) {
  const hours = sessionDurationHours ? Number(sessionDurationHours) : 2;
  const totalMinutes = hours * 60;
  const numWeeks = weeksCount ? Number(weeksCount) : 4;
  const role = playerRole || "all-round";
  const mode = trainingMode || "solo";
  const level = intensityLevel || "medium";

  // Configuration values based on age and intensity
  let mappedAge = "18+";
  let rpeRange = "8-10 (Muy fuerte / Esfuerzo máximo pro)";
  let categoryIntensity = "Alta/Élite";
  let postureTip = "Mantén la posición defensiva baja sosteniendo un centro de gravedad extremadamente bajo para ganar empuje lateral.";
  let shootingTip = "Mecánica alineada con el codo elevado estrictamente a 90 grados al armar y lanzar el balón.";

  if (ageGroup.includes("8") || ageGroup.includes("9") || ageGroup.includes("10") || ageGroup.includes("11")) {
    mappedAge = "8-11";
    rpeRange = "3-5 (Láctico suave, divertido, coordinativo)";
    categoryIntensity = "Baja/Coordinativa";
    postureTip = "Enfocarse en un juego alegre y mantener caderas flexionadas de forma natural con centro de gravedad compensado.";
    shootingTip = "Acostumbrar el tiro de muñeca suave dibujando una jirafa apuntando con el codo alto a unos 90 grados.";
  } else if (ageGroup.includes("12") || ageGroup.includes("13") || ageGroup.includes("14")) {
    mappedAge = "12-14";
    rpeRange = "5-7 (Moderado a fuerte, aeróbico mixto)";
    categoryIntensity = "Media/Desarrollo";
    postureTip = "Postura básica defensiva estándar, bajando el centro de gravedad buscando estabilidad en traslados de banda.";
    shootingTip = "Estructurar la trayectoria vertical, manteniendo el codo fijado a 90 grados en la preparación del canasto.";
  } else if (ageGroup.includes("15") || ageGroup.includes("16") || ageGroup.includes("17")) {
    mappedAge = "15-17";
    rpeRange = "7-9 (Fuerte, anaeróbico láctico preparatorio)";
    categoryIntensity = "Alta/Competitiva";
    postureTip = "Bajar el centro de gravedad por debajo de las caderas con hombros hacia adelante listos para reaccionar al cambio.";
    shootingTip = "Fijar el arco de tiro arriba, bloqueando el codo a un ángulo exacto de 90 grados soportando la fatiga acumulada.";
  }

  // Weekly themes matching professional progression
  const baseThemes = [
    "Dominio de Fundamentos Básicos y Control Técnico de Balón",
    "Mecánica del Tiro de Precisión y Desmarques Rápidos",
    "Agilidad de Reacción, Desplazamientos y Posición de Resistencia",
    "Alta Frecuencia Cardiaca, Toma de Decisiones y Presión Física",
    "Lectura Táctica de Espacios, Bloqueo de Balón y Apoyos Estables",
    "Ataques en Transición Veloz, Espaciados y Cambios de Ritmo",
    "Control de Pelotas en Doble Presión y Contraataques Rápidos",
    "Temple Mental en Instantes Críticos y Simulaciones de Partido"
  ];

  // Large set of highly technical bases to generate completely unique, high-quality workouts
  const bases: Record<string, { titles: string[]; details: string[]; actions: string[] }> = {
    tiro: {
      titles: [
        "Stephen Curry Range Focus", "Catch & Shoot Rápido de Esquina", "V-Cut & Square Up Jumper", "Elbow-to-Elbow Touch Jumper",
        "Spot-Up Jumper Perimetral", "Step-Back de Separación Lateral", "Pull-Up Pro tras Drible", "Lanzamiento de Form Shooting Vertical",
        "Tiro en Suspensión con Elevación Corta", "Ray Allen Screen Lift Jumper", "Klay Thompson Corner Special", "Lanzamiento de Tres en Fatiga Extrema",
        "Elevación de Bloqueo Ciego", "Form Shooting Directo de Tablero", "Catch & Release Angular de Fase", "Reggie Miller Corner Off-Screen Jumper",
        "Steve Nash Pull-Up on the Run", "Decelerando en Cono Jumper", "Fadeaway Lateral Estilo Kevin Durant", "Stephen Curry Star Out Series",
        "Dame Time Logo Range Focus", "James Harden Step-Back Challenge", "Ray Allen Baseline Run and Shoot", "Dirk Nowitzki One-Legged Fadeaway",
        "Miras de Precisión (Spot-Up Elite)", "Tiro con Oposición de Defensor Fantasma", "Drazen Petrovic Sprint Shooting", "Lanzamiento de Cuchara Pro"
      ],
      details: [
        "atendiendo la tracción de los metatarsos con codos fijos a 90 grados",
        "alineando con precisión quirúrgica el hombro dominante directo con el medio del aro",
        "con extensión e impulsión uniforme del codo terminando con un muñequeo suave de seda",
        "plantando firmemente los apoyos en paralelo bajo los hombros para una caída estable",
        "sosteniendo el balance de espalda erguida evitando balanceos perjudiciales de cadera",
        "manteniendo los dedos índices y medio apuntando al centro del aro tras soltar el balón",
        "absorbiendo la fuerza del salto con rodillas alineadas para propiciar parábola perfecta",
        "verificando que la mirada se fije en la parte frontal posterior del aro durante el vuelo"
      ],
      actions: [
        "amortiguar la recepción con punta de pies y tirar de inmediato",
        "cortar el perímetro en esprint corto, clavar el pivote guía y elevar el cuerpo",
        "ejecutar un amago técnico de desmarque para un tiro rápido en suspensión",
        "encestar de forma fluida manteniendo la punta de los dedos colgando al final del vuelo",
        "recibir tras cortina, estabilizar el núcleo en fracción de segundo y asestar el tiro",
        "sprintar de esquina a ala opuesta, pivotar en reversa y disparar sin vacilación"
      ]
    },
    bote: {
      titles: [
        "Kyrie Irving Handle Combo", "Bote de Bolsillo (Pocket Dribble)", "In-and-Out & Crossover Pro", "Bote de Control Ultra Bajo",
        "Manejo de Balón Alternado en Tensión", "Zig-Zag Handles con Pivot", "Cambios Shifty con Amago de Hombros",
        "Dribling de Salida Defensiva de Presión", "Spider Handles con Ritmo Sincopado", "Crossover entre Piernas Explosivo",
        "Bote de Retroceso Técnico", "Manejo Lateral de Balón en Desplazamiento", "Low-Drive Dribbling de Rotura",
        "Bote Cruzado de Escape Corto", "Cambios Estilo Base Armador", "Kyrie Irving Shifty Dribble", "Steve Nash Wrap-Around",
        "Chris Paul Pocket Cross", "Deron Williams Crossover Challenge", "Luka Doncic Step-Back Handle",
        "Chris Paul Pocket-Pass Dribbling", "Kyrie Irving Chaos Handle", "Allen Iverson Crossover Special", "Tim Hardaway UTEP Two-Step",
        "Dribling cruzado continuo con pelota de tenis", "Manejo Ciego con Gafas de Simulación", "Piques de Poder y Desborde Lateral Rapidísimo"
      ],
      details: [
        "bajando la posición centro-de-gravedad por debajo del nivel estándar de cadera",
        "golpeando con firmeza el esférico utilizando exclusivamente la yema de las manos",
        "sosteniendo el torso en tensión con cabeza arriba leyendo el tablero",
        "hundiendo el perfil de la bota contra el parqué para arranques inmediatos",
        "controlando la cobertura esclava del balón usando el antebrazo opuesto activo",
        "empujando el bote contra la lona con fuerza de pistón vertical",
        "manteniendo el control de espaldas a la presión fingiendo un pase lateral"
      ],
      actions: [
        "rebotar el cuero fuertemente contra el piso para maximizar el tiempo de reacción",
        "alternar alturas de pique forzando la pérdida de equilibrio virtual del rival",
        "ejecutar crossovers continuos combinados con fintas de entrada y salida",
        "proteger el balón en giros cerrados amagando desbordes sobre la línea",
        "encadenar botes entre las piernas de manera ininterrumpida acelerando el conteo",
        "combinar botes de retracción hacia atrás con arranques explosivos en velocidad"
      ]
    },
    agilidad: {
      titles: [
        "Escalera de Coordinación Ickey Shuffle", "Deslizamientos de Espejo en Conos de Límite", "Pivote Reverso y Cambio", "Circuito de Estrella de 5 Conos",
        "Reaction Shuffle Defensivo de Banda", "Paso de Tijera en Escalera de Ritmo", "Freno de un Tiempo en Parada Seca", "Hips-Switch de Giro de Rodillas",
        "Laterales de Tensión Defensiva Cruzada", "Pivote de Fuerza y Escape de Bloqueo", "Circuito Slalom de Conos de Conexión", "Reaction Drill Multi-Target",
        "Desplazamiento Escalonado de Vallas Cortas", "Giro Tridimensional de Caderas", "Puntas de Fuego en Eje Frontal",
        "Ladder High-Knees Sprint", "Cone Weave and Hip Swivel Drill", "L-Drill Transition Speed Challenge", "W-Drill Defensive Shuffler",
        "Deslizamientos en Octágono de Tensión", "Frenos de Emergencia en Dos Tiempos", "Mamba Footwork Ladder Challenge", "Step-Over Lateral Hurdles"
      ],
      details: [
        "distribuyendo el centro de gravedad buscando estabilidad defensiva total",
        "afianzando los pies con resortes coordinativos sin tocar los divisores",
        "disipando la carga cinética flexionando con seguridad rodillas y espalda",
        "abriendo el compás de brazos para simular cobertura defensiva asfixiante",
        "manteniendo cadencia isométrica para anticipar desbordes del atacante",
        "absorbiendo la inercia con zancadas cortas de frenado para proteger tobillos"
      ],
      actions: [
        "ejecutar pasadas rítmicas veloces tocando con precisión quirúrgica los rectángulos",
        "pivotar en un eje de 180 grados resguardando el hombro de contención",
        "variar de dirección súbitamente tras la señal virtual del silbato",
        "deslizarse lateralmente empujando con la pierna retrasada para no cruzar tobillos",
        "efectuar saltos pliométricos rápidos sobre un pie con aterrizaje suave y balanceado",
        "cambiar de cadencia al instante pasando de trote defensivo a sprint frontal"
      ]
    },
    resistencia: {
      titles: [
        "Test de Suicidios Clásicos de Cantera", "Esprints Aro a Aro en Transición", "Intervalo Mamba 40/20 de Fatiga", "Carrera Continua de Resistencia de Partido",
        "Esprints Perimetrales con Cambios del Silbato", "Resistencia Láctica de Cierre de Período", "Sprints de Retroceso Defensivo", "Circuito Láctico Prep School",
        "Suicidas de Cancha Completa con Freno", "Línea a Línea Suicidas de Velocidad", "Intervalos de Recuperación Activa", "Carrera de Conos en Zig-Zag Continuo",
        "Esprint de Ida y Vuelta con Autopase", "Intervalo Mamba de Desborde Continuo", "Resistencia de Presión Defensiva de Cancha Llena",
        "17-In-A-Minute Baseline Sprint", "Gasser Side-to-Side Endurance", "Full-Court In-and-Out Reps", "Interval 35/15 Mamba Attack",
        "Sprints Progresivos con Resistencia de Banda", "Carrera Fartlek Intermitente de Pista", "Simulacro de Prórroga a Ritmo Máximo"
      ],
      details: [
        "administrando la oxigenación mediante ciclos profundos de respiración nasal",
        "regulando la carga de esfuerzo de acuerdo a la escala RPE Borg óptima",
        "ejecutando zancadas fluidas balanceando dinámicamente los brazos contra el torso",
        "cayendo de forma elástica sobre los metatarsos para proteger las rodillas de impactos",
        "manteniendo la compostura física a pesar de la acumulación de fatiga láctica",
        "exigiendo la máxima capacidad de recuperación con respiración abdominal pausada"
      ],
      actions: [
        "realizar esprints al tope de tu capacidad mecánica dominando el cansancio mental",
        "completar vueltas continuas sosteniendo un paso uniforme y erguido de juego",
        "recuperar aire trotando de espaldas con la mirada puesta en el aro opuesto",
        "romper el ritmo con esprints explosivos de cono a cono deteniendo la carrera en seco",
        "correr la cancha en oleadas sucesivas y lanzar tiros libres con pulso elevado"
      ]
    },
    finalizaciones: {
      titles: [
        "Mikan Drill Rítmico Tradicional", "Flotadora de Bombeo Alto", "Euro Step Explosivo en Pintura", "Entrada en Reverso de Tablero Pro",
        "Bandeja de Choque en Doble Ritmo", "Parada de Dos Tiempos & Up-and-Under", "Finger-roll Sutil de Toque Alto", "Gancho Corto en Poste de Pivote",
        "Bandeja Pasada Invertida al Aro", "Mikan Drill Inverso de Fuerza", "Finalización de Flotadora con Finta", "Euro-Step Cruzado con Finta de Pase",
        "Drop-Step de Fuerza en Poste Bajo", "Mikan Drill de Dos Balones Sincronizados", "Entrada Acrobática tras Euro-Step de Reverso",
        "Tony Parker Floater Series", "Bandeja de Fuerza con Choque de Escudo", "Ginobili Euro-Step Extension", "Rondo Fake Behind-Back Jumper",
        "Skyhook Tradicional Kareem Style", "Mikan Inverso con Tabla de Ritmo Ajustada", "Bandeja en Extensión Máxima Finger-roll"
      ],
      details: [
        "estabilizando el balón pegado al pecho con codos salientes de barrera",
        "amortiguando el peso en dos pies de forma conjunta para disipar forces de choque",
        "estirando el brazo atacante cerca de la esquina negra del cristal superior",
        "manteniendo el cuerpo firme suspendido para contrarrestar el contacto físico virtual",
        "depositando el balón suavemente con las yemas para propiciar un rebote favorable",
        "protegiendo el balón con el hombro opuesto levantando bien la rodilla interna"
      ],
      actions: [
        "encestar con toque dócil permitiendo que el cuero acaricie el parqué limpiamente",
        "atacar el poste con zancadas anchas y eludir los bloqueos de brazos defensivos",
        "conducir la rodilla arriba con ferocidad para propulsar el salto vertical",
        "concluir con un gancho corto arqueando el esférico por encima del defensor",
        "frenar en seco enfrente del aro, amagar la salida y finalizar en reversa con suavidad"
      ]
    },
    kobe: {
      titles: [
        "Kobe Bryant Sunset Elbow Shooting", "Kobe 100-Make Workout", "Mamba 6-6-6 Speed Work", "Signature Fadeaway & Pivot Challenge",
        "Mamba Handle Challenge de Tensión", "Kobe Footwork Layups Series", "Mamba Mentality Triple Threat", "Mamba Focus de Silbato de Hierro",
        "Kobe Bryant Mid-Post Fadeaway", "Kobe Bryant Sunset Elbow-to-Elbow Shooting Challenge", "Mamba Mentality Elite Handle",
        "Sunset Elbow Jumper Bryant Style", "Kobe Bryant Double Clutch Attack", "Mamba Focus con Fatiga Acumulada", "Fadeaway de Fuerza Estilo Kobe",
        "Kobe Sunset Low Post Pivot", "Signature Shot-Fake and Jumper", "Sunset Triple Threat Attack",
        "Kobe Mamba Mental Elite 150 Aciertos", "Mamba Sunset 50-Spot-Up Challenge", "Mamba Bryant Crunch Time Free Throws"
      ],
      details: [
        "canalizando la legendaria e incansable mentalidad Mamba de excelencia sin límites",
        "sosteniendo de manera obligatoria el codo alineado a un ángulo exacto de 90 grados",
        "empujando las fronteras del cansancio para pulir decisiones técnicas en instantes decisivos",
        "perfeccionando la coordinación de apoyos con pivotes precisos en el poste medio",
        "recreando el escenario mítico con el reloj de juego expirando en cada tiro",
        "enfocando cada repetición técnica al máximo potencial con espíritu competitivo"
      ],
      actions: [
        "despachar un fadeaway suspendido ladeando con gracia el torso hacia atrás",
        "ejecutar un lanzamiento de media distancia inmutable ante la inercia física",
        "sostener el bote protegiendo con el hombro para clavar un quiebre de muñeca definitivo",
        "clavar tiros consecutivos de media distancia sin permitirse ningún fallo técnico",
        "penetrar driblando fuerte, frenar en pivote reverso y soltar una suspensión ladeada"
      ]
    }
  };

  // Stepwise progressions / Evolutionary branches for each dynamic category
  const evolutions: Record<string, string[]> = {
    tiro: [
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con disparo estático Catch & Shoot; evoluciona añadiendo una finta de tiro explosiva (shot fake), bote lateral largo de escape y suspensión inmediata estabilizando el codo.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia viniendo de corte en V rápido; evoluciona a finta de tiro perimetral, penetración de dos botes con cambio de mano y lanzamiento flotador (floater) de bombeo alto para eludir el pívot defensor.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia saliendo de bloqueo ciego; evoluciona añadiendo un paso de step-back con amago de hombros lateral para crear separación máxima de la marca antes del salto.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con tiro directo tras drible; evoluciona a finta técnica de tiro, penetración explosiva cruzada por línea de fondo, freno seco en un tiempo, pivote reverso de 180° y suspensión estable."
    ],
    bote: [
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con pique de control bajo estático; evoluciona a drible en zig-zag sobre 4 conos introduciendo cambios cruzados de mano continuos in-and-out a velocidad de partido.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con crossover simple estático; evoluciona a doble cambio rápido (entre piernas y por detrás) seguido de un arranque explosivo protegiendo el balón con el antebrazo activo.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con bote alternativo continuo; evoluciona agregando finta de salida directa con hombros, retroceso de bolsillo de control (pocket dribble) y escape veloz cruzado.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con dribling normal; evoluciona simulando doble marca de trampa (trap), retrocediendo con botes de poder bajos y lanzando una finta de pase armada antes de atacar el eje opuesto."
    ],
    agilidad: [
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con paso lateral rítmico; evoluciona a deslizamientos laterales explosivos tocando las marcas del suelo con las puntas, rotando caderas a 180° y esprintando de espaldas.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con esprint lineal corto; evoluciona a circuito de slalom incorporando frenos secos isométricos de un tiempo y saltos altos con los dos pies simulando un tapón perimetral.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con saltos en escalera; evoluciona a saltos bipodales rápidos front-to-back con salida de esprint lateral explosivo e inmediato reaccionando al silbato virtual.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con pasos cortos de reacción; evoluciona a giros tridimensionales de caderas para cruzar el eje entre conos paralelos manteniendo el centro de gravedad por debajo de las caderas."
    ],
    resistencia: [
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con carrera regular aro a aro; evoluciona a suicidas completos cronometrados bajando la marca a menos de 30 segundos, sumando flexiones de pecho veloces al rozar cada línea límite.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con trote perimetral aeróbico; evoluciona a pasadas intermitentes Mamba 40/20 combinando saltos pliométricos de rodillas al pecho (tuck jumps) antes de romper cada carrera.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con velocidad de pista completa; evoluciona a esprints de aro a aro autopasando el balón con el cristal superior, saltando al máximo para atrapar el rebote a dos manos arriba con fatiga.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con resistencia defensiva estática; evoluciona a esprints de retroceso defensivo en flexión de rodillas continua combatiendo el dolor muscular de fatiga láctica activa."
    ],
    finalizaciones: [
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con bandeja clásica por la derecha; evoluciona a penetración de choque lateral con finta de canasta alta por el perfil izquierdo, eurostep largo de dos metros y remate pasado invertido.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con gancho corto estático; evoluciona a pivoteo de fuerza en poste bajo, amago alto de tiro en suspensión ('up and under') y lanzamiento arqueado de gancho cruzado sobre el defensor.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con mikan rítmico tradicional; evoluciona a mikan invertido de alta frecuencia alternando balones sin tocar el parqué y suspensión isométrica con una sola pierna.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con entrada limpia en doble ritmo; evoluciona a penetración resistiendo el impacto lateral del defensor defensivo, doblando el aire en doble embrague (double clutch) para rematar con tablero."
    ],
    kobe: [
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con tiro suspendido en el poste; evoluciona a recibir de espaldas bajo marca física, ejecutar pivote al poste medio con fadeaway suspendido ladeando el torso y arqueando los hombros.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con mamba handle básico; evoluciona a finta de salida cruzada con hombros, step-back rápido a media distancia, finta de tiro en la elevación, avance invertido de un bote y tiro final.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con bandeja kobe acrobática; evoluciona a doble finta de tiro en la botella de la pintura, juego de pies rápido de paso reverso cruzado y gancho corto flotador bajo fatiga acumulada.",
      "🔄 Progresión e Incremento de Dificultad (Evolución): Inicia con lanzamientos a media distancia; evoluciona a esprintar al codo contrario (codo-a-codo) tocando el madero, recoger pase en autopase en suspensión alta y penetrar con finta antes de elevarse."
    ]
  };

  const categories = ["agilidad", "bote", "tiro", "finalizaciones", "resistencia", "kobe"];

  const weeks = Array.from({ length: numWeeks }, (_, wIdx) => {
    const weekName = `Semana ${wIdx + 1}`;
    const weekTheme = baseThemes[wIdx % baseThemes.length];

    const dWeeks = daysOfWeek.map((dayName, dIdx) => {
      const drills: any[] = [];
      let currentMinutesSum = 0;
      let drillIdxInDay = 0;

      while (currentMinutesSum < totalMinutes) {
        let drillDuration = 12;
        const remainingTime = totalMinutes - currentMinutesSum;

        if (remainingTime < 10) {
          if (drills.length > 0) {
            drills[drills.length - 1].durationMinutes = Math.min(15, drills[drills.length - 1].durationMinutes + remainingTime);
            currentMinutesSum += remainingTime;
            break;
          } else {
            drillDuration = 10;
          }
        } else if (remainingTime <= 15) {
          drillDuration = remainingTime;
        } else {
          drillDuration = (drillIdxInDay % 2 === 0) ? 15 : 12;
        }

        // Sequential category selection with coprime multipliers to trigger maximum progression variance
        const category = categories[(wIdx * 7 + dIdx * 3 + drillIdxInDay) % categories.length];
        
        // Generate deterministic seed to extract diverse elements from bases dictionaries (no limiting modulo to unlock all drills)
        const isAlternative = customPrompt && (customPrompt.toLowerCase().includes("alternat") || customPrompt.toLowerCase().includes("diferent"));
        const seedOffset = isAlternative ? 5 : 0;
        const seedValue = wIdx * 23 + dIdx * 13 + drillIdxInDay * 7 + seedOffset;
        const catBases = bases[category] || bases.tiro;
        const rawTitle = catBases.titles[seedValue % catBases.titles.length];
        const detail = catBases.details[(seedValue + 3) % catBases.details.length];
        const action = catBases.actions[(seedValue + 7) % catBases.actions.length];

        // Fetch dynamic stepwise progression string based on current drill seed of that category
        const evoList = evolutions[category] || evolutions.tiro;
        const evoString = evoList[(seedValue + dIdx) % evoList.length];

        // Professional role description
        let playerRoleLabel = "de enfoque Todoterreno y Balanceado";
        let biomechanicsAdvice = "Mantén la concentración técnica y la postura correcta.";
        if (role === "shooter") {
          playerRoleLabel = "de estilo Francotirador / Tirador Sniper (Catch & Shoot, salidas de bloqueo)";
          biomechanicsAdvice = "Asegura levantar bien el codo a un ángulo óptimo de 90 grados y clavar el follow-through de la muñeca.";
        } else if (role === "guard") {
          playerRoleLabel = "de estilo Base Armador / Playmaker de Élite (Manejo de balón Kyrie Irving, Pick & Roll)";
          biomechanicsAdvice = "Baja drásticamente el centro de gravedad buscando estabilidad lateral, usando botes cortos de poder.";
        } else if (role === "big") {
          playerRoleLabel = "de estilo Poste Bajo y Pivote de Selección (Mikan avanzado, ganchos de poste)";
          biomechanicsAdvice = "Trabaja el juego de pies sosteniendo el pivote de fuerza y elevando el balón arriba del mentón.";
        }

        // Modality custom phrasing
        let modePhrase = "Se ejecuta de manera individual simulando un defensor en la posición utilizando fintas y auto-pases.";
        if (mode === "duo") {
          modePhrase = "Se realiza de forma colaborativa en parejas, donde tu compañero asiste enviando pases rápidos de pecho o simulando defensa activa para generar contratiempo.";
        }

        // Intensity and fatigue configurations based on age and intensity
        let rpePhrase = "esfuerzo suave (RPE 4-5)";
        let intensityGuide = "Ritmo moderado priorizando la elegancia en los movimientos y estiramiento activo.";
        let targetRepsText = "Completar la secuencia 12 veces con calma y con respiración controlada.";
        let ageGoal = "Enfocar el juego feliz en canasta con metas coordinativas ligeras.";

        if (mappedAge === "8-11") {
          ageGoal = "Gamificación infantil alegre. Evitar fatiga extrema o fuerza excesiva sobre hombros.";
          targetRepsText = "Realizar 8 series divertidas, celebrando cada enceste con choque de manos.";
        } else if (mappedAge === "12-14") {
          ageGoal = "Desarrollo de postura biomecánica, pases limpios y excelente trayectoria en chicos cadetes.";
          targetRepsText = "Anotar 15 aciertos netos cuidando que tus pies apunten paralelos al canasto.";
        } else if (mappedAge === "15-17") {
          ageGoal = "Rutina pre-universitaria competitiva de alto volumen y acondicionamiento intenso de instituto.";
          targetRepsText = "Anotar 25 repeticiones fluidas bajo fatiga, midiendo la velocidad del cronómetro.";
        } else {
          ageGoal = "Nivel Varsity / Pro de alta intensidad para adultos con metas de acierto exigentes.";
          targetRepsText = "Alcanzar 35 encestes reales bajo fatiga física real sosteniendo altos porcentajes (75%+).";
        }

        if (level === "casual") {
          rpePhrase = "esfuerzo suave (RPE 4-5)";
          intensityGuide = "Ritmo recreativo relajado enfocado en pulir detalles tácticos y estiramiento activo.";
        } else if (level === "elite") {
          rpePhrase = "esfuerzo extremo (RPE 8-10) Prep NCAA";
          intensityGuide = "Ritmo infernal de alta velocidad simulando el cansancio acumulado de la prórroga de juego.";
          if (mappedAge === "8-11") {
            rpePhrase = "esfuerzo moderado adaptado (RPE 5-6)";
            intensityGuide = "Ritmo dinámico y continuo con pausas breves frecuentes de agua.";
          }
        } else {
          rpePhrase = "esfuerzo competitivo de club nacional (RPE 6-7)";
          intensityGuide = "Paso regular exigente para adquirir una forma física ideal de cara a la temporada formal.";
        }

        // Construct 100% unique title using week, day, element format
        const formattedTitle = `[W${wIdx + 1}-D${dIdx + 1}-D${drillIdxInDay + 1}] ${rawTitle}`;

        // Technical description with baseline + progressive evolution
        const description = `Rutina especializada ${playerRoleLabel}. Consiste en ${action}, ${detail}. ${evoString} ${modePhrase} Guía de ritmo general: ${intensityGuide}. Cuidado biomecánico del Coach: ${biomechanicsAdvice} ${ageGoal}`;

        const assignedObjective = `${category === "tiro" || category === "kobe" ? "Alinear codo a 90°." : "Bajar centro de gravedad."} RPE aconsejado: ${rpePhrase}.`;

        drills.push({
          id: `w${wIdx + 1}-d${dIdx + 1}-dr${drillIdxInDay + 1}-${category}`,
          title: formattedTitle,
          category,
          description,
          durationMinutes: drillDuration,
          intensity: level === "elite" ? "Alta" : level === "casual" ? "Baja" : "Media",
          targetReps: targetRepsText,
          assignedObjective
        });

        currentMinutesSum += drillDuration;
        drillIdxInDay++;
      }

      return {
        dayName,
        theme: `Día ${dIdx + 1}: ${weekTheme} (Enfoque ${dayName})`,
        drills
      };
    });

    return {
      weekName,
      theme: weekTheme,
      days: dWeeks
    };
  });

  return {
    title: `Pinetys Grind Summer Academy (${ageGroup} años) • Programa de ${numWeeks} Semanas`,
    description: `Rutinas físicas y mecánicas profesionales basadas en programas Prep School USA de primer nivel. Personalizado con estilo ${role === "shooter" ? "Tirador" : role === "guard" ? "Playmaker" : role === "big" ? "Poste Bajo" : "Todoterreno"}, modalidad ${mode === "duo" ? "Parejas" : "Individual"} e intensidad de ritmo ${level === "elite" ? "Élite NCAA" : level === "casual" ? "Casual Recreativo" : "Competitivo Club"}. Adaptado biomecánicamente para cuidar las articulaciones, calentar adecuadamente y evitar lesiones.`,
    recommendedWeeklyHours: daysOfWeek.length * hours,
    weeks: weeks
  };
}

// Vite integration middleware
async function startServer() {
  // Load persistent data from disk and Cloud Firestore
  await loadData();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
