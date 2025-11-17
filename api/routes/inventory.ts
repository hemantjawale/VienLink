import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { getBloodInventory, updateBloodStock, getExpiringBlood } from '../controllers/inventoryController';

const router = express.Router();

// All inventory routes require authentication
router.use(authenticate);

// Get blood inventory overview
router.get('/', getBloodInventory);

// Update blood stock (add/remove units)
router.put('/update', [
  body('blood_type').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood type is required'),
  body('quantity_change').isNumeric().withMessage('Quantity change must be a number'),
  body('operation').isIn(['add', 'remove']).withMessage('Operation must be "add" or "remove"'),
  body('reason').isIn(['donation', 'request', 'expired', 'disposed']).withMessage('Valid reason is required'),
  body('batch_id').optional().isString().withMessage('Batch ID must be a string')
], updateBloodStock);

// Get expiring blood units
router.get('/expiring', getExpiringBlood);

export default router;