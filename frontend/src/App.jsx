import { Route, Routes } from 'react-router-dom';
import Start from './pages/Start';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Start />} />
        <Route 
          path='/home' 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;