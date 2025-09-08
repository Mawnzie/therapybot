import { useNavigate } from 'react-router-dom';



function Welcome() {
  const navigate = useNavigate();  


  const goToLogin = () => {
    navigate("/login"); // navigate to your DeleteAccount page
  };
  const goToRegister = () => {
    navigate("/register"); // navigate to your DeleteAccount page
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Welcome to TherapAI</h1>
          <button onClick={goToLogin}> Login </button>
    <button onClick={goToRegister}> Register </button>

    </div>

  );
}

export default Welcome;