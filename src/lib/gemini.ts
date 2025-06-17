import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProcessingOptions } from '../types';

// Get API key from environment variables
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY environment variable is not set. Please add it to your .env file.');
  }
  return apiKey;
};

const genAI = new GoogleGenerativeAI(getApiKey());

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
    
    const result = await retryWithBackoff(() => model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/mpeg",
          data: audioContent.split(',')[1]
        }
      }
    ]));
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
        ((error as any).message.includes('429') || (error as any).message.includes('503'))
      ) {
        const retryDelay = delay * Math.pow(2, i);
        console.warn(`Retrying after ${retryDelay}ms due to API error (${(error as any).message.includes('429') ? 'rate limit' : 'service overloaded'})...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('All retries failed');
}

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

export async function processSelectedFeatures(
  transcription: string, 
  options: ProcessingOptions,
  questions: string[]
): Promise<{
  summary?: string;
  timestampedTranscription?: Array<{
    speaker: string;
    timestamp: string;
    text: string;
  }>;
  analysis?: string[];
}> {
  const results: any = {};

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Process summary ONLY if requested
    if (options.summary) {
      console.log('Processing summary...');
      const summaryPrompt = `Analyze this transcription and provide a detailed summary of the key points and important information:

${transcription}

Please provide a comprehensive summary that captures the main topics, decisions, and important details discussed.`;

      const summaryResult = await retryWithBackoff(() => model.generateContent(summaryPrompt));
      const summaryResponse = await summaryResult.response;
      results.summary = summaryResponse.text();
    }

    // Process timestamped transcription ONLY if requested
    if (options.timestampedTranscription) {
      console.log('Processing timestamped transcription...');
      const timestampPrompt = `Analyze this transcription and create a timestamped breakdown of the conversation:

${transcription}

Format your response exactly like this:

===TIMESTAMPED===
SPEAKER: Speaker A
TIME: 00:00:15
TEXT: Hello, welcome to today's meeting.
---
SPEAKER: Speaker B
TIME: 00:00:22
TEXT: Thank you for having me.
---
SPEAKER: Speaker A
TIME: 00:00:30
TEXT: Let's discuss the main agenda items.
---
===END_TIMESTAMPED===

IMPORTANT: 
- Use the exact format with SPEAKER:, TIME:, TEXT: labels
- Separate each entry with --- on its own line
- Include realistic timestamps in HH:MM:SS format
- Identify different speakers as Speaker A, Speaker B, etc.`;

      const timestampResult = await retryWithBackoff(() => model.generateContent(timestampPrompt));
      const timestampResponse = await timestampResult.response;
      const timestampText = timestampResponse.text();

      // Parse timestamped transcription with improved parsing
      const timestampedMatch = timestampText.match(/===TIMESTAMPED===([\s\S]*?)===END_TIMESTAMPED===/);
      if (timestampedMatch) {
        const timestampedContent = timestampedMatch[1].trim();
        // Split by --- separator
        const timestampedEntries = timestampedContent.split('---').filter(entry => entry.trim());
        
        results.timestampedTranscription = timestampedEntries.map((entry: string) => {
          const lines = entry.trim().split('\n');
          let speaker = 'Unknown Speaker';
          let timestamp = '00:00:00';
          let text = '';
          
          lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('SPEAKER:')) {
              speaker = trimmedLine.replace('SPEAKER:', '').trim();
            } else if (trimmedLine.startsWith('TIME:')) {
              timestamp = trimmedLine.replace('TIME:', '').trim();
            } else if (trimmedLine.startsWith('TEXT:')) {
              text = trimmedLine.replace('TEXT:', '').trim();
            }
          });
          
          return {
            speaker: speaker || 'Unknown Speaker',
            timestamp: timestamp || '00:00:00',
            text: text || ''
          };
        }).filter((entry: any) => entry.text && entry.text.length > 0);
      } else {
        // Fallback parsing if the format doesn't match
        results.timestampedTranscription = [];
      }
    }

    // Process analysis ONLY if requested AND questions are provided
    if (options.analysis && questions.length > 0) {
      console.log('Processing analysis...');
      const analysis = await processSequentially(questions, async (question) => {
        const prompt = `Based on this transcription: "${transcription}", please provide a detailed analysis for the following question. Format important points with HTML emphasis tags (<em>) for emphasis and strong tags (<strong>) for key findings: ${question}`;
        const result = await retryWithBackoff(() => model.generateContent(prompt));
        const response = await result.response;
        return response.text();
      });
      results.analysis = analysis;
    }

    console.log('Processing completed. Results:', {
      hasSummary: !!results.summary,
      hasTimestamped: !!results.timestampedTranscription,
      hasAnalysis: !!results.analysis,
      selectedOptions: options
    });

    return results;
  } catch (error) {
    console.error('Processing error:', error);
    throw new Error('Unable to process selected features. Please try again or contact support if the issue persists.');
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