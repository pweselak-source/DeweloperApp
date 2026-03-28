import { useState, useEffect, useMemo, Fragment } from 'react'
import { AppBar } from './components/AppBar'
import { SideMenu } from './components/SideMenu'
import { BackOfficeMenu } from './components/BackOfficeMenu'
import { BackOfficeStatistics } from './components/BackOfficeStatistics'
import { MainContent } from './components/MainContent'
import { NewsContent } from './components/NewsContent'
import type { MenuId } from './data/menuItems'

const THEME_STORAGE_KEY = 'app-theme'
export type AppTheme = 'halfBlack' | 'allBlack' | 'domestaColors' | 'allWhite'
type BackOfficeView =
  | 'investments'
  | 'clients'
  | 'permissions'
  | 'calendar-management'
  | 'calendar-preview'
  | 'statistics'
  | 'construction-schedule'
type InvestmentTab = 'Inwestycje' | 'Budynki' | 'Mieszkania' | 'Komorki Lokatorskie' | 'Miejsca postojowe'
type ApartmentFormSubTab = 'details' | 'paymentSchedule' | 'tasks' | 'complaints'
type ComplaintStatus = 'zgłoszona' | 'odrzucona' | 'uznana'
type ComplaintTimelineEntry = {
  id: string
  kind: 'submitted' | 'comment' | 'status_change'
  author: string
  at: string
  body?: string
  newStatus?: ComplaintStatus
}
type ApartmentComplaint = {
  id: number
  submittedAt: string
  title: string
  status: ComplaintStatus
  timeline: ComplaintTimelineEntry[]
}
type ApartmentFormalitiesStatus = 'zablokowane' | 'do podpisu' | 'podpisana'
type ApartmentHandoverTaskStatus = 'zablokowane' | 'czeka na umówienie' | 'zaplanowane' | 'rozpatrywanie reklamacji' | 'odebrano'
type ApartmentNotarialActTaskStatus = 'zablokowane' | 'czeka na umówienie' | 'zaplanowane' | 'podpisany'
type BuildingStatus = 'W budowie' | 'Na wykonczeniu' | 'Oddany' | 'Wyprzedany'
type BuildingColumnKey =
  | 'lp'
  | 'investment'
  | 'address'
  | 'status'
  | 'apartmentsTotal'
  | 'apartmentsAssigned'
  | 'apartmentsUnassigned'
  | 'actions'
type ApartmentColumnKey =
  | 'investment'
  | 'building'
  | 'nr'
  | 'area'
  | 'rooms'
  | 'balcony'
  | 'orientation'
  | 'floor'
  | 'files'
  | 'client'
type Investment = {
  id: number
  name: string
  address: string
  buildings: number
  apartments: number
  handoverDate: string
  description: string
}
type Building = {
  id: number
  investmentId: number
  address: string
  status: BuildingStatus
  apartmentsTotal: number
  apartmentsAssigned: number
}
type Apartment = {
  id: number
  buildingId: number
  address: string
  unitNumber: string
  area: number
  rooms: number
  hasBalcony: boolean
  orientation: string
  floor: number
  fileName: string
  fileType: string
  assignedClient: string
}

/** Wiersz harmonogramu — wymagane: kwota raty, termin; opcjonalne: spłata, data, notatka */
type PaymentScheduleSampleRow = {
  id: number
  installmentPln: number
  dueDate: string
  paidPln: number | null
  paidDate: string | null
  note: string | null
}

type PaymentScheduleDraftFields = {
  installmentPln: string
  dueDate: string
  paidPln: string
  paidDate: string
  note: string
}

const parsePaymentScheduleDraftFields = (draft: PaymentScheduleDraftFields): Omit<PaymentScheduleSampleRow, 'id'> | null => {
  const instRaw = draft.installmentPln.trim().replace(',', '.')
  const installment = parseFloat(instRaw)
  if (Number.isNaN(installment) || installment <= 0) return null
  const due = draft.dueDate.trim()
  if (!due) return null

  let paidPln: number | null = null
  const paidRaw = draft.paidPln.trim().replace(',', '.')
  if (paidRaw !== '') {
    const p = parseFloat(paidRaw)
    if (Number.isNaN(p) || p < 0) return null
    paidPln = p
  }

  const paidDateRaw = draft.paidDate.trim()
  const paidDate = paidDateRaw === '' ? null : paidDateRaw

  const noteRaw = draft.note.trim()
  const note = noteRaw === '' ? null : noteRaw

  return { installmentPln: installment, dueDate: due, paidPln, paidDate, note }
}

const emptyPaymentScheduleDraft = (): PaymentScheduleDraftFields => ({
  installmentPln: '',
  dueDate: '',
  paidPln: '',
  paidDate: '',
  note: '',
})

const formatPlIsoDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}.${m}.${y}`
}

const pln = (value: number) =>
  new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

/** Kwota z separatorem pl-PL i sufiksem „ PLN” (podsumowanie nad harmonogramem) */
const formatPlnAmountPln = (value: number) =>
  `${new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} PLN`

const SAMPLE_APARTMENT_PAYMENT_SCHEDULE: PaymentScheduleSampleRow[] = [
  { id: 1, installmentPln: 45_000, dueDate: '2025-03-31', paidPln: 45_000, paidDate: '2025-03-28', note: 'Wpłata przelewem, zgodnie z umową' },
  { id: 2, installmentPln: 45_000, dueDate: '2025-06-30', paidPln: 45_000, paidDate: '2025-06-27', note: null },
  { id: 3, installmentPln: 45_000, dueDate: '2025-09-30', paidPln: 45_000, paidDate: '2025-09-29', note: 'Potwierdzenie w biurze' },
  { id: 4, installmentPln: 45_000, dueDate: '2025-12-31', paidPln: null, paidDate: null, note: 'Termin zbliża się — przypomnienie wysłane' },
  { id: 5, installmentPln: 50_000, dueDate: '2026-03-31', paidPln: null, paidDate: null, note: null },
  { id: 6, installmentPln: 50_000, dueDate: '2026-06-30', paidPln: 25_000, paidDate: '2026-06-15', note: 'Częściowa wpłata, reszta do uzgodnienia' },
  { id: 7, installmentPln: 50_000, dueDate: '2026-09-30', paidPln: null, paidDate: null, note: null },
  { id: 8, installmentPln: 50_000, dueDate: '2026-12-31', paidPln: null, paidDate: null, note: 'Ostatnia rata przed odbiorem kluczy' },
  { id: 9, installmentPln: 35_000, dueDate: '2027-03-31', paidPln: null, paidDate: null, note: null },
  { id: 10, installmentPln: 35_000, dueDate: '2027-06-30', paidPln: null, paidDate: null, note: 'Rozliczenie końcowe po odbiorze' },
]

const formatComplaintDateTime = (iso: string) =>
  new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

const complaintStatusBadgeClass = (s: ComplaintStatus) => {
  switch (s) {
    case 'zgłoszona':
      return 'bg-amber-100 text-amber-900 ring-1 ring-amber-200/80'
    case 'odrzucona':
      return 'bg-red-100 text-red-800 ring-1 ring-red-200/80'
    case 'uznana':
      return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80'
    default:
      return 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
  }
}

const SAMPLE_APARTMENT_COMPLAINTS: ApartmentComplaint[] = [
  {
    id: 1,
    submittedAt: '2025-11-12T09:15:00',
    title: 'Nieszczelność okna w salonie',
    status: 'uznana',
    timeline: [
      { id: '1a', kind: 'submitted', author: 'Jan Kowalski', at: '2025-11-12T09:15:00', body: 'Zgłoszenie zarejestrowane w systemie.' },
      { id: '1b', kind: 'comment', author: 'Serwis Domesta', at: '2025-11-13T11:20:00', body: 'Umówiono wizytę technika.' },
      { id: '1c', kind: 'comment', author: 'Technik P. Nowak', at: '2025-11-14T14:05:00', body: 'Potwierdzono wadę uszczelki.' },
      { id: '1d', kind: 'status_change', author: 'Dział reklamacji', at: '2025-11-18T16:30:00', newStatus: 'uznana', body: 'Reklamacja uznana; naprawa w ramach gwarancji.' },
    ],
  },
  {
    id: 2,
    submittedAt: '2025-10-03T08:40:00',
    title: 'Różnica odcienia płytek w łazience',
    status: 'odrzucona',
    timeline: [
      { id: '2a', kind: 'submitted', author: 'Anna Wiśniewska', at: '2025-10-03T08:40:00', body: 'Zgłoszenie zarejestrowane w systemie.' },
      { id: '2b', kind: 'comment', author: 'Konsultant', at: '2025-10-05T10:00:00', body: 'Dopasowanie w tolerancji producenta.' },
      { id: '2c', kind: 'status_change', author: 'Dział reklamacji', at: '2025-10-09T15:12:00', newStatus: 'odrzucona', body: 'Brak podstaw do uznania reklamacji.' },
    ],
  },
  {
    id: 3,
    submittedAt: '2026-01-20T16:45:00',
    title: 'Hałas od instalacji wentylacyjnej',
    status: 'zgłoszona',
    timeline: [
      { id: '3a', kind: 'submitted', author: 'Marek Zieliński', at: '2026-01-20T16:45:00', body: 'Zgłoszenie zarejestrowane w systemie.' },
      { id: '3b', kind: 'comment', author: 'Serwis Domesta', at: '2026-01-21T09:30:00', body: 'Prosimy o nagranie dźwięku — analiza w toku.' },
      { id: '3c', kind: 'comment', author: 'Serwis Domesta', at: '2026-01-22T13:15:00', body: 'Zespół weryfikuje parametry instalacji.' },
    ],
  },
]

function App() {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null
      if (saved === 'allBlack' || saved === 'domestaColors' || saved === 'allWhite') return saved
      return 'halfBlack'
    } catch {
      return 'halfBlack'
    }
  })
  const [menuCollapsed, setMenuCollapsed] = useState(true)
  const [activeSection, setActiveSection] = useState<MenuId | null>(null)
  const [showNewsOnly, setShowNewsOnly] = useState(false)
  const [showBackOffice, setShowBackOffice] = useState(false)
  const [backOfficeView, setBackOfficeView] = useState<BackOfficeView>('investments')
  const [selectedInvestment, setSelectedInvestment] = useState('Polana Kampinowska')
  const [selectedApartment, setSelectedApartment] = useState('Uranowa 21A/3')
  const [investmentsTab, setInvestmentsTab] = useState<InvestmentTab>('Inwestycje')
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: 1,
      name: 'Polana Kampinowska',
      address: 'ul. Kampinowska 12, Gdansk',
      buildings: 4,
      apartments: 128,
      handoverDate: '2026-11-30',
      description: 'Nowoczesne osiedle z duza iloscia zieleni i dostepem do uslug.',
    },
    {
      id: 2,
      name: 'Zielone Ogrody',
      address: 'ul. Ogrodowa 7, Gdynia',
      buildings: 6,
      apartments: 176,
      handoverDate: '2027-04-15',
      description: 'Inwestycja rodzinna, zaplanowana wokol zielonych dziedzincow.',
    },
    {
      id: 3,
      name: 'Nowa Morena',
      address: 'ul. Morenowa 20, Gdansk',
      buildings: 3,
      apartments: 92,
      handoverDate: '2026-09-20',
      description: 'Kameralna zabudowa z szybkim dojazdem do centrum miasta.',
    },
  ])
  const [investmentFormOpen, setInvestmentFormOpen] = useState(false)
  const [editingInvestmentId, setEditingInvestmentId] = useState<number | null>(null)
  const [expandedInvestmentIds, setExpandedInvestmentIds] = useState<number[]>([])
  const [expandedBuildingIds, setExpandedBuildingIds] = useState<number[]>([])
  const [investmentNameForm, setInvestmentNameForm] = useState('')
  const [investmentAddressForm, setInvestmentAddressForm] = useState('')
  const [investmentDateForm, setInvestmentDateForm] = useState('')
  const [investmentDescriptionForm, setInvestmentDescriptionForm] = useState('')
  const [investmentBuildingsSectionOpen, setInvestmentBuildingsSectionOpen] = useState(false)
  const [apartmentsSectionOpen, setApartmentsSectionOpen] = useState(false)
  const [buildingApartmentsSectionOpen, setBuildingApartmentsSectionOpen] = useState(true)
  const [buildingFormOpen, setBuildingFormOpen] = useState(false)
  const [editingBuildingId, setEditingBuildingId] = useState<number | null>(null)
  const [buildingInvestmentIdForm, setBuildingInvestmentIdForm] = useState<number>(1)
  const [buildingAddressForm, setBuildingAddressForm] = useState('')
  const [buildingStatusForm, setBuildingStatusForm] = useState<BuildingStatus>('W budowie')
  const [buildingApartmentsTotalForm, setBuildingApartmentsTotalForm] = useState<number>(0)
  const [buildingApartmentsAssignedForm, setBuildingApartmentsAssignedForm] = useState<number>(0)
  const [buildingFilterInvestmentId, setBuildingFilterInvestmentId] = useState<'all' | number>('all')
  const [buildingFilterStatus, setBuildingFilterStatus] = useState<'all' | BuildingStatus>('all')
  const [buildingApartmentsUploadOpen, setBuildingApartmentsUploadOpen] = useState(false)
  const [buildingApartmentsUploadTargetId, setBuildingApartmentsUploadTargetId] = useState<number | null>(null)
  const [buildingColumnOrder, setBuildingColumnOrder] = useState<BuildingColumnKey[]>([
    'lp',
    'investment',
    'address',
    'status',
    'apartmentsTotal',
    'apartmentsAssigned',
    'apartmentsUnassigned',
    'actions',
  ])
  const [buildingColumnWidths, setBuildingColumnWidths] = useState<Record<BuildingColumnKey, number>>({
    lp: 56,
    investment: 210,
    address: 220,
    status: 150,
    apartmentsTotal: 140,
    apartmentsAssigned: 190,
    apartmentsUnassigned: 210,
    actions: 150,
  })
  const [buildingResizing, setBuildingResizing] = useState<{ key: BuildingColumnKey; startX: number; startWidth: number } | null>(null)
  const [apartmentFilterInvestmentId, setApartmentFilterInvestmentId] = useState<'all' | number>('all')
  const [apartmentFilterBuildingId, setApartmentFilterBuildingId] = useState<'all' | number>('all')
  const [apartmentColumnOrder, setApartmentColumnOrder] = useState<ApartmentColumnKey[]>([
    'investment',
    'building',
    'nr',
    'area',
    'rooms',
    'balcony',
    'orientation',
    'floor',
    'files',
    'client',
  ])
  const [apartmentColumnWidths, setApartmentColumnWidths] = useState<Record<ApartmentColumnKey, number>>({
    investment: 190,
    building: 190,
    nr: 90,
    area: 120,
    rooms: 100,
    balcony: 100,
    orientation: 130,
    floor: 90,
    files: 230,
    client: 190,
  })
  const [apartmentResizing, setApartmentResizing] = useState<{ key: ApartmentColumnKey; startX: number; startWidth: number } | null>(null)
  const [buildings, setBuildings] = useState<Building[]>([
    { id: 1, investmentId: 1, address: 'ul. Kampinowska 12A', status: 'W budowie', apartmentsTotal: 48, apartmentsAssigned: 18 },
    { id: 2, investmentId: 1, address: 'ul. Kampinowska 12B', status: 'Na wykonczeniu', apartmentsTotal: 40, apartmentsAssigned: 34 },
    { id: 3, investmentId: 2, address: 'ul. Ogrodowa 7A', status: 'Oddany', apartmentsTotal: 62, apartmentsAssigned: 62 },
    { id: 4, investmentId: 2, address: 'ul. Ogrodowa 7B', status: 'W budowie', apartmentsTotal: 54, apartmentsAssigned: 16 },
    { id: 5, investmentId: 3, address: 'ul. Morenowa 20A', status: 'Wyprzedany', apartmentsTotal: 30, apartmentsAssigned: 30 },
  ])
  const [apartments, setApartments] = useState<Apartment[]>([
    {
      id: 1,
      buildingId: 1,
      address: 'ul. Kampinowska 12A',
      unitNumber: 'A/01',
      area: 54.2,
      rooms: 3,
      hasBalcony: true,
      orientation: 'Poludnie',
      floor: 1,
      fileName: 'rzut-a01.pdf',
      fileType: 'PDF',
      assignedClient: 'Brak (przypisanie pozniej)',
    },
    {
      id: 2,
      buildingId: 1,
      address: 'ul. Kampinowska 12A',
      unitNumber: 'A/12',
      area: 63.8,
      rooms: 4,
      hasBalcony: true,
      orientation: 'Polnocny-zachod',
      floor: 3,
      fileName: 'karta-a12.pdf',
      fileType: 'PDF',
      assignedClient: 'Brak (przypisanie pozniej)',
    },
    {
      id: 3,
      buildingId: 2,
      address: 'ul. Kampinowska 12B',
      unitNumber: 'B/07',
      area: 41.5,
      rooms: 2,
      hasBalcony: false,
      orientation: 'Wschod',
      floor: 2,
      fileName: 'spec-b07.docx',
      fileType: 'DOCX',
      assignedClient: 'Brak (przypisanie pozniej)',
    },
    {
      id: 4,
      buildingId: 3,
      address: 'ul. Ogrodowa 7A',
      unitNumber: 'C/21',
      area: 72.1,
      rooms: 4,
      hasBalcony: true,
      orientation: 'Zachod',
      floor: 5,
      fileName: 'rzut-c21.pdf',
      fileType: 'PDF',
      assignedClient: 'Brak (przypisanie pozniej)',
    },
  ])
  const [apartmentFormOpen, setApartmentFormOpen] = useState(false)
  const [apartmentFormSubTab, setApartmentFormSubTab] = useState<ApartmentFormSubTab>('details')
  const [editingApartmentId, setEditingApartmentId] = useState<number | null>(null)
  const [apartmentBuildingIdForm, setApartmentBuildingIdForm] = useState<number>(1)
  const [apartmentNumberForm, setApartmentNumberForm] = useState('')
  const [apartmentAreaForm, setApartmentAreaForm] = useState<number>(0)
  const [apartmentRoomsForm, setApartmentRoomsForm] = useState<number>(1)
  const [apartmentBalconyForm, setApartmentBalconyForm] = useState(false)
  const [apartmentOrientationForm, setApartmentOrientationForm] = useState('')
  const [apartmentFloorForm, setApartmentFloorForm] = useState<number>(0)
  const [apartmentFileNameForm, setApartmentFileNameForm] = useState('')
  const [apartmentFileTypeForm, setApartmentFileTypeForm] = useState('')
  const [apartmentClientForm, setApartmentClientForm] = useState('')
  const [paymentScheduleRows, setPaymentScheduleRows] = useState<PaymentScheduleSampleRow[]>(() => [...SAMPLE_APARTMENT_PAYMENT_SCHEDULE])
  const [paymentScheduleDraft, setPaymentScheduleDraft] = useState<PaymentScheduleDraftFields>(() => emptyPaymentScheduleDraft())
  const [editingPaymentScheduleId, setEditingPaymentScheduleId] = useState<number | null>(null)
  const [paymentScheduleEditDraft, setPaymentScheduleEditDraft] = useState<PaymentScheduleDraftFields>(() => emptyPaymentScheduleDraft())
  const [apartmentTaskReservationStatus, setApartmentTaskReservationStatus] = useState<ApartmentFormalitiesStatus>('do podpisu')
  const [apartmentTaskPreliminaryStatus, setApartmentTaskPreliminaryStatus] = useState<ApartmentFormalitiesStatus>('zablokowane')
  const [apartmentTaskHandoverStatus, setApartmentTaskHandoverStatus] = useState<ApartmentHandoverTaskStatus>('czeka na umówienie')
  const [apartmentTaskNotarialActStatus, setApartmentTaskNotarialActStatus] = useState<ApartmentNotarialActTaskStatus>('zablokowane')
  const [apartmentComplaintsExpandedId, setApartmentComplaintsExpandedId] = useState<number | null>(null)

  const beginEditPaymentScheduleRow = (row: PaymentScheduleSampleRow) => {
    setEditingPaymentScheduleId(row.id)
    setPaymentScheduleEditDraft({
      installmentPln: String(row.installmentPln),
      dueDate: row.dueDate,
      paidPln: row.paidPln !== null ? String(row.paidPln) : '',
      paidDate: row.paidDate ?? '',
      note: row.note ?? '',
    })
  }

  const cancelPaymentScheduleEdit = () => {
    setEditingPaymentScheduleId(null)
    setPaymentScheduleEditDraft(emptyPaymentScheduleDraft())
  }

  const savePaymentScheduleEdit = () => {
    if (editingPaymentScheduleId === null) return
    const parsed = parsePaymentScheduleDraftFields(paymentScheduleEditDraft)
    if (!parsed) return
    setPaymentScheduleRows((prev) =>
      prev.map((r) => (r.id === editingPaymentScheduleId ? { ...r, ...parsed } : r)),
    )
    setEditingPaymentScheduleId(null)
    setPaymentScheduleEditDraft(emptyPaymentScheduleDraft())
  }

  const addPaymentScheduleRow = () => {
    const parsed = parsePaymentScheduleDraftFields(paymentScheduleDraft)
    if (!parsed) return
    setPaymentScheduleRows((prev) => {
      const nextId = prev.length === 0 ? 1 : Math.max(...prev.map((r) => r.id)) + 1
      return [...prev, { id: nextId, ...parsed }]
    })
    setPaymentScheduleDraft(emptyPaymentScheduleDraft())
    setEditingPaymentScheduleId(null)
  }

  const paymentScheduleTotals = useMemo(() => {
    const cenaCalosci = paymentScheduleRows.reduce((sum, row) => sum + row.installmentPln, 0)
    const splacono = paymentScheduleRows.reduce((sum, row) => sum + (row.paidPln ?? 0), 0)
    return { cenaCalosci, splacono, pozostalo: cenaCalosci - splacono }
  }, [paymentScheduleRows])

  const paymentScheduleRowsSorted = useMemo(
    () => [...paymentScheduleRows].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [paymentScheduleRows],
  )

  const apartmentEnergyMeterPpeDigits = useMemo(
    () => Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join(''),
    [editingApartmentId],
  )

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    if (!buildingResizing) return

    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - buildingResizing.startX
      const nextWidth = Math.max(56, buildingResizing.startWidth + delta)
      setBuildingColumnWidths((prev) => ({ ...prev, [buildingResizing.key]: nextWidth }))
    }

    const handleMouseUp = () => {
      setBuildingResizing(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [buildingResizing])

  useEffect(() => {
    if (!apartmentResizing) return

    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientX - apartmentResizing.startX
      const nextWidth = Math.max(70, apartmentResizing.startWidth + delta)
      setApartmentColumnWidths((prev) => ({ ...prev, [apartmentResizing.key]: nextWidth }))
    }

    const handleMouseUp = () => {
      setApartmentResizing(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [apartmentResizing])

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme)
  }

  const handleSelectSection = (id: MenuId) => {
    setShowBackOffice(false)
    if (id === 'news') {
      setActiveSection('news')
      setShowNewsOnly(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setShowNewsOnly(false)
    setActiveSection(id)
    setMenuCollapsed(false)
    // Przewiń do odpowiedniej sekcji na stronie (tylko dla ekranu głównego)
    const target = document.getElementById(`section-${id}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleToggleCollapse = () => {
    setMenuCollapsed((prev) => !prev)
  }

  const handleGoHome = () => {
    setShowBackOffice(false)
    setShowNewsOnly(false)
    setActiveSection(null)
    setMenuCollapsed(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenBackOffice = () => {
    setShowBackOffice(true)
    setBackOfficeView('investments')
    setShowNewsOnly(false)
    setActiveSection(null)
    setMenuCollapsed(false)
  }

  const openNewInvestmentForm = () => {
    setEditingInvestmentId(null)
    setInvestmentNameForm('')
    setInvestmentAddressForm('')
    setInvestmentDateForm('')
    setInvestmentDescriptionForm('')
    setInvestmentBuildingsSectionOpen(false)
    setApartmentsSectionOpen(false)
    setBuildingFormOpen(false)
    setInvestmentFormOpen(true)
  }

  const openInvestmentDetails = (item: Investment) => {
    setEditingInvestmentId(item.id)
    setInvestmentNameForm(item.name)
    setInvestmentAddressForm(item.address)
    setInvestmentDateForm(item.handoverDate)
    setInvestmentDescriptionForm(item.description)
    setInvestmentBuildingsSectionOpen(false)
    setApartmentsSectionOpen(false)
    setBuildingFormOpen(false)
    setInvestmentFormOpen(true)
  }

  const handleCancelInvestmentForm = () => {
    setInvestmentFormOpen(false)
    setBuildingFormOpen(false)
    setEditingInvestmentId(null)
  }

  const handleSaveInvestment = () => {
    const name = investmentNameForm.trim()
    const address = investmentAddressForm.trim()
    if (!name || !address || !investmentDateForm) return

    if (editingInvestmentId === null) {
      const nextId = investments.length > 0 ? Math.max(...investments.map((i) => i.id)) + 1 : 1
      setInvestments((prev) => [
        ...prev,
        {
          id: nextId,
          name,
          address,
          buildings: 0,
          apartments: 0,
          handoverDate: investmentDateForm,
          description: investmentDescriptionForm.trim(),
        },
      ])
    } else {
      setInvestments((prev) =>
        prev.map((item) =>
          item.id === editingInvestmentId
            ? {
                ...item,
                name,
                address,
                handoverDate: investmentDateForm,
                description: investmentDescriptionForm.trim(),
              }
            : item,
        ),
      )
    }

    setInvestmentFormOpen(false)
    setEditingInvestmentId(null)
  }

  const openNewBuildingForm = () => {
    setEditingBuildingId(null)
    setBuildingInvestmentIdForm(editingInvestmentId ?? investments[0]?.id ?? 1)
    setBuildingAddressForm('')
    setBuildingStatusForm('W budowie')
    setBuildingApartmentsTotalForm(0)
    setBuildingApartmentsAssignedForm(0)
    setBuildingApartmentsSectionOpen(true)
    setBuildingFormOpen(true)
  }

  const openBuildingDetailsForm = (building: Building) => {
    setEditingBuildingId(building.id)
    setBuildingInvestmentIdForm(building.investmentId)
    setBuildingAddressForm(building.address)
    setBuildingStatusForm(building.status)
    setBuildingApartmentsTotalForm(building.apartmentsTotal)
    setBuildingApartmentsAssignedForm(building.apartmentsAssigned)
    setBuildingApartmentsSectionOpen(true)
    setBuildingFormOpen(true)
  }

  const handleCancelBuildingForm = () => {
    setBuildingFormOpen(false)
    setEditingBuildingId(null)
    const linkedInvestment = investments.find((inv) => inv.id === buildingInvestmentIdForm)
    if (linkedInvestment) {
      setEditingInvestmentId(linkedInvestment.id)
      setInvestmentNameForm(linkedInvestment.name)
      setInvestmentAddressForm(linkedInvestment.address)
      setInvestmentDateForm(linkedInvestment.handoverDate)
      setInvestmentDescriptionForm(linkedInvestment.description)
    }
  }

  const handleSaveBuilding = () => {
    const address = buildingAddressForm.trim()
    if (!address) return

    if (editingBuildingId === null) {
      const nextId = buildings.length > 0 ? Math.max(...buildings.map((b) => b.id)) + 1 : 1
      setBuildings((prev) => [
        ...prev,
        {
          id: nextId,
          investmentId: buildingInvestmentIdForm,
          address,
          status: buildingStatusForm,
          apartmentsTotal: Math.max(buildingApartmentsTotalForm, 0),
          apartmentsAssigned: Math.max(Math.min(buildingApartmentsAssignedForm, buildingApartmentsTotalForm), 0),
        },
      ])
    } else {
      setBuildings((prev) =>
        prev.map((b) =>
          b.id === editingBuildingId
            ? {
                ...b,
                investmentId: buildingInvestmentIdForm,
                address,
                status: buildingStatusForm,
                apartmentsTotal: Math.max(buildingApartmentsTotalForm, 0),
                apartmentsAssigned: Math.max(Math.min(buildingApartmentsAssignedForm, buildingApartmentsTotalForm), 0),
              }
            : b,
        ),
      )
    }

    setBuildingFormOpen(false)
    setEditingBuildingId(null)
  }

  const openBuildingFormFromBuildingsTab = () => {
    const preferredInvestmentId =
      buildingFilterInvestmentId === 'all'
        ? investments[0]?.id ?? 1
        : buildingFilterInvestmentId
    setEditingInvestmentId(preferredInvestmentId)
    const linkedInvestment = investments.find((inv) => inv.id === preferredInvestmentId)
    if (linkedInvestment) {
      setInvestmentNameForm(linkedInvestment.name)
      setInvestmentAddressForm(linkedInvestment.address)
      setInvestmentDateForm(linkedInvestment.handoverDate)
      setInvestmentDescriptionForm(linkedInvestment.description)
    }
    setInvestmentFormOpen(true)
    setInvestmentsTab('Inwestycje')
    openNewBuildingForm()
  }

  const openApartmentDetailsForm = (apartment: Apartment) => {
    setApartmentFormSubTab('details')
    setEditingApartmentId(apartment.id)
    setApartmentBuildingIdForm(apartment.buildingId)
    setApartmentNumberForm(apartment.unitNumber)
    setApartmentAreaForm(apartment.area)
    setApartmentRoomsForm(apartment.rooms)
    setApartmentBalconyForm(apartment.hasBalcony)
    setApartmentOrientationForm(apartment.orientation)
    setApartmentFloorForm(apartment.floor)
    setApartmentFileNameForm(apartment.fileName)
    setApartmentFileTypeForm(apartment.fileType)
    setApartmentClientForm(apartment.assignedClient)
    setApartmentFormOpen(true)
  }

  const openNewApartmentForm = () => {
    setApartmentFormSubTab('details')
    setEditingApartmentId(null)
    const defaultBuildingId = buildings[0]?.id ?? 1
    setApartmentBuildingIdForm(defaultBuildingId)
    setApartmentNumberForm('')
    setApartmentAreaForm(0)
    setApartmentRoomsForm(1)
    setApartmentBalconyForm(false)
    setApartmentOrientationForm('')
    setApartmentFloorForm(0)
    setApartmentFileNameForm('')
    setApartmentFileTypeForm('')
    setApartmentClientForm('')
    setApartmentFormOpen(true)
  }

  const handleCancelApartmentForm = () => {
    setApartmentFormOpen(false)
    setEditingApartmentId(null)
    setEditingPaymentScheduleId(null)
    setPaymentScheduleEditDraft(emptyPaymentScheduleDraft())
    setApartmentComplaintsExpandedId(null)
  }

  const handleSaveApartment = () => {
    const unitNumber = apartmentNumberForm.trim()
    if (!unitNumber) return
    const buildingAddr = buildings.find((b) => b.id === apartmentBuildingIdForm)?.address ?? ''

    if (editingApartmentId === null) {
      const nextId = apartments.length > 0 ? Math.max(...apartments.map((a) => a.id)) + 1 : 1
      setApartments((prev) => [
        ...prev,
        {
          id: nextId,
          buildingId: apartmentBuildingIdForm,
          address: buildingAddr,
          unitNumber,
          area: Math.max(apartmentAreaForm, 0),
          rooms: Math.max(apartmentRoomsForm, 1),
          hasBalcony: apartmentBalconyForm,
          orientation: apartmentOrientationForm.trim(),
          floor: apartmentFloorForm,
          fileName: apartmentFileNameForm.trim() || '-',
          fileType: apartmentFileTypeForm.trim() || '-',
          assignedClient: apartmentClientForm.trim() || 'Brak (przypisanie pozniej)',
        },
      ])
    } else {
      setApartments((prev) =>
        prev.map((apartment) =>
          apartment.id === editingApartmentId
            ? {
                ...apartment,
                buildingId: apartmentBuildingIdForm,
                address: buildingAddr || apartment.address,
                unitNumber,
                area: Math.max(apartmentAreaForm, 0),
                rooms: Math.max(apartmentRoomsForm, 1),
                hasBalcony: apartmentBalconyForm,
                orientation: apartmentOrientationForm.trim(),
                floor: apartmentFloorForm,
                fileName: apartmentFileNameForm.trim(),
                fileType: apartmentFileTypeForm.trim(),
                assignedClient: apartmentClientForm.trim(),
              }
            : apartment,
        ),
      )
    }
    setApartmentFormOpen(false)
    setEditingApartmentId(null)
    setEditingPaymentScheduleId(null)
    setPaymentScheduleEditDraft(emptyPaymentScheduleDraft())
    setApartmentComplaintsExpandedId(null)
  }

  const outerBackgroundClass =
    theme === 'allBlack'
      ? 'theme-all-black bg-[#1a1a1a]'
      : theme === 'halfBlack'
        ? 'bg-[radial-gradient(circle_at_top,_#aaaaaa,_#666666,_#333333)]'
        : 'bg-[var(--color-domesta-bg)]'

  const innerBackgroundClass =
    theme === 'allBlack'
      ? 'bg-[#1a1a1a]'
      : theme === 'halfBlack'
        ? 'bg-[radial-gradient(circle_at_top,_#aaaaaa,_#666666,_#333333)]'
        : 'bg-[var(--color-domesta-bg)]'

  const renderInvestmentsTabHeader = (title: InvestmentTab, headingOverride?: string) => (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[var(--color-domesta-gray)]">
        {title === 'Budynki' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="7" height="18" />
            <rect x="13" y="8" width="7" height="13" />
          </svg>
        ) : title === 'Mieszkania' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-6v-6H10v6H4a1 1 0 0 1-1-1Z" />
          </svg>
        ) : title === 'Komorki Lokatorskie' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 10h18M9 4v16M15 4v16" />
          </svg>
        ) : title === 'Miejsca postojowe' ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 19V5h7a4 4 0 0 1 0 8H6" />
            <path d="M10 19h4" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="10" width="7" height="11" />
            <rect x="14" y="3" width="7" height="18" />
          </svg>
        )}
      </span>
      <h2 className="text-2xl font-bold text-[var(--color-domesta-gray)]">{headingOverride ?? title}</h2>
    </div>
  )

  const investmentsTabAddButton = (opts: { onClick?: () => void; title: string; disabled?: boolean }) => (
    <button
      type="button"
      onClick={opts.disabled ? undefined : opts.onClick}
      disabled={opts.disabled}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white ${
        opts.disabled
          ? 'cursor-not-allowed bg-gray-300 text-gray-500'
          : 'bg-[var(--color-domesta-red)] hover:opacity-90'
      }`}
      title={opts.title}
      aria-label={opts.title}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )

  return (
    <div className={`min-h-screen ${outerBackgroundClass}`}>
      <div className={`flex min-h-screen flex-col ${innerBackgroundClass}`}>
        <AppBar
          onNavigateTo={handleSelectSection}
          onThemeChange={handleThemeChange}
          theme={theme}
          onGoHome={handleGoHome}
          onOpenBackOffice={handleOpenBackOffice}
          variant={showBackOffice ? 'backoffice' : 'default'}
        />
        {!showNewsOnly && !showBackOffice && (
          <div className="px-4 pt-3 md:px-6">
            <SideMenu
              collapsed={menuCollapsed}
              activeId={activeSection}
              onSelect={handleSelectSection}
              onToggleCollapse={handleToggleCollapse}
              investmentName={selectedInvestment}
              apartmentLabel={selectedApartment}
              onInvestmentChange={setSelectedInvestment}
              onApartmentChange={setSelectedApartment}
              theme={theme}
            />
          </div>
        )}
        {showBackOffice ? (
          <div className="flex flex-1 gap-4 px-4 pt-3 md:px-6">
            <div className="w-full max-w-[320px] shrink-0">
              <BackOfficeMenu activeItem={backOfficeView} onSelectItem={setBackOfficeView} />
            </div>
            <main className="flex-1 rounded-2xl bg-white p-6" aria-label="BackOffice content area">
              {backOfficeView === 'investments' ? (
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-[var(--color-domesta-gray)]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="8" height="8" />
                        <rect x="13" y="3" width="8" height="5" />
                        <rect x="13" y="10" width="8" height="11" />
                        <rect x="3" y="13" width="8" height="8" />
                      </svg>
                    </span>
                    <h1 className="text-3xl font-bold text-[var(--color-domesta-gray)]">Panel główny</h1>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                    {(['Inwestycje', 'Budynki', 'Mieszkania', 'Komorki Lokatorskie', 'Miejsca postojowe'] as InvestmentTab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setInvestmentsTab(tab)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          tab === investmentsTab
                            ? 'bg-white text-[var(--color-domesta-gray)] shadow-sm'
                            : 'text-gray-600 hover:bg-white hover:text-[var(--color-domesta-gray)]'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  {investmentsTab === 'Inwestycje' && investmentFormOpen ? (
                    buildingFormOpen ? (
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-[var(--color-domesta-gray)]">Szczegoly budynku</h2>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSaveBuilding}
                              className="rounded-lg bg-[var(--color-domesta-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                              Zapisz
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelBuildingForm}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                              title="Powrot do szczegolow inwestycji"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 19V5" />
                                <polyline points="5 12 12 5 19 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-sm text-gray-600">
                              Inwestycja
                              <select
                                value={buildingInvestmentIdForm}
                                onChange={(e) => setBuildingInvestmentIdForm(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              >
                                {investments.map((inv) => (
                                  <option key={inv.id} value={inv.id}>
                                    {inv.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-sm text-gray-600">
                              Adres budynku
                              <input
                                value={buildingAddressForm}
                                onChange={(e) => setBuildingAddressForm(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Status
                              <select
                                value={buildingStatusForm}
                                onChange={(e) => setBuildingStatusForm(e.target.value as BuildingStatus)}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              >
                                <option value="W budowie">W budowie</option>
                                <option value="Na wykonczeniu">Na wykonczeniu</option>
                                <option value="Oddany">Oddany</option>
                                <option value="Wyprzedany">Wyprzedany</option>
                              </select>
                            </label>
                            <label className="text-sm text-gray-600">
                              Ilosc mieszkan
                              <input
                                type="number"
                                min={0}
                                value={buildingApartmentsTotalForm}
                                onChange={(e) => setBuildingApartmentsTotalForm(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600 md:col-span-2">
                              Ilosc przypisanych mieszkan
                              <input
                                type="number"
                                min={0}
                                value={buildingApartmentsAssignedForm}
                                onChange={(e) => setBuildingApartmentsAssignedForm(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                          </div>
                        </div>
                        <section className="rounded-2xl border border-gray-200 bg-white p-5">
                          <button
                            type="button"
                            onClick={() => setBuildingApartmentsSectionOpen((prev) => !prev)}
                            className="mb-3 flex w-full items-center justify-between rounded-lg px-1 text-left"
                          >
                            <h3 className="text-base font-semibold text-[var(--color-domesta-gray)]">Mieszkania budynku</h3>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className={`h-5 w-5 text-gray-500 transition-transform ${buildingApartmentsSectionOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                          {buildingApartmentsSectionOpen && (
                            <div className="overflow-auto rounded-xl border border-gray-200">
                              <table className="min-w-[1050px] bg-white text-[13px]">
                                <thead className="bg-gray-50">
                                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th className="px-3 py-2 font-semibold">Nr</th>
                                    <th className="px-3 py-2 font-semibold">Metraz</th>
                                    <th className="px-3 py-2 font-semibold">Pom.</th>
                                    <th className="px-3 py-2 font-semibold">Balkon</th>
                                    <th className="px-3 py-2 font-semibold">Pol</th>
                                    <th className="px-3 py-2 font-semibold">Pietro</th>
                                    <th className="px-3 py-2 font-semibold">Pliki</th>
                                    <th className="px-3 py-2 font-semibold">Klient</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                  {apartments
                                    .filter((apartment) => (editingBuildingId === null ? false : apartment.buildingId === editingBuildingId))
                                    .map((apartment) => (
                                      <tr key={apartment.id}>
                                        <td className="px-3 py-2 font-medium">{apartment.unitNumber}</td>
                                        <td className="px-3 py-2">{apartment.area.toFixed(1)} m2</td>
                                        <td className="px-3 py-2">{apartment.rooms}</td>
                                        <td className="px-3 py-2">{apartment.hasBalcony ? 'Tak' : 'Nie'}</td>
                                        <td className="px-3 py-2">{apartment.orientation}</td>
                                        <td className="px-3 py-2">{apartment.floor}</td>
                                        <td className="px-3 py-2">
                                          <div className="flex min-w-[220px] flex-col gap-1">
                                            <span className="text-xs text-gray-600">
                                              {apartment.fileName} ({apartment.fileType})
                                            </span>
                                            <input type="file" className="text-xs file:mr-2 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-2 file:py-1 file:text-xs file:text-gray-700 hover:file:bg-gray-50" />
                                          </div>
                                        </td>
                                        <td className="px-3 py-2">{apartment.assignedClient}</td>
                                      </tr>
                                    ))}
                                  {apartments.filter((apartment) => (editingBuildingId === null ? false : apartment.buildingId === editingBuildingId)).length === 0 && (
                                    <tr>
                                      <td className="px-3 py-4 text-sm text-gray-500" colSpan={8}>
                                        Brak mieszkan dla tego budynku.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </section>
                      </section>
                    ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[var(--color-domesta-gray)]">
                          Szczegoly Inwestycji: {investmentNameForm || 'Nowa inwestycja'}
                        </h2>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSaveInvestment}
                            className="rounded-lg bg-[var(--color-domesta-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                          >
                            Zapisz
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelInvestmentForm}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                            title="Powrot"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 19V5" />
                              <polyline points="5 12 12 5 19 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="grid gap-4 md:grid-cols-2">
                          <label className="text-sm text-gray-600">
                            Nazwa
                            <input
                              value={investmentNameForm}
                              onChange={(e) => setInvestmentNameForm(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                            />
                          </label>
                          <label className="text-sm text-gray-600">
                            Adres
                            <input
                              value={investmentAddressForm}
                              onChange={(e) => setInvestmentAddressForm(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                            />
                          </label>
                          <label className="text-sm text-gray-600 md:col-span-2">
                            Data oddania
                            <input
                              type="date"
                              value={investmentDateForm}
                              onChange={(e) => setInvestmentDateForm(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                            />
                          </label>
                          <label className="text-sm text-gray-600 md:col-span-2">
                            Opis
                            <textarea
                              value={investmentDescriptionForm}
                              onChange={(e) => setInvestmentDescriptionForm(e.target.value)}
                              rows={5}
                              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                            />
                          </label>
                        </div>
                      </section>
                      <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-[var(--color-domesta-gray)]">Budynki inwestycji</h3>
                            <button
                              type="button"
                              onClick={openNewBuildingForm}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-domesta-red)] text-white hover:opacity-90"
                              title="Dodaj budynek"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => setInvestmentBuildingsSectionOpen((prev) => !prev)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                            title={investmentBuildingsSectionOpen ? 'Zwin sekcje' : 'Rozwin sekcje'}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className={`h-5 w-5 transition-transform ${investmentBuildingsSectionOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>
                        {investmentBuildingsSectionOpen && (
                          <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="min-w-full bg-white text-sm">
                              <thead className="bg-gray-50">
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                  <th className="px-3 py-2 font-semibold">Adres</th>
                                  <th className="px-3 py-2 font-semibold">Status</th>
                                  <th className="px-3 py-2 font-semibold">Mieszkania</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-700">
                                {buildings
                                  .filter((b) => (editingInvestmentId === null ? false : b.investmentId === editingInvestmentId))
                                  .map((b) => (
                                    <tr
                                      key={b.id}
                                      onClick={() => openBuildingDetailsForm(b)}
                                      className="cursor-pointer hover:bg-gray-100"
                                    >
                                      <td className="px-3 py-2">{b.address}</td>
                                      <td className="px-3 py-2">{b.status}</td>
                                      <td className="px-3 py-2">{b.apartmentsTotal}</td>
                                    </tr>
                                  ))}
                                {buildings.filter((b) => (editingInvestmentId === null ? false : b.investmentId === editingInvestmentId)).length === 0 && (
                                  <tr>
                                    <td className="px-3 py-4 text-sm text-gray-500" colSpan={3}>
                                      Brak budynkow dla tej inwestycji.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </section>
                      <section className="rounded-2xl border border-gray-200 bg-white p-5">
                        <button
                          type="button"
                          onClick={() => setApartmentsSectionOpen((prev) => !prev)}
                          className="mb-3 flex w-full items-center justify-between rounded-lg px-1 text-left"
                        >
                          <h3 className="text-base font-semibold text-[var(--color-domesta-gray)]">Mieszkania inwestycji</h3>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className={`h-5 w-5 text-gray-500 transition-transform ${apartmentsSectionOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {apartmentsSectionOpen && (
                        <div className="overflow-auto rounded-xl border border-gray-200">
                          <table className="min-w-[1200px] bg-white text-[13px]">
                            <thead className="bg-gray-50">
                              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-3 py-2 font-semibold">Budynek</th>
                                <th className="px-3 py-2 font-semibold">Nr</th>
                                <th className="px-3 py-2 font-semibold">Metraz</th>
                                <th className="px-3 py-2 font-semibold">Pom.</th>
                                <th className="px-3 py-2 font-semibold">Balkon</th>
                                <th className="px-3 py-2 font-semibold">Pol</th>
                                <th className="px-3 py-2 font-semibold">Pietro</th>
                                <th className="px-3 py-2 font-semibold">Pliki</th>
                                <th className="px-3 py-2 font-semibold">Klient</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                              {apartments
                                .filter((apartment) => {
                                  if (editingInvestmentId === null) return false
                                  const building = buildings.find((b) => b.id === apartment.buildingId)
                                  return building?.investmentId === editingInvestmentId
                                })
                                .map((apartment) => (
                                  <tr key={apartment.id}>
                                    <td className="px-3 py-2">{buildings.find((b) => b.id === apartment.buildingId)?.address ?? '-'}</td>
                                    <td className="px-3 py-2 font-medium">{apartment.unitNumber}</td>
                                    <td className="px-3 py-2">{apartment.area.toFixed(1)} m2</td>
                                    <td className="px-3 py-2">{apartment.rooms}</td>
                                    <td className="px-3 py-2">{apartment.hasBalcony ? 'Tak' : 'Nie'}</td>
                                    <td className="px-3 py-2">{apartment.orientation}</td>
                                    <td className="px-3 py-2">{apartment.floor}</td>
                                    <td className="px-3 py-2">
                                      <div className="flex min-w-[220px] flex-col gap-1">
                                        <span className="text-xs text-gray-600">
                                          {apartment.fileName} ({apartment.fileType})
                                        </span>
                                        <input type="file" className="text-xs file:mr-2 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-2 file:py-1 file:text-xs file:text-gray-700 hover:file:bg-gray-50" />
                                      </div>
                                    </td>
                                    <td className="px-3 py-2">{apartment.assignedClient}</td>
                                  </tr>
                                ))}
                              {apartments.filter((apartment) => {
                                if (editingInvestmentId === null) return false
                                const building = buildings.find((b) => b.id === apartment.buildingId)
                                return building?.investmentId === editingInvestmentId
                              }).length === 0 && (
                                <tr>
                                  <td className="px-3 py-4 text-sm text-gray-500" colSpan={9}>
                                    Brak mieszkan dla tej inwestycji.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        )}
                      </section>
                    </div>
                    )
                  ) : investmentsTab === 'Inwestycje' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[var(--color-domesta-gray)]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="10" width="7" height="11" />
                              <rect x="14" y="3" width="7" height="18" />
                            </svg>
                          </span>
                          <h2 className="text-2xl font-bold text-[var(--color-domesta-gray)]">Inwestycje</h2>
                        </div>
                        {investmentsTabAddButton({ onClick: openNewInvestmentForm, title: 'Dodaj inwestycję' })}
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-gray-200">
                        <table className="min-w-full bg-white text-sm">
                          <thead className="bg-gray-50">
                            <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                              <th className="px-4 py-3 font-semibold">Nazwa</th>
                              <th className="px-4 py-3 font-semibold">Adres</th>
                              <th className="px-4 py-3 font-semibold">Budynki</th>
                              <th className="px-4 py-3 font-semibold">Mieszkania</th>
                              <th className="px-4 py-3 font-semibold">Akcje</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700">
                            {investments.map((item) => {
                              const investmentExpanded = expandedInvestmentIds.includes(item.id)
                              const investmentBuildings = buildings.filter((b) => b.investmentId === item.id)
                              return (
                                <Fragment key={`investment-group-${item.id}`}>
                                  <tr key={`investment-${item.id}`} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedInvestmentIds((prev) =>
                                          prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
                                        )
                                      }
                                      className="inline-flex items-center gap-2 text-left"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        className={`h-4 w-4 text-gray-500 transition-transform ${investmentExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="6 9 12 15 18 9" />
                                      </svg>
                                      <span>{item.name}</span>
                                    </button>
                                  </td>
                                  <td className="px-4 py-3">{item.address}</td>
                                  <td className="px-4 py-3">{item.buildings}</td>
                                  <td className="px-4 py-3">{item.apartments}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openInvestmentDetails(item)}
                                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                      >
                                        Szczegoly
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setInvestments((prev) => prev.filter((inv) => inv.id !== item.id))}
                                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                      >
                                        Usun
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                  {investmentExpanded && (
                                    <tr key={`investment-expanded-${item.id}`} className="bg-gray-50/50">
                                    <td colSpan={5} className="px-6 py-4">
                                      <div className="space-y-2">
                                        {investmentBuildings.length === 0 ? (
                                          <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
                                            Brak budynkow dla tej inwestycji.
                                          </div>
                                        ) : (
                                          investmentBuildings.map((building) => {
                                            const buildingExpanded = expandedBuildingIds.includes(building.id)
                                            const buildingApartments = apartments.filter((a) => a.buildingId === building.id)
                                            return (
                                              <div key={`building-${building.id}`} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    setExpandedBuildingIds((prev) =>
                                                      prev.includes(building.id) ? prev.filter((id) => id !== building.id) : [...prev, building.id],
                                                    )
                                                  }
                                                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                                                >
                                                  <div className="inline-flex items-center gap-2">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      viewBox="0 0 24 24"
                                                      className={`h-4 w-4 text-gray-500 transition-transform ${buildingExpanded ? 'rotate-180' : ''}`}
                                                      fill="none"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    >
                                                      <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700">{building.address}</span>
                                                  </div>
                                                  <span className="text-xs text-gray-500">{buildingApartments.length} mieszkan</span>
                                                </button>
                                                {buildingExpanded && (
                                                  <div className="border-t border-gray-100 px-4 py-2">
                                                    {buildingApartments.length === 0 ? (
                                                      <p className="text-xs text-gray-500">Brak mieszkan.</p>
                                                    ) : (
                                                      <ul className="space-y-1">
                                                        {buildingApartments.map((apartment) => (
                                                          <li key={`apartment-${apartment.id}`} className="text-sm text-gray-700">
                                                            {apartment.unitNumber} - {apartment.area.toFixed(1)} m2, pietro {apartment.floor}
                                                          </li>
                                                        ))}
                                                      </ul>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })
                                        )}
                                      </div>
                                    </td>
                                    </tr>
                                  )}
                                </Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : investmentsTab === 'Budynki' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        {renderInvestmentsTabHeader('Budynki')}
                        {investmentsTabAddButton({ onClick: openBuildingFormFromBuildingsTab, title: 'Dodaj budynek' })}
                      </div>
                      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <label className="text-sm text-gray-600">
                          Inwestycja
                          <select
                            value={buildingFilterInvestmentId}
                            onChange={(e) => setBuildingFilterInvestmentId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                          >
                            <option value="all">Wszystkie</option>
                            {investments.map((inv) => (
                              <option key={inv.id} value={inv.id}>
                                {inv.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="text-sm text-gray-600">
                          Status
                          <select
                            value={buildingFilterStatus}
                            onChange={(e) => setBuildingFilterStatus(e.target.value as 'all' | BuildingStatus)}
                            className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                          >
                            <option value="all">Wszystkie</option>
                            <option value="W budowie">W budowie</option>
                            <option value="Na wykonczeniu">Na wykonczeniu</option>
                            <option value="Oddany">Oddany</option>
                            <option value="Wyprzedany">Wyprzedany</option>
                          </select>
                        </label>
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-gray-200">
                        <table className="min-w-full bg-white text-sm table-fixed">
                        <thead className="bg-gray-50">
                          <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                            {buildingColumnOrder.map((col) => (
                              <th
                                key={col}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', col)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  const source = e.dataTransfer.getData('text/plain') as BuildingColumnKey
                                  if (!source || source === col) return
                                  setBuildingColumnOrder((prev) => {
                                    const withoutSource = prev.filter((k) => k !== source)
                                    const targetIndex = withoutSource.indexOf(col)
                                    withoutSource.splice(targetIndex, 0, source)
                                    return withoutSource
                                  })
                                }}
                                className="relative select-none px-4 py-3 font-semibold"
                                style={{ width: `${buildingColumnWidths[col]}px` }}
                                title="Przeciagnij, aby zmienic kolejnosc kolumn"
                              >
                                {col === 'lp' && 'L.p.'}
                                {col === 'investment' && 'Inwestycja'}
                                {col === 'address' && 'Adres'}
                                {col === 'status' && 'Status'}
                                {col === 'apartmentsTotal' && 'Ilosc mieszkan'}
                                {col === 'apartmentsAssigned' && 'Ilosc przypisanych mieszkan'}
                                {col === 'apartmentsUnassigned' && 'Ilosc nie przypisanych mieszkan'}
                                {col === 'actions' && 'Akcje'}
                                <span
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    setBuildingResizing({ key: col, startX: e.clientX, startWidth: buildingColumnWidths[col] })
                                  }}
                                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-gray-300"
                                  title="Przeciagnij, aby zmienic szerokosc"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {buildings
                            .filter((building) => (buildingFilterInvestmentId === 'all' ? true : building.investmentId === buildingFilterInvestmentId))
                            .filter((building) => (buildingFilterStatus === 'all' ? true : building.status === buildingFilterStatus))
                            .map((building, index) => {
                            const investmentName = investments.find((inv) => inv.id === building.investmentId)?.name ?? 'Brak inwestycji'
                            return (
                              <tr key={building.id} className="hover:bg-gray-50">
                                {buildingColumnOrder.map((col) => (
                                  <td key={`${building.id}-${col}`} className="px-4 py-3 align-middle">
                                    {col === 'lp' && <span className="font-medium">{index + 1}</span>}
                                    {col === 'investment' && investmentName}
                                    {col === 'address' && building.address}
                                    {col === 'status' && (
                                      <select
                                        value={building.status}
                                        onChange={(e) =>
                                          setBuildings((prev) =>
                                            prev.map((item) =>
                                              item.id === building.id ? { ...item, status: e.target.value as BuildingStatus } : item,
                                            ),
                                          )
                                        }
                                        className="rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-[var(--color-domesta-red)]"
                                      >
                                        <option value="W budowie">W budowie</option>
                                        <option value="Na wykonczeniu">Na wykonczeniu</option>
                                        <option value="Oddany">Oddany</option>
                                        <option value="Wyprzedany">Wyprzedany</option>
                                      </select>
                                    )}
                                    {col === 'apartmentsTotal' && building.apartmentsTotal}
                                    {col === 'apartmentsAssigned' && building.apartmentsAssigned}
                                    {col === 'apartmentsUnassigned' && Math.max(building.apartmentsTotal - building.apartmentsAssigned, 0)}
                                    {col === 'actions' && (
                                      <div className="flex items-center gap-2">
                                        <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100" title="Edytuj">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9" />
                                            <path d="m16.5 3.5 4 4L7 21l-4 1 1-4Z" />
                                          </svg>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBuildings((prev) => prev.filter((item) => item.id !== building.id))}
                                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                                          title="Usun budynek"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" />
                                            <path d="M8 6V4h8v2" />
                                            <path d="M19 6l-1 14H6L5 6" />
                                          </svg>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setBuildingApartmentsUploadTargetId(building.id)
                                            setBuildingApartmentsUploadOpen(true)
                                          }}
                                          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                                          title="Wgraj mieszkania (Excel)"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-6v-6H10v6H4a1 1 0 0 1-1-1Z" />
                                            <path d="M19 6v6M16 9h6" />
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  ) : investmentsTab === 'Mieszkania' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        {renderInvestmentsTabHeader(
                          'Mieszkania',
                          apartmentFormOpen
                            ? `${investments.find((inv) => inv.id === buildings.find((b) => b.id === apartmentBuildingIdForm)?.investmentId)?.name ?? '—'} | ${apartmentNumberForm.trim() || '—'}`
                            : undefined,
                        )}
                        {investmentsTabAddButton({ onClick: openNewApartmentForm, title: 'Dodaj mieszkanie' })}
                      </div>
                      {apartmentFormOpen ? (
                        <section className="rounded-2xl border border-gray-200 bg-white p-5">
                          <h3 className="mb-4 text-lg font-semibold text-[var(--color-domesta-gray)]">
                            {editingApartmentId === null ? 'Nowe mieszkanie' : 'Szczegóły mieszkania'}
                          </h3>
                          <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
                            <button
                              type="button"
                              role="tab"
                              aria-selected={apartmentFormSubTab === 'details'}
                              onClick={() => setApartmentFormSubTab('details')}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                apartmentFormSubTab === 'details'
                                  ? 'bg-white text-[var(--color-domesta-gray)] shadow-sm'
                                  : 'text-gray-600 hover:bg-white hover:text-[var(--color-domesta-gray)]'
                              }`}
                            >
                              Szczegóły
                            </button>
                            <button
                              type="button"
                              role="tab"
                              aria-selected={apartmentFormSubTab === 'paymentSchedule'}
                              onClick={() => setApartmentFormSubTab('paymentSchedule')}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                apartmentFormSubTab === 'paymentSchedule'
                                  ? 'bg-white text-[var(--color-domesta-gray)] shadow-sm'
                                  : 'text-gray-600 hover:bg-white hover:text-[var(--color-domesta-gray)]'
                              }`}
                            >
                              Harmonogram spłaty
                            </button>
                            <button
                              type="button"
                              role="tab"
                              aria-selected={apartmentFormSubTab === 'tasks'}
                              onClick={() => setApartmentFormSubTab('tasks')}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                apartmentFormSubTab === 'tasks'
                                  ? 'bg-white text-[var(--color-domesta-gray)] shadow-sm'
                                  : 'text-gray-600 hover:bg-white hover:text-[var(--color-domesta-gray)]'
                              }`}
                            >
                              Zadania
                            </button>
                            <button
                              type="button"
                              role="tab"
                              aria-selected={apartmentFormSubTab === 'complaints'}
                              onClick={() => setApartmentFormSubTab('complaints')}
                              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                apartmentFormSubTab === 'complaints'
                                  ? 'bg-white text-[var(--color-domesta-gray)] shadow-sm'
                                  : 'text-gray-600 hover:bg-white hover:text-[var(--color-domesta-gray)]'
                              }`}
                            >
                              Reklamacje
                            </button>
                          </div>
                          {apartmentFormSubTab === 'details' ? (
                            <>
                          <div className="grid gap-4 md:grid-cols-2">
                            <label className="text-sm text-gray-600">
                              Inwestycja
                              <input
                                value={investments.find((inv) => inv.id === buildings.find((b) => b.id === apartmentBuildingIdForm)?.investmentId)?.name ?? '-'}
                                disabled
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Budynek
                              <select
                                value={apartmentBuildingIdForm}
                                onChange={(e) => setApartmentBuildingIdForm(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              >
                                {buildings.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.address}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-sm text-gray-600">
                              Nr
                              <input
                                value={apartmentNumberForm}
                                onChange={(e) => setApartmentNumberForm(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Metraz
                              <input
                                type="number"
                                min={0}
                                step="0.1"
                                value={apartmentAreaForm}
                                onChange={(e) => setApartmentAreaForm(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Pom.
                              <input
                                type="number"
                                min={1}
                                value={apartmentRoomsForm}
                                onChange={(e) => setApartmentRoomsForm(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Balkon
                              <select
                                value={apartmentBalconyForm ? 'tak' : 'nie'}
                                onChange={(e) => setApartmentBalconyForm(e.target.value === 'tak')}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              >
                                <option value="tak">Tak</option>
                                <option value="nie">Nie</option>
                              </select>
                            </label>
                            <label className="text-sm text-gray-600">
                              Pol
                              <input
                                value={apartmentOrientationForm}
                                onChange={(e) => setApartmentOrientationForm(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Pietro
                              <input
                                type="number"
                                value={apartmentFloorForm}
                                onChange={(e) => setApartmentFloorForm(Number(e.target.value))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Plik - nazwa
                              <input
                                value={apartmentFileNameForm}
                                onChange={(e) => setApartmentFileNameForm(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600">
                              Plik - typ
                              <input
                                value={apartmentFileTypeForm}
                                onChange={(e) => setApartmentFileTypeForm(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                            <label className="text-sm text-gray-600 md:col-span-2">
                              Klient
                              <input
                                value={apartmentClientForm}
                                onChange={(e) => setApartmentClientForm(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              />
                            </label>
                          </div>
                          <div className="mt-5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSaveApartment}
                              className="rounded-lg bg-[var(--color-domesta-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                              Zapisz
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelApartmentForm}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                              Anuluj
                            </button>
                          </div>
                            </>
                          ) : apartmentFormSubTab === 'paymentSchedule' ? (
                            <div className="space-y-3">
                              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800">
                                <p>
                                  Cena: {formatPlnAmountPln(paymentScheduleTotals.cenaCalosci)}
                                </p>
                                <p className="mt-1">
                                  Spłacono: {formatPlnAmountPln(paymentScheduleTotals.splacono)}
                                </p>
                                <p className="mt-1">
                                  Pozostało: {formatPlnAmountPln(paymentScheduleTotals.pozostalo)}
                                </p>
                              </div>
                              <div className="overflow-x-auto rounded-xl border border-gray-200">
                              <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50">
                                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th className="px-3 py-3 font-semibold">LP</th>
                                    <th className="px-3 py-3 font-semibold">
                                      Wysokość raty (PLN){' '}
                                      <span className="text-[var(--color-domesta-red)]" title="wymagane">
                                        *
                                      </span>
                                    </th>
                                    <th className="px-3 py-3 font-semibold">
                                      Termin spłaty{' '}
                                      <span className="text-[var(--color-domesta-red)]" title="wymagane">
                                        *
                                      </span>
                                    </th>
                                    <th className="px-3 py-3 font-semibold">Spłacono (PLN)</th>
                                    <th className="px-3 py-3 font-semibold">Data wpłaty</th>
                                    <th className="px-3 py-3 font-semibold">Notatka</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                  {paymentScheduleRowsSorted.map((row, index) =>
                                    editingPaymentScheduleId === row.id ? (
                                      <tr key={row.id} className="bg-gray-50/90">
                                        <td className="px-3 py-2 align-middle">
                                          <div className="flex flex-col items-stretch gap-2">
                                            <span className="text-center text-sm tabular-nums text-gray-600">{index + 1}</span>
                                            <div className="flex flex-wrap gap-1">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  savePaymentScheduleEdit()
                                                }}
                                                className="rounded-md bg-[var(--color-domesta-red)] px-2 py-1 text-xs font-semibold text-white hover:opacity-90"
                                              >
                                                Zapisz
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  cancelPaymentScheduleEdit()
                                                }}
                                                className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                              >
                                                Anuluj
                                              </button>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-3 py-2 align-middle">
                                          <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            inputMode="decimal"
                                            placeholder="np. 45000"
                                            value={paymentScheduleEditDraft.installmentPln}
                                            onChange={(e) => setPaymentScheduleEditDraft((d) => ({ ...d, installmentPln: e.target.value }))}
                                            className="w-full min-w-[7rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm tabular-nums outline-none focus:border-[var(--color-domesta-red)]"
                                          />
                                        </td>
                                        <td className="px-3 py-2 align-middle">
                                          <input
                                            type="date"
                                            value={paymentScheduleEditDraft.dueDate}
                                            onChange={(e) => setPaymentScheduleEditDraft((d) => ({ ...d, dueDate: e.target.value }))}
                                            className="w-full min-w-[10rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                                          />
                                        </td>
                                        <td className="px-3 py-2 align-middle">
                                          <input
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            inputMode="decimal"
                                            placeholder="opcjonalnie"
                                            value={paymentScheduleEditDraft.paidPln}
                                            onChange={(e) => setPaymentScheduleEditDraft((d) => ({ ...d, paidPln: e.target.value }))}
                                            className="w-full min-w-[7rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm tabular-nums outline-none focus:border-[var(--color-domesta-red)]"
                                          />
                                        </td>
                                        <td className="px-3 py-2 align-middle">
                                          <input
                                            type="date"
                                            value={paymentScheduleEditDraft.paidDate}
                                            onChange={(e) => setPaymentScheduleEditDraft((d) => ({ ...d, paidDate: e.target.value }))}
                                            className="w-full min-w-[10rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                                          />
                                        </td>
                                        <td className="px-3 py-2 align-middle">
                                          <input
                                            type="text"
                                            placeholder="opcjonalnie"
                                            value={paymentScheduleEditDraft.note}
                                            onChange={(e) => setPaymentScheduleEditDraft((d) => ({ ...d, note: e.target.value }))}
                                            className="w-full min-w-[8rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                                          />
                                        </td>
                                      </tr>
                                    ) : (
                                      <tr
                                        key={row.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => beginEditPaymentScheduleRow(row)}
                                      >
                                        <td className="px-3 py-3 align-middle tabular-nums text-gray-600">{index + 1}</td>
                                        <td className="px-3 py-3 align-middle font-medium tabular-nums">{pln(row.installmentPln)}</td>
                                        <td className="px-3 py-3 align-middle whitespace-nowrap">{formatPlIsoDate(row.dueDate)}</td>
                                        <td className="px-3 py-3 align-middle tabular-nums">
                                          {row.paidPln !== null ? pln(row.paidPln) : '—'}
                                        </td>
                                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                                          {row.paidDate ? formatPlIsoDate(row.paidDate) : '—'}
                                        </td>
                                        <td className="px-3 py-3 align-middle text-gray-600">{row.note ?? '—'}</td>
                                      </tr>
                                    ),
                                  )}
                                  <tr className="bg-gray-50/90">
                                    <td className="px-3 py-2 align-middle">
                                      <button
                                        type="button"
                                        onClick={addPaymentScheduleRow}
                                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-domesta-red)] text-white hover:opacity-90"
                                        title="Dodaj wiersz"
                                        aria-label="Dodaj wiersz do harmonogramu"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                          <path d="M12 5v14M5 12h14" />
                                        </svg>
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 align-middle">
                                      <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        inputMode="decimal"
                                        placeholder="np. 45000"
                                        value={paymentScheduleDraft.installmentPln}
                                        onChange={(e) => setPaymentScheduleDraft((d) => ({ ...d, installmentPln: e.target.value }))}
                                        className="w-full min-w-[7rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm tabular-nums outline-none focus:border-[var(--color-domesta-red)]"
                                      />
                                    </td>
                                    <td className="px-3 py-2 align-middle">
                                      <input
                                        type="date"
                                        value={paymentScheduleDraft.dueDate}
                                        onChange={(e) => setPaymentScheduleDraft((d) => ({ ...d, dueDate: e.target.value }))}
                                        className="w-full min-w-[10rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                                      />
                                    </td>
                                    <td className="px-3 py-2 align-middle">
                                      <input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        inputMode="decimal"
                                        placeholder="opcjonalnie"
                                        value={paymentScheduleDraft.paidPln}
                                        onChange={(e) => setPaymentScheduleDraft((d) => ({ ...d, paidPln: e.target.value }))}
                                        className="w-full min-w-[7rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm tabular-nums outline-none focus:border-[var(--color-domesta-red)]"
                                      />
                                    </td>
                                    <td className="px-3 py-2 align-middle">
                                      <input
                                        type="date"
                                        value={paymentScheduleDraft.paidDate}
                                        onChange={(e) => setPaymentScheduleDraft((d) => ({ ...d, paidDate: e.target.value }))}
                                        className="w-full min-w-[10rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                                      />
                                    </td>
                                    <td className="px-3 py-2 align-middle">
                                      <input
                                        type="text"
                                        placeholder="opcjonalnie"
                                        value={paymentScheduleDraft.note}
                                        onChange={(e) => setPaymentScheduleDraft((d) => ({ ...d, note: e.target.value }))}
                                        className="w-full min-w-[8rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            </div>
                          ) : apartmentFormSubTab === 'tasks' ? (
                            <div className="space-y-8">
                              <section>
                                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Formalności początkowe</h4>
                                <ul className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                                  <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Podpisanie umowy rezerwacyjnej</span>
                                    <select
                                      value={apartmentTaskReservationStatus}
                                      onChange={(e) => setApartmentTaskReservationStatus(e.target.value as ApartmentFormalitiesStatus)}
                                      className="w-full min-w-[11rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)] sm:w-auto"
                                    >
                                      <option value="zablokowane">zablokowane</option>
                                      <option value="do podpisu">do podpisu</option>
                                      <option value="podpisana">podpisana</option>
                                    </select>
                                  </li>
                                  <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Podpisanie umowy przedwstępnej</span>
                                    <select
                                      value={apartmentTaskPreliminaryStatus}
                                      onChange={(e) => setApartmentTaskPreliminaryStatus(e.target.value as ApartmentFormalitiesStatus)}
                                      className="w-full min-w-[11rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)] sm:w-auto"
                                    >
                                      <option value="zablokowane">zablokowane</option>
                                      <option value="do podpisu">do podpisu</option>
                                      <option value="podpisana">podpisana</option>
                                    </select>
                                  </li>
                                </ul>
                              </section>
                              <section>
                                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Dokumenty do odbioru mieszkania</h4>
                                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
                                  <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Projekt (plan mieszkania/lokalu)</span>
                                    <button
                                      type="button"
                                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                      title="Pobierz plik"
                                      aria-label="Pobierz: Projekt (plan mieszkania/lokalu)"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-[var(--color-domesta-gray)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                                      </svg>
                                      Pobierz
                                    </button>
                                  </li>
                                  <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Projekt instalacji</span>
                                    <button
                                      type="button"
                                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                      title="Pobierz plik"
                                      aria-label="Pobierz: Projekt instalacji"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-[var(--color-domesta-gray)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                                      </svg>
                                      Pobierz
                                    </button>
                                  </li>
                                  <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Fotografie instalacji</span>
                                    <input
                                      type="file"
                                      className="max-w-full text-sm file:mr-2 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-2 file:py-1 file:text-xs file:text-gray-700 hover:file:bg-gray-50"
                                      aria-label="Wgraj plik: Fotografie instalacji"
                                    />
                                  </li>
                                  <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Plan zmian i lista zmian aranżacyjnych</span>
                                    <button
                                      type="button"
                                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                      title="Pobierz plik"
                                      aria-label="Pobierz: Plan zmian i lista zmian aranżacyjnych"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-[var(--color-domesta-gray)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                                      </svg>
                                      Pobierz
                                    </button>
                                  </li>
                                  <li className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Instrukcja obsługi (dokument)</span>
                                    <input
                                      type="file"
                                      className="max-w-full text-sm file:mr-2 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-2 file:py-1 file:text-xs file:text-gray-700 hover:file:bg-gray-50"
                                      aria-label="Wgraj plik: Instrukcja obsługi (dokument)"
                                    />
                                  </li>
                                </ul>
                              </section>
                              <section>
                                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Odbiór mieszkania</h4>
                                <ul className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                                  <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Odbiór mieszkania</span>
                                    <select
                                      value={apartmentTaskHandoverStatus}
                                      onChange={(e) => setApartmentTaskHandoverStatus(e.target.value as ApartmentHandoverTaskStatus)}
                                      className="w-full min-w-[12rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)] sm:w-auto"
                                    >
                                      <option value="zablokowane">zablokowane</option>
                                      <option value="czeka na umówienie">czeka na umówienie</option>
                                      <option value="zaplanowane">zaplanowane</option>
                                      <option value="rozpatrywanie reklamacji">rozpatrywanie reklamacji</option>
                                      <option value="odebrano">odebrano</option>
                                    </select>
                                  </li>
                                </ul>
                              </section>
                              <section>
                                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Zgłoszenie licznika energii</h4>
                                <ul className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                                  <li className="text-sm text-gray-800 tabular-nums">
                                    Numer Twojego licznika to: PPE {apartmentEnergyMeterPpeDigits}
                                  </li>
                                  <li className="flex flex-col gap-2 border-t border-gray-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Oświadczenie o wykonaniu przyłączenia</span>
                                    <button
                                      type="button"
                                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                      title="Pobierz plik"
                                      aria-label="Pobierz: Oświadczenie o wykonaniu przyłączenia"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-[var(--color-domesta-gray)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
                                      </svg>
                                      Pobierz
                                    </button>
                                  </li>
                                </ul>
                              </section>
                              <section>
                                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Podpisanie aktu notarialnego</h4>
                                <ul className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                                  <li className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm text-gray-800">Podpisanie aktu notarialnego</span>
                                    <select
                                      value={apartmentTaskNotarialActStatus}
                                      onChange={(e) => setApartmentTaskNotarialActStatus(e.target.value as ApartmentNotarialActTaskStatus)}
                                      className="w-full min-w-[12rem] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-domesta-red)] sm:w-auto"
                                    >
                                      <option value="zablokowane">zablokowane</option>
                                      <option value="czeka na umówienie">czeka na umówienie</option>
                                      <option value="zaplanowane">zaplanowane</option>
                                      <option value="podpisany">podpisany</option>
                                    </select>
                                  </li>
                                </ul>
                              </section>
                            </div>
                          ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                              <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50">
                                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                    <th className="px-3 py-3 font-semibold">LP</th>
                                    <th className="px-3 py-3 font-semibold">Zgłoszono</th>
                                    <th className="px-3 py-3 font-semibold">Tytuł (max 50 znaków)</th>
                                    <th className="px-3 py-3 font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                  {SAMPLE_APARTMENT_COMPLAINTS.map((complaint, index) => (
                                    <Fragment key={complaint.id}>
                                      <tr
                                        className={`cursor-pointer transition-colors ${
                                          apartmentComplaintsExpandedId === complaint.id ? 'bg-amber-50/60' : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() =>
                                          setApartmentComplaintsExpandedId((prev) => (prev === complaint.id ? null : complaint.id))
                                        }
                                      >
                                        <td className="px-3 py-3 align-middle tabular-nums text-gray-600">{index + 1}</td>
                                        <td className="px-3 py-3 align-middle whitespace-nowrap">
                                          {formatComplaintDateTime(complaint.submittedAt)}
                                        </td>
                                        <td className="max-w-[min(28rem,55vw)] px-3 py-3 align-middle">
                                          <span className="line-clamp-2" title={complaint.title}>
                                            {complaint.title.length > 50 ? `${complaint.title.slice(0, 50)}…` : complaint.title}
                                          </span>
                                        </td>
                                        <td className="px-3 py-3 align-middle">
                                          <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${complaintStatusBadgeClass(complaint.status)}`}
                                          >
                                            {complaint.status}
                                          </span>
                                        </td>
                                      </tr>
                                      {apartmentComplaintsExpandedId === complaint.id && (
                                        <tr>
                                          <td colSpan={4} className="border-t border-gray-100 bg-gray-50/95 px-4 py-5">
                                            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Historia zgłoszenia</p>
                                            <div className="space-y-0">
                                              {complaint.timeline.map((entry, ti) => (
                                                <div key={entry.id} className="grid grid-cols-[2rem_1fr] gap-3">
                                                  <div className="flex flex-col items-center pt-1">
                                                    <span className="z-10 h-3 w-3 shrink-0 rounded-full border-2 border-white bg-[var(--color-domesta-red)] shadow-sm" />
                                                    {ti < complaint.timeline.length - 1 ? (
                                                      <div className="mt-0.5 h-14 w-0.5 shrink-0 bg-gray-200" aria-hidden />
                                                    ) : null}
                                                  </div>
                                                  <div className={`min-w-0 ${ti === complaint.timeline.length - 1 ? 'pb-2' : 'pb-8'}`}>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                                      {entry.kind === 'submitted'
                                                        ? 'Zgłoszenie'
                                                        : entry.kind === 'comment'
                                                          ? 'Komentarz'
                                                          : 'Zmiana statusu'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                      {formatComplaintDateTime(entry.at)}
                                                      <span className="text-gray-400"> · </span>
                                                      <span className="font-medium text-gray-700">{entry.author}</span>
                                                    </p>
                                                    {entry.body ? <p className="mt-2 text-sm leading-relaxed text-gray-800">{entry.body}</p> : null}
                                                    {entry.kind === 'status_change' && entry.newStatus ? (
                                                      <span
                                                        className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${complaintStatusBadgeClass(entry.newStatus)}`}
                                                      >
                                                        {entry.newStatus}
                                                      </span>
                                                    ) : null}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </Fragment>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </section>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <label className="text-sm text-gray-600">
                              Inwestycja
                              <select
                                value={apartmentFilterInvestmentId}
                                onChange={(e) => {
                                  const value = e.target.value === 'all' ? 'all' : Number(e.target.value)
                                  setApartmentFilterInvestmentId(value)
                                  setApartmentFilterBuildingId('all')
                                }}
                                className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              >
                                <option value="all">Wszystkie</option>
                                {investments.map((inv) => (
                                  <option key={inv.id} value={inv.id}>
                                    {inv.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="text-sm text-gray-600">
                              Budynek
                              <select
                                value={apartmentFilterBuildingId}
                                onChange={(e) => setApartmentFilterBuildingId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                className="mt-1 block rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--color-domesta-red)]"
                              >
                                <option value="all">Wszystkie</option>
                                {buildings
                                  .filter((b) => (apartmentFilterInvestmentId === 'all' ? true : b.investmentId === apartmentFilterInvestmentId))
                                  .map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.address}
                                    </option>
                                  ))}
                              </select>
                            </label>
                          </div>
                          <div className="overflow-hidden rounded-2xl border border-gray-200">
                            <table className="min-w-full bg-white text-sm table-fixed">
                              <thead className="bg-gray-50">
                                <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                  {apartmentColumnOrder.map((col) => (
                                    <th
                                      key={col}
                                      draggable
                                      onDragStart={(e) => e.dataTransfer.setData('text/plain', col)}
                                      onDragOver={(e) => e.preventDefault()}
                                      onDrop={(e) => {
                                        e.preventDefault()
                                        const source = e.dataTransfer.getData('text/plain') as ApartmentColumnKey
                                        if (!source || source === col) return
                                        setApartmentColumnOrder((prev) => {
                                          const withoutSource = prev.filter((k) => k !== source)
                                          const targetIndex = withoutSource.indexOf(col)
                                          withoutSource.splice(targetIndex, 0, source)
                                          return withoutSource
                                        })
                                      }}
                                      className="relative select-none px-4 py-3 font-semibold"
                                      style={{ width: `${apartmentColumnWidths[col]}px` }}
                                      title="Przeciagnij, aby zmienic kolejnosc kolumn"
                                    >
                                      {col === 'investment' && 'Inwestycja'}
                                      {col === 'building' && 'Budynek'}
                                      {col === 'nr' && 'Nr'}
                                      {col === 'area' && 'Metraz'}
                                      {col === 'rooms' && 'Pom.'}
                                      {col === 'balcony' && 'Balkon'}
                                      {col === 'orientation' && 'Pol'}
                                      {col === 'floor' && 'Pietro'}
                                      {col === 'files' && 'Pliki'}
                                      {col === 'client' && 'Klient'}
                                      <span
                                        onMouseDown={(e) => {
                                          e.preventDefault()
                                          setApartmentResizing({ key: col, startX: e.clientX, startWidth: apartmentColumnWidths[col] })
                                        }}
                                        className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-gray-300"
                                        title="Przeciagnij, aby zmienic szerokosc"
                                      />
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-gray-700">
                                {apartments
                                  .filter((apartment) => {
                                    const building = buildings.find((b) => b.id === apartment.buildingId)
                                    if (!building) return false
                                    if (apartmentFilterInvestmentId !== 'all' && building.investmentId !== apartmentFilterInvestmentId) return false
                                    if (apartmentFilterBuildingId !== 'all' && apartment.buildingId !== apartmentFilterBuildingId) return false
                                    return true
                                  })
                                  .map((apartment) => {
                                    const building = buildings.find((b) => b.id === apartment.buildingId)
                                    const investmentName = investments.find((inv) => inv.id === building?.investmentId)?.name ?? '-'
                                    return (
                                      <tr key={apartment.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openApartmentDetailsForm(apartment)}>
                                        {apartmentColumnOrder.map((col) => (
                                          <td key={`${apartment.id}-${col}`} className="px-4 py-3 align-middle">
                                            {col === 'investment' && investmentName}
                                            {col === 'building' && (building?.address ?? '-')}
                                            {col === 'nr' && <span className="font-medium">{apartment.unitNumber}</span>}
                                            {col === 'area' && `${apartment.area.toFixed(1)} m2`}
                                            {col === 'rooms' && apartment.rooms}
                                            {col === 'balcony' && (apartment.hasBalcony ? 'Tak' : 'Nie')}
                                            {col === 'orientation' && apartment.orientation}
                                            {col === 'floor' && apartment.floor}
                                            {col === 'files' && (
                                              <div className="flex min-w-[220px] flex-col gap-1">
                                                <span className="text-xs text-gray-600">
                                                  {apartment.fileName} ({apartment.fileType})
                                                </span>
                                                <input type="file" className="text-xs file:mr-2 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-2 file:py-1 file:text-xs file:text-gray-700 hover:file:bg-gray-50" />
                                              </div>
                                            )}
                                            {col === 'client' && apartment.assignedClient}
                                          </td>
                                        ))}
                                      </tr>
                                    )
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        {renderInvestmentsTabHeader(investmentsTab)}
                        {investmentsTabAddButton({
                          disabled: true,
                          title:
                            investmentsTab === 'Komorki Lokatorskie'
                              ? 'Dodawanie komorek lokatorskich — w przygotowaniu'
                              : 'Dodawanie miejsc postojowych — w przygotowaniu',
                        })}
                      </div>
                      <section className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-500">Ta zakladka jest przygotowana do dalszej rozbudowy.</p>
                      </section>
                    </div>
                  )}
                </section>
              ) : backOfficeView === 'statistics' ? (
                <BackOfficeStatistics investments={investments} buildings={buildings} />
              ) : (
                <section className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-500">Ta sekcja jest przygotowana do dalszej rozbudowy.</p>
                </section>
              )}
            </main>
            {buildingApartmentsUploadOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-[var(--color-domesta-gray)]">Wgranie mieszkan z pliku Excel</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setBuildingApartmentsUploadOpen(false)
                        setBuildingApartmentsUploadTargetId(null)
                      }}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Zamknij"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">
                    Budynek: <span className="font-semibold">{buildings.find((b) => b.id === buildingApartmentsUploadTargetId)?.address ?? '-'}</span>
                  </p>
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                    <p className="mb-2 text-sm font-medium text-gray-700">Przeciagnij plik Excel tutaj lub wybierz z dysku</p>
                    <p className="mb-3 text-xs text-gray-500">Mockup: import danych zostanie dodany w kolejnym etapie.</p>
                    <input type="file" accept=".xlsx,.xls" className="mx-auto block text-xs file:mr-2 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:text-gray-700 hover:file:bg-gray-100" />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setBuildingApartmentsUploadOpen(false)
                        setBuildingApartmentsUploadTargetId(null)
                      }}
                      className="rounded-lg bg-[var(--color-domesta-red)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Zamknij
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : showNewsOnly ? (
          <NewsContent sidebarCollapsed={menuCollapsed} />
        ) : (
          <MainContent activeSectionId={activeSection} />
        )}
      </div>
    </div>
  )
}

export default App
