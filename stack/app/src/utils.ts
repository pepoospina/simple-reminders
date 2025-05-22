// Helper function to format date to show month, day and time without seconds
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " +
    date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
};
