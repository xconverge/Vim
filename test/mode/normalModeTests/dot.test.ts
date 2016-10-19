"use strict";

import { setupWorkspace, cleanUpWorkspace, setTextEditorOptions } from './../../testUtils';
import { ModeHandler } from '../../../src/mode/modeHandler';
import { getTestingFunctions } from '../../testSimplifier';

suite("Dot Operator", () => {
    let modeHandler: ModeHandler = new ModeHandler();

    let {
        newTest,
        newTestOnly
    } = getTestingFunctions(modeHandler);

    setup(async () => {
        await setupWorkspace();
        setTextEditorOptions(4, false);
    });

    teardown(cleanUpWorkspace);

    newTest({
      title: "Can repeat '~' with <num>",
      start: ['|teXt'],
      keysPressed: '4~',
      end: ['TEx|T']
    });

    newTest({
      title: "Can repeat '~' with dot",
      start: ['|teXt'],
      keysPressed: '~...',
      end: ['TEx|T']
    });

    newTest({
      title: "Can repeat 'x'",
      start: ['|text'],
      keysPressed: 'x.',
      end: ['|xt']
    });

    newTest({
      title: "Can repeat 'J'",
      start: ['|one', 'two', 'three'],
      keysPressed: 'J.',
      end: ['one two| three']
    });

    newTest({
      title: "Can handle dot with A",
      start: ['|one', 'two', 'three'],
      keysPressed: 'A!<Esc>j.j.',
      end: ['one!', 'two!', 'three|!']
    });

    newTest({
      title: "Can handle dot with I",
      start: ['on|e', 'two', 'three'],
      keysPressed: 'I!<Esc>j.j.',
      end: ['!one', '!two', '|!three']
    });

    newTest({
      title: "Can repeat actions that require selections",
      start: ['on|e', 'two'],
      keysPressed: 'Vj>.',
      end: ['\t\t|one', '\t\ttwo']
    });
});

suite("Repeat content change", () => {
  let modeHandler: ModeHandler = new ModeHandler();

  let {
    newTest,
    newTestOnly
  } = getTestingFunctions(modeHandler);

  setup(async () => {
    await setupWorkspace();
    setTextEditorOptions(4, false);
  });

  teardown(cleanUpWorkspace);

  newTest({
    title: "Can repeat '<C-t>'",
    start: ['on|e', 'two'],
    keysPressed: 'a<C-t><Esc>j.',
    end: ['\tone', '\ttw|o']
  });

  newTest({
    title: "Can repeat insert change and '<C-t>'",
    start: ['on|e', 'two'],
    keysPressed: 'a<C-t>b<Esc>j.',
    end: ['\toneb', '\ttwo|b']
  });

  newTest({
    title: "Can repeat change by `<C-a>`",
    start: ['on|e', 'two'],
    keysPressed: 'a<C-t>b<Esc>ja<C-a><Esc>',
    end: ['\toneb', '\ttwo|b']
  });

  newTest({
    title: "Only one arrow key can be repeated in Insert Mode",
    start: ['on|e', 'two'],
    keysPressed: 'a<left><left>b<Esc>j$.',
    end: ['obne', 'tw|bo']
  });

  newTest({
    title: "Cached content change will be cleared by arrow keys",
    start: ['on|e', 'two'],
    keysPressed: 'a<C-t>b<left>c<Esc>j.',
    end: ['\tonecb', 'tw|co']
  });
});