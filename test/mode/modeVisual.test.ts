"use strict";

import * as assert from 'assert';
import { ModeHandler } from '../../src/mode/modeHandler';
import { setupWorkspace, cleanUpWorkspace, assertEqualLines, assertEqual } from './../testUtils';
import { ModeName } from '../../src/mode/mode';
import { TextEditor } from '../../src/textEditor';
import { getTestingFunctions } from '../testSimplifier';

suite("Mode Visual", () => {
  let modeHandler: ModeHandler = new ModeHandler();

  let {
    newTest,
    newTestOnly,
  } = getTestingFunctions(modeHandler);

  setup(async () => {
    await setupWorkspace();
    modeHandler = new ModeHandler();
  });

  teardown(cleanUpWorkspace);

  test("can be activated", async () => {
    await modeHandler.handleKeyEvent('v');
    assertEqual(modeHandler.currentMode.name, ModeName.Visual);

    await modeHandler.handleKeyEvent('v');
    assertEqual(modeHandler.currentMode.name, ModeName.Normal);
  });

  test("Can handle w", async () => {
    await modeHandler.handleMultipleKeyEvents("itest test test\ntest\n".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', 'g', 'g',
      'v', 'w'
    ]);

    const sel = TextEditor.getSelection();

    assert.equal(sel.start.character, 0);
    assert.equal(sel.start.line, 0);

    // The input cursor comes BEFORE the block cursor. Try it out, this
    // is how Vim works.
    assert.equal(sel.end.character, 5);
    assert.equal(sel.end.line, 0);
  });

  test("Can handle wd", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'v', 'w', 'd'
    ]);

    assertEqualLines(["wo three"]);
  });

  test("Can handle x", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'v', 'x'
    ]);

    assertEqualLines(["ne two three"]);

    assertEqual(modeHandler.currentMode.name, ModeName.Normal);
  });

  test("Can handle x across a selection", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'v', 'w', 'x'
    ]);

    assertEqualLines(["wo three"]);

    assertEqual(modeHandler.currentMode.name, ModeName.Normal);
  });

  test("Can do vwd in middle of sentence", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three foar".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'l', 'l', 'l', 'l',
      'v', 'w', 'd'
    ]);

    assertEqualLines(["one hree foar"]);
  });

  test("Can do vwd in middle of sentence", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'l', 'l', 'l', 'l',
      'v', 'w', 'd'
    ]);

    assertEqualLines(["one hree"]);
  });

  test("Can do vwd multiple times", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three four".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'v', 'w', 'd',
      'v', 'w', 'd',
      'v', 'w', 'd'
    ]);

    assertEqualLines(["our"]);
  });

  test("handles case where we go from selecting on right side to selecting on left side", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'l', 'l', 'l', 'l',
      'v', 'w', 'b', 'b', 'd'
    ]);

    assertEqualLines(["wo three"]);
  });

  newTest({
      title: "Can handle H key",
      start: ['1', '2', '|3', '4', '5'],
      keysPressed: 'vH',
      end: ['|1', '2', '3', '4', '5']
    });

  test("handles case where we delete over a newline", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two\n\nthree four".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '0', 'k', 'k',
      'v', '}', 'd'
    ]);

    assertEqualLines(["three four"]);
  });

  test("handles change operator", async () => {
    await modeHandler.handleMultipleKeyEvents("ione two three".split(""));
    await modeHandler.handleMultipleKeyEvents([
      '<Esc>', '^',
      'v', 'w', 'c'
    ]);

    assertEqualLines(["wo three"]);
    assertEqual(modeHandler.currentMode.name, ModeName.Insert);
  });

  suite("Vim's EOL handling is weird", () => {

    test("delete through eol", async () => {
      await modeHandler.handleMultipleKeyEvents(
        'ione\ntwo'.split('')
      );

      await modeHandler.handleMultipleKeyEvents([
        '<Esc>',
        '^', 'g', 'g',
        'v', 'l', 'l', 'l',
        'd'
      ]);

      assertEqualLines(["two"]);
    });

    test("join 2 lines by deleting through eol", async () => {
      await modeHandler.handleMultipleKeyEvents(
        'ione\ntwo'.split('')
      );

      await modeHandler.handleMultipleKeyEvents([
        '<Esc>',
        'g', 'g',
        'l', 'v', 'l', 'l',
        'd'
      ]);

      assertEqualLines(["otwo"]);
    });

    test("d$ doesn't delete whole line", async () => {
      await modeHandler.handleMultipleKeyEvents(
        'ione\ntwo'.split('')
      );

      await modeHandler.handleMultipleKeyEvents([
        '<Esc>',
        'g', 'g',
        'd', '$'
      ]);

      assertEqualLines(["", "two"]);
    });

    test("vd$ does delete whole line", async () => {
      await modeHandler.handleMultipleKeyEvents(
        'ione\ntwo'.split('')
      );

      await modeHandler.handleMultipleKeyEvents([
        '<Esc>',
        'g', 'g',
        'v', '$', 'd'
      ]);

      assertEqualLines(["two"]);
    });
  });

  suite("Arrow keys work perfectly in Visual Mode", () => {
    newTest({
      title: "Can handle <up> key",
      start: ['blah', 'duh', '|dur', 'hur'],
      keysPressed: 'v<up>x',
      end: ['blah', '|ur', 'hur']
    });

    newTest({
      title: "Can handle <down> key",
      start: ['blah', 'duh', '|dur', 'hur'],
      keysPressed: 'v<down>x',
      end: ['blah', 'duh', '|ur']
    });

    newTest({
      title: "Can handle <left> key",
      start: ['blah', 'duh', 'd|ur', 'hur'],
      keysPressed: 'v<left>x',
      end: ['blah', 'duh', '|r', 'hur']
    });

    newTest({
      title: "Can handle <right> key",
      start: ['blah', 'duh', '|dur', 'hur'],
      keysPressed: 'v<right>x',
      end: ['blah', 'duh', '|r', 'hur']
    });
  });

  suite("handles aw in visual mode", () => {
    newTest({
      title: "Can handle 'vawd' on word with cursor inside spaces",
      start: ['one   two |  three,   four  '],
      keysPressed: 'vawd',
      end: ['one   two|,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with trailing spaces",
      start: ['one   tw|o   three,   four  '],
      keysPressed: 'vawd',
      end: ['one   |three,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with leading spaces",
      start: ['one   two   th|ree,   four  '],
      keysPressed: 'vawd',
      end: ['one   two|,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with numeric prefix",
      start: ['on|e   two   three,   four  '],
      keysPressed: 'v3awd',
      end: ['|,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with numeric prefix and across lines",
      start: ['one   two   three,   fo|ur  ', 'five  six'],
      keysPressed: 'v2awd',
      end: ['one   two   three,   |six'],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with numeric prefix and across lines, containing words end with `.`",
      start: ['one   two   three,   fo|ur  ', 'five.  six'],
      keysPressed: 'v2awd',
      end: ['one   two   three,   |.  six'],
      endMode: ModeName.Normal
    });
  });

  suite("handles aW in visual mode", () => {
    newTest({
      title: "Can handle 'vaWd' on big word with cursor inside spaces",
      start: ['one   two |  three,   four  '],
      keysPressed: 'vaWd',
      end: ['one   two|   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with trailing spaces",
      start: ['one   tw|o   three,   four  '],
      keysPressed: 'vaWd',
      end: ['one   |three,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with leading spaces",
      start: ['one   two   th|ree,   four  '],
      keysPressed: 'vaWd',
      end: ['one   two   |four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with numeric prefix",
      start: ['on|e   two   three,   four  '],
      keysPressed: 'v3aWd',
      end: ['|four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with numeric prefix and across lines",
      start: ['one   two   three,   fo|ur  ', 'five.  six'],
      keysPressed: 'v2aWd',
      end: ['one   two   three,   |six'],
      endMode: ModeName.Normal
    });
  });

  suite("handles aW in visual mode", () => {
    newTest({
      title: "Can handle 'vaWd' on big word with cursor inside spaces",
      start: ['one   two |  three,   four  '],
      keysPressed: 'vaWd',
      end: ['one   two|   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with trailing spaces",
      start: ['one   tw|o   three,   four  '],
      keysPressed: 'vaWd',
      end: ['one   |three,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with leading spaces",
      start: ['one   two   th|ree,   four  '],
      keysPressed: 'vaWd',
      end: ['one   two   |four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with numeric prefix",
      start: ['on|e   two   three,   four  '],
      keysPressed: 'v3aWd',
      end: ['|four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with numeric prefix and across lines",
      start: ['one   two   three,   fo|ur  ', 'five.  six'],
      keysPressed: 'v2aWd',
      end: ['one   two   three,   |six'],
      endMode: ModeName.Normal
    });
  });

  suite("handles aw in visual mode", () => {
    newTest({
      title: "Can handle 'vawd' on word with cursor inside spaces",
      start: ['one   two |  three,   four  '],
      keysPressed: 'vawd',
      end: ['one   two|,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with trailing spaces",
      start: ['one   tw|o   three,   four  '],
      keysPressed: 'vawd',
      end: ['one   |three,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with leading spaces",
      start: ['one   two   th|ree,   four  '],
      keysPressed: 'vawd',
      end: ['one   two|,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with numeric prefix",
      start: ['on|e   two   three,   four  '],
      keysPressed: 'v3awd',
      end: ['|,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with numeric prefix and across lines",
      start: ['one   two   three,   fo|ur  ', 'five  six'],
      keysPressed: 'v2awd',
      end: ['one   two   three,   |six'],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vawd' on word with numeric prefix and across lines, containing words end with `.`",
      start: ['one   two   three,   fo|ur  ', 'five.  six'],
      keysPressed: 'v2awd',
      end: ['one   two   three,   |.  six'],
      endMode: ModeName.Normal
    });
  });

  suite("handles aW in visual mode", () => {
    newTest({
      title: "Can handle 'vaWd' on big word with cursor inside spaces",
      start: ['one   two |  three,   four  '],
      keysPressed: 'vaWd',
      end: ['one   two|   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with trailing spaces",
      start: ['one   tw|o   three,   four  '],
      keysPressed: 'vaWd',
      end: ['one   |three,   four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with leading spaces",
      start: ['one   two   th|ree,   four  '],
      keysPressed: 'vaWd',
      end: ['one   two   |four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with numeric prefix",
      start: ['on|e   two   three,   four  '],
      keysPressed: 'v3aWd',
      end: ['|four  '],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'vaWd' on word with numeric prefix and across lines",
      start: ['one   two   three,   fo|ur  ', 'five.  six'],
      keysPressed: 'v2aWd',
      end: ['one   two   three,   |six'],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can handle 'Y' in visual mode" ,
      start: ['one', '|two'],
      keysPressed: 'vwYP',
      end: ['one', '|two', 'two'],
      endMode: ModeName.Normal
    });
  });

  suite("handles as in visual mode", () => {
    newTest({
      title: "Select sentence with trailing spaces in visual mode",
      start: ["That's my sec|ret, Captain. I'm always angry."],
      keysPressed: 'vlasd',
      end: ["That's my sec|I'm always angry."],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Select sentence with leading spaces in visual mode",
      start: ["That's my secret, Captain. I'm a|lways angry."],
      keysPressed: 'vhasd',
      end: ["That's my secret, Captain.|ways angry."],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Select multiple sentences in visual mode",
      start: ["That's my secret, Captain. I|'m always angry."],
      keysPressed: 'vhhasd',
      end: ["|m always angry."],
      endMode: ModeName.Normal
    });
  });

  suite("handles is in visual mode", () => {
    newTest({
      title: "Select inner sentence with trailing spaces in visual mode",
      start: ["That's my sec|ret, Captain. I'm always angry."],
      keysPressed: 'vlisd',
      end: ["That's my sec| I'm always angry."],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Select inner sentence with leading spaces in visual mode",
      start: ["That's my secret, Captain. I'm a|lways angry."],
      keysPressed: 'vhisd',
      end: ["That's my secret, Captain. |ways angry."],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Select spaces between sentences in visual mode",
      start: ["That's my secret, Captain.  |  I'm always angry."],
      keysPressed: 'vhisd',
      end: ["That's my secret, Captain.| I'm always angry."],
      endMode: ModeName.Normal
    });
  });

  suite("handles tag blocks in visual mode", () => {
    newTest({
      title: "Can do vit on a matching tag",
      start: ["one <blink>he|llo</blink> two"],
      keysPressed: "vitd",
      end: ["one <blink>|</blink> two"],
      endMode: ModeName.Normal
    });

    newTest({
      title: "Can do vat on a matching tag",
      start: ["one <blink>he|llo</blink> two"],
      keysPressed: "vatd",
      end: ["one | two"],
      endMode: ModeName.Normal
    });
  });
});
