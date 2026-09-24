export type Direction = "up" | "down" | "left" | "right";

export interface Room {
  name: string;
  art: string;
  description: string;
  x: number;
  y: number;
  blocked: Partial<Record<Direction, string>>;
}

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

const OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export const KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export const ROOMS: Room[] = [
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

export const START_ROOM: Room = ROOMS.find((room) => room.name === "Rocks")!;

function roomAt(x: number, y: number): Room | undefined {
  return ROOMS.find((room) => room.x === x && room.y === y);
}

export function neighbour(room: Room, dir: Direction): Room | undefined {
  const { dx, dy } = OFFSETS[dir];
  return roomAt(room.x + dx, room.y + dy);
}

export function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
