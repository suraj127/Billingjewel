import { saveSettings, init } from './db.js';

const setup = async () => {
  try {
    await init();
    await saveSettings('My Store', '1234');
    console.log('Settings saved successfully.');
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};

setup();
