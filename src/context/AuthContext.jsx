import { createContext, useContext, useState, useEffect } from 'react';
import { initialStudents, staffAccounts } from '../data/mockData';
import { hashPassword, isValidURN, isValidEmail } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const STORAGE_KEY_STUDENTS = 'iilm_iot_students_v4';
const STORAGE_KEY_STAFF = 'iilm_iot_staff_v4';
const STORAGE_KEY_SESSION = 'iilm_iot_session_v4';

// Known accepted initial passwords for faculty accounts
const ACCEPTED_STAFF_PASSWORDS = {
  'puja.acharya@iilm.edu': ['Puja@IILM2025', 'puja123', 'iilm123', 'teacher123', '123456'],
  'vardaan.pajnoo@iilm.edu': ['Vardaan@IILM2025', 'vardaan123', 'iilm123', '123456'],
  'ramesh.kumar1@iilm.edu': ['Ramesh@IILM2025', 'ramesh123', 'iilm123', '123456'],
  'sonam.lata@iilm.edu': ['Sonam@IILM2025', 'sonam123', 'iilm123', 'teacher123', '123456'],
  'naved.ahmad@iilm.edu': ['Naved@IILM2025', 'naved123', 'iilm123', 'teacher123', '123456'],
  'anurag.jain@iilm.edu': ['Anurag@IILM2025', 'anurag123', 'iilm123', 'teacher123', '123456'],
};

// Known accepted initial passwords for sample students
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
            staffWithHashes.push({ ...s, passwordHash: passHash, customPassword: null });
          }
          localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffWithHashes));
        }

        // Init Students
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

    // Auto-detect role if user typed an email or URN in the other tab
    let effectiveRole = selectedRole;
    if (rawId.includes('@')) {
      effectiveRole = 'teacher';
    } else if (/^\d+$/.test(rawId)) {
      effectiveRole = 'student';
    }

    const inputHash = await hashPassword(rawPass);

    if (effectiveRole === 'teacher') {
      // Find staff in storage or fallback to staffAccounts
      let storedStaff = [];
      try {
        storedStaff = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF) || '[]');
      } catch (e) {
        storedStaff = [];
      }

      let staffMember = storedStaff.find(
        s => s.email.toLowerCase() === rawId.toLowerCase()
      );

      // If not in storage yet, check original staffAccounts
      if (!staffMember) {
        const orig = staffAccounts.find(s => s.email.toLowerCase() === rawId.toLowerCase());
        if (orig) {
          staffMember = { ...orig, passwordHash: await hashPassword(ACCEPTED_STAFF_PASSWORDS[orig.email]?.[0] || 'IILM@B2105') };
        }
      }

      if (!staffMember) {
        return {
          success: false,
          message: `No faculty account found for "${rawId}". Please check your email or contact lab administration.`,
        };
      }

      // Check if password matches stored hash or any of the accepted default passwords
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

      // If student not found in storage, check initialStudents
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

      // If still not found, check if it's a valid 7-digit URN trying to log in for the first time
      if (!student) {
        return {
          success: false,
          notActivated: true,
          message: `URN ${rawId} is not activated yet. Click "Activate Student Account" below to register.`,
        };
      }

      // Check password: match hash, accepted defaults, or the URN itself as password
      const isUrnPass = rawPass === String(student.urn);
      const isAcceptedDefault = ACCEPTED_STUDENT_PASSWORDS.includes(rawPass);
      const isHashMatch = student.passwordHash === inputHash;

      if (!isHashMatch && !isAcceptedDefault && !isUrnPass) {
        return {
          success: false,
          message: 'Incorrect password. Please try again or use the Reset Password option below.',
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
      id: existingIndex >= 0 ? storedStudents[existingIndex].id : `stu-${Date.now()}`,
      urn: trimmedURN,
      rollNo: trimmedURN,
      name: name.trim(),
      email: `${trimmedURN}@iilm.edu`,
      course: course || 'B.Tech CSE',
      semester: Number(semester) || 1,
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

      // Allow change if hash matches or if user typed accepted default
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

  const resetPassword = async ({ identifier, verification, newPassword, role: targetRole }) => {
    if (!identifier || !newPassword) {
      return { success: false, message: 'Please provide all required fields.' };
    }
    if (newPassword.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    const newHash = await hashPassword(newPassword);

    if (targetRole === 'teacher') {
      const cleanEmail = String(identifier).trim().toLowerCase();
      const cleanVerif = String(verification || '').trim().toLowerCase();

      let storedStaff = [];
      try {
        storedStaff = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF) || '[]');
      } catch {
        storedStaff = [];
      }

      const idx = storedStaff.findIndex(s => s.email.toLowerCase() === cleanEmail);
      if (idx === -1) {
        return { success: false, message: `No faculty record found for "${identifier}".` };
      }

      const staffMember = storedStaff[idx];
      if (cleanVerif) {
        const nameMatch = staffMember.name.toLowerCase().includes(cleanVerif) || cleanVerif.includes(staffMember.name.toLowerCase());
        const emailMatch = staffMember.email.toLowerCase() === cleanVerif;
        if (!nameMatch && !emailMatch) {
          return { success: false, message: 'Verification failed: Faculty name does not match our records.' };
        }
      }

      storedStaff[idx].passwordHash = newHash;
      storedStaff[idx].customPassword = newPassword;
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(storedStaff));
      return { success: true, message: 'Password has been reset successfully. You can now sign in.' };
    } else {
      const cleanURN = String(identifier).trim();
      const cleanVerif = String(verification || '').trim().toLowerCase();

      let storedStudents = [];
      try {
        storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '[]');
      } catch {
        storedStudents = [];
      }

      let student = storedStudents.find(s => String(s.urn) === cleanURN);
      let studentIndex = storedStudents.findIndex(s => String(s.urn) === cleanURN);

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

      if (cleanVerif) {
        const sEmail = (student.email || '').toLowerCase();
        const sName = (student.name || '').toLowerCase();
        const emailMatch = sEmail.includes(cleanVerif) || cleanVerif.includes(sEmail);
        const nameMatch = sName.includes(cleanVerif) || cleanVerif.includes(sName);
        if (!emailMatch && !nameMatch) {
          return { success: false, message: 'Verification failed: Registered email or student name does not match.' };
        }
      }

      storedStudents[studentIndex].passwordHash = newHash;
      storedStudents[studentIndex].customPassword = newPassword;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(storedStudents));
      return { success: true, message: 'Password has been reset successfully. You can now sign in.' };
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
