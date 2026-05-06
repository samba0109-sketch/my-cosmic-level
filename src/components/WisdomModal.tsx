import { useMemo, useRef, useState } from "react";

/* ── Quote pool ── */
const QUOTES = [
  /* ── 명언 ── */
  {
    text: "여호와는 나의 목자시니\n내게 부족함이 없으리로다.\n그가 나를 푸른 풀밭에 누이시며\n쉴 만한 물 가로 인도하시는도다.",
    source: "— 시편 23:1-2",
    sector: "PSALM-23",
    note: "HE LEADS THE WAY.",
  },
  {
    text: "두려워하지 말라, 내가 너와 함께 함이니라.\n놀라지 말라, 나는 네 하나님이 됨이니라.\n내가 너를 굳세게 하리라,\n반드시 너를 도와주리라.",
    source: "— 이사야 41:10",
    sector: "ISAIAH-41",
    note: "DO NOT FEAR.",
  },
  {
    text: "배우고 때때로 익히면 또한 기쁘지 아니한가.\n벗이 먼 곳에서 찾아오면 또한 즐겁지 아니한가.\n남이 알아주지 않아도\n서운해하지 않으면 군자가 아니겠는가.",
    source: "— 공자, 논어 學而篇",
    sector: "ANALECTS-1",
    note: "LEARN AND GROW.",
  },
  {
    text: "하늘이 장차 큰 임무를 어떤 사람에게\n내리려 할 때에는, 반드시 먼저\n그 마음을 괴롭히고 뼈와 힘줄을 수고롭게 하며\n그 몸을 굶주리게 한다.",
    source: "— 맹자, 告子下",
    sector: "MENCIUS-6",
    note: "ENDURE AND RISE.",
  },
  {
    text: "너 자신을 알라.\n무지를 아는 것이\n진정한 앎의 시작이다.",
    source: "— 소크라테스",
    sector: "ATHENS-BC",
    note: "KNOW THYSELF.",
  },
  {
    text: "자기를 아는 자는 지혜롭고,\n자기를 이기는 자는 강하다.\n만족할 줄 아는 자는 풍요롭고,\n힘써 행하는 자에게는 뜻이 있다.",
    source: "— 노자, 道德經 33장",
    sector: "DAODEJING-33",
    note: "CONQUER YOURSELF.",
  },
  {
    text: "천 리 길도 한 걸음부터 시작된다.\n아홉 층 누대도 한 줌 흙에서 시작되고,\n천 리 여정도 발 아래 첫걸음에서\n비롯된다.",
    source: "— 노자, 道德經 64장",
    sector: "DAODEJING-64",
    note: "BEGIN THE JOURNEY.",
  },
  {
    text: "마음의 즐거움은 양약이라도\n심령의 근심은\n뼈를 마르게 하느니라.",
    source: "— 잠언 17:22",
    sector: "PROVERBS-17",
    note: "KEEP YOUR JOY.",
  },
  {
    text: "오늘을 마지막 날처럼 살고,\n내일을 위해 씨앗을 뿌려라.\n지금 이 순간은 다시 오지 않는다.",
    source: "— 마르쿠스 아우렐리우스",
    sector: "MEDITATIONS",
    note: "LIVE THE MOMENT.",
  },
  {
    text: "인자(仁者)는 산을 좋아하고\n지자(知者)는 물을 좋아한다.\n지자는 즐겁고\n인자는 오래 산다.",
    source: "— 공자, 논어 雍也篇",
    sector: "ANALECTS-6",
    note: "LOVE THE MOUNTAINS.",
  },
  /* ── FROM U:US ── */
  {
    text: "기다려라.\n때가 되면 알게 될 것이다.",
    source: "— FROM U:US",
    sector: "EARTH-00",
    note: "THE TIME WILL COME.",
  },
  {
    text: "잠시만 안녕.\n곧 다시 만나자.",
    source: "— FROM U:US",
    sector: "SOL-7",
    note: "SEE YOU AROUND.",
  },
  {
    text: "네 갈 길을 가라.\n남의 시선은\n네 별자리가 아니야.",
    source: "— FROM U:US",
    sector: "ORION-0",
    note: "WALK YOUR PATH.",
  },
  {
    text: "가까운 곳을 둘러보세요.\n멀리 가지 않아도\n여행은 이미 시작됩니다.",
    source: "— FROM U:US",
    sector: "LOCAL-1",
    note: "LOOK AROUND YOU.",
  },
  {
    text: "오늘 하루도 수고했어.\n별들이 다 봤어.",
    source: "— FROM U:US",
    sector: "NEBULA-X",
    note: "WE SAW EVERYTHING.",
  },
  {
    text: "지금 어디쯤 있어?\n우리는 항상 여기 있어.",
    source: "— FROM U:US",
    sector: "VEGA-12",
    note: "WE ARE HERE.",
  },
];

/* ── Draw 4-pointed sparkle on canvas ── */
function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  opacity: number
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#ffffff";
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const len = i % 2 === 0 ? r : r * 0.35;
    const px = Math.cos(angle) * len;
    const py = Math.sin(angle) * len;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* ── main component ── */
interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WisdomModal({ open, onClose }: Props) {
  const seed  = useMemo(() => (open ? Math.random() : 0), [open]);
  const quote = useMemo(() => QUOTES[Math.floor(seed * QUOTES.length)], [seed]);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!open) return null;

  // "04MAY2026"
  const now     = new Date();
  const day     = String(now.getDate()).padStart(2, "0");
  const month   = now.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const year    = now.getFullYear();
  const dateStr = `${day}${month}${year}`;

  /* ── Save card floating in space ── */
  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);

    try {
      const cardEl = cardRef.current;
      const cardW  = cardEl.offsetWidth;
      const cardH  = cardEl.offsetHeight;

      const SCALE  = 2;
      const PAD_X  = 72;
      const PAD_Y  = 96;
      const totalW = cardW + PAD_X * 2;
      const totalH = cardH + PAD_Y * 2;

      const canvas  = document.createElement("canvas");
      canvas.width  = totalW * SCALE;
      canvas.height = totalH * SCALE;
      const ctx     = canvas.getContext("2d")!;

      /* dark space gradient */
      const bg = ctx.createRadialGradient(
        totalW * SCALE * 0.5, totalH * SCALE * 0.38, 0,
        totalW * SCALE * 0.5, totalH * SCALE * 0.5,  totalW * SCALE * 1.1
      );
      bg.addColorStop(0,   "#0e0e22");
      bg.addColorStop(0.5, "#06060f");
      bg.addColorStop(1,   "#020208");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      /* nebula tints */
      const neb1 = ctx.createRadialGradient(
        canvas.width * 0.82, canvas.height * 0.12, 0,
        canvas.width * 0.75, canvas.height * 0.18, canvas.width * 0.65
      );
      neb1.addColorStop(0,   "rgba(90,55,150,0.18)");
      neb1.addColorStop(0.6, "rgba(40,20,80,0.07)");
      neb1.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const neb2 = ctx.createRadialGradient(
        canvas.width * 0.08, canvas.height * 0.82, 0,
        canvas.width * 0.08, canvas.height * 0.85, canvas.width * 0.55
      );
      neb2.addColorStop(0,   "rgba(20,60,110,0.14)");
      neb2.addColorStop(0.7, "rgba(10,30,60,0.05)");
      neb2.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      /* stars */
      for (let i = 0; i < 320; i++) {
        const x  = Math.random() * canvas.width;
        const y  = Math.random() * canvas.height;
        const r  = Math.random() < 0.06 ? 2.2 : Math.random() < 0.22 ? 1.2 : 0.55;
        const op = 0.15 + Math.random() * 0.85;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }

      /* sparkle stars */
      for (let i = 0; i < 8; i++) {
        drawSparkle(
          ctx,
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          3 + Math.random() * 5,
          0.35 + Math.random() * 0.5
        );
      }

      /* card glow halo */
      const cx = (PAD_X + cardW / 2) * SCALE;
      const cy = (PAD_Y + cardH / 2) * SCALE;
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, cardW * SCALE * 0.85);
      halo.addColorStop(0,   "rgba(210,205,255,0.13)");
      halo.addColorStop(0.5, "rgba(170,165,240,0.06)");
      halo.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      /* load + draw card image with tilt */
      const tiltDeg = (Math.random() - 0.5) * 3;   // −1.5 … +1.5 °
      const tiltRad = tiltDeg * (Math.PI / 180);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(tiltRad);
          ctx.shadowColor   = "rgba(180,175,255,0.30)";
          ctx.shadowBlur    = 55 * SCALE;
          ctx.shadowOffsetY = 12 * SCALE;
          ctx.drawImage(img, -cardW * SCALE / 2, -cardH * SCALE / 2, cardW * SCALE, cardH * SCALE);
          ctx.shadowBlur    = 0;
          ctx.shadowOffsetY = 0;
          ctx.restore();
          resolve();
        };
        img.onerror = reject;
        img.src = "/wisdom-card-bg.jpg";
      });

      /* overlay text — same proportions as DOM */
      await document.fonts.ready;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltRad);

      const cL = -cardW * SCALE / 2;
      const cT = -cardH * SCALE / 2;
      const cW =  cardW * SCALE;
      const cH =  cardH * SCALE;

      const textLeft = cL + cW * 0.175;
      const lineH    = 13 * SCALE * 1.65;

      /* quote body */
      ctx.textBaseline = "top";
      ctx.fillStyle    = "#111111";
      ctx.font         = `${13 * SCALE}px Pretendard, -apple-system, BlinkMacSystemFont, sans-serif`;

      let ty = cT + cH * 0.29;
      for (const line of quote.text.split("\n")) {
        if (line === "") {
          ty += 0.4 * 13 * SCALE;
        } else {
          ctx.fillText(line, textLeft, ty);
          ty += lineH;
        }
      }

      /* source */
      ctx.font      = `${8 * SCALE}px 'Courier New', monospace`;
      ctx.fillStyle = "rgba(68,68,68,0.75)";
      ctx.fillText(quote.source, textLeft, ty + 8 * SCALE);

      /* footer */
      ctx.font      = `bold ${9.5 * SCALE}px 'Courier New', monospace`;
      ctx.fillStyle = "#111111";
      try {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0.04em";
      } catch { /* noop */ }

      const fy_from   = cT + cH * 0.775;
      const fy_sector = cT + cH * 0.840;
      const fy_note   = cT + cH * 0.910;
      const dateLeft  = cL + cW * 0.38;

      ctx.fillText("THE STARS",  textLeft, fy_from);
      ctx.fillText(dateStr,      dateLeft, fy_from);
      ctx.fillText(quote.sector, textLeft, fy_sector);
      ctx.fillText(quote.note,   textLeft, fy_note);

      ctx.restore();

      /* download */
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a   = document.createElement("a");
        a.href     = url;
        a.download = `letter-from-stars-${dateStr.toLowerCase()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");

    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const mono: React.CSSProperties       = { fontFamily: "'Courier New', monospace" };
  const pretendard: React.CSSProperties = { fontFamily: "'Pretendard', sans-serif" };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center overflow-y-auto bg-black/85"
      onClick={onClose}
    >
      <div className="flex min-h-full w-full flex-col items-center justify-center gap-5 py-6">

        {/* ── Card ── */}
        <div
          ref={cardRef}
          className="relative mx-auto shrink-0"
          style={{
            width: "min(320px, 88vw)",
            aspectRatio: "1023 / 1537",
            backgroundImage: "url('/wisdom-card-bg.jpg')",
            backgroundSize: "100% 100%",
          }}
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Wisdom text body ── */}
          <div
            className="absolute overflow-hidden"
            style={{ top: "29%", left: "17.5%", right: "11%", maxHeight: "34%" }}
          >
            {quote.text.split("\n").map((line, i) => (
              <p
                key={i}
                className="leading-[1.65] text-[#111]"
                style={{
                  ...pretendard,
                  fontSize: "13px",
                  marginBottom: line === "" ? "0.4em" : 0,
                }}
              >
                {line || " "}
              </p>
            ))}
            <p
              className="mt-2 text-[#444] opacity-75"
              style={{ ...mono, fontSize: "8px" }}
            >
              {quote.source}
            </p>
          </div>

          {/* FROM value */}
          <p
            className="absolute text-[#111]"
            style={{
              ...mono,
              top: "77.5%", left: "17.5%",
              fontSize: "clamp(7.5px, 2.3vw, 9.5px)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            THE STARS
          </p>

          {/* DATE value */}
          <p
            className="absolute text-[#111]"
            style={{
              ...mono,
              top: "77.5%", left: "38%",
              fontSize: "clamp(7.5px, 2.3vw, 9.5px)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {dateStr}
          </p>

          {/* SECTOR value */}
          <p
            className="absolute text-[#111]"
            style={{
              ...mono,
              top: "84%", left: "17.5%",
              fontSize: "clamp(7.5px, 2.3vw, 9.5px)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {quote.sector}
          </p>

          {/* NOTE TO YOU value */}
          <p
            className="absolute text-[#111]"
            style={{
              ...mono,
              top: "91%", left: "17.5%",
              fontSize: "clamp(7.5px, 2.3vw, 9.5px)",
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {quote.note}
          </p>

        </div>

        {/* ── Save button ── */}
        <button
          onClick={(e) => { e.stopPropagation(); void handleSave(); }}
          disabled={saving}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-white backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-50"
          style={{ ...mono, fontSize: "11px", letterSpacing: "0.08em" }}
        >
          {saving ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white" />
              SAVING...
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M6 1v7M3 5.5l3 3 3-3M1 10h10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              SAVE CARD
            </>
          )}
        </button>

      </div>
    </div>
  );
}
