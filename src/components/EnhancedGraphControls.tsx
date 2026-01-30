import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    FiFilter,
    FiSearch,
    FiMaximize2,
    FiRefreshCw,
    FiDownload,
    FiSettings,
    FiX
} from 'react-icons/fi';

interface GraphControlsProps {
    onFilter?: (filters: GraphFilters) => void;
    onSearch?: (query: string) => void;
    onReset?: () => void;
    onExport?: () => void;
    onSettings?: () => void;
}

export interface GraphFilters {
    nodeTypes: string[];
    showIsolated: boolean;
    minConnections: number;
}

export default function GraphControls({
    onFilter,
    onSearch,
    onReset,
    onExport,
    onSettings
}: GraphControlsProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<GraphFilters>({
        nodeTypes: [],
        showIsolated: true,
        minConnections: 0
    });

    const nodeTypes = [
        { value: 'concept', label: 'Concepts', color: '#ebb137' },
        { value: 'document', label: 'Documents', color: '#2c6469' },
        { value: 'person', label: 'People', color: '#b20155' },
        { value: 'organization', label: 'Organizations', color: '#3469a1' },
        { value: 'topic', label: 'Topics', color: '#df6536' },
        { value: 'location', label: 'Locations', color: '#666' }
    ];

    const toggleNodeType = (type: string) => {
        const newTypes = filters.nodeTypes.includes(type)
            ? filters.nodeTypes.filter(t => t !== type)
            : [...filters.nodeTypes, type];

        const newFilters = { ...filters, nodeTypes: newTypes };
        setFilters(newFilters);
        if (onFilter) onFilter(newFilters);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (onSearch) onSearch(query);
    };

    return (
        <div className="space-y-3">
            {/* Main Controls */}
            <div className="liquid-glass rounded-2xl p-3 flex items-center gap-2">
                {/* Search */}
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search nodes..."
                        className="w-full pl-9 pr-3 py-2 bg-white/50 border border-transparent rounded-xl text-sm outline-none focus:border-black transition-colors"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                        >
                            <FiX size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-black text-white' : 'hover:bg-white/50 text-gray-600'
                        }`}
                    title="Filters"
                >
                    <FiFilter size={16} />
                </button>

                {/* Reset */}
                <button
                    onClick={onReset}
                    className="p-2 rounded-xl hover:bg-white/50 text-gray-600 transition-all"
                    title="Reset View"
                >
                    <FiRefreshCw size={16} />
                </button>

                {/* Export */}
                <button
                    onClick={onExport}
                    className="p-2 rounded-xl hover:bg-white/50 text-gray-600 transition-all"
                    title="Export Graph"
                >
                    <FiDownload size={16} />
                </button>

                {/* Settings */}
                <button
                    onClick={onSettings}
                    className="p-2 rounded-xl hover:bg-white/50 text-gray-600 transition-all"
                    title="Settings"
                >
                    <FiSettings size={16} />
                </button>

                {/* Fullscreen */}
                <button
                    onClick={() => document.documentElement.requestFullscreen()}
                    className="p-2 rounded-xl hover:bg-white/50 text-gray-600 transition-all"
                    title="Fullscreen"
                >
                    <FiMaximize2 size={16} />
                </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="liquid-glass rounded-2xl p-4 space-y-4"
                >
                    {/* Node Type Filters */}
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            Node Types
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {nodeTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => toggleNodeType(type.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.nodeTypes.length === 0 || filters.nodeTypes.includes(type.value)
                                            ? 'text-white'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                    style={{
                                        backgroundColor: filters.nodeTypes.length === 0 || filters.nodeTypes.includes(type.value)
                                            ? type.color
                                            : undefined
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: type.color }}
                                        />
                                        {type.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Connection Filter */}
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            Minimum Connections
                        </p>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={filters.minConnections}
                            onChange={(e) => {
                                const newFilters = { ...filters, minConnections: parseInt(e.target.value) };
                                setFilters(newFilters);
                                if (onFilter) onFilter(newFilters);
                            }}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0</span>
                            <span className="font-medium">{filters.minConnections}</span>
                            <span>10+</span>
                        </div>
                    </div>

                    {/* Show Isolated */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium">Show Isolated Nodes</p>
                            <p className="text-xs text-gray-500">Nodes with no connections</p>
                        </div>
                        <button
                            onClick={() => {
                                const newFilters = { ...filters, showIsolated: !filters.showIsolated };
                                setFilters(newFilters);
                                if (onFilter) onFilter(newFilters);
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${filters.showIsolated ? 'bg-black' : 'bg-gray-300'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${filters.showIsolated ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
