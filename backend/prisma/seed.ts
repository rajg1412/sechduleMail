import nodemailer from 'nodemailer';
import prisma from '../src/config/database';
import { logger } from '../src/utils/logger';

/**
 * Seed script to create initial test senders
 * Creates Ethereal email accounts for testing
 */

async function createEtherealAccount() {
    const testAccount = await nodemailer.createTestAccount();
    return {
        user: testAccount.user,
        pass: testAccount.pass,
    };
}

async function seed() {
    try {
        logger.info('Starting database seed...');

        // Create 3 test senders with Ethereal accounts
        const senders = [];

        for (let i = 1; i <= 3; i++) {
            const account = await createEtherealAccount();

            const sender = await prisma.sender.upsert({
                where: { email: account.user },
                create: {
                    name: `Test Sender ${i}`,
                    email: account.user,
                    smtpUser: account.user,
                    smtpPass: account.pass,
                    rateLimit: 50 * i, // 50, 100, 150
                },
                update: {},
            });

            senders.push(sender);

            logger.info(`Created sender: ${sender.email} (Rate limit: ${sender.rateLimit}/hour)`);
            logger.info(`  SMTP User: ${account.user}`);
            logger.info(`  SMTP Pass: ${account.pass}`);
        }

        logger.info('\n✅ Seed completed successfully!');
        logger.info('\nYou can use these senders to schedule emails.');
        logger.info('Preview sent emails at: https://ethereal.email/');

    } catch (error) {
        logger.error('Seed failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
