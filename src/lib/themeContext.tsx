"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface ThemeColors {
  primary: string
  background: string
  text: string
  contrastText: string
}

interface ThemeContextType {
  currentTheme: ThemeColors
  setTheme: (theme: Omit<ThemeColors, "contrastText">) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black or white depending on luminance
  return luminance > 0.5 ? "#000000" : "#ffffff"
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>({
    primary: "#604cff",
    background: "#330000",
    text: "#ffffff",
    contrastText: "#ffffff",
  })

  const setTheme = (theme: Omit<ThemeColors, "contrastText">) => {
    const contrastText = getContrastColor(theme.background)
    const newTheme = { ...theme, contrastText }
    setCurrentTheme(newTheme)
    if (typeof window !== "undefined") {
      document.documentElement.style.setProperty("--primary-color", newTheme.primary)
      document.documentElement.style.setProperty("--background-color", newTheme.background)
      document.documentElement.style.setProperty("--text-color", newTheme.text)
      document.documentElement.style.setProperty("--contrast-text-color", newTheme.contrastText)
    }
  }

  return <ThemeContext.Provider value={{ currentTheme, setTheme }}>{children}</ThemeContext.Provider>
}

