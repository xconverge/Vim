"use strict";

import {setupWorkspace, cleanUpWorkspace, assertEqualLines, assertEqual} from './../testUtils';
import {ModeName} from '../../src/mode/mode';
import {TextEditor} from '../../src/textEditor';
import {ModeHandler} from "../../src/mode/modeHandler";

suite("Mode Insert", () => {
    let modeHandler: ModeHandler;

    setup(async () => {
        await setupWorkspace();

        modeHandler = new ModeHandler();
    });

    teardown(cleanUpWorkspace);

    test("can be activated", async () => {
        let activationKeys = ['o', 'I', 'i', 'O', 'a', 'A'];

        for (let key of activationKeys) {
            await modeHandler.handleKeyEvent(key);
            assertEqual(modeHandler.currentMode.name, ModeName.Insert);

            await modeHandler.handleKeyEvent('<Esc>');
        }
    });

    test("can handle key events", async () => {
        await modeHandler.handleMultipleKeyEvents(['i', '!']);

        return assertEqualLines(["!"]);
    });

    test("<Esc> should change cursor position", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            'h', 'e', 'l', 'l', 'o',
            '<Esc>'
        ]);

        assertEqual(TextEditor.getSelection().start.character, 4, "<Esc> moved cursor position.");
    });

    test("", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            't', 'e', 'x', 't',
            '<Esc>',
            'o'
        ]);

        return assertEqualLines(["text", ""]);
    });

    test("Can handle 'O'", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            't', 'e', 'x', 't',
            '<Esc>',
            'O'
        ]);

        return assertEqualLines(["", "text"]);
    });

    test("Can handle 'i'", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            't', 'e', 'x', 't', 't', 'e', 'x', 't', // insert 'texttext'
            '<Esc>',
            '^', 'l', 'l', 'l', 'l',                // move to the 4th character
            'i',
            '!'                                     // insert a !
        ]);

        assertEqualLines(["text!text"]);
    });

    test("Can handle 'I'", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            't', 'e', 'x', 't',
            '<Esc>',
            '^', 'l', 'l', 'l',
            'I',
            '!',
        ]);

        assertEqualLines(["!text"]);
    });

    test("Can handle 'a'", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            't', 'e', 'x', 't', 't', 'e', 'x', 't', // insert 'texttext'
            '<Esc>',
            '^', 'l', 'l', 'l', 'l',                // move to the 4th character
            'a',
            '!'                                     // append a !
        ]);

        assertEqualLines(["textt!ext"]);
    });

    test("Can handle 'A'", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            't', 'e', 'x', 't',
            '<Esc>',
            '^',
            'A',
            '!',
        ]);

        assertEqualLines(["text!"]);
    });

    test("Can handle '<C-w>'", async () => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            't', 'e', 'x', 't', ' ', 't', 'e', 'x', 't',
            '<C-w>',
        ]);

        assertEqualLines(["text "]);
    });

    test("Correctly places the cursor after deleting the previous line break", async() => {
        await modeHandler.handleMultipleKeyEvents([
            'i',
            'o', 'n', 'e', '\n', 't', 'w', 'o',
            '<left>', '<left>', '<left>',
            '<BS>'
        ]);

        assertEqualLines(["onetwo"]);

        assertEqual(TextEditor.getSelection().start.character, 3, "<BS> moved cursor to correct position");
    });
});
