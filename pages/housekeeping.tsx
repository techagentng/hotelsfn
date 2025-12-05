import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  Filter,
  X,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Zap,
  BarChart3,
  Calendar,
  MapPin,
  Briefcase,
  Play,
  CheckSquare,
  XSquare,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'exception';
type RoomStatus = 'clean' | 'dirty' | 'maintenance' | 'occupied';

interface CleaningTask {
  id: string;
  roomNumber: string;
  roomType: string;
  status: TaskStatus;
  assignedStaff?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  exceptionReason?: string;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  status: 'available' | 'busy' | 'break';
  assignedRooms: number;
  completedToday: number;
}

interface CleaningHistory {
  id: string;
  roomNumber: string;
  staff: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'exception';
  notes?: string;
}

const mockTasks: CleaningTask[] = [
  {
    id: 'TK-001',
    roomNumber: '101',
    roomType: 'Standard',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-12-04T08:00:00',
  },
  {
    id: 'TK-002',
    roomNumber: '102',
    roomType: 'Deluxe',
    status: 'in-progress',
    assignedStaff: 'Maria Garcia',
    priority: 'medium',
    createdAt: '2024-12-04T08:15:00',
    startedAt: '2024-12-04T09:00:00',
  },
  {
    id: 'TK-003',
    roomNumber: '103',
    roomType: 'Suite',
    status: 'completed',
    assignedStaff: 'John Smith',
    priority: 'high',
    createdAt: '2024-12-04T08:30:00',
    startedAt: '2024-12-04T08:45:00',
    completedAt: '2024-12-04T09:45:00',
  },
  {
    id: 'TK-004',
    roomNumber: '201',
    roomType: 'Standard',
    status: 'pending',
    priority: 'low',
    createdAt: '2024-12-04T09:00:00',
  },
  {
    id: 'TK-005',
    roomNumber: '202',
    roomType: 'Deluxe',
    status: 'exception',
    assignedStaff: 'Sarah Johnson',
    priority: 'high',
    createdAt: '2024-12-04T08:20:00',
    startedAt: '2024-12-04T08:50:00',
    exceptionReason: 'Guest refusal - guest still in room',
  },
  {
    id: 'TK-006',
    roomNumber: '203',
    roomType: 'Suite',
    status: 'in-progress',
    assignedStaff: 'Mike Chen',
    priority: 'medium',
    createdAt: '2024-12-04T09:10:00',
    startedAt: '2024-12-04T09:30:00',
  },
];

const mockStaff: Staff[] = [
  {
    id: 'ST-001',
    name: 'Maria Garcia',
    role: 'Housekeeper',
    status: 'busy',
    assignedRooms: 3,
    completedToday: 5,
  },
  {
    id: 'ST-002',
    name: 'John Smith',
    role: 'Housekeeper',
    status: 'available',
    assignedRooms: 0,
    completedToday: 8,
  },
  {
    id: 'ST-003',
    name: 'Sarah Johnson',
    role: 'Lead Housekeeper',
    status: 'busy',
    assignedRooms: 2,
    completedToday: 6,
  },
  {
    id: 'ST-004',
    name: 'Mike Chen',
    role: 'Housekeeper',
    status: 'busy',
    assignedRooms: 2,
    completedToday: 4,
  },
  {
    id: 'ST-005',
    name: 'Lisa Wong',
    role: 'Housekeeper',
    status: 'break',
    assignedRooms: 0,
    completedToday: 7,
  },
];

const mockHistory: CleaningHistory[] = [
  {
    id: 'HT-001',
    roomNumber: '101',
    staff: 'John Smith',
    startTime: '2024-12-04T08:00:00',
    endTime: '2024-12-04T08:45:00',
    status: 'completed',
  },
  {
    id: 'HT-002',
    roomNumber: '102',
    staff: 'Maria Garcia',
    startTime: '2024-12-04T08:15:00',
    endTime: '2024-12-04T09:15:00',
    status: 'completed',
  },
  {
    id: 'HT-003',
    roomNumber: '103',
    staff: 'Sarah Johnson',
    startTime: '2024-12-04T08:30:00',
    endTime: '2024-12-04T09:30:00',
    status: 'completed',
    notes: 'Extra cleaning required - deep clean completed',
  },
  {
    id: 'HT-004',
    roomNumber: '201',
    staff: 'Mike Chen',
    startTime: '2024-12-04T09:00:00',
    endTime: '2024-12-04T09:50:00',
    status: 'completed',
  },
];

const taskStatusStyles: Record<TaskStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  exception: 'bg-red-100 text-red-800',
};

const taskStatusIcons: Record<TaskStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 mr-1" />,
  'in-progress': <Zap className="w-4 h-4 mr-1" />,
  completed: <CheckCircle className="w-4 h-4 mr-1" />,
  exception: <AlertCircle className="w-4 h-4 mr-1" />,
};

const priorityStyles = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

const staffStatusStyles = {
  available: 'bg-green-100 text-green-800',
  busy: 'bg-blue-100 text-blue-800',
  break: 'bg-yellow-100 text-yellow-800',
};

export default function Housekeeping() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'staff' | 'history'>('tasks');
  const [selectedTask, setSelectedTask] = useState<CleaningTask | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const itemsPerPage = 10;

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch =
      task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.roomType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.assignedStaff?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pageCount = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
    pageIndex * itemsPerPage,
    (pageIndex + 1) * itemsPerPage
  );

  const pendingCount = mockTasks.filter(t => t.status === 'pending').length;
  const inProgressCount = mockTasks.filter(t => t.status === 'in-progress').length;
  const completedCount = mockTasks.filter(t => t.status === 'completed').length;
  const exceptionCount = mockTasks.filter(t => t.status === 'exception').length;
  const availableStaff = mockStaff.filter(s => s.status === 'available').length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPageIndex(0);
  };

  const handleStartTask = (task: CleaningTask) => {
    // In a real app, this would update the backend
    alert(`Task ${task.id} started`);
  };

  const handleCompleteTask = (task: CleaningTask) => {
    // In a real app, this would update the backend
    alert(`Task ${task.id} completed`);
  };

  const handleException = (task: CleaningTask) => {
    // In a real app, this would open a modal for exception details
    alert(`Exception reported for task ${task.id}`);
  };

  const handleAutoAssign = () => {
    alert('Auto-assigning cleaning tasks based on staff availability and room priority...');
  };

  const handleAutoGenerate = () => {
    alert('Auto-generating cleaning tasks for all dirty rooms...');
  };

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Housekeeping Management</h1>
              <p className="text-gray-500">Manage cleaning tasks, staff, and room status</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleAutoGenerate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Zap size={18} className="mr-2" />
                <span>Auto Generate</span>
              </button>
              <button
                onClick={handleAutoAssign}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <TrendingUp size={18} className="mr-2" />
                <span>Auto Assign</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Tasks</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Exceptions</p>
                  <p className="text-3xl font-bold text-red-600">{exceptionCount}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available Staff</p>
                  <p className="text-3xl font-bold text-indigo-600">{availableStaff}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CheckSquare size={18} className="inline mr-2" />
                Active Tasks
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'staff'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User size={18} className="inline mr-2" />
                Staff Assignments
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar size={18} className="inline mr-2" />
                Cleaning History
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Filter size={16} className="mr-2" />
                        <span>Filter</span>
                      </button>

                      {(searchTerm || statusFilter !== 'all') && (
                        <button
                          onClick={clearFilters}
                          className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                          <X size={16} className="mr-1" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filters */}
                  {showFilters && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Task Status</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                      >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="exception">Exception</option>
                      </select>
                    </div>
                  )}

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {paginatedTasks.length > 0 ? (
                      paginatedTasks.map((task) => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">Room {task.roomNumber}</h3>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${taskStatusStyles[task.status]}`}>
                                  {taskStatusIcons[task.status]}
                                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                                </span>
                                <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${priorityStyles[task.priority]}`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Briefcase size={16} className="mr-2 text-gray-400" />
                                  <span>{task.roomType}</span>
                                </div>
                                {task.assignedStaff && (
                                  <div className="flex items-center">
                                    <User size={16} className="mr-2 text-gray-400" />
                                    <span>{task.assignedStaff}</span>
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <Calendar size={16} className="mr-2 text-gray-400" />
                                  <span>{new Date(task.createdAt).toLocaleTimeString()}</span>
                                </div>
                                {task.exceptionReason && (
                                  <div className="flex items-center text-red-600">
                                    <AlertCircle size={16} className="mr-2" />
                                    <span>{task.exceptionReason}</span>
                                  </div>
                                )}
                              </div>

                              {task.notes && (
                                <p className="mt-2 text-sm text-gray-600 italic">Note: {task.notes}</p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2 ml-4">
                              {task.status === 'pending' && (
                                <button
                                  onClick={() => handleStartTask(task)}
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                  title="Start Task"
                                >
                                  <Play size={18} />
                                </button>
                              )}
                              {task.status === 'in-progress' && (
                                <button
                                  onClick={() => handleCompleteTask(task)}
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  title="Complete Task"
                                >
                                  <CheckSquare size={18} />
                                </button>
                              )}
                              {task.status !== 'completed' && (
                                <button
                                  onClick={() => handleException(task)}
                                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  title="Report Exception"
                                >
                                  <XSquare size={18} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p>No tasks found matching your criteria</p>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {pageCount > 1 && (
                    <div className="flex flex-col items-center justify-center px-4 py-4 mt-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
                          disabled={pageIndex === 0}
                          className="w-10 h-10 rounded-full border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        >
                          &lt;
                        </button>

                        {Array.from({ length: pageCount }, (_, i) => i).map(page => (
                          <button
                            key={page}
                            onClick={() => setPageIndex(page)}
                            className={`w-10 h-10 rounded-full text-sm ${
                              page === pageIndex
                                ? 'bg-gray-200 text-black'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {page + 1}
                          </button>
                        ))}

                        <button
                          onClick={() => setPageIndex(prev => Math.min(pageCount - 1, prev + 1))}
                          disabled={pageIndex === pageCount - 1}
                          className="w-10 h-10 rounded-full border text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                        >
                          &gt;
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Page {pageIndex + 1} of {pageCount}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Staff Tab */}
              {activeTab === 'staff' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockStaff.map((staff) => (
                      <div key={staff.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{staff.name}</h3>
                            <p className="text-sm text-gray-500">{staff.role}</p>
                          </div>
                          <span className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full ${staffStatusStyles[staff.status]}`}>
                            {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-600">
                              <MapPin size={16} className="mr-2 text-gray-400" />
                              <span className="text-sm">Assigned Rooms</span>
                            </div>
                            <span className="font-semibold text-gray-900">{staff.assignedRooms}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-600">
                              <CheckCircle size={16} className="mr-2 text-gray-400" />
                              <span className="text-sm">Completed Today</span>
                            </div>
                            <span className="font-semibold text-gray-900">{staff.completedToday}</span>
                          </div>

                          <div className="pt-3 border-t border-gray-100">
                            <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                              Assign Task
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mockHistory.map((record) => {
                          const startTime = new Date(record.startTime);
                          const endTime = new Date(record.endTime);
                          const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

                          return (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {record.roomNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {record.staff}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {startTime.toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {endTime.toLocaleTimeString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {duration} min
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  record.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.status === 'completed' ? (
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                  )}
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {record.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
