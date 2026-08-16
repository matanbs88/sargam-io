import { parseMusicXmlScore } from "@/src/server/score-import/musicXml";
import { validateImportedScore } from "@/src/server/score-import/scoreValidation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_SCORE_BYTES = 6 * 1024 * 1024;

function isScoreFile(value: FormDataEntryValue | null): value is File {
  if (typeof File === "undefined" || !(value instanceof File)) return false;
  const filename = value.name.toLowerCase();
  return (
    value.type === "application/vnd.recordare.musicxml+xml" ||
    value.type === "application/xml" ||
    value.type === "text/xml" ||
    filename.endsWith(".musicxml") ||
    filename.endsWith(".xml") ||
    filename.endsWith(".mxl")
  );
}

/** Production-safe, stateless intake for notation files. */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Upload MusicXML or MXL as multipart form data." }, { status: 400 });
  }

  const score = formData.get("score");
  if (!isScoreFile(score)) {
    return Response.json({ error: "The score field must contain a MusicXML, XML, or MXL file." }, { status: 400 });
  }
  if (score.size === 0 || score.size > MAX_SCORE_BYTES) {
    return Response.json({ error: "Score files must be between 1 byte and 6 MB." }, { status: 413 });
  }

  try {
    const importedScore = parseMusicXmlScore(new Uint8Array(await score.arrayBuffer()));
    return Response.json({ score: importedScore, validation: validateImportedScore(importedScore) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read this score file.";
    return Response.json({ error: message }, { status: 422 });
  }
}
