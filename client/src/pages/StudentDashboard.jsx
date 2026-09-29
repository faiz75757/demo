import { useEffect, useState } from "react";
import { api, getUser } from "../api";
import EventCard from "../components/EventCard";

export default function StudentDashboard() {
  const user = getUser();
  const [events, setEvents] = useState([]);
  const [mine, setMine] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setEvents(await api("/events?upcoming=true"));
      setMine(await api("/my-registrations"));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleRegister(id) {
    try {
      const data = await api(`/events/${id}/register`, { method: "POST" });
      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    loadData(); // refresh seat counts
  }

  const myIds = mine.map((e) => e._id);

  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      {message.text && <p className={`msg ${message.type}`}>{message.text}</p>}
      {loading && <p>Loading...</p>}

      <h3>Upcoming Events</h3>
      {!loading && events.length === 0 && <p>No upcoming events.</p>}
      <div className="grid">
        {events.map((e) => (
          <EventCard key={e._id} event={e} onRegister={handleRegister} registered={myIds.includes(e._id)} />
        ))}
      </div>

      <h3>My Registered Events</h3>
      {!loading && mine.length === 0 && <p>You have not registered for any events.</p>}
      <div className="grid">
        {mine.map((e) => <EventCard key={e._id} event={e} />)}
      </div>
    </div>
  );
}
