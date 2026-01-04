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
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { category = 'general', count = 3 } = await req.json();

    // Get user profile for personalized tips
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const systemPrompt = `Generate ${count} personalized environmental tips for a user with the following profile:
- Eco Score: ${profile?.eco_score || 0}
- Experience Level: ${profile?.eco_score > 500 ? 'Advanced' : profile?.eco_score > 200 ? 'Intermediate' : 'Beginner'}
- Category Focus: ${category}

Requirements:
- Each tip should be actionable and specific
- Include potential environmental impact
- Suggest point values (5-50 points based on difficulty)
- Keep tips practical and achievable
- Format as JSON array with structure: [{"title": "...", "description": "...", "points": number, "difficulty": "easy|medium|hard"}]

Category: ${category}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.8,
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
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || '[]';

    // Try to parse JSON response, fallback to structured format if parsing fails
    let tips;
    try {
      tips = JSON.parse(aiResponse);
    } catch (e) {
      console.warn('Failed to parse JSON response, creating fallback tips');
      tips = [
        {
          title: "Reduce Single-Use Plastics",
          description: "Use reusable bags, bottles, and containers to minimize plastic waste",
          points: 25,
          difficulty: "easy"
        },
        {
          title: "Energy-Efficient Lighting",
          description: "Switch to LED bulbs to reduce energy consumption by up to 80%",
          points: 30,
          difficulty: "easy"
        },
        {
          title: "Compost Organic Waste",
          description: "Start a compost bin to reduce food waste and create nutrient-rich soil",
          points: 40,
          difficulty: "medium"
        }
      ];
    }

    console.log(`Generated ${tips.length} eco tips for user:`, user.id);

    return new Response(
      JSON.stringify({ tips }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-eco-tips function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});