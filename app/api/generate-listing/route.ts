import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productType, name, style, features, notes, apiKey } = body;

    if (!apiKey) return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    if (!name)   return NextResponse.json({ error: 'Product name is required' }, { status: 400 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const baseReqs = `
Requirements:
1. TITLE: Max 140 characters. Start with highest-traffic keywords. Include the main product keyword early.
2. DESCRIPTION: 500–700 words. Structure: hook sentence → what it is → use cases → what's included → technical details → license → call to action. Use short paragraphs. Mention "instant download".
3. TAGS: Exactly 13 tags. Each tag max 20 characters. Mix: 3–4 broad category tags, 5–6 niche/style tags, 2–3 use-case tags. No hashtag symbols.

Return ONLY valid JSON (no markdown, no code block):
{"title":"...","description":"...","tags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"]}`;

    let typeContext = '';
    switch (productType) {
      case 'font':
        typeContext = `You are an expert Etsy SEO copywriter specialising in digital font products.
Product: Font / Typeface
Name: ${name}
Style: ${style || 'decorative display font'}
Features: ${features || 'OTF, TTF, web fonts, commercial license'}
Extra notes: ${notes || ''}`;
        break;

      case 'cv':
        typeContext = `You are an expert Etsy SEO copywriter specialising in CV/resume template products.
Product: Resume / CV Template
Name: ${name}
Design style: ${style || 'modern, professional, minimal'}
What's included: ${features || 'ATS-friendly, MS Word & Google Docs format, editable, instant download'}
Extra notes: ${notes || ''}`;
        break;

      case 'planner':
        typeContext = `You are an expert Etsy SEO copywriter specialising in digital planner products.
Product: Digital Planner
Name: ${name}
Style: ${style || 'modern, aesthetic, colorful'}
Features: ${features || 'GoodNotes, Notability, iPad compatible, daily/weekly/monthly pages, hyperlinked'}
Extra notes: ${notes || ''}`;
        break;

      case 'silhouette':
        typeContext = `You are an expert Etsy SEO copywriter specialising in SVG cut file bundles.
Product: SVG Cut File Bundle
Name: ${name}
Theme/style: ${style || 'nature, floral, animals'}
What's included: ${features || 'SVG DXF PNG EPS PDF formats, commercial license, Cricut & Silhouette Cameo compatible'}
Extra notes: ${notes || ''}`;
        break;

      default: // custom
        typeContext = `You are an expert Etsy SEO copywriter for digital products.
Product type: Custom Digital Product
Name: ${name}
Style/keywords: ${style || ''}
What's included / features: ${features || ''}
Extra notes: ${notes || ''}`;
    }

    const prompt = `${typeContext}
${baseReqs}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]);

    // Enforce limits
    if (parsed.title?.length > 140) parsed.title = parsed.title.substring(0, 140);
    if (Array.isArray(parsed.tags)) {
      parsed.tags = parsed.tags.slice(0, 13).map((t: string) => t.substring(0, 20).toLowerCase());
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('Listing generation error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
