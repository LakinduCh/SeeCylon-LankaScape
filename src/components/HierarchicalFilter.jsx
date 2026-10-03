import React from 'react';
import taxonomyData from '../data/taxonomy.json';
import './HierarchicalFilter.css';

// Short category name dictionary for adaptive responsive displays
const shortCategoryNames = {
  'nature-wildlife': 'Nature',
  'cultural-heritage': 'Heritage',
  'coastal-marine': 'Coastal',
  'highland-adventure': 'Highland',
};

export default function HierarchicalFilter({
  activeCategory,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  locations,
}) {
  const categories = taxonomyData.categories;

  // Compute counts for categories
  const getCategoryCount = (catId) => {
    if (catId === 'all') return locations.length;
    return locations.filter((loc) => loc.categoryId === catId).length;
  };

  // Compute counts for subcategories
  const getSubcategoryCount = (catId, subcatId) => {
    if (subcatId === 'all') {
      return locations.filter((loc) => loc.categoryId === catId).length;
    }
    return locations.filter(
      (loc) => loc.categoryId === catId && loc.subcategoryId === subcatId
    ).length;
  };

  // Find currently active category object
  const currentCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <nav className="hierarchical-filter-wrapper" aria-label="Hierarchical Category and Subcategory Filters">
        {/* Tier 1: Primary Category Bar */}
        <div className="hierarchical-category-bar">
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              onSelectSubcategory('all');
            }}
            className={`hierarchical-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
            style={{
              backgroundColor: activeCategory === 'all' ? '#f59e0b' : undefined,
            }}
            aria-pressed={activeCategory === 'all'}
          >
            <span className="hierarchical-cat-icon">🌟</span>
            <span className="hierarchical-cat-name-full">All Wonders</span>
            <span className="hierarchical-cat-name-short">All</span>
            <span className="hierarchical-badge">{locations.length}</span>
          </button>

          {categories.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory('all');
                }}
                className={`hierarchical-cat-btn ${isActive ? 'active' : ''}`}
                style={{
                  backgroundColor: isActive ? cat.themeColor : undefined,
                }}
                aria-pressed={isActive}
              >
                <span className="hierarchical-cat-icon">{cat.icon}</span>
                <span className="hierarchical-cat-name-full">{cat.name}</span>
                <span className="hierarchical-cat-name-short">{shortCategoryNames[cat.id] || cat.name}</span>
                <span className="hierarchical-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Dynamic Child Subcategory Chips Bar */}
        {currentCategoryObj && (
          <div className="hierarchical-subcat-bar">
            <span className="hierarchical-subcat-label">Subcategory:</span>

            {/* All Subcategories in this parent category */}
            <button
              type="button"
              onClick={() => onSelectSubcategory('all')}
              className={`hierarchical-subcat-btn ${activeSubcategory === 'all' ? 'active' : ''}`}
            >
              <span>All {currentCategoryObj.name.split(' ')[0]}</span>
              <span className="hierarchical-badge opacity-80">
                {getSubcategoryCount(currentCategoryObj.id, 'all')}
              </span>
            </button>

            {/* Child Subcategories */}
            {currentCategoryObj.subcategories.map((sub) => {
              const subCount = getSubcategoryCount(currentCategoryObj.id, sub.id);
              const isSubActive = activeSubcategory === sub.id;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSelectSubcategory(sub.id)}
                  className={`hierarchical-subcat-btn ${isSubActive ? 'active' : ''}`}
                  title={sub.description}
                >
                  <span>{sub.name}</span>
                  <span className="hierarchical-badge opacity-80">{subCount}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>
  );
}
