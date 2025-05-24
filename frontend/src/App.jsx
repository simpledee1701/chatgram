import { Route, Routes } from 'react-router-dom';
import Start from './pages/Start';
<<<<<<< HEAD
=======
import Home from './pages/Home';
import ProfileSetup from './pages/ProfileSetup';
>>>>>>> d8e5a25341853bf460d37020d248cd66b0ebfc6f
import Chat from './pages/Chat';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Start />} />
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <Chat />
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