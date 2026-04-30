import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type TaskImportance = "low" | "medium" | "high";

type Task = {
  id: string;
  title: string;
  importance: TaskImportance;
  estimatedDuration: string;
  dueDate: string;
  urgentBeforeDays: number;
  details: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

type TaskDraft = {
  title: string;
  importance: TaskImportance;
  estimatedDuration: string;
  dueDate: string;
  urgentBeforeDays: number;
  details: string;
};

type StoredTask = Partial<Task> & {
  priority?: TaskImportance;
};

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  importance: TaskImportance;
  estimated_duration: string;
  due_date: string | null;
  urgent_before_days: number;
  details: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const STORAGE_KEY = "local-first-todo.tasks";
const BACKUP_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;

const emptyDraft: TaskDraft = {
  title: "",
  importance: "medium",
  estimatedDuration: "",
  dueDate: "",
  urgentBeforeDays: 1,
  details: "",
};

const importanceWeight: Record<TaskImportance, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function createId() {
  if ("crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isTaskImportance(value: unknown): value is TaskImportance {
  return value === "low" || value === "medium" || value === "high";
}

function normalizeUrgentBeforeDays(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 1;
  }

  return Math.round(value);
}

function normalizeTask(value: unknown): Task | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const task = value as StoredTask;
  const importance = isTaskImportance(task.importance)
    ? task.importance
    : isTaskImportance(task.priority)
      ? task.priority
      : "medium";

  if (
    typeof task.id !== "string" ||
    typeof task.title !== "string" ||
    typeof task.completed !== "boolean" ||
    typeof task.createdAt !== "string" ||
    typeof task.updatedAt !== "string" ||
    (task.completedAt !== undefined && typeof task.completedAt !== "string")
  ) {
    return null;
  }

  return {
    id: task.id,
    title: task.title,
    importance,
    estimatedDuration:
      typeof task.estimatedDuration === "string" ? task.estimatedDuration : "",
    dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
    urgentBeforeDays: normalizeUrgentBeforeDays(task.urgentBeforeDays),
    details: typeof task.details === "string" ? task.details : "",
    completed: task.completed,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt,
  };
}

function normalizeTaskList(value: unknown): Task[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((task) => {
    const normalizedTask = normalizeTask(task);
    return normalizedTask ? [normalizedTask] : [];
  });
}

function loadTasks(): Task[] {
  const savedTasks = window.localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    return normalizeTaskList(JSON.parse(savedTasks));
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function parseLocalDate(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getDaysUntilDue(dueDate: string) {
  const date = parseLocalDate(dueDate);

  if (!date) {
    return null;
  }

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.ceil((date.getTime() - todayStart.getTime()) / DAY_MS);
}

function getTaskScore(task: Task) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const importanceScore = importanceWeight[task.importance] * 10;

  if (daysUntilDue === null) {
    return importanceScore;
  }

  if (daysUntilDue < 0) {
    return importanceScore + 1000;
  }

  if (daysUntilDue <= task.urgentBeforeDays) {
    return importanceScore + 500 + Math.max(0, 90 - daysUntilDue);
  }

  return importanceScore + Math.max(0, 30 - daysUntilDue);
}

function getUrgencyLabel(task: Task) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  if (daysUntilDue === null) {
    return "";
  }

  if (daysUntilDue < 0) {
    return "Overdue";
  }

  if (daysUntilDue === 0) {
    return "Due today";
  }

  if (daysUntilDue <= task.urgentBeforeDays) {
    return "Urgent";
  }

  return `Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = value.includes("T") ? new Date(value) : parseLocalDate(value);

  if (!date) {
    return value;
  }

  if (value.includes("T")) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function createTaskFromDraft(draft: TaskDraft): Task {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: draft.title.trim(),
    importance: draft.importance,
    estimatedDuration: draft.estimatedDuration.trim(),
    dueDate: draft.dueDate,
    urgentBeforeDays: draft.urgentBeforeDays,
    details: draft.details.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

function toTaskRow(task: Task, userId: string): TaskRow {
  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    importance: task.importance,
    estimated_duration: task.estimatedDuration,
    due_date: task.dueDate || null,
    urgent_before_days: task.urgentBeforeDays,
    details: task.details,
    completed: task.completed,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
    completed_at: task.completedAt || null,
  };
}

function fromTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    importance: row.importance,
    estimatedDuration: row.estimated_duration,
    dueDate: row.due_date || "",
    urgentBeforeDays: row.urgent_before_days,
    details: row.details,
    completed: row.completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || undefined,
  };
}

function mergeTasks(localTasks: Task[], cloudTasks: Task[]) {
  const taskById = new Map<string, Task>();

  for (const task of [...localTasks, ...cloudTasks]) {
    const existingTask = taskById.get(task.id);

    if (
      !existingTask ||
      new Date(task.updatedAt).getTime() > new Date(existingTask.updatedAt).getTime()
    ) {
      taskById.set(task.id, task);
    }
  }

  return Array.from(taskById.values());
}

export function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [draft, setDraft] = useState<TaskDraft>(emptyDraft);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<TaskDraft>(emptyDraft);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState("Local mode");
  const loadingCloudRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
    setLastSavedAt(new Date().toISOString());
  }, [tasks]);

  useEffect(() => {
    if (!user) {
      setSyncMessage("Local mode");
      return;
    }

    loadCloudTasks(user);
    // Only rerun when the signed-in account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const activeTasks = useMemo(
    () =>
      tasks
        .filter((task) => !task.completed)
        .sort((firstTask, secondTask) => {
          const scoreDifference = getTaskScore(secondTask) - getTaskScore(firstTask);

          if (scoreDifference !== 0) {
            return scoreDifference;
          }

          return (
            new Date(secondTask.createdAt).getTime() -
            new Date(firstTask.createdAt).getTime()
          );
        }),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks],
  );

  const visibleNowTasks = activeTasks.slice(0, 4);
  const laterActiveTasks = activeTasks.slice(4);

  async function syncCloudTasks(nextTasks: Task[], currentUser = user) {
    if (!currentUser || loadingCloudRef.current) {
      return;
    }

    setSyncMessage("Syncing...");

    const taskRows = nextTasks.map((task) => toTaskRow(task, currentUser.id));
    const taskIds = nextTasks.map((task) => task.id);

    const deleteQuery = supabase
      .from("tasks")
      .delete()
      .eq("user_id", currentUser.id);

    const { error: deleteError } = taskIds.length
      ? await deleteQuery.not(
          "id",
          "in",
          `(${taskIds.map((id) => `"${id}"`).join(",")})`,
        )
      : await deleteQuery;

    if (deleteError) {
      setSyncMessage(`Sync error: ${deleteError.message}`);
      return;
    }

    if (taskRows.length) {
      const { error: upsertError } = await supabase
        .from("tasks")
        .upsert(taskRows, { onConflict: "id" });

      if (upsertError) {
        setSyncMessage(`Sync error: ${upsertError.message}`);
        return;
      }
    }

    setSyncMessage(`Synced ${formatDate(new Date().toISOString())}`);
  }

  async function loadCloudTasks(currentUser: User) {
    loadingCloudRef.current = true;
    setSyncMessage("Loading cloud tasks...");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", currentUser.id);

    if (error) {
      setSyncMessage(`Cloud setup needed: ${error.message}`);
      loadingCloudRef.current = false;
      return;
    }

    const cloudTasks = (data || []).map((row) => fromTaskRow(row as TaskRow));
    const mergedTasks = mergeTasks(loadTasks(), cloudTasks);

    setTasks(mergedTasks);
    saveTasks(mergedTasks);
    loadingCloudRef.current = false;
    await syncCloudTasks(mergedTasks, currentUser);
  }

  function persistTasks(nextTasks: Task[]) {
    setTasks(nextTasks);
    saveTasks(nextTasks);
    syncCloudTasks(nextTasks);
  }

  async function handleCreateAccount() {
    setAuthMessage("Creating account...");

    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
    });

    setAuthMessage(
      error
        ? error.message
        : "Account created. Check your email if Supabase asks for confirmation.",
    );
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("Signing in...");

    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });

    setAuthMessage(error ? error.message : "Signed in.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSyncMessage("Local mode");
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim()) {
      return;
    }

    persistTasks([createTaskFromDraft(draft), ...tasks]);
    setDraft(emptyDraft);
  }

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditingDraft({
      title: task.title,
      importance: task.importance,
      estimatedDuration: task.estimatedDuration,
      dueDate: task.dueDate,
      urgentBeforeDays: task.urgentBeforeDays,
      details: task.details,
    });
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditingDraft(emptyDraft);
  }

  function saveEdit(taskId: string) {
    const title = editingDraft.title.trim();

    if (!title) {
      return;
    }

    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title,
              importance: editingDraft.importance,
              estimatedDuration: editingDraft.estimatedDuration.trim(),
              dueDate: editingDraft.dueDate,
              urgentBeforeDays: editingDraft.urgentBeforeDays,
              details: editingDraft.details.trim(),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    cancelEditing();
  }

  function deleteTask(taskId: string) {
    persistTasks(tasks.filter((task) => task.id !== taskId));

    if (editingTaskId === taskId) {
      cancelEditing();
    }
  }

  function completeTask(taskId: string) {
    const now = new Date().toISOString();

    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: true,
              completedAt: now,
              updatedAt: now,
            }
          : task,
      ),
    );

    if (editingTaskId === taskId) {
      cancelEditing();
    }
  }

  function restoreTask(taskId: string) {
    const now = new Date().toISOString();

    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: false,
              completedAt: undefined,
              updatedAt: now,
            }
          : task,
      ),
    );
  }

  function toggleTaskDetails(taskId: string) {
    setExpandedTaskIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(taskId)) {
        nextIds.delete(taskId);
      } else {
        nextIds.add(taskId);
      }

      return nextIds;
    });
  }

  function exportBackup() {
    const backup = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      tasks,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `local-todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsedBackup = JSON.parse(String(reader.result));
        const importedTasks = normalizeTaskList(
          Array.isArray(parsedBackup) ? parsedBackup : parsedBackup.tasks,
        );

        if (!importedTasks.length) {
          setImportMessage("No valid tasks found in that file.");
          return;
        }

        persistTasks(importedTasks);
        setImportMessage(`Imported ${importedTasks.length} task(s).`);
      } catch {
        setImportMessage("Could not import that backup file.");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file);
  }

  function renderTask(task: Task, isFeatured = false) {
    const isEditing = editingTaskId === task.id;
    const isExpanded = expandedTaskIds.has(task.id);
    const urgencyLabel = getUrgencyLabel(task);

    return (
      <li
        className={isFeatured ? "task task-featured" : "task"}
        key={task.id}
      >
        {isEditing ? (
          <form
            className="task-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit(task.id);
            }}
          >
            <label className="wide-field">
              <span>Task</span>
              <input
                autoFocus
                value={editingDraft.title}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    title: event.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Importance</span>
              <select
                value={editingDraft.importance}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    importance: event.target.value as TaskImportance,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label>
              <span>Estimate</span>
              <input
                value={editingDraft.estimatedDuration}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    estimatedDuration: event.target.value,
                  })
                }
                placeholder="30 min"
              />
            </label>

            <label>
              <span>Due</span>
              <input
                type="date"
                value={editingDraft.dueDate}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    dueDate: event.target.value,
                  })
                }
              />
            </label>

            <label>
              <span>Urgent before</span>
              <select
                value={editingDraft.urgentBeforeDays}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    urgentBeforeDays: Number(event.target.value),
                  })
                }
              >
                <option value={0}>Due day</option>
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
              </select>
            </label>

            <label className="full-field">
              <span>Details</span>
              <textarea
                value={editingDraft.details}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    details: event.target.value,
                  })
                }
                placeholder="Important info, notes, links, context"
                rows={3}
              />
            </label>

            <div className="task-actions edit-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={cancelEditing}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="task-main">
              <p className={task.completed ? "task-title completed" : "task-title"}>
                {task.title}
              </p>
              <div className="task-meta">
                <span className={`importance ${task.importance}`}>
                  {task.importance}
                </span>
                {urgencyLabel ? (
                  <span
                    className={
                      urgencyLabel === "Overdue" || urgencyLabel === "Urgent"
                        ? "urgency urgent"
                        : "urgency"
                    }
                  >
                    {urgencyLabel}
                  </span>
                ) : null}
                {task.dueDate ? <span>Due {formatDate(task.dueDate)}</span> : null}
                {task.estimatedDuration ? (
                  <span>{task.estimatedDuration}</span>
                ) : null}
                {task.completedAt ? (
                  <span>Completed {formatDate(task.completedAt)}</span>
                ) : null}
              </div>
              {isExpanded ? (
                <div className="task-details">
                  {task.details ? (
                    <p>{task.details}</p>
                  ) : (
                    <p className="muted">No extra details yet.</p>
                  )}
                  {task.dueDate ? (
                    <p className="muted">
                      Becomes urgent {task.urgentBeforeDays} day
                      {task.urgentBeforeDays === 1 ? "" : "s"} before due date.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="task-actions">
              {!task.completed ? (
                <button type="button" onClick={() => completeTask(task.id)}>
                  Complete
                </button>
              ) : (
                <button type="button" onClick={() => restoreTask(task.id)}>
                  Restore
                </button>
              )}
              <button type="button" onClick={() => toggleTaskDetails(task.id)}>
                {isExpanded ? "Hide" : "Details"}
              </button>
              <button type="button" onClick={() => startEditing(task)}>
                Edit
              </button>
              <button
                className="danger"
                type="button"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </li>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1>Local Todo</h1>
          <p className="save-status">
            {lastSavedAt ? `Last saved ${formatDate(lastSavedAt)}` : "Ready"}
          </p>
          <p className="save-status">{syncMessage}</p>
        </div>
        <div className="backup-actions">
          <button type="button" onClick={exportBackup}>
            Export backup
          </button>
          <label className="import-button">
            <span>Import backup</span>
            <input type="file" accept="application/json" onChange={importBackup} />
          </label>
        </div>
      </header>

      <section className="auth-panel" aria-labelledby="account">
        <div>
          <h2 id="account">Account Sync</h2>
          <p className="muted">
            {user
              ? `Signed in as ${user.email}`
              : authLoading
                ? "Checking account..."
                : "Sign in to sync tasks between devices."}
          </p>
          {authMessage ? <p className="muted">{authMessage}</p> : null}
        </div>
        {user ? (
          <button type="button" onClick={handleSignOut}>
            Sign out
          </button>
        ) : (
          <form className="auth-form" onSubmit={handleSignIn}>
            <input
              type="email"
              value={authEmail}
              onChange={(event) => setAuthEmail(event.target.value)}
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={authPassword}
              onChange={(event) => setAuthPassword(event.target.value)}
              placeholder="Password"
              required
              minLength={6}
            />
            <button type="submit">Sign in</button>
            <button type="button" onClick={handleCreateAccount}>
              Create account
            </button>
          </form>
        )}
      </section>

      {importMessage ? <p className="import-message">{importMessage}</p> : null}

      <form className="task-form" onSubmit={handleAddTask}>
        <label className="title-field">
          <span>Task</span>
          <input
            value={draft.title}
            onChange={(event) =>
              setDraft({ ...draft, title: event.target.value })
            }
            placeholder="Add a task"
          />
        </label>

        <label>
          <span>Importance</span>
          <select
            value={draft.importance}
            onChange={(event) =>
              setDraft({
                ...draft,
                importance: event.target.value as TaskImportance,
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          <span>Estimate</span>
          <input
            value={draft.estimatedDuration}
            onChange={(event) =>
              setDraft({ ...draft, estimatedDuration: event.target.value })
            }
            placeholder="30 min"
          />
        </label>

        <label>
          <span>Due</span>
          <input
            type="date"
            value={draft.dueDate}
            onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })}
          />
        </label>

        <label>
          <span>Urgent before</span>
          <select
            value={draft.urgentBeforeDays}
            onChange={(event) =>
              setDraft({
                ...draft,
                urgentBeforeDays: Number(event.target.value),
              })
            }
          >
            <option value={0}>Due day</option>
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>1 week</option>
            <option value={14}>2 weeks</option>
          </select>
        </label>

        <details className="details-entry">
          <summary>Details</summary>
          <label>
            <span>Important info</span>
            <textarea
              value={draft.details}
              onChange={(event) =>
                setDraft({ ...draft, details: event.target.value })
              }
              placeholder="Notes, links, context"
              rows={3}
            />
          </label>
        </details>

        <button type="submit">Add</button>
      </form>

      <section aria-labelledby="active-tasks">
        <h2 id="active-tasks">Active Tasks</h2>
        {activeTasks.length ? (
          <>
            <ul className="task-list top-task-list">
              {visibleNowTasks.map((task) => renderTask(task, true))}
            </ul>
            {laterActiveTasks.length ? (
              <>
                <h3>Later</h3>
                <ul className="task-list">
                  {laterActiveTasks.map((task) => renderTask(task))}
                </ul>
              </>
            ) : null}
          </>
        ) : (
          <p className="empty-state">No active tasks yet.</p>
        )}
      </section>

      <section aria-labelledby="completed-tasks">
        <h2 id="completed-tasks">Completed Archive</h2>
        {completedTasks.length ? (
          <ul className="task-list">
            {completedTasks.map((task) => renderTask(task))}
          </ul>
        ) : (
          <p className="empty-state">Completed tasks will appear here.</p>
        )}
      </section>
    </main>
  );
}
