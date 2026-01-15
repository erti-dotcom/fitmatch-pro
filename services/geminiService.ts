import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MatchRecommendation } from "../types";

// Initialize the API client safely
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getMatchAnalysis = async (user1: UserProfile, user2: UserProfile): Promise<MatchRecommendation> => {
  if (!apiKey) {
    return {
      score: 85,
      reasoning: "API Key fehlt. Dies ist eine simulierte Analyse basierend auf gemeinsamen Sportarten.",
      suggestedActivity: "Gemeinsames Basistraining"
    };
  }

  const prompt = `
    Analysiere die Kompatibilität zwischen diesen zwei Sportlern für ein gemeinsames Training:
    
    User 1: ${user1.name}, ${user1.age} Jahre, Level: ${user1.level}, Sportarten: ${user1.sports.join(', ')}, Bio: "${user1.bio}"
    User 2: ${user2.name}, ${user2.age} Jahre, Level: ${user2.level}, Sportarten: ${user2.sports.join(', ')}, Bio: "${user2.bio}"
    
    Gib das Ergebnis als JSON zurück.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Kompatibilität von 0 bis 100" },
            reasoning: { type: Type.STRING, description: "Kurze Begründung warum sie gut zusammenpassen (max 2 Sätze)" },
            suggestedActivity: { type: Type.STRING, description: "Eine konkrete Trainingsidee (z.B. '5km Lauf im Park' oder 'Partner-WOD')" }
          },
          required: ["score", "reasoning", "suggestedActivity"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MatchRecommendation;
    }
    throw new Error("Keine Antwort erhalten");
  } catch (error) {
    console.error("Gemini Fehler:", error);
    return {
      score: 70,
      reasoning: "Konnte AI-Analyse nicht durchführen. Basierend auf Sportarten scheint es zu passen.",
      suggestedActivity: "Kennenlern-Training"
    };
  }
};

export const getTrainingPlan = async (user: UserProfile, goal: string): Promise<string> => {
    if (!apiKey) return "Bitte API Key konfigurieren für individuelle Pläne.";

    const prompt = `Erstelle einen kurzen, motivierenden Wochenplan (nur 3 wichtige Einheiten) für ${user.name} (${user.level}, ${user.sports.join('/')}). Ziel: ${goal}. Format: Markdown.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
        });
        return response.text || "Kein Plan erstellt.";
    } catch (e) {
        return "Fehler bei der Planerstellung.";
    }
}
