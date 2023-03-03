/* eslint-disable no-plusplus */
import { app, shell } from 'electron';
import * as fs from 'fs';
import log from 'electron-log';
import { TreeDataType, DropWarning } from '../renderer/FileOp';

const pathlib = require('path');

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

function isDir(path: string) {
  try {
    const stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
}

function isPath(path: string) {
  return path.indexOf('/') >= 0 || path.indexOf('\\') >= 0;
}

function buildFileTree(event: Electron.IpcMainEvent, path: string) {
  const lsPath = `${baseDir()}/${path}`;
  function listFolder(subPath: string, data: TreeDataType[]) {
    const allfiles = fs.readdirSync(subPath, { withFileTypes: true });
    for (let index = 0; index < allfiles.length; index++) {
      const file = allfiles[index];
      // log.info(file);
      const filePath = `${subPath}/${file.name}`;
      const unescapedName = decodeURIComponent(file.name);
      if (file.isFile()) {
        data.push({
          key: filePath,
          title: unescapedName,
          isLeaf: true,
        });
      } else {
        const folder = {
          key: filePath,
          title: unescapedName,
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
  } else if (args[0] === 'exists') {
    // log.info('writefile', args[1], args[2]);
    const dstPath = unifyPath(args[1]);
    const result = fs.existsSync(dstPath);
    event.reply('exists', result);
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
  } else if (args[0] === 'trash') {
    const parent = pathlib.dirname(args[1]);
    log.info('trash file:', args[1], ', parent=', parent);
    shell
      .trashItem(args[1])
      .then(() => {
        event.reply('trash', 'ok', parent);
        return true;
      })
      .catch(() => {
        event.reply('trash', 'fail');
      });
  } else if (args[0] === 'rename') {
    const parentPath = pathlib.dirname(args[1]);
    const fileNameNew = isPath(args[2]) ? args[2] : `${parentPath}/${args[2]}`;
    log.info('rename file:', args[1], ', to:', fileNameNew);
    fs.rename(args[1], fileNameNew, (err) => {
      event.reply('rename', err, fileNameNew);
    });
  } else if (args[0] === 'trydrop') {
    const srcPath = args[1];
    const parentPath = isDir(args[2]) ? args[2] : pathlib.dirname(args[2]);
    const fileName = pathlib.basename(srcPath);
    const fileNameNew = `${parentPath}/${fileName}`;
    log.info('trydrop file:', srcPath, ', to:', args[2], ', n:', fileNameNew);
    if (!fs.existsSync(fileNameNew)) {
      fs.rename(srcPath, fileNameNew, (err) => {
        event.reply('trydrop', err, fileNameNew);
      });
      return;
    }
    const isSrcDir = isDir(srcPath);
    const isDstDir = isDir(fileNameNew);
    log.info('trydrop, exists, src is dir?=', isSrcDir, ', dst?=', isDstDir);
    const dropErr: DropWarning = {
      discriminator: 'DropWarning',
      errno: 2,
      src: isSrcDir,
      dst: isDstDir,
      dropPath: fileNameNew,
    };
    event.reply('trydrop', dropErr);
  }
}
