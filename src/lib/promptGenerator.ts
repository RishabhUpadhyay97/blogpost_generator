export const PROMPT_VERSION = "1.0"

interface PromptParams {
  topic: string
  writingStyle: string
  audienceType: string
  formalityLevel: string
  lengthDetail: string
  additionalInstructions: string
}

export function generatePrompt(params: PromptParams): string {
  try {
    const { topic, writingStyle, audienceType, formalityLevel, lengthDetail, additionalInstructions } = params

    let prompt = `Write a ${lengthDetail} blog post on the topic: "${topic}".

Writing Style: ${writingStyle}
Audience Type: ${audienceType}
Formality Level: ${formalityLevel}
Length/Detail Level: ${lengthDetail}

The blog post should include:
- An engaging introduction that hooks the reader
- Well-structured body with clear arguments and supporting evidence
- A conclusion that summarizes key points and provides closure

Additional Requirements:
- Ensure content is accurate and properly structured
- Use language appropriate for the specified audience
- Include relevant examples and explanations
- Avoid unsupported claims or offensive language
- Use HTML headings (h1, h2, h3) for proper structure
- Format the content with appropriate HTML tags (p, ul, ol, li, etc.)`

    if (additionalInstructions) {
      prompt += `

Specific Instructions:
${additionalInstructions}`
    }

    return prompt
  } catch (error) {
    console.error("Error generating prompt:", error)
    return getFallbackPrompt()
  }
}

function getFallbackPrompt(): string {
  return `Write a blog post on the given topic. Include an introduction, body, and conclusion. Use appropriate language and structure for a general audience. Use HTML headings (h1, h2, h3) and format the content with appropriate HTML tags.`
}

