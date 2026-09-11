import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { GanttChart } from './components/GanttChart';
import { RFITracker } from './components/RFITracker';
import { ActivityFeed } from './components/ActivityFeed';
import { SpecCompliance } from './components/SpecCompliance';
import { TaskModal } from './components/TaskModal';
import { RFIDetailModal } from './components/RFIDetailModal';
import { CreateRFIModal } from './components/CreateRFIModal';
import { LightboxModal } from './components/LightboxModal';

const MainApp: React.FC = () => {
  const {
    activeTab,
    selectedTaskId,
    setSelectedTaskId,
    selectedRFIId,
    setSelectedRFIId,
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    isCreateRFIOpen,
    setIsCreateRFIOpen,
  } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'gantt' && <GanttChart />}
        {activeTab === 'rfi' && <RFITracker />}
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'spec' && <SpecCompliance />}
      </main>

      {/* Task View / Edit Modal */}
      {selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          isCreateMode={false}
        />
      )}

      {/* Task Create Modal */}
      {isCreateTaskOpen && (
        <TaskModal
          taskId={null}
          onClose={() => setIsCreateTaskOpen(false)}
          isCreateMode={true}
        />
      )}

      {/* RFI Detail Modal */}
      {selectedRFIId && (
        <RFIDetailModal
          rfiId={selectedRFIId}
          onClose={() => setSelectedRFIId(null)}
        />
      )}

      {/* RFI Create Modal */}
      {isCreateRFIOpen && (
        <CreateRFIModal
          onClose={() => setIsCreateRFIOpen(false)}
        />
      )}

      {/* Lightbox Modal */}
      <LightboxModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
