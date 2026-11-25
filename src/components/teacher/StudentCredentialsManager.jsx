import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initialStudents } from '../../data/mockData';
import {
  ShieldCheck,
  Search,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Lock,
  Copy,
  AlertCircle,
  Building2,
  UserCheck,
} from 'lucide-react';

export default function StudentCredentialsManager() {
  const { generateStudentPasscode, adminResetStudentPassword } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');

  const [activePasscodes, setActivePasscodes] = useState({});
  const [copiedUrn, setCopiedUrn] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter 624 university students
  const filteredStudents = useMemo(() => {
    let list = initialStudents;
    if (selectedBatch !== 'ALL') {
      list = list.filter(s => s.batch === selectedBatch);
    }
    if (selectedSection !== 'ALL') {
      list = list.filter(s => (s.section || '').toUpperCase() === selectedSection);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        s =>
          String(s.urn).includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchTerm, selectedSection, selectedBatch]);

  // Handle generating a 6-digit one-time passcode for a student
  const handleGeneratePasscode = (urn, name) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = generateStudentPasscode(urn);
    if (res.success) {
      setActivePasscodes(prev => ({
        ...prev,
        [urn]: {
          passcode: res.passcode,
          expiresAt: res.expiresAt,
          name,
        },
      }));
      setStatusMsg(`Issued One-Time Passcode [ ${res.passcode} ] for ${name} (URN: ${urn}). Valid for 30 minutes.`);
    } else {
      setErrorMsg(res.message);
    }
  };

  // Handle 1-click default password reset
  const handleResetToDefault = async (urn, name) => {
    setStatusMsg('');
    setErrorMsg('');
    const res = await adminResetStudentPassword(urn, 'Student@2581');
    if (res.success) {
      setStatusMsg(`Password for ${name} (URN: ${urn}) successfully reset to "Student@2581".`);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleCopy = (urn, text) => {
    navigator.clipboard.writeText(text);
    setCopiedUrn(urn);
    setTimeout(() => setCopiedUrn(null), 2000);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Student Credential & Security Authorization</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              In accordance with university IoT lab custody guidelines, student password resets are authorized by the Lab In-Charge (Room B2-105) to prevent unauthorized hardware inventory tampering.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Room B2-105
            </span>
            <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              Prof. Puja Acharya
            </span>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Master Lab Override Keys Reference Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
          Lab In-Charge Master Passcodes (Room B2-105)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px]">Universal Lab Master Key</span>
              <span className="font-mono font-semibold text-slate-800">IOT-LAB-SECURE</span>
            </div>
            <button
              onClick={() => handleCopy('master-1', 'IOT-LAB-SECURE')}
              className="text-slate-400 hover:text-blue-600 p-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px]">Room B2-105 Security Key</span>
              <span className="font-mono font-semibold text-slate-800">PUJA@B2105</span>
            </div>
            <button
              onClick={() => handleCopy('master-2', 'PUJA@B2105')}
              className="text-slate-400 hover:text-blue-600 p-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[10px]">Academic Term Override Key</span>
              <span className="font-mono font-semibold text-slate-800">IILM@LAB2024</span>
            </div>
            <button
              onClick={() => handleCopy('master-3', 'IILM@LAB2024')}
              className="text-slate-400 hover:text-blue-600 p-1"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by 7-digit URN, student name, or institutional email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedBatch}
              onChange={e => setSelectedBatch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Batches (624 Students)</option>
              <option value="2024-28">Batch 2024–28 (Sem 3)</option>
              <option value="2025-29">Batch 2025–29 (Sem 1)</option>
            </select>

            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Sections</option>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">URN</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Course & Batch</th>
                <th className="py-3 px-4">Active Passcode</th>
                <th className="py-3 px-4 text-right">Faculty Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.slice(0, 50).map(s => {
                const active = activePasscodes[s.urn];
                return (
                  <tr key={s.urn} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {s.urn}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {s.batch} · Sec {s.section}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {active ? (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <span className="font-mono font-bold text-emerald-700 text-xs">{active.passcode}</span>
                          <button
                            onClick={() => handleCopy(s.urn, active.passcode)}
                            className="text-emerald-600 hover:text-emerald-800 ml-1"
                            title="Copy code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedUrn === s.urn && (
                            <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">None active</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleGeneratePasscode(s.urn, s.name)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <KeyRound className="w-3 h-3" />
                          Issue Passcode
                        </button>
                        <button
                          onClick={() => handleResetToDefault(s.urn, s.name)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Reset to Default
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length > 50 && (
          <p className="text-[11px] text-slate-400 text-center pt-2">
            Showing top 50 of {filteredStudents.length} matching students. Use search bar to locate specific URNs.
          </p>
        )}
      </div>
    </div>
  );
}
