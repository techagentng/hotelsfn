import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import { LayoutDashboard, Bed, Calendar, Settings, LogOut } from "lucide-react";
import dynamic from 'next/dynamic';
import Sidebar from "../components/Sidebar";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });


export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">DASHBOARD</h1>
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <img
                src="https://i.pravatar.cc/50"
                alt="User"
                className="w-10 h-10 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold">{user?.fullname || 'User'}</p>
                <p className="text-sm text-gray-500 capitalize">{user?.role_name || 'User'}</p>
              </div>
            </button>
            
            {/* Dropdown menu */}
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Top Cards */}
        <section className="grid grid-cols-4 gap-6 mb-10">
          <StatCard title="New Booking" value="450" percent="65" />
          <StatCard title="Scheduled Room" value="258" percent="47" />
          <StatCard title="Check In" value="97" green />
          <StatCard title="Check Out" value="97" red />
        </section>

        {/* Available Rooms */}
        <section className="grid grid-cols-2 gap-6 mb-10">
          <RoomBar title="Available Rooms Today" value={345} max={500} />
          <RoomBar title="Sold Out Rooms Today" value={150} max={500} />
        </section>

        {/* Reservation Statistics Chart */}
        <section className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-bold mb-4">Reservation Statistics</h2>
          <div className="h-80 -mx-2 -mb-6">
            <Chart
              options={{
                chart: {
                  type: 'bar',
                  height: 350,
                  toolbar: {
                    show: true,
                    tools: {
                      download: true,
                      selection: true,
                      zoom: true,
                      zoomin: true,
                      zoomout: true,
                      pan: false,
                      reset: true
                    }
                  },
                  fontFamily: 'Inter, sans-serif',
                },
                plotOptions: {
                  bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 4,
                  },
                },
                dataLabels: {
                  enabled: false
                },
                stroke: {
                  show: true,
                  width: 2,
                  colors: ['transparent']
                },
                xaxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  labels: {
                    style: {
                      colors: '#6B7280',
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif',
                    }
                  },
                  axisBorder: {
                    show: false
                  },
                  axisTicks: {
                    show: false
                  }
                },
                yaxis: {
                  title: {
                    text: 'Number of Reservations'
                  },
                  labels: {
                    style: {
                      colors: '#6B7280',
                      fontSize: '12px',
                      fontFamily: 'Inter, sans-serif',
                    }
                  }
                },
                fill: {
                  opacity: 1,
                  colors: ['#3B82F6']
                },
                tooltip: {
                  y: {
                    formatter: function (val) {
                      return val + " reservations";
                    }
                  }
                },
                grid: {
                  borderColor: '#F3F4F6',
                  strokeDashArray: 4,
                  xaxis: {
                    lines: {
                      show: false
                    }
                  },
                  yaxis: {
                    lines: {
                      show: true
                    }
                  }
                }
              }}
              series={[{
                name: 'Reservations',
                data: [30, 40, 45, 50, 49, 60, 70, 91, 85, 90, 95, 100]
              }]}
              type="bar"
              height="100%"
            />
          </div>
        </section>

        {/* Revenue + Donut Section */}
        <section className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Total Revenue</h2>
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
            </div>
            <p className="text-2xl font-bold mb-4">$85,430</p>
            <div className="h-40">
              <Chart
                options={{
                  chart: {
                    type: 'line',
                    toolbar: { show: false },
                    sparkline: { enabled: true },
                  },
                  stroke: {
                    curve: 'smooth',
                    width: 2,
                  },
                  colors: ['#4F46E5'],
                  xaxis: {
                    labels: { show: false },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                  },
                  yaxis: { show: false },
                  grid: { show: false },
                  tooltip: { enabled: false },
                }}
                series={[{
                  name: 'Revenue',
                  data: [30000, 40000, 35000, 50000, 49000, 50000, 60000, 70000, 75000, 80000, 82000, 85430]
                }]}
                type="line"
                height="100%"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Check-in Ratio</h2>
            <div className="h-40">
              <Chart
                options={{
                  chart: {
                    type: 'donut',
                  },
                  labels: ['Checked In', 'Pending', 'No Show'],
                  colors: ['#10B981', '#F59E0B', '#EF4444'],
                  legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                  },
                  plotOptions: {
                    pie: {
                      donut: {
                        size: '65%',
                      },
                    },
                  },
                  dataLabels: {
                    enabled: false,
                  },
                  responsive: [{
                    breakpoint: 480,
                    options: {
                      chart: {
                        width: 200
                      },
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }]
                }}
                series={[65, 25, 10]}
                type="donut"
                height="100%"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white p-6 shadow-xl overflow-auto">
        <RightSection />
      </aside>
    </div>
  );
}

function MenuItem({ 
  icon, 
  label, 
  active 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean 
}) {
  return (
    <a
      href="#"
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function StatCard({ title, value, percent, green, red }: any) {
  const color = green ? "text-green-500" : red ? "text-red-500" : "text-yellow-500";

  return (
    <div className="bg-white p-6 rounded-xl shadow flex flex-col">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="flex justify-between items-center mt-2">
        <span className="text-3xl font-bold">{value}</span>
        {percent && <span className={`${color} text-xl font-bold`}>{percent}%</span>}
        {green && <span className="text-green-500 text-2xl">⬤</span>}
        {red && <span className="text-red-500 text-2xl">⬤</span>}
      </div>
    </div>
  );
}

function RoomBar({ title, value, max }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-3">{title}</h3>
      <div className="w-full h-3 bg-gray-200 rounded-full mb-3">
        <div
          className="h-3 bg-yellow-500 rounded-full"
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function RightSection() {
  return (
    <div className="space-y-10">
      {/* Newest Booking */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Newest Booking</h2>
          <button className="text-sm text-gray-400">See more</button>
        </div>
        <BookingCard />
        <BookingCard />
        <BookingCard />
      </section>

      {/* Guest Preferences */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">Guest Preferences</h2>
          <button className="text-sm text-gray-400">See more</button>
        </div>
        <PreferenceCard />
        <PreferenceCard />
      </section>
    </div>
  );
}

function BookingCard() {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg mb-3">
      <div>
        <p className="text-xs text-gray-500">April 4th, 2021</p>
        <p className="font-semibold">Steffan White</p>
        <p className="text-sm text-gray-500">Room A‑21 · 3‑5 Person</p>
      </div>
    </div>
  );
}

function PreferenceCard() {
  return (
    <div className="bg-gray-50 p-3 rounded-lg mb-3">
      <p className="font-semibold">Room A‑21</p>
      <p className="font-medium mt-1">Steffan White</p>
      <ul className="text-sm text-gray-600 mt-2 list-disc ml-4">
        <li>Need Cheese Omelette in Breakfast</li>
        <li>Beef Burger in Lunch</li>
      </ul>
    </div>
  );
}
