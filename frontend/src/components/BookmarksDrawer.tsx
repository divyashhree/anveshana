import React from 'react';
import { X, Bookmark as BookmarkIcon, Trash2, ArrowRight } from 'lucide-react';
import { Bookmark } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (entityId: string) => void;
  onSelectEntity: (entityId: string) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onRemoveBookmark,
  onSelectEntity
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-midnight-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-midnight-900 border-l border-gold-500/25 h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-midnight-950">
          <div className="flex items-center space-x-2">
            <BookmarkIcon className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif font-bold text-slate-100 text-sm">
              Saved Explorations ({bookmarks.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <BookmarkIcon className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No saved concepts yet.</p>
              <p className="text-[11px] text-slate-600">
                Click the bookmark icon on any entity card or detail drawer to save it for quick reference.
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div
                key={bm.entity_id}
                className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-gold-500/30 transition-all flex items-start justify-between group"
              >
                <div 
                  className="flex-1 cursor-pointer pr-2"
                  onClick={() => {
                    onSelectEntity(bm.entity_id);
                    onClose();
                  }}
                >
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-gold-400">
                    {bm.category}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-gold-300 mt-1">
                    {bm.entity_name}
                  </h4>
                  {bm.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {bm.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelectEntity(bm.entity_id);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-gold-300"
                    title="Open details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRemoveBookmark(bm.entity_id)}
                    className="p-1.5 rounded-lg hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Persisted locally and synchronised with your research profile.
        </div>
      </div>
    </div>
  );
};
