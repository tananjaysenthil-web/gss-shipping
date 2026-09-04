import type { ServiceSection as ServiceSectionData } from '../content/gss'
import { serviceIcons } from '../content/serviceIcons'
import { DimensionDivider } from './DimensionDivider'
import { Reveal } from './motion/Reveal'
import { RevealGroup } from './motion/RevealGroup'

export function ServiceSection({ section, index }: { section: ServiceSectionData; index: number }) {
  const Icon = serviceIcons[section.id]

  return (
    <Reveal as="section" id={section.id} className="scroll-mt-24 py-10">
      {index > 0 ? <DimensionDivider className="mb-10" /> : null}
      <div className="flex items-start gap-4">
        {Icon ? <Icon className="mt-1 h-8 w-8 flex-shrink-0 text-coral" aria-hidden="true" /> : null}
        <h2 className="text-2xl text-ink sm:text-3xl">{section.title}</h2>
      </div>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{section.summary}</p>
      <RevealGroup as="ul" each={0.05} className="mt-5 grid gap-2 sm:grid-cols-2">
        {section.items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink/85">
            <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-coral" />
            <span>{item}</span>
          </li>
        ))}
      </RevealGroup>
    </Reveal>
  )
}
