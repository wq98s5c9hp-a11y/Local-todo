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
type StandardTaskRepeat = "none" | "daily" | "weekly" | "monthly" | "yearly";
type TaskRepeat = StandardTaskRepeat | `custom:${number}`;
type EstimateUnit = "minutes" | "hours" | "days" | "weeks";
type TaskFlagType =
  | "red_flag"
  | "green_flag"
  | "red_circle"
  | "green_circle"
  | "red_x"
  | "green_x";
type ColorScheme =
  | "cmyk"
  | "storybook"
  | "earth"
  | "mustard"
  | "acid"
  | "tonal"
  | "grayscale";
type DropPlacement = {
  taskId: string;
  placement: "before" | "after";
};
type MenuTab = "settings" | "how-to" | "info" | "archive";
type SignupConfirmStep = "first" | "joke" | "second";
type SortMode = "master" | "due" | "urgency" | "importance" | "effort" | "created";
type SortDirection = "desc" | "asc";

type Task = {
  id: string;
  title: string;
  importance: TaskImportance;
  estimatedDuration: string;
  dueDate: string;
  dueTime: string;
  dueEndTime: string;
  durationMinutes: number | null;
  urgentBeforeDays: number;
  sortOrder: number | null;
  details: string;
  repeat: TaskRepeat;
  flagged: boolean;
  flagType: TaskFlagType;
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
  dueTime: string;
  dueEndTime: string;
  durationMinutes: number | null;
  urgentBeforeDays: number;
  details: string;
  repeat: TaskRepeat;
  flagged: boolean;
  flagType: TaskFlagType;
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
  due_time: string | null;
  due_end_time: string | null;
  duration_minutes: number | null;
  urgent_before_days: number;
  sort_order: number | null;
  details: string;
  repeat: TaskRepeat;
  flagged: boolean;
  flag_type: TaskFlagType;
  completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

const STORAGE_KEY = "local-first-todo.tasks";
const APP_VERSION = "2.5";
const THEME_STORAGE_KEY = "local-first-todo.theme";
const COLOR_SCHEME_STORAGE_KEY = "local-first-todo.color-scheme";
const SATURATION_STORAGE_KEY = "local-first-todo.saturation";
const SYNCED_USER_STORAGE_KEY = "local-first-todo.synced-user";
const SORT_MODE_STORAGE_KEY = "local-first-todo.sort-mode";
const SORT_DIRECTION_STORAGE_KEY = "local-first-todo.sort-direction";
const MOVE_BLOCKED_ALERT_MS = 5000;
const BACKUP_VERSION = 1;
const DAY_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_AFTER_DAYS = 7;
const MAX_DUE_DAYS = 365;
const MANUAL_BIAS_STEP = 80;
const MAX_MANUAL_BIAS = 520;
const FLAGGED_SCORE = 220;
const DAY_MINUTES = 24 * 60;

const emptyDraft: TaskDraft = {
  title: "",
  importance: "medium",
  estimatedDuration: "",
  dueDate: "",
  dueTime: "",
  dueEndTime: "",
  durationMinutes: null,
  urgentBeforeDays: 1,
  details: "",
  repeat: "none",
  flagged: false,
  flagType: "red_flag",
};

const importanceWeight: Record<TaskImportance, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

const estimateUnits: EstimateUnit[] = ["minutes", "hours", "days", "weeks"];
const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const minutes = index * 15;

  return {
    value: minutesToTimeValue(minutes),
    label: formatMinutesAsMeridiem(minutes),
  };
});
const durationOptions = Array.from({ length: 48 }, (_, index) => {
  const minutes = (index + 1) * 15;

  return {
    value: minutes,
    label: formatDuration(minutes),
  };
});
const flagTypeOptions: Array<{ value: TaskFlagType; label: string }> = [
  { value: "red_flag", label: "Red flag" },
  { value: "green_flag", label: "Green flag" },
  { value: "red_circle", label: "Red circle" },
  { value: "green_circle", label: "Green circle" },
  { value: "red_x", label: "Red X" },
  { value: "green_x", label: "Green X" },
];
const colorSchemeOptions: Array<{ value: ColorScheme; label: string }> = [
  { value: "cmyk", label: "CMYK Pop" },
  { value: "storybook", label: "Storybook Muted" },
  { value: "earth", label: "Earth Workspace" },
  { value: "mustard", label: "Mustard Cinema" },
  { value: "acid", label: "Acid Terminal" },
  { value: "tonal", label: "Tonal Contemporary" },
  { value: "grayscale", label: "Full Greyscale" },
];
const sortModeOptions: Array<{ value: SortMode; label: string }> = [
  { value: "master", label: "Master" },
  { value: "due", label: "Due date" },
  { value: "urgency", label: "Urgency" },
  { value: "importance", label: "Importance" },
  { value: "effort", label: "Effort size" },
  { value: "created", label: "Created" },
];
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
  if (typeof value === "string" && /^custom:\d+$/.test(value)) {
    return true;
  }

  return (
    value === "none" ||
    value === "daily" ||
    value === "weekly" ||
    value === "monthly" ||
    value === "yearly"
  );
}

function isSortMode(value: unknown): value is SortMode {
  return (
    value === "master" ||
    value === "due" ||
    value === "urgency" ||
    value === "importance" ||
    value === "effort" ||
    value === "created"
  );
}

function isSortDirection(value: unknown): value is SortDirection {
  return value === "asc" || value === "desc";
}

function normalizeCustomRepeatDays(value: unknown) {
  const numericValue =
    typeof value === "string" ? Number.parseInt(value, 10) : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 28;
  }

  return Math.max(1, Math.min(MAX_DUE_DAYS, Math.round(numericValue)));
}

function getCustomRepeatDays(repeat: TaskRepeat) {
  if (!repeat.startsWith("custom:")) {
    return 28;
  }

  return normalizeCustomRepeatDays(repeat.replace("custom:", ""));
}

function createCustomRepeat(days: unknown): TaskRepeat {
  return `custom:${normalizeCustomRepeatDays(days)}`;
}

function getRepeatSelectValue(repeat: TaskRepeat) {
  return repeat.startsWith("custom:") ? "custom" : repeat;
}

function isEstimateUnit(value: unknown): value is EstimateUnit {
  return (
    value === "minutes" ||
    value === "hours" ||
    value === "days" ||
    value === "weeks"
  );
}

function isTaskFlagType(value: unknown): value is TaskFlagType {
  return (
    value === "red_flag" ||
    value === "green_flag" ||
    value === "red_circle" ||
    value === "green_circle" ||
    value === "red_x" ||
    value === "green_x"
  );
}

function isColorScheme(value: unknown): value is ColorScheme {
  return (
    value === "cmyk" ||
    value === "storybook" ||
    value === "earth" ||
    value === "mustard" ||
    value === "acid" ||
    value === "tonal" ||
    value === "grayscale"
  );
}

function normalizeUrgentBeforeDays(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return 1;
  }

  return Math.round(value);
}

function normalizeSortOrder(value: unknown) {
  const clampSortOrder = (sortOrder: number) =>
    Math.max(-MAX_MANUAL_BIAS, Math.min(MAX_MANUAL_BIAS, sortOrder));

  if (typeof value === "number" && Number.isFinite(value)) {
    return clampSortOrder(value);
  }

  if (typeof value === "string") {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? clampSortOrder(parsedValue) : null;
  }

  return null;
}

function normalizeDurationMinutes(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return Math.min(DAY_MINUTES, Math.round(value / 15) * 15);
}

function minutesToTimeValue(totalMinutes: number) {
  const normalizedMinutes = ((totalMinutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeValueToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatMinutesAsMeridiem(totalMinutes: number) {
  const normalizedMinutes = ((totalMinutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;
  const displayHours = hours % 12 || 12;
  const period = hours < 12 ? "AM" : "PM";

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const hourLabel = `${hours} hr${hours === 1 ? "" : "s"}`;

  return remainingMinutes ? `${hourLabel} ${remainingMinutes} min` : hourLabel;
}

function addDurationToTime(startTime: string, durationMinutes: number | null) {
  const startMinutes = timeValueToMinutes(startTime);

  if (startMinutes === null || durationMinutes === null) {
    return "";
  }

  return minutesToTimeValue(startMinutes + durationMinutes);
}

function getDurationBetweenTimes(startTime: string, endTime: string) {
  const startMinutes = timeValueToMinutes(startTime);
  const endMinutes = timeValueToMinutes(endTime);

  if (startMinutes === null || endMinutes === null) {
    return null;
  }

  const rawDuration = endMinutes > startMinutes
    ? endMinutes - startMinutes
    : endMinutes + DAY_MINUTES - startMinutes;

  return normalizeDurationMinutes(rawDuration);
}

function normalizeTimeValue(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const minutes = timeValueToMinutes(value.slice(0, 5));

  return minutes === null ? "" : minutesToTimeValue(minutes);
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
    dueTime: normalizeTimeValue(task.dueTime),
    dueEndTime: normalizeTimeValue(task.dueEndTime),
    durationMinutes: normalizeDurationMinutes(task.durationMinutes),
    urgentBeforeDays: normalizeUrgentBeforeDays(task.urgentBeforeDays),
    sortOrder: normalizeSortOrder(task.sortOrder),
    details: typeof task.details === "string" ? task.details : "",
    repeat: isTaskRepeat(task.repeat)
      ? task.repeat.startsWith("custom:")
        ? createCustomRepeat(getCustomRepeatDays(task.repeat))
        : task.repeat
      : "none",
    flagged: typeof task.flagged === "boolean" ? task.flagged : false,
    flagType: isTaskFlagType(task.flagType) ? task.flagType : "red_flag",
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

function loadColorScheme(): ColorScheme {
  const savedScheme = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);

  if (savedScheme === "neon") {
    return "acid";
  }

  if (savedScheme === "apple") {
    return "tonal";
  }

  return isColorScheme(savedScheme) ? savedScheme : "earth";
}

function loadSaturation() {
  const rawSaturation = window.localStorage.getItem(SATURATION_STORAGE_KEY);

  if (rawSaturation === null || rawSaturation === "0") {
    return 90;
  }

  const savedSaturation = Number(rawSaturation);

  if (!Number.isFinite(savedSaturation)) {
    return 90;
  }

  return Math.max(0, Math.min(100, Math.round(savedSaturation)));
}

function loadSortMode(): SortMode {
  const savedMode = window.localStorage.getItem(SORT_MODE_STORAGE_KEY);

  return isSortMode(savedMode) ? savedMode : "master";
}

function loadSortDirection(): SortDirection {
  const savedDirection = window.localStorage.getItem(SORT_DIRECTION_STORAGE_KEY);

  return isSortDirection(savedDirection) ? savedDirection : "desc";
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

function getManualBias(task: Task) {
  return task.sortOrder ?? 0;
}

function clampManualBias(value: number) {
  return Math.max(-MAX_MANUAL_BIAS, Math.min(MAX_MANUAL_BIAS, value));
}

function getStableTieBreak(task: Task) {
  let hash = 0;

  for (const character of task.id) {
    hash = (hash * 31 + character.charCodeAt(0)) % 1000;
  }

  return hash / 1000000;
}

function compareValues(firstValue: number, secondValue: number, direction: SortDirection) {
  return direction === "desc"
    ? secondValue - firstValue
    : firstValue - secondValue;
}

function compareOptionalValues(
  firstValue: number | null,
  secondValue: number | null,
  direction: SortDirection,
) {
  if (firstValue === null && secondValue === null) {
    return 0;
  }

  if (firstValue === null) {
    return 1;
  }

  if (secondValue === null) {
    return -1;
  }

  return compareValues(firstValue, secondValue, direction);
}

function getDueSortValue(task: Task) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  return daysUntilDue;
}

function getEffortSortValue(task: Task) {
  if (!task.estimatedDuration) {
    return null;
  }

  return estimateUnits.indexOf(parseEstimateUnit(task.estimatedDuration));
}

function getDueScore(daysUntilDue: number | null) {
  if (daysUntilDue === null) {
    return 0;
  }

  if (daysUntilDue < 0) {
    return 2200 + Math.min(365, Math.abs(daysUntilDue)) * 4;
  }

  if (daysUntilDue === 0) {
    return 1800;
  }

  if (daysUntilDue === 1) {
    return 1350;
  }

  if (daysUntilDue <= 3) {
    return 950 - daysUntilDue * 80;
  }

  if (daysUntilDue <= 7) {
    return 520 - daysUntilDue * 25;
  }

  if (daysUntilDue <= 14) {
    return 260 - daysUntilDue * 8;
  }

  if (daysUntilDue <= 30) {
    return 95 - daysUntilDue * 1.5;
  }

  return Math.max(0, 35 - daysUntilDue * 0.35);
}

function getFlagScore(task: Task) {
  return task.flagged ? FLAGGED_SCORE : 0;
}

function getTaskBaseScore(task: Task) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const importanceScore = (importanceWeight[task.importance] - 1) * 34;
  const urgentThresholdScore =
    daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= task.urgentBeforeDays
      ? 120
      : 0;

  return (
    getDueScore(daysUntilDue) +
    importanceScore +
    urgentThresholdScore +
    getFlagScore(task)
  );
}

function getTaskScore(task: Task) {
  return getTaskBaseScore(task) + getManualBias(task) + getStableTieBreak(task);
}

function isDeadlineCritical(task: Task) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  return (
    daysUntilDue !== null &&
    (daysUntilDue < 0 ||
      daysUntilDue === 0 ||
      (daysUntilDue >= 0 && daysUntilDue <= task.urgentBeforeDays))
  );
}

function rebalanceVisibleFlaggedTasks(sortedTasks: Task[]) {
  const topFour = sortedTasks.slice(0, 4);
  const topFourHasFlaggedNoDate = topFour.some(
    (task) => task.flagged && !task.dueDate && !task.completed,
  );
  const deadlineCriticalCount = topFour.filter(isDeadlineCritical).length;

  if (topFourHasFlaggedNoDate || deadlineCriticalCount >= 2) {
    return sortedTasks;
  }

  const flaggedNoDateTask = sortedTasks
    .slice(4)
    .find((task) => task.flagged && !task.dueDate && !task.completed);

  if (!flaggedNoDateTask) {
    return sortedTasks;
  }

  const remainingTasks = sortedTasks.filter((task) => task.id !== flaggedNoDateTask.id);
  const insertionIndex = Math.min(3, remainingTasks.length);

  return [
    ...remainingTasks.slice(0, insertionIndex),
    flaggedNoDateTask,
    ...remainingTasks.slice(insertionIndex),
  ];
}

function getBiasForDesiredIndex(
  movedTask: Task,
  orderedTasksWithoutMovedTask: Task[],
  desiredIndex: number,
) {
  const taskBefore = orderedTasksWithoutMovedTask[desiredIndex - 1];
  const taskAfter = orderedTasksWithoutMovedTask[desiredIndex];
  const movedBaseScore = getTaskBaseScore(movedTask);
  let desiredScore = movedBaseScore;

  if (taskBefore && taskAfter) {
    desiredScore = (getTaskScore(taskBefore) + getTaskScore(taskAfter)) / 2;
  } else if (taskAfter) {
    desiredScore = getTaskScore(taskAfter) + 2;
  } else if (taskBefore) {
    desiredScore = getTaskScore(taskBefore) - 2;
  }

  return clampManualBias(desiredScore - movedBaseScore);
}

function parseEstimateUnit(value: string): EstimateUnit {
  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue.includes("week")) {
    return "weeks";
  }

  if (normalizedValue.includes("day")) {
    return "days";
  }

  if (
    normalizedValue.includes("hour") ||
    normalizedValue.includes("hr")
  ) {
    return "hours";
  }

  return "minutes";
}

function updateDraftStartTime(draft: TaskDraft, dueTime: string): TaskDraft {
  const normalizedDueTime = normalizeTimeValue(dueTime);
  const nextEndTime = normalizedDueTime
    ? addDurationToTime(normalizedDueTime, draft.durationMinutes)
    : "";

  return {
    ...draft,
    dueTime: normalizedDueTime,
    dueEndTime: nextEndTime || draft.dueEndTime,
  };
}

function updateDraftEndTime(draft: TaskDraft, dueEndTime: string): TaskDraft {
  const normalizedEndTime = normalizeTimeValue(dueEndTime);

  return {
    ...draft,
    dueEndTime: normalizedEndTime,
    durationMinutes: normalizedEndTime
      ? getDurationBetweenTimes(draft.dueTime, normalizedEndTime)
      : draft.durationMinutes,
  };
}

function updateDraftDuration(
  draft: TaskDraft,
  durationMinutes: number | null,
): TaskDraft {
  const normalizedDuration = normalizeDurationMinutes(durationMinutes);

  return {
    ...draft,
    durationMinutes: normalizedDuration,
    dueEndTime: draft.dueTime
      ? addDurationToTime(draft.dueTime, normalizedDuration)
      : draft.dueEndTime,
  };
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
    return "Due";
  }

  if (daysUntilDue <= task.urgentBeforeDays) {
    return "Urgent";
  }

  return "";
}

function getImportanceLabel(importance: TaskImportance) {
  return importance[0].toUpperCase() + importance.slice(1);
}

function getDueDateParts(value: string) {
  const date = parseLocalDate(value);

  if (!date) {
    return null;
  }

  return {
    month: new Intl.DateTimeFormat(undefined, { month: "short" }).format(date),
    day: String(date.getDate()),
  };
}

function getDueDaysChip(task: Task) {
  const daysUntilDue = getDaysUntilDue(task.dueDate);

  if (daysUntilDue === null) {
    return null;
  }

  if (daysUntilDue < 0) {
    return {
      label: "late",
      tone: "red",
    };
  }

  if (daysUntilDue <= 3) {
    return {
      label: `${daysUntilDue}d`,
      tone: "red",
    };
  }

  if (daysUntilDue <= 7) {
    return {
      label: `${daysUntilDue}d`,
      tone: "yellow",
    };
  }

  return {
    label: `${daysUntilDue}d`,
    tone: "blue",
  };
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

function formatTime(value: string) {
  if (!value) {
    return "";
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat(undefined, {
    timeStyle: "short",
  }).format(date);
}

function getFlagIcon(flagType: TaskFlagType) {
  switch (flagType) {
    case "green_flag":
    case "red_flag":
      return "⚑";
    case "green_circle":
    case "red_circle":
      return "●";
    case "green_x":
    case "red_x":
      return "×";
    default:
      return "⚑";
  }
}

function getFlagTone(flagType: TaskFlagType) {
  // Marker style is visual only for now; the flagged state means "keep visible".
  return flagType.startsWith("green") ? "green" : "red";
}

function createTaskFromDraft(draft: TaskDraft): Task {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: draft.title.trim(),
    importance: draft.importance,
    estimatedDuration: draft.estimatedDuration.trim(),
    dueDate: normalizeDueDate(draft.dueDate),
    dueTime: normalizeTimeValue(draft.dueTime),
    dueEndTime: normalizeTimeValue(draft.dueEndTime),
    durationMinutes: normalizeDurationMinutes(draft.durationMinutes),
    urgentBeforeDays: draft.urgentBeforeDays,
    sortOrder: 0,
    details: draft.details.trim(),
    repeat: draft.repeat,
    flagged: draft.flagged,
    flagType: draft.flagType,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

function formatRepeat(value: TaskRepeat) {
  if (value.startsWith("custom:")) {
    const days = getCustomRepeatDays(value);

    return `Every ${days} day${days === 1 ? "" : "s"}`;
  }

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

  if (repeat.startsWith("custom:")) {
    nextDate.setDate(nextDate.getDate() + getCustomRepeatDays(repeat));
    return nextDate;
  }

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
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate;
}

function createNextRepeatingTask(task: Task, completedAt: string): Task | null {
  if (task.repeat === "none") {
    return null;
  }

  const repeatFromDate = parseLocalDate(task.dueDate) ?? new Date(completedAt);
  const nextDueDate = addRepeatInterval(repeatFromDate, task.repeat);

  return {
    ...task,
    id: createId(),
    completed: false,
    completedAt: undefined,
    dueDate: normalizeDueDate(formatDateInputValue(nextDueDate)),
    sortOrder: 0,
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
    due_time: task.dueTime || null,
    due_end_time: task.dueEndTime || null,
    duration_minutes: task.durationMinutes,
    urgent_before_days: task.urgentBeforeDays,
    sort_order: task.sortOrder,
    details: task.details,
    repeat: task.repeat,
    flagged: task.flagged,
    flag_type: task.flagType,
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
    dueTime: normalizeTimeValue(row.due_time),
    dueEndTime: normalizeTimeValue(row.due_end_time),
    durationMinutes: normalizeDurationMinutes(row.duration_minutes),
    urgentBeforeDays: row.urgent_before_days,
    sortOrder: normalizeSortOrder(row.sort_order),
    details: row.details,
    repeat: isTaskRepeat(row.repeat)
      ? row.repeat.startsWith("custom:")
        ? createCustomRepeat(getCustomRepeatDays(row.repeat))
        : row.repeat
      : "none",
    flagged: row.flagged ?? false,
    flagType: isTaskFlagType(row.flag_type) ? row.flag_type : "red_flag",
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

function sortActiveTasks(
  taskList: Task[],
  sortMode: SortMode = "master",
  sortDirection: SortDirection = "desc",
) {
  const sortedTasks = taskList
    .filter((task) => !task.completed)
    .sort((firstTask, secondTask) => {
      if (sortMode === "due") {
        const difference = compareOptionalValues(
          getDueSortValue(firstTask),
          getDueSortValue(secondTask),
          sortDirection,
        );

        if (difference !== 0) {
          return difference;
        }
      }

      if (sortMode === "urgency") {
        const difference = compareValues(
          getTaskBaseScore(firstTask),
          getTaskBaseScore(secondTask),
          sortDirection,
        );

        if (difference !== 0) {
          return difference;
        }
      }

      if (sortMode === "importance") {
        const difference = compareValues(
          importanceWeight[firstTask.importance],
          importanceWeight[secondTask.importance],
          sortDirection,
        );

        if (difference !== 0) {
          return difference;
        }
      }

      if (sortMode === "effort") {
        const difference = compareOptionalValues(
          getEffortSortValue(firstTask),
          getEffortSortValue(secondTask),
          sortDirection,
        );

        if (difference !== 0) {
          return difference;
        }
      }

      if (sortMode === "created") {
        const difference = compareValues(
          new Date(firstTask.createdAt).getTime(),
          new Date(secondTask.createdAt).getTime(),
          sortDirection,
        );

        if (difference !== 0) {
          return difference;
        }
      }

      const scoreDifference = getTaskScore(secondTask) - getTaskScore(firstTask);

      if (scoreDifference !== 0) {
        return sortMode === "master" && sortDirection === "asc"
          ? -scoreDifference
          : scoreDifference;
      }

      const createdDifference =
        new Date(secondTask.createdAt).getTime() -
        new Date(firstTask.createdAt).getTime();

      return sortMode === "master" && sortDirection === "asc"
        ? -createdDifference
        : createdDifference;
    });

  return sortMode === "master" && sortDirection === "desc"
    ? rebalanceVisibleFlaggedTasks(sortedTasks)
    : sortedTasks;
}

function sortCompletedTasks(taskList: Task[]) {
  return [...taskList].sort((firstTask, secondTask) => {
    const firstTime = firstTask.completedAt
      ? new Date(firstTask.completedAt).getTime()
      : 0;
    const secondTime = secondTask.completedAt
      ? new Date(secondTask.completedAt).getTime()
      : 0;

    return secondTime - firstTime;
  });
}

function getSuggestedNextTask(taskList: Task[]) {
  const effortTasks = taskList.filter(
    (task) => !task.completed && getEffortSortValue(task) !== null,
  );

  if (!effortTasks.length) {
    return sortActiveTasks(taskList, "master", "desc")[0] ?? null;
  }

  return [...effortTasks].sort((firstTask, secondTask) => {
    const effortDifference =
      (getEffortSortValue(firstTask) ?? Number.MAX_SAFE_INTEGER) -
      (getEffortSortValue(secondTask) ?? Number.MAX_SAFE_INTEGER);

    if (effortDifference !== 0) {
      return effortDifference;
    }

    const urgencyDifference = getTaskScore(secondTask) - getTaskScore(firstTask);

    if (urgencyDifference !== 0) {
      return urgencyDifference;
    }

    return getStableTieBreak(firstTask) - getStableTieBreak(secondTask);
  })[0];
}

function isArchivedTask(task: Task) {
  if (!task.completed || !task.completedAt) {
    return false;
  }

  return Date.now() - new Date(task.completedAt).getTime() > ARCHIVE_AFTER_DAYS * DAY_MS;
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
  const [menuTab, setMenuTab] = useState<MenuTab>("settings");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isDraftSpecificTimeEnabled, setIsDraftSpecificTimeEnabled] =
    useState(false);
  const [signupConfirmStep, setSignupConfirmStep] =
    useState<SignupConfirmStep | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => loadDarkMode());
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() =>
    loadColorScheme(),
  );
  const [saturation, setSaturation] = useState(() => loadSaturation());
  const [sortMode, setSortMode] = useState<SortMode>(() => loadSortMode());
  const [sortDirection, setSortDirection] = useState<SortDirection>(() =>
    loadSortDirection(),
  );
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dropPlacement, setDropPlacement] = useState<DropPlacement | null>(null);
  const [blockedMoveTaskId, setBlockedMoveTaskId] = useState<string | null>(null);
  const loadingCloudRef = useRef(false);
  const cloudRefreshTimerRef = useRef<number | null>(null);
  const blockedMoveTimerRef = useRef<number | null>(null);
  const completingTaskIdsRef = useRef<Set<string>>(new Set());
  const previousViewYRef = useRef<number | null>(null);
  const draftDueDateRef = useRef<HTMLInputElement | null>(null);
  const editingDueDateRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);

      if (event === "SIGNED_OUT") {
        clearLocalTasks("Signed out and cleared this browser's visible tasks.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (blockedMoveTimerRef.current) {
        window.clearTimeout(blockedMoveTimerRef.current);
      }
    };
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
    document.documentElement.dataset.scheme = colorScheme;
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--app-saturation",
      `${saturation}%`,
    );
    window.localStorage.setItem(SATURATION_STORAGE_KEY, String(saturation));
  }, [saturation]);

  useEffect(() => {
    window.localStorage.setItem(SORT_MODE_STORAGE_KEY, sortMode);
  }, [sortMode]);

  useEffect(() => {
    window.localStorage.setItem(SORT_DIRECTION_STORAGE_KEY, sortDirection);
  }, [sortDirection]);

  useEffect(() => {
    if (!importMessage) {
      return undefined;
    }

    const messageTimer = window.setTimeout(() => {
      setImportMessage("");
    }, 90000);

    return () => window.clearTimeout(messageTimer);
  }, [importMessage]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Element &&
        !target.closest(".date-control")
      ) {
        closeOpenDatePicker();
      }

      if (
        editingTaskId &&
        target instanceof Element &&
        !target.closest(".task-editing") &&
        !target.closest(".edit-action")
      ) {
        cancelEditing();
      }

      if (
        expandedTaskIds.size &&
        target instanceof Element &&
        !target.closest(".task-info-open") &&
        !target.closest(".details-action")
      ) {
        closeExpandedInfo();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [editingTaskId, expandedTaskIds]);

  useEffect(() => {
    if (!user) {
      setSyncMessage("Local mode");
      return;
    }

    loadCloudTasks(user);
    // Only rerun when the signed-in account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const refreshCloudTasks = () => {
      loadCloudTasks(user, { syncAfterLoad: false });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshCloudTasks();
      }
    };

    window.addEventListener("focus", refreshCloudTasks);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const channel = supabase
      .channel(`tasks-live-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          if (cloudRefreshTimerRef.current) {
            window.clearTimeout(cloudRefreshTimerRef.current);
          }

          cloudRefreshTimerRef.current = window.setTimeout(() => {
            loadCloudTasks(user, { syncAfterLoad: false });
          }, 250);
        },
      )
      .subscribe();

    return () => {
      window.removeEventListener("focus", refreshCloudTasks);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (cloudRefreshTimerRef.current) {
        window.clearTimeout(cloudRefreshTimerRef.current);
      }

      supabase.removeChannel(channel);
    };
    // Only rerun when the signed-in account changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const activeTasks = useMemo(
    () => sortActiveTasks(tasks, sortMode, sortDirection),
    [tasks, sortDirection, sortMode],
  );

  const allCompletedTasks = useMemo(
    () => sortCompletedTasks(tasks.filter((task) => task.completed)),
    [tasks],
  );

  const completedTasks = useMemo(
    () => allCompletedTasks.filter((task) => !isArchivedTask(task)),
    [allCompletedTasks],
  );

  const archivedTasks = useMemo(
    () => allCompletedTasks.filter(isArchivedTask),
    [allCompletedTasks],
  );

  const suggestedNextTask = useMemo(
    () => getSuggestedNextTask(tasks),
    [tasks],
  );

  async function syncCloudTasks(nextTasks: Task[], currentUser = user) {
    if (!currentUser || loadingCloudRef.current) {
      return false;
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
      return false;
    }

    if (taskRows.length) {
      const { error: upsertError } = await supabase
        .from("tasks")
        .upsert(taskRows, { onConflict: "id" });

      if (upsertError) {
        setSyncMessage(`Sync error: ${upsertError.message}`);
        return false;
      }
    }

    window.localStorage.setItem(SYNCED_USER_STORAGE_KEY, currentUser.id);
    setSyncMessage(`Synced ${formatDate(new Date().toISOString())}`);
    return true;
  }

  async function loadCloudTasks(
    currentUser: User,
    options: { syncAfterLoad?: boolean } = {},
  ) {
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
    const mergedTasks = cloudTasks;

    setTasks(mergedTasks);
    saveTasks(mergedTasks);
    loadingCloudRef.current = false;

    if (options.syncAfterLoad ?? true) {
      const syncSucceeded = await syncCloudTasks(mergedTasks, currentUser);

      if (!syncSucceeded) {
        saveTasks(mergedTasks);
      }

      return;
    }

    setSyncMessage(`Updated ${formatDate(new Date().toISOString())}`);
  }

  function persistTasks(nextTasks: Task[]) {
    setTasks(nextTasks);
    saveTasks(nextTasks);
    syncCloudTasks(nextTasks);
  }

  function clearLocalTasks(message = "Local tasks cleared.") {
    setTasks([]);
    saveTasks([]);
    setExpandedTaskIds(new Set());
    setEditingTaskId(null);
    setEditingDraft(emptyDraft);
    setIsAddTaskOpen(false);
    setDraft(emptyDraft);
    setIsDraftSpecificTimeEnabled(false);
    window.localStorage.removeItem(SYNCED_USER_STORAGE_KEY);
    setSyncMessage("Local mode");
    setImportMessage(message);
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

  function showDatePicker(input: HTMLInputElement | null) {
    if (!input) {
      return;
    }

    const dateInput = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.focus();
  }

  function closeOpenDatePicker() {
    draftDueDateRef.current?.blur();
    editingDueDateRef.current?.blur();
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
    const documentWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => void;
    };

    if (!documentWithTransition.startViewTransition) {
      setIsAddTaskOpen(false);
      setDraft(emptyDraft);
      setIsDraftSpecificTimeEnabled(false);
      return;
    }

    documentWithTransition.startViewTransition(() => {
      setIsAddTaskOpen(false);
      setDraft(emptyDraft);
      setIsDraftSpecificTimeEnabled(false);
    });
  }

  function startCreateAccountConfirmation() {
    const credentials = validateAuthFields();

    if (!credentials) {
      return;
    }

    setSignupConfirmStep("first");
  }

  async function createAccountAfterConfirmation() {
    const credentials = validateAuthFields();

    if (!credentials) {
      setSignupConfirmStep(null);
      return;
    }

    setSignupConfirmStep(null);
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
    setAuthEmail("");
    setAuthPassword("");
    setAuthMessage("Signed out. This browser's visible task list was cleared.");
    clearLocalTasks("Signed out and cleared this browser's visible tasks.");
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.title.trim()) {
      return;
    }

    persistTasksWithTransition([createTaskFromDraft(draft), ...tasks]);
    setDraft(emptyDraft);
    setIsDraftSpecificTimeEnabled(false);
    setIsAddTaskOpen(false);
  }

  function rememberViewPosition() {
    previousViewYRef.current = window.scrollY;
  }

  function restorePreviousView() {
    const previousViewY = previousViewYRef.current;

    previousViewYRef.current = null;

    if (previousViewY === null) {
      return;
    }

    window.setTimeout(() => {
      window.scrollTo(0, previousViewY);
    }, 0);
  }

  function closeExpandedInfo() {
    setExpandedTaskIds(new Set());
    restorePreviousView();
  }

  function startEditing(task: Task) {
    if (!expandedTaskIds.has(task.id)) {
      rememberViewPosition();
    }

    setEditingTaskId(task.id);
    setEditingDraft({
      title: task.title,
      importance: task.importance,
      estimatedDuration: task.estimatedDuration,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      dueEndTime: task.dueEndTime,
      durationMinutes: task.durationMinutes,
      urgentBeforeDays: task.urgentBeforeDays,
      details: task.details,
      repeat: task.repeat,
      flagged: task.flagged,
      flagType: task.flagType,
    });
    setExpandedTaskIds(new Set());
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditingDraft(emptyDraft);
    restorePreviousView();
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
              dueTime: normalizeTimeValue(editingDraft.dueTime),
              dueEndTime: normalizeTimeValue(editingDraft.dueEndTime),
              durationMinutes: normalizeDurationMinutes(editingDraft.durationMinutes),
              urgentBeforeDays: editingDraft.urgentBeforeDays,
              details: editingDraft.details.trim(),
              repeat: editingDraft.repeat,
              flagged: editingDraft.flagged,
              flagType: editingDraft.flagType,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    setEditingTaskId(null);
    setEditingDraft(emptyDraft);
    restorePreviousView();
  }

  function deleteTask(taskId: string) {
    persistTasks(tasks.filter((task) => task.id !== taskId));

    if (editingTaskId === taskId) {
      cancelEditing();
    }
  }

  function confirmDeleteTask(taskId: string) {
    if (window.confirm("Delete this task? This cannot be undone.")) {
      deleteTask(taskId);
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
              sortOrder: 0,
              updatedAt: now,
            }
          : task,
      ),
    );
  }

  function showBlockedMoveAlert(taskId: string) {
    setBlockedMoveTaskId(taskId);

    if (blockedMoveTimerRef.current) {
      window.clearTimeout(blockedMoveTimerRef.current);
    }

    blockedMoveTimerRef.current = window.setTimeout(() => {
      setBlockedMoveTaskId((currentTaskId) =>
        currentTaskId === taskId ? null : currentTaskId,
      );
      blockedMoveTimerRef.current = null;
    }, MOVE_BLOCKED_ALERT_MS);
  }

  function toggleTaskFlag(taskId: string) {
    persistTasks(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              flagged: !task.flagged,
              updatedAt: new Date().toISOString(),
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

    const movedTask = activeTasks[currentIndex];
    const orderedTasksWithoutMovedTask = activeTasks.filter(
      (task) => task.id !== taskId,
    );
    const desiredIndex =
      direction === "up" ? Math.max(0, currentIndex - 1) : currentIndex + 1;
    const nextBias = getBiasForDesiredIndex(
      movedTask,
      orderedTasksWithoutMovedTask,
      desiredIndex,
    );
    const adjustedBias =
      nextBias === getManualBias(movedTask)
        ? clampManualBias(
            getManualBias(movedTask) +
              (direction === "up" ? MANUAL_BIAS_STEP : -MANUAL_BIAS_STEP),
          )
        : nextBias;

    persistTasksWithTransition(
      tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              sortOrder: adjustedBias,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  }

  function moveTaskToPosition(
    taskId: string,
    targetTaskId: string,
    placement: "before" | "after" = "before",
  ) {
    if (taskId === targetTaskId) {
      return;
    }

    const movedTask = activeTasks.find((task) => task.id === taskId);
    const orderedTasksWithoutMovedTask = activeTasks.filter(
      (task) => task.id !== taskId,
    );
    const targetIndex = orderedTasksWithoutMovedTask.findIndex(
      (task) => task.id === targetTaskId,
    );
    const desiredIndex = placement === "after" ? targetIndex + 1 : targetIndex;

    if (!movedTask || targetIndex < 0) {
      return;
    }

    const nextBias = getBiasForDesiredIndex(
      movedTask,
      orderedTasksWithoutMovedTask,
      desiredIndex,
    );
    const currentIndex = activeTasks.findIndex((task) => task.id === taskId);
    const nextTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            sortOrder: nextBias,
            updatedAt: new Date().toISOString(),
          }
        : task,
    );
    const nextIndex = sortActiveTasks(nextTasks).findIndex(
      (task) => task.id === taskId,
    );

    persistTasksWithTransition(nextTasks);

    if (currentIndex === nextIndex && currentIndex !== desiredIndex) {
      showBlockedMoveAlert(taskId);
    }
  }

  function getDropPlacementFromPoint(
    clientX: number,
    clientY: number,
    movedTaskId: string,
  ): DropPlacement | null {
    const taskElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-active-task='true']"),
    ).filter((element) => element.dataset.taskId !== movedTaskId);

    if (!taskElements.length) {
      return null;
    }

    let nearestElement: HTMLElement | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const element of taskElements) {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(clientX - centerX, clientY - centerY);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestElement = element;
      }
    }

    if (!nearestElement?.dataset.taskId) {
      return null;
    }

    const rect = nearestElement.getBoundingClientRect();
    const placement =
      clientX < rect.left + rect.width / 2 ? "before" : "after";

    return {
      taskId: nearestElement.dataset.taskId,
      placement,
    };
  }

  function startGripMove(taskId: string) {
    setDraggingTaskId(taskId);
    setDropPlacement(null);
  }

  function updateGripMove(taskId: string, clientX: number, clientY: number) {
    if (draggingTaskId !== taskId) {
      return;
    }

    setDropPlacement(getDropPlacementFromPoint(clientX, clientY, taskId));
  }

  function finishGripMove(taskId: string) {
    if (draggingTaskId === taskId && dropPlacement) {
      moveTaskToPosition(taskId, dropPlacement.taskId, dropPlacement.placement);
    }

    setDraggingTaskId(null);
    setDropPlacement(null);
  }

  function toggleTaskDetails(taskId: string) {
    setExpandedTaskIds((currentIds) => {
      if (currentIds.has(taskId)) {
        restorePreviousView();
        return new Set();
      }

      rememberViewPosition();
      return new Set([taskId]);
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

  function buildClipboardSnapshot() {
    const exportedAt = new Date().toISOString();
    const taskForClipboard = (task: Task, index: number) => ({
      listPosition: index + 1,
      id: task.id,
      title: task.title,
      completed: task.completed,
      importance: task.importance,
      urgencyLabel: getUrgencyLabel(task) || null,
      daysUntilDue: getDaysUntilDue(task.dueDate),
      dueDate: task.dueDate || null,
      dueTime: task.dueTime || null,
      dueEndTime: task.dueEndTime || null,
      urgentBeforeDays: task.urgentBeforeDays,
      effortSize: task.estimatedDuration || null,
      actualDurationMinutes: task.durationMinutes,
      repeat: task.repeat,
      keepVisible: task.flagged,
      markerStyle: task.flagType,
      manualSortBias: task.sortOrder,
      details: task.details || null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt || null,
      rawTask: task,
    });
    const activeTasksForClipboard = activeTasks.map(taskForClipboard);
    const completedTasksForClipboard = allCompletedTasks.map(taskForClipboard);
    const payload = {
      app: "Tile Todo",
      exportedAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      summary: {
        activeTaskCount: activeTasks.length,
        completedTaskCount: allCompletedTasks.length,
        archivedTaskCount: archivedTasks.length,
        totalTaskCount: tasks.length,
      },
      activeTasks: activeTasksForClipboard,
      completedTasks: completedTasksForClipboard,
      archivedTasks: archivedTasks.map(taskForClipboard),
      allRawTasks: tasks,
    };

    const activeLines = activeTasksForClipboard.length
      ? activeTasksForClipboard
          .map((task) => {
            const due = task.dueDate ? ` due ${task.dueDate}` : "";
            const urgency = task.urgencyLabel ? ` ${task.urgencyLabel}` : "";
            const effort = task.effortSize ? ` effort ${task.effortSize}` : "";

            return `${task.listPosition}. ${task.title} [${task.importance}${urgency}${due}${effort}]`;
          })
          .join("\n")
      : "No active tasks.";

    return [
      "# Tile Todo Data Export",
      "",
      `Exported: ${exportedAt}`,
      `Active tasks: ${activeTasks.length}`,
      `Completed tasks: ${allCompletedTasks.length}`,
      "",
      "## Active Task Summary",
      activeLines,
      "",
      "## Full Structured Data",
      "```json",
      JSON.stringify(payload, null, 2),
      "```",
    ].join("\n");
  }

  async function copyDataToClipboard() {
    const snapshot = buildClipboardSnapshot();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snapshot);
      } else {
        const textArea = document.createElement("textarea");

        textArea.value = snapshot;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.append(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setImportMessage("Copied Tile Todo data.");
    } catch {
      setImportMessage("Could not copy data. Try Export instead.");
    }
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

  function renderEstimateControl(
    value: string,
    onChange: (nextValue: string) => void,
    emptyLabel = "No estimate",
  ) {
    const estimateUnit = parseEstimateUnit(value);

    return (
      <div className="estimate-control">
        <select
          value={value ? estimateUnit : ""}
          onChange={(event) => {
            if (!event.target.value) {
              onChange("");
              return;
            }

            const unit = isEstimateUnit(event.target.value)
              ? event.target.value
              : "minutes";

            onChange(unit);
          }}
        >
          <option value="">{emptyLabel}</option>
          {estimateUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit[0].toUpperCase() + unit.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderTimeSelect(
    value: string,
    onChange: (nextValue: string) => void,
    emptyLabel: string,
  ) {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{emptyLabel}</option>
        {timeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  function renderDurationControl(
    value: number | null,
    onChange: (nextValue: number | null) => void,
  ) {
    return (
      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
      >
        <option value="">No duration</option>
        {durationOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  function isHighlightedTask(task: Task, activeIndex: number) {
    const daysUntilDue = getDaysUntilDue(task.dueDate);

    return activeIndex < 4 || (daysUntilDue !== null && daysUntilDue <= 1);
  }

  function renderTask(task: Task, isFeatured = false, activeIndex: number | null = null) {
    const isEditing = editingTaskId === task.id;
    const isExpanded = expandedTaskIds.has(task.id);
    const urgencyLabel = getUrgencyLabel(task);
    const dueDateParts = getDueDateParts(task.dueDate);
    const dueDaysChip = getDueDaysChip(task);
    const flagTone = getFlagTone(task.flagType);
    const hasInfoDetails = Boolean(
      task.details ||
        task.dueDate ||
        task.dueTime ||
        task.estimatedDuration ||
        task.repeat !== "none" ||
        task.dueEndTime ||
        task.durationMinutes ||
        task.completedAt,
    );

    return (
      <article
        className={[
          "task",
          isFeatured ? "task-featured" : "",
          isEditing ? "task-editing" : "",
          isExpanded && !isEditing ? "task-info-open" : "",
          task.completed ? "task-completed" : "",
          draggingTaskId === task.id ? "task-dragging" : "",
          dropPlacement?.taskId === task.id ? "task-drop-target" : "",
          dropPlacement?.taskId === task.id
            ? `drop-${dropPlacement.placement}`
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
        key={task.id}
        data-task-id={task.id}
        data-active-task={activeIndex !== null ? "true" : undefined}
        style={
          {
            viewTransitionName: `task-${task.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`,
          } as CSSProperties
        }
        onClick={(event) => {
          if (
            isExpanded &&
            !isEditing &&
            !(event.target as Element).closest(".task-info-actions")
          ) {
            closeExpandedInfo();
          }
        }}
        >
        {blockedMoveTaskId === task.id ? (
          <div className="move-blocked-alert" aria-live="polite">
            Can't move, too important
          </div>
        ) : null}
        <button
          className={[
            "flag-toggle",
            task.flagged ? "is-flagged" : "",
            `flag-${flagTone}`,
          ]
            .filter(Boolean)
            .join(" ")}
          type="button"
          aria-label={task.flagged ? "Keep visible is on" : "Keep visible is off"}
          title={task.flagged ? "Keep visible is on" : "Keep visible is off"}
          onClick={(event) => {
            event.stopPropagation();
            toggleTaskFlag(task.id);
            if (isExpanded) {
              closeExpandedInfo();
            }
          }}
        >
          {getFlagIcon(task.flagType)}
        </button>
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
                spellCheck
                autoCorrect="on"
                autoCapitalize="sentences"
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
              <span>Due</span>
              <div className="date-control">
                <input
                  ref={editingDueDateRef}
                  type="date"
                  max={getMaxDueDateInputValue()}
                  value={editingDraft.dueDate}
                  onChange={(event) => {
                    setEditingDraft({
                      ...editingDraft,
                      dueDate: event.target.value,
                    });
                    event.currentTarget.blur();
                  }}
                />
                <button
                  type="button"
                  aria-label="Open due date picker"
                  onClick={() => showDatePicker(editingDueDateRef.current)}
                >
                  Date
                </button>
              </div>
            </label>

            <label>
              <span>Start time</span>
              {renderTimeSelect(editingDraft.dueTime, (nextValue) =>
                setEditingDraft(updateDraftStartTime(editingDraft, nextValue)),
                "No start time",
              )}
            </label>

            <label>
              <span>End time</span>
              {renderTimeSelect(editingDraft.dueEndTime, (nextValue) =>
                setEditingDraft(updateDraftEndTime(editingDraft, nextValue)),
                "No end time",
              )}
            </label>

            <label>
              <span>Actual duration</span>
              {renderDurationControl(editingDraft.durationMinutes, (nextValue) =>
                setEditingDraft(updateDraftDuration(editingDraft, nextValue)),
              )}
            </label>

            <label>
              <span>Duration estimate</span>
              {renderEstimateControl(editingDraft.estimatedDuration, (nextValue) =>
                setEditingDraft({
                  ...editingDraft,
                  estimatedDuration: nextValue,
                }),
              )}
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
                value={getRepeatSelectValue(editingDraft.repeat)}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    repeat:
                      event.target.value === "custom"
                        ? createCustomRepeat(editingDraft.repeat.startsWith("custom:") ? getCustomRepeatDays(editingDraft.repeat) : 28)
                        : (event.target.value as TaskRepeat),
                  })
                }
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom days</option>
              </select>
            </label>
            {editingDraft.repeat.startsWith("custom:") ? (
              <label>
                <span>Repeat every</span>
                <input
                  type="number"
                  min={1}
                  max={MAX_DUE_DAYS}
                  value={getCustomRepeatDays(editingDraft.repeat)}
                  onChange={(event) =>
                    setEditingDraft({
                      ...editingDraft,
                      repeat: createCustomRepeat(event.target.value),
                    })
                  }
                />
              </label>
            ) : null}

            <label>
              <span>Marker style</span>
              <select
                value={editingDraft.flagType}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    flagType: isTaskFlagType(event.target.value)
                      ? event.target.value
                      : "red_flag",
                  })
                }
              >
                {flagTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="toggle-row">
              <span>Keep visible</span>
              <input
                type="checkbox"
                checked={editingDraft.flagged}
                onChange={(event) =>
                  setEditingDraft({
                    ...editingDraft,
                    flagged: event.target.checked,
                  })
                }
              />
            </label>
            <p className="field-help">For important tasks without a hard deadline.</p>

            <label className="full-field">
              <span>Details</span>
              <textarea
                spellCheck
                autoCorrect="on"
                autoCapitalize="sentences"
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
              <button
                className="delete-edit-action"
                type="button"
                onClick={() => confirmDeleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          </form>
        ) : (
          <>
            <div
              className="task-main"
              onClick={() => {
                if (expandedTaskIds.size && !isExpanded) {
                  setExpandedTaskIds(new Set());
                }
              }}
            >
              <p className={task.completed ? "task-title completed" : "task-title"}>
                {urgencyLabel === "Overdue" ? (
                  <span className="title-status title-status-pill" aria-label="Overdue">
                    <span className="title-status-overdue" />
                  </span>
                ) : null}
                {urgencyLabel === "Due" ? (
                  <span className="title-status title-status-pill title-status-due">Due</span>
                ) : null}
                {task.title}
              </p>
              <div className="task-meta">
                {dueDateParts && dueDaysChip ? (
                  <div className="meta-row meta-date-row">
                    <span className={`due-days-chip ${dueDaysChip.tone}`}>
                      {dueDaysChip.label}
                    </span>
                    <span className="date-chip">{dueDateParts.month}</span>
                    <span className="date-chip">{dueDateParts.day}</span>
                  </div>
                ) : null}
                <div className="meta-row meta-priority-row">
                  <span
                    className={`importance-token ${task.importance}`}
                    aria-label={`${getImportanceLabel(task.importance)} importance`}
                    title={`${getImportanceLabel(task.importance)} importance`}
                  >
                    {getImportanceLabel(task.importance)}
                  </span>
                  {urgencyLabel === "Urgent" || urgencyLabel === "Due" ? (
                    <span className={`urgency ${urgencyLabel === "Due" ? "due" : "urgent"}`}>
                      {urgencyLabel === "Due" ? "Urgent" : urgencyLabel}
                    </span>
                  ) : null}
                </div>
              </div>
              {isExpanded ? (
                <div className="task-details">
                  {task.details ? (
                    <p>{task.details}</p>
                  ) : !hasInfoDetails ? (
                    <p className="muted">No extra details yet.</p>
                  ) : null}
                  {task.dueDate ? (
                    <p className="muted">
                      Becomes urgent {task.urgentBeforeDays} day
                      {task.urgentBeforeDays === 1 ? "" : "s"} before due date.
                    </p>
                  ) : null}
                  {task.dueTime ? (
                    <p className="muted">Start time {formatTime(task.dueTime)}</p>
                  ) : null}
                  {task.estimatedDuration ? (
                    <p className="muted">Effort size: {task.estimatedDuration}</p>
                  ) : null}
                  {task.repeat !== "none" ? (
                    <p className="muted">Repeat: {formatRepeat(task.repeat)}</p>
                  ) : null}
                  {task.dueEndTime ? (
                    <p className="muted">End time {formatTime(task.dueEndTime)}</p>
                  ) : null}
                  {task.durationMinutes ? (
                    <p className="muted">Duration {formatDuration(task.durationMinutes)}</p>
                  ) : null}
                  {task.completedAt ? (
                    <p className="muted">Completed {formatDate(task.completedAt)}</p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {isExpanded ? (
              <div className="task-actions task-info-actions">
                <button
                  className="task-icon-action edit-action"
                  type="button"
                  aria-label="Edit task"
                  title="Edit"
                  onClick={(event) => {
                    event.stopPropagation();
                    startEditing(task);
                  }}
                >
                  ✎
                </button>
                <button
                  className="task-icon-action close-info-action"
                  type="button"
                  aria-label="Close details"
                  title="Close"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeExpandedInfo();
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="task-actions">
              {!task.completed ? (
                <button
                  className="task-icon-action complete-action"
                  type="button"
                  aria-label="Complete task"
                  title="Complete"
                  onClick={(event) => {
                    event.stopPropagation();
                    completeTask(task.id);
                  }}
                >
                  ✓
                </button>
              ) : (
                <button
                  className="task-icon-action restore-action"
                  type="button"
                  aria-label="Restore task"
                  title="Restore"
                  onClick={(event) => {
                    event.stopPropagation();
                    restoreTask(task.id);
                  }}
                >
                  ↩︎
                </button>
              )}
              <button
                className="task-icon-action details-action"
                type="button"
                aria-label={isExpanded ? "Hide details" : "Show details"}
                title={isExpanded ? "Hide details" : "Details"}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleTaskDetails(task.id);
                }}
              >
                i
              </button>
              <button
                className="task-icon-action edit-action"
                type="button"
                aria-label="Edit task"
                title="Edit"
                onClick={(event) => {
                  event.stopPropagation();
                  startEditing(task);
                }}
              >
                ✎
              </button>
              {activeIndex !== null ? (
                <button
                  className="task-icon-action grip-action"
                  type="button"
                  aria-label="Move task"
                  title="Move"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    startGripMove(task.id);
                  }}
                  onPointerMove={(event) =>
                    updateGripMove(task.id, event.clientX, event.clientY)
                  }
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }

                    finishGripMove(task.id);
                  }}
                  onPointerCancel={() => {
                    setDraggingTaskId(null);
                    setDropPlacement(null);
                  }}
                >
                  ≡
                </button>
              ) : null}
            </div>
            )}
          </>
        )}
      </article>
    );
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-block">
          <img
            className="app-logo"
            src="/icon-512.png?v=2"
            alt=""
            aria-hidden="true"
          />
          <div className="brand-copy">
            <h1>
              <span>Tile</span>
              <span>Todo</span>
            </h1>
          </div>
          <div className="suggestion-wrap">
            <button
              className="next-task-button"
              type="button"
              onClick={() => setIsSuggestionOpen((isOpen) => !isOpen)}
            >
              What should I do?
            </button>
            {isSuggestionOpen ? (
              <div className="task-suggestion-popover" role="dialog" aria-label="Suggested next task">
                {suggestedNextTask ? (
                  <>
                    <p className="suggestion-eyebrow">Suggested next task</p>
                    <h2>{suggestedNextTask.title}</h2>
                    <div className="suggestion-meta">
                      {suggestedNextTask.estimatedDuration ? (
                        <span>{suggestedNextTask.estimatedDuration}</span>
                      ) : (
                        <span>Top task</span>
                      )}
                      <span>{getImportanceLabel(suggestedNextTask.importance)}</span>
                      {getDaysUntilDue(suggestedNextTask.dueDate) !== null ? (
                        <span>
                          {getDaysUntilDue(suggestedNextTask.dueDate) === 0
                            ? "Due today"
                            : `${getDaysUntilDue(suggestedNextTask.dueDate)}d`}
                        </span>
                      ) : null}
                    </div>
                    <div className="suggestion-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setExpandedTaskIds(new Set([suggestedNextTask.id]));
                          setIsSuggestionOpen(false);
                        }}
                      >
                        Open details
                      </button>
                      <button type="button" onClick={() => setIsSuggestionOpen(false)}>
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="suggestion-eyebrow">Suggested next task</p>
                    <h2>No active tasks</h2>
                    <p className="muted">Add a task and I can pick a quick next step.</p>
                    <div className="suggestion-actions">
                      <button type="button" onClick={() => setIsSuggestionOpen(false)}>
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="header-actions">
          <label className="sort-pill">
            <span className="visually-hidden">Sort</span>
            <select
              aria-label="Sort tasks"
              value={sortMode}
              onChange={(event) =>
                setSortMode(
                  isSortMode(event.target.value) ? event.target.value : "master",
                )
              }
            >
              {sortModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            className="sort-pill sort-direction-toggle"
            type="button"
            aria-label={
              sortDirection === "desc"
                ? "Sort descending. Tap to sort ascending."
                : "Sort ascending. Tap to sort descending."
            }
            title={
              sortDirection === "desc"
                ? "Descending. Tap for ascending."
                : "Ascending. Tap for descending."
            }
            onClick={() =>
              setSortDirection((direction) => (direction === "desc" ? "asc" : "desc"))
            }
          >
            {sortDirection === "desc" ? "↓" : "↑"}
          </button>
          <button
            className="icon-button"
            type="button"
            aria-expanded={isMenuOpen}
            aria-label="Open menu"
            onClick={() => setIsMenuOpen(true)}
          >
            Menu
          </button>
        </div>
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
                <p className="version-label">Version {APP_VERSION}</p>
                <p className="muted">{user ? "Synced account" : "Local mode"}</p>
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

            <div className="menu-tabs" role="tablist" aria-label="Menu tabs">
              <button
                type="button"
                className={menuTab === "settings" ? "active" : ""}
                onClick={() => setMenuTab("settings")}
              >
                Settings
              </button>
              <button
                type="button"
                className={menuTab === "how-to" ? "active" : ""}
                onClick={() => setMenuTab("how-to")}
              >
                How to use
              </button>
              <button
                type="button"
                className={menuTab === "info" ? "active" : ""}
                onClick={() => setMenuTab("info")}
              >
                Info
              </button>
              <button
                type="button"
                className={menuTab === "archive" ? "active" : ""}
                onClick={() => setMenuTab("archive")}
              >
                Archive
              </button>
            </div>

            {menuTab === "settings" ? (
              <>
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
                  <label>
                    <span>Colour scheme</span>
                    <select
                      value={colorScheme}
                      onChange={(event) => {
                        const nextScheme = isColorScheme(event.target.value)
                          ? event.target.value
                          : "cmyk";

                        setColorScheme(nextScheme);
                      }}
                    >
                      {colorSchemeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Saturation</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={saturation}
                      onChange={(event) => setSaturation(Number(event.target.value))}
                    />
                  </label>
                  <div className="range-row">
                    <span>{saturation}%</span>
                    <span>0% turns the interface grayscale.</span>
                  </div>
                  <div className="theme-preview" aria-hidden="true">
                    <span className="preview-swatch task-preview" />
                    <span className="preview-swatch action-preview" />
                  </div>
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
                    <>
                      <p className="local-mode-warning">
                        Local mode only. Make an account to sync between devices and
                        keep tasks beyond this browser.
                      </p>
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
                          onClick={startCreateAccountConfirmation}
                        >
                          Create account
                        </button>
                      </form>
                      <button
                        className="clear-local-button"
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Clear all local tasks from this browser? This cannot be undone.",
                            )
                          ) {
                            clearLocalTasks();
                          }
                        }}
                      >
                        Clear local tasks
                      </button>
                    </>
                  )}
                </section>

                <section className="menu-section">
                  <h3>Backup</h3>
                  {importMessage ? (
                    <p className="import-message backup-message">{importMessage}</p>
                  ) : null}
                  <div className="backup-actions">
                    <button type="button" onClick={copyDataToClipboard}>
                      Copy data to clipboard
                    </button>
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
              </>
            ) : null}

            {menuTab === "how-to" ? (
              <section className="menu-section help-section">
                <h3>How to use</h3>
                <div className="help-list">
                  <p>
                    <span className="help-sample add-sample">+</span>
                    Add a new task. It opens the larger add panel.
                  </p>
                  <p>
                    <span className="help-sample complete-sample">✓</span>
                    Complete a task and move it to the archive.
                  </p>
                  <p>
                    <span className="help-sample restore-sample">↩︎</span>
                    Restore an archived task back to the active list.
                  </p>
                  <p>
                    <span className="help-sample info-sample">i</span>
                    Open task details, including notes, times, and completed date.
                  </p>
                  <p>
                    <span className="help-sample edit-sample">✎</span>
                    Edit a task. Delete is inside the edit panel.
                  </p>
                  <p>
                    <span className="help-sample grip-sample">≡</span>
                    Drag a task to a new position.
                  </p>
                  <p>
                    <span className="help-sample flag-sample">⚑</span>
                    Keep visible. Useful for important no-date tasks.
                  </p>
                  <p>
                    <span className="help-sample chip-sample">H</span>
                    Importance. H, M, and L mean high, medium, and low.
                  </p>
                  <p>
                    <span className="help-sample chip-sample">2d</span>
                    Days until due. Red is soon, yellow is close, blue is later.
                  </p>
                  <p>
                    <span className="help-sample warning-sample">!</span>
                    Overdue warning. This marks tasks that are past their due date.
                  </p>
                </div>
              </section>
            ) : null}

            {menuTab === "info" ? (
              <section className="menu-section info-section">
                <h3>About Tile Todo</h3>
                <p>
                  Tile Todo is a sticky-note style task list for keeping the next
                  few important things visible. It is designed for quick capture,
                  simple priority, and an archive you can refer back to.
                </p>
                <p>
                  Sorting balances due date, importance, urgency threshold,
                  keep-visible flags, and your manual drag adjustments. Overdue,
                  due-today, and urgent tasks are intentionally hard to push down.
                </p>
                <p>
                  Account sync saves the same task list across devices when you
                  are signed in. The app still keeps a local copy in the browser.
                </p>
              </section>
            ) : null}

            {menuTab === "archive" ? (
              <section className="menu-section archive-section">
                <h3>Archive</h3>
                <p className="muted">
                  Completed tasks move here after one week. Restoring a task sends
                  it back to Active Tasks.
                </p>
                {archivedTasks.length ? (
                  <div className="task-grid menu-archive-grid">
                    {archivedTasks.map((task) => renderTask(task))}
                  </div>
                ) : (
                  <p className="task empty-state">Archived tasks will appear here.</p>
                )}
              </section>
            ) : null}
          </aside>
        </div>
      ) : null}

      {signupConfirmStep ? (
        <div
          className="confirm-backdrop"
          role="presentation"
          onClick={() => setSignupConfirmStep(null)}
        >
          <div
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            {signupConfirmStep === "joke" ? (
              <>
                <h2 id="signup-confirm-title">Relax, it's a joke</h2>
                <div className="confirm-actions">
                  <button type="button" onClick={() => setSignupConfirmStep("second")}>
                    OK
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="signup-confirm-title">
                  Are you sure you want to give Johnny Matejczyk all your data?
                  Every last drop?
                </h2>
                <div className="confirm-actions">
                  <button
                    type="button"
                    onClick={() =>
                      signupConfirmStep === "first"
                        ? setSignupConfirmStep("joke")
                        : setSignupConfirmStep(null)
                    }
                  >
                    {signupConfirmStep === "first" ? "No" : "Really no"}
                  </button>
                  <button type="button" onClick={createAccountAfterConfirmation}>
                    Yes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      <section aria-labelledby="active-tasks">
        <h2 id="active-tasks">Active Tasks</h2>

        <div className="task-grid active-task-grid">
          {isAddTaskOpen ? (
            <section
              className="task add-panel"
              aria-labelledby="add-task"
              style={
                {
                  viewTransitionName: "add-task-tile",
                } as CSSProperties
              }
            >
              <div className="panel-header">
                <h2 id="add-task">Create Task</h2>
                <button type="button" onClick={closeAddTask}>
                  Cancel
                </button>
              </div>
              <form className="task-form" onSubmit={handleAddTask}>
                <label className="title-field">
                  <span>Task</span>
                  <input
                    autoFocus
                    spellCheck
                    autoCorrect="on"
                    autoCapitalize="sentences"
                    value={draft.title}
                    onChange={(event) =>
                      setDraft({ ...draft, title: event.target.value })
                    }
                    placeholder="Add a task"
                  />
                </label>

                <label>
                  <span>Due date</span>
                  <div className="date-control">
                    <input
                      ref={draftDueDateRef}
                      type="date"
                      max={getMaxDueDateInputValue()}
                      value={draft.dueDate}
                      onChange={(event) => {
                        const nextDueDate = event.target.value;
                        setDraft({
                          ...draft,
                          dueDate: nextDueDate,
                          dueTime: nextDueDate ? draft.dueTime : "",
                          dueEndTime: nextDueDate ? draft.dueEndTime : "",
                          durationMinutes: nextDueDate ? draft.durationMinutes : null,
                        });
                        if (!nextDueDate) {
                          setIsDraftSpecificTimeEnabled(false);
                        }
                        event.currentTarget.blur();
                      }}
                    />
                    <button
                      type="button"
                      aria-label="Open due date picker"
                      onClick={() => showDatePicker(draftDueDateRef.current)}
                    >
                      Date
                    </button>
                  </div>
                </label>

                <label>
                  <span>Effort size</span>
                  {renderEstimateControl(draft.estimatedDuration, (nextValue) =>
                    setDraft({ ...draft, estimatedDuration: nextValue }),
                    "No effort size",
                  )}
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
                <p className="field-help">Used when a due date is set.</p>

                <details className="details-entry">
                  <summary>Notes &amp; Details</summary>
                  <label>
                    <span>Notes</span>
                    <textarea
                      spellCheck
                      autoCorrect="on"
                      autoCapitalize="sentences"
                      value={draft.details}
                      onChange={(event) =>
                        setDraft({ ...draft, details: event.target.value })
                      }
                      placeholder="Notes, links, context"
                      rows={3}
                    />
                  </label>

                  <label>
                    <span>Repeat</span>
                    <select
                      value={getRepeatSelectValue(draft.repeat)}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          repeat:
                            event.target.value === "custom"
                              ? createCustomRepeat(draft.repeat.startsWith("custom:") ? getCustomRepeatDays(draft.repeat) : 28)
                              : (event.target.value as TaskRepeat),
                        })
                      }
                    >
                      <option value="none">No repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="custom">Custom days</option>
                    </select>
                  </label>
                  {draft.repeat.startsWith("custom:") ? (
                    <label>
                      <span>Repeat every</span>
                      <input
                        type="number"
                        min={1}
                        max={MAX_DUE_DAYS}
                        value={getCustomRepeatDays(draft.repeat)}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            repeat: createCustomRepeat(event.target.value),
                          })
                        }
                      />
                    </label>
                  ) : null}

                  <label className="toggle-row">
                    <span>Keep visible</span>
                    <input
                      type="checkbox"
                      checked={draft.flagged}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          flagged: event.target.checked,
                          flagType: event.target.checked ? draft.flagType : "red_flag",
                        })
                      }
                    />
                  </label>
                  <p className="field-help">For important tasks without a hard deadline.</p>

                  {draft.flagged ? (
                    <label>
                      <span>Marker style</span>
                      <select
                        value={draft.flagType}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            flagType: isTaskFlagType(event.target.value)
                              ? event.target.value
                              : "red_flag",
                          })
                        }
                      >
                        {flagTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : null}

                  {draft.dueDate ? (
                    <>
                      <label className="toggle-row">
                        <span>Specific time</span>
                        <input
                          type="checkbox"
                          checked={isDraftSpecificTimeEnabled}
                          onChange={(event) => {
                            setIsDraftSpecificTimeEnabled(event.target.checked);
                            if (!event.target.checked) {
                              setDraft({
                                ...draft,
                                dueTime: "",
                                dueEndTime: "",
                                durationMinutes: null,
                              });
                            }
                          }}
                        />
                      </label>
                      {isDraftSpecificTimeEnabled ? (
                        <label>
                          <span>Specific time</span>
                          {renderTimeSelect(draft.dueTime, (nextValue) =>
                            setDraft(updateDraftStartTime(draft, nextValue)),
                            "No specific time",
                          )}
                        </label>
                      ) : null}
                    </>
                  ) : (
                    <p className="field-help">Add a due date to attach a time.</p>
                  )}
                </details>

                <button type="submit">Create task</button>
              </form>
            </section>
          ) : (
            <button
              className="task add-task-trigger"
              type="button"
              style={
                {
                  viewTransitionName: "add-task-tile",
                } as CSSProperties
              }
              onClick={() => {
                const documentWithTransition = document as Document & {
                  startViewTransition?: (callback: () => void) => void;
                };

                if (!documentWithTransition.startViewTransition) {
                  setIsAddTaskOpen(true);
                  return;
                }

                documentWithTransition.startViewTransition(() => {
                  setIsAddTaskOpen(true);
                });
              }}
            >
              <span className="add-plus">+</span>
              <span className="add-task-label">Add task</span>
            </button>
          )}

          {activeTasks.map((task, index) =>
            renderTask(
              task,
              isHighlightedTask(task, index),
              sortMode === "master" ? index : null,
            ),
          )}

          {!activeTasks.length ? (
            <p className="task empty-state">No active tasks yet.</p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="completed-tasks">
        <h2 id="completed-tasks">Completed Tasks</h2>
        <div className="task-grid">
          {completedTasks.length ? (
            completedTasks.map((task) => renderTask(task))
          ) : (
            <p className="task empty-state">Completed tasks will appear here.</p>
          )}
          <button
            className="task archive-link-tile"
            type="button"
            onClick={() => {
              setMenuTab("archive");
              setIsMenuOpen(true);
            }}
          >
            <span className="archive-link-pill">Archive</span>
            <span className="muted">{archivedTasks.length} archived</span>
          </button>
        </div>
      </section>
    </main>
  );
}
