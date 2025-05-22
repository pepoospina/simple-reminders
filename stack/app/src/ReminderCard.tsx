import { Box, Button, Text, Spinner } from "grommet";

import { Trash } from "grommet-icons";
import { Reminder, STATUS } from "./types/reminders.types";
import { formatDate } from "./utils";
import { API_URL } from "./App";
import { useState } from "react";

export const ReminderCard = (props: {
  reminder: Reminder;
  onUpdateReminders: () => void;
}) => {
  const { reminder, onUpdateReminders } = props;

  const [deleting, setDeleting] = useState(false);

  const deleteReminder = (id: string) => {
    setDeleting(true);
    fetch(`${API_URL}/reminders/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => onUpdateReminders())
      .then(() => setDeleting(false))
      .catch((error) => {
        console.error(error);
        setDeleting(false);
      });
  };

  return (
    <Box
      gap="small"
      key={reminder.id}
      pad={{
        top: "small",
        bottom: "medium",
        left: "small",
        right: "small",
      }}
      style={{
        backgroundColor: "#F9FAFB",
        borderRadius: "8px",
      }}
      align="start"
    >
      <Box
        style={{ width: "100%" }}
        direction="row"
        justify="between"
        align="center"
      >
        <Text style={{ fontWeight: "800", textAlign: "left" }}>
          {formatDate(reminder.date)}
        </Text>
        {reminder.status === STATUS.FAILED && (
          <Text style={{ color: "red" }} size="small">
            Failed to send :(
          </Text>
        )}
        <Button
          icon={
            <Box align="center" justify="center" height="14px" width="14px">
              {deleting ? (
                <Spinner size="small" />
              ) : (
                <Trash size="14px" color="brand" />
              )}
            </Box>
          }
          onClick={() => deleteReminder(reminder.id)}
        />
      </Box>
      <Text>{reminder.content}</Text>
    </Box>
  );
};
