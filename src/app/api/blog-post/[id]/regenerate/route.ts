import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { generatePrompt } from "@/lib/promptGenerator"

const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { content, formData } = await request.json()

    if (!formData) {
      throw new Error("Form data is missing")
    }

    // Generate new prompt based on updated form data
    const prompt = generatePrompt(formData)

    // Use Gemini to regenerate content
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const newContent = response.text()

    // Update the blog post in the database
    const updatedPost = await prisma.blogPost.update({
      where: {
        id: Number(id),
      },
      data: {
        generatedContent: newContent,
        topic: formData.topic,
        writingStyle: formData.writingStyle,
        audience: formData.audienceType,
        formality: formData.formalityLevel,
        length: formData.lengthDetail,
        additionalInstructions: formData.additionalInstructions || "",
      },
    })

    return NextResponse.json({
      content: updatedPost.generatedContent,
      formData: {
        topic: updatedPost.topic,
        writingStyle: updatedPost.writingStyle,
        audienceType: updatedPost.audience,
        formalityLevel: updatedPost.formality,
        lengthDetail: updatedPost.length,
        additionalInstructions: updatedPost.additionalInstructions || "",
      },
    })
  } catch (error) {
    console.error("Error regenerating blog post:", error)
    return NextResponse.json({ error: "Failed to regenerate blog post" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

