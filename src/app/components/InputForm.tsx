"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { generatePrompt } from "@/lib/promptGenerator"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface FormData {
  topic: string
  writingStyle: string
  audienceType: string
  formalityLevel: string
  lengthDetail: string
  additionalInstructions: string
}

export default function InputForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    writingStyle: "Informative",
    audienceType: "General Public",
    formalityLevel: "Semi-formal",
    lengthDetail: "Medium",
    additionalInstructions: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [blogPostId, setBlogPostId] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const prompt = generatePrompt(formData)
      const response = await fetch("/api/generate-blog-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, formData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate blog post")
      }

      const data = await response.json()
      if (data.blogPostId) {
        router.push(`/blog/${data.blogPostId}`)
      } else {
        throw new Error("No blog post ID returned")
      }
    } catch (err) {
      console.error("Error generating blog post:", err)
      setError(
        err instanceof Error ? err.message : "An error occurred while generating the blog post. Please try again.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto space-y-4 bg-contrast p-6 rounded-lg backdrop-blur-sm"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder="Enter your blog post topic"
          className="w-full px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="writingStyle" className="block text-sm font-medium text-contrast mb-1">
            Writing Style
          </label>
          <select
            id="writingStyle"
            name="writingStyle"
            value={formData.writingStyle}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          >
            <option>Persuasive</option>
            <option>Narrative</option>
            <option>Informative</option>
            <option>Descriptive</option>
            <option>Expository</option>
          </select>
        </div>

        <div>
          <label htmlFor="audienceType" className="block text-sm font-medium text-contrast mb-1">
            Audience Type
          </label>
          <select
            id="audienceType"
            name="audienceType"
            value={formData.audienceType}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          >
            <option>General Public</option>
            <option>Technical/Expert</option>
            <option>Academic</option>
            <option>Business</option>
          </select>
        </div>

        <div>
          <label htmlFor="formalityLevel" className="block text-sm font-medium text-contrast mb-1">
            Formality Level
          </label>
          <select
            id="formalityLevel"
            name="formalityLevel"
            value={formData.formalityLevel}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          >
            <option>Formal</option>
            <option>Semi-formal</option>
            <option>Informal</option>
          </select>
        </div>

        <div>
          <label htmlFor="lengthDetail" className="block text-sm font-medium text-contrast mb-1">
            Length/Detail Level
          </label>
          <select
            id="lengthDetail"
            name="lengthDetail"
            value={formData.lengthDetail}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          >
            <option>Short</option>
            <option>Medium</option>
            <option>Long</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="additionalInstructions" className="block text-sm font-medium text-contrast mb-1">
          Additional Instructions/Keywords
        </label>
        <textarea
          id="additionalInstructions"
          name="additionalInstructions"
          value={formData.additionalInstructions}
          onChange={handleChange}
          placeholder="Enter any additional instructions or keywords"
          className="w-full px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          rows={3}
        ></textarea>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-primary/80 border border-white/20 rounded-lg text-contrast shadow-lg hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Blog Post"
          )}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </motion.form>
  )
}

