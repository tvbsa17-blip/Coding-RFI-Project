import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Priority } from '../types';
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Layers,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';

type TimeScale = 'day' | 'week' | 'month';
type GroupBy = 'column' | 'assignee' | 'none';

// Fixed anchor current date (matching system context: 2026-09-10)
const TODAY_STR = '2026-09-10';

export const GanttChart: React.FC = () => {
  const {
    tasks,
    columns,
    users,
    setSelectedTaskId,
    setIsCreateTaskOpen,
    canEditBoard,
    updateTask,
  } = useApp();

  // View state
  const [timeScale, setTimeScale] = useState<TimeScale>('day');
  const [groupBy, setGroupBy] = useState<GroupBy>('column');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumnFilter, setSelectedColumnFilter] = useState('ALL');
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState('ALL');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('ALL');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // View Date Offset (default centered around 2026-08-25)
  const [viewDate, setViewDate] = useState<Date>(() => new Date('2026-08-25T00:00:00'));

  // Left sidebar collapse toggle
  const [showLeftTable, setShowLeftTable] = useState(true);

  // Timeline container ref for horizontal scrolling
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Day column widths based on scale
  const colWidth = useMemo(() => {
    switch (timeScale) {
      case 'day':
        return 44; // 44px per day
      case 'week':
        return 110; // 110px per week
      case 'month':
        return 180; // 180px per month
    }
  }, [timeScale]);

  // Number of time slots to display
  const numSlots = useMemo(() => {
    switch (timeScale) {
      case 'day':
        return 45; // 45 days span
      case 'week':
        return 16; // 16 weeks span (~4 months)
      case 'month':
        return 12; // 12 months span (1 year)
    }
  }, [timeScale]);

  // Generate slots array
  const slots = useMemo(() => {
    const list: {
      date: Date;
      key: string;
      label: string;
      subLabel?: string;
      isWeekend?: boolean;
      isToday?: boolean;
    }[] = [];

    const base = new Date(viewDate);
    base.setHours(0, 0, 0, 0);

    const today = new Date(TODAY_STR + 'T00:00:00');

    for (let i = 0; i < numSlots; i++) {
      const d = new Date(base);

      if (timeScale === 'day') {
        d.setDate(base.getDate() + i);
        const dayOfWeek = d.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isToday = d.toISOString().split('T')[0] === TODAY_STR;
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

        list.push({
          date: d,
          key: d.toISOString().split('T')[0],
          label: `${d.getDate()}`,
          subLabel: dayNames[dayOfWeek],
          isWeekend,
          isToday,
        });
      } else if (timeScale === 'week') {
        d.setDate(base.getDate() + i * 7);
        const endW = new Date(d);
        endW.setDate(d.getDate() + 6);
        const isToday = today >= d && today <= endW;

        list.push({
          date: d,
          key: `w-${d.toISOString().split('T')[0]}`,
          label: `W${Math.ceil(d.getDate() / 7)}`,
          subLabel: `${d.getMonth() + 1}/${d.getDate()}`,
          isToday,
        });
      } else if (timeScale === 'month') {
        d.setMonth(base.getMonth() + i);
        const isToday =
          today.getFullYear() === d.getFullYear() && today.getMonth() === d.getMonth();

        list.push({
          date: d,
          key: `m-${d.getFullYear()}-${d.getMonth() + 1}`,
          label: `${d.getMonth() + 1}月`,
          subLabel: `${d.getFullYear()}`,
          isToday,
        });
      }
    }
    return list;
  }, [viewDate, timeScale, numSlots]);

  // Range start and end for coordinate computations
  const rangeStart = useMemo(() => {
    return slots[0] ? new Date(slots[0].date) : new Date();
  }, [slots]);

  const rangeEnd = useMemo(() => {
    if (slots.length === 0) return new Date();
    const last = new Date(slots[slots.length - 1].date);
    if (timeScale === 'day') last.setDate(last.getDate() + 1);
    else if (timeScale === 'week') last.setDate(last.getDate() + 7);
    else if (timeScale === 'month') last.setMonth(last.getMonth() + 1);
    return last;
  }, [slots, timeScale]);

  // Grouped header labels (e.g. Month headers for day scale)
  const monthGroups = useMemo(() => {
    const groups: { label: string; count: number }[] = [];
    if (slots.length === 0) return groups;

    let curLabel = '';
    let curCount = 0;

    slots.forEach(slot => {
      const mLabel =
        timeScale === 'day' || timeScale === 'week'
          ? `${slot.date.getFullYear()}.${String(slot.date.getMonth() + 1).padStart(2, '0')}`
          : `${slot.date.getFullYear()}`;

      if (mLabel !== curLabel) {
        if (curCount > 0) {
          groups.push({ label: curLabel, count: curCount });
        }
        curLabel = mLabel;
        curCount = 1;
      } else {
        curCount++;
      }
    });

    if (curCount > 0) {
      groups.push({ label: curLabel, count: curCount });
    }
    return groups;
  }, [slots, timeScale]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(term);
        const matchDesc = task.description?.toLowerCase().includes(term);
        const matchTags = task.tags?.some(t => t.toLowerCase().includes(term));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      // Column
      if (selectedColumnFilter !== 'ALL' && task.columnId !== selectedColumnFilter) {
        return false;
      }

      // Assignee
      if (selectedAssigneeFilter !== 'ALL') {
        if (selectedAssigneeFilter === 'UNASSIGNED') {
          if (task.assigneeId) return false;
        } else if (
          task.assigneeId !== selectedAssigneeFilter &&
          !task.coAssigneeIds?.includes(selectedAssigneeFilter)
        ) {
          return false;
        }
      }

      // Priority
      if (selectedPriorityFilter !== 'ALL' && task.priority !== selectedPriorityFilter) {
        return false;
      }

      // Overdue only
      if (showOverdueOnly) {
        const doneCol = columns.find(c => c.title.includes('Done') || c.title.includes('完成'));
        const isDone = doneCol ? task.columnId === doneCol.id : false;
        const isOverdue = !isDone && task.dueDate && task.dueDate < TODAY_STR;
        if (!isOverdue) return false;
      }

      return true;
    });
  }, [
    tasks,
    searchTerm,
    selectedColumnFilter,
    selectedAssigneeFilter,
    selectedPriorityFilter,
    showOverdueOnly,
    columns,
  ]);

  // Grouped task list
  const groupedTasks = useMemo(() => {
    if (groupBy === 'column') {
      return columns
        .sort((a, b) => a.order - b.order)
        .map(col => ({
          id: col.id,
          title: col.title,
          tasks: filteredTasks.filter(t => t.columnId === col.id),
        }))
        .filter(g => g.tasks.length > 0 || selectedColumnFilter === 'ALL');
    } else if (groupBy === 'assignee') {
      const list: { id: string; title: string; avatarUrl?: string; tasks: Task[] }[] = [];
      users.forEach(u => {
        const userTasks = filteredTasks.filter(
          t => t.assigneeId === u.id || t.coAssigneeIds?.includes(u.id)
        );
        if (userTasks.length > 0) {
          list.push({
            id: u.id,
            title: `${u.name} [${u.role}]`,
            avatarUrl: u.avatarUrl,
            tasks: userTasks,
          });
        }
      });
      const unassigned = filteredTasks.filter(t => !t.assigneeId);
      if (unassigned.length > 0) {
        list.push({
          id: 'unassigned',
          title: 'UNASSIGNED // 未指派',
          tasks: unassigned,
        });
      }
      return list;
    } else {
      return [
        {
          id: 'all',
          title: 'ALL TASKS // 全部排程',
          tasks: filteredTasks,
        },
      ];
    }
  }, [groupBy, columns, users, filteredTasks, selectedColumnFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const withDates = tasks.filter(t => t.startDate || t.dueDate).length;
    const doneCol = columns.find(c => c.title.includes('Done') || c.title.includes('完成'));
    const doneCount = doneCol ? tasks.filter(t => t.columnId === doneCol.id).length : 0;
    const inProgressCol = columns.find(
      c => c.title.includes('Progress') || c.title.includes('進行')
    );
    const inProgressCount = inProgressCol
      ? tasks.filter(t => t.columnId === inProgressCol.id).length
      : 0;

    const overdueCount = tasks.filter(t => {
      const isDone = doneCol ? t.columnId === doneCol.id : false;
      return !isDone && t.dueDate && t.dueDate < TODAY_STR;
    }).length;

    const totalEstHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const totalActHours = tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0);
    const hourCompletionPercent =
      totalEstHours > 0 ? Math.min(100, Math.round((totalActHours / totalEstHours) * 100)) : 0;

    return {
      total,
      withDates,
      doneCount,
      inProgressCount,
      overdueCount,
      totalEstHours,
      totalActHours,
      hourCompletionPercent,
    };
  }, [tasks, columns]);

  // Today marker X position in timeline
  const todayPositionX = useMemo(() => {
    const today = new Date(TODAY_STR + 'T00:00:00');
    const startMs = rangeStart.getTime();
    const endMs = rangeEnd.getTime();
    const todayMs = today.getTime();

    if (todayMs < startMs || todayMs > endMs) return null;

    const totalPx = slots.length * colWidth;
    const ratio = (todayMs - startMs) / (endMs - startMs);
    return ratio * totalPx;
  }, [rangeStart, rangeEnd, slots.length, colWidth]);

  // Scroll to today marker
  const scrollToToday = () => {
    setViewDate(new Date('2026-08-26T00:00:00'));
    setTimeout(() => {
      if (timelineScrollRef.current) {
        timelineScrollRef.current.scrollTo({
          left: 450,
          behavior: 'smooth',
        });
      }
    }, 50);
  };

  useEffect(() => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollLeft = 320;
    }
  }, []);

  const handleNav = (dir: 'prev' | 'next') => {
    setViewDate(prev => {
      const d = new Date(prev);
      const step = timeScale === 'day' ? 14 : timeScale === 'week' ? 42 : 120;
      d.setDate(d.getDate() + (dir === 'prev' ? -step : step));
      return d;
    });
  };

  const toggleGroupCollapse = (id: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper to compute task bar coordinates
  const computeBarCoords = (task: Task) => {
    let sStr = task.startDate;
    let dStr = task.dueDate;

    if (!sStr && !dStr) {
      sStr = task.createdAt.split('T')[0];
      const d = new Date(sStr + 'T00:00:00');
      d.setDate(d.getDate() + 5);
      dStr = d.toISOString().split('T')[0];
    } else if (!sStr && dStr) {
      const d = new Date(dStr + 'T00:00:00');
      d.setDate(d.getDate() - 4);
      sStr = d.toISOString().split('T')[0];
    } else if (sStr && !dStr) {
      const d = new Date(sStr + 'T00:00:00');
      d.setDate(d.getDate() + 4);
      dStr = d.toISOString().split('T')[0];
    }

    const sDate = new Date(sStr + 'T00:00:00');
    const dDate = new Date((dStr || sStr) + 'T23:59:59');

    const startMs = rangeStart.getTime();
    const endMs = rangeEnd.getTime();
    const totalPx = slots.length * colWidth;

    const sMs = sDate.getTime();
    const dMs = dDate.getTime();

    if (dMs < startMs || sMs > endMs) {
      return null;
    }

    const clampedSMs = Math.max(sMs, startMs);
    const clampedDMs = Math.min(dMs, endMs);

    const left = ((clampedSMs - startMs) / (endMs - startMs)) * totalPx;
    const width = Math.max(28, ((clampedDMs - clampedSMs) / (endMs - startMs)) * totalPx);

    const doneCol = columns.find(c => c.title.includes('Done') || c.title.includes('完成'));
    const isDone = doneCol ? task.columnId === doneCol.id : false;

    let progress = 0;
    if (isDone) {
      progress = 100;
    } else if (task.estimatedHours && task.estimatedHours > 0) {
      progress = Math.min(100, Math.round(((task.actualHours || 0) / task.estimatedHours) * 100));
    } else {
      const col = columns.find(c => c.id === task.columnId);
      if (col?.title.includes('進行') || col?.title.includes('Progress')) progress = 50;
      else if (col?.title.includes('審查') || col?.title.includes('Review')) progress = 85;
    }

    const isOverdue = !isDone && task.dueDate && task.dueDate < TODAY_STR;

    return {
      left,
      width,
      progress,
      isDone,
      isOverdue,
      startDateStr: sStr,
      dueDateStr: dStr,
    };
  };

  const handleShiftTaskDays = (e: React.MouseEvent, task: Task, days: number) => {
    e.stopPropagation();
    if (!canEditBoard) return;

    const s = task.startDate ? new Date(task.startDate + 'T00:00:00') : new Date('2026-09-01T00:00:00');
    const d = task.dueDate ? new Date(task.dueDate + 'T00:00:00') : new Date('2026-09-05T00:00:00');

    s.setDate(s.getDate() + days);
    d.setDate(d.getDate() + days);

    updateTask(task.id, {
      startDate: s.toISOString().split('T')[0],
      dueDate: d.toISOString().split('T')[0],
    });
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT:
        return (
          <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
            緊急
          </span>
        );
      case Priority.HIGH:
        return (
          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
            高
          </span>
        );
      case Priority.MEDIUM:
        return (
          <span className="text-[10px] font-medium bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">
            中
          </span>
        );
      case Priority.LOW:
        return (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
            低
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner & Masthead */}
      <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <CalendarRange size={18} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              專案時程甘特圖
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            時程視覺化 • 工時統計分析 • 關鍵里程碑掌握
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={scrollToToday}
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs cursor-pointer"
          >
            <Clock size={13} className="text-indigo-600" />
            <span>定位今天 (09/10)</span>
          </button>

          {canEditBoard && (
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>新增任務</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>已排程任務</span>
            <Layers size={15} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats.withDates}
            </span>
            <span className="text-xs text-slate-400">/ {stats.total} 總卡片</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>進行中任務</span>
            <Clock size={15} className="text-sky-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats.inProgressCount}
            </span>
            <span className="text-xs text-slate-400">進行中</span>
          </div>
        </div>

        <div
          onClick={() => setShowOverdueOnly(prev => !prev)}
          className={`p-4 border rounded-xl shadow-xs cursor-pointer transition-all ${
            showOverdueOnly
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>逾期警告</span>
            <AlertCircle size={15} className="text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600">
              {stats.overdueCount}
            </span>
            <span className="text-xs text-slate-400">需盡快處理</span>
          </div>
        </div>

        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>工時完成率</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900">
              {stats.hourCompletionPercent}%
            </span>
            <span className="text-xs text-slate-400">
              ({stats.totalActHours}/{stats.totalEstHours}h)
            </span>
          </div>
        </div>
      </div>

      {/* Control & Filter Toolbar */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Time Scale & Navigation */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Time Scale Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setTimeScale('day')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                timeScale === 'day' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              日 (Day)
            </button>
            <button
              onClick={() => setTimeScale('week')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                timeScale === 'week' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              週 (Week)
            </button>
            <button
              onClick={() => setTimeScale('month')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                timeScale === 'month' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              月 (Month)
            </button>
          </div>

          {/* Prev / Next Period */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <button
              onClick={() => handleNav('prev')}
              title="往前移動時間軸"
              className="p-1.5 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => handleNav('next')}
              title="往後移動時間軸"
              className="p-1.5 border-l border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Group By selector */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 pl-2 border-l border-slate-200">
            <span className="font-medium">分組：</span>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as GroupBy)}
              className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="column">依看板狀態 (Status)</option>
              <option value="assignee">依負責人 (Assignee)</option>
              <option value="none">平鋪清單 (Flat)</option>
            </select>
          </div>
        </div>

        {/* Right: Search & Filters */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋甘特任務..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-7 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-32 sm:w-40"
            />
          </div>

          <select
            value={selectedColumnFilter}
            onChange={e => setSelectedColumnFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">全部狀態</option>
            {columns.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={selectedAssigneeFilter}
            onChange={e => setSelectedAssigneeFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">全部人員</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
            <option value="UNASSIGNED">未指派</option>
          </select>

          <select
            value={selectedPriorityFilter}
            onChange={e => setSelectedPriorityFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">全部優先級</option>
            <option value={Priority.URGENT}>緊急</option>
            <option value={Priority.HIGH}>高</option>
            <option value={Priority.MEDIUM}>中</option>
            <option value={Priority.LOW}>低</option>
          </select>

          {/* Toggle Table Visibility */}
          <button
            onClick={() => setShowLeftTable(prev => !prev)}
            title={showLeftTable ? '隱藏左側任務清單' : '展開左側任務清單'}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Main Gantt Split Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col flex-1 min-h-[540px]">
        {/* Split Area */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* Left: Task Attributes Table */}
          {showLeftTable && (
            <div className="w-72 sm:w-84 md:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-white">
              {/* Header */}
              <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between text-xs font-semibold bg-slate-50 text-slate-700">
                <span className="flex items-center space-x-1.5">
                  <Layers size={14} className="text-indigo-600" />
                  <span>任務清單</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  共 {filteredTasks.length} 項
                </span>
              </div>

              {/* Rows List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {groupedTasks.map(group => {
                  const isCollapsed = collapsedGroups[group.id];
                  return (
                    <div key={group.id} className="divide-y divide-slate-100">
                      {/* Group Header */}
                      {groupBy !== 'none' && (
                        <div
                          onClick={() => toggleGroupCollapse(group.id)}
                          className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors select-none"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <ChevronDown
                              size={13}
                              className={`text-slate-400 transition-transform ${
                                isCollapsed ? '-rotate-90' : ''
                              }`}
                            />
                            {group.avatarUrl && (
                              <img
                                src={group.avatarUrl}
                                alt=""
                                className="w-4 h-4 rounded-full object-cover shrink-0"
                              />
                            )}
                            <span className="text-xs font-semibold truncate text-slate-800">
                              {group.title}
                            </span>
                          </div>
                          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-medium">
                            {group.tasks.length}
                          </span>
                        </div>
                      )}

                      {/* Group Task Rows */}
                      {!isCollapsed &&
                        group.tasks.map(task => {
                          const assignee = users.find(u => u.id === task.assigneeId);
                          const coords = computeBarCoords(task);

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTaskId(task.id)}
                              className="h-12 px-3 flex items-center justify-between hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="flex items-center space-x-1.5">
                                  {getPriorityBadge(task.priority)}
                                  <span
                                    className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600"
                                    title={task.title}
                                  >
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                  <span>
                                    {coords?.startDateStr ? coords.startDateStr.slice(5) : '--'} ~{' '}
                                    {coords?.dueDateStr ? coords.dueDateStr.slice(5) : '--'}
                                  </span>
                                  {task.rfiIds && task.rfiIds.length > 0 && (
                                    <span className="bg-indigo-50 text-indigo-700 px-1 rounded text-[10px] font-medium border border-indigo-200">
                                      {task.rfiIds.length} RFI
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right avatar */}
                              <div className="flex items-center space-x-1.5 shrink-0">
                                {assignee ? (
                                  <img
                                    src={assignee.avatarUrl}
                                    alt={assignee.name}
                                    title={assignee.name}
                                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                                  />
                                ) : (
                                  <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                                    ?
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    暫無符合條件之排程任務
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Right: Gantt Interactive Timeline Canvas */}
          <div
            ref={timelineScrollRef}
            className="flex-1 overflow-x-auto overflow-y-auto relative select-none bg-white"
          >
            {/* Timeline Canvas Container */}
            <div
              className="relative min-h-full flex flex-col"
              style={{ width: `${slots.length * colWidth}px` }}
            >
              {/* Timeline Header */}
              <div className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200 flex flex-col">
                {/* Months Row */}
                <div className="h-7 flex border-b border-slate-200 text-xs font-semibold text-slate-700">
                  {monthGroups.map((mg, idx) => (
                    <div
                      key={idx}
                      className="px-3 flex items-center border-r border-slate-200 truncate bg-slate-100/70"
                      style={{ width: `${mg.count * colWidth}px` }}
                    >
                      <span>{mg.label}</span>
                    </div>
                  ))}
                </div>

                {/* Sub-slots Row (Days / Weeks / Months) */}
                <div className="h-9 flex text-xs">
                  {slots.map(slot => (
                    <div
                      key={slot.key}
                      className={`flex flex-col items-center justify-center border-r border-slate-200 shrink-0 ${
                        slot.isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : slot.isWeekend
                          ? 'bg-slate-100/80 text-slate-400'
                          : 'text-slate-700'
                      }`}
                      style={{ width: `${colWidth}px` }}
                    >
                      <span className="leading-tight font-semibold">{slot.label}</span>
                      {slot.subLabel && (
                        <span className="text-[10px] leading-tight opacity-75">
                          {slot.subLabel}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vertical Grid Lines & Today Marker Line */}
              <div className="absolute inset-0 top-16 pointer-events-none flex">
                {slots.map(slot => (
                  <div
                    key={slot.key}
                    className={`h-full border-r shrink-0 ${
                      slot.isWeekend
                        ? 'border-slate-200 bg-slate-50/50'
                        : 'border-slate-100'
                    }`}
                    style={{ width: `${colWidth}px` }}
                  />
                ))}

                {/* Today Indicator Line */}
                {todayPositionX !== null && (
                  <div
                    className="absolute top-0 bottom-0 z-10 w-0.5 bg-indigo-600"
                    style={{ left: `${todayPositionX}px` }}
                  >
                    <div className="sticky top-16 -ml-9 px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold shadow-xs whitespace-nowrap">
                      今天 09/10
                    </div>
                  </div>
                )}
              </div>

              {/* Rows matching left table */}
              <div className="relative z-1 flex-1 flex flex-col">
                {groupedTasks.map(group => {
                  const isCollapsed = collapsedGroups[group.id];
                  return (
                    <div key={group.id} className="flex flex-col">
                      {/* Group spacer row */}
                      {groupBy !== 'none' && (
                        <div className="h-8 bg-slate-50/80 border-b border-slate-200 flex items-center px-4">
                          <span className="text-xs font-semibold text-slate-700">
                            {group.title} ({group.tasks.length})
                          </span>
                        </div>
                      )}

                      {/* Task Rows */}
                      {!isCollapsed &&
                        group.tasks.map(task => {
                          const coords = computeBarCoords(task);
                          const assignee = users.find(u => u.id === task.assigneeId);

                          return (
                            <div
                              key={task.id}
                              className="h-12 border-b border-slate-100 relative flex items-center hover:bg-slate-50/60 transition-colors group"
                            >
                              {coords && (
                                <div
                                  onClick={() => setSelectedTaskId(task.id)}
                                  className={`absolute h-7 rounded-lg cursor-pointer transition-all shadow-xs flex items-center overflow-hidden border ${
                                    coords.isOverdue
                                      ? 'border-rose-400 bg-rose-500 text-white'
                                      : coords.isDone
                                      ? 'border-emerald-400 bg-emerald-600 text-white'
                                      : 'border-indigo-400 bg-indigo-600 text-white hover:bg-indigo-700'
                                  }`}
                                  style={{
                                    left: `${coords.left}px`,
                                    width: `${coords.width}px`,
                                  }}
                                  title={`${task.title}\n起訖: ${coords.startDateStr} ~ ${coords.dueDateStr}\n進度: ${coords.progress}%`}
                                >
                                  {/* Progress Fill Bar */}
                                  <div
                                    className="absolute left-0 top-0 bottom-0 bg-white/20 border-r border-white/30"
                                    style={{
                                      width: `${coords.progress}%`,
                                    }}
                                  />

                                  {/* Bar Content overlay */}
                                  <div className="relative z-1 px-2 flex items-center justify-between w-full text-xs font-medium truncate">
                                    <div className="flex items-center space-x-1.5 truncate">
                                      {coords.isDone && (
                                        <CheckCircle2 size={13} className="text-white shrink-0" />
                                      )}
                                      {coords.isOverdue && (
                                        <AlertCircle size={13} className="text-white shrink-0" />
                                      )}
                                      <span className="truncate text-xs font-semibold">{task.title}</span>
                                    </div>

                                    {/* Progress label / Assignee Avatar */}
                                    <div className="flex items-center space-x-1 pl-1 shrink-0 text-[11px]">
                                      <span>{coords.progress}%</span>
                                      {assignee && (
                                        <img
                                          src={assignee.avatarUrl}
                                          alt=""
                                          className="w-4 h-4 rounded-full object-cover ring-1 ring-white/50"
                                        />
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick shift handle buttons on hover */}
                                  {canEditBoard && (
                                    <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-0.5 bg-white text-slate-700 rounded border border-slate-200 px-1 text-[10px] font-semibold shadow-xs">
                                      <button
                                        onClick={e => handleShiftTaskDays(e, task, -1)}
                                        title="提前 1 天"
                                        className="hover:text-indigo-600 px-0.5 cursor-pointer"
                                      >
                                        -1d
                                      </button>
                                      <span>|</span>
                                      <button
                                        onClick={e => handleShiftTaskDays(e, task, 1)}
                                        title="延後 1 天"
                                        className="hover:text-indigo-600 px-0.5 cursor-pointer"
                                      >
                                        +1d
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center space-x-5 flex-wrap gap-y-2">
            <span className="font-semibold text-slate-700">圖例說明：</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-indigo-600" />
              <span>一般進行中排程</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              <span>已完成任務</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-0.5 bg-indigo-600" />
              <span>今日基準線 (09/10)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>逾期警示</span>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            點擊任一任務色塊可開啟卡片詳情並快速關聯 RFI 需求單
          </div>
        </div>
      </div>
    </div>
  );
};
