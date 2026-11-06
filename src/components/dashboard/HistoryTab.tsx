/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Laptop, CheckCircle2, XCircle, Clock, MapPin, Globe } from 'lucide-react';
import { getLoginHistory } from '../../lib/storage';
import { LoginHistoryItem } from '../../types/auth';

export const HistoryTab: React.FC = () => {
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getLoginHistory());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Historial de Inicios de Sesión y Dispositivos
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Supervisión de accesos recientes y registros de seguridad de tu cuenta
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {history.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No hay registros de actividad recientes.
          </div>
        ) : (
          history.map((item) => {
            const isSuccess = item.status === 'success';
            const isMobile = item.device.toLowerCase().includes('móvil') || item.device.toLowerCase().includes('mobile');

            return (
              <div key={item.id} className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    isSuccess 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}>
                    {isMobile ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {item.device} • {item.browser}
                      </h4>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSuccess
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isSuccess ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{isSuccess ? 'Acceso correcto' : 'Intento fallido'}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        IP: {item.ip}
                      </span>
                      {item.reason && (
                        <>
                          <span>•</span>
                          <span className="text-rose-500 font-medium">Motivo: {item.reason}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 shrink-0 sm:self-center">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(item.timestamp).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
