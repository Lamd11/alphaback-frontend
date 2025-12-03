import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          AlphaBack
        </Link>

        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Upload Model
          </Link>
          <Link
            to="/models"
            className={`nav-link ${location.pathname === '/models' ? 'active' : ''}`}
          >
            My Models
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
