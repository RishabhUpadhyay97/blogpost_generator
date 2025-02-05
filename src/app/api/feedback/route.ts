import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body || !body.blogPostId || typeof body.rating !== "number") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { blogPostId, rating, comment } = body

    const feedback = await prisma.feedback.create({
      data: {
        blogPostId: Number(blogPostId),
        rating: Number(rating),
        comment: comment || undefined,
      },
    })

    return NextResponse.json({ success: true, feedback })
  } catch (error) {
    console.error("Error saving feedback:", error)
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

