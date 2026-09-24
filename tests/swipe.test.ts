import assert from "node:assert/strict";
import { test } from "node:test";
import { swipeDirection } from "../app/swipe.ts";

// dx and dy are how far the finger moved in screen pixels: right and down are positive.

test("a swipe points the way the player goes", () => {
  assert.equal(swipeDirection(0, -60), "up");
  assert.equal(swipeDirection(5, 80), "down");
  assert.equal(swipeDirection(-70, 10), "left");
  assert.equal(swipeDirection(90, -20), "right");
});

test("a swipe shorter than 40 pixels is ignored", () => {
  assert.equal(swipeDirection(0, 0), undefined);
  assert.equal(swipeDirection(0, -39), undefined);
  assert.equal(swipeDirection(0, -40), "up");
});

test("a swipe too close to diagonal is ignored", () => {
  assert.equal(swipeDirection(60, -60), undefined);
  assert.equal(swipeDirection(60, -31), undefined);
  assert.equal(swipeDirection(60, -30), "right");
});
