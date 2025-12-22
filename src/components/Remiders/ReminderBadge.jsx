export default function ReminderBadge({ text, color }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: "0.75rem",
        background: color,
        color: "#fff",
        marginRight: 6,
      }}
    >
      {text}
    </span>
  );
}
