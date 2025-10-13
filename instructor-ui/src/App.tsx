import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Signal,
  Search,
  Wifi,
  WifiOff,
  Filter,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

// ---- Types ----
interface ParticipantData {
  id: string;
  name: string;
  badges: BadgeData[];
  connected: boolean;
  lastSeen: string;
  isOnline: boolean; // Added this field
}

interface BadgeData {
  id: string;
  name: string;
  earnedAt: string;
}

interface Participant {
  id: string;
  name: string;
  email?: string;
  progress: number;
  lastActivity: string;
  badges: string[];
  isOnline: boolean; // Added this field
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ---- Badge Helper ----
const getBadgeEmoji = (badgeId: string): string => {
  const emojis: Record<string, string> = {
    "chamber-1": "🏛️",
    "module-master": "🏛️",
    "chamber-2": "⚔️",
    "controller-pro": "⚔️",
    "chamber-3": "💡",
    "di-ninja": "💡",
    "scope-expert": "🧩",
    "lifecycle-master": "🧬",
    "chamber-4": "🌊",
    "validation-guru": "🌊",
    "chamber-5": "🧱",
    "database-hero": "🧱",
    "chamber-6": "🔮",
    "graphql-master": "🔮",
    "cache-champion": "💾",
    "file-handler": "📂",
    "chamber-7": "🔐",
    "auth-expert": "🔐",
    "chamber-8": "🛡️",
    "guard-warrior": "🛡️",
    "interceptor-wizard": "✨",
    "middleware-maestro": "⚙️",
    "chamber-9": "📡",
    "websocket-wizard": "📡",
    "chamber-10": "⚙️",
    microservices: "⚙️",
    "event-master": "🧠",
    "chamber-11": "👁️",
    "health-guardian": "👁️",
    "test-champion": "🧪",
    "config-wizard": "📜",
    "chamber-12": "🐳",
    docker: "🐳",
    deployment: "🐳",
    "workshop-complete": "🏆",
  };
  return emojis[badgeId] || "🎯";
};

// ---- Helpers ----
const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden">
    <motion.div
      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
    />
  </div>
);

const Badge = ({ label, badgeId }: { label: string; badgeId?: string }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700/60 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200">
    <span className="text-base">{badgeId ? getBadgeEmoji(badgeId) : "🎯"}</span>
    <span>{label}</span>
  </div>
);

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  accent = "from-emerald-400 to-cyan-400",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) => (
  <motion.div
    initial={{ y: 12, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="rounded-3xl bg-neutral-900/80 ring-1 ring-white/5 p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]"
  >
    <div className="flex items-center justify-between">
      <div
        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-neutral-950 shadow-inner`}
      >
        <Icon className="h-6 w-6" />
      </div>
      {sub ? <span className="text-sm text-neutral-400">{sub}</span> : null}
    </div>
    <div className="mt-5 text-4xl font-bold tracking-tight">{value}</div>
    <div className="mt-2 text-base text-neutral-400">{label}</div>
  </motion.div>
);

export default function NestJSWorkshopDashboard() {
  const [query, setQuery] = useState("");
  const [connected, setConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/participants`);
        if (!response.ok) throw new Error("Failed to fetch participants");

        const data = await response.json();
        const formatted: Participant[] = (data.participants || []).map(
          (p: ParticipantData) => ({
            id: p.id,
            name: p.name,
            progress: Math.round((p.badges.length / 20) * 100),
            lastActivity: new Date(p.lastSeen).toLocaleTimeString(),
            badges: p.badges.map((b) => b.id),
            isOnline: p.isOnline, // Include online status
          })
        );

        setParticipants(formatted);
        setConnected(true);
        setError(null);
      } catch (err) {
        setConnected(false);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(
    () =>
      participants.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [participants, query]
  );

  // Only count participants who are currently online
  const activeCount = participants.filter((p) => p.isOnline).length;

  // Calculate average only for  participants
  const avg = participants.length
    ? Math.round(
        participants.reduce((s, p) => s + p.progress, 0) / participants.length
      )
    : 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 text-neutral-100">
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  NestJS Workshop
                </h1>
                <p className="text-sm text-neutral-400 mt-1">
                  Instructor Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ring-1 ring-white/10 ${
                  connected
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                {connected ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}{" "}
                {connected ? "Connected" : "Disconnected"}
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search participants…"
                  className="w-72 rounded-xl bg-neutral-900 px-11 py-3 text-base placeholder:text-neutral-500 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 pb-28 pt-10">
        {error && (
          <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/30 p-6 text-red-300">
            <div className="flex items-start gap-4">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold">{error}</p>
                <p className="text-sm text-red-400/80 mt-2">
                  Ensure the service is running at {API_BASE_URL}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <StatCard
            icon={Users}
            label="Active participants"
            value={activeCount}
            sub="Connected to workshop"
          />
          <StatCard
            icon={TrendingUp}
            label="Average progress"
            value={`${avg}%`}
            sub="Overall completion"
            accent="from-sky-400 to-indigo-400"
          />
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            Participant Progress
          </h2>
          <p className="text-base text-neutral-400 mb-6">
            Monitor individual status, badges, and last activity.
          </p>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/10 bg-neutral-900/60 p-14 text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-neutral-800">
                  <span className="text-4xl">👋</span>
                </div>
                <div className="text-xl font-medium">No participants found</div>
                <div className="mt-2 text-base text-neutral-400">
                  Waiting for participants to join the workshop…
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="mt-8 divide-y divide-white/5 overflow-hidden rounded-3xl bg-neutral-900/60 ring-1 ring-white/10">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className={`grid grid-cols-1 gap-6 p-8 sm:grid-cols-12 sm:items-center transition-opacity ${
                    !p.isOnline ? "opacity-50" : ""
                  }`}
                >
                  <div className="sm:col-span-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-neutral-800 text-base font-semibold">
                          {p.name.charAt(0)}
                        </div>
                        {/* Online status indicator */}
                        <div
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-neutral-900 ${
                            p.isOnline ? "bg-emerald-500" : "bg-neutral-600"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-lg leading-6">
                            {p.name}
                          </div>
                          {!p.isOnline && (
                            <span className="text-xs text-neutral-500 px-2 py-0.5 rounded bg-neutral-800">
                              Offline
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-neutral-400 mt-1">
                          Last activity • {p.lastActivity}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <div className="flex items-center gap-4">
                      <ProgressBar value={p.progress} />
                      <div className="text-base tabular-nums text-neutral-300">
                        {p.progress}%
                      </div>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <div className="flex flex-wrap gap-3">
                      {p.badges.length === 0 ? (
                        <span className="text-sm text-neutral-500">
                          No badges yet
                        </span>
                      ) : (
                        p.badges.map((badgeId, i) => (
                          <Badge
                            key={i}
                            label={badgeId
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                            badgeId={badgeId}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
