import { Router } from 'express';
import { senderController } from '../controllers/sender.controller';

const router = Router();

// Create a new sender
router.post('/', (req, res) => senderController.createSender(req, res));

// List all senders
router.get('/', (req, res) => senderController.listSenders(req, res));

// Get sender by ID
router.get('/:id', (req, res) => senderController.getSender(req, res));

// Update sender
router.patch('/:id', (req, res) => senderController.updateSender(req, res));

// Delete sender
router.delete('/:id', (req, res) => senderController.deleteSender(req, res));

export default router;
