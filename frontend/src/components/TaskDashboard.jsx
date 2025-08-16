import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/useAuth";
import api from "../apis/axios";
import "bootstrap/dist/css/bootstrap.min.css";

const TaskDashboard = () => {
  const { token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [deleteTask, setDeleteTask] = useState(null);

  const defaultFormData = {
    title: "",
    description: "",
    estimate: "",
    due_date: "",
    priority: "medium",
    status: "todo",
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tasks.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const sanitizeForm = (form) => {
    const clean = { ...form };
    if (clean.estimate === "") clean.estimate = null;
    if (clean.due_date === "") clean.due_date = null;
    return clean;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tasks`, sanitizeForm(formData), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(defaultFormData);
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || "Create failed");
    }
  };

  const confirmDeleteTask = async () => {
    if (!deleteTask) return;
    try {
      await api.delete(`/tasks/${deleteTask.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteTask(null);
      fetchTasks();
    } catch {
      setError("Failed to delete task.");
    }
  };

  const handleUpdateTask = async () => {
    try {
      await api.patch(`/tasks/${selectedTask.id}`, sanitizeForm(formData), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedTask(null);
      setFormData(defaultFormData);
      fetchTasks();
    } catch {
      setError("Failed to update task.");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  const isPastDue = (dateStr) => {
    if (!dateStr) return false;
    const now = new Date();
    const due = new Date(dateStr);
    return due < now;
  };

  const displayStatus = (status) => {
    if (!status) return "TODO";
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Your Tasks</h2>

      {/* Task creation form */}
      <form onSubmit={handleCreateTask} className="mb-4">
        <div className="row g-2">
          <div className="col-md-2">
            <input
              type="text"
              name="title"
              value={formData.title}
              placeholder="Title *"
              className="form-control"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="text"
              name="description"
              value={formData.description}
              placeholder="Description"
              className="form-control"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-1">
            <input
              type="number"
              name="estimate"
              value={formData.estimate}
              placeholder="0 hrs"
              className="form-control"
              onChange={handleInputChange}
              min="0"
            />
          </div>
          <div className="col-md-2">
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              className="form-control"
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-2">
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="todo">TODO</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-primary w-100">
              Add
            </button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="list-group">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="list-group-item d-flex justify-content-between align-items-start flex-wrap"
            >
              <div className="me-auto">
                <h5>{task.title}</h5>
                <p className="mb-1 text-muted">
                  {(task.description?.length > 100
                    ? task.description.slice(0, 100) + "..."
                    : task.description) || "No description"}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-info-subtle text-dark">
                    Status: {displayStatus(task.status)}
                  </span>
                  <span className="badge bg-warning-subtle text-dark">
                    Priority: {task.priority || "Medium"}
                  </span>
                  <span className="badge bg-light text-dark">
                    Estimate: {task.estimate || 0} hrs
                  </span>
                  <span
                    className={`badge ${
                      isPastDue(task.due_date)
                        ? "bg-danger text-white"
                        : "bg-success-subtle text-dark"
                    }`}
                  >
                    Due: {formatDate(task.due_date)}
                  </span>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setSelectedTask(task);
                    setFormData(task);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setViewTask(task)}
                >
                  View
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setDeleteTask(task)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedTask && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Task</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTask(null)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name="title"
                  className="form-control mb-2"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
                <textarea
                  name="description"
                  className="form-control mb-2"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="estimate"
                  className="form-control mb-2"
                  placeholder="Estimate (hrs)"
                  value={formData.estimate}
                  onChange={handleInputChange}
                />
                <input
                  type="date"
                  name="due_date"
                  className="form-control mb-2"
                  value={formData.due_date || ""}
                  onChange={handleInputChange}
                />
                <select
                  name="priority"
                  className="form-select mb-2"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="todo">TODO</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTask(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleUpdateTask}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewTask && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Task Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewTask(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Title:</strong> {viewTask.title}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {viewTask.description || "No description"}
                </p>
                <p>
                  <strong>Estimate:</strong> {viewTask.estimate || 0} hrs
                </p>
                <p>
                  <strong>Due Date:</strong> {formatDate(viewTask.due_date)}
                </p>
                <p>
                  <strong>Status:</strong> {displayStatus(viewTask.status)}
                </p>
                <p>
                  <strong>Priority:</strong> {viewTask.priority || "Medium"}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setViewTask(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTask && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Confirm Delete</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteTask(null)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete{" "}
                <strong>{deleteTask.title}</strong>?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteTask(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={confirmDeleteTask}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
