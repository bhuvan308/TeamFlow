export function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="mb-4 flex gap-1 border-b border-brand-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`relative -mb-px px-3 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.value ? 'text-gradient font-semibold' : 'text-brand-400 hover:text-brand-600'
          }`}
        >
          {tab.label}
          {activeTab === tab.value && (
            <span className="absolute inset-x-1 -bottom-px h-[2px] rounded-full bg-accent-gradient" />
          )}
        </button>
      ))}
    </div>
  );
}
