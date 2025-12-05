import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  LogOut,
  Calendar,
  MapPin,
  FileText,
  Loader2,
  ChevronRight,
  Bell,
  X,
  Check,
  XCircle,
  PlayCircle,
  MessageSquare,
  RotateCcw,
  Flag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import axios from '../lib/axios';
import { useGetServiceRequests, useUpdateServiceRequest, roomServiceKeys } from '../hooks/useRoomService';
import { useClockIn, useClockOut, useGetStaff } from '../hooks/useStaff';

// For demo - in production, get from auth session
const STAFF_ID = 1;
const STAFF_NAME = 'David';
const STAFF_DEPARTMENT = 'Housekeeping';

type TaskStatus = 'assigned' | 'in_progress' | 'completed';
type StaffAvailability = 'available' | 'busy' | 'offline';

interface AssignedTask {
  id: number;
  request_number: string;
  type: string;
  service_type: string;
  status: string;
  priority: string;
  notes: string;
  assigned_to: string;
  assigned_staff_id: number;
  assigned_at: string;
  requested_at: string;
  started_at?: string;
  completed_at?: string;
  room: {
    id: number;
    room_number: string;
    floor: number;
  };
  guest: {
    id: number;
    first_name: string;
    last_name: string;
  };
  assigned_staff: {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    phone: string;
  };
}

interface Task {
  id: number;
  type: string;
  room_number: string;
  status: TaskStatus;
  priority: string;
  notes: string;
  guest_notes: string;
  internal_notes: string;
  created_at: string;
  assigned_at?: string;
  started_at?: string;
  completed_at?: string;
  icon: string;
  service_type?: string;
  issue_type?: string;
  description?: string;
  request_number?: string;
  guest_name?: string;
}

// Custom hook to update task status using the new endpoint
const useUpdateTaskStatus = (taskId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (status: 'assigned' | 'in_progress' | 'completed') => {
      console.log(`Updating task ${taskId} to status:`, status);
      const response = await axios.put(`/service-requests/assigned/${taskId}/status`, {
        status,
      });
      console.log('Update response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh the task list
      queryClient.invalidateQueries({ queryKey: [...roomServiceKeys.serviceRequests()] });
      console.log('Task status updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating task status:', error);
      console.error('Error response:', error.response?.data);
    },
  });
};

// Map ServiceRequest to AssignedTask format
const mapServiceRequestToAssignedTask = (request: any): AssignedTask | null => {
  // Skip if request doesn't have required fields
  if (!request || !request.id) return null;
  
  return {
    id: request.id,
    request_number: request.request_number || `REQ-${request.id}`,
    type: request.service_type || request.type || 'general',
    service_type: request.service_type || 'general-assistance',
    status: request.status || 'pending',
    priority: request.priority || 'normal',
    notes: request.description || request.notes || '',
    assigned_to: request.assigned_to || '',
    assigned_staff_id: request.assigned_staff_id || 0,
    assigned_at: request.assigned_at || request.created_at || new Date().toISOString(),
    requested_at: request.requested_at || request.created_at || new Date().toISOString(),
    started_at: request.started_at,
    completed_at: request.completed_at,
    room: {
      id: request.room_id || 0,
      room_number: request.room_number || 'N/A',
      floor: Math.floor(parseInt(request.room_number || '0') / 100) || 1,
    },
    guest: {
      id: request.guest_id || 0,
      first_name: request.guest_name?.split(' ')[0] || 'Guest',
      last_name: request.guest_name?.split(' ').slice(1).join(' ') || '',
    },
    assigned_staff: {
      id: request.assigned_staff_id || 0,
      employee_id: '',
      first_name: request.assigned_to?.split(' ')[0] || '',
      last_name: request.assigned_to?.split(' ').slice(1).join(' ') || '',
      department: '',
      position: '',
      phone: '',
    },
  };
};

// Map API response to Task format
const mapAssignedTaskToTask = (apiTask: AssignedTask): Task => {
  // Determine icon based on type
  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'housekeeping':
        return '🧹';
      case 'maintenance':
        return '🔧';
      case 'room-service':
        return '🍽️';
      case 'laundry':
        return '👔';
      default:
        return '📋';
    }
  };

  // Map API status to local TaskStatus
  const mapStatus = (status: string): TaskStatus => {
    switch (status) {
      case 'pending':
      case 'assigned':
        return 'assigned';
      case 'in-progress':
      case 'in_progress':
        return 'in_progress';
      case 'completed':
        return 'completed';
      default:
        return 'assigned';
    }
  };

  return {
    id: apiTask.id,
    type: apiTask.type,
    room_number: apiTask.room.room_number,
    status: mapStatus(apiTask.status),
    priority: apiTask.priority,
    notes: apiTask.notes || '',
    guest_notes: apiTask.notes || '',
    internal_notes: '',
    created_at: apiTask.requested_at,
    assigned_at: apiTask.assigned_at,
    started_at: apiTask.started_at,
    completed_at: apiTask.completed_at,
    icon: getIcon(apiTask.type),
    service_type: apiTask.service_type,
    request_number: apiTask.request_number,
    guest_name: `${apiTask.guest.first_name} ${apiTask.guest.last_name}`,
  };
};

// Dummy task data for demonstration
const DUMMY_TASKS: Task[] = [
  {
    id: 1,
    type: 'Cleaning Request',
    room_number: '305',
    status: 'assigned' as TaskStatus,
    priority: 'normal',
    notes: 'Please change towels only.',
    guest_notes: 'Need extra towels',
    internal_notes: '',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
    assigned_at: new Date(Date.now() - 25 * 60000).toISOString(),
    icon: '🧹',
  },
  {
    id: 2,
    type: 'Housekeeping',
    room_number: '210',
    status: 'in_progress' as TaskStatus,
    priority: 'high',
    notes: 'Deep clean required',
    guest_notes: 'Guest checked out',
    internal_notes: 'Inspection required after completion',
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    started_at: new Date(Date.now() - 12 * 60000).toISOString(),
    icon: '🧹',
  },
  {
    id: 3,
    type: 'Maintenance',
    room_number: '407',
    status: 'assigned' as TaskStatus,
    priority: 'urgent',
    notes: 'Air conditioning not working',
    guest_notes: 'Room is too hot',
    internal_notes: 'Check thermostat first',
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    assigned_at: new Date(Date.now() - 10 * 60000).toISOString(),
    icon: '🔧',
  },
  {
    id: 4,
    type: 'Room Service',
    room_number: '512',
    status: 'assigned' as TaskStatus,
    priority: 'normal',
    notes: 'Deliver breakfast',
    guest_notes: 'Extra orange juice please',
    internal_notes: '',
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    assigned_at: new Date(Date.now() - 2 * 60000).toISOString(),
    icon: '🍽️',
  },
  {
    id: 5,
    type: 'Cleaning Request',
    room_number: '120',
    status: 'completed' as TaskStatus,
    priority: 'normal',
    notes: 'Standard cleaning',
    guest_notes: '',
    internal_notes: '',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 120 * 60000).toISOString(),
    icon: '🧹',
  },
  {
    id: 6,
    type: 'Housekeeping',
    room_number: '308',
    status: 'completed' as TaskStatus,
    priority: 'normal',
    notes: 'Replenish minibar',
    guest_notes: '',
    internal_notes: '',
    created_at: new Date(Date.now() - 240 * 60000).toISOString(),
    completed_at: new Date(Date.now() - 180 * 60000).toISOString(),
    icon: '🧹',
  },
  {
    id: 7,
    type: 'Laundry',
    room_number: '615',
    status: 'in_progress' as TaskStatus,
    priority: 'normal',
    notes: 'Collect laundry',
    guest_notes: 'Express service requested',
    internal_notes: 'Priority processing',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    started_at: new Date(Date.now() - 20 * 60000).toISOString(),
    icon: '👔',
  },
  {
    id: 8,
    type: 'Cleaning Request',
    room_number: '103',
    status: 'assigned' as TaskStatus,
    priority: 'low',
    notes: 'Vacuum only',
    guest_notes: '',
    internal_notes: '',
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    assigned_at: new Date(Date.now() - 5 * 60000).toISOString(),
    icon: '🧹',
  },
];

export default function StaffPortal() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskStatus>('assigned');
  const [availability, setAvailability] = useState<StaffAvailability>('available');
  const [timers, setTimers] = useState<Record<number, number>>({});

  // Fetch service requests (all tasks)
  const { data: serviceRequestsData, isLoading: isLoadingTasks, error: tasksError } = useGetServiceRequests();
  
  // Debug logging
  useEffect(() => {
    console.log('=== SERVICE REQUESTS DEBUG ===');
    console.log('Raw service requests data:', serviceRequestsData);
    console.log('Is Loading:', isLoadingTasks);
    console.log('Error:', tasksError);
    console.log('Data type:', Array.isArray(serviceRequestsData) ? 'Array' : typeof serviceRequestsData);
    if (serviceRequestsData) {
      console.log('Number of requests:', Array.isArray(serviceRequestsData) ? serviceRequestsData.length : 'Not an array');
    }
    console.log('============================');
  }, [serviceRequestsData, isLoadingTasks, tasksError]);
  
  // Map API data to Task format
  const tasks: Task[] = React.useMemo(() => {
    if (!serviceRequestsData) return [];
    
    const requests = Array.isArray(serviceRequestsData) ? serviceRequestsData : [];
    console.log('Processing requests:', requests.length);
    
    return requests
      .map(mapServiceRequestToAssignedTask)
      .filter((task): task is AssignedTask => task !== null)
      .map(mapAssignedTaskToTask);
  }, [serviceRequestsData]);

  // Fetch staff info
  const { data: allStaff = [], isLoading: isLoadingStaff } = useGetStaff();
  const currentStaff = allStaff.find(s => s.id === STAFF_ID);

  const clockIn = useClockIn();
  const clockOut = useClockOut();

  // Filter tasks by tab
  const assignedTasks = tasks.filter(t => t.status === 'assigned');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const todayTasks = tasks;

  // Timer for in-progress tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const newTimers = { ...prev };
        inProgressTasks.forEach(task => {
          if (task.started_at) {
            const elapsed = Math.floor((Date.now() - new Date(task.started_at).getTime()) / 1000);
            newTimers[task.id] = elapsed;
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [inProgressTasks]);

  const handleClockIn = async () => {
    try {
      await clockIn.mutateAsync(STAFF_ID);
      toast.success('Clocked in successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut.mutateAsync(STAFF_ID);
      toast.success('Clocked out successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to clock out');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min${mins !== 1 ? 's' : ''} ${secs} sec${secs !== 1 ? 's' : ''}`;
  };

  const handleAvailabilityChange = (newStatus: StaffAvailability) => {
    setAvailability(newStatus);
    toast.success(`Status set to ${newStatus}`);
  };

  const getAvailabilityColor = () => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {currentStaff?.first_name || 'Staff Member'}!
                </h1>
                <p className="text-sm text-gray-600">
                  {currentStaff?.department || 'Staff'} • {currentStaff?.shift || 'Day'} Shift
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {currentStaff?.is_on_duty ? (
                <button
                  onClick={handleClockOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Clock Out
                </button>
              ) : (
                <button
                  onClick={handleClockIn}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <Clock className="w-4 h-4" />
                  Clock In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Today's Tasks</h3>
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{todayTasks.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Assigned</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{assignedTasks.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">In Progress</h3>
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Completed</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Tasks</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your assigned tasks and update their status</p>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {isLoadingTasks ? (
              <div className="p-12 text-center">
                <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading tasks...</h3>
                <p className="text-gray-600">Please wait while we fetch your assigned tasks.</p>
              </div>
            ) : tasksError ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading tasks</h3>
                <p className="text-gray-600 mb-2">There was an error fetching your tasks.</p>
                <p className="text-xs text-red-600 font-mono">
                  {tasksError instanceof Error ? tasksError.message : 'Unknown error'}
                </p>
                <p className="text-xs text-gray-500 mt-2">Check browser console for details</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks assigned</h3>
                <p className="text-gray-600">You don't have any tasks assigned at the moment.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDetail(true);
                  }}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        <span className="mr-2">{task.icon}</span>
                        {task.service_type || task.type} - Room {task.room_number}
                      </h3>
                      {task.request_number && (
                        <p className="text-xs text-gray-500 mb-2">Request #{task.request_number}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-3">{task.notes || task.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.guest_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{task.guest_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Room {task.room_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(task.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

// Task Detail Modal Component
function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [notes, setNotes] = useState('');
  
  const updateTaskStatus = useUpdateTaskStatus(task.id);

  const handleUpdateStatus = async () => {
    try {
      await updateTaskStatus.mutateAsync(status);
      toast.success('Task status updated successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to update task status');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Task Details</h2>
              <p className="text-gray-600">Update task status and add notes</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          {/* Task Info */}
          <div className="mb-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
            {task.request_number && (
              <div className="mb-4 pb-4 border-b border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Request Number</p>
                <p className="font-bold text-lg text-gray-900">{task.request_number}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Room Number</p>
                <p className="font-bold text-lg text-gray-900">Room {task.room_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Priority</p>
                <p className="font-bold text-lg text-gray-900 capitalize">{task.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-bold text-lg text-gray-900">{task.service_type || task.issue_type || task.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Requested</p>
                <p className="font-bold text-lg text-gray-900">
                  {new Date(task.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {task.guest_name && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Guest</p>
                  <p className="font-bold text-lg text-gray-900">{task.guest_name}</p>
                </div>
              )}
            </div>
            {task.notes && (
              <div className="mt-4 pt-4 border-t border-indigo-200">
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-gray-900">{task.notes || task.description}</p>
              </div>
            )}
          </div>

          {/* Status Update */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
              >
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this task..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={updateTaskStatus.isPending}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateTaskStatus.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
