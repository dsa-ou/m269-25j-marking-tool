import { showDialog, Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

export async function ensurePopupsAllowed(): Promise<boolean> {
  // 1) Try to open a harmless placeholder immediately (sync).
  // If it returns null, the browser blocked it.
  const testWin = window.open('about:blank', '_blank');

  if (!testWin) {
    // 2) Build site/origin string for instructions
    //const baseUrl = PageConfig.getBaseUrl();          // e.g. "/user/olih/lab"
    const origin  = window.location.origin;           // e.g. "https://yourhub.example.org"
    //const site    = `${origin}${baseUrl}`.replace(/\/lab\/?$/, ''); // hub root-ish

    const body = document.createElement('div');
    body.innerHTML = `
      <p><b>Pop-ups are blocked</b> for <code>${origin}</code>. To open multiple notebooks automatically, please allow pop-ups for this site, then click <b>Try again</b>.</p>
      <details open>
        <summary><b>How to allow pop-ups</b></summary>
        <ul style="margin-top:0.5em">
          <li><b>Check your address bar:</b> There may be an option to whitelist popups.</li>
          <li><b>Chrome / Edge (Chromium):</b> Click the icon to left of address bar → <i>Site settings</i> → set <i>Pop-ups and redirects</i> to <b>Allow</b> for <code>${origin}</code>. Then close the tab to return.</li>
          <li><b>Firefox:</b> Preferences → <i>Privacy &amp; Security</i> → <i>Permissions</i> → uncheck <i>Block pop-up windows</i> or add an exception for <code>${origin}</code>.</li>
          <li><b>Safari (macOS):</b> Safari → Settings → <i>Websites</i> → <i>Pop-up Windows</i> → for <code>${origin}</code>, choose <b>Allow</b>. Or “Settings for This Website…” from the address bar.</li>
        </ul>
      </details>
      <p style="margin-top:0.5em">Tip: some extensions (ad blockers, privacy tools) also block pop-ups; whitelist this site there if needed.</p>
    `;
    const bodyWidget = new Widget({ node: body });

    const result = await showDialog({
      title: 'Allow pop-ups to open notebooks',
      body: bodyWidget,
      //buttons: [Dialog.cancelButton({ label: 'Cancel' }), Dialog.okButton({ label: 'Try again' })]
      buttons: [Dialog.cancelButton({ label: 'Cancel' })]
    });

    return result.button.accept;
  } else {
    // 3) We had permission—tidy up and continue
    try { testWin.close(); } catch { /* ignore */ }
    return true;
  }
}
