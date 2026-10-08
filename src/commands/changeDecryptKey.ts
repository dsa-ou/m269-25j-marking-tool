import { InputDialog } from '@jupyterlab/apputils';
import { getSetting } from '../settings';
import { IM269Context } from '../context';
import { change_decrypt_key_command } from '../commandIds';

export function registerChangeDecryptKey(ctx: IM269Context): void {
  const { app, settings } = ctx;
  app.commands.addCommand(change_decrypt_key_command, {
    label: 'M269 Change Decrypt Key',
    caption: 'M269 Change Decrypt Key',
    execute: async () => {
      const current = getSetting(settings, 'decrypt_key', '');
      const result = await InputDialog.getText({
        title: 'Change Decrypt Key',
        label: 'Enter decryption key:',
        text: current
      });
      if (!result.button.accept || result.value === null) {
        return;
      }
      await settings.set('decrypt_key', result.value);
    }
  });
  // End change decrypt key command
}
