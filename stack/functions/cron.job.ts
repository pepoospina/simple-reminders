import { Services } from "./src/services";

export const cronJob = async (services: Services) => {
    const reminders = await services.reminders.repo.getReminders();
    console.log('cron job', reminders);
};
