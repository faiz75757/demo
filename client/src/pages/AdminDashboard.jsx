import { useEffect, useState } from "react";
import { api, getUser } from "../api";

const emptyForm = { name: "", date: "", time: "", maxSeats: "" };

export default function AdminDashboard() {
  const user = getUser();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null); // null = adding a new event
  const [message, setMessage] = useState({ type: "", text: "" });
  const [attendees, setAttendees] = useState(null); // { title, list }
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    try {
      setEvents(await api("/events"));
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    setLoading(false);
  }

  useEffect(() => { loadEvents(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api(`/events/${editingId}`, { method: "PUT", body: form });
        setMessage({ type: "success", text: "Event updated." });
      } else {
        await api("/events", { method: "POST", body: form });
        setMessage({ type: "success", text: "Event created." });
      }
      setForm(emptyForm);
      setEditingId(null);
      loadEvents();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  function startEdit(ev) {
    setEditingId(ev._id);
    setForm({ name: ev.name, date: ev.date, time: ev.time, maxSeats: ev.maxSeats });
    window.scrollTo(0, 0);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this event?")) return;
    try {
      await api(`/events/${id}`, { method: "DELETE" });
      setMessage({ type: "success", text: "Event deleted." });
      loadEvents();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  async function viewAttendees(ev) {
    try {
      const list = await api(`/events/${ev._id}/attendees`);
      setAttendees({ title: ev.name, list });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  }

  return (
    <div>
      <h2>Welcome, {user.name} (Admin)</h2>
      {message.text && <p className={`msg ${message.type}`}>{message.text}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Event" : "Add Event"}</h3>
        <input name="name" placeholder="Event Name" value={form.name} onChange={change} />
        <input name="date" type="date" value={form.date} onChange={change} />
        <input name="time" type="time" value={form.time} onChange={change} />
        <input name="maxSeats" type="number" min="1" placeholder="Maximum Seats" value={form.maxSeats} onChange={change} />
        <button className="btn">{editingId ? "Save Changes" : "Add Event"}</button>
        {editingId && (
          <button type="button" className="btn gray" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
            Cancel
          </button>
        )}
      </form>

      <h3>All Events</h3>
      {loading && <p>Loading...</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Date</th><th>Time</th><th>Max</th><th>Registered</th><th>Remaining</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev._id}>
                <td>{ev.name}</td><td>{ev.date}</td><td>{ev.time}</td>
                <td>{ev.maxSeats}</td><td>{ev.registered}</td><td>{ev.remaining}</td>
                <td>
                  <button className="btn small" onClick={() => viewAttendees(ev)}>Attendees</button>{" "}
                  <button className="btn small" onClick={() => startEdit(ev)}>Edit</button>{" "}
                  <button className="btn small red" onClick={() => handleDelete(ev._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attendees && (
        <div className="card">
          <h3>Attendees: {attendees.title}</h3>
          {attendees.list.length === 0 ? <p>No registrations yet.</p> : (
            <ul>{attendees.list.map((a, i) => <li key={i}>{a.name} ({a.email})</li>)}</ul>
          )}
          <button className="btn small gray" onClick={() => setAttendees(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
