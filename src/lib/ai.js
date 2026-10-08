import OpenAI from "openai";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let openai;

async function generateJSON(prompt) {
  openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });
  return JSON.parse(completion.choices[0].message.content);
}

export async function generateQuestions(testDetails) {
  const prompt = `Generate ${testDetails.numQuestions} multiple-choice questions for a ${testDetails.difficulty} level test on ${testDetails.tags}. 
  The test title is "${testDetails.title}" and the description is "${testDetails.description}". 
  For each question, provide the following details:
  - 'text': The question text as a string.
  - 'options': An array of 4 distinct answer options (as strings).
  - 'correctAnswer': The correct answer as a string, matching one of the options.

  Respond with a JSON object of the form { "questions": [...] }, where each item contains 'text', 'options', and 'correctAnswer'.`;

  try {
    const { questions } = await generateJSON(prompt);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid question format");
    }

    return questions;
  } catch (error) {
    console.error("Failed to generate questions with OpenAI:", error);
    throw new Error("Failed to generate questions");
  }
}

export async function verifyTestWithAI(test, userAnswers) {
  const prompt = `
    Analyze the following test results:
    Test: ${JSON.stringify(test)}
    User Answers: ${JSON.stringify(userAnswers)}

    Please provide:
    1. The score (percentage of correct answers)
    2. Number of correct answers
    3. Number of wrong answers
    4. A brief analysis of the user's performance, including topics they need to improve
    5. For each question, provide:
       - Whether the user's answer was correct or not
       - A brief explanation of why it was correct or incorrect

    Format the response as a JSON object with the following structure:
    {
      "score": number,
      "correctAnswers": number,
      "wrongAnswers": number,
      "analysis": string,
      "questionResults": [
        {
          "isCorrect": boolean,
          "explanation": string
        },
        ...
      ]
    }
  `;

  try {
    return await generateJSON(prompt);
  } catch (error) {
    console.error("Failed to verify test with OpenAI:", error);
    throw new Error("Failed to verify test results");
  }
}
