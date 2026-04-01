/** Role systemowe — użytkownik może mieć jedną lub wiele ról. */
export const USER_ROLES = ['Admin', 'Kierownik', 'Klient'] as const
export type UserRole = (typeof USER_ROLES)[number]

export type DirectoryUser = {
  id: string
  firstName: string
  lastName: string
  roles: UserRole[]
  lastLogin: string | null
  activationDate: string | null
}

const FIRST_NAMES = [
  'Anna',
  'Piotr',
  'Magdalena',
  'Tomasz',
  'Katarzyna',
  'Marcin',
  'Ewa',
  'Łukasz',
  'Joanna',
  'Krzysztof',
  'Agnieszka',
  'Michał',
  'Barbara',
  'Paweł',
  'Elżbieta',
  'Adam',
  'Monika',
  'Jakub',
  'Aleksandra',
  'Wojciech',
  'Justyna',
  'Dariusz',
  'Natalia',
  'Rafał',
  'Izabela',
] as const

const LAST_NAMES = [
  'Nowak',
  'Wiśniewski',
  'Zielińska',
  'Kowalczyk',
  'Wójcik',
  'Kamiński',
  'Lewandowska',
  'Zając',
  'Szymański',
  'Woźniak',
  'Dąbrowski',
  'Kozłowski',
  'Jankowski',
  'Mazur',
  'Kwiatkowski',
  'Krawczyk',
  'Piotrowski',
  'Grabowski',
  'Pawłowski',
  'Michalski',
  'Król',
  'Wieczorek',
  'Jabłoński',
  'Wróbel',
  'Nowicki',
] as const

/** Wzorce ról (indeks i % długości) — zapewniają różnorodność i sensowne kombinacje. */
const ROLE_PATTERNS: UserRole[][] = [
  ['Kierownik'],
  ['Admin', 'Kierownik'],
  ['Kierownik', 'Klient'],
  ['Klient'],
  ['Klient'],
  ['Klient'],
  ['Admin'],
  ['Kierownik'],
  ['Admin', 'Klient'],
  ['Klient'],
  ['Admin'],
  ['Kierownik', 'Klient'],
]

function buildDirectoryUsers(): DirectoryUser[] {
  const rows: DirectoryUser[] = []
  for (let i = 0; i < 25; i++) {
    const id = `u${i + 1}`
    const lastLogin =
      i % 7 === 0 ? null : new Date(2026, 2, (i % 28) + 1, 8 + (i % 9), (i * 3) % 60, 0).toISOString()
    const activationDate = i % 5 === 0 ? null : new Date(2025, i % 12, (i % 28) + 1, 10, 0, 0).toISOString()
    const roles = [...ROLE_PATTERNS[i % ROLE_PATTERNS.length]!]
    rows.push({
      id,
      firstName: FIRST_NAMES[i]!,
      lastName: LAST_NAMES[i]!,
      roles,
      lastLogin,
      activationDate,
    })
  }
  return rows
}

export const DIRECTORY_USERS: DirectoryUser[] = buildDirectoryUsers()

export function getUserDisplayName(userId: string): string {
  const u = DIRECTORY_USERS.find((x) => x.id === userId)
  return u ? `${u.firstName} ${u.lastName}` : userId
}

/** Lista do ekranu „Zarządzanie kalendarzem” — tylko kierownicy. */
export function getUsersForCalendarManagement(): { id: string; name: string }[] {
  return DIRECTORY_USERS.filter((u) => u.roles.includes('Kierownik')).map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
  }))
}

/** Lista do ekranu „Podgląd kalendarza” — tylko klienci. */
export function getUsersForCalendarPreview(): { id: string; name: string }[] {
  return DIRECTORY_USERS.filter((u) => u.roles.includes('Klient')).map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
  }))
}

/** Id użytkowników, dla których generujemy przykładową dostępność (kierownicy i klienci). */
export function getUserIdsWithAvailabilityData(): string[] {
  return DIRECTORY_USERS.filter(
    (u) => u.roles.includes('Kierownik') || u.roles.includes('Klient'),
  ).map((u) => u.id)
}
