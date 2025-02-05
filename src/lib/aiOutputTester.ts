import { Readability } from "@mozilla/readability"
import { JSDOM } from "jsdom"
import natural from "natural"

interface TestResult {
  score: number
  feedback: string[]
  suggestions: string[]
}

export interface AdvancedTestResult extends TestResult {
  readabilityScore: number
  sentiment: string
  keywordDensity: Record<string, number>
  grammarErrors: string[]
}

export async function testAIOutput(content: string, language = "en"): Promise<AdvancedTestResult> {
  console.log("Starting AI output test")
  const result: AdvancedTestResult = {
    score: 0,
    feedback: [],
    suggestions: [],
    readabilityScore: 0,
    sentiment: "Neutral",
    keywordDensity: {},
    grammarErrors: [],
  }

  try {
    // Basic tests
    if (content.length < 200) {
      result.feedback.push("Content is too short. Aim for at least 200 characters.")
    } else {
      result.score += 10
    }

    const paragraphs = content.split("\n\n")
    if (paragraphs.length < 3) {
      result.feedback.push("Content should have at least 3 paragraphs for better structure.")
    } else {
      result.score += 10
    }

    const headingRegex = /^#\s.+|<h[1-6]>/m
    if (!headingRegex.test(content)) {
      result.feedback.push("Content should include at least one heading (e.g., # Heading or <h1>Heading</h1>).")
    } else {
      result.score += 10
    }

    // Advanced content analysis
    result.readabilityScore = calculateReadabilityScore(content)
    result.score += Math.min(20, result.readabilityScore / 5)

    result.sentiment = analyzeSentiment(content)
    result.score += 10

    result.keywordDensity = calculateKeywordDensity(content)
    if (Object.values(result.keywordDensity).some((density) => density > 0.03)) {
      result.feedback.push("Some keywords appear too frequently. Consider reducing their usage for better readability.")
    } else {
      result.score += 10
    }

    // Structural and semantic tests
    const { avgSentenceLength, sentenceLengthVariety } = analyzeSentenceStructure(content)
    if (avgSentenceLength > 25) {
      result.feedback.push(
        "Average sentence length is too long. Consider breaking up some sentences for better readability.",
      )
    } else if (avgSentenceLength < 10) {
      result.feedback.push("Average sentence length is too short. Consider combining some sentences for better flow.")
    } else {
      result.score += 10
    }

    if (!sentenceLengthVariety) {
      result.feedback.push("Try to vary sentence length for better readability.")
    } else {
      result.score += 10
    }

    const transitionWords = ["however", "therefore", "furthermore", "moreover", "in addition", "consequently"]
    const hasTransitionWords = transitionWords.some((word) => content.toLowerCase().includes(word))
    if (!hasTransitionWords) {
      result.feedback.push("Consider using transition words to improve flow between ideas.")
    } else {
      result.score += 10
    }

    console.log("Calculated test result:", result)
    return result
  } catch (error) {
    console.error("Error in testAIOutput:", error)
    // Return a default result object instead of throwing an error
    return {
      score: 0,
      feedback: ["An error occurred while testing the content."],
      suggestions: ["Please try regenerating the content."],
      readabilityScore: 0,
      sentiment: "Neutral",
      keywordDensity: {},
      grammarErrors: ["Unable to check for grammar errors due to an internal error."],
    }
  }
}

function calculateReadabilityScore(content: string): number {
  try {
    const { textContent } = new JSDOM(content).window.document.body
    const readability = new Readability(new JSDOM(content).window.document).parse()
    return readability ? readability.readabilityScore : 0
  } catch (error) {
    console.error("Error calculating readability score:", error)
    return 0
  }
}

function analyzeSentiment(content: string): string {
  try {
    const analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn")
    const tokenizer = new natural.WordTokenizer()
    const tokens = tokenizer.tokenize(content)
    if (!tokens || tokens.length === 0) {
      return "Neutral"
    }
    const sentiment = analyzer.getSentiment(tokens)
    if (sentiment > 0.05) return "Positive"
    if (sentiment < -0.05) return "Negative"
    return "Neutral"
  } catch (error) {
    console.error("Error analyzing sentiment:", error)
    return "Neutral"
  }
}

function calculateKeywordDensity(content: string): Record<string, number> {
  try {
    const words = content.toLowerCase().match(/\b\w+\b/g) || []
    const wordCount = words.length
    const density: Record<string, number> = {}

    words.forEach((word) => {
      density[word] = (density[word] || 0) + 1 / wordCount
    })

    return Object.fromEntries(
      Object.entries(density)
        .filter(([_, value]) => value > 0.01)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
    )
  } catch (error) {
    console.error("Error calculating keyword density:", error)
    return {}
  }
}

function analyzeSentenceStructure(content: string): { avgSentenceLength: number; sentenceLengthVariety: boolean } {
  try {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || []
    const sentenceLengths = sentences.map((s) => s.trim().split(/\s+/).length)
    const avgSentenceLength = sentenceLengths.reduce((sum, length) => sum + length, 0) / sentences.length || 0
    const sentenceLengthVariety = sentenceLengths.some(
      (length) => length < avgSentenceLength * 0.5 || length > avgSentenceLength * 1.5,
    )

    return {
      avgSentenceLength: isNaN(avgSentenceLength) ? 0 : avgSentenceLength,
      sentenceLengthVariety,
    }
  } catch (error) {
    console.error("Error analyzing sentence structure:", error)
    return { avgSentenceLength: 0, sentenceLengthVariety: false }
  }
}

