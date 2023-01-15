/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useRef } from 'react';
import {
  Header,
  NavigationHeader,
  NavigationContent,
  Section,
  ButtonItem,
} from '@atlaskit/side-navigation';
import { token } from '@atlaskit/tokens';
import './Sidebar.css';
import { NewFileIcon, NewFolderIcon } from './CustomIcons';
import FileTree from './FileTree';

const NaviMenu = () => {
  return (
    <div className="app-sidebar-content">
      <NavigationHeader>
        <Header description="">Project Note</Header>
      </NavigationHeader>
      <NavigationContent>
        <Section>
          <ButtonItem
            iconBefore={
              <NewFileIcon
                size="small"
                label=""
                secondaryColor={token('color.icon.brand', '#333333')}
              />
            }
          >
            New Project Note
          </ButtonItem>
          <ButtonItem
            iconBefore={
              <NewFolderIcon
                size="small"
                label=""
                secondaryColor={token('color.icon.brand', '#333333')}
              />
            }
          >
            New Folder
          </ButtonItem>
        </Section>
        <FileTree />
      </NavigationContent>
    </div>
  );
};

export default function Sidebar() {
  const sidebarRef = useRef(null);
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
      if (isResizing && sidebarRef.current) {
        const targetWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
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
