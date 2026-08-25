import Link from 'next/link';
import { CRITERION_ORDER, type CriterionKey, type ThresholdConfig } from '@/lib/types';
import { shortDate } from '@/lib/time';

export interface FilterState {
  from: string;
  to: string;
  region?: string;
  criterion?: CriterionKey | 'all';
  status?: string;
}

function href(base: string, state: FilterState, patch: Partial<FilterState>): string {
  const next = { ...state, ...patch };
  const q = new URLSearchParams();
  q.set('from', next.from);
  q.set('to', next.to);
  if (next.region) q.set('region', next.region);
  if (next.criterion && next.criterion !== 'all') q.set('criterion', next.criterion);
  if (next.status && next.status !== 'all') q.set('status', next.status);
  return `${base}?${q.toString()}`;
}

function Chip({
  active,
  children,
  to,
}: {
  active: boolean;
  children: React.ReactNode;
  to: string;
}) {
  return (
    <Link
      href={to}
      className="rounded-md border px-2.5 py-1 text-xs whitespace-nowrap transition-colors"
      style={{
        borderColor: active ? 'transparent' : 'var(--border)',
        background: active ? 'var(--text)' : 'var(--surface)',
        color: active ? 'var(--surface)' : 'var(--muted)',
      }}
    >
      {children}
    </Link>
  );
}

export function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 w-20 shrink-0 text-xs muted">{label}</span>
      {children}
    </div>
  );
}

export function Filters({
  base,
  state,
  regions,
  dates,
  config,
  showCriterion = true,
  showStatus = true,
}: {
  base: string;
  state: FilterState;
  regions: string[];
  dates: string[];
  config: ThresholdConfig;
  showCriterion?: boolean;
  showStatus?: boolean;
}) {
  const first = dates[0] ?? state.from;
  const last = dates[dates.length - 1] ?? state.to;
  const presets: { label: string; from: string; to: string }[] = [
    { label: 'Весь период', from: first, to: last },
    { label: 'Последний день', from: last, to: last },
  ];
  if (dates.length >= 3) {
    presets.splice(1, 0, { label: '3 дня', from: dates[Math.max(0, dates.length - 3)], to: last });
  }

  return (
    <div className="surface flex flex-col gap-2.5 p-3">
      <FilterRow label="Период">
        {presets.map((p) => (
          <Chip
            key={p.label}
            active={state.from === p.from && state.to === p.to}
            to={href(base, state, { from: p.from, to: p.to })}
          >
            {p.label}
          </Chip>
        ))}
        <span className="ml-1 text-xs muted">
          {shortDate(state.from)} — {shortDate(state.to)}
        </span>
      </FilterRow>

      <FilterRow label="Супервайзер">
        <Chip active={!state.region} to={href(base, state, { region: undefined })}>
          все
        </Chip>
        {regions.map((r) => (
          <Chip key={r} active={state.region === r} to={href(base, state, { region: r })}>
            {r}
          </Chip>
        ))}
      </FilterRow>

      {showCriterion && (
        <FilterRow label="Критерий">
          <Chip
            active={!state.criterion || state.criterion === 'all'}
            to={href(base, state, { criterion: 'all' })}
          >
            все (агрегат)
          </Chip>
          {CRITERION_ORDER.map((c) => (
            <Chip key={c} active={state.criterion === c} to={href(base, state, { criterion: c })}>
              {config.criteria[c]?.title ?? c}
              {config.criteria[c]?.confirmed === false && (
                <span title="Пороги требуют подтверждения"> ⚠</span>
              )}
            </Chip>
          ))}
        </FilterRow>
      )}

      {showStatus && (
        <FilterRow label="Статус">
          <Chip active={!state.status || state.status === 'all'} to={href(base, state, { status: 'all' })}>
            любой
          </Chip>
          <Chip active={state.status === 'red'} to={href(base, state, { status: 'red' })}>
            🔴 только красные
          </Chip>
          <Chip active={state.status === 'yellow'} to={href(base, state, { status: 'yellow' })}>
            🟡 есть жёлтые
          </Chip>
        </FilterRow>
      )}
    </div>
  );
}

export { href as filterHref };
