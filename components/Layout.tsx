import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <main style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 0 }}>{children}</main>
    </div>
  );
}