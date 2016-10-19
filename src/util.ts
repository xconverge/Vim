"use strict";

import * as vscode from 'vscode';
import { Range } from './motion/range';
import { Position } from './motion/position';

export async function showInfo(message : string): Promise<{}> {
  return vscode.window.showInformationMessage("Vim: " + message);
}

export async function showError(message : string): Promise<{}> {
  return vscode.window.showErrorMessage("Vim: " + message);
}

/**
 * This is certainly quite janky! The problem we're trying to solve
 * is that writing editor.selection = new Position() won't immediately
 * update the position of the cursor. So we have to wait!
 */
export async function waitForCursorUpdatesToHappen(): Promise<void> {
  // TODO - dispose!

  await new Promise((resolve, reject) => {
    setTimeout(resolve, 100);
    vscode.window.onDidChangeTextEditorSelection(x => {
      resolve();
    });
  });
}

export async function allowVSCodeToPropagateCursorUpdatesAndReturnThem(): Promise<Range[]> {
  await waitForCursorUpdatesToHappen();

  return vscode.window.activeTextEditor.selections.map(x =>
    new Range(Position.FromVSCodePosition(x.start), Position.FromVSCodePosition(x.end)));
}

export async function wait(time: number): Promise<void> {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}
