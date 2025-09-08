// Navbar.jsx
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link , useNavigate } from 'react-router-dom';

function NavBar({ items }) {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    navigate("/"); // redirect to login
  };

  return (
    <Navbar bg="dark" expand="lg" variant="dark"  fixed="top" className="shadow-sm w-100">
      <Nav className="mx-auto d-flex gap-4">
          <Nav.Link
            onClick={logout} // optional handler
            className="fs-5 text-uppercase"
          >
            Log out
          </Nav.Link>
        {items && items.map(([ref, title ]) => (
          <Nav.Link
            as={Link}
            to={ref || '#'}  // use "#" if there's no route
            key={title}
            className="fs-5 text-uppercase"
          >
            {title}
          </Nav.Link>
        ))}
      </Nav>
    </Navbar>
  );
}

export default NavBar;

/*




import Nav from "react-bootstrap/Nav";
import { Link } from 'react-router-dom';
import { Card } from "react-bootstrap";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

function NavBar({items}) {
  return (
    <Navbar bg="light" expand="lg" fixed="top" className="w-100 container-fluid py-0">
      <Nav
      aria-label="Main"
      className="justify-content-center navbar navbar-muted bg-secondary w-100"
      activeKey={items[0][0]} expand="lg" fixed="top" >
        {items && items.map(([ref,title]) =>
      <Nav.Item>
        <Nav.Link href={ref}> {title}</Nav.Link>
      </Nav.Item>)}
      </Nav>
    </Navbar>
  );
}

export default NavBar;
*/