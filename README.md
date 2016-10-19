[![Version](http://vsmarketplacebadge.apphb.com/version/vscodevim.vim.svg)](http://aka.ms/vscodevim)
[![Build Status](https://travis-ci.org/VSCodeVim/Vim.svg?branch=master)](https://travis-ci.org/VSCodeVim/Vim) [![Slack Status](https://vscodevim-slackin.azurewebsites.net/badge.svg)](https://vscodevim-slackin.azurewebsites.net)

# Vim

VSCodeVim is a [Visual Studio Code](https://code.visualstudio.com/) extension that provides Vim keybindings within Visual Studio Code.

Please **[report missing or buggy features on GitHub](https://github.com/VSCodeVim/Vim/issues)**. We've added a lot of functionality, but everyone uses Vim in their own special way, so let us know if we're missing your favourite obscure command. :wink:

We're super friendly people if you want to drop by and talk to us on [Slack](https://vscodevim-slackin.azurewebsites.net).

![Screenshot](images/screen.png)

## Features We Support

* All modes (including visual block mode!)
* Most typical commands, including command combinations like `c3w`, `daw`, `2dd`, etc. (Check the [roadmap](ROADMAP.md) for details.)
* Command remapping (jj to esc)
* Repeating actions with `.`
* Incremental search with `/` and `?` that works like Vim (doesn't just open the search box!)
* Correct undo/redo state
* Marks
* Vim Options
* Multiple Cursor mode (allows multiple simultaneous cursors to receive Vim commands. It's like macros, but in real time. Allows `/` search, has independent clipboards for each cursor, etc.)

## Roadmap

See our [Github Milestone page](https://github.com/VSCodeVim/Vim/milestones) for an idea of what we plan to implement next.

## Install

Install the extension through the [VS Code Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery).

## Configure

Due to overlap between VS Code and Vim, options are loaded slightly different from native Vim. The option loading sequence is

1. `:set {option}` on the fly
2. [TODO] .vimrc.
3. `vim.{option}` from user settings or workspace settings.
4. VSCode configuration
5. VSCodeVim flavored Vim option default values

## Multi-Cursor Mode

Multi-Cursor mode is currently in beta. Please report things you expected to work but didn't [to our feedback thread.](https://github.com/VSCodeVim/Vim/issues/824)

#### Getting into multi-cursor mode

You can enter multi-cursor mode by:

* Pressing cmd-d on OSX.
* Runing "Add Cursor Above/Below" or the shortcut on any platform.
* Pressing `gc`, a new shortcut we added which is equivalent to cmd-d on OSX or ctrl-d on Windows. (It adds another cursor at the next word that matches the word the cursor is currently on.)

#### Doing stuff

Now that you have multiple cursors, you should be able to use Vim commands as you see fit. Most of them should work. There is a list of things I know of which don't [here](https://github.com/VSCodeVim/Vim/pull/587). If you find yourself wanting one of these, please [add it to our feedback thread.](https://github.com/VSCodeVim/Vim/issues/824)

Each cursor has its own clipboard.

Pressing Escape in Multi-Cursor Visual Mode will bring you to Multi-Cursor Normal mode. Pressing it again will return you to Normal mode.

## Supported Options

Vim options can be added to your user or workspace settings (open the Command Pallete and search for "User Settings" or "Workspace Settings"). Changes require restarting of VSCode to take effect.

The following is a subset of the supported configurations; the full list is described in [package.json](https://github.com/VSCodeVim/Vim/blob/master/package.json#L175):

* insertModeKeyBindings/otherModesKeyBindings
  * Keybinding overrides to use for insert and other (non-insert) modes
  * *Example:* Bind `jj` to `<Esc>` while in insert mode

    ```
      "vim.insertModeKeyBindings": [
           {
               "before": ["j", "j"],
               "after": ["<Esc>"]
           }
      ]
    ```

    Similarly for `otherModesKeyBindings`, bind `jj` to `<Esc>` for modes which are not insert mode

    ```
      "vim.otherModesKeyBindings": [
           {
               "before": ["j", "j"],
               "after": ["<Esc>"]
           }
      ]
    ```

* insertModeKeyBindingsNonRecursive/otherModesKeyBindingsNonRecursive
  * Non-recursive keybinding overrides to use for insert and other (non-insert) modes (similar to `:noremap`)
  * *Example:* Bind `j` to `gj`. Notice that if you attempted this binding normally, the j in gj would be expanded into gj, on and on forever. Stop this recursive expansion using insertModeKeyBindingsNonRecursive and/or otherModesKeyBindingNonRecursive.

    ```
    "vim.otherModesKeyBindingsNonRecursive": [
    {
        "before": ["j"],
        "after": ["g", "j"]
    }]
    ```

* useCtrlKeys
  * Enable Vim ctrl keys overriding common VS Code operations (eg. copy, paste, find, etc). Setting this option to true will enable:
    * `ctrl+c`, `ctrl+[` => `<Esc>`
    * `ctrl+f` => Page Forward
    * `ctrl+v` => Visual Block Mode
    * etc.
  * Type: Boolean (Default: `false`)
  * *Example:*

    ```
    "vim.useCtrlKeys": true
    ```

* useSystemClipboard
  * Enable yanking to the system clipboard by default
  * Type: Boolean (Default: `false`)
  * Note: Linux users must have xclip installed

* useSolidBlockCursor
  * Use a non-blinking block cursor
  * Type: Boolean (Default: `false`)

* ignorecase
  * Ignore case in search patterns
  * Type: Boolean (Default: `true`)

* smartcase
  * Override the 'ignorecase' option if the search pattern contains upper case characters
  * Type: Boolean (Default: `true`)

* hlsearch
  * When there is a previous search pattern, highlight all its matches
  * Type: Boolean (Default: `false`)

* autoindent
  * Copy indent from current line when starting a new line
  * Type: Boolean (Default: `true`)

## F.A.Q.

#### `j`, `k` and others don't repeat when I hold them down.

On OS X, open Terminal and run the following command:

```
defaults write com.microsoft.VSCode ApplePressAndHoldEnabled -bool false         // For VS Code
defaults write com.microsoft.VSCodeInsiders ApplePressAndHoldEnabled -bool false // For VS Code Insider
```

## Contributing

This project is maintained by a group of awesome [contributors](https://github.com/VSCodeVim/Vim/graphs/contributors) and contributions are extremely welcome :heart:. If you are having trouble thinking of how you can help, check out our [roadmap](ROADMAP.md). For a quick tutorial on how to get started, see our [contributing guide](/.github/CONTRIBUTING.md).

Thanks to [Kevin Coleman](http://kevincoleman.io), who created our awesome logo! 

## Changelog

Please see our [list of recent releases and features added.](https://github.com/VSCodeVim/Vim/releases)
