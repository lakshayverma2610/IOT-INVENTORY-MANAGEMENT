import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cpu,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { isValidURN } from '../utils/security';

const COURSES = [
  'B.Tech CSE',
  'B.Tech ECE',
  'B.Tech IT',
  'B.Tech Robotics & AI',
  'B.Tech Mechanical',
  'BCA / MCA',
  'M.Tech IoT & Embedded',
];

export default function Login() {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [isActivating, setIsActivating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Sign In States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Student Activation States
  const [activationForm, setActivationForm] = useState({
    urn: '',
    name: '',
    phone: '',
    course: 'B.Tech CSE',
    semester: 1,
    section: 'A',
    password: '',
    confirmPassword: '',
  });

  // Password Reset States
  const [resetForm, setResetForm] = useState({
    identifier: '',
    verification: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Dynamic Identity Hint from University Database
  const [detectedHint, setDetectedHint] = useState(null);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, activateStudent, resetPassword, getMaskedHint } = useAuth();
  const navigate = useNavigate();

  // Smart input change handler (auto-switches role if email is typed)
  const handleIdentifierChange = (val) => {
    setIdentifier(val);
    setError('');
    if (val.includes('@') && role !== 'teacher') {
      setRole('teacher');
    }
  };

  // Check identity hint when user types their URN or email in reset form
  useEffect(() => {
    if (!isResetting) {
      setDetectedHint(null);
      return;
    }

    const rawId = (resetForm.identifier || '').trim();
    if (role === 'student' && /^\d{7}$/.test(rawId)) {
      const hint = getMaskedHint(rawId, 'student');
      setDetectedHint(hint);
    } else if (role === 'teacher' && rawId.includes('@')) {
      const hint = getMaskedHint(rawId, 'teacher');
      setDetectedHint(hint);
    } else {
      setDetectedHint(null);
    }
  }, [resetForm.identifier, role, isResetting]);

  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const id = (resetForm.identifier || '').trim();
    const verif = (resetForm.verification || '').trim();
    const newPass = (resetForm.newPassword || '').trim();
    const confirmPass = (resetForm.confirmPassword || '').trim();

    if (!id) {
      setError(role === 'teacher' ? 'Please enter your faculty email.' : 'Please enter your 7-digit URN.');
      return;
    }
    if (!verif) {
      setError(
        role === 'teacher'
          ? 'Please enter the last 4 digits of your registered phone or Faculty Security Key.'
          : 'Please enter the last 4 digits of your registered mobile number (or father’s mobile on record).'
      );
      return;
    }
    if (!newPass || newPass.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({
        identifier: id,
        verification: verif,
        newPassword: newPass,
        role,
      });
      setLoading(false);
      if (res.success) {
        setSuccessMsg(res.message || 'Password reset successfully! You can now sign in.');
        setIsResetting(false);
        setPassword('');
        setIdentifier(id);
        setResetForm({ identifier: '', verification: '', newPassword: '', confirmPassword: '' });
        setDetectedHint(null);
      } else {
        setError(res.message);
      }
    } catch {
      setLoading(false);
      setError('Failed to reset password. Please check your verification digits.');
    }
  };

  const handleSignIn = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedId = String(identifier || '').trim();
    const trimmedPass = String(password || '').trim();

    if (!trimmedId) {
      setError(role === 'teacher' ? 'Please enter your faculty email (e.g. puja.acharya@iilm.edu).' : 'Please enter your 7-digit URN (e.g. 2581008).');
      return;
    }
    if (!trimmedPass) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(trimmedId, trimmedPass, role);
      setLoading(false);

      if (result.success) {
        navigate(role === 'teacher' ? '/teacher' : '/student');
      } else {
        if (result.notActivated) {
          setError(result.message);
          setIsActivating(true);
          setActivationForm(prev => ({ ...prev, urn: trimmedId }));
        } else {
          setError(result.message || 'Invalid credentials. Please verify your inputs.');
        }
      }
    } catch {
      setLoading(false);
      setError('Authentication failed. Please verify your inputs.');
    }
  };

  const handleActivation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanURN = String(activationForm.urn || '').trim();
    if (!isValidURN(cleanURN)) {
      setError('URN must be exactly 7 digits (e.g. 2581008).');
      return;
    }
    if (!activationForm.name || activationForm.name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!activationForm.password || activationForm.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (activationForm.password !== activationForm.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const result = await activateStudent(activationForm);
      setLoading(false);
      if (result.success) {
        navigate('/student');
      } else {
        setError(result.message);
      }
    } catch {
      setLoading(false);
      setError('Failed to activate account. Please check your inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Lab Branding Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl shadow-xl shadow-blue-500/20 mb-3"
            style={{ animation: 'float 3.5s ease-in-out infinite' }}
          >
            <Cpu className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">IoT & Robotics Foundation Lab</h1>
          <p className="text-slate-400 text-xs mt-1">Room No. B2-105 · IILM University</p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Role Navigation */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setRole('student');
                setIsActivating(false);
                setIsResetting(false);
                setError('');
                setDetectedHint(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'student'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('teacher');
                setIsActivating(false);
                setIsResetting(false);
                setError('');
                setDetectedHint(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'teacher'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Faculty & In-Charge
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: STUDENT ACTIVATION FORM */}
          {role === 'student' && isActivating ? (
            <form onSubmit={handleActivation} className="space-y-4">
              <div className="border-b border-slate-800 pb-3 mb-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  First-Time Student Activation
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Register your 7-digit URN and configure your lab credentials.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  7-Digit University Registration Number (URN)
                </label>
                <input
                  type="text"
                  maxLength={7}
                  value={activationForm.urn}
                  onChange={e => setActivationForm({ ...activationForm, urn: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 2581008"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Student Name</label>
                <input
                  type="text"
                  value={activationForm.name}
                  onChange={e => setActivationForm({ ...activationForm, name: e.target.value })}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Registered Mobile Number <span className="text-slate-500 text-[10px]">(For secure identity recovery)</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={activationForm.phone || ''}
                  onChange={e => setActivationForm({ ...activationForm, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="10-digit phone number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course</label>
                  <select
                    value={activationForm.course}
                    onChange={e => setActivationForm({ ...activationForm, course: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
                  <select
                    value={activationForm.semester}
                    onChange={e => setActivationForm({ ...activationForm, semester: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={activationForm.section}
                    onChange={e => setActivationForm({ ...activationForm, section: e.target.value.toUpperCase() })}
                    placeholder="A"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Create Password</label>
                  <input
                    type="password"
                    value={activationForm.password}
                    onChange={e => setActivationForm({ ...activationForm, password: e.target.value })}
                    placeholder="Min 4 characters"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={activationForm.confirmPassword}
                    onChange={e => setActivationForm({ ...activationForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsActivating(false);
                    setError('');
                  }}
                  className="flex-1 py-2.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-colors font-medium order-2 sm:order-1 cursor-pointer"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 order-1 sm:order-2 cursor-pointer"
                >
                  {loading ? 'Activating...' : 'Activate & Enter Portal'}
                </button>
              </div>
            </form>
          ) : isResetting ? (
            /* VIEW 3: ZERO-COST REGISTERED CONTACT DATABASE VERIFICATION */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="border-b border-slate-800 pb-3 mb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    Reset {role === 'teacher' ? 'Faculty' : 'Student'} Password
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    Database Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {role === 'teacher'
                    ? 'Verify using your institutional email and registered phone digits or Faculty Key.'
                    : 'Classmates cannot reset your credentials using roll number alone. Verification requires your registered mobile digits.'}
                </p>
              </div>

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {role === 'teacher' ? 'Institutional Faculty Email' : '7-Digit URN (Roll Number)'}
                </label>
                <input
                  type="text"
                  value={resetForm.identifier}
                  onChange={e => setResetForm({ ...resetForm, identifier: e.target.value })}
                  placeholder={role === 'teacher' ? 'e.g. puja.acharya@iilm.edu' : 'e.g. 2481006 or 2581008'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />

                {/* Live Verified Identity Badge */}
                {detectedHint && (
                  <div className="mt-2 p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        Record: <strong className="text-white">{detectedHint.name}</strong>
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[10px] bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
                      Phone on file: {detectedHint.maskedPhone}
                    </span>
                  </div>
                )}
              </div>

              {/* Verification Digits Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {role === 'teacher'
                    ? 'Faculty Phone Last 4 Digits or Security Key'
                    : 'Last 4 Digits of Registered Mobile (or Father’s Mobile)'}
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={resetForm.verification}
                  onChange={e => setResetForm({ ...resetForm, verification: e.target.value })}
                  placeholder={
                    role === 'teacher'
                      ? 'e.g. 0126 or Faculty Key'
                      : 'Enter last 4 digits (e.g. 6408) or Lab Override Code'
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  {role === 'teacher'
                    ? 'Enter the last 4 digits of your phone registered with IILM or the Lab Department Key.'
                    : 'Confidential verification: Matches the mobile number submitted during university admission. (Roll number/email alone is insufficient).'}
                </p>
              </div>

              {/* New Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={resetForm.newPassword}
                    onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })}
                    placeholder="Min 4 characters"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={resetForm.confirmPassword}
                    onChange={e => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetting(false);
                    setError('');
                    setDetectedHint(null);
                  }}
                  className="flex-1 py-2.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-colors font-medium order-2 sm:order-1 cursor-pointer"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 order-1 sm:order-2 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {loading ? 'Verifying...' : 'Verify & Reset Password'}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW 2: STANDARD SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {role === 'student' ? 'University Registration Number (URN)' : 'Institutional Email Address'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => handleIdentifierChange(e.target.value)}
                  placeholder={role === 'student' ? 'Enter 7-digit URN (e.g. 2581008)' : 'puja.acharya@iilm.edu'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(true);
                      setIsActivating(false);
                      setError('');
                      setSuccessMsg('');
                      setDetectedHint(null);
                      setResetForm({
                        identifier: identifier,
                        verification: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                  >
                    Forgot / Reset Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all duration-150 shadow-lg shadow-blue-500/25 disabled:opacity-50 text-sm mt-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    Sign In to {role === 'student' ? 'Student Portal' : 'Faculty Dashboard'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Student Activation Link */}
              {role === 'student' && (
                <div className="pt-3 text-center border-t border-slate-800/80">
                  <p className="text-xs text-slate-400">
                    First time accessing the IoT Lab?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setIsActivating(true);
                        setError('');
                        setActivationForm(prev => ({ ...prev, urn: identifier }));
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold hover:underline cursor-pointer"
                    >
                      Activate Student Account
                    </button>
                  </p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center mt-5 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
          <span>IILM University IoT & Robotics Lab · Room B2-105</span>
        </div>
      </div>
    </div>
  );
}
