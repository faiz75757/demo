import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login({ role }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api("/auth/login", { method: "POST", body: { ...form, role } });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>{role === "admin" ? "Admin" : "Student"} Login</h2>
      {error && <p className="msg error">{error}</p>}
      <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
    </form>
  );
}
