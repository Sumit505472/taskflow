import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(form);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue managing your tasks efficiently."
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkText="Create Account"
    >
      <form
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        {/* ERROR */}
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* EMAIL */}
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Email
          </span>

          <input
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#4338CA] focus:ring-4 focus:ring-[#4338CA]/10"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value,
              })
            }
            required
          />
        </label>

        {/* PASSWORD */}
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Password
          </span>

          <input
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#4338CA] focus:ring-4 focus:ring-[#4338CA]/10"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
            required
          />
        </label>

        {/* BUTTON */}
        <button
          className="w-full rounded-2xl bg-[#4338CA] px-4 py-3 text-lg font-semibold text-white transition hover:bg-[#312E81] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;