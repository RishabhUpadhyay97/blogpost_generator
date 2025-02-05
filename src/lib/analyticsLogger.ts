import { PrismaClient } from "@prisma/client"
import type { AdvancedTestResult } from "./aiOutputTester"

// Initialize PrismaClient
const prisma = new PrismaClient()

export async function logTestResult(blogPostId: number, testResult: AdvancedTestResult) {
  try {
    // Validate inputs
    if (!blogPostId || !testResult || typeof testResult !== "object") {
      throw new Error("Invalid input parameters")
    }

    // Ensure the blog post exists before creating a test result
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: blogPostId },
    })

    if (!blogPost) {
      throw new Error(`Blog post with ID ${blogPostId} not found`)
    }

    // Create test result with error handling for JSON serialization
    const result = await prisma.testResult.create({
      data: {
        blogPostId,
        score: testResult.score || 0,
        readabilityScore: testResult.readabilityScore || 0,
        sentiment: testResult.sentiment || "Neutral",
        keywordDensity: JSON.stringify(testResult.keywordDensity || {}),
        grammarErrors: JSON.stringify(testResult.grammarErrors || []),
        feedback: JSON.stringify(testResult.feedback || []),
        suggestions: JSON.stringify(testResult.suggestions || []),
      },
    })

    return result
  } catch (error) {
    console.error("Error logging test result:", error)
    throw error
  }
}

export async function getTestResultsAnalytics(timeRange: "day" | "week" | "month") {
  try {
    const startDate = new Date()
    if (timeRange === "day") startDate.setDate(startDate.getDate() - 1)
    if (timeRange === "week") startDate.setDate(startDate.getDate() - 7)
    if (timeRange === "month") startDate.setMonth(startDate.getMonth() - 1)

    const results = await prisma.testResult.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    })

    if (!results.length) {
      return {
        averageScore: 0,
        averageReadabilityScore: 0,
        commonFeedback: {},
      }
    }

    const averageScore = results.reduce((sum, result) => sum + result.score, 0) / results.length
    const averageReadabilityScore = results.reduce((sum, result) => sum + result.readabilityScore, 0) / results.length

    const commonFeedback = results
      .flatMap((result) => result.feedback)
      .reduce(
        (acc, feedback) => {
          if (feedback) {
            acc[feedback] = (acc[feedback] || 0) + 1
          }
          return acc
        },
        {} as Record<string, number>,
      )

    return {
      averageScore,
      averageReadabilityScore,
      commonFeedback,
    }
  } catch (error) {
    console.error("Error fetching test results analytics:", error)
    throw error
  }
}

export async function disconnectPrisma() {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error("Error disconnecting from Prisma:", error)
  }
}

