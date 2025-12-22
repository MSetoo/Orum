export function getNextDueDate(reminder) {
  const last = new Date(reminder.due_date);

  if (!reminder.is_recurring) return last;

  const next = new Date(last);

  if (reminder.recurrence_type === "monthly") {
    next.setMonth(next.getMonth() + Number(reminder.recurrence_interval || 1));
  }

  if (reminder.recurrence_type === "daily") {
    next.setDate(next.getDate() + Number(reminder.recurrence_interval || 1));
  }

  if (reminder.recurrence_type === "weekly") {
    next.setDate(
      next.getDate() + 7 * Number(reminder.recurrence_interval || 1)
    );
  }

  if (reminder.recurrence_type === "yearly") {
    next.setFullYear(
      next.getFullYear() + Number(reminder.recurrence_interval || 1)
    );
  }

  return next;
}

export function getNextDueDateOnPay(reminder, now = new Date()) {
  const next = new Date(now);

  if (reminder.recurrence_type === "daily") {
    next.setHours(next.getHours() + 2);
    return next;
  }

  if (reminder.recurrence_type === "weekly") {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (reminder.recurrence_type === "monthly") {
    next.setDate(next.getDate() + 14);
    return next;
  }

  if (reminder.recurrence_type === "yearly") {
    next.setMonth(next.getMonth() + 6);
    return next;
  }

  return getNextDueDate(reminder);
}

export function getUpcomingDueDate(reminder, now = new Date()) {
  const hasTime =
    typeof reminder.due_date === "string" && reminder.due_date.includes("T");
  const normalize = (date) => {
    const value = new Date(date);
    if (!hasTime) {
      value.setHours(0, 0, 0, 0);
    }
    return value;
  };

  const base = normalize(reminder.due_date);
  if (!reminder.is_recurring) return base;

  let candidate = new Date(base);
  const current = normalize(now);

  while (candidate < current) {
    const next = getNextDueDate({
      ...reminder,
      due_date: candidate.toISOString(),
    });
    candidate = normalize(next);
  }

  return candidate;
}
