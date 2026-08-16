import {
  createSargamPdf,
  type SargamPdfExportInput,
  type SargamPdfScore,
} from "@/src/server/export/sargamPdf";

export const runtime = "nodejs";

function isMidiNoteEvent(value: unknown): value is NonNullable<SargamPdfExportInput["events"]>[number] {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.midi === "number" &&
    typeof event.startMs === "number" &&
    typeof event.durationMs === "number" &&
    (event.velocity === undefined || typeof event.velocity === "number")
  );
}

function isNotationSystem(value: unknown): value is NonNullable<SargamPdfExportInput["notation"]> {
  return value === "ABC" || value === "Sargam_EN" || value === "Sargam_HI";
}

function isTaal(value: unknown): value is NonNullable<SargamPdfExportInput["taal"]> {
  if (typeof value !== "object" || value === null) return false;
  const taal = value as Record<string, unknown>;
  return (
    Array.isArray(taal.vibhagMatras) &&
    taal.vibhagMatras.every((matra) => typeof matra === "number") &&
    (taal.samVibhagIndex === undefined || typeof taal.samVibhagIndex === "number") &&
    (taal.khaliVibhagIndex === undefined || typeof taal.khaliVibhagIndex === "number")
  );
}

function isImportedScoreEvent(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.durationDivisions === "number" &&
    typeof event.startDivisions === "number" &&
    (event.midi === null || typeof event.midi === "number") &&
    (event.tie === "none" || event.tie === "start" || event.tie === "stop" || event.tie === "continue")
  );
}

function isImportedScore(value: unknown): value is SargamPdfScore {
  if (typeof value !== "object" || value === null) return false;
  const score = value as Record<string, unknown>;
  return (
    typeof score.divisionsPerQuarter === "number" &&
    (score.timeSignature === null || typeof score.timeSignature === "string") &&
    typeof score.title === "string" &&
    Array.isArray(score.measures) &&
    score.measures.every((measure) => {
      if (typeof measure !== "object" || measure === null) return false;
      const value = measure as Record<string, unknown>;
      return typeof value.number === "number" && Array.isArray(value.events) && value.events.every(isImportedScoreEvent);
    })
  );
}

function isExportInput(value: unknown): value is SargamPdfExportInput {
  if (typeof value !== "object" || value === null) return false;
  const input = value as Record<string, unknown>;
  return (
    (input.events === undefined || (Array.isArray(input.events) && input.events.every(isMidiNoteEvent))) &&
    (input.score === undefined || isImportedScore(input.score)) &&
    ((Array.isArray(input.events) && input.score === undefined) || (input.events === undefined && isImportedScore(input.score))) &&
    typeof input.rootLabel === "string" &&
    typeof input.rootMidi === "number" &&
    (input.taalLabel === undefined || typeof input.taalLabel === "string") &&
    (input.taal === undefined || isTaal(input.taal)) &&
    (input.notation === undefined || isNotationSystem(input.notation)) &&
    (input.tempoBpm === undefined || typeof input.tempoBpm === "number") &&
    (input.timeSignature === undefined || typeof input.timeSignature === "string") &&
    typeof input.title === "string"
  );
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isExportInput(payload)) {
    return Response.json({ error: "The Sargam PDF export payload is invalid." }, { status: 400 });
  }

  try {
    const pdf = await createSargamPdf(payload);
    const pdfBody = new Uint8Array(pdf).buffer;
    return new Response(pdfBody, {
      headers: {
        "Content-Disposition": 'attachment; filename="sargam-practice-sheet.pdf"',
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Sargam PDF.";
    return Response.json({ error: message }, { status: 422 });
  }
}
