import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { OfflineIndicator } from './components/OfflineIndicator';
import { UpdateNotification } from './components/UpdateNotification';
import { SyncIndicator } from './components/SyncIndicator';
import { SyncManager } from './components/SyncManager';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <SyncManager />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>

        <OfflineIndicator />
        <UpdateNotification />
        <SyncIndicator />
      </div>
    </BrowserRouter>
  );
}

export default App;
