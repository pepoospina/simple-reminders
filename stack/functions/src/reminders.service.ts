import { RemindersRepository } from './reminders.repository';

export class RemindersService {
  constructor(public repo: RemindersRepository) {}
}
