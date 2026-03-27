import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productType, name, description, style, features, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";

    if (productType === "font") {
      prompt = `You are an expert Etsy SEO specialist for digital font products. 
      
Generate optimized Etsy listing content for this font:
- Font Name: ${name}
- Style Description: ${style || "decorative display font"}
- Additional Info: ${description || ""}

Requirements:
1. TITLE: Max 140 characters. Start with the most important keywords first (e.g. "Font Name Font | Retro Style | Commercial License | Digital Download"). Include key search terms buyers use.
2. DESCRIPTION: 500-700 words. Start with a compelling hook. Include: what it is, what it looks like, use cases (logos, branding, social media, t-shirts, mugs, cards), what's included (OTF, TTF, web fonts), license info, how to download/use. Use paragraph breaks. Include keyword-rich natural language but don't stuff keywords awkwardly.
3. TAGS: Exactly 13 tags. Each tag max 20 characters. Use specific, searchable terms buyers actually type. Mix broad and niche terms. Think: font style, use case, aesthetic, design type.

Return ONLY valid JSON in this exact format:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ..., "tag13"]
}`;
    } else if (productType === "planner") {
      prompt = `You are an expert Etsy SEO specialist for digital planner products.

Generate optimized Etsy listing content for this digital planner:
- Product Name: ${name}
- Features: ${features || description || "digital planner with templates"}
- Style: ${style || "colorful, modern"}

Requirements:
1. TITLE: Max 140 characters. Must include 'Digital Planner', year if relevant, key features. Start with most important keywords.
2. DESCRIPTION: 500-700 words. Opening hook, what's included (pages, templates, covers, stickers), compatibility (GoodNotes, Notability, iPad, Android), how to use, instant download, file format, what makes it special. Use line breaks.
3. TAGS: Exactly 13 Etsy-style tags, each max 20 chars. Think: digital planner, productivity, iPad planner, GoodNotes, undated planner, daily planner, student planner, etc.

Return ONLY valid JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ..., "tag13"]
}`;
    } else if (productType === "cv") {
      prompt = `You are an expert Etsy SEO specialist for resume/CV template products.

Generate optimized Etsy listing content for this CV/resume template:
- Product Name: ${name}
- Style/Design: ${style || "modern, professional, minimal"}
- Features: ${features || description || "ATS-friendly, editable resume template"}

Requirements:
1. TITLE: Max 140 characters. Include 'Resume Template', 'CV Template', format (Word/Canva/Google Docs), and key style descriptor. Keyword-first.
2. DESCRIPTION: 500-700 words. What it is, who it's for (job seekers, professionals, students), what's included (pages, formats, cover letter?), how to edit, ATS-friendly note, instant download, formats included. Strong opening hook.
3. TAGS: Exactly 13 Etsy tags, max 20 chars each. Think: resume template, CV template, modern resume, ATS resume, word resume, cover letter, professional resume, etc.

Return ONLY valid JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ..., "tag13"]
}`;
    } else if (productType === "silhouette") {
      prompt = `You are an expert Etsy SEO specialist for SVG cut file products.

Generate optimized Etsy listing content for this SVG bundle:
- Bundle Name: ${name}
- Category/Theme: ${style || description || "floral silhouette cut files"}

Requirements:
1. TITLE: Max 140 characters. Include 'SVG', 'Cut File', 'Bundle', the theme. Start with most important keywords.
2. DESCRIPTION: 500-700 words. What's included (SVG, PNG, DXF, EPS), compatible machines (Cricut, Silhouette), use cases (shirts, mugs, decals, scrapbooking), file quality, commercial license info, how to download. Strong hook opening.
3. TAGS: Exactly 13 Etsy tags, max 20 chars each. Think: SVG cut file, Cricut SVG, Silhouette cut, floral SVG, digital download, commercial use SVG, etc.

Return ONLY valid JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", ..., "tag13"]
}`;
    } else {
      return NextResponse.json({ error: "Invalid product type" }, { status: 400 });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("SEO generation error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
