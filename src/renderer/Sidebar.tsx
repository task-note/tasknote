/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useRef } from 'react';
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

const NaviMenu = () => {
  const fileTreeRef: React.RefObject<FileTree> = useRef(null);

  const newFolder = () => {
    showInputDialog(
      'Create New Folder',
      'Please input the folder name:',
      (val: string) => {
        console.log('newFolder:', val);
      }
    );
  };

  const newFile = () => {
    showInputDialog(
      'Create New File',
      'Please input the file name:',
      (val: string) => {
        console.log('newFile:', val);
      }
    );
  };

  const foo = () => {
    const element = fileTreeRef.current;
    console.log('will add it later', element?.getCurrentSelect());
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
          <FileTree ref={fileTreeRef} />
        </NavigationContent>
        <NavigationFooter>
          <Footer
            iconBefore={<MainIcon />}
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
  const [sidebarWidth, setSidebarWidth] = useState(250);

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
