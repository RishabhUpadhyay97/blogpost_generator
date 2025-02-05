import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { PrismaClient } from "@prisma/client"
import { PROMPT_VERSION, generatePrompt } from "@/lib/promptGenerator"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Received request body:", body)

    const { formData } = body

    if (!formData) {
      console.error("Missing formData")
      return NextResponse.json({ error: "Missing formData" }, { status: 400 })
    }

    const prompt = generatePrompt(formData)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    console.log("Generating content with prompt:", prompt)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      console.error("Failed to generate content")
      return NextResponse.json({ error: "Failed to generate content" }, { status: 500 })
    }

    console.log("Content generated successfully")

    // Save the blog post to the database
    console.log("Saving blog post to database")
    const blogPost = await prisma.blogPost.create({
      data: {
        topic: formData.topic,
        writingStyle: formData.writingStyle,
        audience: formData.audienceType,
        formality: formData.formalityLevel,
        length: formData.lengthDetail,
        additionalInstructions: formData.additionalInstructions,
        prompt,
        generatedContent: content,
        promptVersion: PROMPT_VERSION,
      },
    })

    console.log("Blog post saved with ID:", blogPost.id)

    // Call the test-and-revise API
    console.log("Calling test-and-revise API")
    const testApiUrl = new URL(`/api/test-and-revise/${blogPost.id}`, req.url).toString()
    console.log("Test API URL:", testApiUrl)
    const testResponse = await fetch(testApiUrl, {
      method: "POST",
    })

    if (!testResponse.ok) {
      console.error("Error testing and revising content:", await testResponse.text())
      return NextResponse.json({ error: "Failed to test and revise content" }, { status: 500 })
    }

    const testResult = await testResponse.json()
    console.log("Test result received:", testResult)

    // If the content was revised, update the blog post
    if (testResult.revisedContent) {
      console.log("Updating blog post with revised content")
      await prisma.blogPost.update({
        where: { id: blogPost.id },
        data: { generatedContent: testResult.revisedContent },
      })
    }

    const responseData = {
      content: testResult.revisedContent || content,
      blogPostId: blogPost.id,
      testResult: testResult.revisedTestResult || testResult.testResult,
    }

    console.log("Sending response:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error generating blog post:", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ error: "Failed to generate blog post" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

