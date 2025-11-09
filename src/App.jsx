import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GeneratorPage from './pages/GeneratorPage';
import ScanPage from './pages/ScanPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GeneratorPage />} />
        <Route path="/scan/:qrId" element={<ScanPage />} />
      </Routes>
    </Router>
  );
}

export default App;