import { TYPE_LABEL, type CelestialBody } from "../data/bodies";

interface Props {
  body: CelestialBody;
  onClose: () => void;
}

export default function InfoPanel({ body, onClose }: Props) {
  const accent = body.type === "comet" ? "#7fd6f2" : "#f6b04d";
  return (
    <aside
      key={body.id}
      className="animate-panel-in pointer-events-auto absolute inset-x-3 bottom-[272px] z-30 flex max-h-[38vh] flex-col overflow-hidden rounded-xl border border-white/10 bg-panel/90 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-md md:inset-x-auto md:right-4 md:top-24 md:bottom-40 md:max-h-none md:w-[min(360px,calc(100vw-32px))]"
      role="dialog"
      aria-label={`Данные: ${body.name}`}
    >
      {/* шапка карточки */}
      <div className="relative shrink-0 border-b border-white/8 px-5 pb-4 pt-5">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-25"
          style={{
            background: `radial-gradient(120% 100% at 85% 0%, ${accent}55, transparent 60%)`,
          }}
        />
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: accent, borderColor: `${accent}55`, background: `${accent}14` }}
            >
              <span
                className="blink-dot inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: accent }}
              />
              {TYPE_LABEL[body.type]}
            </span>
            <h2 className="font-display mt-2.5 text-[22px] font-bold leading-tight text-white">
              {body.name}
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-dim">
              {body.latin}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть панель"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 text-dim transition-colors hover:border-white/25 hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* параметры */}
      <div className="chip-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
          Параметры тела
        </p>
        <dl className="mt-3 space-y-2.5">
          {body.facts.map((f) => (
            <div
              key={f.label}
              className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2"
            >
              <dt className="text-[12px] text-dim">{f.label}</dt>
              <dd
                className="text-right font-mono text-[13px] font-semibold text-ink"
                style={{ color: f.label === "Диаметр" || f.label === "Диаметр ядра" ? accent : undefined }}
              >
                {f.value}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 border-b border-white/5 pb-2">
            <dt className="text-[12px] text-dim">Расстояние</dt>
            <dd className="text-right font-mono text-[12px] font-medium text-ink">
              {body.distanceLabel}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[12px] text-dim">Период обращения</dt>
            <dd className="text-right font-mono text-[12px] font-medium text-ink">
              {body.periodLabel}
            </dd>
          </div>
        </dl>

        <p className="font-mono mt-5 text-[10px] uppercase tracking-[0.22em] text-dim">
          Особенности
        </p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink/90">
          {body.description}
        </p>
      </div>

      <div className="shrink-0 border-t border-white/8 px-5 py-3">
        <p className="font-mono text-[10px] leading-relaxed tracking-wide text-dim/80">
          Источник: NASA Planetary Fact Sheet · JPL Solar System Dynamics
          <br />
          (открытые данные, nssdc.gsfc.nasa.gov)
        </p>
      </div>
    </aside>
  );
}
