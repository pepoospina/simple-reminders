export enum STATUS {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

export interface Reminder {
  id: string;
  content: string;
  createdAt: number;
  date: number;
  status: STATUS;
}

export type CreateReminderPayload = Omit<Reminder, 'id' | 'status' | 'createdAt'>;
