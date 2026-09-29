export default function EventCard({ event, onRegister, registered }) {
  const full = event.remaining <= 0;
  return (
    <div className="card">
      <h3>{event.name}</h3>
      <p>Date: {event.date}</p>
      <p>Time: {event.time}</p>
      <p>Maximum Seats: {event.maxSeats}</p>
      <p>Registered Students: {event.registered}</p>
      <p>Remaining Seats: {event.remaining}</p>
      {onRegister && (
        <button
          className="btn"
          disabled={full || registered}
          onClick={() => onRegister(event._id)}
        >
          {registered ? "Registered" : full ? "Event Full" : "Register"}
        </button>
      )}
    </div>
  );
}
