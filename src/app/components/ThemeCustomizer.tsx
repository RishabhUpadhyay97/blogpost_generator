"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Paintbrush } from "lucide-react"
import { useTheme } from "@/lib/themeContext"

interface ThemeColors {
  primary: string
  background: string
  text: string
}

const predefinedThemes: Record<string, ThemeColors> = {
  default: {
    primary: "#604cff",
    background: "#330000",
    text: "#ffffff",
  },
  ocean: {
    primary: "#00a8e8",
    background: "#003459",
    text: "#ffffff",
  },
  forest: {
    primary: "#4caf50",
    background: "#1b5e20",
    text: "#ffffff",
  },
  sunset: {
    primary: "#ff9800",
    background: "#bf360c",
    text: "#ffffff",
  },
}

export default function ThemeCustomizer() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-contrast">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-contrast">
        <DropdownMenuLabel className="text-contrast">Choose a theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(predefinedThemes).map(([name, colors]) => (
          <DropdownMenuItem key={name} onClick={() => setTheme(colors)} className="text-contrast">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

