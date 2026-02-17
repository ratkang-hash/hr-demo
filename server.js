import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Client } = pg;
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json());

// --- ตั้งค่าโฟลเดอร์สำหรับเก็บรูป ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// --- ตั้งค่า Database (เช็ค Password ดีๆ นะครับ) ---
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: '1234', // <--- ⭐ แก้รหัสผ่านตรงนี้ให้เป็นของคุณ
  port: 5432,
};

// --- ตั้งค่าตัวรับไฟล์ (Multer) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์: เวลาปัจจุบัน + นามสกุลเดิม
    cb(null, Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage });

// เปิดให้คนนอกเข้าถึงรูปภาพได้
app.use('/uploads', express.static('uploads'));

// --- API จัดการพนักงาน ---

// 1. ดึงรายชื่อทั้งหมด
app.get('/api/employees', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM employees ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await client.end();
  }
});

// 2. เพิ่มพนักงานใหม่ + อัปโหลดรูป 📸
app.post('/api/employees', upload.single('image'), async (req, res) => {
  // ข้อมูล Text จะอยู่ใน req.body
  const { first_name, last_name, email, position, salary } = req.body;
  // ข้อมูลไฟล์ จะอยู่ใน req.file (ถ้ามี)
  const profile_picture = req.file ? req.file.filename : null;
  
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const sql = `
      INSERT INTO employees (first_name, last_name, email, position, salary, profile_picture)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [first_name, last_name, email, position, salary, profile_picture];
    const result = await client.query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await client.end();
  }
});

// 3. แก้ไขข้อมูล (Update)
app.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, position, salary } = req.body;
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const sql = `
      UPDATE employees 
      SET first_name = $1, last_name = $2, email = $3, position = $4, salary = $5
      WHERE id = $6
      RETURNING *
    `;
    const result = await client.query(sql, [first_name, last_name, email, position, salary, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await client.end();
  }
});

// 4. ลบข้อมูล (Delete)
app.delete('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await client.query('DELETE FROM employees WHERE id = $1', [id]);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await client.end();
  }
});

// --- API ประวัติการฝึกอบรม ---

app.get('/api/employees/:id/training', async (req, res) => {
  const { id } = req.params;
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM training_history WHERE employee_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await client.end();
  }
});

app.post('/api/employees/:id/training', async (req, res) => {
  const { id } = req.params;
  const { course_name, training_date } = req.body;
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const sql = `INSERT INTO training_history (course_name, training_date, employee_id) VALUES ($1, $2, $3) RETURNING *`;
    const result = await client.query(sql, [course_name, training_date, id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    await client.end();
  }
});

// เริ่มต้น Server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
