import { useEffect, useState } from 'react';
import { testDatabaseConnection } from './lib/db';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

function App() {
  const [dbStatus, setDbStatus] = useState<{
    loading: boolean;
    success: boolean;
    message: string;
  }>({
    loading: true,
    success: false,
    message: 'Checking database connection...',
  });

  useEffect(() => {
    const checkConnection = async () => {
      const result = await testDatabaseConnection();
      setDbStatus({
        loading: false,
        success: result.success,
        message: result.message,
      });
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
          React + Supabase
        </h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              {dbStatus.loading ? (
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              ) : dbStatus.success ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className="font-semibold text-slate-700">Database Status</p>
                <p className="text-sm text-slate-500">{dbStatus.message}</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-slate-600 font-medium">
              Project is ready for development
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Architecture ready for Telegram Mini App integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
