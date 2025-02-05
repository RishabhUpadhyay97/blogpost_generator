import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { testAIOutput, type AdvancedTestResult } from "@/lib/aiOutputTester"
import { logTestResult } from "@/lib/analyticsLogger"

const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params since it's a Promise in Next.js App Router
    const { id } = await params
    console.log("Starting test-and-revise process for blog post ID:", id)

    // Validate id is a number
    const blogPostId = Number(id)
    if (isNaN(blogPostId)) {
      return NextResponse.json({ error: "Invalid blog post ID" }, { status: 400 })
    }

    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId },
    })

    if (!blogPost) {
      console.error("Blog post not found:", id)
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 })
    }

    console.log("Testing AI output for blog post ID:", id)
    try {
      console.log("Testing AI output")
      let testResult: AdvancedTestResult | null = null
      try {
        testResult = await testAIOutput(blogPost.generatedContent, "en")
        console.log("Test result:", testResult)

        // Only try to log test result if we have a valid result
        if (testResult && typeof testResult === "object") {
          console.log("Logging test result to database")
          await logTestResult(blogPostId, testResult)
          console.log("Test result logged successfully")
        } else {
          console.error("Invalid test result:", testResult)
        }
      } catch (testError) {
        console.error("Error in testAIOutput:", testError)
      }

      if (testResult && testResult.score < 70) {
        console.log("Low score detected. Attempting to revise content for blog post ID:", id)
        const revisionPrompt = `
          Please revise the following blog post to address these issues:
          ${testResult.feedback.join("\n")}
          ${testResult.suggestions.join("\n")}

          Original content:
          ${blogPost.generatedContent}
        `

        const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        const result = await model.generateContent(revisionPrompt)
        const response = await result.response
        const revisedContent = response.text()

        if (revisedContent) {
          // Update the blog post with the revised content
          const updatedBlogPost = await prisma.blogPost.update({
            where: { id: blogPostId },
            data: { generatedContent: revisedContent },
          })

          // Re-test the revised content
          const revisedTestResult = await testAIOutput(revisedContent, "en")
          if (revisedTestResult) {
            try {
              await logTestResult(blogPostId, revisedTestResult)
            } catch (logError) {
              console.error("Error logging revised test result:", logError)
              // Continue execution even if logging fails
            }
          }

          console.log("Content revised and re-tested for blog post ID:", id)
          return NextResponse.json({
            originalTestResult: testResult,
            revisedContent,
            revisedTestResult,
          })
        }
      }

      console.log("Test completed for blog post ID:", id)
      return NextResponse.json({ testResult })
    } catch (testError) {
      console.error("Error in test/revision process:", testError)
      return NextResponse.json(
        {
          error: "Failed to test/revise content",
          details: testError instanceof Error ? testError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in main process:", error)
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  } finally {
    await prisma.$disconnect()
  }
}

