'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  Check, 
  MapPin, 
  Sparkles, 
  Clock, 
  User, 
  AlertTriangle 
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@/types';

export default function TasksPage() {
  const tasks = useStore((state) => state.tasks);
  const staff = useStore((state) => state.staff);
  const userRole = useStore((state) => state.userRole);

  const createTask = useStore((state) => state.createItemAction);
  const updateTask = useStore((state) => state.updateItemAction);
  const deleteTask = useStore((state) => state.deleteItemAction);

  // States
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('General Ward');

  const [triageGrouping, setTriageGrouping] = useState(true);

  // Scribes list
  const nurses = staff.filter(s => s.role === 'nurse');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignedTo || !dueDate) return;

    try {
      const payload: Partial<Task> = {
        title,
        assignedTo,
        priority,
        dueDate: new Date(dueDate).toISOString(),
        status: 'pending',
        notes,
        category: category || 'General Ward'
      };

      await createTask('tasks', payload);
      setShowAddForm(false);

      // Reset
      setTitle('');
      setAssignedTo('');
      setNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id: string) => {
    await updateTask('tasks', id, { status: 'completed' as TaskStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to retire this task?")) {
      await deleteTask('tasks', id);
    }
  };

  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Unassigned';

  // AI location batcher (FR-TSK-03)
  const getBatchedTasks = () => {
    const batches: Record<string, Task[]> = {};
    tasks.forEach(task => {
      let roomKey = 'General Ward';
      const roomMatch = task.title.match(/Room\s*([0-9a-zA-Z]+)/i);
      if (roomMatch) {
        roomKey = `Room ${roomMatch[1]}`;
      } else if (task.title.toLowerCase().includes('mehta')) {
        roomKey = 'Room 101';
      } else if (task.title.toLowerCase().includes('sharma')) {
        roomKey = 'Room 201';
      }
      
      if (!batches[roomKey]) batches[roomKey] = [];
      batches[roomKey].push(task);
    });
    return batches;
  };

  const batchedTasks = getBatchedTasks();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Clinical Duties Workspace</h2>
            <p className="text-xs text-slate-500 mt-1">Assign ward routines, check completion statuses, and optimize nurse travel maps.</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTriageGrouping(!triageGrouping)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border rounded-xl text-xs font-bold transition ${
                triageGrouping 
                  ? 'bg-cyan-50 border-cyan-200 text-cyan-700' 
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Sparkles className="h-4 w-4 text-cyan-600" />
              {triageGrouping ? 'Ward Grouping Enabled' : 'Standard List view'}
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
              >
                <Plus className="h-4 w-4" />
                Assign Ward Duty
              </button>
            )}
          </div>
        </div>

        {/* Add Task Modal overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleAddSubmit}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>

              <h3 className="font-extrabold text-slate-800 text-base">Assign Clinical Duty</h3>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duty Title *</label>
                  <input
                    type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Administer glucose panel to Room 101"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assignee Nurse *</label>
                    <select
                      required
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="">-- Choose Nurse --</option>
                      {nurses.map(n => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Duty Priority</label>
                    <select
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Due Deadline *</label>
                    <input
                      type="datetime-local" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Location Category</label>
                    <input
                      type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. ICU Ward A"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instructions..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Log Shift Assignment
              </button>
            </form>
          </div>
        )}

        {/* Task Grid Rendering */}
        <div className="text-left">
          {triageGrouping ? (
            /* AI Batched Grouping */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(batchedTasks).map((room) => (
                <div key={room} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                      <MapPin className="h-4.5 w-4.5 text-cyan-600 shrink-0" />
                      <span>{room}</span>
                    </div>
                    <span className="text-[9px] font-black text-cyan-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {batchedTasks[room].length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {batchedTasks[room].map((task) => {
                      const assigneeName = getStaffName(task.assignedTo);
                      const timeStr = new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const dateStr = new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' });

                      return (
                        <div key={task.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-xl space-y-3 transition">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-700 block max-w-[80%]">{task.title}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.25 rounded ${
                              task.priority === 'urgent' || task.priority === 'high' 
                                ? 'bg-red-50 text-red-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3 text-cyan-600" />
                              {assigneeName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-cyan-600" />
                              {dateStr} {timeStr}
                            </span>
                          </div>

                          <div className="flex justify-between items-center border-t border-slate-100 pt-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-bold capitalize">{task.status}</span>
                            
                            <div className="flex gap-2">
                              {task.status !== 'completed' && (
                                <button
                                  onClick={() => handleComplete(task.id)}
                                  className="p-1 bg-white border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 rounded-lg text-slate-500 transition"
                                  title="Mark Completed"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {userRole === 'admin' && (
                                <button
                                  onClick={() => handleDelete(task.id)}
                                  className="p-1 bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 rounded-lg text-slate-400 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flat List view */
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Assignee</th>
                      <th>Priority</th>
                      <th>Deadline</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className={task.status === 'completed' ? 'opacity-50 line-through' : ''}>
                        <td className="font-bold text-slate-700 text-xs sm:text-sm">{task.title}</td>
                        <td className="text-xs font-semibold text-slate-600">{getStaffName(task.assignedTo)}</td>
                        <td>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="text-xs text-slate-400">{new Date(task.dueDate).toLocaleString()}</td>
                        <td className="text-xs capitalize font-semibold text-slate-600">{task.status}</td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => handleComplete(task.id)}
                                className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg transition"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
