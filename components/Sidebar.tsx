import Link from 'next/link';
import { LayoutDashboard, Bed, Calendar, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';

const MenuItem = ({ 
  icon, 
  label, 
  active = false,
  href = '#'
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  href?: string;
}) => {
  const router = useRouter();
  const isActive = active || router.pathname === href;
  
  return (
    <Link 
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">
      <div>
        <div className="text-2xl font-bold mb-10 text-indigo-600">LogoType</div>
        <nav className="space-y-2">
          <MenuItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            href="/dashboard"
          />
          <MenuItem 
            icon={<Bed size={20} />} 
            label="Rooms" 
            href="/rooms"
          />
          <MenuItem 
            icon={<Calendar size={20} />} 
            label="Bookings" 
            href="/bookings"
          />
          <MenuItem 
            icon={<Settings size={20} />} 
            label="Preferences" 
            href="/preferences"
          />
        </nav>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button 
          onClick={() => {
            // Handle logout
            localStorage.removeItem('auth');
            window.location.href = '/login';
          }}
          className="flex items-center space-x-3 w-full p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-gray-100">
            <LogOut size={20} />
          </div>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}