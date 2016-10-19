"use strict";

import * as assert from 'assert';
import { AngleBracketNotation } from '../src/notation';

suite("Notation", () => {
  test("Normalize", () => {
    let testCases = {
      '<cTrL+w>': '<C-w>',
      'cTrL+x': '<C-x>',
      'CtRl+y': '<C-y>',
      'c-z': '<C-z>',
    };

    for (const test in testCases) {
      if (testCases.hasOwnProperty(test)) {
        let expected = testCases[test];

        let actual = AngleBracketNotation.Normalize(test);
        assert.equal(actual, expected);
      }
    }
  });
});