import { showDialog, Dialog, InputDialog } from '@jupyterlab/apputils';
import { getSetting } from '../settings';
import { IM269Context } from '../context';
import { set_tests_location_command } from '../commandIds';

export function registerSetTestsLocation(ctx: IM269Context): void {
  const { app, settings } = ctx;
  // Set tests location command
  app.commands.addCommand(set_tests_location_command, {
    label: 'M269 Set Tests Location',
    caption: 'M269 Set Tests Location',
    execute: async () => {
      const current = getSetting(settings, 'tests_location', '');
      const result = await InputDialog.getText({
        title: 'Set Tests Location',
        label: 'Enter a readable and writable directory path:',
        placeholder: '/path/to/tests',
        text: current
      });
      if (!result.button.accept || result.value === null) {
        return;
      }
      const path = result.value.trim();
      if (!path) {
        await showDialog({ title: 'Invalid Path', body: 'Path cannot be empty.', buttons: [Dialog.okButton()] });
        return;
      }
      // Validate readable: try to get the directory
      const contents = app.serviceManager.contents;
      try {
        const item = await contents.get(path, { content: false });
        if (item.type !== 'directory') {
          await showDialog({ title: 'Invalid Path', body: `"${path}" is not a directory.`, buttons: [Dialog.okButton()] });
          return;
        }
      } catch {
        await showDialog({ title: 'Invalid Path', body: `Cannot read "${path}". Check the path exists and is accessible.`, buttons: [Dialog.okButton()] });
        return;
      }
      // Validate writable: try to save and delete a temp file
      const tmpPath = path.replace(/\/$/, '') + '/m269_write_test.tmp';
      try {
        await contents.save(tmpPath, { type: 'file', format: 'text', content: '' });
        await contents.delete(tmpPath);
      } catch {
        await showDialog({ title: 'Invalid Path', body: `"${path}" does not appear to be writable.`, buttons: [Dialog.okButton()] });
        return;
      }
      await settings.set('tests_location', path);
      await showDialog({ title: 'Tests Location Saved', body: `Tests location set to: ${path}`, buttons: [Dialog.okButton()] });
    }
  });
  // End set tests location command
}
