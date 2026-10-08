import { JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IDocumentManager } from '@jupyterlab/docmanager';

/**
 * Everything a command needs from the plugin's activate() call.
 */
export interface IM269Context {
  app: JupyterFrontEnd;
  settings: ISettingRegistry.ISettings;
  notebookTracker: INotebookTracker;
  docManager: IDocumentManager;
}
