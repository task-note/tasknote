import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import './App.css';
import Sidebar from './Sidebar';
import Hello from './Hello';
import TaskEditor from './Editor';

export default function App() {
  return (
    <PageLayout>
      <Content>
        <Sidebar />
        <Main id="Content">
          <Router>
            <Routes>
              <Route path="/" element={<TaskEditor />} />
              <Route path="/editor" element={<Hello />} />
            </Routes>
          </Router>
        </Main>
      </Content>
    </PageLayout>
  );
}
