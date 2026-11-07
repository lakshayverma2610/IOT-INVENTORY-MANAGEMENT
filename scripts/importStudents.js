/**
 * Helper script to parse and add 2nd year students to initialStudents in src/data/mockData.js
 *
 * Usage:
 * Place your student list in students.csv (columns: urn, name, course, semester, section, email)
 * and run: node scripts/importStudents.js
 */

import fs from 'fs';
import path from 'path';

const csvPath = path.resolve('students.csv');

if (!fs.existsSync(csvPath)) {
  console.log('No students.csv file found.');
  console.log('Expected CSV format (header optional):');
  console.log('URN,Name,Course,Semester,Section,Email');
  console.log('Example: 2582001,Aarav Sharma,B.Tech CSE,3,A,2582001@iilm.edu');
  process.exit(0);
}

const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

const students = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // skip header if present
  if (i === 0 && line.toLowerCase().includes('urn')) continue;

  const parts = line.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const urn = parts[0];
    const name = parts[1];
    const course = parts[2] || 'B.Tech CSE';
    const semester = parseInt(parts[3] || '3', 10);
    const section = parts[4] || 'A';
    const email = parts[5] || `${urn}@iilm.edu`;

    students.push({
      id: `stu-${urn}`,
      urn,
      name,
      email,
      course,
      semester,
      section,
    });
  }
}

console.log(`Parsed ${students.length} students.`);
console.log(JSON.stringify(students, null, 2));

