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
1. TITLE: Max 140 characters. Start with most important keywords (e.g. "Font Name Font | Retro Style | Commercial License | Digital Download").
2. DESCRIPTION: 500-700 words. Compelling hook, what it looks like, use cases (logos, branding, social media, t-shirts, mugs, cards), what's included (OTF, TTF, web fonts), license info.
3. TAGS: Exactly 13 tags, each max 20 characters. Mix broad and niche terms.

Return ONLY valid JSON:
{"title":"...","description":"...","tags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"]}`;

    } else if (productType === "planner") {
      prompt = `You are an expert Etsy SEO specialist for digital planner products.
Generate optimized Etsy listing content for this digital planner:
- Product Name: ${name}
- Features: ${features || description || "digital planner with templates"}
- Style: ${style || "colorful, modern"}

Requirements:
1. TITLE: Max 140 characters. Must include 'Digital Planner', key features. Start with most important keywords.
2. DESCRIPTION: 500-700 words. Hook, what's included (pages, templates, covers, stickers), compatibility (GoodNotes, Notability, iPad), instant download.
3. TAGS: Exactly 13 Etsy tags, max 20 chars. Think: digital planner, productivity, iPad planner, GoodNotes, undated planner, daily planner.

Return ONLY valid JSON:
{"title":"...","description":"...","tags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"]}`;

    } else if (productType === "cv") {
      prompt = `You are an expert Etsy SEO specialist for resume/CV template products.
Generate optimized Etsy listing content for this CV/resume template:
- Product Name: ${name}
- Style/Design: ${style || "modern, professional, minimal"}
- Features: ${features || description || "ATS-friendly, editable resume template"}

Requirements:
1. TITLE: Max 140 characters. Include 'Resume Template', format (Word/Google Docs), style descriptor. Keyword-first.
2. DESCRIPTION: 500-700 words. What it is, who it's for, what's included, ATS-friendly note, instant download.
3. TAGS: Exactly 13 Etsy tags, max 20 chars. Think: resume template, CV template, modern resume, ATS resume, word resume.

Return ONLY valid JSON:
{"title":"...","description":"...","tags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"]}`;

    } else if (productType === "silhouette") {
      prompt = `You are an expert Etsy SEO specialist for SVG cut file and silhouette products.

Generate optimized Etsy listing content for this SVG bundle:
- Bundle Name: ${name}
- Theme/Style: ${style || "nature, animals, floral"}
- Features: ${features || description || "SVG DXF PNG EPS PDF cut files, commercial license"}

Requirements:
1. TITLE: Max 140 characters. Must include "SVG", "Cut File", bundle count if known, theme keywords. Start with most searched terms.
2. DESCRIPTION: 500-700 words. Opening hook ("Perfect for Cricut and Silhouette users!"), what's included (design count, formats: SVG DXF PNG EPS PDF), how to use, compatible software (Cricut Design Space, Silhouette Studio, Inkscape, Illustrator), use cases (t-shirts, cards, mugs, decals, wall art), license info (personal + commercial), instant download. Use paragraph breaks for readability.
3. TAGS: Exactly 13 Etsy tags, max 20 chars each. Think: SVG cut file, cricut svg, silhouette svg, clipart, digital download, commercial use, dxf file, png clipart, vector file, plus theme-specific tags like butterfly svg, floral svg, etc.

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
