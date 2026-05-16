import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
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
      await signup(form);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start organizing and managing your work with TaskFlow."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign In"
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

        {/* NAME */}
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Name
          </span>

          <input
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#4338CA] focus:ring-4 focus:ring-[#4338CA]/10"
            type="text"
            placeholder="Enter your name"
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
            required
          />
        </label>

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
            placeholder="Create password"
            minLength={6}
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
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;