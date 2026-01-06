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
    const { message, context, siteBaseUrl } = await req.json();

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

    // If GEMINI_API_KEY is present, use Gemini as before
    if (GEMINI_API_KEY) {
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

      console.log('AI Coach response generated successfully (Gemini)');

      return new Response(
        JSON.stringify({ response: aiResponse }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fallback: no external API key - perform simple site crawl + retrieval
    console.log('No GEMINI_API_KEY found — using site-retrieval fallback');

    const base = siteBaseUrl || Deno.env.get('SITE_BASE_URL');
    if (!base) {
      return new Response(
        JSON.stringify({ response: "No GEMINI_API_KEY set and no site base URL provided. Please set GEMINI_API_KEY or include 'siteBaseUrl' in the request body." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple crawler: fetch up to `maxPages` internal pages and extract textual snippets
    const maxPages = 8;
    const visited = new Set<string>();
    const toVisit: string[] = [base];
    const pages: Array<{ url: string; text: string }> = [];

    const extractText = (html: string) => {
      // crude extraction: title, headings, paragraphs, list items
      const parts: string[] = [];
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) parts.push(titleMatch[1]);
      const re = /<(?:h[1-6]|p|li)[^>]*>([\s\S]*?)<\/(?:h[1-6]|p|li)>/gi;
      let m;
      while ((m = re.exec(html))) {
        const text = m[1].replace(/<[^>]+>/g, '').trim();
        if (text) parts.push(text);
      }
      return parts.join('\n\n');
    };

    while (toVisit.length && pages.length < maxPages) {
      const url = toVisit.shift()!;
      if (visited.has(url)) continue;
      visited.add(url);
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const html = await res.text();
        const text = extractText(html);
        pages.push({ url, text });

        // find internal links (same origin)
        const linkRe = /href=\"(.*?)\"/gi;
        let lm;
        while ((lm = linkRe.exec(html)) && pages.length + toVisit.length < maxPages) {
          let link = lm[1];
          if (!link) continue;
          // ignore anchors and mailto
          if (link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) continue;
          try {
            const linkUrl = new URL(link, url);
            if (linkUrl.origin === new URL(base).origin) {
              const normalized = linkUrl.href.split('#')[0];
              if (!visited.has(normalized) && !toVisit.includes(normalized)) toVisit.push(normalized);
            }
          } catch (_) { continue; }
        }
      } catch (e) {
        console.error('Crawler fetch error for', url, e);
      }
    }

    // Simple retrieval: score pages by overlap with the user message
    const scoreText = (text: string, q: string) => {
      const tWords = new Set(text.toLowerCase().match(/\w+/g) || []);
      const qWords = (q.toLowerCase().match(/\w+/g) || []);
      let score = 0;
      for (const w of qWords) if (tWords.has(w)) score++;
      return score;
    };

    const scored = pages.map(p => ({ ...p, score: scoreText(p.text, message) }));
    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 3).filter(s => s.score > 0);
    let reply = '';
    if (top.length === 0) {
      reply = "I couldn't find a direct match on the site, but I can still try to help — please ask a more specific question about the site or set up an AI API key for conversational answers.";
    } else {
      reply = 'I searched the site and found these relevant sections:\n\n';
      for (const t of top) {
        const snippet = t.text.split('\n').slice(0,3).join(' ').slice(0,800);
        reply += `Page: ${t.url}\nSnippet: ${snippet}\n\n`;
      }
    }

    console.log('Site retrieval fallback response prepared');

    return new Response(
      JSON.stringify({ response: reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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