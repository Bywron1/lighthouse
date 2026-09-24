type Direction = "up" | "down" | "left" | "right";

interface Room {
  name: string;
  art: string;
  description: string;
  x: number;
  y: number;
  blocked: Partial<Record<Direction, string>>;
}

const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

const OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

const KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const ROOMS: Room[] = [
  {
    name: "Spiral Stair",
    art: "stair",
    description:
      "Iron steps coil upward around a cold stone column, worn smooth by years of boots. A narrow window lets in the grey light of the sea.",
    x: 0,
    y: 0,
    blocked: {
      up: "The stair ends at a sealed trapdoor, rusted shut.",
      left: "Solid stone wall. The tower is thick here.",
    },
  },
  {
    name: "Lamp Room",
    art: "lamp",
    description:
      "A great glass lens sits at the centre of the room, catching every scrap of light. Beyond the windows the ocean stretches to the horizon.",
    x: 1,
    y: 0,
    blocked: {
      up: "This is the top of the tower. There's nowhere higher to go.",
      right: "Only glass and a long drop to the waves beyond.",
    },
  },
  {
    name: "Keeper's Kitchen",
    art: "kitchen",
    description:
      "A kettle sits on a black iron stove beside a table set for one. Dried fish hang from the beams and the air smells of salt and smoke.",
    x: 0,
    y: 1,
    blocked: {
      down: "The cellar hatch is padlocked.",
      left: "The pantry wall. Nothing but shelves of tins.",
    },
  },
  {
    name: "Rocks",
    art: "rocks",
    description:
      "Black rocks glisten with spray at the foot of the lighthouse. Waves crash around you and gulls wheel overhead.",
    x: 1,
    y: 1,
    blocked: {
      down: "The sea crashes against the rocks. You'd be swept away.",
      right: "Deep, churning water. Too far to swim.",
    },
  },
];

let current: Room = ROOMS.find((room) => room.name === "Rocks")!;

function roomAt(x: number, y: number): Room | undefined {
  return ROOMS.find((room) => room.x === x && room.y === y);
}

function neighbour(room: Room, dir: Direction): Room | undefined {
  const { dx, dy } = OFFSETS[dir];
  return roomAt(room.x + dx, room.y + dy);
}

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function el(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node;
}

const mapCells = new Map<Room, HTMLElement>();

function buildMap(): void {
  const map = el("map");
  for (const room of ROOMS) {
    const cell = document.createElement("div");
    cell.className = "map-cell";
    cell.textContent = capitalise(room.art);
    cell.title = room.name;
    cell.style.gridColumn = String(room.x + 1);
    cell.style.gridRow = String(room.y + 1);
    map.appendChild(cell);
    mapCells.set(room, cell);
  }
}

// Matches the CSS opacity transition on [data-fade]; skipped for reduced motion.
const FADE_MS = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250;
let fadeTimer: number | undefined;

// Page colours and the map change straight away so they blend during the fade.
function renderFrame(): void {
  document.body.dataset.room = current.art;
  mapCells.forEach((cell, room) => {
    if (room === current) cell.setAttribute("aria-current", "location");
    else cell.removeAttribute("aria-current");
  });
}

// The room's name, art, description and exits swap while faded out.
function renderRoom(): void {
  el("room-name").textContent = current.name;
  document.querySelectorAll<SVGElement>("svg[data-room]").forEach((svg) => {
    svg.toggleAttribute("hidden", svg.dataset.room !== current.art);
  });
  el("room-description").textContent = current.description;
  const exits = DIRECTIONS.filter((dir) => neighbour(current, dir)).map(capitalise);
  el("room-exits").textContent = exits.join(", ");
}

function showMessage(message: string): void {
  el("message").textContent = message;
}

function fadeToRoom(): void {
  const main = document.querySelector("main");
  main?.classList.add("is-fading");
  window.clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => {
    renderRoom();
    main?.classList.remove("is-fading");
  }, FADE_MS);
}

function move(dir: Direction): void {
  const next = neighbour(current, dir);
  if (next) {
    current = next;
    showMessage("");
    renderFrame();
    fadeToRoom();
  } else {
    showMessage(current.blocked[dir] ?? "You can't go that way.");
  }
}

document.addEventListener("keydown", (event) => {
  const dir = KEYS[event.key];
  if (!dir) return;
  event.preventDefault();
  move(dir);
});

buildMap();
renderFrame();
renderRoom();
