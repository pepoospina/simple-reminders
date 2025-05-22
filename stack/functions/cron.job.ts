import { Services } from "./src/services";
import { Context, ScheduledEvent } from 'aws-lambda';

export const cronJob = (services: Services) => {
    return async (event: ScheduledEvent, context: Context) => {
        console.log('Executing cron job at:', new Date().toISOString());
        try {
            const reminders = await services.reminders.repo.getReminders();
            console.log('Cron job found reminders:', reminders.length);
            return { statusCode: 200, body: JSON.stringify({ success: true, count: reminders.length }) };
        } catch (error) {
            console.error('Error in cron job:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return { statusCode: 500, body: JSON.stringify({ success: false, error: errorMessage }) };
        }
    };
};
