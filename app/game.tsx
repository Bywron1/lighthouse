"use client";

import { useEffect, useRef, useState } from "react";
import { capitalise, DIRECTIONS, KEYS, neighbour, ROOMS, START_ROOM } from "./rooms";
import { SceneDefs, Scenes } from "./scenes";

// Matches the CSS opacity transition on [data-fade]; skipped for reduced motion.
function fadeMs(): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250;
}

export default function Game() {
  // `current` drives the page colours and the map, which change straight away
  // so they blend during the fade. `shown` is the room's name, art, description
  // and exits, which swap while faded out.
  const [current, setCurrent] = useState(START_ROOM);
  const [shown, setShown] = useState(START_ROOM);
  const [fading, setFading] = useState(false);
  const [message, setMessage] = useState("");
  const fadeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    document.body.dataset.room = current.art;
  }, [current]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const dir = KEYS[event.key];
      if (!dir) return;
      event.preventDefault();

      const next = neighbour(current, dir);
      if (!next) {
        setMessage(current.blocked[dir] ?? "You can't go that way.");
        return;
      }
      setCurrent(next);
      setMessage("");
      setFading(true);
      window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => {
        setShown(next);
        setFading(false);
      }, fadeMs());
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [current]);

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  const exits = DIRECTIONS.filter((dir) => neighbour(shown, dir)).map(capitalise);

  return (
    <main className={fading ? "is-fading" : undefined}>
      <h1 data-fade="">{shown.name}</h1>

      <SceneDefs />

      <figure className="scene" data-fade="">
        <Scenes art={shown.art} />
      </figure>

      <p data-fade="">{shown.description}</p>
      <div className="status">
        <p className="exits" data-fade="">
          You can go: <strong>{exits.join(", ")}</strong>
        </p>
        <div className="map" role="group" aria-label="Map of the lighthouse">
          {ROOMS.map((room) => (
            <div
              key={room.art}
              className="map-cell"
              title={room.name}
              style={{ gridColumn: String(room.x + 1), gridRow: String(room.y + 1) }}
              aria-current={room === current ? "location" : undefined}
            >
              {capitalise(room.art)}
            </div>
          ))}
        </div>
      </div>
      <p className="message" aria-live="polite">
        {message}
      </p>
      <p className="hint">Use the arrow keys to move.</p>
    </main>
  );
}
