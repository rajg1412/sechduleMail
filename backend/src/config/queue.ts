import { Queue, QueueOptions } from 'bullmq';
import { config } from './index';
import redis from './redis';

const queueOptions: QueueOptions = {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
        removeOnComplete: {
            count: 1000, // Keep last 1000 completed jobs
            age: 24 * 3600, // Keep for 24 hours
        },
        removeOnFail: {
            count: 5000, // Keep last 5000 failed jobs
            age: 7 * 24 * 3600, // Keep for 7 days
        },
    },
};

export const emailQueue = new Queue('email-queue', queueOptions);

export { queueOptions };
