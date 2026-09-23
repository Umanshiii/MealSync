import { useState, useEffect } from 'react';
import { 
  School, Camera, Hash, MapPin, FileText, LogOut, 
  CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  LayoutDashboard, UserPlus, Key, Activity, Calendar,
  Lock, Send, ArrowLeft, RefreshCw, Sparkles, Check,
  AlertCircle, ArrowRight
} from 'lucide-react';
import api from '../../api/axiosConfig';
import { toast } from 'sonner';
import image from '../../imports/image.png';

const academicHolidays = [
  '2026-01-01', '2026-01-14', '2026-01-26', '2026-02-21', 
  '2026-03-03', '2026-03-20', '2026-04-02', '2026-04-03', 
  '2026-04-05', '2026-04-14', '2026-05-01', '2026-05-27', 
  '2026-07-26', '2026-08-15', '2026-08-25', '2026-09-05', 
  '2026-10-02', '2026-10-11', '2026-10-12', '2026-10-31', 
  '2026-11-08', '2026-12-25'
];

export default function SupervisorDashboard({ onLogout, onOpenBMI, onOpenMonthlyAttendance, onChangePassword }: any) {
  // --- STATE ---
  const [view, setView] = useState<'calendar' | 'attendance'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [students, setStudents] = useState<any[]>([]);
  const [schoolInfo, setSchoolInfo] = useState({ name: '', code: '', location: '' });
  const [mealPhoto, setMealPhoto] = useState<File | null>(null);
  const [markedDates, setMarkedDates] = useState<string[]>(['2026-05-10', '2026-05-12']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nutritionScore, setNutritionScore] = useState<number | null>(null);
  
  // Track dynamic data updates for banner visibility metrics
  const [bmiStats, setBmiStats] = useState({ completed: 1, total: 10 });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    api.get('schools/get_context/')
      .then(res => {
        setSchoolInfo(res.data.school_info);
        setStudents(res.data.students.map((s: any) => ({ ...s, present: true })));
        setBmiStats({ completed: 1, total: res.data.students.length || 10 });
      })
      .catch(() => toast.error("Failed to synchronize active institution context parameters."));
  }, []);

  // --- DYNAMIC REMINDER CONDITION ---
  const pendingBmiCount = bmiStats.total - bmiStats.completed;
  const showBmiReminder = pendingBmiCount > 0;

  const getLocalDateKey = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isFutureDate = (date: Date) => date.getTime() > today.getTime();
  const isMarked = (date: Date) => markedDates.includes(getLocalDateKey(date));
  const isSunday = (date: Date) => date.getDay() === 0;
  const isHoliday = (date: Date) => academicHolidays.includes(getLocalDateKey(date));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setNutritionScore(null);
    setView('attendance');
  };

  const handleDailySubmission = async () => {
    if (!mealPhoto) {
      toast.error("Meal photo evidence is required for automated nutrition scoring.");
      return;
    }

    setIsSubmitting(true);
    const dateKey = getLocalDateKey(selectedDate);

    try {
      const formData = new FormData();
      formData.append('meal_image', mealPhoto);
      formData.append('attendance_data', JSON.stringify(students));
      formData.append('date', dateKey);

      const response = await api.post('meals/verify_and_save/', formData);
      const score = response.data.nutrition_score;
      setNutritionScore(score);

      if (score >= 70) {
        toast.success(`Optimal Verification! Nutrition Score: ${score}%. Data recorded.`);
        setMarkedDates(prev => [...prev, dateKey]);
        
        setTimeout(() => {
          setView('calendar');
          setMealPhoto(null);
          setNutritionScore(null);
        }, 2200);
      } else {
        toast.error(`Deficient Portions: Nutrition Score is ${score}%. Verification rejected.`);
      }
    } catch (error) {
      toast.error("Backend transmission failed. Check API configuration routing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startOffset = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    for (let i = 0; i < startOffset; i++) days.push(<div key={`e-${i}`} className="h-14 w-full" />);
    
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      dateObj.setHours(0, 0, 0, 0);

      const future = isFutureDate(dateObj);
      const sunday = isSunday(dateObj);
      const holiday = isHoliday(dateObj);
      const done = isMarked(dateObj);
      const isSelected = selectedDate.toDateString() === dateObj.toDateString() && view === 'attendance';

      const isLocked = future || sunday || holiday;

      let topLabel = "";
      if (sunday) topLabel = "SUN";
      if (holiday) topLabel = "HOL";

      days.push(
        <button
          key={d}
          type="button"
          disabled={isLocked}
          onClick={() => !isLocked && handleDateClick(dateObj)}
          className={`relative h-14 w-full rounded-2xl font-bold text-xs flex flex-col items-center justify-center border-2 transition-all duration-200
            ${isLocked 
              ? 'bg-[#F4F6F8]/60 border-transparent text-[#BCC4CC] cursor-not-allowed opacity-45 pointer-events-none' 
              : 'bg-white border-transparent text-[#334155] shadow-sm hover:border-[#2C533A]'
            }
            ${isSelected ? 'bg-[#E1EBE5] border-[#2C533A] text-[#2C533A] font-extrabold scale-105' : ''}
            ${done && !isSelected ? 'bg-[#EAF5EE] text-[#138808]' : ''}
          `}
        >
          <span>{d}</span>
          
          {!isLocked && !done && (
            <div className="absolute bottom-2 flex space-x-0.5 items-center">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping absolute" />
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            </div>
          )}
          {done && <div className="absolute bottom-2 w-1.5 h-1.5 bg-[#138808] rounded-full" />}
          
          {topLabel && (
            <span className="absolute top-1 text-[7px] font-extrabold tracking-wider opacity-60 bg-[#334155]/5 px-1 rounded text-[#334155]">
              {topLabel}
            </span>
          )}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col font-sans selection:bg-[#2C533A]/10">
      
      {/* NAVIGATION BAR */}
      <nav className="w-full bg-[#2C533A] text-white px-6 py-4 flex justify-between items-center border-b-4 border-[#FF9933] shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="bg-white/10 p-2 rounded-xl border border-white/10">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold uppercase tracking-wider leading-none">PM-POSHAN Dashboard</h1>
            <p className="text-[8px] font-bold text-white/70 tracking-widest uppercase mt-1">Govt. of India • Midday Meal Portal</p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all">Sign Out</button>
      </nav>

      {/* BODY FRAME WRAPPER */}
      <main className="flex-1 max-w-[1500px] w-full mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* SIDEBAR NAVIGATION CONTROLLER */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl p-5 shadow-sm border border-[#E2E8F0] flex flex-col gap-2">
          <div className="text-[9px] font-black text-[#A0AEC0] uppercase tracking-widest px-4 py-2 border-b border-[#F7FAFC]">Navigation Hub</div>
          <SidebarLink icon={<LayoutDashboard size={16}/>} label="My Dashboard" active={view === 'calendar'} onClick={() => setView('calendar')} />
          <SidebarLink icon={<Activity size={16}/>} label="Monthly BMI Report" onClick={onOpenBMI} />
          <SidebarLink icon={<Calendar size={16}/>} label="Monthly Attendance" onClick={onOpenMonthlyAttendance} />
          <SidebarLink icon={<Key size={16}/>} label="Change Password" onClick={onChangePassword} />
        </aside>

        {/* ACTIVE PORTAL WORKSPACE */}
        <div className="flex-1 w-full space-y-6">
          
          {/* PROFILE METADATA PARAMETERS */}
          <header className="bg-white rounded-3xl p-6 shadow-sm border border-[#E2E8F0] grid grid-cols-1 md:grid-cols-3 gap-6">
            <HeaderMetric label="Institution" value={schoolInfo.name || "N.P.S. CHANDWADI SHIV NAGAR BHOPAL"} icon={<School className="text-[#2C533A]" size={18}/>} />
            <HeaderMetric label="District Context" value={schoolInfo.location || "BHOPAL, MADHYA PRADESH"} icon={<MapPin className="text-[#FF9933]" size={18}/>} />
            <HeaderMetric label="DISE Identifier" value={schoolInfo.code || "197062"} icon={<Hash size={16}/>} />
          </header>

          {/* DYNAMIC SUB-WORKSPACE CONSOLES ROUTING */}
          <div className="w-full">
            {view === 'calendar' ? (
              <div className="grid grid-cols-1 gap-6 animate-in fade-in zoom-in-95 duration-300">
                
                {/* HIGH-FIDELITY BMI REMINDER BANNER (Matches Uploaded Mockup Perfectly) */}
                {showBmiReminder && (
                  <div className="w-full bg-white border-l-[6px] border-[#FF9933] rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm border-y-[#E2E8F0] border-r-[#E2E8F0] border-y border-r relative overflow-hidden">
                    <div className="flex items-center gap-4">
                      {/* Alert Icon Bubble with Soft Background */}
                      <div className="w-10 h-10 rounded-xl bg-[#FFF4E5] flex items-center justify-center text-[#FF9933] flex-shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-extrabold text-[#334155] tracking-tight">Update Deadline Approaching</span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 mt-1">
                          {pendingBmiCount} student(s) pending monthly updates. Complete profiles before the automated month-end lock.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <button 
                        onClick={onOpenBMI}
                        className="bg-[#2C533A] hover:bg-[#1E3B29] text-white font-extrabold text-[10px] tracking-wider uppercase px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm shadow-[#2C533A]/10 active:scale-98 transition-all"
                      >
                        Update BMI Data Now
                        <ArrowRight size={12} />
                      </button>
                      <span className="text-[9px] font-black tracking-wider text-[#FF9933] bg-[#FFF4E5] border border-[#FF9933]/15 px-3 py-1.5 rounded-lg uppercase whitespace-nowrap hidden md:inline-block">
                        Action Required
                      </span>
                    </div>
                  </div>
                )}

                {/* THE ACTIVE WORKING CALENDAR MODULE */}
                <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                  <div className="bg-[#345E43] p-4 px-8 flex justify-between items-center text-white">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"><ChevronLeft size={16}/></button>
                    <h3 className="font-extrabold uppercase text-xs tracking-[0.2em]">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors"><ChevronRight size={16}/></button>
                  </div>
                  <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-7 text-center text-[10px] font-black text-[#A0AEC0] mb-4 uppercase tracking-widest pb-3 border-b border-[#F7FAFC]">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2.5">
                      {renderCalendar()}
                    </div>
                  </div>
                  <div className="p-4 px-8 bg-gray-50 border-t border-[#E2E8F0] flex items-center justify-center">
                    <button onClick={onOpenMonthlyAttendance} className="w-full max-w-xs bg-white border border-[#E2E8F0] text-[#334155] py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                      <FileText size={12} /> Monthly Register Archive
                    </button>
                  </div>
                </div>

                {/* FITNESS PORTAL SHORTCUT FOOTER */}
                <section onClick={onOpenBMI} className="bg-[#244539] rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between shadow-xl cursor-pointer relative overflow-hidden group border-t-8 border-[#FF9933] transition-transform duration-300 hover:scale-[1.005]">
                  <div className="absolute inset-0 opacity-10 pointer-events-none grayscale"><img src="/image_d200a0.png" className="w-full h-full object-cover" alt="" /></div>
                  <div className="relative z-10 text-center md:text-left">
                    <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">BMI Tracker</h3>
                    <p className="text-[#C9D5A8] font-black uppercase text-xs mt-3 tracking-[0.3em]">Access Growth Portal →</p>
                  </div>
                  <div className="relative z-10 mt-6 md:mt-0">
                    <div className="absolute -top-6 -left-10 bg-white text-[#244539] px-4 py-2 rounded-2xl rounded-bl-none font-black text-[10px] uppercase shadow-xl animate-bounce">Am I Fit?</div>
                    <div className="w-32 h-32 rounded-full border-[6px] border-[#FF9933] overflow-hidden bg-white shadow-xl group-hover:scale-105 transition-transform duration-700">
                      <img src={image} alt="BMI Visual" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </section>

              </div>
            ) : (
              
              /* DATA ENTRY PANEL VIEWPORT */
              <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-300">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('calendar')} className="bg-white border border-[#E2E8F0] text-[#334155] p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm"><ArrowLeft size={16}/></button>
                    <div>
                      <h2 className="text-lg font-extrabold text-[#334155] uppercase tracking-tight">Registry Logging Profile</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{selectedDate.toLocaleDateString('default', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  {isMarked(selectedDate) && <span className="text-[9px] font-black tracking-widest text-[#138808] bg-[#EAF5EE] border border-[#138808]/10 px-3 py-1.5 rounded-full uppercase">✓ Verification Finalized</span>}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  <div className="xl:col-span-8 bg-white rounded-3xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                    <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
                      <span className="text-[10px] font-extrabold text-[#334155] uppercase tracking-wider">{isMarked(selectedDate) ? '🔒 Archival Record Log (Sealed)' : '📝 Active Session Row'}</span>
                      {!isMarked(selectedDate) && <button className="text-[9px] font-bold uppercase bg-white border border-[#E2E8F0] hover:border-[#2C533A] text-[#334155] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"><UserPlus size={12}/> Add Student</button>}
                    </div>
                    
                    <div className="grid grid-cols-12 bg-[#F8FAFC] px-6 py-2.5 text-[9px] font-bold text-[#A0AEC0] uppercase tracking-widest border-b border-[#E2E8F0]">
                      <div className="col-span-6">Student Information</div>
                      <div className="col-span-3 text-center">Present</div>
                      <div className="col-span-3 text-center">Absent</div>
                    </div>

                    <div className="divide-y divide-[#F1F5F9] max-h-[460px] overflow-y-auto px-2 custom-scrollbar">
                      {students.map(s => (
                        <div key={s.id} className="grid grid-cols-12 items-center px-4 py-3.5">
                          <div className="col-span-6 pr-4">
                            <p className="font-bold text-[#334155] text-sm leading-tight">{s.student_name}</p>
                            <p className="text-[9px] font-mono font-bold text-gray-300 mt-0.5 tracking-wider uppercase">{s.student_id}</p>
                          </div>
                          <div className="col-span-3 flex justify-center">
                            <button disabled={isMarked(selectedDate)} onClick={() => setStudents(prev => prev.map(st => st.id === s.id ? { ...st, present: true } : st))} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${s.present ? 'bg-[#138808] border-[#138808] text-white shadow-sm' : 'bg-white border-gray-100 text-gray-200 hover:border-gray-300'}`}><CheckCircle2 size={16}/></button>
                          </div>
                          <div className="col-span-3 flex justify-center">
                            <button disabled={isMarked(selectedDate)} onClick={() => setStudents(prev => prev.map(st => st.id === s.id ? { ...st, present: false } : st))} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${!s.present ? 'bg-red-500 border-red-500 text-white shadow-sm' : 'bg-white border-gray-100 text-gray-200 hover:border-gray-300'}`}><XCircle size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="xl:col-span-4 flex flex-col gap-6 w-full">
                    <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-[#E2E8F0] hover:border-[#2C533A] flex flex-col items-center justify-center text-center shadow-sm group">
                      <input type="file" id="meal" className="hidden" accept="image/*" onChange={(e) => setMealPhoto(e.target.files?.[0] || null)} disabled={isMarked(selectedDate)} />
                      <label htmlFor="meal" className={isMarked(selectedDate) ? 'cursor-not-allowed' : 'cursor-pointer w-full'}>
                        <div className={`p-4 rounded-xl mb-3 mx-auto w-12 h-12 flex items-center justify-center transition-all duration-200 shadow-sm border ${mealPhoto ? 'bg-[#138808] border-[#138808] text-white' : 'bg-gray-50 border-[#E2E8F0] text-gray-400 group-hover:scale-105'}`}>{mealPhoto && nutritionScore && nutritionScore >= 70 ? <Check size={18} /> : <Camera size={18}/>}</div>
                        <span className="text-[10px] font-bold uppercase text-[#334155] tracking-wider block">{mealPhoto ? 'Evidence Attached ✓' : 'Upload Meal Photo'}</span>
                        {mealPhoto && <p className="text-[8px] font-mono text-gray-400 mt-1 max-w-[160px] truncate mx-auto bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{mealPhoto.name}</p>}
                      </label>
                    </div>

                    {nutritionScore !== null && (
                      <div className={`p-5 rounded-3xl border text-center animate-in fade-in zoom-in-95 duration-200 ${nutritionScore >= 70 ? 'bg-[#EAF5EE] border-[#138808]/10 text-[#138808]' : 'bg-red-50 border-red-100 text-red-600'}`}>
                        <div className="flex items-center justify-center gap-1.5 mb-1 text-[9px] font-black uppercase tracking-wider opacity-85"><Sparkles size={12} /> Live Score Assessment</div>
                        <p className="text-4xl font-black tracking-tight">{nutritionScore}%</p>
                        <p className="text-[8px] font-bold mt-1 opacity-80 uppercase leading-none">{nutritionScore >= 70 ? 'Optimal Parameters Approved' : 'Quality Validation Threshold Missed'}</p>
                      </div>
                    )}
                    
                    {!isMarked(selectedDate) ? (
                      <button onClick={handleDailySubmission} disabled={isSubmitting || !mealPhoto} className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 ${isSubmitting || !mealPhoto ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' : 'bg-[#2C533A] text-white hover:bg-[#1E3B29]'}`}>{isSubmitting ? <><RefreshCw className="animate-spin" size={12} /> Processing Metrics...</> : <><Send size={12} /> Sync Daily Report</>}</button>
                    ) : (
                      <div className="bg-[#E2E8F0]/40 border border-[#E2E8F0] text-[#718096] rounded-2xl p-4 text-center text-[10px] font-black uppercase tracking-widest shadow-inner">🔒 Sheet Locked Archive</div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #DDE2E8; border-radius: 10px; }
      `}</style>
    </div>
  );
}

// --- CONTROLLERS ---
function SidebarLink({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs transition-all text-left relative group ${active ? 'bg-[#E1EBE5] text-[#2C533A]' : 'text-gray-500 hover:bg-gray-50'}`}>
      {active && <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#2C533A] rounded-r" />}
      <span className="transition-transform group-hover:scale-105 duration-200">{icon}</span>
      <span className="tracking-wide">{label}</span>
    </button>
  );
}

function HeaderMetric({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="bg-gray-50 border border-[#E2E8F0] p-2.5 rounded-xl text-gray-400">{icon}</div>
      <div className="truncate">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-extrabold text-[#334155] tracking-tight uppercase truncate">{value}</p>
      </div>
    </div>
  );
}