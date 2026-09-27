const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

// Order Field Service Ticket (UMKM Owner)
router.post('/order', authenticate, authorizeRoles('UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'), (req, res) => {
  const { service_type, requirement_notes } = req.body;

  if (!service_type) {
    return res.status(400).json({ success: false, error: 'Jenis layanan pendampingan wajib dipilih' });
  }

  const reqId = `sr-${Date.now()}`;
  const serviceReq = {
    id: reqId,
    client_id: req.user.id,
    service_type,
    current_status: 'OPEN',
    requirement_notes: requirement_notes || '',
    created_at: new Date().toISOString()
  };

  db.serviceRequests.push(serviceReq);

  // Auto-create associated service task for field operations
  const task = {
    id: `st-${Date.now()}`,
    request_id: reqId,
    consultant_id: null,
    task_step: 'Pendampingan Lapangan & Optimasi Peta',
    proof_evidence_url: '',
    task_status: 'UNASSIGNED',
    updated_at: new Date().toISOString()
  };

  db.serviceTasks.push(task);

  return res.status(201).json({
    success: true,
    data: {
      request: serviceReq,
      task
    }
  });
});

// List Service Tasks (Filtered by role: Client vs Field Agent vs Admin)
router.get('/tasks', authenticate, (req, res) => {
  let tasks = [];

  if (req.user.role_code === 'SUPER_ADMIN') {
    tasks = db.serviceTasks;
  } else if (req.user.role_code === 'FIELD_AGENT') {
    tasks = db.serviceTasks.filter(t => t.consultant_id === req.user.id || t.task_status === 'UNASSIGNED');
  } else {
    // UMKM Owner sees tasks for their service requests
    const myReqIds = db.serviceRequests.filter(r => r.client_id === req.user.id).map(r => r.id);
    tasks = db.serviceTasks.filter(t => myReqIds.includes(t.request_id));
  }

  // Populate metadata
  const populated = tasks.map(task => {
    const sReq = db.serviceRequests.find(r => r.id === task.request_id);
    const clientUser = sReq ? db.users.find(u => u.id === sReq.client_id) : null;
    const consultantUser = task.consultant_id ? db.users.find(u => u.id === task.consultant_id) : null;

    return {
      ...task,
      request_details: sReq || null,
      client_name: clientUser ? clientUser.full_name : 'Unknown Client',
      consultant_name: consultantUser ? consultantUser.full_name : 'Unassigned Agent'
    };
  });

  return res.json({
    success: true,
    data: populated
  });
});

// Assign Task to Field Consultant (SUPER_ADMIN only)
router.patch('/tasks/:id/assign', authenticate, authorizeRoles('SUPER_ADMIN'), (req, res) => {
  const { consultant_id } = req.body;
  const taskId = req.params.id;

  const task = db.serviceTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task pendampingan tidak ditemukan' });
  }

  const agent = db.users.find(u => u.id === consultant_id && u.role_code === 'FIELD_AGENT');
  if (!agent) {
    return res.status(400).json({ success: false, error: 'Konsultan/Agen Wilayah tidak valid' });
  }

  task.consultant_id = agent.id;
  task.task_status = 'ASSIGNED';
  task.updated_at = new Date().toISOString();

  // Update request status
  const sReq = db.serviceRequests.find(r => r.id === task.request_id);
  if (sReq) sReq.current_status = 'ASSIGNED';

  return res.json({
    success: true,
    data: task
  });
});

// Upload Geotag Evidence & Completion Proof (FIELD_AGENT or SUPER_ADMIN)
router.post('/tasks/:id/evidence', authenticate, authorizeRoles('FIELD_AGENT', 'SUPER_ADMIN'), (req, res) => {
  const taskId = req.params.id;
  const { proof_evidence_url, latitude, longitude, notes } = req.body;

  const task = db.serviceTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task pendampingan tidak ditemukan' });
  }

  task.proof_evidence_url = proof_evidence_url || `https://geotag-evidence.benpayu.com/proof-${Date.now()}.jpg`;
  task.geotag_location = {
    latitude: latitude || -6.2088,
    longitude: longitude || 106.8456,
    timestamp: new Date().toISOString()
  };
  task.task_status = 'EVIDENCE_UPLOADED';
  task.notes = notes || 'Bukti foto lokasi dan pemasangan QR selesai';
  task.updated_at = new Date().toISOString();

  const sReq = db.serviceRequests.find(r => r.id === task.request_id);
  if (sReq) sReq.current_status = 'EVIDENCE_UPLOADED';

  return res.json({
    success: true,
    data: task
  });
});

// Update Task Lifecycle Status
router.patch('/tasks/:id/status', authenticate, (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['IN_PROGRESS', 'EVIDENCE_UPLOADED', 'COMPLETED', 'CLOSED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Status tidak valid' });
  }

  const task = db.serviceTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, error: 'Task pendampingan tidak ditemukan' });
  }

  task.task_status = status;
  task.updated_at = new Date().toISOString();

  const sReq = db.serviceRequests.find(r => r.id === task.request_id);
  if (sReq) sReq.current_status = status;

  return res.json({
    success: true,
    data: task
  });
});

// Smart Agent Route Optimization (FIELD_AGENT or SUPER_ADMIN)
router.get('/agent-route', authenticate, authorizeRoles('FIELD_AGENT', 'SUPER_ADMIN'), (req, res) => {
  const tasks = db.serviceTasks.map((t, idx) => {
    const sReq = db.serviceRequests.find(r => r.id === t.request_id);
    const clientUser = sReq ? db.users.find(u => u.id === sReq.client_id) : null;
    const biz = clientUser ? db.businessProfiles.find(b => b.user_id === clientUser.id) : null;

    return {
      stop_sequence: idx + 1,
      task_id: t.id,
      client_name: clientUser ? clientUser.full_name : 'Klien UMKM',
      business_name: biz ? biz.business_name : 'Toko UMKM',
      address_text: biz ? biz.address_text : 'Jakarta',
      estimated_distance_km: (idx + 1) * 1.8,
      status: t.task_status
    };
  });

  return res.json({
    success: true,
    agent_id: req.user.id,
    optimized_route: tasks
  });
});

module.exports = router;
