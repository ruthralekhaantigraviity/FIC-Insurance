import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import ExcelJS from 'exceljs';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import { authGuard } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// @route   POST api/leads/import
// @desc    Import leads from CSV or XLSX (Admin/TL)
router.post('/import', [authGuard, allowRoles('admin', 'team_leader'), upload.single('file')], async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

  const results = [];
  const filePath = req.file.path;
  const isExcel = req.file.originalname.endsWith('.xlsx') || req.file.originalname.endsWith('.xls');

  try {
    if (isExcel) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1);
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header
          const data = {
            name: row.getCell(1).value,
            phone: row.getCell(2).value?.toString(),
            email: row.getCell(3).value,
            city: row.getCell(4).value,
            vehicleNumber: row.getCell(5).value,
          };
          results.push(data);
        }
      });
    } else {
      // Handle CSV
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', resolve)
          .on('error', reject);
      });
    }

    const leads = results.map(item => ({
      name: item.name || item.customerName,
      phone: item.phone || item.phoneNumber,
      email: typeof item.email === 'object' ? item.email.text : item.email,
      city: item.city,
      vehicleNumber: item.vehicleNumber,
      assignedBy: req.user._id,
      status: 'new'
    })).filter(l => l.name && l.phone);

    if (leads.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No valid leads found in file' });
    }

    await Lead.insertMany(leads);
    fs.unlinkSync(filePath); 
    res.json({ message: `${leads.length} leads imported successfully` });
  } catch (err) {
    console.error('Import error:', err);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Error processing file' });
  }
});

// @route   GET api/leads
// @desc    Get all leads (Role-based filtering)
router.get('/', authGuard, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'employee') {
      query = { assignedTo: req.user._id };
    } else if (req.user.role === 'team_leader') {
      query = { branch: req.user.branch };
    }
    
    const leads = await Lead.find(query).populate('assignedTo', 'name').sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/leads/:id/status
// @desc    Update lead status
router.put('/:id/status', authGuard, async (req, res) => {
  try {
    const { status, insuranceType, note } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const oldStatus = lead.status;
    lead.status = status;
    if (insuranceType) lead.insuranceType = insuranceType;
    
    // Add to history
    lead.history.push({
      status,
      note: note || `Status updated from ${oldStatus} to ${status}`,
      author: req.user._id
    });

    // Add to notes if explicitly provided
    if (note) {
      lead.notes.push({ text: note, author: req.user._id });
    }

    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// @route   PUT api/leads/assign
// @desc    Assign leads to an employee (Admin/TL)
router.put('/assign', [authGuard, allowRoles('admin', 'team_leader')], async (req, res) => {
  try {
    const { leadIds, employeeId } = req.body;
    if (!leadIds || !employeeId) {
      return res.status(400).json({ message: 'Lead IDs and employee ID are required' });
    }

    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Perform bulk update with history logging
    const leads = await Lead.find({ _id: { $in: leadIds } });
    
    await Promise.all(leads.map(async (lead) => {
      lead.assignedTo = employeeId;
      lead.status = 'assigned';
      lead.history.push({
        status: 'assigned',
        author: req.user._id,
        note: `Lead assigned to ${employee.name} by ${req.user.name || 'Admin/TL'}`
      });
      return lead.save();
    }));

    res.json({ message: `Successfully assigned ${leads.length} leads to ${employee.name}` });
  } catch (err) {
    console.error('Assignment error:', err);
    res.status(500).json({ message: 'Assignment failed' });
  }
});

// @route   DELETE api/leads/bulk
// @desc    Delete multiple leads (Admin/TL)
router.delete('/bulk', [authGuard, allowRoles('admin', 'team_leader')], async (req, res) => {
  try {
    const { leadIds } = req.body;
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: 'Lead IDs are required' });
    }
    
    await Lead.deleteMany({ _id: { $in: leadIds } });
    res.json({ message: `Successfully deleted ${leadIds.length} leads` });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ message: 'Failed to delete leads' });
  }
});

// @route   DELETE api/leads/:id
// @desc    Delete a lead (Admin/TL)
router.delete('/:id', [authGuard, allowRoles('admin', 'team_leader')], async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    await lead.deleteOne();
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
});

export default router;
