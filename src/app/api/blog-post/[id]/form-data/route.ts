import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const blogPost = await prisma.blogPost.findUnique({
      where: {
        id: Number(id),
      },
    })

    if (!blogPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    const formData = {
      topic: blogPost.topic,
      writingStyle: blogPost.writingStyle,
      audienceType: blogPost.audience,
      formalityLevel: blogPost.formality,
      lengthDetail: blogPost.length,
      additionalInstructions: blogPost.additionalInstructions || "",
    }

    return NextResponse.json(formData)
  } catch (error) {
    console.error("Error fetching form data:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to fetch form data" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

