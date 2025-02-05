import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: Request) {
  try {
    const { content } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const prompt = `You are a professional AI content evaluator. Your task is to assess the quality of the blog post content provided below. Evaluate the content by considering factors such as structure, clarity, engagement, the effective use of headings, paragraph organization, and overall writing quality.

Please provide:
- A numerical score out of 100 representing the overall quality.
- Brief, bullet-pointed feedback as an array of strings, highlighting key strengths and weaknesses (not more that 20 words).
- Concise, bullet-pointed suggestions for improvement as an array of strings (not more that 20 words).

Your response must be valid JSON in the following format:
{
  "score": number,
  "feedback": string[],
  "suggestions": string[]
}

Blog Post Content:
${content}`;

    const result = await model.generateContent(prompt)
    const response = await result.response
    const evaluationText = response.text()

    let evaluation
    try {
      // Extract JSON from markdown code block if present
      const jsonMatch = evaluationText.match(/```json\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : evaluationText

      // Try to parse the JSON response
      evaluation = JSON.parse(jsonString)
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      // If parsing fails, return a structured error response
      evaluation = {
        score: 0,
        feedback: ["Error: Unable to parse AI response"],
        suggestions: [evaluationText],
      }
    }

    return NextResponse.json(evaluation)
  } catch (error) {
    console.error("Error evaluating content:", error)
    return NextResponse.json({ error: "Failed to evaluate content" }, { status: 500 })
  }
}

