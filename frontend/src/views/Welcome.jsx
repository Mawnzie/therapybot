import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

function Welcome() {
  const navigate = useNavigate();  

  const goToLogin = () => {
    navigate("/login");
  };
  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <Layout>
      <div>
        <h1>Welcome to Counsel Chat</h1>
        <div className="button-row">
          <button onClick={goToLogin} > Login</button>
        <button onClick={goToRegister}>Register</button>
        </div>
      </div>
    </Layout>
  );
}

export default Welcome;

