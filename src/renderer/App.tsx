import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import './App.css';
import Sidebar from './Sidebar';
import Hello from './Hello';
import TaskEditor from './Editor';
import Timeline from './Timeline';

export default function App() {
  return (
    <Router>
      <PageLayout>
        <Content>
          <Sidebar />
          <Main id="Content">
            <Routes>
              <Route path="/editor" element={<TaskEditor />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/" element={<Hello />} />
            </Routes>
          </Main>
        </Content>
      </PageLayout>
    </Router>
  );
}
