import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Register({ role }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", adminCode: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const body = { name: form.name, email: form.email, password: form.password, confirmPassword: form.confirmPassword };
      if (role === "admin") body.adminCode = form.adminCode; // only sent from the admin page
      const data = await api("/auth/register", { method: "POST", body });
      setMessage({ type: "success", text: data.message });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    setLoading(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{role === "admin" ? "Admin" : "Student"} Register</h2>
      {message.text && <p className={`msg ${message.type}`}>{message.text}</p>}
      <input name="name" placeholder="Full Name" value={form.name} onChange={change} />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={change} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={change} />
      <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={change} />
      {role === "admin" && (
        <input name="adminCode" type="password" placeholder="Admin Setup Code" value={form.adminCode} onChange={change} />
      )}
      <button className="btn" disabled={loading}>{loading ? "Please wait..." : "Register"}</button>
      {message.type === "success" && <p><Link to={`/${role}/login`}>Go to login</Link></p>}
    </form>
  );
}
