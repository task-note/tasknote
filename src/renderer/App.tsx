import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Content, Main, PageLayout } from '@atlaskit/page-layout';
import './App.css';
import Sidebar from './Sidebar';
import Hello from './Hello';

export default function App() {
  return (
    <PageLayout>
      <Content>
        <Sidebar />
        <Main id="Content">
          <Router>
            <Routes>
              <Route path="/" element={<Hello />} />
            </Routes>
          </Router>
        </Main>
      </Content>
    </PageLayout>
  );
}
