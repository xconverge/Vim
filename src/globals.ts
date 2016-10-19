/**
 * globals.ts hold some globals used throughout the extension
 */

export class Globals {
  // true for running tests, false during regular runtime
  public static isTesting = false;

  public static modeHandlerForTesting: any = undefined;

  public static WhitespaceRegExp = new RegExp("^ *$");
}