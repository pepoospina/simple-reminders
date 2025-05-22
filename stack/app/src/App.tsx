import { Box, Button, Heading, Text, TextInput } from "grommet";
import "./App.css";
import { DateInput, MaskedInput } from "grommet";
import { useEffect, useMemo, useState } from "react";
import { Reminder } from "./types/reminders.types";
import { CreateReminderPayload } from "./types/reminders.types";
import { Trash } from "grommet-icons";

// Helper function to format date to show month, day and time without seconds
const formatReminderDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " +
    date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  );
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const DEFAULT_TIME = "9:00";

function App() {
  const [date, setDate] = useState("");
  const [timeInput, setTimeInput] = useState(DEFAULT_TIME);

  const [dateTime, setDateTime] = useState<string>("");
  const [content, setContent] = useState("");

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [adding, setAdding] = useState(false);

  const [oldTimeError, setOldTimeError] = useState(false);

  const updateReminders = () => {
    fetch(`${API_URL}/reminders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setReminders(data));
  };

  useEffect(() => {
    updateReminders();
  }, []);

  const reset = () => {
    setDate("");
    setTimeInput(DEFAULT_TIME);
    setDateTime("");
    setContent("");
  };

  const addReminder = () => {
    const payload: CreateReminderPayload = {
      content,
      date: new Date(dateTime).getTime(),
    };

    setAdding(true);

    fetch(`${API_URL}/reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => updateReminders())
      .then(() => reset())
      .then(() => updateReminders())
      .then(() => setAdding(false))
      .catch((error) => {
        console.error(error);
        setAdding(false);
      });
  };

  const deleteReminder = (id: string) => {
    fetch(`${API_URL}/reminders/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => updateReminders());
  };

  const isReminderValid = useMemo(() => {
    return content && date && dateTime;
  }, [content, date, dateTime]);

  const onAdd = () => {
    if (isReminderValid) addReminder();
  };

  const onDateChange = (value: string) => {
    setDate(value);
  };

  const onTimeChange = (value: string) => {
    setTimeInput(value);
  };

  const validTime = useMemo(() => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeInput) ? timeInput : undefined;
  }, [timeInput]);

  useEffect(() => {
    if (date && validTime) {
      const [hours, minutes] = validTime.split(":");
      const fullDate = new Date(date);

      fullDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));

      // Check if the date is at least 10 minutes in the future
      const now = new Date();
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);

      if (fullDate.getTime() > tenMinutesFromNow.getTime()) {
        setDateTime(fullDate.toISOString());
        setOldTimeError(false);
      } else {
        setOldTimeError(true);
      }
    } else {
      setDateTime("");
    }
  }, [date, validTime]);

  return (
    <Box
      align="center"
      style={{ height: "100vh", width: "100%" }}
      pad="medium"
      className="App"
    >
      <Heading level={2}>Add a reminder</Heading>
      <Box style={{ width: "100%" }} gap="small">
        <Box gap="small">
          <TextInput
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What"
          />
        </Box>
        <Box align="center" gap="small">
          <Box width="100%">
            <DateInput
              format="mm/dd/yyyy"
              value={date}
              onChange={(event) => onDateChange(event.value as string)}
              calendarProps={{ size: "medium" }}
            />
          </Box>
          <Box width="100%">
            <TextInput
              value={timeInput}
              onChange={(event) => onTimeChange(event.target.value as string)}
            />
          </Box>
        </Box>

        <Button
          disabled={!isReminderValid || adding}
          margin={{ top: "medium" }}
          primary
          label={adding ? "Adding..." : "Add"}
          onClick={onAdd}
        />
        {!oldTimeError ? (
          <Text size="small">
            You will receive an email 10 min before the reminder
          </Text>
        ) : (
          <Text size="small" color="red">
            Please select a time that is at least 10 minutes in the future
          </Text>
        )}
      </Box>
      {reminders.length > 0 && (
        <Box
          gap="medium"
          style={{ width: "100%" }}
          margin={{ top: "large" }}
          align="center"
        >
          <Heading level={3}>Upcoming reminders:</Heading>
          <Box gap="medium" style={{ width: "100%" }}>
            {reminders.map((reminder) => (
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
                >
                  <Text style={{ fontWeight: "800", textAlign: "left" }}>
                    {formatReminderDate(reminder.date)}
                  </Text>
                  <Button
                    icon={<Trash color="brand" />}
                    onClick={() => deleteReminder(reminder.id)}
                  />
                </Box>
                <Text>{reminder.content}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default App;
