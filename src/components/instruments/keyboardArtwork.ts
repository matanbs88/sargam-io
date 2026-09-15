/** Original, resolution-independent cabinet illustration. No timing or key geometry. */
export function drawKeyboardCabinet(ctx: CanvasRenderingContext2D, harmonium: boolean, width: number, top: number) {
  ctx.save();
  ctx.translate(0, top);
  ctx.fillStyle = harmonium ? "#503b30" : "#161e25";
  ctx.fillRect(0, 0, width, 76);
  ctx.fillStyle = harmonium ? "#966b49" : "#34414b";
  ctx.fillRect(0, 0, width, 5);
  ctx.fillStyle = harmonium ? "#bc9162" : "#56636c";
  ctx.fillRect(0, 0, width, 1);
  if (harmonium) {
    // Walnut front, inset bellows and restrained brass hardware.
    ctx.fillStyle = "#75523b"; ctx.fillRect(10, 9, width - 20, 58);
    ctx.strokeStyle = "#b0845c"; ctx.lineWidth = 1; ctx.strokeRect(15, 13, width - 30, 49);
    ctx.fillStyle = "#392f2d"; ctx.fillRect(200, 18, width - 400, 40);
    for (let x = 208; x < width - 205; x += 13) {
      ctx.fillStyle = "#805044"; ctx.beginPath(); ctx.moveTo(x, 18); ctx.lineTo(x + 7, 22); ctx.lineTo(x + 7, 54); ctx.lineTo(x, 58); ctx.fill();
      ctx.strokeStyle = "#aa7560"; ctx.beginPath(); ctx.moveTo(x, 19); ctx.lineTo(x, 57); ctx.stroke();
    }
    for (const x of [48, 93, 138, width - 138, width - 93, width - 48]) {
      ctx.fillStyle = "#392d27"; ctx.beginPath(); ctx.ellipse(x, 39, 11, 12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#d9c29a"; ctx.beginPath(); ctx.arc(x, 36, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#957854"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#f0dfbb"; ctx.beginPath(); ctx.arc(x - 2, 34, 2, 0, Math.PI * 2); ctx.fill();
    }
    for (const x of [24, width - 30]) {
      ctx.fillStyle = "#b69562"; ctx.fillRect(x, 22, 6, 27);
      ctx.fillStyle = "#513e2d"; ctx.fillRect(x + 2, 25, 2, 3); ctx.fillRect(x + 2, 43, 2, 3);
    }
  } else {
    ctx.strokeStyle = "#43505b"; ctx.lineWidth = .8;
    ctx.beginPath(); ctx.moveTo(20, 14); ctx.lineTo(width - 20, 14); ctx.stroke();
    ctx.fillStyle = "#a6a99f"; ctx.font = "12px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("S A R G A M", width / 2, 43);
    ctx.fillStyle = "#75828b";
    for (const x of [24, width - 28]) { ctx.fillRect(x, 28, 4, 17); }
    ctx.fillStyle = "#0c131a"; ctx.fillRect(12, 59, width - 24, 9);
  }
  ctx.fillStyle = "#080f15"; ctx.fillRect(0, 70, width, 6);
  ctx.restore();
}
