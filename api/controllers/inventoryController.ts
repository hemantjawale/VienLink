import { Response } from 'express';
import { validationResult } from 'express-validator';
import BloodInventory from '../models/BloodInventory';
import { AuthRequest } from '../middleware/auth';

export const getBloodInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.user!;

    // Get all blood types with their current stock
    const inventory = await BloodInventory.aggregate([
      { $match: { hospital_id: hospitalId, status: 'available' } },
      {
        $group: {
          _id: '$blood_type',
          total_quantity: { $sum: '$quantity_ml' },
          unit_count: { $sum: 1 },
          expiring_soon: {
            $sum: {
              $cond: [
                { $lte: ['$expiry_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format the response
    const formattedInventory = inventory.map(item => ({
      blood_type: item._id,
      quantity_ml: item.total_quantity,
      unit_count: item.unit_count,
      expiring_soon: item.expiring_soon,
      critical_level: item.total_quantity < 500 // Less than 500ml is critical
    }));

    // Add missing blood types with zero quantity
    const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const existingTypes = formattedInventory.map(item => item.blood_type);
    
    allBloodTypes.forEach(bloodType => {
      if (!existingTypes.includes(bloodType)) {
        formattedInventory.push({
          blood_type: bloodType,
          quantity_ml: 0,
          unit_count: 0,
          expiring_soon: 0,
          critical_level: true
        });
      }
    });

    res.json({
      inventory: formattedInventory.sort((a, b) => a.blood_type.localeCompare(b.blood_type)),
      last_updated: new Date()
    });
  } catch (error) {
    console.error('Get blood inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBloodStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { hospitalId } = req.user!;
    const { blood_type, quantity_change, operation, reason, batch_id, donor_id } = req.body;

    if (operation === 'add') {
      // Add new blood units
      const newUnit = new BloodInventory({
        hospital_id: hospitalId,
        blood_type,
        batch_id,
        quantity_ml: quantity_change,
        collection_date: new Date(),
        expiry_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 35 days expiry
        status: 'available',
        donor_id
      });

      await newUnit.save();

      res.json({
        message: 'Blood stock updated successfully',
        unit: newUnit,
        operation: 'add'
      });
    } else if (operation === 'remove') {
      // Remove blood units (allocate or dispose)
      const unitsToRemove = await BloodInventory.find({
        hospital_id: hospitalId,
        blood_type,
        status: 'available'
      }).sort({ expiry_date: 1 }).limit(Math.ceil(quantity_change / 350)); // Assume 350ml per unit

      if (unitsToRemove.length === 0) {
        res.status(400).json({ error: 'No available blood units to remove' });
        return;
      }

      // Update units based on reason
      const updatePromises = unitsToRemove.map(unit => {
        let status: 'available' | 'allocated' | 'expired' | 'disposed' = 'available';
        
        if (reason === 'request') {
          status = 'allocated';
        } else if (reason === 'expired') {
          status = 'expired';
        } else if (reason === 'disposed') {
          status = 'disposed';
        }

        return BloodInventory.findByIdAndUpdate(unit._id, { status });
      });

      await Promise.all(updatePromises);

      res.json({
        message: 'Blood stock updated successfully',
        units_updated: unitsToRemove.length,
        operation: 'remove',
        reason
      });
    } else {
      res.status(400).json({ error: 'Invalid operation. Must be "add" or "remove"' });
    }
  } catch (error) {
    console.error('Update blood stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpiringBlood = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.user!;
    const { days = 7 } = req.query;

    const expiringDate = new Date(Date.now() + parseInt(days as string) * 24 * 60 * 60 * 1000);

    const expiringBlood = await BloodInventory.find({
      hospital_id: hospitalId,
      status: 'available',
      expiry_date: { $lte: expiringDate }
    }).sort({ expiry_date: 1 });

    res.json({
      expiring_blood: expiringBlood,
      total_units: expiringBlood.length,
      total_quantity_ml: expiringBlood.reduce((sum, unit) => sum + unit.quantity_ml, 0)
    });
  } catch (error) {
    console.error('Get expiring blood error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};