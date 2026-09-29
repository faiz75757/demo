import { useEffect, useState } from "react";
import { api } from "../api";
import EventCard from "../components/EventCard";

export default function Browse() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/events?upcoming=true")
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Upcoming Events</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="msg error">{error}</p>}
      {!loading && events.length === 0 && <p>No upcoming events yet.</p>}
      <div className="grid">
        {events.map((e) => <EventCard key={e._id} event={e} />)}
      </div>
      <p>Log in as a student to register.</p>
    </div>
  );
}
