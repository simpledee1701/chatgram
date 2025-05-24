import { Route, Routes } from 'react-router-dom';
import Start from './pages/Start';
import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
import Chat from './pages/Chat';
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
        <Route 
          path='/profile-setup' 
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }/>
          <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }/>
      </Routes>
    </>
  );
}

export default App;