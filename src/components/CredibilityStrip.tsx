import { company } from '../content/gss'
import { FlagIcon, MapPinIcon, CompassIcon, HelmWheelIcon } from './icons'
import { Counter } from './motion/Counter'

const STATS = [
  { label: 'Established', icon: FlagIcon, target: company.founded, suffix: '' },
  { label: 'Ports network', icon: MapPinIcon, target: company.portCount, suffix: '+' },
  { label: 'Regions served', icon: CompassIcon, target: company.regions.length, suffix: '' },
] as const

export function CredibilityStrip() {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
      {STATS.map((s, i) => (
        <div key={s.label} className={`flex flex-col gap-1.5 ${i > 0 ? 'border-l border-border pl-6' : ''}`}>
          <dt className="data-label-muted flex items-center gap-1.5">
            <s.icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {s.label}
          </dt>
          <dd className="font-heading text-3xl text-ink">
            <Counter target={s.target} suffix={s.suffix} />
          </dd>
        </div>
      ))}
      <div className="flex flex-col gap-1.5 border-l border-border pl-6">
        <dt className="data-label-muted flex items-center gap-1.5">
          <HelmWheelIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          Team
        </dt>
        <dd className="font-heading text-xl text-ink sm:text-2xl">Master Mariners</dd>
      </div>
    </dl>
  )
}
