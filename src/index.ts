import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Menu } from '@lumino/widgets';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IMainMenu } from '@jupyterlab/mainmenu';

import {
  prep_command,
  colourise_command,
  prep_for_students,
  al_tests_command,
  open_all_tmas,
  finish_marking,
  set_tests_location_command,
  change_decrypt_key_command,
  write_al_test_file_command,
  force_write_al_test_file_command
} from './commandIds';
import { IM269Context } from './context';
import { injectCellStyles } from './styles';
import { registerPrep } from './commands/prep';
import { registerFinishMarking } from './commands/finishMarking';
import { registerColourise } from './commands/colourise';
import { registerPrepForStudents } from './commands/prepForStudents';
import { registerAlTests } from './commands/alTests';
import { registerOpenAllTmas } from './commands/openAllTmas';
import { registerSetTestsLocation } from './commands/setTestsLocation';
import { registerChangeDecryptKey } from './commands/changeDecryptKey';
import { registerWriteAlTestFile } from './commands/writeAlTestFile';

export { decrypt } from './alTests/decrypt';

/**
 * Initialization data for the m269-25j-marking-tool extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'm269-25j-marking-tool:plugin',
  description: 'A tutor marking tool for M269 in the 25J presentation',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker, ISettingRegistry, IDocumentManager, IMainMenu as any],
  activate: async (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    notebookTracker: INotebookTracker,
    settingRegistry: ISettingRegistry,
    docManager: IDocumentManager,
    mainMenu: IMainMenu
  ) => {
    console.log('JupyterLab extension m269-25j-marking-tool is activated! hurrah');
    console.log('Loading settings registry');
    const settings = await settingRegistry.load('m269-25j-marking-tool:plugin');
    injectCellStyles(settings);

    const ctx: IM269Context = { app, settings, notebookTracker, docManager };
    registerPrep(ctx);
    registerFinishMarking(ctx);
    registerColourise(ctx);
    registerPrepForStudents(ctx);
    registerAlTests(ctx);
    registerOpenAllTmas(ctx);
    registerSetTestsLocation(ctx);
    registerChangeDecryptKey(ctx);
    registerWriteAlTestFile(ctx);

    const category = 'M269-25j';
    // Add commands to pallette
    palette.addItem({ command: prep_command, category, args: { origin: 'from palette' } });
    palette.addItem({ command: colourise_command, category, args: { origin: 'from palette' } });
    palette.addItem({ command: prep_for_students, category, args: { origin: 'from palette' } });
    palette.addItem({ command: al_tests_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: open_all_tmas, category, args: {origin: 'from palette' }});
    palette.addItem({ command: finish_marking, category, args: {origin: 'from palette' }});
    palette.addItem({ command: set_tests_location_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: change_decrypt_key_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: write_al_test_file_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: force_write_al_test_file_command, category, args: {origin: 'from palette' }});

    // Add M269 menu to menubar
    const menu = new Menu({ commands: app.commands });
    menu.title.label = 'M269';
    menu.addItem({ command: prep_command });
    menu.addItem({ command: colourise_command });
    menu.addItem({ command: finish_marking });
    mainMenu.addMenu(menu as any, true, { rank: 1000 });
  }
};

export default plugin;
