export interface Reminder {
  id: string;
  content: string;
  date: number;
}

export type CreateReminderPayload = Omit<Reminder, 'id'>;
