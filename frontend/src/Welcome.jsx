import { useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';

function Welcome() {
  const navigate = useNavigate();  

  const goToLogin = () => {
    navigate("/login");
  };
  const goToRegister = () => {
    navigate("/register");
  };

  return (
      <div className="welcome-container">
        <h1>Welcome to Counsel Chat</h1>
        <div className="welcome-buttons">
          <button onClick={goToLogin}  style={{
          padding: "8px 15px",
          marginLeft: "5px",
          borderRadius: "5px",
          cursor: "pointer",
          background: "linear-gradient(90deg, #28a745, #20c997)", // same gradient
          color: "white",
          border: "none",
          boxShadow: "0 4px 6px rgba(32, 105, 70, 0.5)" // darker green shadow
        }}> Login</button>
        <button onClick={goToRegister}  style={{
          padding: "8px 15px",
          marginLeft: "5px",
          borderRadius: "5px",
          cursor: "pointer",
          background: "linear-gradient(90deg, #28a745, #20c997)", // same gradient
          color: "white",
          border: "none",
          boxShadow: "0 4px 6px rgba(32, 105, 70, 0.5)" // darker green shadow
        }}>Register</button>
        </div>
      </div>
  );
}

export default Welcome;



/*
import { useNavigate } from 'react-router-dom';
import Layout from './Layout/Layout';


function Welcome() {
  
  const navigate = useNavigate();  


  const goToLogin = () => {
    navigate("/login"); // navigate to your DeleteAccount page
  };
  const goToRegister = () => {
    navigate("/register"); // navigate to your DeleteAccount page
  };

  return (
    <Layout>
    
      <h1 class="center">Welcome to Counsel Chat</h1>

    <div>
          <button onClick={goToLogin}> Login </button>
    <button onClick={goToRegister}> Register </button>

    </div>
    </Layout>

  );
}

export default Welcome;

*/