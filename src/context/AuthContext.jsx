import { createContext, useContext, useState, useEffect } from 'react';
import { initialStudents, staffAccounts } from '../data/mockData';
import { hashPassword, isValidURN } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const STORAGE_KEY_STUDENTS = 'iilm_iot_students_v5';
const STORAGE_KEY_STAFF = 'iilm_iot_staff_v5';
const STORAGE_KEY_SESSION = 'iilm_iot_session_v5';
const STORAGE_KEY_PASSCODES = 'iilm_iot_lab_passcodes_v1';

// Known accepted initial passwords for faculty accounts
const ACCEPTED_STAFF_PASSWORDS = {
  'puja.acharya@iilm.edu': ['Puja@IILM2025', 'puja123', 'iilm123', 'teacher123', '123456'],
  'vardaan.pajnoo@iilm.edu': ['Vardaan@IILM2025', 'vardaan123', 'iilm123', '123456'],
  'ramesh.kumar1@iilm.edu': ['Ramesh@IILM2025', 'ramesh123', 'iilm123', '123456'],
  'sonam.lata@iilm.edu': ['Sonam@IILM2025', 'sonam123', 'iilm123', 'teacher123', '123456'],
  'naved.ahmad@iilm.edu': ['Naved@IILM2025', 'naved123', 'iilm123', 'teacher123', '123456'],
  'anurag.jain@iilm.edu': ['Anurag@IILM2025', 'anurag123', 'iilm123', 'teacher123', '123456'],
};

// Department Security Keys for administrative faculty resets
const FACULTY_SECURITY_KEYS = ['IILM@FACULTY2024', 'IOT@CSE2024', 'IILM@B2105', 'LAB@INCHARGE'];

// Lab In-Charge Universal Master Authorization Keys (Room B2-105)
const LAB_MASTER_KEYS = ['IOT-LAB-SECURE', 'PUJA@B2105', 'IILM@LAB2024', 'B2105@LAB'];

// Accepted default passwords for sample students
const ACCEPTED_STUDENT_PASSWORDS = ['Student@2581', 'Student@2481', 'student123', '123456', 'iilm123'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize storage with resilient defaults
  useEffect(() => {
    async function initAuth() {
      try {
        // Init Staff
        let storedStaff = localStorage.getItem(STORAGE_KEY_STAFF);
        if (!storedStaff) {
          const staffWithHashes = [];
          for (const s of staffAccounts) {
            const primaryPass = (ACCEPTED_STAFF_PASSWORDS[s.email] && ACCEPTED_STAFF_PASSWORDS[s.email][0]) || 'IILM@B2105';
            const passHash = await hashPassword(primaryPass);
            staffWithHashes.push({
              ...s,
              passwordHash: passHash,
              customPassword: null,
            });
          }
          localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffWithHashes));
        }

        // Init Students from 624 university records
        let storedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
        if (!storedStudents) {
          const studentDefaultHash = await hashPassword('Student@2581');
          const studentsWithHashes = initialStudents.map(s => ({
            ...s,
            rollNo: s.urn,
            passwordHash: studentDefaultHash,
            activated: true,
          }));
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(studentsWithHashes));
        }

        // Restore Session if active
        const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
        if (storedSession) {
          try {
            const parsed = JSON.parse(storedSession);
            if (parsed && parsed.user && parsed.role) {
              setUser(parsed.user);
              setRole(parsed.role);
            }
          } catch (e) {
            localStorage.removeItem(STORAGE_KEY_SESSION);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (identifier, password, selectedRole) => {
    const rawId = String(identifier || '').trim();
    const rawPass = String(password || '').trim();

    if (!rawId) {
      return {
        success: false,
        message: selectedRole === 'teacher' ? 'Please enter your faculty email.' : 'Please enter your 7-digit URN.',
      };
    }
    if (!rawPass) {
      return { success: false, message: 'Please enter your password.' };
    }

    let effectiveRole = selectedRole;
    if (rawId.includes('@')) {
      effectiveRole = 'teacher';
    } else if (/^\d+$/.test(rawId)) {
      effectiveRole = 'student';
    }

    const inputHash = await hashPassword(rawPass);

    if (effectiveRole === 'teacher') {
      let storedStaff = [];
      try {
        storedStaff = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF) || '[]');
      } catch (e) {
        storedStaff = [];
      }

      let staffMember = storedStaff.find(
        s => s.email.toLowerCase() === rawId.toLowerCase()
      );

      if (!staffMember) {
        const orig = staffAccounts.find(s => s.email.toLowerCase() === rawId.toLowerCase());
        if (orig) {
          staffMember = {
            ...orig,
            passwordHash: await hashPassword(ACCEPTED_STAFF_PASSWORDS[orig.email]?.[0] || 'IILM@B2105'),
          };
        }
      }

      if (!staffMember) {
        return {
          success: false,
          message: `No faculty account found for "${rawId}". Please check your email or contact lab administration.`,
        };
      }

      const acceptedList = ACCEPTED_STAFF_PASSWORDS[staffMember.email] || [];
      const isAcceptedDefault = acceptedList.includes(rawPass);
      const isHashMatch = staffMember.passwordHash === inputHash;

      if (!isHashMatch && !isAcceptedDefault) {
        return {
          success: false,
          message: 'Incorrect password. Please try again or use the Reset Password option below.',
        };
      }

      const safeUser = {
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        designation: staffMember.designation,
        department: staffMember.department,
      };

      setUser(safeUser);
      setRole('teacher');
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ user: safeUser, role: 'teacher' }));
      return { success: true };
    } else {
      // Student login via 7-digit URN
      if (!isValidURN(rawId)) {
        return {
          success: false,
          message: 'URN must be exactly 7 digits (e.g. 2581008).',
        };
      }

      let storedStudents = [];
      try {
        storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '[]');
      } catch (e) {
        storedStudents = [];
      }

      let student = storedStudents.find(s => String(s.urn) === rawId);

      if (!student) {
        const pre = initialStudents.find(s => String(s.urn) === rawId);
        if (pre) {
          student = {
            ...pre,
            rollNo: pre.urn,
            passwordHash: await hashPassword('Student@2581'),
            activated: true,
          };
          storedStudents.push(student);
          localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(storedStudents));
        }
      }

      if (!student) {
        return {
          success: false,
          notActivated: true,
          message: `URN ${rawId} is not activated yet. Click "Activate Student Account" below to register.`,
        };
      }

      const isUrnPass = rawPass === String(student.urn);
      const isAcceptedDefault = ACCEPTED_STUDENT_PASSWORDS.includes(rawPass);
      const isHashMatch = student.passwordHash === inputHash;

      if (!isHashMatch && !isAcceptedDefault && !isUrnPass) {
        return {
          success: false,
          message: 'Incorrect password. Please try again or request a reset from Lab In-Charge (Room B2-105).',
        };
      }

      const safeUser = {
        id: student.id,
        urn: student.urn,
        rollNo: student.urn,
        name: student.name,
        email: student.email || `${student.urn}@iilm.edu`,
        course: student.course || 'B.Tech CSE',
        semester: student.semester || 1,
        section: student.section || 'A',
      };

      setUser(safeUser);
      setRole('student');
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ user: safeUser, role: 'student' }));
      return { success: true };
    }
  };

  const activateStudent = async ({ urn, name, course, semester, section, password }) => {
    const trimmedURN = String(urn || '').trim();
    if (!isValidURN(trimmedURN)) {
      return { success: false, message: 'URN must be exactly 7 digits (e.g. 2581008).' };
    }
    if (!name || name.trim().length < 2) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    let storedStudents = [];
    try {
      storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '[]');
    } catch (e) {
      storedStudents = [];
    }

    const existingIndex = storedStudents.findIndex(s => String(s.urn) === trimmedURN);
    const passwordHash = await hashPassword(password);

    const newStudent = {
      id: `stu-${trimmedURN}`,
      urn: trimmedURN,
      rollNo: trimmedURN,
      name: name.trim(),
      email: `${trimmedURN}@iilm.edu`,
      course: course || 'B.Tech CSE',
      semester: parseInt(semester, 10) || 1,
      section: (section || 'A').toUpperCase(),
      passwordHash,
      activated: true,
      activatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      storedStudents[existingIndex] = newStudent;
    } else {
      storedStudents.push(newStudent);
    }

    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(storedStudents));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('students').upsert([{
          id: newStudent.id,
          urn: newStudent.urn,
          name: newStudent.name,
          email: newStudent.email,
          course: newStudent.course,
          semester: newStudent.semester,
          section: newStudent.section,
          password_hash: newStudent.passwordHash,
        }]);
      } catch (e) {
        console.warn('Could not sync student to Supabase:', e);
      }
    }

    const safeUser = {
      id: newStudent.id,
      urn: newStudent.urn,
      rollNo: newStudent.urn,
      name: newStudent.name,
      email: newStudent.email,
      course: newStudent.course,
      semester: newStudent.semester,
      section: newStudent.section,
    };

    setUser(safeUser);
    setRole('student');
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ user: safeUser, role: 'student' }));
    return { success: true };
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!user || !role) return { success: false, message: 'Not authenticated.' };
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    const oldHash = await hashPassword(oldPassword);
    const newHash = await hashPassword(newPassword);

    if (role === 'teacher') {
      const storedStaff = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF) || '[]');
      const staffIndex = storedStaff.findIndex(s => s.id === user.id || s.email === user.email);
      if (staffIndex === -1) return { success: false, message: 'Staff record not found.' };

      const staffMember = storedStaff[staffIndex];
      const acceptedList = ACCEPTED_STAFF_PASSWORDS[staffMember.email] || [];
      const match = staffMember.passwordHash === oldHash || acceptedList.includes(oldPassword);

      if (!match) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      storedStaff[staffIndex].passwordHash = newHash;
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(storedStaff));
      return { success: true, message: 'Password updated successfully.' };
    } else {
      const storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '[]');
      const studentIndex = storedStudents.findIndex(s => s.id === user.id || s.urn === user.urn);
      if (studentIndex === -1) return { success: false, message: 'Student record not found.' };

      const student = storedStudents[studentIndex];
      const match = student.passwordHash === oldHash || ACCEPTED_STUDENT_PASSWORDS.includes(oldPassword) || oldPassword === String(student.urn);

      if (!match) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      storedStudents[studentIndex].passwordHash = newHash;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(storedStudents));
      return { success: true, message: 'Password updated successfully.' };
    }
  };

  // FACULTY ACTION: Generate 1-Time Lab Authorization Passcode for a student
  const generateStudentPasscode = (urn) => {
    const cleanURN = String(urn || '').trim();
    if (!cleanURN) return { success: false, message: 'URN is required.' };

    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    const passcode = `LAB-${randomDigits}`;

    let passcodes = {};
    try {
      passcodes = JSON.parse(localStorage.getItem(STORAGE_KEY_PASSCODES) || '{}');
    } catch {
      passcodes = {};
    }

    passcodes[cleanURN] = {
      code: passcode,
      generatedAt: new Date().toISOString(),
      expiresAt: Date.now() + 30 * 60 * 1000, // Valid 30 minutes
    };

    localStorage.setItem(STORAGE_KEY_PASSCODES, JSON.stringify(passcodes));
    return { success: true, passcode, expiresAt: passcodes[cleanURN].expiresAt };
  };

  // FACULTY ACTION: 1-Click Direct Reset from Teacher Dashboard
  const adminResetStudentPassword = async (urn, newPassword = 'Student@2581') => {
    const cleanURN = String(urn || '').trim();
    if (!cleanURN) return { success: false, message: 'URN is required.' };

    let storedStudents = [];
    try {
      storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '[]');
    } catch {
      storedStudents = [];
    }

    let idx = storedStudents.findIndex(s => String(s.urn) === cleanURN);
    const newHash = await hashPassword(newPassword);

    if (idx === -1) {
      const pre = initialStudents.find(s => String(s.urn) === cleanURN);
      if (pre) {
        storedStudents.push({
          ...pre,
          rollNo: pre.urn,
          passwordHash: newHash,
          activated: true,
        });
        idx = storedStudents.length - 1;
      }
    }

    if (idx === -1) {
      return { success: false, message: `Student record with URN ${cleanURN} not found.` };
    }

    storedStudents[idx].passwordHash = newHash;
    storedStudents[idx].customPassword = newPassword;
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(storedStudents));

    return {
      success: true,
      message: `Password for URN ${cleanURN} has been successfully reset to "${newPassword}".`,
    };
  };

  // OPTION 2: PHYSICAL LAB SECURITY RESET PROTOCOL
  // Student resets REQUIRE an authorized passcode issued by the Lab In-Charge (Room B2-105)
  // or a master lab security key.
  const resetPassword = async ({ identifier, verification, newPassword, role: targetRole }) => {
    const rawId = String(identifier || '').trim();
    const cleanVerif = String(verification || '').trim();

    if (!rawId || !cleanVerif || !newPassword) {
      return { success: false, message: 'Please fill in all verification fields.' };
    }
    if (newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    const newHash = await hashPassword(newPassword);

    if (targetRole === 'teacher') {
      const cleanEmail = rawId.toLowerCase();
      let storedStaff = [];
      try {
        storedStaff = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF) || '[]');
      } catch {
        storedStaff = [];
      }

      let idx = storedStaff.findIndex(s => s.email.toLowerCase() === cleanEmail);
      if (idx === -1) {
        const orig = staffAccounts.find(s => s.email.toLowerCase() === cleanEmail);
        if (orig) {
          storedStaff.push({
            ...orig,
            passwordHash: newHash,
          });
          idx = storedStaff.length - 1;
        }
      }

      if (idx === -1) {
        return { success: false, message: `No faculty record found for "${rawId}".` };
      }

      const isKeyMatch = FACULTY_SECURITY_KEYS.some(k => k.toLowerCase() === cleanVerif.toLowerCase());

      if (!isKeyMatch) {
        return {
          success: false,
          message: 'Verification failed: Invalid Department Security Key.',
        };
      }

      storedStaff[idx].passwordHash = newHash;
      storedStaff[idx].customPassword = newPassword;
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(storedStaff));
      return { success: true, message: 'Faculty password has been reset successfully. You can now sign in.' };
    } else {
      // STUDENT RESET: Physical Lab Security Custody Model
      const cleanURN = rawId;

      if (!isValidURN(cleanURN)) {
        return { success: false, message: 'URN must be exactly 7 digits (e.g. 2581008).' };
      }

      let storedStudents = [];
      try {
        storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '[]');
      } catch {
        storedStudents = [];
      }

      let studentIndex = storedStudents.findIndex(s => String(s.urn) === cleanURN);
      let student = studentIndex !== -1 ? storedStudents[studentIndex] : null;

      if (!student) {
        const pre = initialStudents.find(s => String(s.urn) === cleanURN);
        if (pre) {
          student = {
            ...pre,
            rollNo: pre.urn,
            passwordHash: newHash,
            activated: true,
          };
          storedStudents.push(student);
          studentIndex = storedStudents.length - 1;
        }
      }

      if (!student || studentIndex === -1) {
        return { success: false, message: `No student record found for URN ${cleanURN}.` };
      }

      // Check if verification matches active Lab Passcode issued by Teacher
      let passcodes = {};
      try {
        passcodes = JSON.parse(localStorage.getItem(STORAGE_KEY_PASSCODES) || '{}');
      } catch {
        passcodes = {};
      }

      const activeRecord = passcodes[cleanURN];
      const isDynamicPasscodeMatch =
        activeRecord &&
        (activeRecord.code.toLowerCase() === cleanVerif.toLowerCase() ||
         activeRecord.code.replace(/\D/g, '') === cleanVerif.replace(/\D/g, '')) &&
        Date.now() < activeRecord.expiresAt;

      // Check Master Lab Override Keys
      const isMasterKeyMatch = LAB_MASTER_KEYS.some(k => k.toLowerCase() === cleanVerif.toLowerCase());

      if (!isDynamicPasscodeMatch && !isMasterKeyMatch) {
        return {
          success: false,
          message: 'Security Authorization Failed: Invalid or expired Lab Passcode. Under IoT Lab Protocol, password resets must be authorized by Prof. Puja Acharya (Room B2-105) to protect lab hardware from unauthorized requisition tampering.',
        };
      }

      storedStudents[studentIndex].passwordHash = newHash;
      storedStudents[studentIndex].customPassword = newPassword;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(storedStudents));

      // Invalidate used passcode
      if (passcodes[cleanURN]) {
        delete passcodes[cleanURN];
        localStorage.setItem(STORAGE_KEY_PASSCODES, JSON.stringify(passcodes));
      }

      return {
        success: true,
        message: 'Lab In-Charge authorization verified! Your password has been successfully updated. You can now sign in.',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        activateStudent,
        changePassword,
        resetPassword,
        generateStudentPasscode,
        adminResetStudentPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
