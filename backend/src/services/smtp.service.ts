import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface EmailData {
    from: {
        name: string;
        email: string;
    };
    to: {
        name?: string;
        email: string;
    };
    subject: string;
    body: string;
    smtpUser: string;
    smtpPass: string;
}

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    previewUrl?: string;
    error?: string;
}

class SmtpService {
    private transporters: Map<string, Transporter> = new Map();

    /**
     * Get or create a transporter for a specific sender
     */
    private getTransporter(smtpUser: string, smtpPass: string): Transporter {
        const key = `${smtpUser}:${smtpPass}`;

        if (!this.transporters.has(key)) {
            const transporter = nodemailer.createTransport({
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.secure,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
            });

            this.transporters.set(key, transporter);
            logger.info(`Created new SMTP transporter for ${smtpUser}`);
        }

        return this.transporters.get(key)!;
    }

    /**
     * Send an email via SMTP
     */
    async sendEmail(emailData: EmailData): Promise<SendEmailResult> {
        try {
            const transporter = this.getTransporter(emailData.smtpUser, emailData.smtpPass);

            const mailOptions = {
                from: `"${emailData.from.name}" <${emailData.from.email}>`,
                to: emailData.to.name
                    ? `"${emailData.to.name}" <${emailData.to.email}>`
                    : emailData.to.email,
                subject: emailData.subject,
                html: emailData.body,
                text: emailData.body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            };

            logger.info(`Sending email to ${emailData.to.email} via ${emailData.from.email}`);

            const info = await transporter.sendMail(mailOptions);

            // Get preview URL for Ethereal
            const previewUrl = nodemailer.getTestMessageUrl(info);

            logger.info(`Email sent successfully: ${info.messageId}`);
            if (previewUrl) {
                logger.info(`Preview URL: ${previewUrl}`);
            }

            return {
                success: true,
                messageId: info.messageId,
                previewUrl: previewUrl || undefined,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Failed to send email: ${errorMessage}`, { error });

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Verify SMTP connection
     */
    async verifyConnection(smtpUser: string, smtpPass: string): Promise<boolean> {
        try {
            const transporter = this.getTransporter(smtpUser, smtpPass);
            await transporter.verify();
            logger.info(`SMTP connection verified for ${smtpUser}`);
            return true;
        } catch (error) {
            logger.error(`SMTP verification failed for ${smtpUser}:`, error);
            return false;
        }
    }
}

export const smtpService = new SmtpService();
