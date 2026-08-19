import type { AppTheme } from '../App'

export const BATORY_THEMES = ['batoryProject', 'batory2', 'batory3', 'batory4', 'batory5'] as const
export type BatoryTheme = (typeof BATORY_THEMES)[number]

export type BatoryThemeConfig = {
  id: BatoryTheme
  menuLabel: string
  themeClass: string
  pageBg: string
  headerBg: string
  headerBorder: string
  headerText: string
  menuBg: string
  menuIconTile: string
  accent: string
  accentGold: string
  accentMuted: string
  newsIcon: string
  newsHoverBg: string
  menuDropdownBg: string
  menuDropdownBorder: string
  orlowoColor: string
  squareColor: string
}

/** Palety inspirowane księgą znaku Batory (CMYK ze wzorca marki). */
export const BATORY_THEME_CONFIG: Record<BatoryTheme, BatoryThemeConfig> = {
  batoryProject: {
    id: 'batoryProject',
    menuLabel: 'Batory Project',
    themeClass: 'theme-batory',
    pageBg: '#eef2f6',
    headerBg: '#f7f9fc',
    headerBorder: '#d7dee9',
    headerText: '#10284b',
    menuBg: '#10284b',
    menuIconTile: '#2a446a',
    accent: '#1f3f6b',
    accentGold: '#c9a227',
    accentMuted: '#7f8ba0',
    newsIcon: '#1f3f6b',
    newsHoverBg: 'rgba(31,63,107,0.1)',
    menuDropdownBg: '#f7f9fc',
    menuDropdownBorder: '#d7dee9',
    orlowoColor: '#000000',
    squareColor: '#c9a227',
  },
  batory2: {
    id: 'batory2',
    menuLabel: 'Batory 2',
    themeClass: 'theme-batory-2',
    pageBg: '#121212',
    headerBg: '#0a0a0a',
    headerBorder: '#2a2a2a',
    headerText: '#f5f5f5',
    menuBg: '#000000',
    menuIconTile: '#1a1a1a',
    accent: '#c4a052',
    accentGold: '#c4a052',
    accentMuted: '#9a9a9a',
    newsIcon: '#c4a052',
    newsHoverBg: 'rgba(196,160,82,0.15)',
    menuDropdownBg: '#141414',
    menuDropdownBorder: '#333333',
    orlowoColor: '#ffffff',
    squareColor: '#c4a052',
  },
  batory3: {
    id: 'batory3',
    menuLabel: 'Batory 3',
    themeClass: 'theme-batory-3',
    pageBg: '#9a7838',
    headerBg: '#b8945a',
    headerBorder: '#a8863f',
    headerText: '#f8f6f2',
    menuBg: '#8f7032',
    menuIconTile: '#a08040',
    accent: '#e8ecef',
    accentGold: '#e8ecef',
    accentMuted: '#d8dce0',
    newsIcon: '#f0f2f4',
    newsHoverBg: 'rgba(255,255,255,0.12)',
    menuDropdownBg: '#b8945a',
    menuDropdownBorder: '#a8863f',
    orlowoColor: '#ffffff',
    squareColor: '#e8ecef',
  },
  batory4: {
    id: 'batory4',
    menuLabel: 'Batory 4',
    themeClass: 'theme-batory-4',
    pageBg: '#141a1d',
    headerBg: '#1e272b',
    headerBorder: '#2d383e',
    headerText: '#f5f5f5',
    menuBg: '#141a1d',
    menuIconTile: '#252f34',
    accent: '#c4a052',
    accentGold: '#c4a052',
    accentMuted: '#8a959c',
    newsIcon: '#c4a052',
    newsHoverBg: 'rgba(196,160,82,0.15)',
    menuDropdownBg: '#1e272b',
    menuDropdownBorder: '#2d383e',
    orlowoColor: '#ffffff',
    squareColor: '#c4a052',
  },
  batory5: {
    id: 'batory5',
    menuLabel: 'Batory 5',
    themeClass: 'theme-batory-5',
    pageBg: '#d1d9db',
    headerBg: '#dde3e5',
    headerBorder: '#c5ced1',
    headerText: '#0a0a0a',
    menuBg: '#c8cfd2',
    menuIconTile: '#b8c0c3',
    accent: '#0a0a0a',
    accentGold: '#8a7030',
    accentMuted: '#5c6569',
    newsIcon: '#0a0a0a',
    newsHoverBg: 'rgba(10,10,10,0.08)',
    menuDropdownBg: '#eef1f2',
    menuDropdownBorder: '#c5ced1',
    orlowoColor: '#0a0a0a',
    squareColor: '#8a7030',
  },
}

export function isBatoryTheme(theme: AppTheme): theme is BatoryTheme {
  return (BATORY_THEMES as readonly string[]).includes(theme)
}

export function getBatoryThemeConfig(theme: AppTheme): BatoryThemeConfig | null {
  return isBatoryTheme(theme) ? BATORY_THEME_CONFIG[theme] : null
}
