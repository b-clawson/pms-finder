import { useState, useMemo } from 'react';
import { Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMixingCards, type MixingCard } from '../hooks/useMixingCards';
import { FormulaDetail } from './MatsuiFormulas';
import { GGFormulaDetailView } from './GreenGalaxyMix';
import { FnInkFormulaDetailView } from './FnInkMix';
import { IccFormulaDetailView } from './IccMix';
import { DistanceBadge } from './DistanceBadge';

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function CardItem({
  card,
  onUpdate,
  onDelete,
}: {
  card: MixingCard;
  onUpdate: (id: string, fields: Partial<Pick<MixingCard, 'name' | 'notes'>>) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [nameValue, setNameValue] = useState(card.name);
  const [notesValue, setNotesValue] = useState(card.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const swatchHex =
    card.type === 'matsui'
      ? card.resolvedHex
      : card.type === 'greengalaxy'
        ? card.match.hex
        : card.match.hex;

  const seriesLabel =
    card.type === 'matsui'
      ? card.series
      : card.type === 'greengalaxy'
        ? (card.category === 'UD' ? 'Uncoated Direct' : 'Coated Direct')
        : card.type === 'fnink'
          ? 'FN-INK'
          : card.family;

  const componentCount =
    card.type === 'matsui'
      ? card.formula.components.length
      : card.type === 'greengalaxy'
        ? card.formula.materials.length
        : card.type === 'fnink'
          ? card.match.formula.materials.length
          : card.match.lines.length;

  const handleNameBlur = () => {
    setEditingName(false);
    if (nameValue.trim() && nameValue !== card.name) {
      onUpdate(card.id, { name: nameValue.trim() });
    } else {
      setNameValue(card.name);
    }
  };

  const handleNotesBlur = () => {
    setEditingNotes(false);
    if (notesValue !== card.notes) {
      onUpdate(card.id, { notes: notesValue });
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(card.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Color banner */}
      <div
        className="h-16 cursor-pointer"
        style={{ backgroundColor: swatchHex }}
        onClick={() => setExpanded(!expanded)}
      />

      <div className="p-4">
        {/* Name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameBlur();
                  if (e.key === 'Escape') {
                    setNameValue(card.name);
                    setEditingName(false);
                  }
                }}
                className="w-full text-sm font-semibold text-gray-900 border border-[#0D9E7A] rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#0D9E7A]"
              />
            ) : (
              <h3
                className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:text-[#0D9E7A]"
                onClick={() => setEditingName(true)}
                title="Click to edit name"
              >
                {card.name}
              </h3>
            )}
          </div>
          <button
            onClick={handleDelete}
            className={`flex-shrink-0 p-1 rounded transition-colors ${
              confirmDelete
                ? 'bg-red-100 text-red-600'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
            aria-label={confirmDelete ? 'Confirm delete card' : `Delete card ${card.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Brand badge + series */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              card.type === 'matsui'
                ? 'bg-indigo-100 text-indigo-800'
                : card.type === 'greengalaxy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : card.type === 'fnink'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-sky-100 text-sky-800'
            }`}
          >
            {card.type === 'matsui'
              ? 'Matsui'
              : card.type === 'greengalaxy'
                ? 'Green Galaxy'
                : card.type === 'fnink'
                  ? 'FN-INK'
                  : 'ICC UltraMix'}
          </span>
          <span className="text-xs text-gray-500">{seriesLabel}</span>
        </div>

        {/* Hex values + distance */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          <span className="font-mono">{card.searchHex}</span>
          <span className="text-gray-300">&rarr;</span>
          <span className="font-mono">{swatchHex}</span>
          <DistanceBadge distance={card.distance} thresholds={card.type === 'matsui' ? [20, 80] : [10, 30]} />
        </div>

        {/* Component count + date */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>{componentCount} components</span>
          <span>{timeAgo(card.createdAt)}</span>
        </div>

        {/* Notes */}
        <div className="mb-2">
          {editingNotes ? (
            <textarea
              autoFocus
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleNotesBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setNotesValue(card.notes);
                  setEditingNotes(false);
                }
              }}
              placeholder="Add notes..."
              className="w-full text-xs text-gray-600 border border-[#0D9E7A] rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0D9E7A] resize-none"
              rows={2}
            />
          ) : (
            <p
              className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 italic"
              onClick={() => setEditingNotes(true)}
              title="Click to edit notes"
            >
              {card.notes || 'Add notes...'}
            </p>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide formula details' : 'Show formula details'}
          className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-[#0D9E7A] transition-colors pt-1 border-t border-gray-100"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Hide formula
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Show formula
            </>
          )}
        </button>
      </div>

      {/* Expanded formula detail */}
      {expanded && (
        <div className="border-t border-gray-100 p-4">
          {card.type === 'matsui' ? (
            <FormulaDetail formula={card.formula} onBack={() => setExpanded(false)} />
          ) : card.type === 'greengalaxy' ? (
            <GGFormulaDetailView formula={card.formula} />
          ) : card.type === 'fnink' ? (
            <FnInkFormulaDetailView match={card.match} />
          ) : (
            <IccFormulaDetailView match={card.match} />
          )}
        </div>
      )}
    </div>
  );
}

export function MixingCards() {
  const { cards, updateCard, deleteCard } = useMixingCards();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'matsui' | 'greengalaxy' | 'fnink' | 'icc'>('all');

  const filtered = useMemo(() => {
    let result = cards;

    if (typeFilter !== 'all') {
      result = result.filter((c) => c.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.searchHex.toLowerCase().includes(q) ||
          (c.type === 'matsui' && c.formula.formulaCode.toLowerCase().includes(q)) ||
          (c.type === 'greengalaxy' && c.match.code.toLowerCase().includes(q)) ||
          (c.type === 'fnink' && c.match.code.toLowerCase().includes(q)) ||
          (c.type === 'icc' && c.match.code.toLowerCase().includes(q))
      );
    }

    return result;
  }, [cards, search, typeFilter]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Mixing Cards</h1>
        <p className="text-gray-600">
          Your saved formula results from Matsui, Green Galaxy, FN-INK, and ICC mixing
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-600 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, code, or hex..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm text-gray-600 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9E7A] focus:border-transparent bg-white"
            >
              <option value="all">All ({cards.length})</option>
              <option value="matsui">Matsui ({cards.filter((c) => c.type === 'matsui').length})</option>
              <option value="greengalaxy">Green Galaxy ({cards.filter((c) => c.type === 'greengalaxy').length})</option>
              <option value="fnink">FN-INK ({cards.filter((c) => c.type === 'fnink').length})</option>
              <option value="icc">ICC UltraMix ({cards.filter((c) => c.type === 'icc').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No mixing cards saved yet</p>
          <p className="text-sm">
            Save formulas from the Matsui, Green Galaxy, FN-INK, or ICC mixing pages to see them here.
          </p>
        </div>
      )}

      {/* Filtered empty state */}
      {cards.length > 0 && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No cards match your search.
        </div>
      )}

      {/* Card grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onUpdate={updateCard}
              onDelete={deleteCard}
            />
          ))}
        </div>
      )}
    </>
  );
}
