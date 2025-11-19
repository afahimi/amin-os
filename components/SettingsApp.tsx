import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Monitor, MousePointer, Layout } from 'lucide-react';

const SettingsApp: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="h-full flex flex-col text-white p-6 overflow-y-auto">
      <h2 className={`text-2xl font-bold mb-6 ${currentTheme.windowStyle.titleFont}`}>Settings</h2>
      
      <div className="space-y-8">
        {/* Theme Section */}
        <section>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-gray-300">
            <Monitor size={18} />
            Appearance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableThemes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setTheme(theme.id)}
                className={`
                  relative group p-4 rounded-xl border text-left transition-all duration-300
                  ${currentTheme.id === theme.id ? 'ring-2 ring-offset-2 ring-offset-black/50' : 'hover:bg-white/5'}
                `}
                style={{
                  backgroundColor: theme.colors.windowBg,
                  borderColor: currentTheme.id === theme.id ? theme.colors.accentPrimary : theme.colors.windowBorder,
                  '--tw-ring-color': theme.colors.accentPrimary
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold" style={{ color: theme.colors.accentPrimary }}>{theme.name}</span>
                  {currentTheme.id === theme.id && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">Active</span>
                  )}
                </div>
                
                {/* Preview Swatches */}
                <div className="flex gap-2 mt-3">
                  <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: theme.colors.background }} title="Background" />
                  <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: theme.colors.accentPrimary }} title="Primary Accent" />
                  <div className="w-6 h-6 rounded-full border border-white/10" style={{ backgroundColor: theme.colors.accentSecondary }} title="Secondary Accent" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-bold mb-2 text-gray-400">Current Theme Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1 flex items-center gap-2"><MousePointer size={12}/> Cursor</div>
              <div className="capitalize">{currentTheme.cursor.type}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1 flex items-center gap-2"><Layout size={12}/> Window Style</div>
              <div>{currentTheme.windowStyle.borderRadius === '0px' ? 'Sharp' : 'Rounded'}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsApp;
