import * as util from 'util';
import * as vscode from 'vscode';
import { Position } from './../common/motion/position';
import { Register, RegisterMode } from '../register/register';
import { TextEditor } from '../textEditor';
import { VimState } from './../state/vimState';
import { configuration } from '../configuration/configuration';
import { dirname } from 'path';
import { exists } from 'fs';
import { logger } from '../util/logger';
import { spawn, ChildProcess } from 'child_process';
import { attach, Neovim } from 'neovim';

export class NeovimWrapper implements vscode.Disposable {
  private process: ChildProcess;
  private nvim: Neovim;

  async run(vimState: VimState, command: string) {
    if (!this.nvim) {
      this.nvim = await this.startNeovim();

      await this.nvim.uiAttach(80, 20, {
        ext_cmdline: false,
        ext_popupmenu: false,
        ext_tabline: false,
        ext_wildmenu: false,
        rgb: false,
      });

      const apiInfo = await this.nvim.apiInfo;
      const version = apiInfo[1].version;
      logger.debug(`Neovim Version: ${version.major}.${version.minor}.${version.patch}`);
    }

    await this.syncVSToVim(vimState);
    command = (':' + command + '\n').replace('<', '<lt>');

    // Clear the previous error and status messages.
    // API does not allow setVvar so do it manually
    await this.nvim.command('let v:errmsg="" | let v:statusmsg=""');

    // Execute the command
    logger.debug(`Neovim: Running ${command}.`);
    await this.nvim.input(command);
    const mode = await this.nvim.mode;
    if (mode.blocking) {
      await this.nvim.input('<esc>');
    }

    // Check if an error occurred
    const errMsg = await this.nvim.getVvar('errmsg');
    let statusBarText = '';
    if (errMsg && errMsg.toString() !== '') {
      statusBarText = errMsg.toString();
    } else {
      // Check to see if a status message was updated
      const statusMsg = await this.nvim.getVvar('statusmsg');
      if (statusMsg && statusMsg.toString() !== '') {
        statusBarText = statusMsg.toString();
      }
    }

    // Sync buffer back to vscode
    await this.syncVimToVs(vimState);

    return statusBarText;
  }

  private async startNeovim() {
    logger.debug('Neovim: Spawning Neovim process...');
    let dir = dirname(vscode.window.activeTextEditor!.document.uri.fsPath);
    if (!(await util.promisify(exists)(dir))) {
      dir = __dirname;
    }
    this.process = spawn(configuration.neovimPath, ['-u', 'NONE', '-i', 'NONE', '-n', '--embed'], {
      cwd: dir,
    });

    this.process.on('error', err => {
      logger.error(`Neovim: Error spawning neovim. Error=${err.message}.`);
      configuration.enableNeovim = false;
    });
    return attach({ proc: this.process });
  }

  // Data flows from VS to Vim
  private async syncVSToVim(vimState: VimState) {
    const buf = await this.nvim.buffer;
    if (configuration.expandtab) {
      await vscode.commands.executeCommand('editor.action.indentationToTabs');
    }

    await this.nvim.setOption('gdefault', configuration.substituteGlobalFlag === true);
    await buf.setLines(TextEditor.getText().split('\n'), {
      start: 0,
      end: -1,
      strictIndexing: true,
    });

    const [rangeStart, rangeEnd] = [
      Position.EarlierOf(vimState.cursorPosition, vimState.cursorStartPosition),
      Position.LaterOf(vimState.cursorPosition, vimState.cursorStartPosition),
    ];
    await this.nvim.callFunction('setpos', [
      '.',
      [0, vimState.cursorPosition.line + 1, vimState.cursorPosition.character, false],
    ]);
    await this.nvim.callFunction('setpos', [
      "'<",
      [0, rangeStart.line + 1, rangeEnd.character, false],
    ]);
    await this.nvim.callFunction('setpos', [
      "'>",
      [0, rangeEnd.line + 1, rangeEnd.character, false],
    ]);
    for (const mark of vimState.historyTracker.getMarks()) {
      await this.nvim.callFunction('setpos', [
        `'${mark.name}`,
        [0, mark.position.line + 1, mark.position.character, false],
      ]);
    }

    // We only copy over " register for now, due to our weird handling of macros.
    let reg = await Register.get(vimState);
    let vsRegTovimReg = [undefined, 'c', 'l', 'b'];
    await this.nvim.callFunction('setreg', [
      '"',
      reg.text as string,
      vsRegTovimReg[vimState.effectiveRegisterMode] as string,
    ]);
  }

  // Data flows from Vim to VS
  private async syncVimToVs(vimState: VimState) {
    const buf = await this.nvim.buffer;
    const lines = await buf.getLines({ start: 0, end: -1, strictIndexing: false });

    // one Windows, lines that went to nvim and back have a '\r' at the end,
    // which causes the issues exhibited in #1914
    const fixedLines =
      process.platform === 'win32' ? lines.map((line, index) => line.replace(/\r$/, '')) : lines;

    await TextEditor.replace(
      new vscode.Range(
        0,
        0,
        TextEditor.getLineCount() - 1,
        TextEditor.getLineMaxColumn(TextEditor.getLineCount() - 1)
      ),
      fixedLines.join('\n')
    );

    logger.debug(`Neovim: ${lines.length} lines in nvim. ${TextEditor.getLineCount()} in editor.`);

    let [row, character] = ((await this.nvim.callFunction('getpos', ['.'])) as Array<number>).slice(
      1,
      3
    );
    vimState.editor.selection = new vscode.Selection(
      new Position(row - 1, character),
      new Position(row - 1, character)
    );

    if (configuration.expandtab) {
      await vscode.commands.executeCommand('editor.action.indentationToSpaces');
    }
    // We're only syncing back the default register for now, due to the way we could
    // be storing macros in registers.
    const vimRegToVsReg = {
      v: RegisterMode.CharacterWise,
      V: RegisterMode.LineWise,
      '\x16': RegisterMode.BlockWise,
    };
    vimState.currentRegisterMode =
      vimRegToVsReg[(await this.nvim.callFunction('getregtype', ['"'])) as string];
    await Register.put((await this.nvim.callFunction('getreg', ['"'])) as string, vimState);
  }

  dispose() {
    if (this.nvim) {
      this.nvim.quit();
    }

    if (this.process) {
      this.process.kill();
    }
  }
}
