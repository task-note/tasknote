import { FieldDataNode } from '../../tree/src/interface';
import { log, error } from './Logger';

export type TreeDataType = FieldDataNode<{
  key: string;
  title: string;
  children?: TreeDataType[];
}>;

export type LoadFilesCB = (treeData: TreeDataType[], sel: string) => void;
export type ReadFileCB = (path: string, content: string) => void;

function loadFiles(cb: LoadFilesCB, sel: string) {
  window.electron.ipcRenderer.sendMessage('fs', ['ls', '']);
  window.electron.ipcRenderer.once('ls', (treeData) => {
    cb(treeData as TreeDataType[], sel);
  });
}

function makeDir(path: string, cb: LoadFilesCB) {
  window.electron.ipcRenderer.sendMessage('fs', ['mkdir', path]);
  window.electron.ipcRenderer.once('mkdir', (err, resPath) => {
    log('mkdir result:', resPath, err);
    if (!err) {
      loadFiles(cb, resPath as string);
    }
  });
}

function makeFile(path: string, cb: LoadFilesCB) {
  window.electron.ipcRenderer.sendMessage('fs', ['writefile', path]);
  window.electron.ipcRenderer.once('writefile', (err) => {
    if (err) {
      error('writefile result:', err);
      return;
    }
    loadFiles(cb, path);
  });
}

function writeFile(path: string, data: string) {
  window.electron.ipcRenderer.sendMessage('fs', ['writefile', path, data]);
}

function readFile(path: string, cb: ReadFileCB) {
  window.electron.ipcRenderer.sendMessage('fs', ['readfile', path]);
  window.electron.ipcRenderer.once('readfile', (err, content, id) => {
    if (err) {
      error('readfile result:', err);
      return;
    }
    cb(id as string, content as string);
  });
}

function trashItem(path: string, cb: LoadFilesCB) {
  log('trash item, folder is:', path);
  window.electron.ipcRenderer.sendMessage('fs', ['trash', path]);
  window.electron.ipcRenderer.once('trash', (msg, parent) => {
    if (msg !== 'ok') {
      error('falied to trash file:', path);
      return;
    }
    loadFiles(cb, parent as string);
  });
}

function renameItem(path: string, newName: string, cb: LoadFilesCB) {
  log('rename item, rename folder:', path, ' to ', newName);
  window.electron.ipcRenderer.sendMessage('fs', [
    'rename',
    path,
    encodeURIComponent(newName),
  ]);
  window.electron.ipcRenderer.once('rename', (err, newPath) => {
    if (!err) {
      loadFiles(cb, newPath as string);
    }
  });
}

function nameValidator(
  siblings: TreeDataType[],
  curr: TreeDataType | undefined,
  val: string
): boolean {
  for (let i = 0; i < siblings.length; i += 1) {
    if ((!curr || siblings[i].key !== curr.key) && siblings[i].title === val) {
      return false;
    }
  }
  return true;
}

export {
  loadFiles,
  writeFile,
  makeDir,
  makeFile,
  readFile,
  trashItem,
  renameItem,
  nameValidator,
};
