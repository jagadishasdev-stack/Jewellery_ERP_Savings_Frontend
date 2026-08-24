import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo/logo.png";
import theme from "../theme";
import { StoreContext } from "../contexts/StoreContext";

const BRAND_COLOR =
  theme.colors?.primary ??
  theme.primary ??
  theme.palette?.primary?.main ??
  "#0f172a";
const LOGO_COLOR = "#0f172a"; // ← your theme color

const TAGLINE = "SAVE · INVEST · SHINE";

const hexToRgb = (hex) => {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const lighten = (val, amount) =>
  Math.min(255, Math.round(val + (255 - val) * amount));

const base = hexToRgb(LOGO_COLOR); // #850000 → deep crimson
const mid = {
  r: lighten(base.r, 0.35),
  g: lighten(base.g, 0.35),
  b: lighten(base.b, 0.35),
}; // mid rose
const light = {
  r: lighten(base.r, 0.6),
  g: lighten(base.g, 0.6),
  b: lighten(base.b, 0.6),
}; // soft blush

const waveLayers = [
  // Front — pure deep crimson, most opaque
  { rgb: base, alpha: 0.92, ampMult: 1.0, freqMult: 1.0, phase: 0 },
  // Mid — rose tint
  { rgb: mid, alpha: 0.6, ampMult: 0.75, freqMult: 1.3, phase: 1.2 },
  // Back — soft blush, most transparent
  { rgb: light, alpha: 0.35, ampMult: 0.5, freqMult: 1.7, phase: 2.4 },
];

export default function SplashLiquidWave() {
  const { storeAssets } = useContext(StoreContext);

  // const name = storeAssets?.storeinfo[0]?.store_name;
  const name = storeAssets?.storeinfo[0]?.store_name;
  const navigate = useNavigate();
  const canvasRef = useRef();
  const logoRef = useRef();
  const nameRef = useRef();
  const tagRef = useRef();
  // const subRef = useRef();
  const APP_NAME = name;
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;

    const DURATION = 2200;
    const startTime = performance.now();
    let t = 0;
    let rafId;

    const easeInOut = (v) => (v < 0.5 ? 2 * v * v : -1 + (4 - 2 * v) * v);

    const tick = (now) => {
      const elapsed = now - startTime;
      const prog = Math.min(elapsed / DURATION, 1);
      const eased = easeInOut(prog);

      ctx.clearRect(0, 0, W, H);

      waveLayers.forEach(({ rgb: c, alpha, ampMult, freqMult, phase }) => {
        const waveY = H - eased * H * 1.1;
        const amp = (20 - eased * 12) * ampMult;
        const freq = 0.018 * freqMult;

        // Vertical gradient per wave layer: semi-transparent top → full color bottom
        const grad = ctx.createLinearGradient(0, waveY, 0, H);
        grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${alpha * 0.6})`);
        grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},${alpha})`);

        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 2) {
          const y = waveY + Math.sin(x * freq + (t + phase) * 2.5) * amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      });

      t += 0.035;
      if (prog < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = LOGO_COLOR;
        ctx.fillRect(0, 0, W, H);
      }
    };

    rafId = requestAnimationFrame(tick);

    setTimeout(() => {
      if (!logoRef.current) return;
      logoRef.current.style.transition =
        "all 0.6s cubic-bezier(0.34,1.56,0.64,1)";
      logoRef.current.style.opacity = "1";
      logoRef.current.style.transform = "scale(1)";
    }, 700);

    setTimeout(() => {
      if (!nameRef.current) return;
      nameRef.current.style.transition = "all 0.5s ease";
      nameRef.current.style.opacity = "1";
      nameRef.current.style.transform = "translateY(0)";
    }, 950);

    setTimeout(() => {
      if (!tagRef.current) return;
      tagRef.current.style.transition = "opacity 0.5s ease";
      tagRef.current.style.opacity = "1";
    }, 1150);
    // setTimeout(() => {
    //   if (!subRef.current) return;
    //   subRef.current.style.transition = "opacity 0.5s ease";
    //   subRef.current.style.opacity    = "1";
    // }, 1300);
    const nav = setTimeout(() => navigate("/login"), 3200);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(nav);
    };
  }, [navigate]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_COLOR,
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <img
          ref={logoRef}
          src={logo}
          alt="Logo"
          style={{
            width: 140,
            height: 140,
            objectFit: "contain",
            opacity: 0,
            transform: "scale(0.2)",
            filter: "none",
          }}
        />
        <p
          ref={nameRef}
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.18em",
            margin: "20px 0 0",
            opacity: 0,
            transform: "translateY(14px)",
          }}
        >
          {APP_NAME}
        </p>
        {/* <p ref={subRef} style={{
  color: "rgba(255,255,255,0.85)", fontSize: 13,
  fontStyle: "italic",
  letterSpacing: "0.06em", margin: "4px 0 0", opacity: 0,
}}>Your Neighbourhood Jewellers</p> */}
        <p
          ref={tagRef}
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            letterSpacing: "0.1em",
            margin: "6px 0 0",
            opacity: 0,
          }}
        >
          {TAGLINE}
        </p>
      </div>
    </div>
  );
}
