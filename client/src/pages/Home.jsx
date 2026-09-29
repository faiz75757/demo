import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="center">
      <h1>B4 Events</h1>
      <p>Discover and register for college events.</p>
      <div className="button-row">
        <Link className="btn" to="/student/login">Student Login</Link>
        <Link className="btn" to="/admin/login">Admin Login</Link>
        <Link className="btn" to="/student/register">Student Register</Link>
        <Link className="btn" to="/admin/register">Admin Register</Link>
      </div>
      <p><Link to="/events">Browse upcoming events</Link></p>
    </div>
  );
}
