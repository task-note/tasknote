import { FieldDataNode } from '../../tree/src/interface';

export type TreeDataType = FieldDataNode<{
  key: string;
  title: string;
  children?: TreeDataType[];
}>;

export type LoadFilesCB = (treeData: TreeDataType[]) => void;

function loadFiles(cb: LoadFilesCB) {
  window.electron.ipcRenderer.sendMessage('fs', ['ls', '']);
  window.electron.ipcRenderer.once('ls', (treeData) => {
    cb(treeData as TreeDataType[]);
  });
}

function makeDir(path: string, cb: LoadFilesCB) {
  window.electron.ipcRenderer.sendMessage('fs', ['mkdir', path]);
  window.electron.ipcRenderer.once('mkdir', (err, resPath) => {
    console.log('mkdir result:', resPath, err);
    loadFiles(cb);
  });
}

function makeFile(path: string, cb: LoadFilesCB) {
  window.electron.ipcRenderer.sendMessage('fs', ['writefile', path]);
  window.electron.ipcRenderer.once('writefile', (err) => {
    if (err) {
      console.error('writefile result:', err);
      return;
    }
    loadFiles(cb);
  });
}

function writeFile(path: string, data: string) {
  console.log('writeFile:', path, data);
}

export { loadFiles, writeFile, makeDir, makeFile };
