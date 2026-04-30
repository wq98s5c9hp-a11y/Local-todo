import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type TaskImportance = "low" | "medium" | "high";
type TaskRepeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

type Task = {
  id: string;
  title: string;
  importance: TaskImportance;
  estimatedDuration: string;
  dueDate: string;
  urgentBeforeDays: number;
  sortOrder: number | null;
  details: string;
  repeat: TaskRepeat;
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
  repeat: TaskRepeat;
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
  sort_order: number | null;
  details: string;
  repeat: TaskRepeat;
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const STORAGE_KEY = "local-first-todo.tasks";
const THEME_STORAGE_KEY = "local-first-todo.theme";
const BACKUP_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DUE_DAYS = 365;

const emptyDraft: TaskDraft = {
  title: "",
  importance: "medium",
  estimatedDuration: "",
  dueDate: "",
  urgentBeforeDays: 1,
  details: "",
  repeat: "none",
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

function isTaskRepeat(value: unknown): value is TaskRepeat {
  return (
    value === "none" ||
    value === "daily" ||
    value === "weekly" ||
    value === "monthly" ||
    value === "yearly"
  );
}

function normalizeUrgentBeforeDays(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 1;
  }

  return Math.round(value);
}

function normalizeSortOrder(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
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
    dueDate: typeof task.dueDate === "string" ? normalizeDueDate(task.dueDate) : "",
    urgentBeforeDays: normalizeUrgentBeforeDays(task.urgentBeforeDays),
    sortOrder: normalizeSortOrder(task.sortOrder),
    details: typeof task.details === "string" ? task.details : "",
    repeat: isTaskRepeat(task.repeat) ? task.repeat : "none",
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

function loadDarkMode() {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark";
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

function getTodayStart() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMaxDueDateInputValue() {
  const maxDate = getTodayStart();
  maxDate.setDate(maxDate.getDate() + MAX_DUE_DAYS);

  return formatDateInputValue(maxDate);
}

function normalizeDueDate(value: string) {
  const dueDate = parseLocalDate(value);

  if (!dueDate) {
    return "";
  }

  const maxDate = getTodayStart();
  maxDate.setDate(maxDate.getDate() + MAX_DUE_DAYS);

  return formatDateInputValue(dueDate > maxDate ? maxDate : dueDate);
}

function getDaysUntilDue(dueDate: string) {
  const date = parseLocalDate(dueDate);

  if (!date) {
    return null;
  }

  const todayStart = getTodayStart();

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
    dueDate: normalizeDueDate(draft.dueDate),
    urgentBeforeDays: draft.urgentBeforeDays,
    sortOrder: Date.now() * -1,
    details: draft.details.trim(),
    repeat: draft.repeat,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

function formatRepeat(value: TaskRepeat) {
  switch (value) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
    default:
      return "";
  }
}

function addRepeatInterval(date: Date, repeat: TaskRepeat) {
  const nextDate = new Date(date);

  if (repeat === "daily") {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  if (repeat === "weekly") {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  if (repeat === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  if (repeat === "yearly") {
    nextDate.setDate(nextDate.getDate() + MAX_DUE_DAYS);
  }

  return nextDate;
}

function createNextRepeatingTask(task: Task, completedAt: string): Task | null {
  if (task.repeat === "none") {
    return null;
  }

  const nextDueDate = addRepeatInterval(new Date(completedAt), task.repeat);

  return {
    ...task,
    id: createId(),
    completed: false,
    completedAt: undefined,
    dueDate: normalizeDueDate(formatDateInputValue(nextDueDate)),
    sortOrder: Date.now() * -1,
    createdAt: completedAt,
    updatedAt: completedAt,
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
    sort_order: task.sortOrder,
    details: task.details,
    repeat: task.repeat,
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
    dueDate: normalizeDueDate(row.due_date || ""),
    urgentBeforeDays: row.urgent_before_days,
    sortOrder: normalizeSortOrder(row.sort_order),
    details: row.details,
    repeat: isTaskRepeat(row.repeat) ? row.repeat : "none",
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
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [syncMessage, setSyncMessage] = useState("Local mode");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => loadDarkMode());
  const loadingCloudRef = useRef(false);
  const completingTaskIdsRef = useRef<Set<string>>(new Set());

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
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDarkMode ? "#10141c" : "#f6f7f9");
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      isDarkMode ? "dark" : "light",
    );
  }, [isDarkMode]);

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
          if (
            firstTask.sortOrder !== null &&
            secondTask.sortOrder !== null &&
            firstTask.sortOrder !== secondTask.sortOrder
          ) {
            return firstTask.sortOrder - secondTask.sortOrder;
          }

          if (firstTask.sortOrder !== null && secondTask.sortOrder === null) {
            return -1;
          }

          if (firstTask.sortOrder === null && secondTask.sortOrder !== null) {
            return 1;
          }

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

  function normalizeActiveOrder(orderedActiveTasks: Task[]) {
    const orderById = new Map(
      orderedActiveTasks.map((task, index) => [task.id, index + 1]),
    );

    return tasks.map((task) =>
      orderById.has(task.id)
        ? {
            ...task,
            sortOrder: orderById.get(task.id) ?? task.sortOrder,
            updatedAt: new Date().toISOString(),
          }
        : task,
    );
  }

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

  function persistTasksWithTransition(nextTasks: Task[]) {
    const documentWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (!documentWithTransition.startViewTransition) {
      persistTasks(nextTasks);
      return;
    }

    documentWithTransition.startViewTransition(() => {
      persistTasks(nextTasks);
    });
  }

  function validateAuthFields() {
    const email = authEmail.trim();

    if (!email || !authPassword) {
      setAuthMessage("Enter an email and password first.");
      return null;
    }

    if (authPassword.length < 6) {
      setAuthMessage("Password must be at least 6 characters.");
      return null;
    }

    return { email, password: authPassword };
  }

  function closeAddTask() {
    setIsAddTaskOpen(false);
    setDraft(emptyDraft);
  }

  async function handleCreateAccount() {
    const credentials = validateAuthFields();

    if (!credentials) {
      return;
    }

    setAuthMessage("Creating account...");
    setAuthSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    setAuthSubmitting(false);
    setAuthMessage(
      error
        ? error.message
        : "Account created. Check your email if Supabase asks for confirmation, then return here and sign in.",
    );
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const credentials = validateAuthFields();

    if (!credentials) {
      return;
    }

    setAuthMessage("Signing in...");
    setAuthSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    setAuthSubmitting(false);
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
    setIsAddTaskOpen(false);
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
      repeat: task.repeat,
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
              dueDate: normalizeDueDate(editingDraft.dueDate),
              urgentBeforeDays: editingDraft.urgentBeforeDays,
              details: editingDraft.details.trim(),
              repeat: editingDraft.repeat,
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
    if (completingTaskIdsRef.current.has(taskId)) {
      return;
    }

    completingTaskIdsRef.current.add(taskId);
    const now = new Date().toISOString();
    const taskToComplete = tasks.find((task) => task.id === taskId);
    const nextRepeatingTask = taskToComplete
      ? createNextRepeatingTask(taskToComplete, now)
      : null;

    const completedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: true,
            completedAt: now,
            updatedAt: now,
          }
        : task,
    );

    persistTasks(
      nextRepeatingTask ? [nextRepeatingTask, ...completedTasks] : completedTasks,
    );

    if (editingTaskId === taskId) {
      cancelEditing();
    }

    window.setTimeout(() => {
      completingTaskIdsRef.current.delete(taskId);
    }, 600);
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
              sortOrder: Date.now() * -1,
              updatedAt: now,
            }
          : task,
      ),
    );
  }

  function moveActiveTask(taskId: string, direction: "up" | "down") {
    const currentIndex = activeTasks.findIndex((task) => task.id === taskId);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex < 0 || nextIndex >= activeTasks.length) {
      return;
    }

    const reorderedTasks = [...activeTasks];
    [reorderedTasks[currentIndex], reorderedTasks[nextIndex]] = [
      reorderedTasks[nextIndex],
      reorderedTasks[currentIndex],
    ];

    persistTasksWithTransition(normalizeActiveOrder(reorderedTasks));
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

  function renderTask(task: Task, isFeatured = false, activeIndex: number | null = null) {
    const isEditing = editingTaskId === task.id;
    const isExpanded = expandedTaskIds.has(task.id);
    const urgencyLabel = getUrgencyLabel(task);
    const canMoveUp = activeIndex !== null && activeIndex > 0;
    const canMoveDown = activeIndex !== null && activeIndex < activeTasks.length - 1;

    return (
      <article
        className={[
          "task",
          isFeatured ? "task-featured" : "",
          isEditing ? "task-editing" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        key={task.id}
        style={
          {
            viewTransitionName: `task-${task.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
          } as CSSProperties
        }
      >
        {activeIndex !== null ? (
          <div className="task-move-actions" aria-label="Move task">
            <button
              type="button"
              aria-label="Move task up"
              disabled={!canMoveUp}
              onClick={() => moveActiveTask(task.id, "up")}
            >
              ↑
            </button>
            <button
              type="button"
              aria-label="Move task down"
              disabled={!canMoveDown}
              onClick={() => moveActiveTask(task.id, "down")}
            >
              ↓
            </button>
          </div>
        ) : null}
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
                max={getMaxDueDateInputValue()}
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

            <label>
              <span>Repeat</span>
              <select
                value={editingDraft.repeat}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    repeat: event.target.value as TaskRepeat,
                  })
                }
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
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
                {task.repeat !== "none" ? (
                  <span>{formatRepeat(task.repeat)}</span>
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
                <button
                  className="task-icon-action complete-action"
                  type="button"
                  aria-label="Complete task"
                  title="Complete"
                  onClick={() => completeTask(task.id)}
                >
                  ✓
                </button>
              ) : (
                <button
                  className="task-icon-action"
                  type="button"
                  aria-label="Restore task"
                  title="Restore"
                  onClick={() => restoreTask(task.id)}
                >
                  ↩
                </button>
              )}
              <button
                className="task-icon-action"
                type="button"
                aria-label={isExpanded ? "Hide details" : "Show details"}
                title={isExpanded ? "Hide details" : "Details"}
                onClick={() => toggleTaskDetails(task.id)}
              >
                i
              </button>
              <button
                className="task-icon-action"
                type="button"
                aria-label="Edit task"
                title="Edit"
                onClick={() => startEditing(task)}
              >
                ✎
              </button>
              <button
                className="task-icon-action danger"
                type="button"
                aria-label="Delete task"
                title="Delete"
                onClick={() => deleteTask(task.id)}
              >
                ×
              </button>
            </div>
          </>
        )}
      </article>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <img className="app-logo" src="/icon.svg" alt="" aria-hidden="true" />
          <div>
            <h1>Todo</h1>
            <p className="save-status">
              {user ? "Synced account" : "Local mode"}
            </p>
          </div>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Open menu"
          onClick={() => setIsMenuOpen(true)}
        >
          Menu
        </button>
      </header>

      {isMenuOpen ? (
        <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}>
          <aside
            className="side-menu"
            aria-label="Settings and account"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="menu-header">
              <div>
                <h2>Menu</h2>
                <p className="muted">{syncMessage}</p>
                <p className="muted">
                  {lastSavedAt ? `Saved ${formatDate(lastSavedAt)}` : "Ready"}
                </p>
              </div>
              <button
                className="icon-button"
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                Close
              </button>
            </div>

            <section className="menu-section">
              <h3>Appearance</h3>
              <label className="toggle-row">
                <span>Dark mode</span>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={(event) => setIsDarkMode(event.target.checked)}
                />
              </label>
            </section>

            <section className="menu-section" aria-labelledby="account">
              <h3 id="account">Account Sync</h3>
              <p className="muted">
                {user
                  ? `Signed in as ${user.email}`
                  : authLoading
                    ? "Checking account..."
                    : "Sign in to sync tasks between devices."}
              </p>
              {authMessage ? <p className="muted">{authMessage}</p> : null}
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
                  <button type="submit" disabled={authSubmitting}>
                    Sign in
                  </button>
                  <button
                    type="button"
                    disabled={authSubmitting}
                    onClick={handleCreateAccount}
                  >
                    Create account
                  </button>
                </form>
              )}
            </section>

            <section className="menu-section">
              <h3>Backup</h3>
              <div className="backup-actions">
                <button type="button" onClick={exportBackup}>
                  Export
                </button>
                <label className="import-button">
                  <span>Import</span>
                  <input
                    type="file"
                    accept="application/json"
                    onChange={importBackup}
                  />
                </label>
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      {importMessage ? <p className="import-message">{importMessage}</p> : null}

      <section aria-labelledby="active-tasks">
        <h2 id="active-tasks">Active Tasks</h2>

        <div className="task-grid active-task-grid">
          {isAddTaskOpen ? (
            <section className="task add-panel" aria-labelledby="add-task">
              <div className="panel-header">
                <h2 id="add-task">Add Task</h2>
                <button type="button" onClick={closeAddTask}>
                  Cancel
                </button>
              </div>
              <form className="task-form" onSubmit={handleAddTask}>
                <label className="title-field">
                  <span>Task</span>
                  <input
                    autoFocus
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
                    max={getMaxDueDateInputValue()}
                    value={draft.dueDate}
                    onChange={(event) =>
                      setDraft({ ...draft, dueDate: event.target.value })
                    }
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

                <label>
                  <span>Repeat</span>
                  <select
                    value={draft.repeat}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        repeat: event.target.value as TaskRepeat,
                      })
                    }
                  >
                    <option value="none">No repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
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
            </section>
          ) : (
            <button
              className="task add-task-trigger"
              type="button"
              onClick={() => setIsAddTaskOpen(true)}
            >
              <span className="add-plus">+</span>
              <span>Add task</span>
            </button>
          )}

          {activeTasks.map((task, index) => renderTask(task, index < 4, index))}
        </div>

        {!activeTasks.length ? (
          <p className="empty-state">No active tasks yet.</p>
        ) : null}
      </section>

      <section aria-labelledby="completed-tasks">
        <h2 id="completed-tasks">Completed Archive</h2>
        {completedTasks.length ? (
          <div className="task-grid">
            {completedTasks.map((task) => renderTask(task))}
          </div>
        ) : (
          <p className="empty-state">Completed tasks will appear here.</p>
        )}
      </section>
    </main>
  );
}
