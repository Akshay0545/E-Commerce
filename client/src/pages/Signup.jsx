import { useState } from "react";
import { useAuth } from "../store/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  const { signup } = useAuth();
  const nav=useNavigate();

  const submit = async (e)=>{ 
    e.preventDefault(); 
    setErr("");
    if (!email.trim() || !password.trim()) {
      setErr("Email & password required");
      return;
    }
    try { await signup(name,email,password); nav("/"); } 
    catch (e) { setErr(e.message); }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>
      <form onSubmit={submit} className="card p-4 space-y-3">
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input className="input" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="input" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn w-full">Sign up</button>
        <p className="text-sm text-gray-600">Have an account? <Link to="/login" className="underline">Login</Link></p>
      </form>
    </div>
  );
}
