import React, { useState } from 'react';
import { touristCategories } from '../data/categories';
import './PreferenceFilter.css';

export default function PreferenceFilter({
  selectedCategory,
  onSelectCategory,
  locations,
  selectedLocation,
  onSelectLocation,
}) {
  const [isTrayOpen, setIsTrayOpen] = useState(true);

  // Compute item counts for each category
  const getCategoryCount = (catId) => {
    if (catId === 'all') return locations.length;
    return locations.filter((loc) => loc.category === catId).length;
  };

  // Filter locations matching current category
  const filteredLocations =
    selectedCategory === 'all'
      ? locations
      : locations.filter((loc) => loc.category === selectedCategory);

  const activeCategoryObj =
    touristCategories.find((cat) => cat.id === selectedCategory) || touristCategories[0];

  return (
    <>
      {/* Top Preference Pill Bar */}
      <nav className="preference-bar-wrapper" aria-label="Tourist Preference Categories">
        <div className="preference-pills-container">
          {touristCategories.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`preference-pill ${isActive ? 'active' : ''}`}
                style={{
                  backgroundColor: isActive ? cat.color : undefined,
                }}
                aria-pressed={isActive}
              >
                <span className="preference-pill-icon">{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="preference-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Informative category description banner */}
        {activeCategoryObj?.description && (
          <div className="preference-description-bar">
            <span>{activeCategoryObj.icon} {activeCategoryObj.description}</span>
          </div>
        )}
      </nav>

      {/* Bottom Quick Browse Tray for Selected Category */}
      <aside className="preference-tray-container" aria-label="Category Destinations Quick Browse">
        <button
          type="button"
          onClick={() => setIsTrayOpen((prev) => !prev)}
          className="preference-tray-toggle"
          aria-expanded={isTrayOpen}
        >
          <span>{activeCategoryObj.icon}</span>
          <span>
            {activeCategoryObj.label} ({filteredLocations.length})
          </span>
          <span className="text-[10px] opacity-75">{isTrayOpen ? '▼' : '▲'}</span>
        </button>

        {isTrayOpen && (
          <div className="preference-tray-items">
            {filteredLocations.map((loc) => {
              const isSelected = selectedLocation?.id === loc.id;

              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`preference-mini-card ${isSelected ? 'active-place' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectLocation(loc);
                    }
                  }}
                >
                  <img
                    src={loc.thumbnail}
                    alt={loc.name}
                    className="preference-mini-thumb"
                    loading="lazy"
                  />
                  <div className="preference-mini-info">
                    <span className="preference-mini-name">{loc.name}</span>
                    <div className="preference-mini-tags">
                      {loc.tags?.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="preference-mini-tag">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </>
  );
}
