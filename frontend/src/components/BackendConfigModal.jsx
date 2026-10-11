import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, X, ExternalLink, Globe } from 'lucide-react';
import axios from 'axios';
import { getBackendUrl, getCustomBackendUrl, setCustomBackendUrl, getRawBackendHost } from '../config/apiConfig';
import { useNotificationStore } from '../store/notificationStore';

export default function BackendConfigModal({ isOpen, onClose }) {
  const { reconnectWebSocket } = useNotificationStore();
  const [urlInput, setUrlInput] = useState('');
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error' | null
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getCustomBackendUrl() || getRawBackendHost() || '';
      setUrlInput(current);
      setTestStatus(null);
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestStatus('error');
      setTestMessage('Please enter a backend URL to test.');
      return;
    }

    let testTarget = urlInput.trim().replace(/\/+$/, '');
    if (!testTarget.startsWith('http://') && !testTarget.startsWith('https://')) {
      testTarget = `https://${testTarget}`;
    }
    const apiTarget = testTarget.endsWith('/api') ? testTarget : `${testTarget}/api`;

    setTestStatus('testing');
    setTestMessage('Pinging backend server...');

    try {
      // Test the public classrooms or timetable endpoint
      const response = await axios.get(`${apiTarget}/classrooms`, {
        timeout: 8000,
      });

      if (response.status === 200) {
        setTestStatus('success');
        setTestMessage('Backend is online and responding! (HTTP 200 OK)');
      } else {
        setTestStatus('success');
        setTestMessage(`Backend responded with status ${response.status}`);
      }
    } catch (err) {
      if (err.response) {
        // Backend answered with an HTTP error code (meaning it's reached!)
        setTestStatus('success');
        setTestMessage(`Backend reached (HTTP ${err.response.status}). Services are live!`);
      } else {
        setTestStatus('error');
        setTestMessage(
          'Could not reach backend. If this is a free Render instance, it might take 30-50s to wake up from cold sleep.'
        );
      }
    }
  };

  const handleSave = () => {
    setCustomBackendUrl(urlInput.trim());
    reconnectWebSocket();
    setTestStatus('success');
    setTestMessage('Saved! Backend URL updated successfully.');
    setTimeout(() => {
      onClose();
      // Reload page to re-initialize all api instances cleanly
      window.location.reload();
    }, 600);
  };

  const handleReset = () => {
    setCustomBackendUrl('');
    setUrlInput('');
    reconnectWebSocket();
    setTimeout(() => {
      onClose();
      window.location.reload();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Backend API Connection</h3>
              <p className="text-[11px] text-slate-400">Configure or link your deployed Spring Boot server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Backend Server URL (Render / Cloud Host)
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://final-xxxx.onrender.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Paste your Render Web Service URL. Example: <code className="text-indigo-400 font-mono">https://final.onrender.com</code>
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                testStatus === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : testStatus === 'error'
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                  : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
              }`}
            >
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
              {testStatus === 'error' && <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />}
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin text-indigo-400" />}
              <span>{testMessage}</span>
            </div>
          )}

          {/* Render & Vercel Tip */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>💡 Permanent Setup via Vercel Dashboard:</span>
            </span>
            <p>
              In your <strong>Vercel Project &gt; Settings &gt; Environment Variables</strong>, you can also add:
            </p>
            <div className="space-y-1 font-mono text-[10px] text-indigo-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <div>VITE_API_BASE_URL = https://&lt;your-render-url&gt;/api</div>
              <div>VITE_WS_URL = wss://&lt;your-render-url&gt;/ws</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-300 transition"
          >
            Reset Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              Test Connection
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition"
            >
              Save &amp; Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
