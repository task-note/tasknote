import ReactDOM from 'react-dom';
import App from './App';
import '@atlaskit/css-reset';
import i18n, { LanguageMessage } from './i18nclient';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const container = document.getElementById('root')!;

window.electron.ipcRenderer.sendMessage('get-initial-translations', []);
window.electron.ipcRenderer.once(
  'get-initial-translations',
  (initialI18nStore) => {
    i18n.addResourceBundle('cn', 'translation', initialI18nStore);
    ReactDOM.render(<App />, container);
    document.title = i18n.t('ProjectName');
  }
);

window.electron.ipcRenderer.on('language-changed', (msg) => {
  const message = msg as LanguageMessage;
  if (!i18n.hasResourceBundle(message.language, message.namespace)) {
    i18n.addResourceBundle(
      message.language,
      message.namespace,
      message.resource
    );
  }

  i18n.changeLanguage(message.language);
});

// window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});
