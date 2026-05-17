import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const emptyTask = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  assignedTo: [],
  documents: [],
};

const badgeStyles = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-rose-100 text-rose-800",
};

const Dashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ status: "", priority: "", sortBy: "createdAt", sortOrder: "desc" });
  const [form, setForm] = useState(emptyTask);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest(`/api/tasks?${queryString}`);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      const data = await apiRequest("/api/users?limit=100&sortBy=name&sortOrder=asc");
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [queryString]);

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const resetForm = () => {
    setForm(emptyTask);
    setEditingTask(null);
    setShowForm(false);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      assignedTo: Array.isArray(task.assignedTo)
        ? task.assignedTo.map((user) => user._id)
        : task.assignedTo
          ? [task.assignedTo._id || task.assignedTo.id]
          : [],
      documents: [],
    });
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("status", form.status);
    data.append("priority", form.priority);
    data.append("dueDate", form.dueDate);
    form.assignedTo.forEach((id) => {
      data.append("assignedTo", id);
    });
    Array.from(form.documents).forEach((file) => data.append("documents", file));

    try {
      await apiRequest(editingTask ? `/api/tasks/${editingTask._id}` : "/api/tasks", {
        method: editingTask ? "PUT" : "POST",
        body: data,
      });
      setMessage(editingTask ? "Task updated" : "Task created");
      resetForm();
      fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    setError("");
    try {
      await apiRequest(`/api/tasks/${taskId}`, { method: "DELETE" });
      setMessage("Task deleted");
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteDocument = async (taskId, documentId) => {
    if (!confirm("Delete this document?")) return;
    setError("");
    try {
      await apiRequest(`/api/tasks/${taskId}/documents/${documentId}`, { method: "DELETE" });
      setMessage("Document deleted");
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">

            {/* LOGO */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C6CFB] to-[#4338CA] text-2xl font-bold text-white shadow-lg">
              T
            </div>

            {/* BRAND */}
            <div>
              <p className="text-sm font-semibold tracking-wide text-purple-300">
                TaskFlow
              </p>

              <p className="text-xs text-slate-400">
                Productivity Workspace
              </p>
            </div>
          </div>

          {/* CENTER TITLE */}
          <div className="absolute left-1/2 -translate-x-1/2">

            <h1 className="text-3xl font-bold tracking-wide text-white">
              Task Dashboard
            </h1>

          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* USER INFO */}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">

              <p className="text-sm font-semibold text-white">
                {user?.name}
              </p>

              <p className="text-xs uppercase tracking-wide text-purple-300">
                {user?.role}
              </p>

            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={logout}
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-4">
            <Select label="Status" value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })} options={["", "todo", "in-progress", "done"]} />
            <Select label="Priority" value={filters.priority} onChange={(value) => setFilters({ ...filters, priority: value })} options={["", "low", "medium", "high"]} />
            <Select label="Sort by" value={filters.sortBy} onChange={(value) => setFilters({ ...filters, sortBy: value })} options={["createdAt", "updatedAt", "status", "priority", "dueDate"]} />
            <Select label="Order" value={filters.sortOrder} onChange={(value) => setFilters({ ...filters, sortOrder: value })} options={["desc", "asc"]} />
          </div>
          <button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800" onClick={() => setShowForm(true)}>
            New task
          </button>
        </div>

        {message && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="rounded-lg bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">No tasks found.</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {tasks.map((task) => (
              <article key={task._id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">{task.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{task.description || "No description"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm font-semibold text-blue-700 hover:text-blue-900" onClick={() => openEdit(task)}>Edit</button>
                    <button className="text-sm font-semibold text-red-600 hover:text-red-800" onClick={() => deleteTask(task._id)}>Delete</button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge value={task.status} />
                  <Badge value={task.priority} />
                  {task.dueDate && <Badge value={`Due ${new Date(task.dueDate).toLocaleDateString()}`} />}
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p>Created by: <span className="font-medium text-slate-800">{task.createdBy?.name || "Unknown"}</span></p>
                  <p>Assigned to: <span className="font-medium text-slate-800">{Array.isArray(task.assignedTo)
                    ? task.assignedTo.map((user) => user.name).join(", ")
                    : task.assignedTo?.name || "Unassigned"}</span></p>
                </div>
                {task.documents?.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">Documents</p>
                    <div className="space-y-2">
                      {task.documents.map((document) => (
                        <div key={document._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                          <span className="font-medium text-slate-700">{document.originalName}</span>
                          <span className="flex gap-3">
                            <button
                              className="font-semibold text-blue-700"
                              onClick={async () => {
                                try {
                                  const data = await apiRequest(
                                    `/api/tasks/${task._id}/documents/${document._id}/view`
                                  );

                                  window.open(data.viewUrl, "_blank");
                                } catch (err) {
                                  setError(err.message);
                                }
                              }}
                            >
                              View
                            </button>

                            <button
                              className="font-semibold text-blue-700"
                              onClick={async () => {
                                try {
                                  const data = await apiRequest(
                                    `/api/tasks/${task._id}/documents/${document._id}`
                                  );

                                  window.open(data.downloadUrl, "_blank");
                                } catch (err) {
                                  setError(err.message);
                                }
                              }}
                            >
                              Download
                            </button>
                            <button className="font-semibold text-red-600" onClick={() => deleteDocument(task._id, document._id)}>Delete</button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <form className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-xl" onSubmit={handleSave}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-950">{editingTask ? "Edit task" : "Create task"}</h2>
              <button type="button" className="text-sm font-semibold text-slate-500" onClick={resetForm}>Close</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
              <Input label="Due date" type="date" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} />
              <Select label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={["todo", "in-progress", "done"]} />
              <Select label="Priority" value={form.priority} onChange={(value) => setForm({ ...form, priority: value })} options={["low", "medium", "high"]} />
              {isAdmin && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Assign to</span>
                  <select
                    multiple
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    value={form.assignedTo}
                    onChange={(event) => {
                      const values = Array.from(
                        event.target.selectedOptions,
                        (option) => option.value
                      );

                      setForm({
                        ...form,
                        assignedTo: values,
                      });
                    }}
                  >
                    {users.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.email})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">PDF documents</span>
                <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type="file" accept="application/pdf" multiple onChange={(event) => setForm({ ...form, documents: event.target.files })} />
                <span className="mt-1 block text-xs text-slate-500">Maximum 3 PDFs per task.</span>
              </label>
            </div>
            <button className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:bg-blue-300" disabled={saving}>
              {saving ? "Saving..." : "Save task"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
};

const Badge = ({ value }) => (
  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyles[value] || "bg-slate-100 text-slate-700"}`}>
    {value}
  </span>
);

const Select = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option || "all"} value={option}>{option || "all"}</option>
      ))}
    </select>
  </label>
);

const Input = ({ label, value, onChange, type = "text", required = false }) => (
  <label className="block">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
  </label>
);

export default Dashboard;
