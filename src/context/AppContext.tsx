import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Role,
  Project,
  Column,
  Task,
  RFI,
  Attachment,
  Comment,
  Notification,
  ActivityLog,
  RFIStatus,
  Priority,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PROJECT,
  INITIAL_COLUMNS,
  INITIAL_TASKS,
  INITIAL_RFIS,
  INITIAL_ATTACHMENTS,
  INITIAL_COMMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';

interface LightboxState {
  isOpen: boolean;
  imageUrl: string;
  title: string;
}

interface AppContextType {
  // Current user & RBAC
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  canEditBoard: boolean;
  canManageColumns: boolean;
  canReviewRFI: boolean;
  canSubmitRFI: boolean;
  canMoveTask: boolean;

  // Project & Columns
  project: Project;
  columns: Column[];
  addColumn: (title: string, color?: string) => void;
  updateColumn: (id: string, title: string, color?: string) => void;
  deleteColumn: (id: string) => boolean;

  // Tasks
  tasks: Task[];
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, targetColumnId: string, newOrderIndex?: number) => void;

  // RFIs
  rfis: RFI[];
  createRFI: (rfi: Omit<RFI, 'id' | 'rfiNumber' | 'createdAt' | 'updatedAt'>) => RFI;
  updateRFI: (id: string, updates: Partial<RFI>) => void;
  updateRFIStatus: (id: string, status: RFIStatus, officialAnswer?: string) => void;
  convertRFIToTask: (rfiId: string) => Task;

  // Attachments
  attachments: Attachment[];
  uploadAttachment: (file: { name: string; size: number; type: string; url: string }, entity: { taskId?: string; rfiId?: string }) => Attachment;
  deleteAttachment: (id: string) => void;

  // Comments
  comments: Comment[];
  addComment: (content: string, entity: { rfiId?: string; taskId?: string }, isOfficialResponse?: boolean) => Comment;

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Activity Logs
  activityLogs: ActivityLog[];

  // Lightbox
  lightbox: LightboxState;
  openLightbox: (imageUrl: string, title: string) => void;
  closeLightbox: () => void;

  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Global State Reset
  resetToDefaults: () => void;

  // Active View & Modals
  activeTab: 'kanban' | 'gantt' | 'rfi' | 'activity' | 'spec';
  setActiveTab: (tab: 'kanban' | 'gantt' | 'rfi' | 'activity' | 'spec') => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  selectedRFIId: string | null;
  setSelectedRFIId: (id: string | null) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isCreateRFIOpen: boolean;
  setIsCreateRFIOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'srs_pm_rfi_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load or default state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'currentUser');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Sarah PM by default
  });

  const [users] = useState<User[]>(INITIAL_USERS);
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'project');
    return saved ? JSON.parse(saved) : INITIAL_PROJECT;
  });

  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'columns');
    return saved ? JSON.parse(saved) : INITIAL_COLUMNS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [rfis, setRfis] = useState<RFI[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'rfis');
    return saved ? JSON.parse(saved) : INITIAL_RFIS;
  });

  const [attachments, setAttachments] = useState<Attachment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'attachments');
    return saved ? JSON.parse(saved) : INITIAL_ATTACHMENTS;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'activityLogs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'kanban' | 'gantt' | 'rfi' | 'activity' | 'spec'>('kanban');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedRFIId, setSelectedRFIId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateRFIOpen, setIsCreateRFIOpen] = useState(false);

  // Lightbox
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    imageUrl: '',
    title: '',
  });

  // Theme State (Dark / Light Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'project', JSON.stringify(project));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'columns', JSON.stringify(columns));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'tasks', JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'rfis', JSON.stringify(rfis));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'attachments', JSON.stringify(attachments));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'comments', JSON.stringify(comments));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEY_PREFIX + 'activityLogs', JSON.stringify(activityLogs));
  }, [project, columns, tasks, rfis, attachments, comments, notifications, activityLogs]);

  // RBAC Permission checks
  const canEditBoard = currentUser.role === Role.ADMIN || currentUser.role === Role.PM || currentUser.role === Role.MEMBER;
  const canManageColumns = currentUser.role === Role.ADMIN || currentUser.role === Role.PM;
  const canReviewRFI = currentUser.role === Role.ADMIN || currentUser.role === Role.PM;
  const canSubmitRFI = true; // All roles can submit RFIs (including client)
  const canMoveTask = currentUser.role !== Role.CLIENT; // Client can only view board

  // Helper: log activity
  const logActivity = (entityType: 'TASK' | 'RFI' | 'COLUMN', entityId: string, entityTitle: string, action: string, details?: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      projectId: project.id,
      entityType,
      entityId,
      entityTitle,
      action,
      userId: currentUser.id,
      details,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Helper: add notification
  const notifyUser = (userId: string, title: string, message: string, type: 'ASSIGNED' | 'RFI_ANSWER' | 'OVERDUE' | 'STATUS_CHANGE', linkType?: 'task' | 'rfi', linkId?: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      isRead: false,
      linkType,
      linkId,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Columns
  const addColumn = (title: string, color = '#64748b') => {
    const newCol: Column = {
      id: `col-${Date.now()}`,
      title,
      order: columns.length,
      projectId: project.id,
      color,
    };
    setColumns(prev => [...prev, newCol]);
    logActivity('COLUMN', newCol.id, title, '新增自訂看板欄位');
  };

  const updateColumn = (id: string, title: string, color?: string) => {
    setColumns(prev => prev.map(col => col.id === id ? { ...col, title, color: color || col.color } : col));
    logActivity('COLUMN', id, title, '編輯欄位設定');
  };

  const deleteColumn = (id: string): boolean => {
    const hasTasks = tasks.some(t => t.columnId === id);
    if (hasTasks) {
      return false; // cannot delete column with tasks
    }
    const colToDelete = columns.find(c => c.id === id);
    setColumns(prev => prev.filter(c => c.id !== id));
    if (colToDelete) {
      logActivity('COLUMN', id, colToDelete.title, '刪除看板欄位');
    }
    return true;
  };

  // Tasks
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    logActivity('TASK', newTask.id, newTask.title, '建立任務卡片', `優先級: ${newTask.priority}`);

    if (newTask.assigneeId && newTask.assigneeId !== currentUser.id) {
      notifyUser(newTask.assigneeId, '任務指派提醒', `${currentUser.name} 將任務「${newTask.title}」指派給您。`, 'ASSIGNED', 'task', newTask.id);
    }

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        return updated;
      }
      return t;
    }));

    const task = tasks.find(t => t.id === id);
    if (task) {
      logActivity('TASK', id, task.title, '更新卡片資訊');
    }
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (task) {
      logActivity('TASK', id, task.title, '刪除任務卡片');
    }
  };

  const moveTask = (taskId: string, targetColumnId: string, newOrderIndex?: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldCol = columns.find(c => c.id === task.columnId);
    const newCol = columns.find(c => c.id === targetColumnId);

    setTasks(prev => {
      const remaining = prev.filter(t => t.id !== taskId);
      const updatedTask = { ...task, columnId: targetColumnId, updatedAt: new Date().toISOString() };
      
      if (newOrderIndex !== undefined && newOrderIndex >= 0) {
        // insert at index among target column items
        const inTargetCol = remaining.filter(t => t.columnId === targetColumnId);
        inTargetCol.splice(newOrderIndex, 0, updatedTask);
        const others = remaining.filter(t => t.columnId !== targetColumnId);
        return [...inTargetCol, ...others];
      } else {
        return [updatedTask, ...remaining];
      }
    });

    if (oldCol && newCol && oldCol.id !== newCol.id) {
      logActivity('TASK', taskId, task.title, '變更卡片狀態', `從 [${oldCol.title}] 拖曳至 [${newCol.title}]`);
    }
  };

  // RFIs
  const createRFI = (rfiData: Omit<RFI, 'id' | 'rfiNumber' | 'createdAt' | 'updatedAt'>): RFI => {
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const countInMonth = rfis.length + 1;
    const rfiNumber = `RFI-${yearMonth}-${String(countInMonth).padStart(3, '0')}`;

    const newRFI: RFI = {
      ...rfiData,
      id: `rfi-${Date.now()}`,
      rfiNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRfis(prev => [newRFI, ...prev]);
    logActivity('RFI', newRFI.id, `${newRFI.rfiNumber} ${newRFI.subject}`, '提出資訊需求單 (RFI)', `狀態: ${newRFI.status}`);

    // Notify respondent if specified
    if (newRFI.respondentId) {
      notifyUser(newRFI.respondentId, 'RFI 待回覆通知', `${currentUser.name} 向您提出了需求單 [${newRFI.rfiNumber}: ${newRFI.subject}]。`, 'ASSIGNED', 'rfi', newRFI.id);
    }

    return newRFI;
  };

  const updateRFI = (id: string, updates: Partial<RFI>) => {
    setRfis(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    const rfi = rfis.find(r => r.id === id);
    if (rfi) {
      logActivity('RFI', id, `${rfi.rfiNumber} ${rfi.subject}`, '更新 RFI 資訊');
    }
  };

  const updateRFIStatus = (id: string, status: RFIStatus, officialAnswer?: string) => {
    const rfi = rfis.find(r => r.id === id);
    if (!rfi) return;

    setRfis(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          officialAnswer: officialAnswer !== undefined ? officialAnswer : r.officialAnswer,
          updatedAt: new Date().toISOString(),
        };
      }
      return r;
    }));

    logActivity('RFI', id, `${rfi.rfiNumber} ${rfi.subject}`, '變更 RFI 狀態生命週期', `狀態更新為: ${status}${officialAnswer ? ' (已核定官方答覆)' : ''}`);

    // Notify creator
    if (rfi.creatorId !== currentUser.id) {
      notifyUser(
        rfi.creatorId,
        `RFI 狀態變更: ${status}`,
        `${currentUser.name} 已將 [${rfi.rfiNumber}] 狀態更新為 ${status}${officialAnswer ? '，並發布官方答覆。' : '。'}`,
        status === RFIStatus.ANSWERED ? 'RFI_ANSWER' : 'STATUS_CHANGE',
        'rfi',
        rfi.id
      );
    }
  };

  // Convert RFI to Kanban Task Card (SRS Requirement 3.3)
  const convertRFIToTask = (rfiId: string): Task => {
    const rfi = rfis.find(r => r.id === rfiId);
    if (!rfi) throw new Error('RFI not found');

    const firstCol = columns[0] || INITIAL_COLUMNS[0];
    const taskTitle = `[RFI實作] ${rfi.subject}`;
    const taskDesc = `依據需求單 ${rfi.rfiNumber} 結論進行實作。\n\n【釐清需求】\n${rfi.question}\n\n【官方核定答覆】\n${rfi.officialAnswer || '尚未核准官方答覆'}`;

    const newTask = createTask({
      title: taskTitle,
      description: taskDesc,
      priority: rfi.priority,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: rfi.dueDate,
      estimatedHours: 16,
      columnId: firstCol.id,
      projectId: project.id,
      assigneeId: rfi.respondentId || currentUser.id,
      coAssigneeIds: [rfi.creatorId],
      tags: ['RFI實作', '規格轉換'],
      attachmentIds: [...rfi.attachmentIds],
      rfiIds: [rfi.id],
    });

    // Link back to RFI
    updateRFI(rfi.id, { taskId: newTask.id });
    logActivity('RFI', rfi.id, `${rfi.rfiNumber}`, '轉化為看板實作卡片', `已成功建立看板卡片: ${newTask.title}`);

    return newTask;
  };

  // Attachments
  const uploadAttachment = (
    file: { name: string; size: number; type: string; url: string },
    entity: { taskId?: string; rfiId?: string }
  ): Attachment => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fileName: file.name,
      fileUrl: file.url,
      fileSize: file.size,
      mimeType: file.type,
      taskId: entity.taskId,
      rfiId: entity.rfiId,
      uploadedById: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    setAttachments(prev => [newAtt, ...prev]);

    if (entity.taskId) {
      setTasks(prev => prev.map(t => t.id === entity.taskId ? { ...t, attachmentIds: [...t.attachmentIds, newAtt.id] } : t));
    }
    if (entity.rfiId) {
      setRfis(prev => prev.map(r => r.id === entity.rfiId ? { ...r, attachmentIds: [...r.attachmentIds, newAtt.id] } : r));
    }

    logActivity(
      entity.taskId ? 'TASK' : 'RFI',
      entity.taskId || entity.rfiId || '',
      file.name,
      '上傳附件檔案',
      `大小: ${(file.size / 1024).toFixed(1)} KB, 格式: ${file.type}`
    );

    return newAtt;
  };

  const deleteAttachment = (id: string) => {
    const att = attachments.find(a => a.id === id);
    if (!att) return;

    setAttachments(prev => prev.filter(a => a.id !== id));
    if (att.taskId) {
      setTasks(prev => prev.map(t => t.id === att.taskId ? { ...t, attachmentIds: t.attachmentIds.filter(aId => aId !== id) } : t));
    }
    if (att.rfiId) {
      setRfis(prev => prev.map(r => r.id === att.rfiId ? { ...r, attachmentIds: r.attachmentIds.filter(aId => aId !== id) } : r));
    }

    logActivity(
      att.taskId ? 'TASK' : 'RFI',
      att.taskId || att.rfiId || '',
      att.fileName,
      '刪除附件檔案'
    );
  };

  // Comments
  const addComment = (
    content: string,
    entity: { rfiId?: string; taskId?: string },
    isOfficialResponse: boolean = false
  ): Comment => {
    const newComment: Comment = {
      id: `comm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      content,
      userId: currentUser.id,
      rfiId: entity.rfiId,
      taskId: entity.taskId,
      isOfficialResponse,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [...prev, newComment]);

    if (entity.rfiId) {
      const rfi = rfis.find(r => r.id === entity.rfiId);
      if (rfi) {
        if (isOfficialResponse) {
          updateRFIStatus(rfi.id, RFIStatus.ANSWERED, content);
        } else if (rfi.status === RFIStatus.SUBMITTED) {
          updateRFIStatus(rfi.id, RFIStatus.IN_REVIEW);
        }
        logActivity('RFI', rfi.id, `${rfi.rfiNumber}`, isOfficialResponse ? '發布官方正式答覆' : '回覆討論');
      }
    }

    return newComment;
  };

  // Notifications
  const unreadNotificationCount = notifications.filter(n => n.userId === currentUser.id && !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n));
  };

  // Lightbox
  const openLightbox = (imageUrl: string, title: string) => {
    setLightbox({ isOpen: true, imageUrl, title });
  };

  const closeLightbox = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  // Reset demo
  const resetToDefaults = () => {
    localStorage.clear();
    setProject(INITIAL_PROJECT);
    setColumns(INITIAL_COLUMNS);
    setTasks(INITIAL_TASKS);
    setRfis(INITIAL_RFIS);
    setAttachments(INITIAL_ATTACHMENTS);
    setComments(INITIAL_COMMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        canEditBoard,
        canManageColumns,
        canReviewRFI,
        canSubmitRFI,
        canMoveTask,

        project,
        columns,
        addColumn,
        updateColumn,
        deleteColumn,

        tasks,
        createTask,
        updateTask,
        deleteTask,
        moveTask,

        rfis,
        createRFI,
        updateRFI,
        updateRFIStatus,
        convertRFIToTask,

        attachments,
        uploadAttachment,
        deleteAttachment,

        comments,
        addComment,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        activityLogs,

        lightbox,
        openLightbox,
        closeLightbox,

        theme,
        setTheme,
        toggleTheme,

        resetToDefaults,

        activeTab,
        setActiveTab,
        selectedTaskId,
        setSelectedTaskId,
        selectedRFIId,
        setSelectedRFIId,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isCreateRFIOpen,
        setIsCreateRFIOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
