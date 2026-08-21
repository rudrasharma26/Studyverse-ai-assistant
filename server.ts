import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback OpenRouter helper if OPENROUTER_API_KEY is configured
async function callOpenRouter(prompt: string, maxTokens = 3000): Promise<string | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('OpenRouter error:', err);
    return null;
  }
}

// Universal AI generator helper
async function generateAIContent(prompt: string, systemInstruction?: string): Promise<string> {
  const gemini = getGeminiClient();
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, trying fallback:', err);
    }
  }

  // Try OpenRouter
  const openRouterResult = await callOpenRouter(prompt);
  if (openRouterResult) {
    return openRouterResult;
  }

  // Graceful smart local generator if no API key is set yet
  return generateFallbackContent(prompt);
}

// Comprehensive fallback generator for instant prototype preview
function generateFallbackContent(prompt: string): string {
  if (prompt.includes('TOPIC A:') && prompt.includes('TOPIC B:')) {
    const matchA = prompt.match(/TOPIC A:\s*([^\n]+)/i);
    const matchB = prompt.match(/TOPIC B:\s*([^\n]+)/i);
    const a = matchA ? matchA[1].trim() : 'Concept A';
    const b = matchB ? matchB[1].trim() : 'Concept B';
    return `### Overview
**${a}** and **${b}** are both fundamental paradigms in their respective domains, each designed with distinct architectural objectives and trade-offs.

### Similarities
- Both concepts aim to solve structured domain challenges efficiently.
- Both require clear understanding of underlying state and control flow.
- Both are widely adopted in modern production ecosystems.

### Key Differences
| Feature | ${a} | ${b} |
| :--- | :--- | :--- |
| **Primary Goal** | High performance & simplicity | Flexibility & modularity |
| **Complexity** | Low-to-moderate learning curve | Specialized architectural patterns |
| **Memory Footprint** | Optimized for lean execution | Configurable based on workloads |
| **Best Suited For** | Direct, deterministic pipelines | Dynamic, distributed applications |
| **Community Support**| Mature ecosystem with extensive docs | Actively evolving standard |

### When to Use Which
- **Choose ${a} when:**
  - You need fast execution with minimal setup overhead.
  - Your problem domain fits standard linear constraints.
  - Predictable latency is a primary concern.
- **Choose ${b} when:**
  - You require high extensibility across distinct microservices.
  - Team collaboration demands decoupled interfaces.
  - Future expansion plans require modular interchangeability.

### Quick Summary
Use **${a}** for direct, high-efficiency execution and minimal complexity, while **${b}** excels when scalability, modularity, and broad architectural flexibility are paramount.`;
  }

  // Extract topic
  const topicMatch = prompt.match(/TOPIC:\s*([^\n]+)/i);
  const topic = topicMatch ? topicMatch[1].trim() : 'Your Study Topic';

  return `### Explanation
**${topic}** is a core concept that provides the theoretical and practical foundation for understanding how related systems interact and function.

At its essence, **${topic}** revolves around three primary mechanisms:
1. **Structural Foundation**: The underlying rules, properties, and components that define the behavior.
2. **Operational Workflow**: How inputs are processed, transformed, and communicated to produce deterministic outcomes.
3. **Equilibrium & Efficiency**: Balancing throughput, safety, and correctness across variable workloads.

$$\\text{Efficiency} = \\frac{\\text{Useful Work Output}}{\\text{Total Energy or Resources Injected}} \\times 100\\%$$

Understanding ${topic} allows students and practitioners to reason critically about system trade-offs, debugging edge cases, and designing robust solutions.

### Summary
- **Core Purpose**: Establishes predictable models for understanding complex operations.
- **Key Mechanism**: Operates via structured transformations and feedback loops.
- **Real-World Impact**: Widely utilized across industry standards to optimize workflows and reduce cognitive overhead.

### Important Points
- **Foundation**: Built upon first-principles logic and modular design.
- **Key Formula**: $E = mc^2$ and $F = ma$ demonstrate proportional scaling laws.
- **Common Pitfall**: Overlooking edge-case boundary conditions during initialization.
- **Optimization Strategy**: Always verify invariants prior to executing state mutations.

### Quiz
**Q1 [MCQ]:** What is the primary operational objective of ${topic}?
A) Maximizing redundant state duplication
B) Providing predictable, structured problem-solving mechanisms
C) Eliminating all input validation
D) Enforcing irreversible global mutations
**Answer:** B

**Q2 [MCQ]:** Which factor is most critical when analyzing efficiency in this context?
A) Number of decorative styling rules
B) Resource consumption relative to useful output
C) File extension naming conventions
D) Font sizing variations
**Answer:** B

**Q3 [SHORT]:** In your own words, what is the most important benefit of understanding ${topic}?
**Answer:** It provides a strong mental model for diagnosing edge cases and optimizing performance across complex systems.`;
}

// ---------------------------------------------------------------------------
// Section Parsers
// ---------------------------------------------------------------------------

function parseStudyMaterial(rawText: string, topic: string, difficulty: string, studyMode: string) {
  const sections: Record<string, string> = {
    Explanation: '',
    Summary: '',
    'Important Points': '',
    Quiz: '',
  };

  const headingPattern = /^#{2,4}\s*(.+?)\s*$/gm;
  const matches = [...rawText.matchAll(headingPattern)];

  if (matches.length === 0) {
    sections.Explanation = rawText.trim();
  } else {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const heading = match[1].trim();
      const startIndex = (match.index ?? 0) + match[0].length;
      const endIndex = matches[i + 1] ? (matches[i + 1].index ?? rawText.length) : rawText.length;
      const content = rawText.substring(startIndex, endIndex).trim();

      const normalized = heading.toLowerCase();
      if (normalized.includes('explanation') || normalized.includes('concept')) {
        sections.Explanation = content;
      } else if (normalized.includes('summary') || normalized.includes('revision')) {
        sections.Summary = content;
      } else if (normalized.includes('important') || normalized.includes('key point')) {
        sections['Important Points'] = content;
      } else if (normalized.includes('quiz') || normalized.includes('practice')) {
        sections.Quiz = content;
      } else {
        sections.Explanation += `\n\n#### ${heading}\n${content}`;
      }
    }
  }

  // Parse Quiz
  const quizItems = parseQuizText(sections.Quiz || rawText);

  return {
    topic,
    difficulty,
    study_mode: studyMode,
    explanation: sections.Explanation || 'Explanation generation in progress...',
    summary: sections.Summary || 'Summary generation in progress...',
    important_points: sections['Important Points'] || 'Key points generation in progress...',
    quiz: quizItems,
    raw: rawText,
    timestamp: new Date().toISOString(),
  };
}

function parseQuizText(quizText: string) {
  const quizBlocks = quizText.split(/(?=\*{2}Q\s*\d+|\bQ\d+[\s:.)])/i).filter(b => b.trim());
  const parsedItems: any[] = [];

  for (const block of quizBlocks) {
    const isMCQ = /\[MCQ\]|A\)\s+.+B\)\s+/i.test(block);
    const answerMatch = block.match(/\*{0,2}Answer\s*[:.)]?\*{0,2}\s*(.+)$/im);
    const answer = answerMatch ? answerMatch[1].trim() : '';

    // Extract Question text
    let question = block;
    const qMatch = block.match(/(?:\*{2}Q\s*\d+\s*(?:\[\s*(?:MCQ|SHORT)\s*\])?\s*:?\*{2}|Q\d+[:.)])\s*([\s\S]+?)(?=(?:^[A-D]\)|^\*{0,2}Answer|\n\s*A\)))/im);
    if (qMatch) {
      question = qMatch[1].trim();
    } else {
      question = block.replace(/\*{0,2}Answer[\s\S]*$/i, '').replace(/^\*{0,2}Q\s*\d+[^:]*:\*{0,2}/i, '').trim();
    }

    if (isMCQ) {
      const options: Record<string, string> = {};
      const optA = block.match(/A[).]\s*([^\n]+)/i);
      const optB = block.match(/B[).]\s*([^\n]+)/i);
      const optC = block.match(/C[).]\s*([^\n]+)/i);
      const optD = block.match(/D[).]\s*([^\n]+)/i);
      if (optA) options.A = optA[1].trim();
      if (optB) options.B = optB[1].trim();
      if (optC) options.C = optC[1].trim();
      if (optD) options.D = optD[1].trim();

      // Clean Answer letter
      const letterMatch = answer.match(/([A-D])/i);
      const cleanAnswer = letterMatch ? letterMatch[1].toUpperCase() : 'A';

      parsedItems.push({
        type: 'mcq',
        question: question || 'Multiple Choice Question',
        options: Object.keys(options).length >= 2 ? options : { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
        answer: cleanAnswer,
      });
    } else {
      parsedItems.push({
        type: 'short',
        question: question || 'Quiz Question',
        answer: answer.replace(/^\*{0,2}Answer[:\s*]*/i, '').trim() || 'Reference answer',
      });
    }
  }

  if (parsedItems.length === 0) {
    return [
      {
        type: 'short',
        question: `What is the core takeaway regarding this study topic?`,
        answer: 'Understanding the underlying mechanisms and real-world applicability.',
      },
    ];
  }

  return parsedItems;
}

function parseCompareText(rawText: string, topicA: string, topicB: string) {
  const sections: Record<string, string> = {
    overview: '',
    similarities: '',
    differences: '',
    use_cases: '',
    summary: '',
  };

  const headingPattern = /^#{2,4}\s*(.+?)\s*$/gm;
  const matches = [...rawText.matchAll(headingPattern)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const heading = match[1].trim().toLowerCase();
    const startIndex = (match.index ?? 0) + match[0].length;
    const endIndex = matches[i + 1] ? (matches[i + 1].index ?? rawText.length) : rawText.length;
    const content = rawText.substring(startIndex, endIndex).trim();

    if (heading.includes('overview') || heading.includes('intro')) {
      sections.overview = content;
    } else if (heading.includes('similar')) {
      sections.similarities = content;
    } else if (heading.includes('diff') || heading.includes('table')) {
      sections.differences = content;
    } else if (heading.includes('when') || heading.includes('use case')) {
      sections.use_cases = content;
    } else if (heading.includes('summary') || heading.includes('conclusion')) {
      sections.summary = content;
    }
  }

  return {
    topic_a: topicA,
    topic_b: topicB,
    overview: sections.overview || `Overview comparing ${topicA} and ${topicB}.`,
    similarities: sections.similarities || `- Both ${topicA} and ${topicB} serve key practical purposes in their domains.`,
    differences: sections.differences || `| Feature | ${topicA} | ${topicB} |\n|---|---|---|\n| Approach | Method A | Method B |`,
    use_cases: sections.use_cases || `**Choose ${topicA} when** standard simplicity is needed.\n\n**Choose ${topicB} when** specialized customization is required.`,
    summary: sections.summary || `Both ${topicA} and ${topicB} have distinct strengths depending on project scale and complexity.`,
    raw: rawText,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate Study Material
app.post('/api/study/generate', async (req, res) => {
  try {
    const { topic, difficulty = 'Intermediate', study_mode = 'Learn Mode' } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'Please provide a topic to generate study material.' });
    }

    const quizCount = study_mode === 'Exam Mode' ? 10 : study_mode === 'Revision Mode' ? 4 : 3;
    const mcqInstructions = study_mode === 'Exam Mode'
      ? `Create exactly 10 quiz questions: 5 multiple-choice questions (MCQ) followed by 5 short-answer questions.
MCQ pattern:
**Q1 [MCQ]:** <question text>
A) <option text>
B) <option text>
C) <option text>
D) <option text>
**Answer:** <single correct letter A, B, C, or D>

Short-answer pattern:
**Q6 [SHORT]:** <question text>
**Answer:** <answer text>`
      : `Create exactly ${quizCount} quiz questions formatted as:
**Q1 [SHORT]:** <question text>
**Answer:** <answer text>`;

    const prompt = `You are an elite AI Study Assistant helping a student master the topic below.

TOPIC: ${topic.trim()}
DIFFICULTY LEVEL: ${difficulty}
STUDY MODE: ${study_mode}

You MUST respond using EXACTLY this structure with these exact section headers:

### Explanation
A comprehensive, intuitive explanation tailored to ${difficulty} level and ${study_mode}.

### Summary
Concise revision notes written as clear bullet points or crisp paragraphs.

### Important Points
A high-yield bulleted list ("-") of critical facts, terms, or key formulas.

### Quiz
${mcqInstructions}

MATH AND FORMULA FORMATTING:
- Wrap inline math in single dollar signs $E = mc^2$.
- Wrap standalone equations in double dollar signs $$F = ma$$.
- Use standard LaTeX notation (\\frac{a}{b}, \\sqrt{x}, \\sum, \\int).`;

    const rawAIResponse = await generateAIContent(prompt);
    const parsed = parseStudyMaterial(rawAIResponse, topic.trim(), difficulty, study_mode);

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate study material.' });
  }
});

// Compare Mode
app.post('/api/study/compare', async (req, res) => {
  try {
    const { topic_a, topic_b, difficulty = 'Intermediate' } = req.body;
    if (!topic_a || !topic_b) {
      return res.status(400).json({ error: 'Please enter both topics to compare.' });
    }

    const prompt = `You are an expert AI tutor. Provide a side-by-side comparison of:
TOPIC A: ${topic_a.trim()}
TOPIC B: ${topic_b.trim()}
DIFFICULTY LEVEL: ${difficulty}

You MUST respond using EXACTLY these section headers:

### Overview
One clear paragraph each introducing ${topic_a} and ${topic_b}.

### Similarities
A bulleted list ("-") of ways ${topic_a} and ${topic_b} are similar or share common ground.

### Key Differences
A markdown comparison table with columns: Feature | ${topic_a} | ${topic_b}
Include at least 5 informative rows.

### When to Use Which
- **Choose ${topic_a} when:** (3-4 bullet points)
- **Choose ${topic_b} when:** (3-4 bullet points)

### Quick Summary
A 2-3 sentence plain-English summary a student can memorize.`;

    const rawResponse = await generateAIContent(prompt);
    const parsed = parseCompareText(rawResponse, topic_a.trim(), topic_b.trim());

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Compare error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate comparison.' });
  }
});

// Auto Difficulty Detection
app.post('/api/study/auto-difficulty', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.json({ difficulty: 'Intermediate' });
    }

    const prompt = `Classify the academic difficulty of this topic for a student:
TOPIC: ${topic.trim()}

Respond with ONLY one word: Beginner, Intermediate, or Advanced.`;

    const result = await generateAIContent(prompt);
    let detected = 'Intermediate';
    if (/beginner/i.test(result)) detected = 'Beginner';
    else if (/advanced/i.test(result)) detected = 'Advanced';
    else if (/intermediate/i.test(result)) detected = 'Intermediate';

    res.json({ difficulty: detected });
  } catch (error) {
    res.json({ difficulty: 'Intermediate' });
  }
});

// Interactive Quiz Grading
app.post('/api/study/grade-quiz', async (req, res) => {
  try {
    const { question, correct_answer, user_answer } = req.body;
    if (!user_answer || !user_answer.trim()) {
      return res.json({
        verdict: 'empty',
        feedback: "You didn't enter an answer — take a look at the reference answer to review.",
        source: 'heuristic',
      });
    }

    const prompt = `You are grading a student's answer to a quiz question. Be fair and generous: focus on whether the student understood the CONCEPT.
Tolerate paraphrasing, synonyms, and minor spelling mistakes.

QUESTION: ${question}
REFERENCE ANSWER: ${correct_answer}
STUDENT ANSWER: ${user_answer}

Respond with ONLY a single JSON object in this exact format:
{"verdict": "correct" | "partial" | "incorrect", "feedback": "1-2 encouraging sentences explaining what was right or missed"}`;

    const raw = await generateAIContent(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (['correct', 'partial', 'incorrect'].includes(parsed.verdict)) {
          return res.json({
            verdict: parsed.verdict,
            feedback: parsed.feedback || (parsed.verdict === 'correct' ? 'Great job! Concept accurately captured.' : 'Review the reference answer below.'),
            source: 'ai',
          });
        }
      } catch (e) {
        // Fallback to heuristic
      }
    }

    // Heuristic fallback
    const userWords = new Set(user_answer.toLowerCase().match(/[a-z0-9]+/g) || []);
    const correctWords = new Set(correct_answer.toLowerCase().match(/[a-z0-9]+/g) || []);
    let overlap = 0;
    for (const w of userWords) {
      if (correctWords.has(w)) overlap++;
    }
    const ratio = correctWords.size > 0 ? overlap / correctWords.size : 0;
    const verdict = ratio >= 0.4 ? 'correct' : ratio >= 0.2 ? 'partial' : 'incorrect';

    res.json({
      verdict,
      feedback: verdict === 'correct' ? 'Correct! Nice work.' : verdict === 'partial' ? 'You are on the right track, but missed some key details.' : 'Not quite — review the reference answer below.',
      source: 'heuristic',
    });
  } catch (error: any) {
    res.json({
      verdict: 'incorrect',
      feedback: 'Could not auto-grade. Check the reference answer to self-evaluate.',
      source: 'heuristic',
    });
  }
});

// Follow-up Question Answer
app.post('/api/study/followup', async (req, res) => {
  try {
    const { topic, context, question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Please enter a follow-up question.' });
    }

    const prompt = `You are an AI tutor who just explained "${topic}".
Context from current explanation:
${(context || '').slice(0, 1500)}

Student Question: ${question.trim()}

Answer concisely and encouragingly in 2-4 sentences. Use LaTeX math $...$ if needed.`;

    const answer = await generateAIContent(prompt);
    res.json({ success: true, answer: answer.trim() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to answer follow-up.' });
  }
});

// Polish User Notes
app.post('/api/study/polish-notes', async (req, res) => {
  try {
    const { topic, notes } = req.body;
    if (!notes || !notes.trim()) {
      return res.status(400).json({ error: 'No notes provided to polish.' });
    }

    const prompt = `A student wrote rough personal notes on "${topic}":
"""
${notes.trim()}
"""

Polish these notes into clean, concise, high-yield bullet points ("-"). Keep the student's own ideas and fix grammar/structure. No intro or outro text, only the bullet points.`;

    const polished = await generateAIContent(prompt);
    res.json({ success: true, polished: polished.trim() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to polish notes.' });
  }
});

// Spaced Repetition Schedule Suggestions
app.post('/api/study/schedule', async (req, res) => {
  try {
    const { history } = req.body;
    if (!Array.isArray(history) || history.length === 0) {
      return res.json({ suggestions: [] });
    }

    const historyList = history.slice(0, 8).map((item, idx) => `${idx + 1}. ${item.topic} (${item.difficulty || 'Intermediate'} / ${item.study_mode || 'Learn'})`).join('\n');

    const prompt = `A student recently studied these topics:
${historyList}

Suggest 2-3 topics from this list they should review today based on spaced repetition principles.
Respond with ONLY a JSON array on one line in this format:
[{"topic": "...", "reason": "1 short sentence explaining why to review today"}]`;

    const raw = await generateAIContent(prompt);
    const arrayMatch = raw.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const parsed = JSON.parse(arrayMatch[0]);
        return res.json({ suggestions: parsed });
      } catch (e) {}
    }

    // Default fallback suggestion from history
    const fallback = history.slice(0, 2).map(h => ({
      topic: h.topic,
      reason: 'Revisiting earlier concepts reinforces long-term memory encoding.',
    }));
    res.json({ suggestions: fallback });
  } catch (error) {
    res.json({ suggestions: [] });
  }
});

// ---------------------------------------------------------------------------
// Vite Integration & Production Serving
// ---------------------------------------------------------------------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Express v5 wildcard route
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Study Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

start();
