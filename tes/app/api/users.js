import { connectDB } from '../../lib/db';

export default async function handler(req, res) {
  const db = await connectDB();

  const [rows] = await db.execute('SELECT * FROM users');
  
  res.status(200).json(rows);
}