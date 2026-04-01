/**
 * Generowane dane demonstracyjne: min. 10 inwestycji, 3–20 budynków na inwestycję,
 * mieszkania, komórki i miejsca postojowe (spójne id mieszkań).
 */

export type SampleBuildingStatus = 'W budowie' | 'Na wykonczeniu' | 'Oddany' | 'Wyprzedany'

export type SampleInvestment = {
  id: number
  name: string
  address: string
  buildings: number
  apartments: number
  handoverDate: string
  description: string
}

export type SampleBuilding = {
  id: number
  investmentId: number
  address: string
  status: SampleBuildingStatus
  apartmentsTotal: number
  apartmentsAssigned: number
}

export type SampleApartment = {
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
  clientId: number | null
  postSaleUnlocked: boolean
}

export type SampleStorageUnit = {
  id: number
  name: string
  apartmentId: number | null
}

export type SampleParkingSpot = {
  id: number
  name: string
  apartmentId: number | null
}

const STATUS_CYCLE: SampleBuildingStatus[] = ['W budowie', 'Na wykonczeniu', 'Oddany', 'Wyprzedany']

const ORIENTATIONS = ['Poludnie', 'Polnoc', 'Wschod', 'Zachod', 'Polnocny-wschod', 'Poludniowy-zachod']

const CLIENT_LABELS = [
  'Brak (przypisanie pozniej)',
  'Jan Kowalski',
  'Anna Wiśniewska',
  'Marek Zieliński',
  'Katarzyna Nowak',
  'Piotr Lewandowski',
  'Magdalena Dąbrowska',
  'Tomasz Wójcik',
  'Ewa Kamińska',
  'Michał Zieliński',
]

/** Liczba budynków na inwestycję (12 inwestycji, wartości 3–20) */
const BUILDINGS_PER_INVESTMENT = [5, 8, 3, 12, 20, 7, 15, 4, 10, 6, 18, 9]

const INVESTMENT_DEFS: { name: string; address: string; handoverDate: string; description: string; street: string; city: string }[] = [
  {
    name: 'Polana Kampinowska',
    address: 'ul. Kampinowska 12, Gdańsk',
    handoverDate: '2026-11-30',
    description: 'Nowoczesne osiedle z dużą ilością zieleni i dostępem do usług.',
    street: 'Kampinowska',
    city: 'Gdańsk',
  },
  {
    name: 'Zielone Ogrody',
    address: 'ul. Ogrodowa 7, Gdynia',
    handoverDate: '2027-04-15',
    description: 'Inwestycja rodzinna, zaplanowana wokół zielonych dziedzińców.',
    street: 'Ogrodowa',
    city: 'Gdynia',
  },
  {
    name: 'Nowa Morena',
    address: 'ul. Morenowa 20, Gdańsk',
    handoverDate: '2026-09-20',
    description: 'Kameralna zabudowa z szybkim dojazdem do centrum miasta.',
    street: 'Morenowa',
    city: 'Gdańsk',
  },
  {
    name: 'Nadmorski Park',
    address: 'ul. Nadmorska 3, Sopot',
    handoverDate: '2027-01-10',
    description: 'Apartamenty z widokiem na morze i infrastrukturą rekreacyjną.',
    street: 'Nadmorska',
    city: 'Sopot',
  },
  {
    name: 'Żuławska Residence',
    address: 'ul. Żuławska 44, Gdańsk',
    handoverDate: '2028-03-01',
    description: 'Duże osiedle mieszkaniowo-usługowe przy szybkim tramwaju.',
    street: 'Żuławska',
    city: 'Gdańsk',
  },
  {
    name: 'Brzeska City',
    address: 'ul. Brzeska 9, Gdynia',
    handoverDate: '2026-06-18',
    description: 'Mieszkania w ścisłym centrum, idealne pod wynajem i dla rodzin.',
    street: 'Brzeska',
    city: 'Gdynia',
  },
  {
    name: 'Leśna Polana',
    address: 'ul. Leśna 2, Rumia',
    handoverDate: '2027-08-30',
    description: 'Spokojna lokalizacja przy lesie, niska zabudowa.',
    street: 'Leśna',
    city: 'Rumia',
  },
  {
    name: 'Portowa Marina',
    address: 'ul. Portowa 15, Gdańsk',
    handoverDate: '2026-12-05',
    description: 'Apartamenty przy marinie jachtowej i bulwarze spacerowym.',
    street: 'Portowa',
    city: 'Gdańsk',
  },
  {
    name: 'Bursztynowe Zacisze',
    address: 'ul. Bursztynowa 6, Gdynia',
    handoverDate: '2027-11-22',
    description: 'Rodzinne osiedle z placami zabaw i monitoringiem.',
    street: 'Bursztynowa',
    city: 'Gdynia',
  },
  {
    name: 'Stogi Waves',
    address: 'ul. Falowa 88, Gdańsk',
    handoverDate: '2028-02-14',
    description: 'Nowa zabudowa na Stogach z widokiem na Zatokę Gdańską.',
    street: 'Falowa',
    city: 'Gdańsk',
  },
  {
    name: 'Orłowska Klif',
    address: 'ul. Klifowa 3, Gdynia',
    handoverDate: '2026-10-01',
    description: 'Prestiżowa lokalizacja Orłowo, krótki spacer do plaży.',
    street: 'Klifowa',
    city: 'Gdynia',
  },
  {
    name: 'Matarnia Park',
    address: 'ul. Matarnia 120, Gdańsk',
    handoverDate: '2027-07-20',
    description: 'Osiedle przy obwodnicy z dobrym dojazdem do lotniska.',
    street: 'Matarnia',
    city: 'Gdańsk',
  },
]

function hashSeed(n: number): number {
  let x = n * 1103515245 + 12345
  x = (x ^ (x >>> 13)) * 1274126177
  return Math.abs(x)
}

export function createSampleBackOfficeDataset(): {
  investments: SampleInvestment[]
  buildings: SampleBuilding[]
  apartments: SampleApartment[]
  storageUnits: SampleStorageUnit[]
  parkingSpots: SampleParkingSpot[]
} {
  const investments: SampleInvestment[] = []
  const buildings: SampleBuilding[] = []
  const apartments: SampleApartment[] = []

  let buildingId = 0
  let apartmentId = 0

  for (let invIdx = 0; invIdx < INVESTMENT_DEFS.length; invIdx++) {
    const def = INVESTMENT_DEFS[invIdx]
    const investmentId = invIdx + 1
    const nBuildings = BUILDINGS_PER_INVESTMENT[invIdx]
    let sumApartmentsForInv = 0

    for (let bi = 0; bi < nBuildings; bi++) {
      buildingId += 1
      const h = hashSeed(buildingId)
      const letter = String.fromCharCode(65 + (bi % 26))
      const num = 10 + invIdx * 3 + bi
      const address = `ul. ${def.street} ${num}${letter}`
      const total = 18 + (h % 52)
      const assigned = Math.min(total, Math.floor((total * (18 + (h % 65))) / 100))
      const status = STATUS_CYCLE[buildingId % STATUS_CYCLE.length]

      buildings.push({
        id: buildingId,
        investmentId,
        address,
        status,
        apartmentsTotal: total,
        apartmentsAssigned: assigned,
      })
      sumApartmentsForInv += total

      const rowsPerBuilding = Math.min(6, Math.max(3, 3 + (h % 4)))
      for (let ai = 0; ai < rowsPerBuilding; ai++) {
        apartmentId += 1
        const hh = hashSeed(apartmentId * 997 + buildingId)
        const unit = `${letter}/${String(ai + 1).padStart(2, '0')}`
        const area = 32 + (hh % 48) + (hh % 10) / 10
        const rooms = 2 + (hh % 4)
        const floor = 1 + (hh % 8)
        const orient = ORIENTATIONS[hh % ORIENTATIONS.length]
        const clientPick = hh % 12
        const assignedClient = CLIENT_LABELS[clientPick]
        const clientId = clientPick >= 1 && clientPick <= 3 ? clientPick : null
        const postSaleUnlocked = clientId !== null && hh % 3 !== 0

        apartments.push({
          id: apartmentId,
          buildingId,
          address,
          unitNumber: unit,
          area: Math.round(area * 10) / 10,
          rooms,
          hasBalcony: hh % 5 !== 0,
          orientation: orient,
          floor,
          fileName: `rzut-${investmentId}-${buildingId}-${unit.replace('/', '-')}.pdf`,
          fileType: hh % 7 === 0 ? 'DOCX' : 'PDF',
          assignedClient,
          clientId,
          postSaleUnlocked,
        })
      }
    }

    investments.push({
      id: investmentId,
      name: def.name,
      address: def.address,
      buildings: nBuildings,
      apartments: sumApartmentsForInv,
      handoverDate: def.handoverDate,
      description: def.description,
    })
  }

  const totalApartments = apartments.length
  const storageUnits: SampleStorageUnit[] = []
  const parkingSpots: SampleParkingSpot[] = []

  for (let i = 1; i <= 96; i++) {
    const inv = (i % INVESTMENT_DEFS.length) + 1
    const aptLink = i <= totalApartments && i % 4 !== 0 ? ((i * 7) % totalApartments) + 1 : null
    storageUnits.push({
      id: i,
      name: `INV-${inv} / komórka KL-${String(i).padStart(3, '0')} / regał ${(i % 8) + 1}`,
      apartmentId: aptLink,
    })
  }

  for (let i = 1; i <= 96; i++) {
    const inv = (i % INVESTMENT_DEFS.length) + 1
    const aptLink = i % 5 !== 0 && totalApartments > 0 ? ((i * 11) % totalApartments) + 1 : null
    const kinds = ['MP-nadziemne', 'MP-podziemne', 'Garaż-box', 'Parking-zewnętrzny']
    parkingSpots.push({
      id: i,
      name: `INV-${inv} / ${kinds[i % kinds.length]} / ${String((i % 40) + 1).padStart(2, '0')}`,
      apartmentId: aptLink,
    })
  }

  return { investments, buildings, apartments, storageUnits, parkingSpots }
}
