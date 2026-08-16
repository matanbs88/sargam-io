import { createSargamPdf, type SargamPdfExportInput } from "@/src/server/export/sargamPdf";

export const runtime = "nodejs";

function isMidiNoteEvent(value: unknown): value is SargamPdfExportInput["events"][number] {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.midi === "number" &&
    typeof event.startMs === "number" &&
    typeof event.durationMs === "number" &&
    (event.velocity === undefined || typeof event.velocity === "number")
  );
}

function isExportInput(value: unknown): value is SargamPdfExportInput {
  if (typeof value !== "object" || value === null) return false;
  const input = value as Record<string, unknown>;
  return (
    Array.isArray(input.events) &&
    input.events.every(isMidiNoteEvent) &&
    typeof input.rootLabel === "string" &&
    typeof input.rootMidi === "number" &&
    typeof input.taalLabel === "string" &&
    typeof input.tempoBpm === "number" &&
    typeof input.timeSignature === "string" &&
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
