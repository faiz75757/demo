import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../api";

export default function Navbar() {
  const user = getUser();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">B4 Events</Link>
      <div>
        <Link to="/events">Events</Link>
        {user && <button className="btn small" onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
}
