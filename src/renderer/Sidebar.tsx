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
import { useTranslation } from 'react-i18next';

import './Sidebar.css';
import { NewFileIcon, NewFolderIcon, MainIcon } from './CustomIcons';
import FileTree from './FileTree';
import showInputDialog from './InputDialog';
import { makeDir, TreeDataType, makeFile } from './FileOp';
import { log, error } from './Logger';
import { setNaviCallbacks } from './Hello';

let currSideWidth = 250;

const NaviMenu = () => {
  const fileTreeRef: React.RefObject<FileTree> = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      } else {
        target = prefix;
      }
    }
    showInputDialog(
      t('New Folder Tip'),
      t('New Folder Prompt'),
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
      target = currSel[0] as string;
      if (target.length > 0) {
        prefix = target;
        const selNode = fileTree?.getNodeByKey(prefix);
        if (selNode?.isLeaf) {
          target = prefix;
          prefix = prefix.substring(0, prefix.lastIndexOf('/'));
        } else if (selNode?.children) {
          if (selNode?.children.length > 0) {
            target = selNode?.children[0].key;
          }
        }
      } else {
        target = prefix;
      }
    }
    showInputDialog(
      t('New Note Tip'),
      t('New Note Prompt'),
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

  setNaviCallbacks(newFile, newFolder);

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

  const onSelect = (node: TreeDataType | undefined) => {
    if (node) {
      navigateTo(node);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="app-sidebar-content">
      <div className="app-sidebar-inner">
        <NavigationHeader>
          <Header description="">{t('ProjectName')}</Header>
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
              {t('NewFolder')}
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
              {t('NewProjectNote')}
            </ButtonItem>
          </Section>
        </NavigationHeader>
        <NavigationContent>
          <FileTree
            ref={fileTreeRef}
            width={currSideWidth}
            selCallback={onSelect}
            newRootFolderCB={newRootFolder}
            newFileCB={newFile}
            newFolderCB={newFolder}
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
