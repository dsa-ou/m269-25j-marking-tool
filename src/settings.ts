import { ISettingRegistry } from '@jupyterlab/settingregistry';

export function getSetting(settings: ISettingRegistry.ISettings, key: string, default_value: string): string {
  try {
    const value = settings.get(key).composite;
    return typeof value === 'string' ? value : '';
  } catch (err) {
    console.warn(`Error reading setting "${key}":`, err);
    return default_value;
  }
}
