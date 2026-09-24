// Scene artwork, carried over unchanged from the prototype.

// Shared filters, patterns and gradients used by every scene
export function SceneDefs() {
  return (
    <svg className="defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        {/* Hand-drawn wobble */}
        <filter id="sketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        {/* Paper grain */}
        <filter id="grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>

        {/* Textures */}
        <pattern id="bricks" width="40" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 0.5 H40 M0 10.5 H40 M0.5 0 V10 M20.5 10 V20" stroke="#56606d" strokeWidth="1" fill="none"/>
        </pattern>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V6" stroke="#1f1c1a" strokeWidth="1" opacity="0.5"/>
        </pattern>
        <pattern id="hatch-gold" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <path d="M0 0 V5" stroke="#e8a93a" strokeWidth="1"/>
        </pattern>
        <pattern id="woodgrain" width="80" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 3 q20 -2 40 0 t40 0 M0 8 q20 2 40 0 t40 0" stroke="#2e1608" strokeWidth="0.8" fill="none" opacity="0.6"/>
        </pattern>
        <pattern id="waves" width="24" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 6 q6 -4 12 0 t12 0" stroke="#bfe8e2" strokeWidth="1" fill="none" opacity="0.55"/>
        </pattern>
        <pattern id="rain" width="14" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
          <path d="M7 0 V12" stroke="#d6eef2" strokeWidth="1" opacity="0.5"/>
        </pattern>

        {/* Light and shade */}
        <radialGradient id="vignette-cold" r="0.75">
          <stop offset="0.5" stopColor="#0b1320" stopOpacity="0"/>
          <stop offset="1" stopColor="#0b1320" stopOpacity="0.65"/>
        </radialGradient>
        <radialGradient id="vignette-warm" r="0.75">
          <stop offset="0.55" stopColor="#2b0e04" stopOpacity="0"/>
          <stop offset="1" stopColor="#2b0e04" stopOpacity="0.55"/>
        </radialGradient>
        <radialGradient id="glow-lamp">
          <stop offset="0" stopColor="#fff8d0" stopOpacity="0.95"/>
          <stop offset="1" stopColor="#ffd35a" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="glow-stove">
          <stop offset="0" stopColor="#ffb36b" stopOpacity="0.6"/>
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="sky-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe3a6"/>
          <stop offset="1" stopColor="#f2a765"/>
        </linearGradient>
        <linearGradient id="sky-storm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f535d"/>
          <stop offset="1" stopColor="#8aa2ac"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// Isometric projection: x runs down to the right, y runs down to the left and
// z runs straight up. One unit is U pixels along each axis.
const U = 10;
const ORIGIN_X = 160;
const ORIGIN_Y = 78;

type Point = [number, number, number];
// Colours for a solid's top, its front-left side and its front-right side.
type Colours = [string, string, string];

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function project([x, y, z]: Point): [number, number] {
  return [round(ORIGIN_X + (x - y) * U), round(ORIGIN_Y + ((x + y) * U) / 2 - z * U)];
}

// A flat shape in the scene, such as a window on a wall or light on the floor.
function Face({ corners, fill, opacity }: { corners: Point[]; fill: string; opacity?: number }) {
  const points = corners.map((corner) => project(corner).join(",")).join(" ");
  // A same-colour outline closes the hairline gaps between neighbouring faces.
  return opacity === undefined
    ? <polygon points={points} fill={fill} stroke={fill} strokeWidth="0.6" strokeLinejoin="round"/>
    : <polygon points={points} fill={fill} opacity={opacity}/>;
}

function Line({ from, to, stroke, width = 0.8 }: { from: Point; to: Point; stroke: string; width?: number }) {
  const [x1, y1] = project(from);
  const [x2, y2] = project(to);
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={width}/>;
}

// A box with its back, bottom corner at `at`.
function Block({ at: [x, y, z], size: [w, d, h], colours: [top, left, right] }: { at: Point; size: Point; colours: Colours }) {
  return (
    <g>
      <Face corners={[[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]} fill={left}/>
      <Face corners={[[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]} fill={right}/>
      <Face corners={[[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]} fill={top}/>
    </g>
  );
}

// An upright cylinder standing on the centre point `at`. The side's right half
// takes the shade colour.
function Cylinder({ at, r, h, colours: [top, side, shade] }: { at: Point; r: number; h: number; colours: Colours }) {
  const [cx, cy] = project(at);
  const rx = round(r * U * Math.SQRT2);
  const ry = round(rx / 2);
  const t = round(cy - h * U);
  return (
    <g>
      <path d={`M${cx - rx} ${t} V${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy} V${t} Z`} fill={side}/>
      <path d={`M${cx} ${cy + ry} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy} V${t} L${cx} ${t + ry} Z`} fill={shade}/>
      <ellipse cx={cx} cy={t} rx={rx} ry={ry} fill={top}/>
    </g>
  );
}

// A stripe round the front of an upright cylinder, between heights `from` and `to`.
function Band({ at, r, from, to, fill }: { at: Point; r: number; from: number; to: number; fill: string }) {
  const [cx, cy] = project(at);
  const rx = round(r * U * Math.SQRT2);
  const ry = round(rx / 2);
  const top = round(cy - to * U);
  const bottom = round(cy - from * U);
  return <path d={`M${cx - rx} ${top} A${rx} ${ry} 0 0 0 ${cx + rx} ${top} V${bottom} A${rx} ${ry} 0 0 1 ${cx - rx} ${bottom} Z`} fill={fill}/>;
}

// Indoor rooms are ROOM units square, with the front two walls cut away.
const ROOM = 9;
const WALL_HEIGHT = 6.5;
const WALL = 0.6;

// The floor and the two back walls. The back-right wall's inside is its
// front-left side, and the back-left wall's inside is its front-right side.
function RoomShell({ floor, backLeft, backRight }: { floor: Colours; backLeft: Colours; backRight: Colours }) {
  return (
    <g>
      <Block at={[-WALL, -WALL, -WALL]} size={[ROOM + WALL, ROOM + WALL, WALL]} colours={floor}/>
      <Block at={[-WALL, -WALL, 0]} size={[ROOM + WALL, WALL, WALL_HEIGHT]} colours={backRight}/>
      <Block at={[-WALL, 0, 0]} size={[WALL, ROOM, WALL_HEIGHT]} colours={backLeft}/>
    </g>
  );
}

// Ten iron steps winding up round the stair's column, starting at the front.
const STAIR_STEPS = Array.from({ length: 10 }, (_, i) => {
  const angle = Math.PI / 4 - (i * 2 * Math.PI) / 9;
  return { x: 4.5 + 1.6 * Math.cos(angle), y: 4.5 + 1.6 * Math.sin(angle), z: i * 0.6 };
});
// Steps behind the column are drawn before it, and steps in front after it.
const byDepth = (a: { x: number; y: number }, b: { x: number; y: number }) => a.x + a.y - (b.x + b.y);
const STAIR_BACK = STAIR_STEPS.filter((step) => step.x + step.y < ROOM).sort(byDepth);
const STAIR_FRONT = STAIR_STEPS.filter((step) => step.x + step.y >= ROOM).sort(byDepth);

function StairStep({ x, y, z }: { x: number; y: number; z: number }) {
  return <Block at={[x - 0.7, y - 0.7, z]} size={[1.4, 1.4, 0.3]} colours={["#5b6472", "#454d5a", "#333a45"]}/>;
}

// Only the current room's scene is rendered.
export function Scenes({ art }: { art: string }) {
  return (
    <>
      {/* Spiral Stair: cold, lonely stone */}
      {art === "stair" && (
        <svg data-room="stair" viewBox="0 0 320 180" role="img" aria-label="A cut-away view of a cold stone stairwell, with iron steps spiralling round a central column and one narrow window letting in pale light">
          <rect width="320" height="180" fill="#1b2230"/>
          <RoomShell
            floor={["#6b7584", "#4a525f", "#373e49"]}
            backLeft={["#aab2bd", "#4f5866", "#66707e"]}
            backRight={["#aab2bd", "#7f8a99", "#4f5866"]}
          />
          {[1.3, 2.6, 3.9, 5.2].map((z) => (
            <g key={z}>
              <Line from={[0, 0, z]} to={[0, ROOM, z]} stroke="#56606d"/>
              <Line from={[0, 0, z]} to={[ROOM, 0, z]} stroke="#6b7584"/>
            </g>
          ))}
          <Face corners={[[6, 0, 3], [7.2, 0, 3], [7.2, 0, 5.4], [6, 0, 5.4]]} fill="#e9f1f7"/>
          <Face corners={[[5.4, 1.5, 0], [6.8, 1.5, 0], [8, 6.5, 0], [6.2, 6.5, 0]]} fill="#e9f1f7" opacity={0.18}/>
          {STAIR_BACK.map((step) => <StairStep key={step.z} {...step}/>)}
          <Cylinder at={[4.5, 4.5, 0]} r={0.8} h={13} colours={["#aab2bd", "#aab2bd", "#7f8a99"]}/>
          {STAIR_FRONT.map((step) => <StairStep key={step.z} {...step}/>)}
        </svg>
      )}

      {/* Lamp Room: bright, golden awe */}
      {art === "lamp" && (
        <svg data-room="lamp" viewBox="0 0 320 180" role="img" aria-label="A great glass lens blazing with golden light in front of windows over a sunset sea">
          <g filter="url(#sketch)" stroke="#3a220c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="0" y="0" width="320" height="110" fill="url(#sky-dusk)" stroke="none"/>
            <rect x="0" y="110" width="320" height="40" fill="#b8683c" stroke="none"/>
            <path d="M0 110 H320" fill="none"/>
            <path d="M10 122 q10 -5 20 0 t20 0 M90 132 q10 -5 20 0 t20 0 M230 124 q10 -5 20 0 t20 0 M270 138 q10 -5 20 0" fill="none" stroke="#7a3f1f" strokeWidth="1.4"/>
            <polygon points="160,80 0,30 0,120" fill="#fff2b0" opacity="0.5" stroke="none"/>
            <polygon points="160,80 320,30 320,120" fill="#fff2b0" opacity="0.5" stroke="none"/>
            <polygon points="160,80 0,30 0,120" fill="url(#hatch-gold)" opacity="0.5" stroke="none"/>
            <polygon points="160,80 320,30 320,120" fill="url(#hatch-gold)" opacity="0.5" stroke="none"/>
            <path d="M60 0 V150 M130 0 V28 M190 0 V28 M260 0 V150" fill="none"/>
            <rect x="0" y="150" width="320" height="30" fill="#6b4a2a"/>
            <rect x="0" y="150" width="320" height="30" fill="url(#woodgrain)" stroke="none"/>
            <circle cx="160" cy="80" r="75" fill="url(#glow-lamp)" stroke="none"/>
            <path d="M140 130 L180 130 L190 150 L130 150 Z" fill="#4a3a2a"/>
            <ellipse cx="160" cy="80" rx="38" ry="52" fill="#ffe27a"/>
            <g fill="none" strokeWidth="1.5">
              <ellipse cx="160" cy="80" rx="28" ry="40"/>
              <ellipse cx="160" cy="80" rx="18" ry="27"/>
              <ellipse cx="160" cy="80" rx="8" ry="13" fill="#fffbe6"/>
              <path d="M124 62 H196 M122 98 H198"/>
            </g>
            <path d="M160 18 V6 M204 38 l9 -8 M116 38 l-9 -8" fill="none" stroke="#e8a93a" strokeWidth="1.8"/>
          </g>
          <rect width="320" height="180" filter="url(#grain)" opacity="0.18" style={{ mixBlendMode: "multiply" }}/>
        </svg>
      )}

      {/* Keeper's Kitchen: warm, cosy firelight */}
      {art === "kitchen" && (
        <svg data-room="kitchen" viewBox="0 0 320 180" role="img" aria-label="A copper kettle on a glowing iron stove, a table set for one and dried fish hanging from a beam">
          <g filter="url(#sketch)" stroke="#2a130a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="0" y="0" width="320" height="150" fill="#c9825a" stroke="none"/>
            <circle cx="235" cy="112" r="120" fill="url(#glow-stove)" stroke="none"/>
            <rect x="0" y="150" width="320" height="30" fill="#7a4526"/>
            <rect x="0" y="150" width="320" height="30" fill="url(#woodgrain)" stroke="none"/>
            <path d="M60 150 V180 M150 150 V180 M240 150 V180" fill="none" strokeWidth="1.2"/>
            <rect x="-5" y="10" width="330" height="12" fill="#6b3f22"/>
            <rect x="-5" y="10" width="330" height="12" fill="url(#woodgrain)" stroke="none"/>
            <path d="M40 22 V45 M70 22 V40 M100 22 V48" fill="none" strokeWidth="1.2"/>
            <g fill="#e0b070">
              <path d="M40 45 q8 14 0 30 q-8 -16 0 -30 Z"/>
              <path d="M40 75 l-6 9 h12 Z"/>
              <path d="M70 40 q8 14 0 30 q-8 -16 0 -30 Z"/>
              <path d="M70 70 l-6 9 h12 Z"/>
              <path d="M100 48 q8 14 0 30 q-8 -16 0 -30 Z"/>
              <path d="M100 78 l-6 9 h12 Z"/>
            </g>
            <rect x="40" y="105" width="110" height="8" fill="#9a5d35"/>
            <rect x="40" y="105" width="110" height="8" fill="url(#woodgrain)" stroke="none"/>
            <path d="M50 113 V150 M140 113 V150" fill="none"/>
            <ellipse cx="80" cy="103" rx="16" ry="4" fill="#fff3e3"/>
            <path d="M101 104 V94 M98 94 v4 M104 94 v4" fill="none" strokeWidth="1.4"/>
            <rect x="114" y="92" width="12" height="12" fill="#3f6f7a"/>
            <path d="M126 95 q6 3 0 7" fill="none" strokeWidth="1.6"/>
            <rect x="255" y="22" width="14" height="58" fill="#2a2320"/>
            <rect x="190" y="80" width="90" height="62" fill="#2a2320"/>
            <rect x="190" y="80" width="90" height="62" fill="url(#hatch)" stroke="none"/>
            <path d="M196 142 V150 M274 142 V150" fill="none"/>
            <rect x="205" y="98" width="60" height="34" fill="#f07a2a" stroke="#8d857b"/>
            <path d="M215 132 q5 -18 10 -6 q4 -16 10 -2 q5 -18 10 -4 q4 -12 10 12 Z" fill="#ffd08a" stroke="none"/>
            <path d="M205 80 q0 -22 17 -22 q17 0 17 22 Z" fill="#c8743e"/>
            <path d="M237 70 l12 -9" fill="none"/>
            <path d="M213 62 q9 -14 18 0" fill="none"/>
            <path d="M252 56 q-5 -8 0 -16 t0 -16 M244 50 q-4 -6 0 -12 t0 -12" fill="none" stroke="#fbe9dc" strokeWidth="1.4" opacity="0.7"/>
          </g>
          <rect width="320" height="180" filter="url(#grain)" opacity="0.35" style={{ mixBlendMode: "multiply" }}/>
          <rect width="320" height="180" fill="url(#vignette-warm)"/>
        </svg>
      )}

      {/* Rocks: wild, stormy sea */}
      {art === "rocks" && (
        <svg data-room="rocks" viewBox="0 0 320 180" role="img" aria-label="Storm waves and rain lashing black rocks at the foot of the lighthouse, with gulls in the wind">
          <g filter="url(#sketch)" stroke="#0a1418" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="0" y="0" width="320" height="115" fill="url(#sky-storm)" stroke="none"/>
            <g fill="#2f3f47">
              <path d="M120 30 q10 -22 32 -12 q14 -18 34 -4 q24 -6 26 14 q14 6 4 18 H118 q-14 -6 2 -16 Z"/>
              <path d="M230 12 q10 -14 26 -6 q16 -10 28 4 q18 0 16 14 H232 q-10 -4 -2 -12 Z"/>
            </g>
            <rect x="0" y="115" width="320" height="65" fill="#2d5f6e" stroke="none"/>
            <rect x="0" y="115" width="320" height="65" fill="url(#waves)" stroke="none"/>
            <path d="M20 -5 L90 -5 L100 120 L10 120 Z" fill="#d9d4c8"/>
            <path d="M16 40 L94 40 L96 65 L14 65 Z" fill="#9b3a2e"/>
            <rect x="50" y="14" width="10" height="16" rx="3" fill="#ffd35a"/>
            <path d="M45 120 V96 q10 -12 20 0 V120" fill="#3b3733"/>
            <path d="M0 132 L30 110 L70 118 L110 100 L150 125 L170 142 L0 152 Z" fill="#1c2124"/>
            <path d="M180 152 L210 128 L240 135 L270 118 L300 140 L320 132 L320 166 L180 166 Z" fill="#1c2124"/>
            <path d="M0 132 L30 110 L70 118 L110 100 L150 125 L170 142 L0 152 Z" fill="url(#hatch)" stroke="none" opacity="0.6"/>
            <path d="M40 120 l12 -3 M115 108 l10 6 M225 134 l10 1 M275 124 l8 5" fill="none" stroke="#bfe8e2" strokeWidth="1.4"/>
            <path d="M0 168 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" strokeWidth="1.6"/>
            <path d="M140 132 q20 -40 50 -22 q-18 -2 -22 14" fill="#e2f3f1" strokeWidth="1.6"/>
            <g fill="#ffffff" stroke="none" opacity="0.9">
              <circle cx="160" cy="98" r="3"/>
              <circle cx="176" cy="90" r="2.5"/>
              <circle cx="148" cy="92" r="2"/>
              <circle cx="196" cy="104" r="2.5"/>
              <circle cx="210" cy="96" r="2"/>
            </g>
            <path d="M200 56 q8 -10 16 0 q8 -6 16 2 M258 44 q6 -8 12 0 q6 -5 12 2 M150 70 q5 -6 10 0 q5 -4 10 1" fill="none" stroke="#e2f3f1" strokeWidth="1.8"/>
          </g>
          <rect width="320" height="180" fill="url(#rain)"/>
          <rect width="320" height="180" filter="url(#grain)" opacity="0.3" style={{ mixBlendMode: "multiply" }}/>
          <rect width="320" height="180" fill="url(#vignette-cold)" opacity="0.7"/>
        </svg>
      )}
    </>
  );
}
