"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import "@uiw/react-md-editor/markdown-editor.css"
import "@uiw/react-markdown-preview/markdown.css"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((mod) => mod.default), { ssr: false })

interface FormData {
  topic: string
  writingStyle: string
  audienceType: string
  formalityLevel: string
  lengthDetail: string
  additionalInstructions: string
}

interface BlogPostEditorProps {
  content: string
  formData: FormData
  blogPostId: number
  onCancel: () => void
  onRegenerate: (content: string, formData: FormData) => Promise<void>
}

export default function BlogPostEditor({ content, formData, blogPostId, onCancel, onRegenerate }: BlogPostEditorProps) {
  const [editableContent, setEditableContent] = useState(content)
  const [editableFormData, setEditableFormData] = useState(formData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`/api/blog-post/${blogPostId}/form-data`)
        if (response.ok) {
          const data = await response.json()
          setEditableFormData(data)
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
      }
    }
    fetchFormData()
  }, [blogPostId])

  const handleContentChange = (value?: string) => {
    setEditableContent(value || "")
  }

  const handleFormDataChange = (name: string, value: string) => {
    setEditableFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegenerate = async () => {
    setIsLoading(true)
    try {
      await onRegenerate(editableContent, editableFormData)
    } catch (error) {
      console.error("Error regenerating content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto space-y-4 bg-white/20 p-6 rounded-lg backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-4">
        <div data-color-mode="dark">
          <MDEditor value={editableContent} onChange={handleContentChange} preview="edit" height={600} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="writingStyle" className="text-lg font-semibold text-white">
            Writing Style
          </Label>
          <div className="relative">
            <select
              id="writingStyle"
              value={editableFormData.writingStyle}
              onChange={(e) => handleFormDataChange("writingStyle", e.target.value)}
              className="w-full px-4 py-3 bg-black/50 text-white rounded-lg appearance-none text-md focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="Persuasive">Persuasive</option>
              <option value="Narrative">Narrative</option>
              <option value="Informative">Informative</option>
              <option value="Descriptive">Descriptive</option>
              <option value="Expository">Expository</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="audienceType" className="text-lg font-semibold text-white">
            Audience Type
          </Label>
          <div className="relative">
            <select
              id="audienceType"
              value={editableFormData.audienceType}
              onChange={(e) => handleFormDataChange("audienceType", e.target.value)}
              className="w-full px-4 py-3 bg-black/50 text-white rounded-lg appearance-none text-md focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="General Public">General Public</option>
              <option value="Technical/Expert">Technical/Expert</option>
              <option value="Academic">Academic</option>
              <option value="Business">Business</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="formalityLevel" className="text-lg font-semibold text-white">
            Formality Level
          </Label>
          <div className="relative">
            <select
              id="formalityLevel"
              value={editableFormData.formalityLevel}
              onChange={(e) => handleFormDataChange("formalityLevel", e.target.value)}
              className="w-full px-4 py-3 bg-black/50 text-white rounded-lg appearance-none text-md focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="Formal">Formal</option>
              <option value="Semi-formal">Semi-formal</option>
              <option value="Informal">Informal</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lengthDetail" className="text-lg font-semibold text-white">
            Length/Detail Level
          </Label>
          <div className="relative">
            <select
              id="lengthDetail"
              value={editableFormData.lengthDetail}
              onChange={(e) => handleFormDataChange("lengthDetail", e.target.value)}
              className="w-full px-4 py-3 bg-black/50 text-white rounded-lg appearance-none text-md focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="Short">Short</option>
              <option value="Medium">Medium</option>
              <option value="Long">Long</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-4 mt-8">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
        >
          Cancel
        </Button>
        <Button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg shadow-lg hover:bg-primary/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Regenerating..." : "Regenerate"}
        </Button>
      </div>
    </motion.div>
  )
}

