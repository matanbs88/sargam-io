import { NextResponse } from "next/server";
import { normalizeYouTubeUrl } from "@/src/lib/transcription";
import { transcribeWithMock } from "@/src/server/transcription/mockProvider";

export async function POST(request: Request) {
  let body: { sourceUrl?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.sourceUrl !== "string") {
    return NextResponse.json({ error: "A YouTube sourceUrl is required." }, { status: 400 });
  }

  const normalizedUrl = normalizeYouTubeUrl(body.sourceUrl);
  if (!normalizedUrl) {
    return NextResponse.json(
      { error: "Please enter a valid https YouTube link." },
      { status: 400 },
    );
  }

  const result = await transcribeWithMock(normalizedUrl);
  return NextResponse.json(result, { status: 200 });
}
