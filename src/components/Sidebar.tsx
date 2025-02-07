import React from 'react';
import { useNews } from '../context/NewsContext';
import { Category, Region, RegionGroup } from '../types';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { debugLog } from '../utils/debug';

const categories: Category[] = [
  'AI',
  'Startups',
  'Business',
  'Technology',
  'Product Management',
  'Innovation',
  'Funding',
];

const regionGroups: Record<RegionGroup, Region[]> = {
  APAC: [
    'Australia',
    'New Zealand',
    'Southeast Asia',
    'East Asia',
    'South Asia',
  ],
  Europe: [
    'UK',
    'Western Europe',
    'Northern Europe',
    'Southern Europe',
    'Eastern Europe',
  ],
  Americas: [
    'US',
    'Canada',
    'Latin America',
  ],
  Other: [
    'Middle East',
    'Africa',
  ],
  Global: ['Global'],
};

function FilterSection({ 
  title, 
  items, 
  selected, 
  onChange 
}: { 
  title: string;
  items: string[];
  selected: string[];
  onChange: (items: string[]) => void;
}) {
  const handleClick = (item: string) => {
    debugLog('Sidebar', `Toggling ${title} filter: ${item}`);
    if (selected.includes(item)) {
      onChange(selected.filter(i => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const handleSelectAll = () => {
    debugLog('Sidebar', `Toggling all ${title}`);
    onChange(selected.length === items.length ? [] : [...items]);
  };

  return (
    <div>
      <h3 className="px-3 text-sm font-bold text-black uppercase tracking-wider font-montserrat">
        {title}
      </h3>
      <div className="mt-2 space-y-1">
        <button
          onClick={handleSelectAll}
          className={`w-full group flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md
            ${selected.length === items.length
              ? 'bg-tapas-card text-tapas-primary'
              : 'text-[#476c77] hover:bg-gray-50 hover:text-[#efb071] hover:font-bold truncate transition-all'
            }`}
        >
          <span>All {title}</span>
          {selected.length === items.length && (
            <Check className="h-4 w-4" />
          )}
        </button>
        {items.map((item) => (
          <button
            key={item}
            onClick={() => handleClick(item)}
            className={`w-full group flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md
              ${selected.includes(item)
                ? 'bg-tapas-card text-tapas-primary'
                : 'text-[#476c77] hover:bg-gray-50 hover:text-[#efb071] hover:font-bold truncate transition-all'
              }`}
          >
            <span>{item}</span>
            {selected.includes(item) && (
              <Check className="h-4 w-4" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function RegionGroupSection({
  group,
  regions,
  selected,
  onChange,
}: {
  group: RegionGroup;
  regions: Region[];
  selected: Region[];
  onChange: (regions: Region[]) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const groupRegions = regions.filter(r => regionGroups[group].includes(r));
  const isGlobalGroup = group === 'Global';
  const isGroupSelected = groupRegions.every(r => selected.includes(r));
  const isGroupPartiallySelected = groupRegions.some(r => selected.includes(r)) && !isGroupSelected;

  const handleGroupClick = () => {
    if (isGroupSelected) {
      onChange(selected.filter(r => !groupRegions.includes(r)));
    } else {
      onChange([...selected, ...groupRegions]);
    }
  };

  const handleRegionClick = (region: Region) => {
    if (selected.includes(region)) {
      onChange(selected.filter(r => r !== region));
    } else {
      onChange([...selected, region]);
    }
  };

  return (
    <div>
      <button
        onClick={handleGroupClick}
        className={`w-full group flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md
          ${isGroupSelected
            ? 'bg-tapas-card text-tapas-primary'
            : isGroupPartiallySelected
            ? 'bg-tapas-card/50 text-tapas-primary'
            : 'text-[#476c77] hover:bg-gray-50 hover:text-[#efb071] hover:font-bold transition-all'
          }`}
      >
        <div className="flex items-center gap-2">
          {!isGlobalGroup && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-0.5 hover:bg-gray-100 rounded cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          )}
          {group}
        </div>
        {isGroupSelected && <Check className="h-4 w-4" />}
      </button>
      {!isGlobalGroup && isExpanded && (
        <div className="ml-4 mt-1 space-y-1">
          {groupRegions.map((region) => (
            <button
              key={region}
              onClick={() => handleRegionClick(region)}
              className={`w-full group flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md
                ${selected.includes(region)
                  ? 'bg-tapas-card text-tapas-primary'
                  : 'text-[#476c77] hover:bg-gray-50 hover:text-[#efb071] hover:font-bold truncate transition-all'
                }`}
            >
              <span>{region}</span>
              {selected.includes(region) && (
                <Check className="h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { state, dispatch } = useNews();
  const [selectedCategories, setSelectedCategories] = React.useState<Category[]>([]);
  const [selectedRegions, setSelectedRegions] = React.useState<Region[]>([]);
  const allRegions = Object.values(regionGroups).flat();

  // Initialize local state from global state
  React.useEffect(() => {
    debugLog('Sidebar', 'Updating local filter state', {
      categories: state.filters.categories,
      regions: state.filters.regions
    });
    setSelectedCategories(state.filters.categories);
    setSelectedRegions(state.filters.regions);
  }, [state.filters.categories, state.filters.regions]);

  const handleCategoryChange = (categories: Category[]) => {
    debugLog('Sidebar', 'Category filter changed', { categories });
    setSelectedCategories(categories);
    dispatch({ type: 'SET_FILTERS', payload: { categories } });
  };

  const handleRegionChange = (regions: Region[]) => {
    debugLog('Sidebar', 'Region filter changed', { regions });
    setSelectedRegions(regions);
    dispatch({ type: 'SET_FILTERS', payload: { regions } });
  };

  const handleAllRegionsClick = () => {
    const newRegions = selectedRegions.length === allRegions.length ? [] : allRegions;
    setSelectedRegions(newRegions);
    dispatch({ type: 'SET_FILTERS', payload: { regions: newRegions } });
  };

  return (
    <div className="w-48 min-w-[12rem] bg-white rounded-lg shadow-lg pt-5 pb-4 flex flex-col mt-8 mb-8">
      <div className="flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-8">
          <FilterSection
            title="Categories"
            items={categories}
            selected={selectedCategories}
            onChange={handleCategoryChange}
          />
          <div>
            <h3 className="px-3 text-sm font-bold text-black uppercase tracking-wider font-montserrat mb-2">
              Regions
            </h3>
            <button
              onClick={handleAllRegionsClick}
              className={`w-full group flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md mb-2
                ${selectedRegions.length === allRegions.length
                  ? 'bg-tapas-card text-tapas-primary'
                  : 'text-[#476c77] hover:bg-gray-50 hover:text-[#efb071] hover:font-bold truncate transition-all'
                }`}
            >
              <span>All Regions</span>
              {state.filters.regions.length === allRegions.length && (
                <Check className="h-4 w-4" />
              )}
            </button>
            <div className="space-y-2">
              {(Object.keys(regionGroups) as RegionGroup[]).map((group) => (
                <RegionGroupSection
                  key={group}
                  group={group}
                  regions={allRegions}
                  selected={selectedRegions}
                  onChange={handleRegionChange}
                />
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}