"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { MoreVertical, Copy, Loader2, BarChart, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import rehypeRaw from "rehype-raw"
import type React from "react"
import BlogPostEditor from "./BlogPostEditor"

interface BlogPostViewProps {
  content: string
  onEdit: () => void
  blogPostId: number
  testResult?: {
    score: number
    feedback: string[]
    suggestions: string[]
  }
  setContent: (content: string) => void
}

export default function BlogPostView({ content, onEdit, blogPostId, testResult, setContent }: BlogPostViewProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{ score: number; feedback: string[]; suggestions: string[] } | null>(
    null,
  )
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [formData, setFormData] = useState({
    topic: "",
    writingStyle: "",
    audienceType: "",
    formalityLevel: "",
    lengthDetail: "",
    additionalInstructions: "",
  })

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`/api/blog-post/${blogPostId}/form-data`)
        if (response.ok) {
          const data = await response.json()
          setFormData(data)
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
      }
    }
    fetchFormData()
  }, [blogPostId])

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === null) {
      setError("Please select a rating")
      return
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blogPostId, rating, comment }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setFeedbackSubmitted(true)
      setError(null)
    } catch (err) {
      setError("An error occurred while submitting feedback. Please try again.")
    }
  }

  const handleEvaluateAIOutput = async () => {
    setIsEvaluating(true)
    setShowEvaluationModal(true)
    setError(null)

    try {
      const response = await fetch("/api/evaluate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate content")
      }

      const result = await response.json()
      setAiTestResult(result)
    } catch (err) {
      console.error("Error evaluating content:", err)
      setError("An error occurred while evaluating the content. Please try again.")
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleCopyContent = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert("Content copied to clipboard!")
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleRegenerate = async (newContent: string, newFormData: typeof formData) => {
    try {
      const response = await fetch(`/api/blog-post/${blogPostId}/regenerate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent, formData: newFormData }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate content")
      }

      const data = await response.json()
      setContent(data.content)
      setFormData(data.formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error regenerating content:", error)
      setError("An error occurred while regenerating the content. Please try again.")
    }
  }

  const MarkdownComponents = {
    h1: ({ node, ...props }) => (
      <h1
        className="text-3xl font-bold mb-6 p-4 bg-primary/30 text-white rounded-lg shadow-lg border-2 border-white text-shadow"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mb-4 p-2 text-white text-shadow" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mb-3 p-2 text-white text-shadow" {...props} />,
    h4: ({ node, ...props }) => <h4 className="text-lg font-bold mb-2 p-1 text-white text-shadow" {...props} />,
    h5: ({ node, ...props }) => <h5 className="text-base font-bold mb-2 p-1 text-white text-shadow" {...props} />,
    h6: ({ node, ...props }) => <h6 className="text-sm font-bold mb-2 p-1 text-white text-shadow" {...props} />,
    p: ({ node, ...props }) => <p className="mb-4 text-white text-shadow" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-none space-y-2 mb-4" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-none space-y-2 mb-4 counter-reset-decimal" {...props} />,
    li: ({ node, children, ...props }) => {
      const isMultiLine =
        Array.isArray(children) &&
        children.some((child) => typeof child === "object" && "type" in child && child.type === "p")

      return (
        <li className="flex text-white relative pl-6 text-shadow" {...props}>
          <span className="absolute left-0 top-0 text-shadow">•</span>
          <div className={`${isMultiLine ? "flex-1" : ""} text-shadow`}>{children}</div>
        </li>
      )
    },
    a: ({ node, ...props }) => <a className="text-white underline hover:no-underline text-shadow" {...props} />,
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-white/50 pl-4 italic my-4 text-white text-shadow" {...props} />
    ),
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code className="bg-white/10 rounded px-1 py-0.5 text-white text-shadow" {...props} />
      ) : (
        <code className="block bg-white/10 rounded p-2 text-white overflow-x-auto text-shadow" {...props} />
      ),
    pre: ({ node, ...props }) => <pre className="bg-white/10 rounded p-2 overflow-x-auto text-shadow" {...props} />,
  }

  if (isEditing) {
    return (
      <BlogPostEditor
        content={content}
        formData={formData}
        blogPostId={blogPostId}
        onCancel={() => setIsEditing(false)}
        onRegenerate={handleRegenerate}
      />
    )
  }

  return (
    <motion.div
      className="w-full space-y-4 bg-white/20 p-6 rounded-lg backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button variant="ghost" size="icon" onClick={handleCopyContent} className="hover:bg-white/10">
          <Copy className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white/20 backdrop-blur-md text-white">
            <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowFeedbackModal(true)}>Provide Feedback</DropdownMenuItem>
            <DropdownMenuItem onClick={handleEvaluateAIOutput}>Evaluate AI Output</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={MarkdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="bg-white/20 backdrop-blur-md text-white">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          {!feedbackSubmitted ? (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`w-10 h-10 rounded-full ${
                        rating === value ? "bg-primary text-white" : "bg-white/20 text-white"
                      } hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-white/50`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                  Comment (optional)
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                  rows={3}
                  placeholder="Enter your feedback here"
                ></textarea>
              </div>
              <Button type="submit" className="w-full">
                Submit Feedback
              </Button>
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </form>
          ) : (
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4">Thank you for your feedback!</h3>
              <p>Your input is valuable and helps us improve our AI-generated content.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
        <DialogContent className="bg-white/20 backdrop-blur-md text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Output Evaluation</DialogTitle>
          </DialogHeader>
          {isEvaluating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-4 animate-spin text-primary" />
              <p className="mt-4 text-lg">Evaluating content...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : aiTestResult ? (
            <div className="mt-4 space-y-4">
              <h3 className="text-xl font-bold">Quality Score: {aiTestResult.score}/100</h3>
              {aiTestResult.feedback.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Feedback:</h4>
                  <div className="space-y-2">
                    {aiTestResult.feedback.map((item, index) => (
                      <ReactMarkdown
                        key={index}
                        className="prose-sm prose-invert"
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={MarkdownComponents}
                      >
                        {item}
                      </ReactMarkdown>
                    ))}
                  </div>
                </div>
              )}
              {aiTestResult.suggestions.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Suggestions for improvement:</h4>
                  <div className="space-y-2">
                    {aiTestResult.suggestions.map((item, index) => (
                      <ReactMarkdown
                        key={index}
                        className="prose-sm prose-invert"
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={MarkdownComponents}
                      >
                        {item}
                      </ReactMarkdown>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      {testResult && (
        <div className="mt-8 p-4 bg-white/10 rounded-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <BarChart className="mr-2" />
            Content Quality Score
          </h3>
          <div className="flex items-center mb-4">
            <div className={`text-4xl font-bold ${testResult.score >= 70 ? "text-green-500" : "text-yellow-500"}`}>
              {testResult.score}
            </div>
            <div className="ml-4">
              {testResult.score >= 70 ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <AlertTriangle className="text-yellow-500" />
              )}
            </div>
          </div>
          {testResult.feedback.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Feedback:</h4>
              <ul className="list-disc pl-5">
                {testResult.feedback.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {testResult.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Suggestions:</h4>
              <ul className="list-disc pl-5">
                {testResult.suggestions.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        .prose-sm {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .prose-sm p {
          margin-bottom: 0.875em;
        }
        .prose-sm ul {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .prose-sm li {
          margin-bottom: 0.25em;
        }
        .prose-sm code {
          font-size: 0.8em;
          background-color: rgba(255, 255, 255, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 0.2em;
        }
        .prose-sm pre {
          font-size: 0.8em;
          line-height: 1.6;
          margin-top: 1em;
          margin-bottom: 1em;
          border-radius: 0.3em;
          padding: 0.75em 1em;
        }
        .prose ul {
          margin-top: 1em;
          margin-bottom: 1em;
        }
        
        .prose li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        .prose li > p {
          margin: 0;
          display: inline;
        }
        
        .prose li > p:not(:last-child) {
          margin-bottom: 0.5em;
        }
        
        .counter-reset-decimal {
          counter-reset: decimal;
        }
        
        .prose ol > li {
          counter-increment: decimal;
        }
        
        .prose ol > li::before {
          content: counter(decimal) ".";
          position: absolute;
          left: 0;
          top: 0;
        }
      `}</style>
    </motion.div>
  )
}

