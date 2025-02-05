import BlogPostPage from "./BlogPostPage"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"

const prisma = new PrismaClient()

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!blogPost) {
      notFound()
    }

    return <BlogPostPage initialContent={blogPost.generatedContent} blogPostId={blogPost.id} />
  } catch (error) {
    console.error("Error fetching blog post:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

