import type { ReactNode } from 'react'
import {
  Newspaper,
  ClipboardText,
  CalendarBlank,
  FileText,
  WarningCircle,
  House,
  Lightning,
  Scales,
  NotePencil,
} from '@phosphor-icons/react'
import type { IconProps } from '@phosphor-icons/react'
import type { MenuId } from '../data/menuItems'

type SectionIconId = MenuId | 'siteLog'

export function renderAppleSectionIcon(
  id: SectionIconId,
  size = 28,
  weight: IconProps['weight'] = 'duotone',
): ReactNode {
  const props = { size, weight, 'aria-hidden': true as const }
  switch (id) {
    case 'news':
      return <Newspaper {...props} />
    case 'formalities':
      return <ClipboardText {...props} />
    case 'schedule':
      return <CalendarBlank {...props} />
    case 'documents':
      return <FileText {...props} />
    case 'complaints':
      return <WarningCircle {...props} />
    case 'handover':
      return <House {...props} />
    case 'meter':
      return <Lightning {...props} />
    case 'notary':
      return <Scales {...props} />
    case 'siteLog':
      return <NotePencil {...props} />
    default:
      return <ClipboardText {...props} />
  }
}
