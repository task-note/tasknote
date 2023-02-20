/* eslint-disable no-console */
/* eslint-disable prefer-rest-params */
const debug = true;

const log = debug
  ? console.log.bind(window.console, `[${new Date().toJSON()}]`)
  : function remoteLog() {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(`[${new Date().toJSON()}]`);
      window.electron.ipcRenderer.sendMessage('log', args);
    };

const warn = debug
  ? console.warn.bind(window.console, `[${new Date().toJSON()}]`)
  : function remoteWarn() {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(`[${new Date().toJSON()}]`);
      window.electron.ipcRenderer.sendMessage('warn', args);
    };

const error = debug
  ? console.error.bind(window.console, `[${new Date().toJSON()}]`)
  : function remoteError() {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(`[${new Date().toJSON()}]`);
      window.electron.ipcRenderer.sendMessage('error', args);
    };

export { log, warn, error };
