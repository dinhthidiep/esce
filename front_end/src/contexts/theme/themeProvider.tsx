import { ThemeProvider, useColorScheme } from '@mui/material/styles'
import { useMemo } from 'react'
import { lightTheme } from '~/config'
import { darkTheme } from '~/config'
import type { ThemeContextProviderProps } from '~/types/theme'
import { ThemeContext } from './themeContext'

export function ThemeContextProvider({
  children,
  defaultMode = 'light'
}: ThemeContextProviderProps) {
  const { mode, setMode, systemMode } = useColorScheme()
  // Xác định mode thực tế để dùng
  const currentMode = mode === 'system' ? (systemMode === 'dark' ? 'dark' : 'light') : mode

  // Theme hiện tại dựa trên effectiveMode
  const theme = currentMode === 'dark' ? darkTheme : lightTheme

  // Context value để các component con có thể đọc/switch theme
  const themeContextValue = useMemo(
    () => ({
      mode,
      setMode,
      currentMode,
      theme
    }),
    [mode, currentMode, theme, setMode]
  )

  return (
    <ThemeProvider theme={theme} defaultMode={defaultMode}>
      <ThemeContext.Provider value={themeContextValue}>{children}</ThemeContext.Provider>
    </ThemeProvider>
  )
}
