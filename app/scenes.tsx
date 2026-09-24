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

// Three tall window panes along each of the lamp room's back walls, as
// [start, end] positions along the wall.
const LAMP_PANES = [[0.6, 2.9], [3.35, 5.65], [6.1, 8.4]];
const LAMP_GLOW = project([4.5, 4.5, 2.6]);

const KITCHEN_GLOW = project([7, 2, 1]);
const KITCHEN_STEAM = project([6.2, 1.2, 3]);
// Where each dried fish hangs below the kitchen beam, in screen pixels.
const KITCHEN_FISH = [1.5, 3, 4.5].map((x) => project([x, 3.3, 4.6]));

const ROCK: Colours = ["#46525a", "#1c2124", "#11161a"];
// Short ripples scattered across the sea, skipping any that fall off the picture.
const ROCKS_WAVES = Array.from({ length: 10 }, (_, row) =>
  Array.from({ length: 10 }, (_, col): [number, number] => [col * 3.2 - 10 + (row % 2) * 1.6, row * 3.2 - 10]),
).flat().filter((corner) => {
  const [x, y] = project([...corner, 0]);
  return x > -20 && x < 340 && y > -10 && y < 190;
});
const ROCKS_DOOR = project([5.3, 3.9, 1.5]);

// White water breaking against the rocks.
function Foam({ at }: { at: Point }) {
  const [x, y] = project(at);
  return <ellipse cx={x} cy={y} rx="9" ry="3.5" fill="#e2f3f1" opacity="0.75"/>;
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
        <svg data-room="lamp" viewBox="0 0 320 180" role="img" aria-label="A cut-away view of the lamp room: a great golden lens on a brass pedestal, blazing light towards tall windows over a sunset sea">
          <rect width="320" height="180" fill="#2a1d08"/>
          <RoomShell
            floor={["#8a5a32", "#6b4a2a", "#4f341c"]}
            backLeft={["#7a5a34", "#3f2c16", "#4a3418"]}
            backRight={["#7a5a34", "#5a4020", "#3f2c16"]}
          />
          {[1.5, 3, 4.5, 6, 7.5].map((x) => (
            <Line key={x} from={[x, 0, 0]} to={[x, ROOM, 0]} stroke="#6b4a2a"/>
          ))}
          {LAMP_PANES.map(([a, b]) => (
            <g key={a}>
              <Face corners={[[0, a, 1.4], [0, b, 1.4], [0, b, 5.8], [0, a, 5.8]]} fill="url(#sky-dusk)"/>
              <Face corners={[[0, a, 1.4], [0, b, 1.4], [0, b, 2.2], [0, a, 2.2]]} fill="#b8683c"/>
              <Face corners={[[a, 0, 1.4], [b, 0, 1.4], [b, 0, 5.8], [a, 0, 5.8]]} fill="url(#sky-dusk)"/>
              <Face corners={[[a, 0, 1.4], [b, 0, 1.4], [b, 0, 2.2], [a, 0, 2.2]]} fill="#b8683c"/>
            </g>
          ))}
          <Face corners={[[4.5, 4.5, 3], [0, 0.8, 5.6], [0, 5, 1.6]]} fill="#fff2b0" opacity={0.4}/>
          <Face corners={[[4.5, 4.5, 3], [0.8, 0, 5.6], [5, 0, 1.6]]} fill="#fff2b0" opacity={0.4}/>
          <circle cx={LAMP_GLOW[0]} cy={LAMP_GLOW[1]} r="70" fill="url(#glow-lamp)"/>
          <Block at={[3.2, 3.2, 0]} size={[2.6, 2.6, 1]} colours={["#8a6a40", "#5a4020", "#3f2c16"]}/>
          <Cylinder at={[4.5, 4.5, 1]} r={1.2} h={3} colours={["#fffbe6", "#ffe27a", "#f2c14e"]}/>
          {[1.8, 2.5, 3.2].map((z) => (
            <Band key={z} at={[4.5, 4.5, 0]} r={1.2} from={z} to={z + 0.15} fill="#e8a93a"/>
          ))}
          <Cylinder at={[4.5, 4.5, 4]} r={0.7} h={0.4} colours={["#8a6a40", "#5a4020", "#3f2c16"]}/>
        </svg>
      )}

      {/* Keeper's Kitchen: warm, cosy firelight */}
      {art === "kitchen" && (
        <svg data-room="kitchen" viewBox="0 0 320 180" role="img" aria-label="A cut-away view of a warm kitchen: a copper kettle on a glowing iron stove, a table set for one and dried fish hanging from a beam">
          <rect width="320" height="180" fill="#2b1510"/>
          <RoomShell
            floor={["#7a4526", "#5e3219", "#44230f"]}
            backLeft={["#d8a07a", "#7a4526", "#b0704a"]}
            backRight={["#d8a07a", "#c9825a", "#7a4526"]}
          />
          {[1.5, 3, 4.5, 6, 7.5].map((y) => (
            <Line key={y} from={[0, y, 0]} to={[ROOM, y, 0]} stroke="#5e3219"/>
          ))}
          <circle cx={KITCHEN_GLOW[0]} cy={KITCHEN_GLOW[1]} r="75" fill="url(#glow-stove)"/>
          <Block at={[5.6, 0.2, 0]} size={[2.8, 1.8, 2.2]} colours={["#3a322d", "#2a2320", "#1c1816"]}/>
          <Face corners={[[6.1, 2, 0.4], [7.9, 2, 0.4], [7.9, 2, 1.6], [6.1, 2, 1.6]]} fill="#f07a2a"/>
          <Face corners={[[6.4, 2, 0.5], [7.6, 2, 0.5], [7.6, 2, 1.1], [6.4, 2, 1.1]]} fill="#ffd08a"/>
          <Cylinder at={[7.8, 0.8, 2.2]} r={0.3} h={4.3} colours={["#2a2320", "#2a2320", "#1c1816"]}/>
          <Cylinder at={[6.4, 1.2, 2.2]} r={0.5} h={0.6} colours={["#e09a60", "#c8743e", "#9a5428"]}/>
          <path d={`M${KITCHEN_STEAM[0]} ${KITCHEN_STEAM[1]} q-4 -6 0 -12 t0 -12 M${KITCHEN_STEAM[0] + 7} ${KITCHEN_STEAM[1] - 2} q-3 -5 0 -10 t0 -10`} fill="none" stroke="#fbe9dc" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
          <Block at={[0, 2.8, 5.6]} size={[ROOM, 0.5, 0.4]} colours={["#8a5530", "#6b3f22", "#5a321a"]}/>
          {KITCHEN_FISH.map(([x, y]) => (
            <g key={x}>
              <line x1={x} y1={y - 12} x2={x} y2={y} stroke="#3a1c0c" strokeWidth="0.8"/>
              <path d={`M${x} ${y} q5 7 0 16 q-5 -9 0 -16 Z M${x} ${y + 16} l-4 5 h8 Z`} fill="#e0b070"/>
            </g>
          ))}
          {[[1.2, 4.2], [3.55, 4.2], [1.2, 6.35], [3.55, 6.35]].map(([x, y]) => (
            <Block key={`${x},${y}`} at={[x, y, 0]} size={[0.25, 0.25, 1.6]} colours={["#7a4526", "#6b3f22", "#4f2a14"]}/>
          ))}
          <Block at={[1, 4, 1.6]} size={[3, 2.8, 0.3]} colours={["#b87448", "#9a5d35", "#7a4526"]}/>
          <Cylinder at={[2, 5.4, 1.9]} r={0.5} h={0.05} colours={["#fff3e3", "#d9c9b5", "#c4b4a0"]}/>
          <Cylinder at={[3.2, 4.8, 1.9]} r={0.25} h={0.45} colours={["#5b8f9a", "#3f6f7a", "#2f5560"]}/>
          <Cylinder at={[2.4, 7.8, 0]} r={0.55} h={1.1} colours={["#b87448", "#9a5d35", "#7a4526"]}/>
        </svg>
      )}

      {/* Rocks: wild, stormy sea */}
      {art === "rocks" && (
        <svg data-room="rocks" viewBox="0 0 320 180" role="img" aria-label="A view from above of black rocks at the foot of the lighthouse, with a stormy sea breaking round them, rain slanting down and gulls in the wind">
          <rect width="320" height="180" fill="#2d5f6e"/>
          <g opacity="0.5">
            {ROCKS_WAVES.map(([x, y]) => (
              <Line key={`${x},${y}`} from={[x, y, 0]} to={[x + 1.2, y, 0]} stroke="#bfe8e2" width={1}/>
            ))}
          </g>
          {/* The island and tower sit a little lower than the room scenes. */}
          <g transform="translate(0 22)">
          {[[0.4, 1.4], [5.5, 0.6], [8.4, 1.6]].map(([x, y]) => <Foam key={`${x},${y}`} at={[x, y, 0]}/>)}
          <Block at={[0.8, 1.8, 0]} size={[1.2, 2.8, 0.9]} colours={ROCK}/>
          <Block at={[2, 1, 0]} size={[4.5, 4, 1.5]} colours={ROCK}/>
          <Cylinder at={[4.2, 2.8, 1.5]} r={1.5} h={14} colours={["#ffffff", "#d9d4c8", "#b3ad9f"]}/>
          <Band at={[4.2, 2.8, 1.5]} r={1.5} from={5} to={7} fill="#9b3a2e"/>
          <path d={`M${ROCKS_DOOR[0] - 6} ${ROCKS_DOOR[1]} v-14 a6 6 0 0 1 12 0 v14 Z`} fill="#3b3733"/>
          <rect x={ROCKS_DOOR[0] - 3} y={ROCKS_DOOR[1] - 118} width="6" height="10" rx="2" fill="#ffd35a"/>
          <Block at={[6.5, 1.8, 0]} size={[1.5, 2.4, 1]} colours={ROCK}/>
          <Block at={[1, 5, 0]} size={[1.8, 1.2, 0.5]} colours={ROCK}/>
          <Block at={[3, 5, 0]} size={[3, 1.8, 0.8]} colours={ROCK}/>
          <Block at={[6.3, 5.2, 0]} size={[1.2, 1.2, 0.4]} colours={ROCK}/>
          {[[0.6, 4.8], [2.2, 6.4], [4.6, 7], [7, 6.6], [8.2, 4.4]].map(([x, y]) => <Foam key={`${x},${y}`} at={[x, y, 0]}/>)}
          </g>
          <path d="M214 36 q6 -6 12 0 q6 -6 12 0 M252 22 q5 -5 10 0 q5 -5 10 0 M58 30 q5 -5 10 0 q5 -5 10 0" fill="none" stroke="#e2f3f1" strokeWidth="1.6" strokeLinecap="round"/>
          <rect width="320" height="180" fill="url(#rain)" opacity="0.7"/>
        </svg>
      )}
    </>
  );
}
