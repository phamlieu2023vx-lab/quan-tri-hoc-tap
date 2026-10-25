import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { RightColumn } from './components/RightColumn.tsx';
import { BottomQuickAccess } from './components/BottomQuickAccess.tsx';

// Views
import { DashboardView } from './views/DashboardView.tsx';
import { StudentsView } from './views/StudentsView.tsx';
import { ImportCsvView } from './views/ImportCsvView.tsx';
import { StudentProfileView } from './views/StudentProfileView.tsx';
import { AttendanceView } from './views/AttendanceView.tsx';
import { VietnameseView } from './views/VietnameseView.tsx';
import { MathView } from './views/MathView.tsx';
import { AssignmentsView } from './views/AssignmentsView.tsx';
import { LessonsView } from './views/LessonsView.tsx';
import { AiAssistantView } from './views/AiAssistantView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { SettingsView } from './views/SettingsView.tsx';

// Storage & Types
import { storage, getTodayDateString } from './services/storage.ts';
import {
  Student,
  AttendanceRecord,
  AssessmentRecord,
  Assignment,
  Lesson,
  ActivityLog,
  ClassSettings,
  Criteria,
  ActiveNavTab,
} from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('hs-1');
  const [makeupStudentName, setMakeupStudentName] = useState<string>('');
  const [makeupMissedDate, setMakeupMissedDate] = useState<string>('');

  // Storage states
  const [settings, setSettings] = useState<ClassSettings>(storage.getSettings());
  const [students, setStudents] = useState<Student[]>(storage.getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(storage.getAttendance());
  const [assessments, setAssessments] = useState<AssessmentRecord[]>(storage.getAssessments());
  const [assignments, setAssignments] = useState<Assignment[]>(storage.getAssignments());
  const [lessons, setLessons] = useState<Lesson[]>(storage.getLessons());
  const [activities, setActivities] = useState<ActivityLog[]>(storage.getActivities());
  const [criteria, setCriteria] = useState<Criteria[]>(storage.getCriteria());

  // Subscribe to storage changes for reactive state sync & fetch remote students on mount
  useEffect(() => {
    const reloadAll = () => {
      setSettings(storage.getSettings());
      setStudents(storage.getStudents());
      setAttendance(storage.getAttendance());
      setAssessments(storage.getAssessments());
      setAssignments(storage.getAssignments());
      setLessons(storage.getLessons());
      setActivities(storage.getActivities());
      setCriteria(storage.getCriteria());
    };

    const unsubscribe = storage.subscribe('*', reloadAll);

    // Explicitly sync remote (Supabase cloud & server DB) on mount so another browser gets latest data immediately
    storage.syncRemoteStudents().then(synced => {
      if (synced && synced.length > 0) {
        setStudents(synced);
      }
      reloadAll();
    });

    return () => unsubscribe();
  }, []);

  // Today's attendance calculation
  const today = getTodayDateString();
  const attendanceToday = attendance.filter(a => a.date === today);

  // Selected student
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Vietnamese & Math quick stats for Right Column
  const vnAssessed = assessments.filter(a => a.subject === 'vietnamese').length;
  const vnNeedsSupport = assessments.filter(a => a.subject === 'vietnamese' && (a.rating === 'C' || a.needsReinforcement)).length;
  const mathAssessed = assessments.filter(a => a.subject === 'math').length;
  const mathNeedsSupport = assessments.filter(a => a.subject === 'math' && (a.rating === 'C' || a.needsReinforcement)).length;

  // Handle Export Backup JSON
  const handleExportBackup = () => {
    const json = storage.exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_luu_LearnBridge_Lop_${settings.className}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync fontMode ('serif' vs 'sans') to body class
  useEffect(() => {
    if (settings.fontMode === 'sans') {
      document.body.classList.add('font-sans-mode');
    } else {
      document.body.classList.remove('font-sans-mode');
    }
  }, [settings.fontMode]);

  const handleToggleFontMode = () => {
    const nextMode = settings.fontMode === 'sans' ? 'serif' : 'sans';
    const updated = { ...settings, fontMode: nextMode as 'serif' | 'sans' };
    storage.saveSettings(updated);
    setSettings(updated);
  };

  // Handle trigger makeup request from Attendance to AI Assistant
  const handleTriggerMakeup = (studentName: string, date: string) => {
    setMakeupStudentName(studentName);
    setMakeupMissedDate(date);
    setActiveTab('ai_assistant');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFF] flex flex-col font-serif text-[#17365D]">
      {/* 1. Header */}
      <Header
        settings={settings}
        onNavigate={tab => setActiveTab(tab as ActiveNavTab)}
        onExportBackup={handleExportBackup}
        onToggleFontMode={handleToggleFontMode}
        onOpenSupabase={() => setActiveTab('settings')}
      />

      {/* 2. Main Workspace Body: Sidebar + Main Content Area + Right Info Column */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={tab => setActiveTab(tab)}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 w-full min-w-0 space-y-4">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              settings={settings}
              attendanceToday={attendanceToday}
              onNavigate={tab => setActiveTab(tab)}
              onSelectStudent={id => setSelectedStudentId(id)}
            />
          )}

          {/* Students Management Views */}
          {activeTab === 'students' && (
            <StudentsView
              activeTab={activeTab}
              students={students}
              onNavigate={tab => setActiveTab(tab)}
              onSelectStudent={id => setSelectedStudentId(id)}
            />
          )}

          {activeTab === 'students_add' && (
            <StudentsView
              activeTab={activeTab}
              students={students}
              onNavigate={tab => setActiveTab(tab)}
              onSelectStudent={id => setSelectedStudentId(id)}
            />
          )}

          {activeTab === 'students_import' && (
            <ImportCsvView
              existingStudents={students}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'student_profile' && (
            <StudentProfileView
              student={currentStudent}
              students={students}
              attendance={attendance}
              assessments={assessments}
              assignments={assignments}
              onSelectStudent={id => setSelectedStudentId(id)}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {/* Attendance Views */}
          {(activeTab === 'attendance' ||
            activeTab === 'attendance_history' ||
            activeTab === 'attendance_absent') && (
            <AttendanceView
              activeTab={activeTab}
              students={students}
              onNavigate={tab => setActiveTab(tab)}
              onMakeUpRequest={handleTriggerMakeup}
            />
          )}

          {/* Vietnamese Assessment Views */}
          {(activeTab === 'vietnamese_summary' ||
            activeTab === 'vietnamese_entry' ||
            activeTab === 'vietnamese_criteria' ||
            activeTab === 'vietnamese_support') && (
            <VietnameseView
              activeTab={activeTab}
              students={students}
              assessments={assessments}
              criteria={criteria}
              onNavigate={tab => setActiveTab(tab)}
              onSelectStudent={id => setSelectedStudentId(id)}
            />
          )}

          {/* Math Assessment Views */}
          {(activeTab === 'math_summary' ||
            activeTab === 'math_entry' ||
            activeTab === 'math_criteria' ||
            activeTab === 'math_support') && (
            <MathView
              activeTab={activeTab}
              students={students}
              assessments={assessments}
              criteria={criteria}
              onNavigate={tab => setActiveTab(tab)}
              onSelectStudent={id => setSelectedStudentId(id)}
            />
          )}

          {/* Assignments Views */}
          {(activeTab === 'assignments' || activeTab === 'assignments_create') && (
            <AssignmentsView
              activeTab={activeTab}
              students={students}
              assignments={assignments}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {/* Lessons Plan Views */}
          {activeTab === 'lessons' && (
            <LessonsView
              lessons={lessons}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {/* AI Assistant Views */}
          {activeTab === 'ai_assistant' && (
            <AiAssistantView
              students={students}
              initialStudentName={makeupStudentName}
              initialMissedDate={makeupMissedDate}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {/* Reports Views */}
          {activeTab === 'reports' && (
            <ReportsView
              students={students}
              attendance={attendance}
              assessments={assessments}
              assignments={assignments}
              settings={settings}
              criteria={criteria}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {/* Settings Views */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onNavigate={tab => setActiveTab(tab)}
            />
          )}

          {/* Bottom Quick Access Bar */}
          <BottomQuickAccess onNavigate={tab => setActiveTab(tab)} />
        </main>

        {/* Right Info Column (Dynamically displays functions of active module) */}
        <RightColumn
          activeTab={activeTab}
          settings={settings}
          activities={activities}
          onNavigate={tab => setActiveTab(tab)}
          students={students}
          attendance={attendance}
          assessments={assessments}
          assignments={assignments}
          lessons={lessons}
          actualTotalStudents={students.length}
          vietnameseStats={{ assessed: vnAssessed, needsSupport: vnNeedsSupport }}
          mathStats={{ assessed: mathAssessed, needsSupport: mathNeedsSupport }}
          onExportBackup={handleExportBackup}
          onToggleFontMode={handleToggleFontMode}
          onTriggerMakeup={handleTriggerMakeup}
        />
      </div>
    </div>
  );
}
