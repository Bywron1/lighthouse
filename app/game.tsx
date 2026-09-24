"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { capitalise, type Direction, DIRECTIONS, KEYS, move, neighbour, ROOMS, START_STATE } from "./rooms";
import { SceneDefs, Scenes } from "./scenes";
import { swipeDirection } from "./swipe";

// Matches the CSS opacity transition on [data-fade]; skipped for reduced motion.
function fadeMs(): number {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250;
}

export default function Game() {
  // `game.room` drives the page colours and the map, which change straight away
  // so they blend during the fade. `shown` is the room's name, art, description
  // and exits, which swap while faded out.
  const [game, setGame] = useState(START_STATE);
  const [shown, setShown] = useState(START_STATE.room);
  const [fading, setFading] = useState(false);
  const [message, setMessage] = useState("");
  const fadeTimer = useRef<number | undefined>(undefined);
  // Where the current touch on the picture started.
  const swipeStart = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    document.body.dataset.room = game.room.art;
  }, [game.room]);

  // Every way of moving (keys, swipes and buttons) comes through here.
  const go = useCallback((dir: Direction) => {
    const result = move(game, DIRECTIONS.indexOf(dir));
    setMessage(result.message);
    if (result.state.room === game.room) return;

    const next = result.state.room;
    setGame(result.state);
    setFading(true);
    window.clearTimeout(fadeTimer.current);
    fadeTimer.current = window.setTimeout(() => {
      setShown(next);
      setFading(false);
    }, fadeMs());
  }, [game]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const dir = KEYS[event.key];
      if (!dir) return;
      event.preventDefault();
      go(dir);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go]);

  useEffect(() => () => window.clearTimeout(fadeTimer.current), []);

  // Swipes on the picture move the player. Mouse drags are ignored.
  function onPointerDown(event: React.PointerEvent) {
    if (event.pointerType === "mouse") return;
    swipeStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: React.PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dir = swipeDirection(event.clientX - start.x, event.clientY - start.y);
    if (dir) go(dir);
  }

  const exits = DIRECTIONS.filter((dir) => neighbour(shown, dir)).map(capitalise);

  return (
    <main className={fading ? "is-fading" : undefined}>
      <h1 data-fade="">{shown.name}</h1>

      <SceneDefs />

      <figure
        className="scene"
        data-fade=""
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
      >
        <Scenes art={shown.art} />
      </figure>

      <p data-fade="">{shown.description}</p>
      <div className="status">
        <p className="exits" data-fade="">
          You can go: <strong>{exits.join(", ")}</strong>
        </p>
        {/* Tap buttons for touch screens, where there are no arrow keys. */}
        <div className="pad" role="group" aria-label="Move">
          {DIRECTIONS.map((dir) => (
            <button key={dir} type="button" className={`pad-${dir}`} aria-label={`Go ${dir}`} onClick={() => go(dir)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 15 L12 9 L18 15"/>
              </svg>
            </button>
          ))}
        </div>
        <div className="map" role="group" aria-label="Map of the lighthouse">
          {ROOMS.map((room) => (
            <div
              key={room.art}
              className="map-cell"
              title={room.name}
              style={{ gridColumn: String(room.x + 1), gridRow: String(room.y + 1) }}
              aria-current={room === game.room ? "location" : undefined}
            >
              {capitalise(room.art)}
            </div>
          ))}
        </div>
      </div>
      <p className="message" aria-live="polite">
        {message}
      </p>
      <p className="hint">
        <span className="hint-keys">Use the arrow keys to move.</span>
        <span className="hint-touch">Swipe the picture or tap the arrows to move.</span>
      </p>
    </main>
  );
}
