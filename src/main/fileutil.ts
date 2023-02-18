/* eslint-disable no-plusplus */
import { app } from 'electron';
import * as fs from 'fs';
import log from 'electron-log';
import { TreeDataType } from '../renderer/FileOp';

function baseDir() {
  return `${app.getPath('userData')}/notes`;
}

function unifyPath(path: string) {
  let dstPath = path;
  if (path.startsWith('.')) {
    dstPath = `${baseDir()}/${path}`;
  }
  return dstPath;
}

async function buildFileTree(event: Electron.IpcMainEvent, path: string) {
  const lsPath = `${baseDir()}/${path}`;
  function listFolder(subPath: string, data: TreeDataType[]) {
    const allfiles = fs.readdirSync(subPath, { withFileTypes: true });
    for (let index = 0; index < allfiles.length; index++) {
      const file = allfiles[index];
      // log.info(file);
      const filePath = `${subPath}/${file.name}`;
      if (file.isFile()) {
        data.push({
          key: filePath,
          title: file.name,
          isLeaf: true,
        });
      } else {
        const folder = {
          key: filePath,
          title: file.name,
          isLeaf: false,
          children: [],
        };
        data.push(folder);
        listFolder(filePath, folder.children);
      }
    }
  }
  log.info('<<!>> ls:', lsPath);
  const treeData: TreeDataType[] = [];
  listFolder(lsPath, treeData);
  event.reply('ls', treeData);
}

export default async function handleFileCommands(
  event: Electron.IpcMainEvent,
  args: string[]
) {
  log.info('handle file requests', args[0]);
  if (args[0] === 'ls') {
    fs.mkdirSync(baseDir(), { recursive: true });
    buildFileTree(event, args[1]);
  } else if (args[0] === 'mkdir') {
    fs.mkdir(unifyPath(args[1]), { recursive: true }, (err, path) => {
      log.info('<<!>> mkdir, path=', path, err);
      event.reply('mkdir', err, path);
    });
  } else if (args[0] === 'writefile') {
    // log.info('writefile', args[1], args[2]);
    const dstPath = unifyPath(args[1]);
    let content = '';
    if (args.length < 3 || args[2].length === 0) {
      if (fs.existsSync(dstPath)) {
        event.reply('writefile', { errno: 1 });
        return;
      }
    } else {
      // eslint-disable-next-line prefer-destructuring
      content = args[2];
    }
    fs.writeFile(dstPath, content, 'utf-8', (err) => {
      if (err) {
        log.info('<<!>> writefile, path=', dstPath, err);
      }
      event.reply('writefile', err);
    });
  } else if (args[0] === 'readfile') {
    log.info('readfile', args[1]);
    fs.readFile(unifyPath(args[1]), { encoding: 'utf8' }, (err, data) => {
      event.reply('readfile', err, data, args[1]);
    });
  }
}
