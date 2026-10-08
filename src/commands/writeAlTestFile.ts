import { IM269Context } from '../context';
import { write_al_test_file_command, force_write_al_test_file_command } from '../commandIds';
import { writeAlTestFile } from '../alTests/writeTestFile';

export function registerWriteAlTestFile(ctx: IM269Context): void {
  const { app } = ctx;
  app.commands.addCommand(write_al_test_file_command, {
    label: 'M269 Write AL Test File',
    caption: 'M269 Write AL Test File',
    execute: async () => {
      await writeAlTestFile(ctx, true);
    }
  });

  // As above, but without the success dialog
  app.commands.addCommand(force_write_al_test_file_command, {
    label: 'M269 Force Write AL Tests',
    caption: 'M269 Force Write AL Tests',
    execute: async () => {
      await writeAlTestFile(ctx, false);
    }
  });
}
