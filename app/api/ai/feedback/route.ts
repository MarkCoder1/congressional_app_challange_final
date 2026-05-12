import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

interface AnswerAnalysis {
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category: string;
}

interface FeedbackRequest {
  mode: "practice" | "master";
  subject: string;
  score: number;
  answers: AnswerAnalysis[];
  weakAreas: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { mode, subject, score, answers, weakAreas } = body;

    const incorrectAnswers = answers.filter(a => !a.isCorrect);
    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalQuestions = answers.length;
    
    // Analyze patterns in incorrect answers
    const categoryPatterns = incorrectAnswers.reduce((acc, answer) => {
      acc[answer.category] = (acc[answer.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get specific incorrect question examples
    const incorrectExamples = incorrectAnswers.slice(0, 2).map(a => ({
      concept: a.questionText.split('?')[0].substring(0, 60),
      userChoice: a.userAnswer,
      correctChoice: a.correctAnswer
    }));

    const modeGuidance = mode === "master" 
      ? "Master mode requires 80% to pass. Focus on specific gaps preventing passing score."
      : "Practice mode focuses on building skills. Identify specific improvement areas.";

    const prompt = `Analyze this student's performance on a ${mode} test. Return ONLY a JSON object with 3 detailed, actionable insights.

${modeGuidance}

Performance:
- Subject: ${subject}
- Score: ${score}%
- Correct: ${correctCount}/${totalQuestions}
- Main struggles: ${weakAreas.slice(0, 3).join(', ')}

Incorrect by category:
${Object.entries(categoryPatterns).map(([cat, count]) => `- ${cat}: ${count}`).join('\n')}

Example mistakes:
${incorrectExamples.map(ex => `- ${ex.concept}: chose "${ex.userChoice}", correct is "${ex.correctChoice}"`).join('\n')}

Return EXACTLY this JSON:
{
  "insights": [
    "detailed actionable insight 1 (15-20 words, specific about what they need to study)",
    "detailed actionable insight 2 (15-20 words, including specific concepts to review)",
    "detailed actionable insight 3 (15-20 words, with concrete next steps)"
  ]
}

Guidelines for each insight:
- Be specific about concepts, formulas, or problem types
- Include WHY they're struggling if pattern detected
- Suggest specific study actions (not generic "practice more")
- Under 20 words but substantive
- No emojis or conversational openings
- For math: mention specific formulas (e.g., Pythagorean theorem a²+b²=c²)
- Address their specific weak areas from the data

Example of good insights:
"Review applying a²+b²=c² - you confused legs with hypotenuse in 3 problems"
"Practice finding the missing leg when hypotenuse is given - use c²-a²=b²"
"Study 3-4-5, 5-12-13, and 8-15-17 right triangle patterns for faster recognition"`;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        insights: getDetailedFallbackInsights(mode, score, subject, weakAreas, categoryPatterns, incorrectExamples)
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        insights: getDetailedFallbackInsights(mode, score, subject, weakAreas, categoryPatterns, incorrectExamples)
      });
    }

    const parsed = JSON.parse(content);
    const insights = parsed.insights || getDetailedFallbackInsights(mode, score, subject, weakAreas, categoryPatterns, incorrectExamples);
    
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Feedback generation failed:", error);
    return NextResponse.json({
      insights: getDetailedFallbackInsights("practice", 50, "this subject", [], {}, [])
    });
  }
}

// Detailed fallback insights (no AI, logic-based with specifics)
function getDetailedFallbackInsights(
  mode: string, 
  score: number, 
  subject: string, 
  weakAreas: string[], 
  categoryPatterns: Record<string, number>,
  incorrectExamples: any[]
): string[] {
  const insights = [];
  const isMath = subject.toLowerCase().includes("math") || subject.toLowerCase().includes("pythagorean");
  const isMaster = mode === "master";
  const isPassing = score >= 80;
  
  // Insight 1: Address the main struggle
  if (score < 60) {
    if (isMath) {
      insights.push(`Master the Pythagorean theorem formula a²+b²=c² - you're mixing up which sides are legs vs hypotenuse`);
    } else {
      insights.push(`Review ${subject} fundamental concepts - you missed ${Object.values(categoryPatterns).reduce((a,b)=>a+b,0)} questions on basic topics`);
    }
  } else if (score < 80) {
    if (isMath) {
      if (categoryPatterns["hypotenuse calculation"] > categoryPatterns["leg calculation"]) {
        insights.push(`Focus on finding the hypotenuse when given two legs (a²+b²=c²) - your main challenge area`);
      } else {
        insights.push(`Practice finding missing legs using c²-a²=b² - a common struggle at this level`);
      }
    } else {
      insights.push(`Target your weaker areas: ${weakAreas.slice(0, 2).join(' and ').substring(0, 60)}`);
    }
  } else {
    if (isMaster && isPassing) {
      insights.push(`Excellent mastery of ${subject}! Ready for advanced applications and real-world problems`);
    } else if (isMath && isPassing) {
      insights.push(`Strong grasp of right triangle relationships - challenge yourself with non-standard problems`);
    } else {
      insights.push(`You've mastered the basics - now focus on speed and accuracy with varied problems`);
    }
  }
  
  // Insight 2: Specific concept to review
  if (weakAreas.length > 0) {
    const topWeakness = weakAreas[0];
    if (isMath && topWeakness.toLowerCase().includes("hypotenuse")) {
      insights.push(`Hypotenuse is always opposite the right angle (longest side) - double-check which value goes where`);
    } else if (isMath && topWeakness.toLowerCase().includes("leg")) {
      insights.push(`When finding a leg, rearrange formula to b² = c² - a² before taking square root`);
    } else {
      insights.push(`Review: ${topWeakness.substring(0, 65)}${topWeakness.length > 65 ? '...' : ''}`);
    }
  } else if (incorrectExamples.length > 0) {
    insights.push(`Pay attention to ${incorrectExamples[0].concept} - you selected "${incorrectExamples[0].userChoice}" but correct was "${incorrectExamples[0].correctChoice}"`);
  } else if (!isPassing && isMaster) {
    insights.push(`Master test requires 80% to pass - focus on the specific problem types you missed`);
  } else {
    insights.push(`Review all explanations for questions you answered incorrectly or guessed on`);
  }
  
  // Insight 3: Next steps
  if (!isPassing && isMaster) {
    insights.push(`Review incorrect answers, study those concepts, then retake master test to demonstrate mastery`);
  } else if (score < 70) {
    if (isMath) {
      insights.push(`Work through 5-10 right triangle problems focusing on correct formula application before retrying`);
    } else {
      insights.push(`Complete practice problems specifically targeting your weak areas before the next attempt`);
    }
  } else if (score < 80) {
    insights.push(`Practice similar problems that combine multiple concepts before moving to harder material`);
  } else if (mode === "practice") {
    insights.push(`Ready for Master Mode - it will test deeper understanding with more challenging problems`);
  } else {
    insights.push(`Consider helping peers or applying these concepts to real-world scenarios to solidify mastery`);
  }
  
  return insights;
}