import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSetting } from "@/lib/settings";

export async function POST(request: NextRequest) {
  const apiKey = getSetting("anthropic_api_key") || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured. Set it at /admin/settings" },
      { status: 400 }
    );
  }

  const model = getSetting("ai_model") || "claude-sonnet-4-6";
  const maxTokens = parseInt(getSetting("ai_max_tokens") || "500", 10);

  const { jobTitle, jobDescription, template, instructions } =
    await request.json();

  if (!jobTitle || !jobDescription) {
    return NextResponse.json(
      { error: "jobTitle and jobDescription are required" },
      { status: 400 }
    );
  }

  const systemPrompt = `You are a freelance proposal writer. Generate a personalized, concise Upwork proposal.
Rules:
- Keep it under 200 words
- Be specific to the job requirements
- Sound human, not robotic
- Highlight relevant experience from the template
- Do NOT use generic filler phrases
- Write in first person
- Output ONLY the proposal text, no extra commentary`;

  const userPrompt = `Job Title: ${jobTitle}

Job Description:
${jobDescription.slice(0, 2000)}

${template ? `Base template to personalize from:\n${template}` : ""}

${instructions ? `Additional instructions: ${instructions}` : ""}

Write the proposal:`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ proposal: text });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Failed to generate proposal";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
