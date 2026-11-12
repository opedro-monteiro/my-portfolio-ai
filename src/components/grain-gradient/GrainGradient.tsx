"use client";

import { useEffect, useRef } from "react";

const VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Slowly drifting vertical colour bands (navy -> blue -> sky -> ice, with a
// luminous indigo arch) and film grain on top. Palette follows the page theme.
const FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform float uLight; // 0 = dark theme, 1 = light theme
out vec4 fragColor;

const int N = 9;
const float POS[N] = float[](0.00, 0.10, 0.22, 0.30, 0.52, 0.62, 0.74, 0.86, 1.00);
const vec3 DARK[N] = vec3[](
  vec3(0.043, 0.043, 0.043),
  vec3(0.035, 0.075, 0.19),
  vec3(0.06, 0.165, 0.48),
  vec3(0.09, 0.28, 0.79),
  vec3(0.18, 0.48, 1.00),
  vec3(0.22, 0.71, 1.00),
  vec3(0.50, 0.85, 1.00),
  vec3(0.78, 0.91, 1.00),
  vec3(0.92, 0.96, 1.00)
);
const vec3 LIGHT[N] = vec3[](
  vec3(0.98, 0.98, 0.975),
  vec3(0.91, 0.93, 0.98),
  vec3(0.77, 0.85, 0.98),
  vec3(0.61, 0.74, 0.97),
  vec3(0.36, 0.58, 0.96),
  vec3(0.23, 0.51, 0.96),
  vec3(0.15, 0.39, 0.92),
  vec3(0.11, 0.31, 0.85),
  vec3(0.12, 0.25, 0.69)
);

vec3 ramp(float x) {
  x = clamp(x, 0.0, 1.0);
  vec3 d = DARK[0];
  vec3 l = LIGHT[0];
  for (int i = 0; i < N - 1; i++) {
    float f = step(POS[i], x) * smoothstep(POS[i], POS[i + 1], x);
    d = mix(d, DARK[i + 1], f);
    l = mix(l, LIGHT[i + 1], f);
  }
  return mix(d, l, uLight);
}

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

void main() {
  float t = uTime * 0.18;
  vec2 uv = vUv;

  // organic horizontal drift that varies with height
  float warp = 0.035 * sin(uv.y * 2.6 + t * 1.3)
             + 0.020 * sin(uv.y * 6.1 - t * 1.9)
             + 0.012 * sin(uv.y * 11.0 + t * 2.7);
  float x = uv.x + warp;

  vec3 col = ramp(x);

  // luminous indigo arch: narrow at the top, wide at the base
  float cx = 0.47 + warp * 1.4 + 0.012 * sin(t * 1.1);
  float hw = 0.075 + 0.105 * pow(1.0 - uv.y, 0.8);
  float arch = 1.0 - smoothstep(hw * 0.7, hw * 1.2, abs(x - cx));
  float core = smoothstep(0.7, 0.0, abs(x - cx) / hw) * (0.4 + 0.6 * (1.0 - uv.y));
  vec3 beamD = mix(vec3(0.20, 0.18, 0.85), vec3(0.45, 0.62, 1.0), core);
  vec3 beamL = mix(vec3(0.38, 0.40, 0.96), vec3(0.78, 0.86, 1.0), core);
  col = mix(col, mix(beamD, beamL, uLight), arch * 0.9);

  // soft glow at the base of the arch
  float g = length((uv - vec2(cx + 0.02, 0.0)) * vec2(1.0, 1.7));
  vec3 glow = mix(vec3(0.70, 0.90, 1.0), vec3(1.0), uLight);
  col = mix(col, glow, (1.0 - smoothstep(0.0, 0.2, g)) * 0.85);

  // film grain, re-seeded ~24fps
  float n = hash(gl_FragCoord.xy + floor(uTime * 24.0) * 17.0);
  col += (n - 0.5) * 0.085;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

// CSS fallback if WebGL2 is unavailable.
const FALLBACK =
  "linear-gradient(90deg,#0b0b0b 0%,#0a1330 12%,#1647c9 32%,#2f7bff 52%,#38b6ff 66%,#7fd8ff 80%,#eaf4ff 100%)";

type Props = React.CanvasHTMLAttributes<HTMLCanvasElement>;

export default function GrainGradient({ style, ...rest }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uLight = gl.getUniformLocation(program, "uLight");

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const isLight = () => document.documentElement.dataset.theme === "light" ? 1 : 0;
    let target = isLight();
    let mixed = target;

    const draw = () => {
      mixed += (target - mixed) * 0.12;
      if (Math.abs(target - mixed) < 0.001) mixed = target;
      gl.uniform1f(uLight, mixed);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
      draw();
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible) draw();
    };

    const themeObserver = new MutationObserver(() => {
      target = isLight();
      if (reduce) {
        mixed = target;
        draw();
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(canvas);
    if (!reduce) loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      {...rest}
      style={{ background: FALLBACK, ...style }}
    />
  );
}
