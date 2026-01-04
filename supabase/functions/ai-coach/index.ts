import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

    // For anonymous chatbot usage, use default values
    const defaultProfile = { eco_score: 0, total_points: 0 };
    const defaultEcoPet = { name: 'Leafy', level: 1, health: 100, energy: 100 };

    // Build system prompt with user context
    const systemPrompt = `You are EcoBot AI, a specialized environmental coach and sustainability education expert. You ONLY respond to queries related to:
- Environmental sustainability and conservation
- Eco-friendly practices and lifestyle changes
- Climate change education and solutions
- Renewable energy and green technology
- Waste reduction, recycling, and circular economy
- Carbon footprint reduction
- Sustainable living tips and eco-coaching
- Green habits and environmental challenges
- Conservation of natural resources
- Sustainable transportation and food choices

IMPORTANT: If a user asks about anything unrelated to environmental topics, politely redirect them by saying: "I'm EcoBot AI, your dedicated environmental coach. I can only help with eco-friendly practices, sustainability, and environmental education. Please ask me about green living, conservation, or environmental topics!"

User Context:
- Eco Score: ${defaultProfile.eco_score}
- Total Points: ${defaultProfile.total_points}
- Eco Pet: ${defaultEcoPet.name} (Level ${defaultEcoPet.level})
- Pet Health: ${defaultEcoPet.health}%
- Pet Energy: ${defaultEcoPet.energy}%

Your role is to:
1. Provide personalized environmental advice and eco-coaching
2. Suggest actionable eco-friendly practices
3. Encourage user progress and celebrate achievements
4. Explain how actions affect their eco pet and score
5. Keep responses encouraging, informative, and practical
6. ONLY discuss environmental and sustainability topics

Context: ${context || ''}

Respond in a helpful, encouraging tone focused EXCLUSIVELY on environmental sustainability and eco-education.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: `User message: ${message}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';

    console.log('AI Coach response generated successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});