import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const generateDashboard = async (base64Content: string, fileName: string, fileType: string) => {
  const prompt = `
    Analyze this ${fileType} file data and generate a comprehensive dashboard analysis:
    
    File: ${fileName}
    Content: ${base64Content}
    
    Please provide:
    1. A brief summary of the data
    2. Key insights and patterns
    3. Suggested chart types and configurations
    4. Important metrics and KPIs
    5. Any anomalies or outliers
    
    Format the response as JSON with the following structure:
    {
      "summary": "Brief overview of the data",
      "insights": ["insight1", "insight2", ...],
      "charts": [
        {
          "type": "bar|line|pie|area",
          "title": "Chart Title",
          "data": [...],
          "config": {...}
        }
      ],
      "metrics": [
        {
          "name": "Metric Name",
          "value": "Value",
          "change": "+5.2%"
        }
      ]
    }
  `;
  
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
};

export const generateBlogSummary = async (content: string) => {
  const prompt = `
    Analyze this blog content and provide:
    1. A compelling title
    2. A brief summary (2-3 sentences)
    3. Relevant tags
    4. SEO-friendly meta description
    
    Content: ${content}
    
    Format as JSON:
    {
      "title": "Suggested Title",
      "summary": "Brief summary",
      "tags": ["tag1", "tag2", ...],
      "metaDescription": "SEO description"
    }
  `;
  
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
};