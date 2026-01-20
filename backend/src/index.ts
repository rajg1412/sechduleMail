import express, { Express } from 'express';
import cors from 'cors';
import 'express-async-errors';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { emailWorker } from './workers/email.worker';
import emailRoutes from './routes/email.routes';
import senderRoutes from './routes/sender.routes';
import prisma from './config/database';
import redis from './config/redis';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', async (req, res) => {
    try {
        // Check database
        await prisma.$queryRaw`SELECT 1`;

        // Check Redis
        await redis.ping();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

// Routes
app.use('/api/emails', emailRoutes);
app.use('/api/senders', senderRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
    });
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);

    // Start email worker
    emailWorker.start();
});

// Graceful shutdown
const shutdown = async () => {
    logger.info('Received shutdown signal, closing server...');

    server.close(async () => {
        logger.info('HTTP server closed');

        // Stop worker
        await emailWorker.stop();

        // Close connections
        await redis.quit();
        await prisma.$disconnect();

        logger.info('All connections closed, exiting');
        process.exit(0);
    });

    // Force exit after 30 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
