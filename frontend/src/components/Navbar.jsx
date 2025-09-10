// Navbar.jsx
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Link, useNavigate } from 'react-router-dom';

function NavBar({ items }) {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    navigate("/"); // redirect to login
  };

  return (
    <>
      {['lg'].map((expand) => (
        <Navbar key={expand} expand={expand} variant="dark" fixed="top" bg="dark" className="mb-3">
          <Container fluid>
            {/* Brand / Logo */}
            <Navbar.Brand as={Link} to="/">Counsel Chat</Navbar.Brand>

            {/* Toggle button for offcanvas */}
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />

            {/* Offcanvas content */}
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="end"  // slides in from right
              className="custom-offcanvas"   
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  Menu
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3 gap-3">
                  <Nav.Link onClick={logout} className="fs-5 text-uppercase">
                    Log out
                  </Nav.Link>
                  {items &&
                    items.map(([ref, title]) => (
                      <Nav.Link
                        as={Link}
                        to={ref || '#'}
                        key={title}
                        className="fs-5 text-uppercase"
                      >
                        {title}
                      </Nav.Link>
                    ))}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      ))}
    </>
  );
}

export default NavBar;

// // Navbar.jsx
// import Navbar from 'react-bootstrap/Navbar';
// import Nav from 'react-bootstrap/Nav';
// import { Link , useNavigate } from 'react-router-dom';

// function NavBar({ items }) {
//   const navigate = useNavigate();

//   const logout = () => {
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("username");
//     navigate("/"); // redirect to login
//   };

//   return (
//     <Navbar expand="lg" variant="dark"  fixed="top" >
//       <Nav className="mx-auto d-flex gap-4">
//           <Nav.Link
//             onClick={logout} // optional handler
//             className="fs-5 text-uppercase"
//           >
//             Log out
//           </Nav.Link>
//         {items && items.map(([ref, title ]) => (
//           <Nav.Link
//             as={Link}
//             to={ref || '#'}  // use "#" if there's no route
//             key={title}
//             className="fs-5 text-uppercase"
//           >
//             {title}
//           </Nav.Link>
//         ))}
//       </Nav>
//     </Navbar>
//   );
// }

// export default NavBar;
