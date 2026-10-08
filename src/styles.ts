import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { getSetting } from './settings';

// Inject the cell colour classes used by the colourise command
export function injectCellStyles(settings: ISettingRegistry.ISettings): void {
  console.log('Loading colours');
  const answer_colour = getSetting(settings,'answer_colour','rgb(255, 255, 204)');
  const feedback_colour = getSetting(settings,'feedback_colour','rgb(93, 163, 243)');
  const tutor_colour = getSetting(settings,'tutor_colour','rgb(249, 142, 142)');
  console.log('Answers: '+answer_colour);
  console.log('Feedback: '+feedback_colour);
  console.log('Tutor: '+tutor_colour);
  const style = document.createElement('style');
  style.textContent = `
    .m269-answer {
      background-color:`+answer_colour+` !important;
    }
    .m269-feedback {
      background-color:`+feedback_colour+` !important;
    }
    .m269-tutor {
      background-color: `+tutor_colour+` !important;
    }
  `;
  document.head.appendChild(style);
}
