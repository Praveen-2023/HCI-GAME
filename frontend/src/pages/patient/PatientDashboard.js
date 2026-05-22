import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  Bell,
  Calendar,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  User,
  Edit3,
  Search,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  HelpCircle,
  LifeBuoy,
  ShieldCheck,
  Activity,
  Plus,
  Shield,
  Clock,
  Play,
  TrendingUp,
  Target,
  Award,
  Sun,
  Moon,
  Download,
  Music,
  ThumbsUp,
  PenTool,
  Hand,
  Circle,
  Info,
  Star
} from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { gameService } from "../../services/gameService";
import { userService } from "../../services/userService";
import { reminderService } from "../../services/reminderService";
import ChatPage from "../common/ChatPage";
import PatientAppointments from "./PatientAppointments";
import BoardDrawingTrajectoryReplay from "../game/BoardDrawingTrajectoryReplay";
import DrawingPerformancePanel from "../../components/dashboard/DrawingPerformancePanel";

export default function PatientDashboard({ userId }) {
  const { user, logout, isDarkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  // New state to manage the active section (for switching main content)
  const [activeSection, setActiveSection] = useState("Dashboard");

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Reminders and logic
  const [reminders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getUserFullDetails(userId);
        if (data.success) setUserData(data.user);
        else console.error("Failed to load user info");
      } catch {
        console.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await gameService.getBasicStats();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setUserData((prev) => ({
      ...prev,
      doctor: [doctor],
    }));
    setIsDoctorModalOpen(false);
  };

  // Function to change the active section
  const changeSection = (section) => {
    setActiveSection(section);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-black text-gray-100" : "bg-[#F4F7FE] text-gray-800"}`}
    >
      {/* Sidebar - fixed, collapsible */}
      <aside
        className={`fixed top-0 left-0 h-screen transition-all duration-300 z-30 flex flex-col justify-between overflow-hidden shadow-lg border-r
        ${isCollapsed ? "w-20" : "w-64"} 
        bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800`}
      >
        <div className="p-0 flex flex-col h-full uppercase">
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-4 flex items-center justify-center border-b border-gray-200 dark:border-gray-800"
          >
            {isCollapsed ? (
              <ChevronRight
                size={18}
                className="text-gray-600 dark:text-gray-400 cursor-pointer"
              />
            ) : (
              <ChevronLeft
                size={18}
                className="text-gray-600 dark:text-gray-400 cursor-pointer"
              />
            )}
          </button>

          {/* Logo */}
          <div className={`p-6 flex items-center space-x-2 transition-opacity`}>
            <div className="bg-[#2B91D4] h-8 w-8 rounded-lg shadow-sm"></div>
            {!isCollapsed && (
              <span className="text-xl font-bold dark:text-white capitalize">
                Young Tempo
              </span>
            )}
          </div>

          {/* Profile */}

          {!isCollapsed && (
            <div
              className={`px-6 pt-6 pb-2 flex items-center space-x-3 transition-all ${isCollapsed ? "space-x-0 justify-center" : ""}`}
            >
              <img
                src="https://via.placeholder.com/40"
                alt="Profile"
                className="w-10 h-10 bg-black rounded-full flex-shrink-0"
              />
              <div>
                <h1 className="text-lg font-semibold text-[#2B91D4]">
                  {userData?.name || "Your Name"}
                </h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="mt-4 flex-1 overflow-y-auto px-2">
            <SidebarItem
              icon={<Home size={18} />}
              label="Dashboard"
              active={activeSection === "Dashboard"}
              onClick={() => changeSection("Dashboard")}
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<Calendar size={18} />}
              label="Appointment"
              active={activeSection === "Appointment"}
              onClick={() => changeSection("Appointment")}
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<FileText size={18} />}
              label="Record"
              active={activeSection === "Record"}
              onClick={() => changeSection("Record")}
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<MessageSquare size={18} />}
              label="Chat"
              active={activeSection === "Chat"}
              onClick={() => changeSection("Chat")}
              collapsed={isCollapsed}
            />
            <SidebarItem
              icon={<ClipboardList size={18} />}
              label="Calendar"
              active={activeSection === "Calendar"}
              onClick={() => changeSection("Calendar")}
              collapsed={isCollapsed}
            />
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t dark:border-gray-800 py-4 pt-5 space-y-2 px-2">
          <SidebarItem
            icon={<LifeBuoy size={18} />}
            label="Help Center"
            active={activeSection === "Help Center"}
            onClick={() => changeSection("Help Center")}
            collapsed={isCollapsed}
          />
          <SidebarItem
            icon={<Settings size={18} />}
            label="Settings"
            active={activeSection === "Settings"}
            onClick={() => changeSection("Settings")}
            collapsed={isCollapsed}
          />
        </div>
      </aside>

      {/* Main content - scrollable, offset by sidebar */}
      <div
        className={`h-screen ${activeSection === "Chat" ? "overflow-hidden" : "overflow-y-auto"} px-10 flex-1 transition-all duration-300 fade-in
        ${isCollapsed ? "ml-20" : "ml-64"} 
        bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100`}
      >
        {activeSection !== "Chat" && (
          <TopBar
            activeSection={activeSection}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            handleLogout={handleLogout}
          />
        )}
        <main
          className={`flex-1 ${activeSection === "Chat" ? "flex flex-col justify-center" : ""}`}
        >
          {activeSection === "Dashboard" && (
            <DashboardContent
              userData={userData}
              user={user}
              stats={stats}
              setIsDoctorModalOpen={setIsDoctorModalOpen}
              navigate={navigate}
              userId={userId}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
          )}
          {activeSection === "Appointment" && (
            <PatientAppointments isDarkMode={isDarkMode} />
          )}
          {activeSection === "Record" && (
            <RecordContent isDarkMode={isDarkMode} />
          )}
          {activeSection === "Chat" && <ChatPage isDarkMode={isDarkMode} />}
          {activeSection === "Calendar" && (
            <CalendarContent
              isDarkMode={isDarkMode}
              reminders={reminders}
              userData={userData}
            />
          )}
          {activeSection === "Settings" && (
            <SettingsContent
              userData={userData}
              navigate={navigate}
              isDarkMode={isDarkMode}
            />
          )}
          {activeSection === "Help Center" && (
            <HelpCenterContent
              handleLogout={handleLogout}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

      {/* Doctor Selection Modal */}
      {isDoctorModalOpen && (
        <DoctorModal
          doctors={userData?.doctor || []}
          onClose={() => setIsDoctorModalOpen(false)}
          onSelect={handleDoctorSelect}
        />
      )}
    </div>
  );
}

/* Components */

// Helper to calculate consecutive days streak
const calculateStreak = (dailyData, referenceDate) => {
  const toDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  let streak = 0;
  let currentDate = new Date(referenceDate);
  currentDate.setHours(0, 0, 0, 0);

  const todayStr = toDateStr(currentDate);
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  const hasActivityToday = dailyData[todayStr] && dailyData[todayStr].total > 0;
  const hasActivityYesterday =
    dailyData[yesterdayStr] && dailyData[yesterdayStr].total > 0;

  if (!hasActivityToday && !hasActivityYesterday) return 0;

  // Start checking from today if played, else start from yesterday
  let checkDate = new Date(hasActivityToday ? currentDate : yesterday);

  while (true) {
    const dStr = toDateStr(checkDate);
    if (dailyData[dStr] && dailyData[dStr].total > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

// Updated SidebarItem to use the new design system classes
// Updated SidebarItem for dark mode
const SidebarItem = ({ icon, label, active, onClick, collapsed }) => (
  <div
    className={`nav-item ${active ? "nav-item-active" : "nav-item-inactive"} ${collapsed ? "justify-center mx-0 px-0" : ""}`}
    onClick={onClick}
  >
    <span
      className={`${active ? "text-white" : "text-gray-500 dark:text-gray-400"} flex-shrink-0 transition-colors`}
    >
      {icon}
    </span>
    {!collapsed && (
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    )}
  </div>
);

// Dark Mode Toggle Component
const DarkModeToggle = ({ isDarkMode, setIsDarkMode, collapsed }) => (
  <div
    className={`nav-item nav-item-inactive ${collapsed ? "justify-center mx-0 px-0" : ""}`}
    onClick={() => setIsDarkMode(!isDarkMode)}
  >
    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 transition-colors">
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </span>
    {!collapsed && (
      <span className="text-sm font-medium whitespace-nowrap">
        {isDarkMode ? "Light Mode" : "Dark Mode"}
      </span>
    )}
  </div>
);

const CoordinateVisualizer = ({ coordinates }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const [isLooping, setIsLooping] = React.useState(false);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    setCurrentIdx(0);
    setIsPlaying(false);
  }, [coordinates]);

  React.useEffect(() => {
    if (isPlaying) {
      const intervalTime = Math.max(10, Math.min(200, 150 / playbackSpeed));
      timerRef.current = setInterval(() => {
        setCurrentIdx((prev) => {
          if (prev >= coordinates.length - 1) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              return prev;
            }
          }
          return prev + 1;
        });
      }, intervalTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, coordinates, playbackSpeed, isLooping]);

  // Filter out any malformed entries that are missing x or y fields
  const validCoords = Array.isArray(coordinates)
    ? coordinates.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number')
    : [];

  if (validCoords.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-100 dark:border-slate-700 text-center mt-6 shadow-sm">
        <div className="mb-3 text-5xl text-slate-300 dark:text-slate-600 flex justify-center"><Activity size={48} /></div>
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1 text-lg">No Movement Data Yet</p>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          Hand trajectory is recorded automatically during gameplay. Play a session to see your movement path, velocity profile, and tremor analysis here.
        </p>
        <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-1">
          <Info size={14} /> Coordinates are sampled every second during active sessions
        </p>
      </div>
    );
  }

  // Clamp currentIdx to valid range after filtering
  const safeIdx = Math.min(currentIdx, validCoords.length - 1);
  const currentPoint = validCoords[safeIdx] || validCoords[0];

  // Calculate clinical metrics
  let totalDistance = 0;
  let maxSpeed = 0;
  let jitterSum = 0;
  const speeds = [];

  for (let i = 1; i < validCoords.length; i++) {
    const p1 = validCoords[i - 1];
    const p2 = validCoords[i];
    const d = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    totalDistance += d;

    // dt is ~150ms if timestamps are missing
    const dt = p2.timestamp !== undefined && p1.timestamp !== undefined 
      ? (p2.timestamp - p1.timestamp) 
      : 0.15;
    const speed = d / (dt || 0.15);
    speeds.push(speed);
    if (speed > maxSpeed) maxSpeed = speed;

    if (i > 1) {
      const prevSpeed = speeds[i - 2];
      jitterSum += Math.abs(speed - prevSpeed);
    }
  }

  const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
  const jitterScore = speeds.length > 1 ? (jitterSum / (speeds.length - 1)) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-150 dark:border-gray-700 mt-6 shadow-md transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b dark:border-gray-700 pb-4">
        <div>
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400">
            Movement Path Trajectory & Replay
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
            Visualize relative hand displacement, velocity profiles, and clinical tremor patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">
            {coordinates.length} positions
          </span>
          <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full">
            1s Sample Rate
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playback Canvas Area */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-inner group">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:5%_5%] opacity-20"></div>
            
            {/* SVG Trajectory */}
            <svg viewBox="0 0 100 100" className="w-full h-full p-4" preserveAspectRatio="none">
              {/* Full trace path (faint background) */}
              <polyline
                points={validCoords.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
                fill="none"
                stroke="#4b5563"
                strokeWidth="0.75"
                strokeDasharray="2,2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Played path */}
              <polyline
                points={validCoords.slice(0, safeIdx + 1).map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-75"
              />

              {/* Start & End Points */}
              <circle cx={validCoords[0].x * 100} cy={validCoords[0].y * 100} r="1.5" fill="#3B82F6" stroke="#fff" strokeWidth="0.5" />
              <circle cx={validCoords[validCoords.length-1].x * 100} cy={validCoords[validCoords.length-1].y * 100} r="1.5" fill="#EF4444" stroke="#fff" strokeWidth="0.5" />

              {/* Current Position pointer */}
              <circle
                cx={currentPoint.x * 100}
                cy={currentPoint.y * 100}
                r="3.5"
                fill="#3B82F6"
                fillOpacity="0.4"
                className="animate-pulse"
              />
              <circle
                cx={currentPoint.x * 100}
                cy={currentPoint.y * 100}
                r="1.8"
                fill="#3B82F6"
                stroke="#fff"
                strokeWidth="0.5"
              />
            </svg>

            {/* Labels overlay */}
            <div className="absolute top-3 left-3 flex gap-2 text-[10px] bg-black/75 px-2.5 py-1 rounded-lg border border-gray-800 text-gray-300 font-bold backdrop-blur-sm shadow-md">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Start</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Path</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> End</span>
            </div>
            
            <div className="absolute bottom-3 right-3 text-[10px] bg-black/75 px-2 py-1 rounded-lg border border-gray-800 text-gray-400 font-mono">
              Point {safeIdx + 1}/{validCoords.length}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2.5 rounded-xl flex items-center justify-center text-white transition-all transform active:scale-95 ${
                  isPlaying 
                    ? "bg-amber-500 hover:bg-amber-600" 
                    : "bg-primary-500 hover:bg-primary-600"
                }`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              
              <button
                onClick={() => { setIsPlaying(false); setCurrentIdx(0); }}
                className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-xl transition-all active:scale-95 border dark:border-gray-600"
                title="Reset"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
                </svg>
              </button>

              {/* Scrubber slider */}
              <div className="flex-1 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={validCoords.length - 1}
                  value={safeIdx}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setCurrentIdx(parseInt(e.target.value));
                  }}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* Speed */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="px-2 py-1.5 text-xs font-bold bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg outline-none cursor-pointer dark:text-white"
              >
                <option value="0.5">0.5x</option>
                <option value="1">1.0x</option>
                <option value="2">2.0x</option>
                <option value="4">4.0x</option>
              </select>

              {/* Loop */}
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-lg border transition-all ${
                  isLooping 
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" 
                    : "bg-transparent text-gray-400 border-gray-200 dark:border-gray-700"
                }`}
                title="Loop"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Clinical Statistics Panel */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 border dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
              Kinematic Metrics
            </h4>
            
            <div className="space-y-3.5">
              {/* Total Distance */}
              <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Path Distance</span>
                <span className="text-xs font-bold dark:text-white">{totalDistance.toFixed(2)} units</span>
              </div>
              
              {/* Avg Speed */}
              <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Avg Velocity</span>
                <span className="text-xs font-bold dark:text-white">{(avgSpeed * 10).toFixed(1)} units/s</span>
              </div>

              {/* Peak Speed */}
              <div className="flex justify-between items-center border-b dark:border-gray-800 pb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Peak Velocity</span>
                <span className="text-xs font-bold dark:text-white">{(maxSpeed * 10).toFixed(1)} units/s</span>
              </div>

              {/* Jitter / Tremor score */}
              <div className="flex justify-between items-center pb-1">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Jitter (Tremor Index)</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  jitterScore < 8 
                    ? "text-green-600 bg-green-50 dark:bg-green-950/20" 
                    : jitterScore < 18 
                      ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20" 
                      : "text-red-600 bg-red-50 dark:bg-red-950/20"
                }`}>
                  {jitterScore.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time details card */}
          <div className="mt-4 bg-white dark:bg-gray-800 p-3 rounded-xl border dark:border-gray-700">
            <h5 className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
              Live Tracker (Frame {safeIdx + 1})
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <p className="text-gray-400 font-medium">Coordinates X, Y</p>
                <p className="font-bold font-mono text-gray-800 dark:text-gray-200">
                  {(currentPoint?.x ?? 0).toFixed(3)}, {(currentPoint?.y ?? 0).toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 font-medium">Session Time</p>
                <p className="font-bold font-mono text-gray-800 dark:text-gray-200">
                  {currentPoint?.timestamp != null ? `${currentPoint.timestamp.toFixed(2)}s` : `${(safeIdx * 0.15).toFixed(2)}s`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// import React, { useState, useEffect, useRef, useMemo } from "react";

// Distinct colors for each finger
const FINGER_COLORS = {
  leftPinky: "#EC4899",   // Pink
  leftRing: "#F59E0B",    // Amber
  leftMiddle: "#EAB308",  // Yellow
  leftIndex: "#10B981",   // Emerald
  rightIndex: "#14B8A6",  // Teal
  rightMiddle: "#3B82F6", // Blue
  rightRing: "#6366F1",   // Indigo
  rightPinky: "#A855F7",  // Purple
  // Generic fallbacks
  thumb: "#F97316",       // Orange
  index: "#34D399",
  middle: "#60A5FA",
  ring: "#818CF8",
  pinky: "#C084FC",
  default: "#6B7280"      // Gray
};

// Logical left-to-right keyboard sorting weights
const FINGER_SORT_ORDER = {
  // Left Hand
  Q: 10, A: 11, Z: 12,
  W: 20, S: 21, X: 22,
  E: 30, D: 31, C: 32,
  R: 40, F: 41, V: 42, T: 43, G: 44, B: 45,
  // Right Hand
  Y: 50, H: 51, N: 52, U: 53, J: 54, M: 55,
  I: 60, K: 61, ",": 62,
  O: 70, L: 71, ".": 72,
  P: 80, ";": 81, "/": 82,
  // Space
  " ": 90
};

const FingerClickVisualizer = ({ fingerTimeouts, movements, isDarkMode }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const timerRef = useRef(null);

  // Determine exactly which fingers were involved in this session
  const activeFingersSet = useMemo(() => {
    const fingers = new Set();
    if (movements) {
      movements.forEach(m => {
        if (m.finger) fingers.add(m.finger);
        if (m.expectedFinger) fingers.add(m.expectedFinger);
      });
    }
    return fingers;
  }, [movements]);

  // 1. Sort keys left-to-right
  // 2. Map keys to a single horizontal row
  // 3. Attach the Expected Finger name
  const activeKeyCoords = useMemo(() => {
    if (!movements || movements.length === 0) return {};

    const keyDataMap = {};
    movements.forEach(m => {
      if (m.key) {
        const k = m.key.toUpperCase();
        if (!keyDataMap[k]) {
          keyDataMap[k] = { key: k, expectedFinger: m.expectedFinger };
        }
      }
    });

    const getSortWeight = (k) => FINGER_SORT_ORDER[k] || 100;
    
    // Sort keys logically based on keyboard position
    const sortedKeys = Object.values(keyDataMap).sort((a, b) => getSortWeight(a.key) - getSortWeight(b.key));
    
    const coords = {};
    const totalKeys = sortedKeys.length;
    const spacing = 100 / (totalKeys + 1);

    sortedKeys.forEach((item, index) => {
      coords[item.key] = {
        x: spacing * (index + 1),
        y: 50, // All on one horizontal line
        expectedFinger: item.expectedFinger
      };
    });

    return coords;
  }, [movements]);

  useEffect(() => {
    setActiveStep(0);
    setIsPlaying(false);
  }, [movements]);

  useEffect(() => {
    if (isPlaying) {
      const intervalTime = Math.max(200, 1000 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= movements.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, movements, playbackSpeed]);

  if (!movements || movements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No playing data recorded for this session.
      </div>
    );
  }

  const currentMove = movements[activeStep];
  const previousMove = activeStep > 0 ? movements[activeStep - 1] : null;

  // Helper formats: "leftIndex" -> "L Index"
  const formatFingerShort = (str) => {
    if (!str) return "";
    const lower = str.toLowerCase();
    if (lower.includes("left")) return "L " + str.replace(/left/i, "").charAt(0).toUpperCase() + str.replace(/left/i, "").slice(1);
    if (lower.includes("right")) return "R " + str.replace(/right/i, "").charAt(0).toUpperCase() + str.replace(/right/i, "").slice(1);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatFingerFull = (str) => {
    if (!str) return "N/A";
    const spaced = str.replace(/([A-Z])/g, " $1");
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  };

  // Filter timeouts to only show the ones actively used in the movements
  const filteredTimeouts = fingerTimeouts 
    ? Object.entries(fingerTimeouts).filter(([finger]) => activeFingersSet.has(finger))
    : [];

  return (
    <div className="space-y-4">
      
      {/* Session Finger Timeouts / Matrix Panel - NOW FILTERED */}
      {filteredTimeouts.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            Active Fingers & Time Limits
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredTimeouts.map(([finger, timeout]) => {
              const dotColor = FINGER_COLORS[finger] || FINGER_COLORS.default;
              return (
                <div 
                  key={finger} 
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 shadow-sm"
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: dotColor }} 
                  />
                  <span className="font-medium">{formatFingerFull(finger)}</span>
                  <span className="text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md ml-1 font-mono">
                    {timeout}s
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[2.5/1] bg-gray-900 rounded-2xl border border-gray-800 shadow-inner overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:5%_10%] opacity-20"></div>

        <svg viewBox="0 0 100 100" className="w-full h-full p-4">
          
          {/* Draw ONLY the keys used in this session */}
          {Object.entries(activeKeyCoords).map(([letter, pos]) => {
            const isCurrent = currentMove?.key?.toUpperCase() === letter;
            const isPrevious = previousMove?.key?.toUpperCase() === letter && !isCurrent;
            
            let fillColor = "#1F2937";      // Default dark gray background
            let strokeColor = "#374151";    // Default border
            let strokeWidth = "0.3";        // Default thin border
            let textColor = "#9CA3AF";      // Default text color

            if (isCurrent) {
              // Current key gets bright colors and thick border
              fillColor = FINGER_COLORS[currentMove?.finger] || FINGER_COLORS.default;
              strokeColor = currentMove.correct ? "#10B981" : "#EF4444"; // Bright Green/Red
              strokeWidth = "1.5";
              textColor = "#FFFFFF";
            } else if (isPrevious) {
              // Previous key gets a faded, darker border to show the "ghost" of the last press
              strokeColor = previousMove.correct ? "#064E3B" : "#7F1D1D"; // Dark Green/Red
              strokeWidth = "0.7"; 
              textColor = "#D1D5DB";
            }

            return (
              <g key={letter} transform={`translate(${pos.x}, ${pos.y})`}>
                <rect
                  x="-5"
                  y="-6"
                  width="10"
                  height="12"
                  rx="2"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  className="transition-all duration-300 shadow-lg"
                />
                <text
                  textAnchor="middle"
                  dy="1.5"
                  fontSize="4"
                  fontWeight="bold"
                  fill={textColor}
                  className="transition-colors duration-300"
                >
                  {letter}
                </text>
                
                {/* Finger Name Display below Key */}
                <text
                  textAnchor="middle"
                  dy="11"
                  fontSize="2.5"
                  fontWeight="500"
                  fill={isCurrent ? strokeColor : (isPrevious ? strokeColor : "#6B7280")}
                  className="transition-colors duration-300"
                >
                  {formatFingerShort(pos.expectedFinger)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Metrics overlay */}
        {currentMove && (
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-black/80 backdrop-blur-sm border border-gray-800 p-3 rounded-xl text-white text-xs font-mono">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px]">Step</span>
              <span>{activeStep + 1} / {movements.length}</span>
            </div>
            
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-[10px]">Target</span>
              <span className={`font-bold text-lg ${currentMove.correct ? "text-emerald-400" : "text-red-400"}`}>
                {currentMove.key}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px]">Action</span>
              <span className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: FINGER_COLORS[currentMove.finger] || FINGER_COLORS.default }}
                />
                {formatFingerFull(currentMove.finger)}
              </span>
              {currentMove.finger !== currentMove.expectedFinger && (
                <span className="text-[9px] text-red-400">
                  Expected: {formatFingerFull(currentMove.expectedFinger)}
                </span>
              )}
            </div>

            <div className="flex flex-col text-right">
              <span className="text-gray-400 text-[10px]">Speed</span>
              <span className={
                  fingerTimeouts && currentMove.responsetime > (fingerTimeouts[currentMove.finger] || 99) 
                  ? "text-red-400" 
                  : "text-emerald-400"
                }
              >
                {currentMove.responsetime}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-4 py-2 text-white font-bold text-xs rounded-xl transition-all active:scale-95 ${
            isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isPlaying ? "Pause" : "Play Action"}
        </button>
        <button
          type="button"
          onClick={() => { setIsPlaying(false); setActiveStep(0); }}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all active:scale-95 border dark:border-gray-600"
        >
          Reset
        </button>

        <input
          type="range"
          min="0"
          max={movements.length - 1}
          value={activeStep}
          onChange={(e) => { setIsPlaying(false); setActiveStep(parseInt(e.target.value)); }}
          className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />

        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="px-2 py-1.5 text-xs font-bold bg-gray-100 dark:bg-gray-800 border dark:border-gray-600 rounded-lg outline-none cursor-pointer dark:text-white"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1.0x</option>
          <option value="2">2.0x</option>
        </select>
      </div>
    </div>
  );
};

// export default FingerClickVisualizer;

// export default FingerClickVisualizer;

const LaptopMovementVisualizer = ({ movements, isDarkMode }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const timerRef = React.useRef(null);

  React.useEffect(() => {
    setActiveStep(0);
    setIsPlaying(false);
  }, [movements]);

  React.useEffect(() => {
    if (isPlaying) {
      const intervalTime = Math.max(200, 1000 / playbackSpeed);
      timerRef.current = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= movements.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalTime);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, movements, playbackSpeed]);

  if (!movements || movements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No transition vector data recorded for this session.
      </div>
    );
  }

  // Get distinct keys list to draw keyboard layout
  const points = [];
  movements.forEach((m) => {
    if (m.fromX && m.fromY && m.fromKey) points.push({ x: m.fromX, y: m.fromY, label: m.fromKey });
    if (m.toX && m.toY && m.toKey) points.push({ x: m.toX, y: m.toY, label: m.toKey });
  });

  // Deduplicate points based on label
  const uniqueKeysMap = {};
  points.forEach(p => {
    if (p.label) uniqueKeysMap[p.label] = p;
  });
  const uniqueKeys = Object.values(uniqueKeysMap);

  if (uniqueKeys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No valid coordinates found in movement logs.
      </div>
    );
  }

  // Normalize
  const xCoords = uniqueKeys.map(p => p.x);
  const yCoords = uniqueKeys.map(p => p.y);
  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  const normX = (x) => {
    if (maxX === minX) return 50;
    return 15 + ((x - minX) / (maxX - minX)) * 70;
  };

  const normY = (y) => {
    if (maxY === minY) return 25;
    return 20 + ((y - minY) / (maxY - minY)) * 10;
  };

  const currentMove = movements[activeStep];

  return (
    <div className="space-y-4">
      {/* SVG Canvas */}
      <div className="relative w-full aspect-[2.5/1] bg-gray-900 rounded-2xl border border-gray-800 shadow-inner overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:5%_10%] opacity-20"></div>
        
        <svg viewBox="0 0 100 50" className="w-full h-full p-4">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#3b82f6" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 2 L 10 5 L 0 8 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* All transitions in grey */}
          {movements.map((m, idx) => {
            if (!m.fromX || !m.toX) return null;
            return (
              <line
                key={`line-${idx}`}
                x1={normX(m.fromX)}
                y1={normY(m.fromY)}
                x2={normX(m.toX)}
                y2={normY(m.toY)}
                stroke="#374151"
                strokeWidth="0.4"
                strokeDasharray="1,1"
              />
            );
          })}

          {/* Active transition arrow */}
          {currentMove && currentMove.fromX && currentMove.toX && (
            <line
              x1={normX(currentMove.fromX)}
              y1={normY(currentMove.fromY)}
              x2={normX(currentMove.toX)}
              y2={normY(currentMove.toY)}
              stroke="#EF4444"
              strokeWidth="1.2"
              markerEnd="url(#arrow-active)"
              className="transition-all duration-300"
            />
          )}

          {/* Draw keycap circles */}
          {uniqueKeys.map((k) => {
            const isActive = currentMove && (currentMove.fromKey === k.label || currentMove.toKey === k.label);
            const isToKey = currentMove && currentMove.toKey === k.label;
            return (
              <g key={k.label} transform={`translate(${normX(k.x)}, ${normY(k.y)})`}>
                <circle
                  r="3.5"
                  fill={isToKey ? "#EF4444" : isActive ? "#3B82F6" : "#1F2937"}
                  stroke="#fff"
                  strokeWidth="0.5"
                  className="transition-colors duration-200"
                />
                <text
                  textAnchor="middle"
                  dy="0.8"
                  fontSize="2.5"
                  fontWeight="bold"
                  fill="#fff"
                >
                  {k.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Metrics overlay */}
        {currentMove && (
          <div className="absolute bottom-3 left-3 right-3 flex justify-between bg-black/80 backdrop-blur-sm border border-gray-800 p-2.5 rounded-xl text-white text-[10px] font-mono">
            <div>
              <span className="text-gray-400">Step:</span> {activeStep + 1} / {movements.length}
            </div>
            <div>
              <span className="text-gray-400">Move:</span> {currentMove.fromKey} ➔ {currentMove.toKey}
            </div>
            <div>
              <span className="text-gray-400">Dist:</span> {currentMove.distance} px
            </div>
            <div>
              <span className="text-gray-400">Vector:</span> ({currentMove.dx}, {currentMove.dy})
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`px-3 py-1.5 text-white font-bold text-xs rounded-xl transition-all active:scale-95 ${
            isPlaying ? "bg-amber-500 hover:bg-amber-600" : "bg-primary-500 hover:bg-primary-600"
          }`}
        >
          {isPlaying ? "Pause" : "Play Path"}
        </button>
        <button
          type="button"
          onClick={() => { setIsPlaying(false); setActiveStep(0); }}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-all active:scale-95 border dark:border-gray-600"
        >
          Reset
        </button>

        <input
          type="range"
          min="0"
          max={movements.length - 1}
          value={activeStep}
          onChange={(e) => { setIsPlaying(false); setActiveStep(parseInt(e.target.value)); }}
          className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />

        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="px-2 py-1 text-xs font-bold bg-gray-100 dark:bg-gray-700 border dark:border-gray-600 rounded-lg outline-none cursor-pointer dark:text-white"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1.0x</option>
          <option value="2">2.0x</option>
        </select>
      </div>
    </div>
  );
};

const PianoReactionGameAnalytics = ({ session, isDarkMode }) => {
  const mode = session?.mode || "laptop";
  const fingerTimeouts = session?.fingerTimeouts || { thumb: 5, index: 5, middle: 5, ring: 5, pinky: 5 };
  const laptopMovements = session?.laptopMovements || [];
  const mobileMovements = session?.mobileMovements || [];

  console.log("Session Data:", session);

  if (mode === "laptop") {
    const totalDistance = laptopMovements.reduce((sum, m) => sum + (m.distance || 0), 0);
    const avgDistance = laptopMovements.length > 0 ? totalDistance / laptopMovements.length : 0;

    return (
      <div className="space-y-6 mt-4">
        {/* Laptop Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Total Pixel Distance Moved</p>
            <p className="text-3xl font-black text-primary-600 dark:text-primary-400">
              {totalDistance.toFixed(1)} px
            </p>
            <p className="text-xs text-gray-400 mt-1">Sum of physical movement deltas between keys</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Avg Transition Distance</p>
            <p className="text-3xl font-black text-secondary-600 dark:text-secondary-400">
              {avgDistance.toFixed(1)} px
            </p>
            <p className="text-xs text-gray-400 mt-1">Average pixel travel per key response</p>
          </div>
        </div>

        {/* Laptop Visualizer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-150 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Wrist/Arm Movement Vector Trajectory</h3>
          <p className="text-xs text-gray-400 mb-4">Sequential coordinate path mapping response targets in absolute pixel coordinates.</p>
          <FingerClickVisualizer fingerTimeouts={session?.fingerTimeouts} movements={mobileMovements} isDarkMode={isDarkMode} />
        </div>
      </div>
    );
  } else {
    const fingerKeys = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    const fingerIcons = { thumb: <ThumbsUp size={16} />, index: <PenTool size={16} />, middle: <Hand size={16} />, ring: <Circle size={16} />, pinky: <Hand size={16} /> };
    const fingerNames = { thumb: "Thumb", index: "Index", middle: "Middle", ring: "Ring", pinky: "Pinky" };

    const fingerStats = fingerKeys.map(finger => {
      const movements = mobileMovements.filter(m => m.expectedFinger === finger);
      const total = movements.length;
      const correct = movements.filter(m => m.correct === 1).length;
      const incorrect = movements.filter(m => m.correct === -1).length;
      
      const correctMovements = movements.filter(m => m.correct === 1 && m.responsetime > 0);
      const avgResponse = correctMovements.length > 0
        ? correctMovements.reduce((sum, m) => sum + m.responsetime, 0) / correctMovements.length
        : 0;
        
      const accuracy = (correct + incorrect) > 0
        ? (correct / (correct + incorrect)) * 100
        : 0;

      return {
        finger,
        name: fingerNames[finger],
        icon: fingerIcons[finger],
        total,
        correct,
        incorrect,
        avgResponse,
        accuracy,
        timeout: fingerTimeouts[finger] || 5
      };
    }).filter(f => f.total > 0);

    return (
      <div className="space-y-6 mt-4">
        {/* Mobile Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {fingerStats.map(f => (
            <div key={f.finger} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-150 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg text-primary-500">{f.icon}</span>
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg text-[10px] font-bold">
                  Limit: {f.timeout}s
                </span>
              </div>
              <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1">{f.name} Finger</h4>
              <p className="text-[11px] text-gray-400 mb-3">{f.correct} of {f.total} correct</p>
              
              <div className="space-y-2 pt-2 border-t dark:border-gray-700">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Response</span>
                  <span className="font-bold text-primary-600 dark:text-primary-400">{f.avgResponse.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{f.accuracy.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-150 dark:border-gray-700 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Finger Dexterity Profile</h3>
          <p className="text-xs text-gray-400 mb-4">Response times and accuracy compared across active fingers.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fingerStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1F2937" : "#F3F4F6"} />
                <XAxis dataKey="name" tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 11 }} />
                <YAxis yAxisId="left" orientation="left" unit="s" tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" unit="%" tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#111827" : "#FFFFFF", borderColor: isDarkMode ? "#374151" : "#E5E7EB", borderRadius: "8px" }} />
                <Legend />
                <Bar yAxisId="left" dataKey="avgResponse" fill="#3B82F6" name="Avg Response (s)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="accuracy" fill="#10B981" name="Accuracy (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
};

// Extracted Dashboard content into its own component
const GAMES_LIST = [
  {
    type: "type1",
    name: "Piano Reaction Game",
    path: "/piano-reaction",
    desc: "Tests and improves cognitive reaction speeds by tapping highlighted piano keys in response to stimuli.",
    clinicalFocus: "Cognitive processing speed, manual dexterity, and hand-eye coordination.",
    hasCoordinates: false,
    icon: <Music className="w-12 h-12 text-white" />,
    color: "from-violet-700 to-indigo-800",
    accent: "#7C3AED",
  },
  {
    type: "board_drawing",
    name: "Board Drawing",
    path: "/board-drawing",
    desc: "Traces complex board paths to evaluate distal hand movements, precision, and tremor control.",
    clinicalFocus: "Fine motor control, hand tremor reduction, and continuous movement precision.",
    hasCoordinates: false,
    icon: <Edit3 className="w-12 h-12 text-white" />,
    color: "from-blue-700 to-cyan-800",
    accent: "#2563EB",
  },
  {
    type: "fruit_basket",
    name: "Arm – Fruit Fetch",
    path: "/fruit-basket",
    desc: "Grasp and move falling fruits into a basket using full arm gestures to improve range of motion.",
    clinicalFocus: "Gross motor coordination, shoulder/elbow articulation, and spatial reaching velocity.",
    hasCoordinates: true,
    icon: <Target className="w-12 h-12 text-white" />,
    color: "from-orange-600 to-amber-700",
    accent: "#EA580C",
  },
];

const DashboardContent = ({
  userData,
  user,
  stats,
  setIsDoctorModalOpen,
  navigate,
  userId,
  isDarkMode,
  toggleDarkMode,
}) => {
  const [selectedSession, setSelectedSession] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [isMounted, setIsMounted] = useState(false);
  
  // Game Selector State
  const defaultGameType = stats?.games?.[0]?.type || "type1";
  const [selectedGameType, setSelectedGameType] = useState(defaultGameType);
  const [viewMode, setViewMode] = useState("home"); // "home" or "details"
  const [pianoSubTab, setPianoSubTab] = useState("finger"); // "finger" or "ankle"

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [editingReminder, setEditingReminder] = useState(null);

  const recentSessions = useMemo(() => {
    let sessions = [];
    if (stats?.games && stats.games.length > 0) {
      const selectedGame = stats.games.find(g => g.type === selectedGameType) || stats.games[0];
      sessions = selectedGame.recentSessions || [];
    } else {
      sessions = stats?.recentSessions || (stats?.play ? [stats] : []);
    }

    if (selectedGameType === "type1") {
      return sessions.filter((s) => {
        const gameType = s.gameType || s.session?.gameType;
        const mode = s.mode || s.session?.mode;
        const hasCoords = (s.coordinates && s.coordinates.length > 0) || (s.session?.coordinates && s.session?.coordinates.length > 0);
        const isWrist = gameType === "piano_ankle" || mode === "piano_finger" || hasCoords;

        if (pianoSubTab === "finger") {
          return !isWrist;
        } else {
          return isWrist;
        }
      });
    }

    return sessions;
  }, [stats, selectedGameType, pianoSubTab]);
  
  const today = useMemo(() => new Date(), []); // Stable reference for calculations

  const totals = useMemo(
    () => ({
      correct: recentSessions.reduce((sum, s) => sum + (s.correct || 0), 0),
      incorrect: recentSessions.reduce((sum, s) => sum + (s.incorrect || 0), 0),
      notDone: recentSessions.reduce((sum, s) => sum + (s.notDone || 0), 0),
      responsetime: recentSessions.reduce(
        (sum, s) => sum + (s.responsetime || 0),
        0,
      ),
    }),
    [recentSessions],
  );

  const barData = useMemo(
    () => [
      { name: "Correct", value: totals.correct },
      { name: "Incorrect", value: totals.incorrect },
      { name: "Not Done", value: totals.notDone },
    ],
    [totals],
  );

  // Daily data aggregation
  const dailyData = useMemo(() => {
    const data = {};
    recentSessions.forEach((session) => {
      const date = new Date(session.time);
      const dateStr = date.toISOString().split("T")[0];
      if (!data[dateStr]) {
        data[dateStr] = {
          correct: 0,
          incorrect: 0,
          notDone: 0,
          total: 0,
          totalResponseTime: 0,
        };
      }
      data[dateStr].correct += session.correct || 0;
      data[dateStr].incorrect += session.incorrect || 0;
      data[dateStr].notDone += session.notDone || 0;
      data[dateStr].total +=
        session.total || session.correct + session.incorrect + session.notDone;
      data[dateStr].totalResponseTime += session.responsetime || 0;
    });
    return data;
  }, [recentSessions]);

  // Last 7 chronological sessions ascending for charts
  const last7ChronAsc = [...recentSessions]
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .slice(-7);

  // Descending for select (most recent first)
  const last7ChronDesc = [...last7ChronAsc].reverse();

  // Accuracy and Response Time data for last 7 games (using asc for chronological order)
  const accuracyData = last7ChronAsc.map((session) => {
    const total = (session.correct || 0) + (session.incorrect || 0);
    const accuracy = total > 0 ? ((session.correct || 0) / total) * 100 : 0;
    const avgResponseTime =
      (session.total || total) > 0
        ? (session.responsetime || 0) / (session.total || total)
        : 2.5;

    return {
      date: new Date(session.time).toLocaleDateString(),
      accuracy,
      responseTime: avgResponseTime,
    };
  });

  // Average accuracy over last 7 sessions
  const avgAcc7Sessions =
    last7ChronAsc.length > 0
      ? last7ChronAsc.reduce((sum, s) => {
        const total = (s.correct || 0) + (s.incorrect || 0);
        return sum + (total > 0 ? ((s.correct || 0) / total) * 100 : 0);
      }, 0) / last7ChronAsc.length
      : 0;

  // Average response time over last 7 games
  const avgResponseTime7Games =
    last7ChronAsc.reduce((sum, session) => {
      const total =
        session.total ||
        (session.correct || 0) +
        (session.incorrect || 0) +
        (session.notDone || 0);
      const avg = total > 0 ? (session.responsetime || 0) / total : 2.5;
      return sum + avg;
    }, 0) / last7ChronAsc.length;

  // Counts data for last 7 games (using asc)
  const last7Data = last7ChronAsc.map((session) => ({
    date: new Date(session.time).toLocaleDateString(),
    correct: session.correct || 0,
    incorrect: session.incorrect || 0,
    notDone: session.notDone || 0,
  }));

  // Daily totals data for last 7 days
  const last7Days = Array.from(
    { length: 7 },
    (_, i) => new Date(today.getTime() - i * 24 * 60 * 60 * 1000),
  );
  const dailyTotalsData = last7Days
    .map((day) => {
      const dateStr = day.toISOString().split("T")[0];
      const dayData = dailyData[dateStr] || {
        correct: 0,
        incorrect: 0,
        notDone: 0,
      };
      return {
        date: day.toLocaleDateString(),
        correct: dayData.correct,
        incorrect: dayData.incorrect,
        notDone: dayData.notDone,
      };
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ensure ascending order

  // Streak calculation
  const currentStreak = useMemo(
    () => calculateStreak(dailyData, today),
    [dailyData, today],
  );

  // Streak data for last 15 days - for visualization
  const last15Days = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d;
  });
  const streakData = last15Days.map((day) => {
    const dateStr = day.toISOString().split("T")[0];
    const attempts = dailyData[dateStr] ? dailyData[dateStr].total : 0;
    return {
      date: day.toLocaleDateString(),
      attempts,
    };
  });

  // Selected session detailed data (using desc, index 0 is most recent)
  const selectedSessionData = last7ChronDesc[selectedSession];
  const attemptData = selectedSessionData?.session.play
    ? selectedSessionData.session.play.map((p, i) => ({
      attempt: i + 1,
      responseTime: p.responsetime,
      correct: p.correct,
    }))
    : [];

  // Custom dot renderer for colored nodes based on correctness
  const renderDot = (props) => {
    const { cx, cy, payload } = props;
    let fillColor = "black";
    if (payload.correct === 1) {
      fillColor = "green";
    } else if (payload.correct === -1) {
      fillColor = "red";
    } else {
      fillColor = isDarkMode ? "#374151" : "#E5E7EB";
    }
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fillColor}
        stroke={fillColor}
        strokeWidth={2}
      />
    );
  };

  // Custom tooltip formatter to include status
  const customTooltip = (props) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const status =
        data.correct === 1
          ? "Correct"
          : data.correct === -1
            ? "Incorrect"
            : "Not Done";
      return (
        <div className="bg-white dark:bg-gray-900 p-3 border dark:border-gray-800 rounded-xl shadow-xl">
          <p className="font-bold dark:text-white mb-1">
            Attempt {data.attempt}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Response Time: {data.responseTime}s
          </p>
          <p className="text-sm font-medium mt-1">
            Status:{" "}
            <span
              style={{
                color:
                  data.correct === 1
                    ? "#10B981"
                    : data.correct === -1
                      ? "#EF4444"
                      : isDarkMode
                        ? "#94A3B8"
                        : "black",
              }}
            >
              {status}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };


  // Fetch reminders
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await reminderService.listForPatient(userId);
        setReminders(res.reminders || []);
      } catch (err) {
        console.error("Failed to fetch reminders:", err);
      }
    };
    fetchReminders();
  }, [userId]);

  // Filter reminders based on period
  const filteredReminders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    let start = todayStr;
    let end;

    if (selectedPeriod === "today") {
      end = todayStr;
    } else if (selectedPeriod === "week") {
      const dayOfWeek = now.getDay(); // 0 = Sunday
      const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + daysToSunday);
      end = endOfWeek.toISOString().split("T")[0];
    } else {
      // month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      end = endOfMonth.toISOString().split("T")[0];
    }

    const filtered = reminders
      .filter((r) => {
        const rDateStr = new Date(r.date).toISOString().split("T")[0];
        return rDateStr >= start && rDateStr <= end;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return filtered;
  }, [reminders, selectedPeriod]);

  const activeReminders = filteredReminders.filter(
    (r) => r.status !== "completed",
  );
  const completedReminders = filteredReminders.filter(
    (r) => r.status === "completed",
  );
  const totalReminders = filteredReminders.length;
  const percentage =
    totalReminders > 0
      ? Math.round((completedReminders.length / totalReminders) * 100)
      : 0;

  const handleSaveEdit = useCallback(
    async (updatedForm) => {
      if (!editingReminder) return;
      try {
        await reminderService.update(editingReminder._id, updatedForm);
        const res = await reminderService.listForPatient(userId);
        setReminders(res.reminders || []);
        setEditingReminder(null);
      } catch (err) {
        console.error("Failed to update reminder:", err);
      }
    },
    [editingReminder, userId],
  );

  // Restore handleMarkDone that was accidentally removed
  const handleMarkDone = useCallback(
    async (reminderId) => {
      try {
        await reminderService.complete(reminderId);
        const res = await reminderService.listForPatient(userId);
        setReminders(res.reminders || []);
      } catch (err) {
        console.error("Failed to complete reminder:", err);
      }
    },
    [userId],
  );

  // ── Extra home-view computations ─────────────────────────────────────────────
  const selectedGame = GAMES_LIST.find(g => g.type === selectedGameType);

  const totalSessionsAllGames = useMemo(() => {
    if (!stats?.games) return recentSessions.length;
    return stats.games.reduce((sum, g) => sum + (g.recentSessions?.length || 0), 0);
  }, [stats, recentSessions]);

  const todaySessionsCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!stats?.games) return 0;
    return stats.games.reduce((count, g) => {
      return count + (g.recentSessions || []).filter(s =>
        new Date(s.time).toISOString().split('T')[0] === todayStr
      ).length;
    }, 0);
  }, [stats]);

  const weekAccuracyAllGames = useMemo(() => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (!stats?.games) return avgAcc7Sessions;
    const allWeekSessions = stats.games.flatMap(g =>
      (g.recentSessions || []).filter(s => new Date(s.time) >= oneWeekAgo)
    );
    if (allWeekSessions.length === 0) return 0;
    const totalAcc = allWeekSessions.reduce((sum, s) => {
      const tot = (s.correct || 0) + (s.incorrect || 0);
      return sum + (tot > 0 ? ((s.correct || 0) / tot) * 100 : 0);
    }, 0);
    return totalAcc / allWeekSessions.length;
  }, [stats, avgAcc7Sessions]);

  const weekSparklineData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayStats = dailyData[dateStr];
      const total = dayStats?.total || 0;
      const correct = dayStats?.correct || 0;
      return { day: d.toLocaleDateString('en', { weekday: 'short' }), acc: total > 0 ? (correct / total) * 100 : 0 };
    });
  }, [today, dailyData]);

  // Coordinate data: lives at session.coordinates in the API response
  const selectedCoordinates = (
    recentSessions[selectedSession]?.session?.coordinates ||
    recentSessions[selectedSession]?.coordinates ||
    []
  );
  const selectedBoardDrawingAttempts = (
    recentSessions[selectedSession]?.session?.boardDrawingAttempts ||
    recentSessions[selectedSession]?.boardDrawingAttempts ||
    selectedSessionData?.session?.boardDrawingAttempts ||
    selectedSessionData?.boardDrawingAttempts ||
    []
  );

  return (
    <div className="fade-in">

      {/* ═══════════════ DETAIL VIEW (full-width) ═══════════════ */}
      {viewMode === "details" ? (
        <div className="space-y-0">

          {/* ── Hero Banner ── */}
          <div className={`bg-gradient-to-br ${selectedGame?.color || 'from-gray-700 to-gray-800'} rounded-xl p-8 mb-6 relative overflow-hidden`}>
            {/* Decorative blobs */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-5xl shadow-xl border border-white/20">
                  {selectedGame?.icon}
                </div>
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Game Stats</p>
                  <h2 className="text-3xl font-black text-white leading-none mb-1">{selectedGame?.name}</h2>
                  <p className="text-white/70 text-sm font-medium max-w-sm leading-relaxed">{selectedGame?.clinicalFocus}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Quick stat pills */}
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <span className="text-2xl font-black text-white">{recentSessions.length}</span>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Sessions</span>
                </div>
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <span className="text-2xl font-black text-white">
                    {recentSessions.length > 0 ? Math.max(...recentSessions.map(s => s.sessionScore || 0), 0) : 0}
                  </span>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Best Score</span>
                </div>
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <span className="text-2xl font-black text-white">{avgAcc7Sessions.toFixed(0)}%</span>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Avg Accuracy</span>
                </div>
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
                  <span className="text-2xl font-black text-white">
                    {isNaN(avgResponseTime7Games) ? '—' : `${avgResponseTime7Games.toFixed(1)}s`}
                  </span>
                  <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Avg Response</span>
                </div>
              </div>
            </div>

            {/* Back + Play buttons */}
            <div className="relative z-10 flex items-center justify-between mt-6 pt-5 border-t border-white/10">
              <button
                onClick={() => setViewMode("home")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Home
              </button>
              <button
                onClick={() => navigate(selectedGame?.path)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-black hover:shadow-lg transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" style={{ color: selectedGame?.accent }} /> Play Now
              </button>
            </div>
          </div>

          {/* ── Game Selector Tabs ── */}
          <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 mb-6">
            {GAMES_LIST.map(g => (
              <button
                key={g.type}
                onClick={() => { setSelectedGameType(g.type); setSelectedSession(0); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedGameType === g.type
                    ? 'bg-gray-900 text-white shadow-md dark:bg-white dark:text-gray-900'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-base">{g.icon}</span>
                <span>{g.name}</span>
                {selectedGameType === g.type && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                )}
              </button>
            ))}
          </div>

          {/* Sub-tab Selector for Piano Reaction Game */}
          {selectedGameType === "type1" && (
            <div className="flex gap-2 p-1.5 bg-gray-100/80 dark:bg-gray-950/40 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-800/50 mb-6 max-w-md">
              <button
                className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors border-b-2 flex justify-center items-center gap-2 ${
                  pianoSubTab === 'finger'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                onClick={() => setPianoSubTab('finger')}
              >
                <Activity size={18} />
                Finger Tracking
              </button>
              <button
                className={`flex-1 py-3 px-4 font-semibold text-sm transition-colors border-b-2 flex justify-center items-center gap-2 ${
                  pianoSubTab === 'ankle'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                onClick={() => setPianoSubTab('ankle')}
              >
                <Clock size={18} />
                Wrist Tracking
              </button>
            </div>
          )}

          {/* ── Charts & Visualizations ── */}
          {recentSessions.length > 0 ? (
            <div className="space-y-6">

              {/* Accuracy & Response Time */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Accuracy &amp; Response Time</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Last 7 sessions overview</p>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-gray-500 dark:text-gray-400 font-medium">Accuracy</span></span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span><span className="text-gray-500 dark:text-gray-400 font-medium">Response</span></span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={accuracyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#1F2937" : "#F3F4F6"} />
                      <XAxis dataKey="date" tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" orientation="left" unit="%" tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" unit="s" tick={{ fill: isDarkMode ? "#9CA3AF" : "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: isDarkMode ? "#111827" : "#FFFFFF", borderColor: isDarkMode ? "#374151" : "#E5E7EB", color: isDarkMode ? "#F3F4F6" : "#111827", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }} formatter={(value, name) => { if (name === "accuracy") return [`${value.toFixed(1)}%`, "Accuracy"]; if (name === "responseTime") return [`${value.toFixed(2)}s`, "Avg Response"]; return [value, name]; }} />
                      <Line type="monotone" dataKey="accuracy" stroke="#3B82F6" yAxisId="left" strokeWidth={3} dot={{ r: 5, fill: "#3B82F6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="responseTime" stroke="#EC4899" yAxisId="right" strokeWidth={3} dot={{ r: 5, fill: "#EC4899", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance + Daily Progress side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white leading-none">Performance Breakdown</h3>
                      <p className="text-[11px] text-gray-400">Correct / Incorrect / Skipped</p>
                    </div>
                  </div>
                  <div className="h-52">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={last7Data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1F2937" : "#F3F4F6"} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? "#9CA3AF" : "#94A3B8" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? "#9CA3AF" : "#94A3B8" }} />
                          <Tooltip contentStyle={{ borderRadius: "14px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", backgroundColor: isDarkMode ? "#111827" : "#FFFFFF", color: isDarkMode ? "#F3F4F6" : "#111827" }} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="correct" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: "#10B981" }} name="Correct" />
                          <Line type="monotone" dataKey="incorrect" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: "#EF4444" }} name="Incorrect" />
                          <Line type="monotone" dataKey="notDone" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: "#F59E0B" }} name="Skipped" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-secondary-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white leading-none">Daily Progress</h3>
                      <p className="text-[11px] text-gray-400">Totals by day (last 7 days)</p>
                    </div>
                  </div>
                  <div className="h-52">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyTotalsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1F2937" : "#F3F4F6"} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? "#9CA3AF" : "#94A3B8" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? "#9CA3AF" : "#94A3B8" }} />
                          <Tooltip contentStyle={{ borderRadius: "14px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", backgroundColor: isDarkMode ? "#111827" : "#FFFFFF", color: isDarkMode ? "#F3F4F6" : "#111827" }} />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                          <Line type="monotone" dataKey="correct" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: "#10B981" }} name="Correct" />
                          <Line type="monotone" dataKey="incorrect" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: "#EF4444" }} name="Incorrect" />
                          <Line type="monotone" dataKey="notDone" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: "#F59E0B" }} name="Skipped" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Play-by-Play */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Session Replay</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Response time per attempt</p>
                  </div>
                  {/* Session selector pills */}
                  <div className="flex flex-wrap gap-2">
                    {last7ChronDesc.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSession(i)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                          selectedSession === i
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        S{i + 1} · {new Date(s.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Selected session info strip */}
                {last7ChronDesc[selectedSession] && (
                  <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                    <div className="text-[11px] text-gray-400 font-medium">
                      {new Date(last7ChronDesc[selectedSession].time).toLocaleString()}
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-black rounded-full">
                        ✓ {last7ChronDesc[selectedSession].correct} correct
                      </span>
                      <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black rounded-full">
                        ✗ {last7ChronDesc[selectedSession].incorrect} wrong
                      </span>
                      <span className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-black rounded-full">
                        ⭐ {last7ChronDesc[selectedSession].sessionScore || 0} pts
                      </span>
                    </div>
                  </div>
                )}
                {attemptData.length > 0 ? (
                  <div className="h-52">
                    {isMounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={attemptData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1F2937" : "#F3F4F6"} />
                          <XAxis dataKey="attempt" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? "#9CA3AF" : "#94A3B8" }} />
                          <YAxis unit="s" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: isDarkMode ? "#9CA3AF" : "#94A3B8" }} />
                          <Tooltip content={customTooltip} />
                          <Line type="monotone" dataKey="responseTime" stroke={selectedGame?.accent || "#6366F1"} strokeWidth={2.5} dot={renderDot} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="flex justify-center mb-2 text-slate-300 dark:text-slate-600"><Target size={32} /></div>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No recent sessions available</p>
                  </div>
                )}
              </div>

              {/* Hand Movement Trajectory */}
              {selectedGameType === "board_drawing" && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: selectedGame.accent }}></div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Board Drawing Trajectory Replay</h3>
                    <span className="text-xs text-gray-400 font-medium">— Session {selectedSession + 1}</span>
                  </div>
                  <BoardDrawingTrajectoryReplay attempts={selectedBoardDrawingAttempts} />
                  
                  <DrawingPerformancePanel userId={null} />
                </div>
              )}

              {selectedGameType !== "board_drawing" && (selectedGame?.hasCoordinates || (selectedGameType === "type1" && pianoSubTab === "ankle")) && selectedCoordinates.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: selectedGame.accent }}></div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">Hand/Cursor Movement Trajectory</h3>
                    <span className="text-xs text-gray-400 font-medium">— Session {selectedSession + 1}</span>
                  </div>
                  <CoordinateVisualizer coordinates={selectedSessionData?.session?.coordinates} />
                </div> 
              )}

              {console.log(selectedSessionData.session.coordinates)}
              
              {/* Laptop Visualizer */}
              {selectedGameType !== "board_drawing" && (selectedGame?.hasCoordinates || (selectedGameType === "type1" && pianoSubTab === "ankle")) && selectedCoordinates.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-150 dark:border-gray-700 shadow-sm">
                  <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">Wrist/Arm Movement Vector Trajectory</h3>
                  <p className="text-xs text-gray-400 mb-4">Sequential coordinate path mapping response targets in absolute pixel coordinates.</p>
                  <LaptopMovementVisualizer movements={selectedSessionData?.session?.laptopMovements} isDarkMode={isDarkMode} />
                </div>
              )}
              
              {/* Piano Reaction Game Modes Analytics */}
              {selectedGameType === "type1" && pianoSubTab === "finger" && (
                <div>
                  <div className="flex items-center gap-2 mb-3 mt-6">
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: selectedGame.accent }}></div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-white">
                      {selectedSessionData?.session?.mode === 'mobile' ? 'Mobile Finger Dexterity Analytics' : 'Laptop Movement Analytics'}
                    </h3>
                    <span className="text-xs text-gray-400 font-medium">— Session {selectedSession + 1}</span>
                  </div>
                  <PianoReactionGameAnalytics
                    session={selectedSessionData?.session}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="text-7xl mb-4">{selectedGame?.icon}</div>
              <p className="text-xl font-bold text-gray-400 mb-2">No sessions recorded yet</p>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Play {selectedGame?.name} to start tracking your therapy progress and see your stats here.</p>
              <button
                onClick={() => navigate(selectedGame?.path)}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-black hover:shadow-lg transition-all active:scale-95 text-sm"
                style={{ background: `linear-gradient(135deg, ${selectedGame?.accent}, ${selectedGame?.accent}cc)` }}
              >
                <Play className="w-5 h-5 fill-current" /> Play Now
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ═══════════════════════════════════════
           HOME VIEW
           ═══════════════════════════════════════ */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main Content (2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Greeting Row */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Hello, {userData?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-lg">Your clinical overview for today.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xl font-bold text-blue-800 dark:text-blue-300 leading-none">{currentStreak}</p>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Day Streak</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-5 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-xl">
                  <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300 leading-none">{stats?.totalScore || 0}</p>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Points</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards Row */}
            <div className="grid grid-cols-3 gap-6">
              {/* Daily Goal */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Daily Goal</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white">
                  {todaySessionsCount} <span className="text-xl text-slate-400 dark:text-slate-500">/ 3</span>
                </p>
                <p className="text-sm text-slate-500 mt-1 mb-4">Exercises Completed</p>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((todaySessionsCount / 3) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Keep Going */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -right-2 -bottom-2 opacity-10 select-none">
                  <Award className="w-32 h-32 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Keep Going!</p>
                <div className="mt-2 mb-2">
                   <Award className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400 leading-snug">Excellent clinical progress.</p>
              </div>

              {/* This Week */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">This Week</p>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{weekAccuracyAllGames.toFixed(0)}%</p>
                <p className="text-sm text-slate-500 mt-1 mb-3">Overall Score</p>
                {isMounted && (
                  <div className="h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weekSparklineData}>
                        <Line type="monotone" dataKey="acc" stroke="#10B981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Choose Your Game */}
            <div className="premium-card p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-500" />
                Choose Your Game
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {GAMES_LIST.map((game) => {
                  const gameStats = stats?.games?.find(g => g.type === game.type);
                  const sessions = gameStats?.recentSessions || [];
                  const playCount = sessions.length;
                  const highScore = playCount > 0 ? Math.max(...sessions.map(s => s.sessionScore || 0), 0) : 0;
                  const themes = {
                    type1:        'from-violet-700 to-indigo-800',
                    board_drawing: 'from-blue-700 to-cyan-800',
                    shape_tracing: 'from-teal-600 to-emerald-800',
                    fruit_basket:  'from-orange-600 to-amber-700',
                    in_cam_game:   'from-slate-600 to-gray-800',
                  };
                  const grad = themes[game.type] || 'from-gray-700 to-gray-800';
                  return (
                    <div
                      key={game.type}
                      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-colors shadow-sm"
                    >
                      {/* Visual Header */}
                      <div className="bg-slate-50 dark:bg-slate-900/50 h-28 flex flex-col items-center justify-center relative border-b border-slate-100 dark:border-slate-700">
                        <span className="text-slate-700 dark:text-slate-300">
                          {React.cloneElement(game.icon, { className: 'w-12 h-12' })}
                        </span>
                        {playCount > 0 && (
                          <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-2 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                            {playCount} Sessions
                          </div>
                        )}
                        {highScore > 0 && (
                          <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold px-2 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {highScore}
                          </div>
                        )}
                      </div>
                      {/* Card Body */}
                      <div className="p-5">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{game.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-5">{game.desc}</p>
                        <div className="space-y-3">
                          <button
                            onClick={() => navigate(game.path)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
                          >
                            <Play className="w-4 h-4 fill-white" /> Start Exercise
                          </button>
                          <button
                            onClick={() => { setSelectedGameType(game.type); setViewMode("details"); setSelectedSession(0); }}
                            className="w-full py-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            View Clinical Stats
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4">
            {/* Performance Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/20">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Level</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats?.level || 1}</p>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/20">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Score</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats?.totalScore || 0}</p>
                </div>
                <div className="bg-slate-50/50 dark:bg-slate-900/10 rounded-xl p-4 border border-slate-100 dark:border-slate-700 col-span-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Total Sessions (All Games)</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSessionsAllGames}</p>
                </div>
              </div>
            </div>

            {/* Your Doctor */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Care Team</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://via.placeholder.com/40"
                  className="w-12 h-12 rounded-full ring-2 ring-blue-100 dark:ring-blue-900"
                  alt="Doctor"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{userData?.doctor?.[0]?.doctorName || "Your Doctor"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{userData?.doctor?.[0]?.doctorDegree || "Physician"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/chat")}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors"
                >
                  <MessageSquare size={16} /> Message
                </button>
                <a
                  href={`tel:${userData?.doctor?.[0]?.doctorphone}`}
                  className="flex items-center justify-center p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  <PhoneCall size={18} />
                </a>
              </div>
            </div>

            {/* Next Reminder */}
            {/* <div className="premium-card p-5">
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Next Reminder</h3>
              {activeReminders.length > 0 ? (
                <div>
                  <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-2.5 shadow-sm">
                      <Clock size={18} className="text-primary-500" />
                    </div>
                    <div>
                      <p className="text-base font-black text-gray-900 dark:text-white">{activeReminders[0].time}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{activeReminders[0].title}</p>
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-xl transition-all active:scale-95"
                    onClick={() => handleMarkDone(activeReminders[0]._id)}
                  >
                    Got It ✓
                  </button>
                  {activeReminders.length > 1 && (
                    <p className="text-center text-xs text-gray-400 mt-2">
                      +{activeReminders.length - 1} more reminder{activeReminders.length > 2 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm text-gray-400 font-medium">All done for today!</p>
                </div>
              )}
            </div> */}

            {/* All Reminders */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Remind Me</h3>
                <select
                  className="text-sm text-blue-600 bg-transparent border-none focus:outline-none cursor-pointer font-semibold"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-4">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {activeReminders.map(r => (
                  <ReminderItem key={r._id} reminder={r} onEdit={() => setEditingReminder(r)} onMarkDone={handleMarkDone} />
                ))}
                {completedReminders.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-400 mb-2 px-2">Completed</p>
                    {completedReminders.map(r => (
                      <ReminderItem key={r._id} reminder={r} onEdit={() => setEditingReminder(r)} isCompleted />
                    ))}
                  </div>
                )}
                {filteredReminders.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4 italic">No reminders scheduled</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reminder Modal */}
      {editingReminder && (
        <EditReminderModal
          reminder={editingReminder}
          onClose={() => setEditingReminder(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

// Updated ReminderItem component
const ReminderItem = ({ reminder, onEdit, onMarkDone, isCompleted }) => {
  const dateStr = new Date(reminder.date).toLocaleDateString("en-GB");
  return (
    <div
      className={`p-4 rounded-xl transition-colors mb-2 ${isCompleted ? "bg-slate-50/50 dark:bg-slate-800/50 opacity-70" : "bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"}`}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg flex-shrink-0 border border-blue-100 dark:border-blue-800/30">
          <ClipboardList
            size={18}
            className="text-blue-600 dark:text-blue-400"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
            {reminder.title}
          </p>
          {reminder.text && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
              {reminder.text}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Clock size={14} className="text-slate-400" />
            <p className="text-sm font-medium text-slate-500">
              {dateStr} • {reminder.time}
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="text-primary-500 dark:text-primary-400 font-bold text-[10px] uppercase tracking-widest hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors"
          onClick={() => onEdit && onEdit(reminder)}
        >
          Edit
        </button>
        {!isCompleted && (
          <button
            className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg transition-all shadow-sm shadow-green-200 dark:shadow-none"
            onClick={() => onMarkDone && onMarkDone(reminder._id)}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

// Edit Reminder Modal Component
const EditReminderModal = ({ reminder, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: reminder.title || "",
    text: reminder.text || "",
    date: new Date(reminder.date).toISOString().split("T")[0],
    time: reminder.time || "",
    isRecurring: reminder.isRecurring || false,
  });

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-10 w-full max-w-md shadow-2xl space-y-8 fade-in h-auto border border-transparent dark:border-gray-800/50">
        <div className="space-y-2">
          <h2 className="text-3xl font-black dark:text-white tracking-tight">
            Edit <span className="text-primary-500">Reminder</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Update your recovery task details here.
          </p>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
              Task Title
            </label>
            <input
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all font-bold placeholder:text-gray-300"
              placeholder="e.g., Morning Hand Exercise"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
              Description (Optional)
            </label>
            <textarea
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all font-medium placeholder:text-gray-300"
              placeholder="Additional details..."
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                Date
              </label>
              <input
                type="date"
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all font-bold"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                Time
              </label>
              <input
                type="time"
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-4 focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all font-bold"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl cursor-pointer group hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors">
            <input
              type="checkbox"
              className="w-5 h-5 rounded-lg border-none bg-gray-200 dark:bg-gray-700 text-primary-500 focus:ring-primary-500/20"
              checked={form.isRecurring}
              onChange={(e) =>
                setForm({ ...form, isRecurring: e.target.checked })
              }
            />
            <span className="text-sm font-bold dark:text-gray-300">
              Set as Reappearing Task
            </span>
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:shadow-xl hover:shadow-primary-100 dark:hover:shadow-none transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. TopBar Component ---
const TopBar = ({
  activeSection,
  isDarkMode,
  toggleDarkMode,
  handleLogout,
}) => (
  <div className="flex justify-between items-center py-8">
    <div className="flex items-center gap-2">
      <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
      <h2 className="text-2xl font-black dark:text-white tracking-widest uppercase">
        {activeSection}
      </h2>
    </div>

    <div className="flex items-center gap-4">
      {/* <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Global search..."
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-white pl-12 pr-6 py-3 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-primary-500/10 transition-all outline-none w-64 placeholder:text-gray-400"
        />
      </div> */}

      <DarkModeToggle isDarkMode={isDarkMode} setIsDarkMode={toggleDarkMode} />

      <button className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-primary-500/50 transition-all shadow-sm relative">
        <Bell size={20} />
        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all ml-2"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  </div>
);

// Functional component for Medical Records
const RecordContent = ({ userData, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const records = [
    {
      id: 1,
      title: "Health Assessment",
      date: "2026-03-24",
      type: "Routine",
      status: "Completed",
      result: "Healthy",
      doctor: "Dr. Sarah Wilson",
    },
    {
      id: 2,
      title: "MRI Scan",
      date: "2026-03-20",
      type: "Imaging",
      status: "Completed",
      result: "Normal",
      doctor: "Dr. Michael Chen",
    },
    {
      id: 3,
      title: "Blood Test",
      date: "2026-03-15",
      type: "Laboratory",
      status: "Completed",
      result: "Standard Range",
      doctor: "Dr. Sarah Wilson",
    },
    {
      id: 4,
      title: "General Checkup",
      date: "2026-03-10",
      type: "Consultation",
      status: "Completed",
      result: "Follow-up in 3 months",
      doctor: "Dr. Robert Brown",
    },
  ];

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getRecordIcon = (type) => {
    switch (type) {
      case "Imaging":
        return <Activity size={20} />;
      case "Laboratory":
        return <Award size={20} />;
      case "Consultation":
        return <MessageSquare size={20} />;
      case "Routine":
        return <ShieldCheck size={20} />;
      default:
        return <FileText size={20} />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 fade-in pb-20">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-10 shadow-xl border border-transparent dark:border-gray-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black dark:text-white tracking-tight">
              Clinical <span className="text-primary-500">History</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
              View and manage your rehabilitation diagnostic history
            </p>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors size-5" />
            <input
              type="text"
              placeholder="Search records..."
              className="pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl focus:ring-4 focus:ring-primary-500/10 outline-none w-full md:w-80 dark:text-gray-200 shadow-inner transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="p-6 rounded-[2rem] bg-gray-50/50 dark:bg-gray-800/20 border border-transparent dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center text-primary-500 shadow-sm group-hover:scale-110 transition-transform">
                  {getRecordIcon(record.type)}
                </div>
                <div>
                  <h3 className="text-lg font-black dark:text-white tracking-tight uppercase">
                    {record.title}
                  </h3>
                  <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} /> {record.date}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                      {record.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden lg:block text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Doctor
                  </p>
                  <p className="text-sm font-bold dark:text-gray-200">
                    {record.doctor}
                  </p>
                </div>
                <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-100 dark:border-green-900/30">
                  {record.status}
                </div>
                <button className="p-3.5 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 rounded-xl hover:text-primary-500 dark:hover:text-primary-400 shadow-sm border border-transparent dark:border-gray-800 transition-all">
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="text-center py-20 bg-slate-50/30 dark:bg-slate-800/10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500 font-semibold text-lg">
                No clinical records found matching your search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Functional component for Calendar
const CalendarContent = ({ isDarkMode, reminders, userData }) => {
  const [view, setView] = useState("Month"); // 'Today', 'Week', 'Month'
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrev = () => {
    if (view === "Month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      );
    } else if (view === "Week") {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(currentDate.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(currentDate.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  const handleNext = () => {
    if (view === "Month") {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      );
    } else if (view === "Week") {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(currentDate.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(currentDate.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock events for visualization
  // Combined real reminders and mock appointments for calendar
  const allEvents = useMemo(() => {
    const reminderEvents = reminders.map((r) => ({
      id: `rem-${r._id}`,
      title: r.title,
      // reminders from backend have 'date' field
      date: r.date ? new Date(r.date).toISOString().split("T")[0] : "",
      type: "Reminder",
      time: r.time || "--:--",
      status: r.status,
      // For doctor field in calendar
      doctor: r.isRecurring
        ? "System"
        : userData?.doctor?.[0]?.doctorName || "Clinical Team",
    }));

    const mockAppointments = [
      {
        id: "app-1",
        title: "Checkup",
        date: "2026-03-25",
        type: "Appointment",
        time: "10:00 AM",
        doctor: userData?.doctor?.[0]?.doctorName || "Dr. Sarah Wilson",
      },
      {
        id: "app-2",
        title: "Lab Test",
        date: "2026-03-28",
        type: "Appointment",
        time: "09:00 AM",
        doctor: "Lab Specialist",
      },
    ];

    return [...reminderEvents, ...mockAppointments];
  }, [reminders, userData]);

  const getDayEvents = (date) => {
    const dStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
    return allEvents.filter((e) => {
      if (!e.date) return false;
      const eDateStr = new Date(e.date).toLocaleDateString("en-CA");
      return eDateStr === dStr;
    });
  };

  const renderTodayView = () => {
    const dayEvents = getDayEvents(currentDate);
    return (
      <div className="p-8 space-y-6 min-h-[500px]">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-primary-200 dark:shadow-none">
            <span className="text-xs font-bold uppercase tracking-widest">
              {dayNames[currentDate.getDay()]}
            </span>
            <span className="text-2xl font-black">{currentDate.getDate()}</span>
          </div>
          <div>
            <h3 className="text-2xl font-black dark:text-white">
              Daily Schedule
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              You have {dayEvents.length} events today
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {dayEvents.length > 0 ? (
            dayEvents.map((e) => (
              <div
                key={e.id}
                className="premium-card p-6 flex items-center justify-between group hover:border-primary-400 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                    <Clock className="text-primary-500" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-primary-500 uppercase tracking-widest mb-1">
                      {e.time}
                    </p>
                    <h4 className="text-lg font-bold dark:text-white">
                      {e.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {e.doctor}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${e.type === "Appointment" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}
                >
                  {e.type}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/20 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-bold">
                No events scheduled for today
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayEvents = getDayEvents(day);
      const isToday = new Date().toDateString() === day.toDateString();

      weekDays.push(
        <div
          key={i}
          className={`flex-1 min-h-[500px] border-r dark:border-gray-800 last:border-r-0 ${isToday ? "bg-blue-50/20 dark:bg-blue-900/5" : ""}`}
        >
          <div
            className={`p-4 text-center border-b dark:border-gray-800 ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
          >
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${isToday ? "text-blue-600" : "text-gray-400"}`}
            >
              {dayNames[i]}
            </p>
            <p
              className={`text-2xl font-black mt-1 ${isToday ? "text-blue-600" : "dark:text-white"}`}
            >
              {day.getDate()}
            </p>
          </div>
          <div className="p-2 space-y-2">
            {dayEvents.map((e) => (
              <div
                key={e.id}
                className={`p-3 rounded-xl border text-[10px] font-bold ${e.type === "Appointment" ? "bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"}`}
              >
                <p className="uppercase tracking-tighter opacity-70 mb-1">
                  {e.time}
                </p>
                <p className="line-clamp-2">{e.title}</p>
              </div>
            ))}
          </div>
        </div>,
      );
    }
    return <div className="flex">{weekDays}</div>;
  };

  const renderMonthView = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startOffset = firstDayOfMonth(currentDate);
    const prevMonthLastDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    ).getDate();

    for (let i = startOffset - 1; i >= 0; i--) {
      days.push(
        <div
          key={`prev-${i}`}
          className="h-32 border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10 p-2 opacity-30"
        >
          <span className="text-sm font-bold text-gray-400">
            {prevMonthLastDate - i}
          </span>
        </div>,
      );
    }

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        d,
      );
      const dayEvents = getDayEvents(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={d}
          className={`h-32 border dark:border-gray-800 p-2 transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/5 group ${isToday ? "bg-blue-50/30 dark:bg-blue-900/5" : "bg-white dark:bg-gray-900"}`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isToday ? "bg-primary-500 text-white shadow-lg shadow-primary-100" : "text-gray-700 dark:text-gray-300 group-hover:text-primary-500"}`}
            >
              {d}
            </span>
          </div>
          <div className="mt-2 space-y-1 overflow-y-auto max-h-[70px] custom-scrollbar">
            {dayEvents.map((e) => (
              <div
                key={e.id}
                className={`text-[9px] p-1.5 rounded-lg border font-bold truncate ${e.type === "Appointment" ? "bg-green-50 border-green-100 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" : "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"}`}
              >
                {e.title}
              </div>
            ))}
          </div>
        </div>,
      );
    }
    return days;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl shadow-gray-100 dark:shadow-none border border-transparent dark:border-gray-800/50">
        <div>
          <h1 className="text-4xl font-black dark:text-white tracking-tight">
            Health <span className="text-primary-500">Calendar</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Keep track of your rehabilitation journey and appointments.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border dark:border-gray-700/50">
            {["Today", "Week", "Month"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === v ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="bg-primary-500 text-white p-3 rounded-2xl hover:bg-primary-600 transition-all shadow-lg shadow-primary-100 dark:shadow-none">
            <Plus size={24} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl shadow-gray-100 dark:shadow-none border border-transparent dark:border-gray-800/50 overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
          <h2 className="text-2xl font-black dark:text-white tracking-tight">
            {view === "Month"
              ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : view === "Week"
                ? `Week of ${currentDate.getDate()} ${monthNames[currentDate.getMonth()]}`
                : `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrev}
              className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-2xl dark:text-gray-300 transition-all shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-6 py-2.5 text-xs font-black dark:text-primary-400 uppercase tracking-widest bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl hover:shadow-md transition-all"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-3 hover:bg-white dark:hover:bg-gray-700 rounded-2xl dark:text-gray-300 transition-all shadow-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div>
          {view === "Month" ? (
            <div className="grid grid-cols-7 border-collapse">
              {dayNames.map((d) => (
                <div
                  key={d}
                  className="p-5 text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border-b border-r dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10"
                >
                  {d}
                </div>
              ))}
              {renderMonthView()}
            </div>
          ) : view === "Week" ? (
            renderWeekView()
          ) : (
            renderTodayView()
          )}
        </div>
      </div>
    </div>
  );
};

// Updated SettingsContent with a premium dark mode layout
const SettingsContent = ({ isDarkMode }) => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 fade-in pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-black dark:text-white tracking-tight">
          Account <span className="text-primary-500">Settings</span>
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
          Manage your profile, security, and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="premium-card p-10 space-y-10">
          {/* Profile Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-black dark:text-white uppercase tracking-wider flex items-center gap-3">
              <User className="text-primary-500" />
              Personal Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Full Name
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl dark:text-white font-bold border border-transparent dark:border-gray-700/50">
                  Alex Johnson
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">
                  Email Address
                </label>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl dark:text-white font-bold border border-transparent dark:border-gray-700/50">
                  alex.johnson@example.com
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          {/* Preferences Section */}
          <section className="space-y-8">
            <h2 className="text-xl font-black dark:text-white uppercase tracking-wider flex items-center gap-3">
              <Settings className="text-primary-500" />
              General Preferences
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-transparent dark:border-gray-700/50">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl text-primary-500 shadow-sm">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold dark:text-white">
                      Push Notifications
                    </h4>
                    <p className="text-sm text-gray-400 font-medium">
                      Receive alerts for game reminders and appointments.
                    </p>
                  </div>
                </div>
                <div className="w-14 h-8 bg-primary-500 rounded-full flex items-center px-1 cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-full shadow-md ml-auto" />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 rounded-[2rem] border border-transparent dark:border-gray-700/50">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl text-secondary-500 shadow-sm">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold dark:text-white">
                      Privacy Mode
                    </h4>
                    <p className="text-sm text-gray-400 font-medium">
                      Hide sensitive clinical data from the dashboard.
                    </p>
                  </div>
                </div>
                <div className="w-14 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center px-1 cursor-pointer">
                  <div className="w-6 h-6 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>
          </section>

          <button className="w-full py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:shadow-primary-500/20 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl">
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Overhauled HelpCenterContent with premium design and dark mode support
const HelpCenterContent = ({ isDarkMode }) => (
  <div className="p-6 max-w-5xl mx-auto space-y-12 fade-in pb-20">
    {/* Hero Section */}
    <div className="text-center space-y-4">
      <h1 className="text-4xl md:text-5xl font-black dark:text-white tracking-tight">
        How can we <span className="text-primary-500">help you?</span>
      </h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium">
        Find answers to common questions and learn how to get the most out of
        your rehabilitation journey.
      </p>
    </div>

    {/* Category Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="premium-card p-8 group hover:border-primary-400 transition-all cursor-pointer">
        <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 group-hover:scale-110 transition-transform">
          <BookOpen size={28} />
        </div>
        <h3 className="text-xl font-bold dark:text-white mb-2">
          Getting Started
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          New to the platform? Learn the basics of your dashboard and how to
          start your first session.
        </p>
      </div>

      <div className="premium-card p-8 group hover:border-secondary-400 transition-all cursor-pointer">
        <div className="w-14 h-14 bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl flex items-center justify-center text-secondary-600 dark:text-secondary-400 mb-6 group-hover:scale-110 transition-transform">
          <Activity size={28} />
        </div>
        <h3 className="text-xl font-bold dark:text-white mb-2">Game Guides</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Detailed instructions on how to play each game and how they help your
          physical recovery.
        </p>
      </div>

      <div className="premium-card p-8 group hover:border-blue-400 transition-all cursor-pointer">
        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
          <ShieldCheck size={28} />
        </div>
        <h3 className="text-xl font-bold dark:text-white mb-2">
          Privacy & Security
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          Understand how we protect your clinical data and maintain your privacy
          at all times.
        </p>
      </div>
    </div>

    {/* FAQ Section */}
    <div className="space-y-6">
      <h2 className="text-2xl font-black dark:text-white uppercase tracking-wider flex items-center gap-3">
        <HelpCircle className="text-primary-500" />
        Popular Questions
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {[
          {
            q: "How do I reset my password?",
            a: "Navigate to Settings > Security and click on 'Change Password'. You'll receive an email with instructions.",
          },
          {
            q: "How is my progress tracked?",
            a: "Our system records every game session, tracking accuracy, range of motion, and consistency to build your recovery profile.",
          },
          {
            q: "What hardware do I need?",
            a: "Most games only require a standard webcam. Some advanced modules might benefit from specific sensors like Leap Motion.",
          },
          {
            q: "Can my doctor see my results?",
            a: "Yes, your assigned clinical team has real-time access to your progress reports to adjust your therapy as needed.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="premium-card p-6 border-l-4 border-l-primary-500 dark:border-l-primary-600"
          >
            <h4 className="font-bold dark:text-white text-lg mb-2">{item.q}</h4>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Support CTA */}
    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-[2rem] p-10 text-center text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>
      <div className="relative z-10 space-y-6">
        <h2 className="text-3xl font-black tracking-tight">
          Still have questions?
        </h2>
        <p className="text-primary-50 max-w-xl mx-auto font-medium">
          Our dedicated support team is available 24/7 to help you with any
          technical or clinical platform issues.
        </p>
        <button className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-xl transition-all hover:scale-105 active:scale-95">
          Contact Support
        </button>
      </div>
    </div>
  </div>
);

const InfoCard = ({ title, content, onChange }) => (
  <div className="premium-card p-6 relative">
    <div className="flex justify-between items-center mb-4">
      <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        {title}
      </p>
      {onChange && (
        <div
          className="flex items-center gap-1.5 cursor-pointer text-[#2B91D4] hover:text-blue-600 transition-colors"
          onClick={onChange}
        >
          <Edit3 size={12} />
          <p className="font-bold text-xs uppercase">Edit</p>
        </div>
      )}
    </div>
    <div className="dark:text-gray-200">{content}</div>
  </div>
);

// Doctor selection modal component
const DoctorModal = ({ doctors, onClose, onSelect }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 fade-in px-4">
    <div className="bg-white dark:bg-gray-900 rounded-xl p-8 w-full max-w-md shadow-2xl border dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white capitalize">
          Select Your Doctor
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
        >
          <ChevronRight size={24} className="rotate-90" />
        </button>
      </div>
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar border-b dark:border-gray-800 mb-6">
        {doctors.map((doc, idx) => (
          <div
            key={idx}
            className="p-4 cursor-pointer border dark:border-gray-800 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
            onClick={() => onSelect(doc)}
          >
            <p className="font-bold text-lg dark:text-white group-hover:text-blue-600 transition-colors capitalize">
              {doc.doctorName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase font-medium tracking-wider">
              {doc.doctorDegree}
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors uppercase shadow-sm"
      >
        Close
      </button>
    </div>
  </div>
);
