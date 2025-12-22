export function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function isOverdue(dueDate, isPaid) {
    if (isPaid) return false;
    return new Date(dueDate) < new Date();
}

export function isDueSoon(dueDate, isPaid, days = 7) {
    if (isPaid) return false;
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + days);
    return new Date(dueDate) >= now && new Date(dueDate) <= limit;
}