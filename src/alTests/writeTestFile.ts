import { showDialog, Dialog, InputDialog } from '@jupyterlab/apputils';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IM269Context } from '../context';
import { getSetting } from '../settings';
import { decrypt } from './decrypt';

const KEY_LENGTH = 16;

/**
 * Return the stored decryption key, asking for (and saving) one if it is
 * missing or the wrong length. Returns null if the user cancels.
 */
export async function getDecryptKey(settings: ISettingRegistry.ISettings): Promise<string | null> {
  const stored = getSetting(settings, 'decrypt_key', '');
  if (stored.length === KEY_LENGTH) {
    return stored;
  }
  const result = await InputDialog.getText({
    title: 'Decryption Key Required',
    label: `Enter ${KEY_LENGTH}-character decryption key:`,
  });
  if (!result.button.accept || !result.value) {
    return null;
  }
  if (result.value.length !== KEY_LENGTH) {
    await showDialog({
      title: 'Invalid Key',
      body: `Invalid key. Must be exactly ${KEY_LENGTH} characters.`,
      buttons: [Dialog.okButton()]
    });
    return null;
  }
  await settings.set('decrypt_key', result.value);
  return result.value;
}

// Path of al_tests.py relative to the Jupyter root
export function alTestsFilePath(settings: ISettingRegistry.ISettings): string {
  const testsLocation = getSetting(settings, 'tests_location', '');
  return testsLocation ? `${testsLocation}/al_tests.py` : 'al_tests.py';
}

// Path of al_tests.py relative to the given notebook, for %run
export function alTestsRunPath(settings: ISettingRegistry.ISettings, notebookPath: string): string {
  const upLevels = notebookPath.split("/").length - 1;
  const relPathToRoot = Array(upLevels).fill("..").join("/");
  const filePath = alTestsFilePath(settings);
  return relPathToRoot ? `${relPathToRoot}/${filePath}` : filePath;
}

/**
 * Decrypt the AL tests and write al_tests.py to the tests location.
 * Errors are always reported; success is only reported if showSuccess is set.
 * Returns true if the file was written.
 */
export async function writeAlTestFile(ctx: IM269Context, showSuccess: boolean): Promise<boolean> {
  const decryptKey = await getDecryptKey(ctx.settings);
  if (!decryptKey) {
    return false;
  }
  let fileContent: string;
  try {
    fileContent = await decrypt(decryptKey);
  } catch (err) {
    await showDialog({
      title: 'Decryption Failed',
      body: 'Could not decrypt the test file. Check your decryption key.',
      buttons: [Dialog.okButton()]
    });
    return false;
  }
  const filePath = alTestsFilePath(ctx.settings);
  try {
    await ctx.app.serviceManager.contents.save(filePath, {
      type: 'file',
      format: 'text',
      content: fileContent
    });
  } catch (err) {
    await showDialog({
      title: 'Write Failed',
      body: `Could not write file to "${filePath}": ${err instanceof Error ? err.message : err}`,
      buttons: [Dialog.okButton()]
    });
    return false;
  }
  if (showSuccess) {
    await showDialog({
      title: 'AL Test File Written',
      body: `Successfully wrote al_tests.py to: ${filePath}`,
      buttons: [Dialog.okButton()]
    });
  }
  return true;
}
