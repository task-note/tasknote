/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Header,
  Footer,
  NavigationHeader,
  NavigationContent,
  NavigationFooter,
  Section,
  ButtonItem,
} from '@atlaskit/side-navigation';
import { token } from '@atlaskit/tokens';

import './Sidebar.css';
import { NewFileIcon, NewFolderIcon, MainIcon } from './CustomIcons';
import FileTree from './FileTree';
import showInputDialog from './InputDialog';
import { makeDir, TreeDataType, makeFile } from './FileOp';
import { log, error } from './Logger';

let currSideWidth = 250;
const NaviMenu = () => {
  const fileTreeRef: React.RefObject<FileTree> = useRef(null);
  const navigate = useNavigate();

  const newFolderInternal = (isRoot: boolean) => {
    const fileTree = fileTreeRef.current;
    if (!fileTree) {
      error('new folder error, filetree is null');
      return;
    }
    const currSel = isRoot ? null : fileTree?.getCurrentSelect();
    let prefix = '.';
    let target = prefix;
    if (currSel && currSel.length > 0) {
      target = currSel[0] as string;
      if (target.length > 0) {
        const targetNode = fileTree?.getNodeByKey(target);
        if (targetNode?.isLeaf) {
          prefix = target.substring(0, target.lastIndexOf('/'));
        } else {
          prefix = target;
        }
      }
    }
    showInputDialog(
      'Create New Project Folder',
      'Please input the project folder name:',
      (val: string) => {
        makeDir(
          `${prefix}/${encodeURIComponent(val)}`,
          fileTree.updateTree.bind(fileTree)
        );
      },
      '',
      fileTree?.getValidator(target)
    );
  };

  const newFolder = () => {
    newFolderInternal(false);
  };

  const newRootFolder = () => {
    newFolderInternal(true);
  };

  const newFile = () => {
    const fileTree = fileTreeRef.current;
    if (!fileTree) {
      error('new project note error, filetree is null');
      return;
    }
    const currSel = fileTree?.getCurrentSelect();
    let prefix = '.';
    let target;
    if (currSel && currSel.length > 0) {
      prefix = currSel[0] as string;
      const selNode = fileTree?.getNodeByKey(prefix);
      if (selNode?.isLeaf) {
        target = prefix;
        prefix = prefix.substring(0, prefix.lastIndexOf('/'));
      } else if (selNode?.children) {
        if (selNode?.children.length > 0) {
          target = selNode?.children[0].key;
        }
      }
    }
    showInputDialog(
      'Create New Note',
      'Please input the project note name:',
      (val: string) => {
        makeFile(
          `${prefix}/${encodeURIComponent(val)}`,
          fileTree.updateTree.bind(fileTree)
        );
      },
      '',
      fileTree?.getValidator(target)
    );
  };

  const foo = () => {
    navigate('/');
    // const element = fileTreeRef.current;
    // console.log('will add it later', element?.getCurrentSelect());
  };

  function navigateTo(node: TreeDataType) {
    if (node.isLeaf) {
      navigate('/editor', { state: { id: node.key, title: node.title } });
    } else {
      navigate('/timeline', {
        state: {
          id: node.key,
          title: node.title,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          selCB: setCurrentSel,
          newFileCB: newFile,
          newFolderCB: newFolder,
        },
      });
    }
  }

  const setCurrentSel = (key: string) => {
    const fileTree = fileTreeRef.current;
    log('setCurrnetSelection to:', key);
    if (fileTree) {
      fileTree.setCurrentSelect(key);
      const node = fileTree.getNodeByKey(key);
      if (node) {
        navigateTo(node);
      }
    }
  };

  const onSelect = (node: TreeDataType) => {
    navigateTo(node);
  };

  return (
    <div className="app-sidebar-content">
      <div className="app-sidebar-inner">
        <NavigationHeader>
          <Header description="">Project Note</Header>
          <Section>
            <ButtonItem
              iconBefore={
                <NewFolderIcon
                  size="small"
                  label=""
                  secondaryColor={token('color.icon.brand', '#333333')}
                />
              }
              onClick={newFolder}
            >
              New Folder
            </ButtonItem>
            <ButtonItem
              iconBefore={
                <NewFileIcon
                  size="small"
                  label=""
                  secondaryColor={token('color.icon.brand', '#333333')}
                />
              }
              onClick={newFile}
            >
              New Project Note
            </ButtonItem>
          </Section>
        </NavigationHeader>
        <NavigationContent>
          <FileTree
            ref={fileTreeRef}
            width={currSideWidth}
            selCallback={onSelect}
            newRootFolderCB={newRootFolder}
          />
        </NavigationContent>
        <NavigationFooter>
          <Footer
            // iconBefore={<MainIcon />}
            description={
              <div>
                <a onClick={foo}>Give feedback</a> {' ∙ '}
                <a onClick={foo}>Learn more</a>
              </div>
            }
          >
            Organize Your Project Like this!
          </Footer>
        </NavigationFooter>
      </div>
    </div>
  );
};

export default function Sidebar() {
  const sidebarRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(currSideWidth);

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = 'default';
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: { clientX: number }) => {
      const element = sidebarRef.current;
      if (isResizing && element) {
        const targetWidth =
          mouseMoveEvent.clientX - element.getBoundingClientRect().left;
        setSidebarWidth(targetWidth);
        if (targetWidth < 350) {
          currSideWidth = targetWidth > 210 ? targetWidth : 210;
        }
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div
      ref={sidebarRef}
      className="app-sidebar"
      style={{ width: sidebarWidth }}
    >
      <NaviMenu />
      <div className="app-sidebar-resizer" onMouseDown={startResizing} />
    </div>
  );
}
