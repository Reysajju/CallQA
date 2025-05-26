import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCL1yZlzosekEPpB7QeBaaAuKXdePdvYRo");

export async function transcribeAudio(audioContent: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Please transcribe this audio content and provide a structured output with clear section headings. Follow these guidelines:

1. Start with the duration in this format:
DURATION: HH:MM:SS

2. Organize the transcription into logical sections with clear headings like:
- **Introduction**
- **Problem Discussion**
- **Solution Presentation**
- **Service Details**
- **Pricing Discussion**
- **Next Steps**
- **Closing Remarks**

3. Format requirements:
- Use "**Heading**" format for section titles
- Start each new section with its heading on a new line
- Use proper punctuation and capitalization
- Format speaker names as "<strong>Speaker Name:</strong>"
- Use <em> tags for emphasized words or important points

Example format:
DURATION: 00:15:30

**Introduction**
<strong>John:</strong> Welcome everyone to today's meeting...

**Problem Discussion**
<strong>Sarah:</strong> Let's discuss the main challenges...`;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/mpeg",
          data: audioContent.split(',')[1]
        }
      }
    ]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Unable to transcribe audio. Please try again or contact support if the issue persists.');
  }
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (
        i < retries - 1 &&
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        (error as any).message.includes('429')
      ) {
        const retryDelay = delay * Math.pow(2, i); // Exponential backoff
        console.warn(`Retrying after ${retryDelay}ms due to 429 error...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('All retries failed');
}

// Helper function to process items sequentially with delay
async function processSequentially<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  delayMs: number = 2000
): Promise<R[]> {
  const results: R[] = [];
  for (const item of items) {
    try {
      const result = await processor(item);
      results.push(result);
      if (items.indexOf(item) < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error processing item:`, error);
      results.push('Unable to process this item due to rate limiting. Please try again later.' as R);
    }
  }
  return results;
}

export async function analyzeTranscription(transcription: string, questions: string[]): Promise<{
  summary: string;
  timestampedTranscription: Array<{
    speaker: string;
    timestamp: string;
    text: string;
  }>;
  analysis: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // First, get summary and timestamped transcription
    const structurePrompt = `Analyze this transcription and provide:

1. A detailed summary of the key points and important information
2. A timestamped breakdown of the conversation

Format your response exactly like this:

===SUMMARY===
[Your detailed summary here]
===END_SUMMARY===

===TIMESTAMPED===
[Each entry in format:]
SPEAKER: [Speaker name]
TIME: [HH:MM:SS]
TEXT: [What they said]
[End each entry with ---]
===END_TIMESTAMPED===`;

    const structureResult = await retryWithBackoff(() => model.generateContent([structurePrompt, transcription]));
    const structureResponse = await structureResult.response;
    const structureText = structureResponse.text();

    // Parse summary
    const summaryMatch = structureText.match(/===SUMMARY===([\s\S]*?)===END_SUMMARY===/);
    const summary = summaryMatch ? summaryMatch[1].trim() : 'No summary available.';

    // Parse timestamped transcription
    const timestampedMatch = structureText.match(/===TIMESTAMPED===([\s\S]*?)===END_TIMESTAMPED===/);
    const timestampedText = timestampedMatch ? timestampedMatch[1].trim() : '';
    const timestampedEntries = timestampedText.split('---').filter(Boolean);
    
    const timestampedTranscription = timestampedEntries.map((entry: string) => {
      const speakerMatch = entry.match(/SPEAKER:\s*(.*)/);
      const timeMatch = entry.match(/TIME:\s*(.*)/);
      const textMatch = entry.match(/TEXT:\s*(.*)/);
      
      return {
        speaker: speakerMatch ? speakerMatch[1].trim() : 'Unknown Speaker',
        timestamp: timeMatch ? timeMatch[1].trim() : '00:00:00',
        text: textMatch ? textMatch[1].trim() : ''
      };
    });

    // Process questions sequentially with delay between each
    const analysis = await processSequentially(questions, async (question) => {
      const prompt = `Based on this transcription: "${transcription}", please provide a detailed analysis for the following question. Format important points with HTML emphasis tags (<em>) for emphasis and strong tags (<strong>) for key findings: ${question}`;
      const result = await retryWithBackoff(() => model.generateContent(prompt));
      const response = await result.response;
      return response.text();
    });

    return {
      summary,
      timestampedTranscription,
      analysis
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Unable to analyze transcription. Please try again or contact support if the issue persists.');
  }
}

export async function chatWithTranscription(transcription: string, userMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are a helpful AI assistant analyzing a call transcription. Use the transcription content to answer questions accurately and provide relevant insights.

Transcription:
${transcription}

User Question: ${userMessage}

Please provide a clear, concise answer based on the transcription content. If the information isn't available in the transcription, state that clearly.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error('Unable to process your question. Please try again.');
  }
}