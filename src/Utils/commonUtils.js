export default function formatTimestamp(timestamp, timezone) {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) return String(timestamp);

  // Default timezone if none provided
  const tz = timezone || "Asia/Kolkata";

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  });

  // Remove comma if Intl adds it
  return formatter.format(date).replace(",", "");
}
