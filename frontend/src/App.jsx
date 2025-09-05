import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Chat from "./Chat";
import DeleteAccount from "./DeleteAccount";
import ProtectedRoute from "./ProtectedRoute";
import Register from './Register';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deleteaccount"
          element={
            <ProtectedRoute>
              <DeleteAccount />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;




/*import React from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './Login';
import Chat from './Chat';
import ProtectedPage from './Protected';
import DeleteAccount from './DeleteAccount';

function App() {



  return (

    <Router>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/protected" element={<ProtectedPage />} />
        <Route path="/deleteaccount" element={<DeleteAccount />} />

      </Routes>
    </Router>

  

  );
}
export default App;

*/