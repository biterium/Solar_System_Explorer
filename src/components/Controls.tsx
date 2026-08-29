import { SUN, PLANETS, COMETS } from "../data/bodies";

interface Props {
  playing: boolean;
  speed: number;
  scaleK: number;
  showOrbits: boolean;
  showLabels: boolean;
  showComets: boolean;
  selectedId: string | null;
  onTogglePlay: () => void;
  onSpeed: (v: number) => void;
  onScale: (v: number) => void;
  onToggleOrbits: () => void;
  onToggleLabels: () => void;
  onToggleComets: () => void;
  onReset: () => void;
  onSelect: (id: string) => void;
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4.5 2.7c0-.6.66-.98 1.18-.68l8.03 4.63c.52.3.52 1.06 0 1.36L5.68 12.64c-.52.3-1.18-.07-1.18-.68V2.7z" transform="translate(-1.2 0.66)" />
    </svg>
  );
}
function IconPause() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="2" y="1.5" width="3.6" height="11" rx="1" />
      <rect x="8.4" y="1.5" width="3.6" height="11" rx="1" />
    </svg>
  );
}
function IconReset() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9" />
      <path d="M4 1.5v3h3" />
    </svg>
  );
}

function Toggle({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ${
        on
          ? "border-solar/45 bg-solar/12 text-solar-hot shadow-[0_0_14px_rgba(246,176,77,0.15)]"
          : "border-white/10 text-dim hover:border-white/25 hover:text-ink"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full transition-colors ${on ? "bg-solar" : "bg-dim/50"}`}
      />
      {label}
    </button>
  );
}

export default function Controls(p: Props) {
  const chips = [SUN, ...PLANETS, ...(p.showComets ? COMETS : [])];
  const scaleLabel =
    p.scaleK >= 0.98 ? "истинный" : `сжатие ${Math.round((1 - p.scaleK) * 100)}%`;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 px-3 pb-3 md:px-5 md:pb-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-2">
        {/* легенда-навигация */}
        <div className="chip-scroll pointer-events-auto flex items-center gap-1.5 overflow-x-auto px-1 pb-0.5">
          {chips.map((b) => {
            const sel = p.selectedId === b.id;
            return (
              <button
                key={b.id}
                onClick={() => p.onSelect(b.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
                  sel
                    ? "border-white/30 bg-white/10 text-white"
                    : "border-white/8 text-dim hover:border-white/20 hover:text-ink"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: b.chip, boxShadow: sel ? `0 0 8px ${b.chip}` : "none" }}
                />
                {b.short}
              </button>
            );
          })}
        </div>

        {/* пульт управления */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-white/10 bg-panel/85 px-4 py-3 shadow-[0_14px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
          {/* транспорт */}
          <div className="flex items-center gap-2">
            <button
              onClick={p.onTogglePlay}
              aria-label={p.playing ? "Пауза" : "Воспроизведение"}
              className="grid h-11 w-11 place-items-center rounded-full bg-solar text-[#12100a] shadow-[0_0_22px_rgba(246,176,77,0.45)] transition-transform duration-150 hover:scale-105 active:scale-95"
            >
              {p.playing ? <IconPause /> : <IconPlay />}
            </button>
            <button
              onClick={p.onReset}
              aria-label="Сброс времени (эпоха J2000)"
              title="Сброс к эпохе J2000"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-dim transition-colors hover:border-white/30 hover:text-white"
            >
              <IconReset />
            </button>
          </div>

          <div className="hidden h-8 w-px bg-white/10 sm:block" />

          {/* скорость */}
          <label className="flex min-w-[180px] flex-1 flex-col gap-1.5 sm:max-w-[240px]">
            <span className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
              <span className="text-dim">Скорость</span>
              <span className="text-solar-hot">
                ×{p.speed.toFixed(1)} · {Math.round(p.speed * 10)} сут/с
              </span>
            </span>
            <input
              type="range"
              min={0.2}
              max={40}
              step={0.2}
              value={p.speed}
              onChange={(e) => p.onSpeed(Number(e.target.value))}
              aria-label="Скорость симуляции"
            />
          </label>

          {/* масштаб */}
          <label className="flex min-w-[180px] flex-1 flex-col gap-1.5 sm:max-w-[240px]">
            <span className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
              <span className="text-dim">Масштаб орбит</span>
              <span className="text-ice">{scaleLabel}</span>
            </span>
            <input
              type="range"
              className="ice"
              min={0.42}
              max={1}
              step={0.02}
              value={p.scaleK}
              onChange={(e) => p.onScale(Number(e.target.value))}
              aria-label="Масштаб расстояний"
            />
          </label>

          <div className="hidden h-8 w-px bg-white/10 md:block" />

          {/* переключатели */}
          <div className="flex items-center gap-2">
            <Toggle on={p.showOrbits} label="Орбиты" onClick={p.onToggleOrbits} />
            <Toggle on={p.showLabels} label="Подписи" onClick={p.onToggleLabels} />
            <Toggle on={p.showComets} label="Кометы" onClick={p.onToggleComets} />
          </div>
        </div>
      </div>
    </div>
  );
}
