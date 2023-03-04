import { FieldDataNode } from '../../packages/tree/src/interface';
import { log, error } from './Logger';

export type TreeDataType = FieldDataNode<{
  key: string;
  title: string;
  children?: TreeDataType[];
}>;

export type LoadFilesCB = (treeData: TreeDataType[], sel: string) => void;
export type ReadFileCB = (path: string, content: string) => void;
export type DropCB = (result: number, dropPath: string) => void;
export interface DropWarning {
  discriminator: 'DropWarning';
  errno: number;
  src: boolean;
  dst: boolean;
  dropPath: string;
}

function instanceOfDropWarning(object: any) {
  return object.discriminator === 'DropWarning';
}

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

async function exists(path: string) {
  window.electron.ipcRenderer.sendMessage('fs', ['exists', path]);
  let isExists = false;
  await new Promise<void>((resolve) => {
    window.electron.ipcRenderer.once('exists', (result) => {
      isExists = result as boolean;
      resolve();
    });
  });
  log('exists ', path, ':', isExists);
  return isExists;
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

function isPath(path: string) {
  return path.indexOf('/') >= 0 || path.indexOf('\\') >= 0;
}

function renameItem(path: string, newName: string, cb: LoadFilesCB) {
  log('rename item, rename folder:', path, ' to ', newName);
  window.electron.ipcRenderer.sendMessage('fs', [
    'rename',
    path,
    isPath(newName) ? newName : encodeURIComponent(newName),
  ]);
  window.electron.ipcRenderer.once('rename', (err, newPath) => {
    if (!err) {
      loadFiles(cb, newPath as string);
    }
  });
}

function trydrop(src: string, dst: string, cb: DropCB) {
  log('try drop, src=', src, ', dst=', dst);
  window.electron.ipcRenderer.sendMessage('fs', ['trydrop', src, dst]);
  window.electron.ipcRenderer.once('trydrop', (err, newPath) => {
    if (!err) {
      cb(0, newPath as string);
    } else if (instanceOfDropWarning(err)) {
      const dropWarn = err as DropWarning;
      log('trydrop', dropWarn.src, dropWarn.dst);
      const result = !dropWarn.dst && !dropWarn.src ? 1 : 2;
      cb(result, dropWarn.dropPath);
    } else {
      cb(3, '');
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
  exists,
  trydrop,
};
