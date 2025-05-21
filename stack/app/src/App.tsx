import { Box, Button, Heading, Text, TextInput } from "grommet";
import "./App.css";
import { DateInput, MaskedInput } from "grommet";
import { useEffect, useMemo, useState } from "react";
import { Reminder } from "./types/reminders.types";

const API_URL = "http://localhost:3000";
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
    fetch(`${API_URL}/reminders`)
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
    fetch(`${API_URL}/reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
        date: dateTime,
      }),
    })
      .then((res) => res.json())
      .then((data) => updateReminders())
      .then(() => reset());
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
      justify="center"
      style={{ height: "100vh" }}
      className="App"
    >
      <Heading level={2}>Simple email reminders</Heading>
      <Box gap="small">
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

        <Button primary label="Add" onClick={onAdd} />
        <Text size="small">
          You will receive an email 10 min before the reminder
        </Text>
      </Box>
      {reminders.length > 0 && <Heading level={4}>Upcoming reminders</Heading>}
    </Box>
  );
}

export default App;
