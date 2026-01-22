import './Footer.css';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <nav className="footer-nav" aria-label="Sidfotsnavigering">
          <div className="footer-description">
            <h2 className="footer-heading">Unity Fitness</h2>
            <p>
              En plats för balans, rörelse och återhämtning. Vi skapar träning
              som håller över tid, för kropp, sinne och vardag.
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Om oss</h3>
            <ul>
              <li>
                <a href="#">Kontakta oss</a>
              </li>
              <li>
                <Link to="/medlemskap">Medlemskapserbjudanden</Link>
              </li>
              <li>
                <Link to="/alla-pass">Pass & schema</Link>
              </li>
              <li>
                <a href="#">Mer om oss</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Admin</h3>
            <ul>
              <li>
                <Link to="/admin" className="footer-admin-link">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/instructors" className="footer-admin-link">
                  Instruktörer
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <hr />
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} Unity Fitness
        </p>{' '}
      </div>
    </footer>
  );
}
