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
  const [time, setTime] = useState(DEFAULT_TIME);
  const [dateTime, setDateTime] = useState<string>("");
  const [content, setContent] = useState("");

  const [reminders, setReminders] = useState<Reminder[]>([]);

  // Combine date and time into a single ISO string
  const combineDateTime = (dateValue: string, timeValue: string) => {
    if (dateValue && timeValue) {
      const [hours, minutes] = timeValue.split(":");
      const fullDate = new Date(dateValue);
      fullDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      setDateTime(fullDate.toISOString());
    } else {
      setDateTime("");
    }
  };

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
    setTime(DEFAULT_TIME);
    setDateTime("");
    setContent("");
  };

  const addReminder = () => {
    const payload: CreateReminderPayload = {
      content,
      date: new Date(dateTime).getTime(),
    };

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
      .then(() => updateReminders());
  };

  const deleteReminder = (id: string) => {
    fetch(`${API_URL}/reminders/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => updateReminders());
  };

  const isValid = useMemo(() => {
    return content && date && time;
  }, [content, date, time]);

  const onAdd = () => {
    if (isValid) addReminder();
  };

  // Handle date change from DateInput
  const onDateChange = (value: string) => {
    setDate(value);
    combineDateTime(value, time);
  };

  // Handle time change from MaskedInput
  const onTimeChange = (value: string) => {
    setTime(value);
    combineDateTime(date, value);
  };

  return (
    <Box
      align="center"
      style={{ height: "100vh", width: "100%" }}
      pad="medium"
      className="App"
    >
      <Heading level={2}>Simple email reminders</Heading>
      <Box style={{ width: "100%" }} gap="small">
        <Box gap="small">
          <TextInput
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter a reminder"
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
            <MaskedInput
              mask={[
                {
                  length: [1, 2],
                  regexp: /^([0-1]?[0-9]|2[0-3])$/,
                  placeholder: "hh",
                },
                { fixed: ":" },
                {
                  length: 2,
                  regexp: /^[0-5][0-9]$/,
                  placeholder: "mm",
                },
              ]}
              value={time}
              onChange={(event) => onTimeChange(event.target.value as string)}
            />
          </Box>
        </Box>

        <Button
          margin={{ top: "medium" }}
          primary
          label="Add"
          onClick={onAdd}
        />
        <Text size="small">
          You will receive an email 10 min before the reminder
        </Text>
      </Box>
      {reminders.length > 0 && (
        <Box gap="medium" style={{ width: "100%" }} margin={{ top: "large" }}>
          <Heading level={3}>Upcoming reminders</Heading>
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
