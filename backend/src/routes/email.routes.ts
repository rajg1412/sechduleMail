import { Router } from 'express';
import { emailController } from '../controllers/email.controller';

const router = Router();

// Schedule a new email
router.post('/schedule', (req, res) => emailController.scheduleEmail(req, res));

// List emails
router.get('/', (req, res) => emailController.listEmails(req, res));

// Get email statistics
router.get('/stats', (req, res) => emailController.getStats(req, res));

// Get email by ID
router.get('/:id', (req, res) => emailController.getEmail(req, res));

// Cancel scheduled email
router.delete('/:id', (req, res) => emailController.cancelEmail(req, res));

export default router;
