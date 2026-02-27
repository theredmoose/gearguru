import { useState } from 'react';
import type { User } from 'firebase/auth';
import type { AppSettings, Sport, SizingModel } from '../types';
import { SIZING_MODEL_LABELS } from '../types';
import { ScreenHeader } from './ScreenHeader';
import { SPORT_LABELS } from '../constants/labels';

interface SettingsScreenProps {
  settings: AppSettings;
  user: User;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onResetSettings: () => void;
  onSignOut: () => void;
  onSendPasswordReset: (email: string) => Promise<void>;
  onBack: () => void;
}

const DEFAULT_SPORTS: Sport[] = ['alpine', 'nordic-classic', 'nordic-skate', 'snowboard', 'hockey'];

const sectionTitleCls = 'text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3';
const rowCls = 'flex items-center justify-between py-4 border-b border-slate-100 last:border-0';
const labelCls = 'text-sm font-semibold text-slate-700';
const subLabelCls = 'text-[11px] text-slate-400 mt-0.5';
const toggleBtnCls = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ECFDF5] text-[#008751] border border-emerald-200 hover:bg-emerald-50 transition-colors';

export function SettingsScreen({
  settings,
  user,
  onUpdateSettings,
  onResetSettings,
  onSignOut,
  onSendPasswordReset,
  onBack,
}: SettingsScreenProps) {
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const isEmailProvider = user.providerData?.some(p => p.providerId === 'password');

  async function handlePasswordReset() {
    if (!user.email) return;
    setResetError(null);
    try {
      await onSendPasswordReset(user.email);
      setResetSent(true);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to send reset email.');
    }
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <ScreenHeader title="Settings" onBack={onBack} />

      <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-6 py-6 flex flex-col gap-8">

        {/* ── Units ─────────────────────────────────── */}
        <section>
          <p className={sectionTitleCls}>Units</p>
          <div className="bg-slate-50 rounded-3xl px-4">

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Height</p>
                <p className={subLabelCls}>Used in member profile</p>
              </div>
              <button
                className={toggleBtnCls}
                onClick={() =>
                  onUpdateSettings({ heightUnit: settings.heightUnit === 'cm' ? 'ft-in' : 'cm' })
                }
                aria-label="Toggle height unit"
              >
                {settings.heightUnit === 'cm' ? 'cm' : 'ft / in'}
              </button>
            </div>

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Weight</p>
                <p className={subLabelCls}>Used in member profile</p>
              </div>
              <button
                className={toggleBtnCls}
                onClick={() =>
                  onUpdateSettings({ weightUnit: settings.weightUnit === 'kg' ? 'lbs' : 'kg' })
                }
                aria-label="Toggle weight unit"
              >
                {settings.weightUnit === 'kg' ? 'kg' : 'lbs'}
              </button>
            </div>

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Ski / Board Length</p>
                <p className={subLabelCls}>Used in sizing cards</p>
              </div>
              <button
                className={toggleBtnCls}
                onClick={() =>
                  onUpdateSettings({ skiLengthUnit: settings.skiLengthUnit === 'cm' ? 'in' : 'cm' })
                }
                aria-label="Toggle ski length unit"
              >
                {settings.skiLengthUnit === 'cm' ? 'cm' : 'inches'}
              </button>
            </div>

          </div>
        </section>

        {/* ── Default Sport ─────────────────────────── */}
        <section>
          <p className={sectionTitleCls}>Default Sport</p>
          <p className="text-[11px] text-slate-400 mb-2">
            The sport shown first when viewing member sizing details.
          </p>
          <div className="bg-slate-50 rounded-3xl px-4">
            {DEFAULT_SPORTS.map(sport => (
              <div key={sport} className={rowCls}>
                <p className={labelCls}>{SPORT_LABELS[sport]}</p>
                <button
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    settings.defaultSport === sport
                      ? 'bg-[#008751] text-white border-[#008751]'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                  onClick={() => onUpdateSettings({ defaultSport: sport })}
                  aria-label={`Set ${SPORT_LABELS[sport]} as default`}
                  aria-pressed={settings.defaultSport === sport}
                >
                  {settings.defaultSport === sport ? 'Default' : 'Set'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Display ───────────────────────────────── */}
        <section>
          <p className={sectionTitleCls}>Display</p>
          <p className="text-[11px] text-slate-400 mb-2">
            Choose which measurements appear in member profiles.
          </p>
          <div className="bg-slate-50 rounded-3xl px-4">

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Foot Length</p>
                <p className={subLabelCls}>Shown in profile stats</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle foot display">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.display.showFoot}
                  onChange={e => onUpdateSettings({ display: { ...settings.display, showFoot: e.target.checked } })}
                  aria-label="Show foot length"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]" />
              </label>
            </div>

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Hand Size</p>
                <p className={subLabelCls}>Shown in profile stats</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle hand display">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.display.showHand}
                  onChange={e => onUpdateSettings({ display: { ...settings.display, showHand: e.target.checked } })}
                  aria-label="Show hand size"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008751]" />
              </label>
            </div>

          </div>
        </section>

        {/* ── Sizing ────────────────────────────────── */}
        <section>
          <p className={sectionTitleCls}>Sizing</p>
          <div className="bg-slate-50 rounded-3xl px-4">

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Size Display</p>
                <p className={subLabelCls}>
                  {settings.sizingDisplay === 'range'
                    ? 'Show recommended + range (e.g. 185 cm, 175–195)'
                    : 'Show recommended size only (e.g. 185 cm)'}
                </p>
              </div>
              <button
                className={toggleBtnCls}
                onClick={() =>
                  onUpdateSettings({ sizingDisplay: settings.sizingDisplay === 'range' ? 'single' : 'range' })
                }
                aria-label="Toggle sizing display format"
              >
                {settings.sizingDisplay === 'range' ? 'Range' : 'Single'}
              </button>
            </div>

            <div className={rowCls}>
              <div className="flex-1 mr-4">
                <p className={labelCls}>Default DIN Setting</p>
                <p className={subLabelCls}>Pre-fills the DIN setting when you add an alpine ski. Leave blank to not pre-fill.</p>
              </div>
              <input
                type="number"
                className="w-20 border border-slate-200 rounded-xl px-3 py-1.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#008751]/30 text-center"
                value={settings.defaultDIN ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdateSettings({ defaultDIN: val === '' ? undefined : parseFloat(val) });
                }}
                placeholder="DIN Setting"
                step="0.5"
                min="1"
                max="14"
                aria-label="Default DIN setting"
              />
            </div>

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Default Nordic Model</p>
                <p className={subLabelCls}>Sizing chart used for Nordic ski calculations</p>
              </div>
              <div className="flex gap-1">
                {(['generic', 'fischer', 'evosports'] as SizingModel[]).map((m) => (
                  <button
                    key={m}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      settings.sizingModel === m
                        ? 'bg-[#008751] text-white border-[#008751]'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                    onClick={() => onUpdateSettings({ sizingModel: m })}
                    aria-pressed={settings.sizingModel === m}
                    aria-label={`Set ${SIZING_MODEL_LABELS[m]} as default Nordic sizing model`}
                  >
                    {SIZING_MODEL_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Account ───────────────────────────────── */}
        <section>
          <p className={sectionTitleCls}>Account</p>
          <div className="bg-slate-50 rounded-3xl px-4">

            <div className={rowCls}>
              <div>
                <p className={labelCls}>Email</p>
                <p className={subLabelCls}>{user.email ?? '—'}</p>
              </div>
            </div>

            {isEmailProvider && (
              <div className={rowCls}>
                <div>
                  <p className={labelCls}>Password</p>
                  <p className={subLabelCls}>
                    {resetSent ? 'Reset email sent — check your inbox.' : 'Send a password reset email'}
                  </p>
                  {resetError && (
                    <p className="text-xs text-red-500 mt-1">{resetError}</p>
                  )}
                </div>
                <button
                  className={`${toggleBtnCls} ${resetSent ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handlePasswordReset}
                  disabled={resetSent}
                  aria-label="Send password reset email"
                >
                  {resetSent ? 'Sent' : 'Reset'}
                </button>
              </div>
            )}

            <div className={rowCls}>
              <p className={labelCls}>Sign Out</p>
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                onClick={onSignOut}
                aria-label="Sign out"
              >
                Sign Out
              </button>
            </div>

          </div>
        </section>

        {/* ── Reset ────────────────────────────────── */}
        <section>
          <button
            className="w-full py-3 rounded-xl text-sm font-bold text-slate-400 border border-slate-200 hover:bg-slate-50 transition-colors"
            onClick={onResetSettings}
            aria-label="Reset all settings to defaults"
          >
            Reset to Defaults
          </button>
        </section>

      </div>
    </div>
  );
}
