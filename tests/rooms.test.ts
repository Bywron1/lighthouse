import assert from "node:assert/strict";
import { test } from "node:test";
import { move, START_STATE } from "../app/rooms.ts";

test("the Lamp Room door is locked at the start", () => {
  const result = move(START_STATE, "up");

  assert.equal(result.state.room.name, "Rocks");
  assert.equal(result.message, "The lamp room door is locked.");
});

test("the Lamp Room door opens after visiting the Keeper's Kitchen", () => {
  let state = move(START_STATE, "left").state;
  assert.equal(state.room.name, "Keeper's Kitchen");
  state = move(state, "right").state;
  assert.equal(state.room.name, "Rocks");

  const result = move(state, "up");

  assert.equal(result.state.room.name, "Lamp Room");
  assert.equal(result.message, "");
});
