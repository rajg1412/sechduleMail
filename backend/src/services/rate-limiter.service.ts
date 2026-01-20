import redis from '../config/redis';
import prisma from '../config/database';
import { config } from '../config';
import { getHourWindow } from '../utils/helpers';
import { logger } from '../utils/logger';

export interface RateLimitCheck {
    allowed: boolean;
    reason?: string;
    nextAvailableSlot?: Date;
}

class RateLimiterService {
    private readonly RATE_LIMIT_KEY_PREFIX = 'rate_limit';
    private readonly GLOBAL_KEY = 'global';

    /**
     * Check if an email can be sent based on rate limits
     */
    async checkRateLimit(senderId: string): Promise<RateLimitCheck> {
        const hourWindow = getHourWindow();

        // Check sender-specific rate limit
        const senderCheck = await this.checkSenderRateLimit(senderId, hourWindow);
        if (!senderCheck.allowed) {
            return senderCheck;
        }

        // Check global rate limit
        const globalCheck = await this.checkGlobalRateLimit(hourWindow);
        if (!globalCheck.allowed) {
            return globalCheck;
        }

        return { allowed: true };
    }

    /**
     * Increment rate limit counters after sending
     */
    async incrementCounters(senderId: string): Promise<void> {
        const hourWindow = getHourWindow();

        // Increment in both Redis and Database
        await Promise.all([
            this.incrementRedisCounter(senderId, hourWindow),
            this.incrementRedisCounter(this.GLOBAL_KEY, hourWindow),
            this.incrementDatabaseCounter(senderId, hourWindow),
        ]);
    }

    /**
     * Check sender-specific rate limit
     */
    private async checkSenderRateLimit(
        senderId: string,
        hourWindow: Date
    ): Promise<RateLimitCheck> {
        // Get sender's rate limit
        const sender = await prisma.sender.findUnique({
            where: { id: senderId },
            select: { rateLimit: true },
        });

        if (!sender) {
            return {
                allowed: false,
                reason: 'Sender not found',
            };
        }

        const maxEmails = sender.rateLimit;
        const currentCount = await this.getCount(senderId, hourWindow);

        if (currentCount >= maxEmails) {
            const nextHour = new Date(hourWindow);
            nextHour.setHours(nextHour.getHours() + 1);

            logger.warn(`Sender ${senderId} rate limit exceeded: ${currentCount}/${maxEmails}`);

            return {
                allowed: false,
                reason: `Sender rate limit exceeded (${maxEmails}/hour)`,
                nextAvailableSlot: nextHour,
            };
        }

        return { allowed: true };
    }

    /**
     * Check global rate limit
     */
    private async checkGlobalRateLimit(hourWindow: Date): Promise<RateLimitCheck> {
        const maxEmails = config.rateLimit.maxEmailsPerHourGlobal;
        const currentCount = await this.getCount(this.GLOBAL_KEY, hourWindow);

        if (currentCount >= maxEmails) {
            const nextHour = new Date(hourWindow);
            nextHour.setHours(nextHour.getHours() + 1);

            logger.warn(`Global rate limit exceeded: ${currentCount}/${maxEmails}`);

            return {
                allowed: false,
                reason: `Global rate limit exceeded (${maxEmails}/hour)`,
                nextAvailableSlot: nextHour,
            };
        }

        return { allowed: true };
    }

    /**
     * Get current count from Redis (with DB fallback)
     */
    private async getCount(key: string, hourWindow: Date): Promise<number> {
        const redisKey = this.getRedisKey(key, hourWindow);

        try {
            const count = await redis.get(redisKey);
            if (count !== null) {
                return parseInt(count, 10);
            }
        } catch (error) {
            logger.error('Redis get error, falling back to database:', error);
        }

        // Fallback to database
        if (key === this.GLOBAL_KEY) {
            return await this.getGlobalCountFromDb(hourWindow);
        } else {
            return await this.getSenderCountFromDb(key, hourWindow);
        }
    }

    /**
     * Increment Redis counter
     */
    private async incrementRedisCounter(key: string, hourWindow: Date): Promise<void> {
        const redisKey = this.getRedisKey(key, hourWindow);
        const ttl = 3600; // 1 hour

        try {
            await redis
                .multi()
                .incr(redisKey)
                .expire(redisKey, ttl)
                .exec();
        } catch (error) {
            logger.error('Redis increment error:', error);
        }
    }

    /**
     * Increment database counter
     */
    private async incrementDatabaseCounter(senderId: string, hourWindow: Date): Promise<void> {
        try {
            await prisma.rateLimit.upsert({
                where: {
                    senderId_hourWindow: {
                        senderId,
                        hourWindow,
                    },
                },
                create: {
                    senderId,
                    hourWindow,
                    emailCount: 1,
                },
                update: {
                    emailCount: {
                        increment: 1,
                    },
                },
            });
        } catch (error) {
            logger.error('Database increment error:', error);
        }
    }

    /**
     * Get sender count from database
     */
    private async getSenderCountFromDb(senderId: string, hourWindow: Date): Promise<number> {
        const record = await prisma.rateLimit.findUnique({
            where: {
                senderId_hourWindow: {
                    senderId,
                    hourWindow,
                },
            },
        });

        return record?.emailCount || 0;
    }

    /**
     * Get global count from database
     */
    private async getGlobalCountFromDb(hourWindow: Date): Promise<number> {
        const result = await prisma.rateLimit.aggregate({
            where: {
                hourWindow,
            },
            _sum: {
                emailCount: true,
            },
        });

        return result._sum.emailCount || 0;
    }

    /**
     * Generate Redis key
     */
    private getRedisKey(key: string, hourWindow: Date): string {
        const timestamp = hourWindow.getTime();
        return `${this.RATE_LIMIT_KEY_PREFIX}:${key}:${timestamp}`;
    }

    /**
     * Get current statistics
     */
    async getStats(senderId?: string): Promise<{
        currentHour: {
            window: Date;
            count: number;
            limit: number;
        };
    }> {
        const hourWindow = getHourWindow();

        if (senderId) {
            const sender = await prisma.sender.findUnique({
                where: { id: senderId },
                select: { rateLimit: true },
            });

            const count = await this.getCount(senderId, hourWindow);

            return {
                currentHour: {
                    window: hourWindow,
                    count,
                    limit: sender?.rateLimit || 0,
                },
            };
        } else {
            const count = await this.getCount(this.GLOBAL_KEY, hourWindow);

            return {
                currentHour: {
                    window: hourWindow,
                    count,
                    limit: config.rateLimit.maxEmailsPerHourGlobal,
                },
            };
        }
    }
}

export const rateLimiterService = new RateLimiterService();
