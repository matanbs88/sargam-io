import { importPdfWithLocalAudiveris } from "@/src/server/score-import/localAudiveris";
import { validateImportedScore } from "@/src/server/score-import/scoreValidation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_PDF_BYTES = 12 * 1024 * 1024;

function isPdfFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof File !== "undefined" &&
    value instanceof File &&
    (value.type === "application/pdf" || value.name.toLowerCase().endsWith(".pdf"))
  );
}

export async function POST(request: Request) {
  if (process.env.SARGAM_LOCAL_OMR_ENABLED !== "true") {
    return Response.json(
      {
        error:
          "PDF score import is currently enabled only in the local pilot. MusicXML/MXL is the production-ready import format.",
      },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Upload a score PDF as multipart form data." }, { status: 400 });
  }

  const score = formData.get("score");
  if (!isPdfFile(score)) {
    return Response.json({ error: "The score field must contain a PDF file." }, { status: 400 });
  }
  if (score.size === 0 || score.size > MAX_PDF_BYTES) {
    return Response.json({ error: "PDF files must be between 1 byte and 12 MB." }, { status: 413 });
  }

  try {
    const imported = await importPdfWithLocalAudiveris(
      new Uint8Array(await score.arrayBuffer()),
    );
    return Response.json({
      importMode: "local-audiveris-pilot",
      score: imported,
      validation: validateImportedScore(imported),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to import this score PDF.";
    return Response.json({ error: message }, { status: 422 });
  }
}
