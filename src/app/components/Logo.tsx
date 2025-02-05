"use client"

import Link from "next/link"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

interface LogoProps {
  isSmall: boolean
  className?: string
  onLogoClick?: () => void
}

const Logo: React.FC<LogoProps> = ({ isSmall, className = "", onLogoClick }) => {
  return (
    <Link href="/" onClick={onLogoClick}>
      <Button
        variant="ghost"
        className={`font-bold text-white cursor-pointer ${
          isSmall ? "text-lg hover:bg-primary/20 flex items-center gap-2" : "text-3xl"
        } ${className}`}
      >
        AI Blog Post Generator
      </Button>
    </Link>
  )
}

export default Logo

