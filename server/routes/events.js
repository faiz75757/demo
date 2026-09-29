const router = require("express").Router();
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { protect, only } = require("../middleware/auth");

// Shape of an event sent to React (remaining seats = max - confirmed registrations)
const format = (e) => ({
  _id: e._id,
  name: e.name,
  date: e.date,
  time: e.time,
  maxSeats: e.maxSeats,
  registered: e.registeredCount,
  remaining: e.maxSeats - e.registeredCount,
});

// Check event fields; returns an error message or null
function validateEvent({ name, date, time, maxSeats }) {
  if (!name || !date || !time || maxSeats === undefined || maxSeats === "")
    return "Name, date, time and maximum seats are required.";
  if (!Number.isInteger(Number(maxSeats)) || Number(maxSeats) <= 0)
    return "Maximum seats must be a whole number greater than zero.";
  return null;
}

// GET /api/events   (?upcoming=true shows only today and later)
router.get("/events", async (req, res) => {
  try {
    const filter = {};
    if (req.query.upcoming === "true") {
      filter.date = { $gte: new Date().toISOString().slice(0, 10) };
    }
    const events = await Event.find(filter).sort({ date: 1, time: 1 });
    res.json(events.map(format));
  } catch (err) {
    res.status(500).json({ message: "Could not load events." });
  }
});

// POST /api/events  (admin)
router.post("/events", protect, only("admin"), async (req, res) => {
  try {
    const error = validateEvent(req.body);
    if (error) return res.status(400).json({ message: error });
    const { name, date, time, maxSeats } = req.body;
    const event = await Event.create({
      name, date, time, maxSeats: Number(maxSeats), createdBy: req.user.id,
    });
    res.status(201).json(format(event));
  } catch (err) {
    res.status(500).json({ message: "Could not create event." });
  }
});

// PUT /api/events/:id  (admin)
router.put("/events/:id", protect, only("admin"), async (req, res) => {
  try {
    const error = validateEvent(req.body);
    if (error) return res.status(400).json({ message: error });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const { name, date, time, maxSeats } = req.body;
    if (Number(maxSeats) < event.registeredCount)
      return res.status(400).json({
        message: `${event.registeredCount} students are already registered. Seats cannot go below that.`,
      });

    event.name = name; event.date = date; event.time = time; event.maxSeats = Number(maxSeats);
    await event.save();
    res.json(format(event));
  } catch (err) {
    res.status(500).json({ message: "Could not update event." });
  }
});

// DELETE /api/events/:id  (admin)
router.delete("/events/:id", protect, only("admin"), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    await Registration.deleteMany({ event: event._id }); // remove its registrations too
    res.json({ message: "Event deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete event." });
  }
});

// POST /api/events/:id/register  (student)
router.post("/events/:id/register", protect, only("student"), async (req, res) => {
  try {
    // ONE atomic step: "add 1 to registeredCount, but only if seats are left".
    // MongoDB does this safely, so two students cannot both take the last seat.
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, $expr: { $lt: ["$registeredCount", "$maxSeats"] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!event) {
      const exists = await Event.findById(req.params.id);
      if (!exists) return res.status(404).json({ message: "Event not found." });
      return res.status(400).json({ message: "Sorry, this event is full." });
    }

    try {
      await Registration.create({ student: req.user.id, event: event._id });
    } catch (err) {
      // Registration failed, so give the seat back
      await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: -1 } });
      if (err.code === 11000) // unique index: already registered
        return res.status(400).json({ message: "You are already registered for this event." });
      throw err;
    }

    res.json({ message: "You are registered!", event: format(event) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not register." });
  }
});

// GET /api/events/:id/attendees  (admin)
router.get("/events/:id/attendees", protect, only("admin"), async (req, res) => {
  try {
    const regs = await Registration.find({ event: req.params.id }).populate("student", "name email");
    res.json(regs.map((r) => ({ name: r.student.name, email: r.student.email, registeredAt: r.registeredAt })));
  } catch (err) {
    res.status(500).json({ message: "Could not load attendees." });
  }
});

// GET /api/my-registrations  (student)
router.get("/my-registrations", protect, only("student"), async (req, res) => {
  try {
    const regs = await Registration.find({ student: req.user.id }).populate("event");
    res.json(regs.filter((r) => r.event).map((r) => format(r.event)));
  } catch (err) {
    res.status(500).json({ message: "Could not load your registrations." });
  }
});

module.exports = router;
