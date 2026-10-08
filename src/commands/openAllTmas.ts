import { PageConfig } from '@jupyterlab/coreutils';
import { walkDir } from '../utils/files';
import { ensurePopupsAllowed } from '../utils/popups';
import { IM269Context } from '../context';
import { open_all_tmas } from '../commandIds';

export function registerOpenAllTmas(ctx: IM269Context): void {
  const { app } = ctx;
  // Open all TMAs
  app.commands.addCommand(open_all_tmas, {
          label: 'M269 Open All TMAs',
    caption: 'M269 Open All TMAs',
    
    execute: async (args: any) => {
      // Ask for popup permission (or instructions if blocked)
      const ok = await ensurePopupsAllowed();
      if (!ok) return; // user cancelled
      //alert('OK');
      const contents = app.serviceManager.contents;
      // 1) collect all notebooks from the Jupyter root
      let notebooks = await walkDir(contents, ''); // '' = root

      notebooks = notebooks.filter(path => !path.includes('-UNMARKED'));

      // DEBUG
      const baseUrl = PageConfig.getBaseUrl();
      console.log('OPEN ALL DEBUGGING START');
      for (const path of notebooks) {
        const url = baseUrl + 'lab/tree/' + encodeURIComponent(path);
        console.log('>> '+url);
      }
      console.log('OPEN ALL DEBUGGING END');


      // END DEBUG

      // (optional) sanity check so you don't open hundreds at once
      if (notebooks.length > 20) {
        const ok = window.confirm(
          `Found ${notebooks.length} notebooks. Open them all in new tabs?`
        );
        if (!ok) return;
      }
      
      // 2) open each notebook in a new browser tab
      //const baseUrl = PageConfig.getBaseUrl();
      for (const path of notebooks) {
        const url = baseUrl + 'lab/tree/' + encodeURIComponent(path);
        window.open(url, '_blank');
      }

      alert(`Opened ${notebooks.length} notebooks in new tabs.\mIf they didn't open, enable popups for this site and try again.`);   
    }
  });
}
