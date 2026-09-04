import type { ComponentType, SVGProps } from 'react'
import { CraneIcon, ClipboardCheckIcon, ContainerStackIcon } from '../components/icons'

export const serviceIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'port-captain': CraneIcon,
  'survey-inspection': ClipboardCheckIcon,
  logistics: ContainerStackIcon,
}
