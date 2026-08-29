import { useCallback, useEffect, useMemo, useState } from "react";
import SolarSystemCanvas from "./components/SolarSystemCanvas";
import InfoPanel from "./components/InfoPanel";
import Controls from "./components/Controls";
import { BODY_MAP } from "./data/bodies";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

export default function App() {
  const reducedMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(() => !reducedMotion);
  const [speed, setSpeed] = useState(6);
  const [scaleK, setScaleK] = useState(0.62);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showComets, setShowComets] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [simDays, setSimDays] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  const onTick = useCallback((d: number) => setSimDays(d), []);

  const simDate = useMemo(() => {
    const d = new Date(Date.UTC(2000, 0, 1, 12) + simDays * 864e5);
    return Number.isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, [simDays]);

  const elapsedYears = useMemo(
    () => (simDays / 365.25).toFixed(1).replace(".", ","),
    [simDays],
  );

  const selectedBody = selectedId ? BODY_MAP[selectedId] : null;

  const toggleComets = () => {
    setShowComets((v) => {
      if (v && selectedId && ["halley", "encke", "halebopp"].includes(selectedId)) {
        setSelectedId(null);
      }
      return !v;
    });
  };

  return (
    <div className="bg-void relative h-full w-full select-none overflow-hidden">
      {/* симуляция */}
      <SolarSystemCanvas
        settings={{
          playing,
          speed,
          scaleK,
          showOrbits,
          showLabels,
          showComets,
          reducedMotion,
        }}
        selectedId={selectedId}
        resetToken={resetToken}
        onSelect={setSelectedId}
        onTick={onTick}
      />

      {/* уголки HUD-рамки */}
      <div className="hud-corner left-2 top-2 rounded-tl border-l border-t" />
      <div className="hud-corner right-2 top-2 rounded-tr border-r border-t" />
      <div className="hud-corner bottom-2 left-2 rounded-bl border-b border-l" />
      <div className="hud-corner bottom-2 right-2 rounded-br border-b border-r" />

      {/* заголовок */}
      <header className="animate-rise pointer-events-none absolute left-5 top-5 z-20 md:left-8 md:top-7">
        <div className="font-mono flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-ice/90">
          <span className="bg-ice/60 inline-block h-3 w-px" />
          Интерактивная орбитальная модель
        </div>
        <h1 className="font-display mt-2.5 text-[clamp(19px,3.1vw,33px)] font-bold leading-none text-white">
          СОЛНЕЧНАЯ
          <span className="text-solar drop-shadow-[0_0_18px_rgba(246,176,77,0.45)]"> СИСТЕМА</span>
        </h1>
        <p className="text-dim mt-2 max-w-[330px] text-[12px] leading-snug">
          8 планет · 3 кометы · реальные периоды, расстояния и эксцентриситеты орбит
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-panel/70 px-3 py-1 font-mono text-[11px] text-solar-hot backdrop-blur-sm md:hidden">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <circle cx="5" cy="5" r="3.4" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 0v2M5 8v2M0 5h2M8 5h2" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          {simDate}
        </div>
      </header>

      {/* модельное время */}
      <div className="animate-rise pointer-events-none absolute right-8 top-7 z-20 hidden text-right md:block" style={{ animationDelay: "0.12s" }}>
        <div className="font-mono text-dim text-[10px] uppercase tracking-[0.25em]">
          Модельное время
        </div>
        <div className="font-mono text-solar-hot mt-1 text-[19px] font-semibold tabular-nums leading-none">
          {simDate}
        </div>
        <div className="font-mono text-dim mt-1.5 text-[10px] tabular-nums">
          +{elapsedYears} года от эпохи J2000
        </div>
      </div>

      {/* уведомление о reduced motion */}
      {reducedMotion && !playing && (
        <div className="font-mono pointer-events-none absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-full border border-ice/30 bg-panel/85 px-4 py-1.5 text-[11px] whitespace-nowrap text-ice">
          Режим «уменьшить движение»: модель на паузе — ▶ запустит её вручную
        </div>
      )}

      {/* подсказка */}
      {!selectedBody && (
        <div className="animate-rise pointer-events-none absolute bottom-40 left-8 z-10 hidden items-center gap-2.5 text-[12.5px] text-dim lg:flex" style={{ animationDelay: "0.6s" }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-solar" aria-hidden="true">
            <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="8" cy="8" r="1.4" fill="currentColor" />
            <path d="M8 0.5v3M8 12.5v3M0.5 8h3M12.5 8h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Нажмите на планету, комету или Солнце — откроется карточка с данными
        </div>
      )}

      {/* карточка данных */}
      {selectedBody && (
        <InfoPanel body={selectedBody} onClose={() => setSelectedId(null)} />
      )}

      {/* пульт */}
      <Controls
        playing={playing}
        speed={speed}
        scaleK={scaleK}
        showOrbits={showOrbits}
        showLabels={showLabels}
        showComets={showComets}
        selectedId={selectedId}
        onTogglePlay={() => setPlaying((v) => !v)}
        onSpeed={setSpeed}
        onScale={setScaleK}
        onToggleOrbits={() => setShowOrbits((v) => !v)}
        onToggleLabels={() => setShowLabels((v) => !v)}
        onToggleComets={toggleComets}
        onReset={() => {
          setResetToken((t) => t + 1);
          setSimDays(0);
        }}
        onSelect={(id) => setSelectedId(id)}
      />
    </div>
  );
}
