import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Eye, EyeOff, GraduationCap, ShieldCheck, ArrowRight, UserCheck, KeyRound, Info } from 'lucide-react';
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

  // Sign In States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Student Activation States
  const [activationForm, setActivationForm] = useState({
    urn: '',
    name: '',
    course: 'B.Tech CSE',
    semester: 5,
    section: 'A',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, activateStudent } = useAuth();
  const navigate = useNavigate();

  // Smart input change handler (auto-switches role if email is typed)
  const handleIdentifierChange = (val) => {
    setIdentifier(val);
    setError('');
    if (val.includes('@') && role !== 'teacher') {
      setRole('teacher');
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
        navigate(trimmedId.includes('@') || role === 'teacher' ? '/teacher' : '/student');
      } else {
        setError(result.message);
        if (result.notActivated) {
          setActivationForm(prev => ({ ...prev, urn: trimmedId }));
        }
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred during authentication. Please try again.');
    }
  };

  const handleActivation = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedURN = String(activationForm.urn || '').trim();
    if (!isValidURN(trimmedURN)) {
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
    } catch (err) {
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
                setError('');
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
                setError('');
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
            <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-400 text-xs">
              {successMsg}
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
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
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

                {/* Helpful Credential Note */}
                <div className="mt-2 text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    {role === 'teacher' ? (
                      <span>
                        Default passwords: <span className="text-blue-300 font-mono font-medium">Puja@IILM2025</span> (or Vardaan@IILM2025 / Ramesh@IILM2025)
                      </span>
                    ) : (
                      <span>
                        Default password: <span className="text-blue-300 font-mono font-medium">Student@2581</span> or your 7-digit URN
                      </span>
                    )}
                  </div>
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
