"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import BlogPostView from "@/app/components/BlogPostView"
import Logo from "@/app/components/Logo"

interface BlogPostPageProps {
  initialContent: string
  blogPostId: number
}

export default function BlogPostPage({ initialContent, blogPostId }: BlogPostPageProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)

  const handleNewPost = () => {
    router.push("/")
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo isSmall={true} onLogoClick={handleNewPost} className="mb-8" />
          <div className="flex-grow" />
        </div>
      </header>
      <main className="flex-grow pt-16 container mx-auto px-4 py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto mt-4">
          <BlogPostView content={content} onEdit={handleNewPost} blogPostId={blogPostId} setContent={setContent} />
        </div>
      </main>
    </div>
  )
}

