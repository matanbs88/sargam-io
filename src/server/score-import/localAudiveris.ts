import "server-only";

import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { parseMusicXmlScore, type ImportedScore } from "./musicXml";

const execFileAsync = promisify(execFile);
const MAX_WAIT_MS = 120_000;
const POLL_INTERVAL_MS = 750;

function isEnabled(): boolean {
  return process.env.SARGAM_LOCAL_OMR_ENABLED === "true";
}

function getBinary(): string {
  const binary = process.env.AUDIVERIS_BIN;
  if (binary === undefined || binary.trim().length === 0) {
    throw new Error("AUDIVERIS_BIN must point to the local Audiveris executable.");
  }
  return binary;
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForMxl(directory: string): Promise<Uint8Array> {
  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    const filename = (await readdir(directory)).find((entry) => entry.endsWith(".mxl"));
    if (filename !== undefined) return new Uint8Array(await readFile(join(directory, filename)));
    await pause(POLL_INTERVAL_MS);
  }
  throw new Error("Audiveris did not produce MusicXML within two minutes.");
}

/**
 * Development-only adapter. It intentionally runs only when an explicit local
 * flag is enabled and a local executable is configured. Do not deploy this
 * adapter on Vercel or expose it as a public production route.
 */
export async function importPdfWithLocalAudiveris(pdf: Uint8Array): Promise<ImportedScore> {
  if (!isEnabled()) {
    throw new Error("Local PDF import is disabled. Set SARGAM_LOCAL_OMR_ENABLED=true to use it.");
  }
  if (pdf.byteLength === 0) throw new Error("The uploaded PDF is empty.");

  const directory = await mkdtemp(join(tmpdir(), "sargam-omr-"));
  const inputPath = join(directory, "score.pdf");

  try {
    await writeFile(inputPath, pdf);
    await execFileAsync(getBinary(), [
      "-batch",
      "-transcribe",
      "-export",
      "-output",
      directory,
      "--",
      inputPath,
    ]);
    return parseMusicXmlScore(await waitForMxl(directory));
  } finally {
    await rm(directory, { force: true, recursive: true });
  }
}
