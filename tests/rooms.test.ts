import assert from "node:assert/strict";
import { test } from "node:test";
import { move, START_STATE } from "../app/rooms.ts";

// Directions are numbers: 0 up, 1 down, 2 left, 3 right.
const UP = 0;
const LEFT = 2;
const RIGHT = 3;

test("the Lamp Room door is locked at the start", () => {
  const result = move(START_STATE, UP);

  assert.equal(result.state.room.name, "Rocks");
  assert.equal(result.message, "The lamp room door is locked.");
});

test("the Lamp Room door opens after visiting the Keeper's Kitchen", () => {
  let state = move(START_STATE, LEFT).state;
  assert.equal(state.room.name, "Keeper's Kitchen");
  state = move(state, RIGHT).state;
  assert.equal(state.room.name, "Rocks");

  const result = move(state, UP);

  assert.equal(result.state.room.name, "Lamp Room");
  assert.equal(result.message, "");
});

test("a number that isn't a direction doesn't move the player", () => {
  const result = move(START_STATE, 7);

  assert.equal(result.state, START_STATE);
  assert.equal(result.message, "You can't go that way.");
});
