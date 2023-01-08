/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useRef } from 'react';
import {
  Header,
  NavigationHeader,
  NavigationContent,
  Section,
  ButtonItem,
} from '@atlaskit/side-navigation';
import './Sidebar.css';

const NaviMenu = () => {
  return (
    <div className="app-sidebar-content">
      <NavigationHeader>
        <Header description="">Project Note</Header>
      </NavigationHeader>
      <NavigationContent>
        <Section>
          <ButtonItem>New Project Note</ButtonItem>
          <ButtonItem>New Folder</ButtonItem>
        </Section>
      </NavigationContent>
    </div>
  );
};

export default function App() {
  const sidebarRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(268);

  const startResizing = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent: { clientX: number }) => {
      if (isResizing && sidebarRef.current) {
        setSidebarWidth(
          mouseMoveEvent.clientX -
            sidebarRef.current.getBoundingClientRect().left
        );
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
      onMouseDown={(e) => e.preventDefault()}
    >
      <NaviMenu />
      <div className="app-sidebar-resizer" onMouseDown={startResizing} />
    </div>
  );
}
