import { NextResponse } from "next/server";
import { normalizeYouTubeUrl } from "@/src/lib/transcription";
import { MockTranscriptionProvider } from "@/src/server/transcription/mockProvider";
import { requestTranscription } from "@/src/server/transcription/service";
import { InMemorySongCache } from "@/src/server/transcription/songCache";

const cache = new InMemorySongCache();
const provider = new MockTranscriptionProvider();

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

  const result = await requestTranscription(normalizedUrl, cache, provider);
  return NextResponse.json(
    {
      status: result.status,
      sourceUrl: normalizedUrl,
      song: result.transcription,
    },
    { status: 200 },
  );
}
