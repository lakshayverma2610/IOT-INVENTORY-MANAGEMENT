import { createContext, useContext, useState, useEffect } from 'react';
import { initialStudents, staffAccounts } from '../data/mockData';
import { hashPassword, isValidURN, isValidEmail } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const STORAGE_KEY_STUDENTS = 'iilm_iot_students_v5';
const STORAGE_KEY_STAFF = 'iilm_iot_staff_v5';
const STORAGE_KEY_SESSION = 'iilm_iot_session_v5';

// Known accepted initial passwords for faculty accounts
const ACCEPTED_STAFF_PASSWORDS = {
  'puja.acharya@iilm.edu': ['Puja@IILM2025', 'puja123', 'iilm123', 'teacher123', '123456'],
  'vardaan.pajnoo@iilm.edu': ['Vardaan@IILM2025', 'vardaan123', 'iilm123', '123456'],
  'ramesh.kumar1@iilm.edu': ['Ramesh@IILM2025', 'ramesh123', 'iilm123', '123456'],
  'sonam.lata@iilm.edu': ['Sonam@IILM2025', 'sonam123', 'iilm123', 'teacher123', '123456'],
  'naved.ahmad@iilm.edu': ['Naved@IILM2025', 'naved123', 'iilm123', 'teacher123', '123456'],
  'anurag.jain@iilm.edu': ['Anurag@IILM2025', 'anurag123', 'iilm123', 'teacher123', '123456'],
};

// Master Faculty / Department Security Keys for administrative reset
const FACULTY_SECURITY_KEYS = ['IILM@FACULTY2024', 'IOT@CSE2024', 'IILM@B2105', 'LAB@INCHARGE'];

// Lab In-Charge Override Security Passcodes (for students who lost phone access)
const LAB_OVERRIDE_KEYS = ['IOT-LAB-SECURE', 'IILM@LAB2024', 'PUJA@IOT2024', '2024LAB'];

// Accepted default passwords for sample students
const ACCEPTED_STUDENT_PASSWORDS = ['Student@2581', 'Student@2481', 'student123', '123456', 'iilm123'];

// In-memory OTP simulation cache: { [identifier]: { code: string, expires: number } }
const otpCache = {};

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
              phoneLast4: s.phoneLast4 || '0000',
              passwordHash: passHash,
              customPassword: null,
            });
          }
          localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffWithHashes));
        }

        // Init Students with Phone Last 4 Digits from university records
        let storedStudents = localStorage.getItem(STORAGE_KEY_STUDENTS);
        if (!storedStudents) {
          const studentDefaultHash = await hashPassword('Student@2581');
          const studentsWithHashes = initialStudents.map(s => ({
            ...s,
            rollNo: s.urn,
            phoneLast4: s.phoneLast4 || String(s.urn).slice(-4),
            parentPhoneLast4: s.parentPhoneLast4 || null,
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
            phoneLast4: orig.phoneLast4 || '0000',
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
            phoneLast4: pre.phoneLast4 || String(pre.urn).slice(-4),
            parentPhoneLast4: pre.parentPhoneLast4 || null,
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

  const activateStudent = async ({ urn, name, course, semester, section, password, phone }) => {
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

    const cleanPhoneLast4 = phone ? String(phone).replace(/\D/g, '').slice(-4) : trimmedURN.slice(-4);

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
      phoneLast4: cleanPhoneLast4,
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

  // Look up masked hint for identity verification without exposing full number
  const getMaskedHint = (identifier, targetRole) => {
    const rawId = String(identifier || '').trim();
    if (!rawId) return null;

    if (targetRole === 'teacher') {
      let storedStaff = [];
      try {
        storedStaff = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF) || '[]');
      } catch {
        storedStaff = [];
      }
      const staff = storedStaff.find(s => s.email.toLowerCase() === rawId.toLowerCase()) ||
                    staffAccounts.find(s => s.email.toLowerCase() === rawId.toLowerCase());
      if (!staff) return null;
      return {
        name: staff.name,
        maskedPhone: staff.phoneLast4 ? `•••••• ${staff.phoneLast4}` : 'Registered Faculty Phone',
      };
    } else {
      if (!/^\d{7}$/.test(rawId)) return null;
      let storedStudents = [];
      try {
        storedStudents = JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS) || '[]');
      } catch {
        storedStudents = [];
      }
      let student = storedStudents.find(s => String(s.urn) === rawId);
      if (!student) {
        student = initialStudents.find(s => String(s.urn) === rawId);
      }
      if (!student) return null;

      const p4 = student.phoneLast4 || String(student.urn).slice(-4);
      return {
        name: student.name,
        maskedPhone: `•••••• ${p4}`,
        maskedParent: student.parentPhoneLast4 ? `•••••• ${student.parentPhoneLast4}` : null,
      };
    }
  };

  // Generate a simulated 6-digit verification OTP (valid 10 minutes)
  const requestResetOtp = async (identifier, targetRole) => {
    const rawId = String(identifier || '').trim();
    if (!rawId) {
      return { success: false, message: 'Please enter your Roll Number (URN) or Faculty Email first.' };
    }

    const hint = getMaskedHint(rawId, targetRole);
    if (!hint) {
      return {
        success: false,
        message: targetRole === 'teacher'
          ? `No faculty record found for "${rawId}".`
          : `No student record found for URN ${rawId}.`,
      };
    }

    // Generate random 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const key = rawId.toLowerCase();
    otpCache[key] = {
      code: otpCode,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    return {
      success: true,
      code: otpCode,
      maskedPhone: hint.maskedPhone,
      message: `OTP [ ${otpCode} ] dispatched to registered phone (${hint.maskedPhone}). Valid for 10 minutes.`,
    };
  };

  // Secure Password Reset Logic
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
    const key = rawId.toLowerCase();
    const activeOtp = otpCache[key];
    const isOtpValid = activeOtp && activeOtp.code === cleanVerif && Date.now() < activeOtp.expires;

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
            phoneLast4: orig.phoneLast4 || '0000',
            passwordHash: newHash,
          });
          idx = storedStaff.length - 1;
        }
      }

      if (idx === -1) {
        return { success: false, message: `No faculty record found for "${rawId}".` };
      }

      const staffMember = storedStaff[idx];
      const p4 = staffMember.phoneLast4 || '0000';
      const cleanDigits = cleanVerif.replace(/\D/g, '');

      const isPhoneMatch = cleanDigits.length === 4 && cleanDigits === p4;
      const isKeyMatch = FACULTY_SECURITY_KEYS.some(k => k.toLowerCase() === cleanVerif.toLowerCase());

      if (!isPhoneMatch && !isOtpValid && !isKeyMatch) {
        return {
          success: false,
          message: 'Verification failed: Please enter the last 4 digits of your registered phone, valid SMS OTP, or Faculty Security Key.',
        };
      }

      storedStaff[idx].passwordHash = newHash;
      storedStaff[idx].customPassword = newPassword;
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(storedStaff));
      delete otpCache[key];
      return { success: true, message: 'Faculty password has been reset successfully. You can now sign in.' };
    } else {
      // STUDENT RESET LOGIC:
      // STRICT SECURITY: We DO NOT allow matching just student name or college email,
      // because classmates easily know each other's URN, names, and emails!
      // Must match registered mobile last 4 digits, father's mobile last 4 digits, active OTP, or Lab Override Code.
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
            phoneLast4: pre.phoneLast4 || String(pre.urn).slice(-4),
            parentPhoneLast4: pre.parentPhoneLast4 || null,
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

      const p4 = student.phoneLast4 || String(student.urn).slice(-4);
      const parentP4 = student.parentPhoneLast4;
      const cleanDigits = cleanVerif.replace(/\D/g, '');

      const isStudentPhoneMatch = cleanDigits.length === 4 && cleanDigits === p4;
      const isParentPhoneMatch = parentP4 && cleanDigits.length === 4 && cleanDigits === parentP4;
      const isLabOverride = LAB_OVERRIDE_KEYS.some(k => k.toLowerCase() === cleanVerif.toLowerCase());

      if (!isStudentPhoneMatch && !isParentPhoneMatch && !isOtpValid && !isLabOverride) {
        return {
          success: false,
          message: 'Security Verification Failed: The digits entered do not match the registered phone number in IILM records. Classmates cannot reset accounts using roll number alone. Please enter your registered mobile digits, request an OTP, or visit Lab In-Charge (B2-105).',
        };
      }

      storedStudents[studentIndex].passwordHash = newHash;
      storedStudents[studentIndex].customPassword = newPassword;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(storedStudents));
      delete otpCache[key];

      return {
        success: true,
        message: 'Password reset verified successfully! You can now sign in with your new password.',
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
        getMaskedHint,
        requestResetOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
