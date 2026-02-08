'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ComponentItem, ComponentType } from './page';

interface NewComponentDialogProps {
  onClose: () => void;
  onAdd: (component: Omit<ComponentItem, 'id' | 'dependencies' | 'dependents' | 'lastModified'>) => void;
}

export function NewComponentDialog({ onClose, onAdd }: NewComponentDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ComponentType>('ui');
  const [category, setCategory] = useState('');
  const [filePath, setFilePath] = useState('');
  const [description, setDescription] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [autoPath, setAutoPath] = useState(true);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    nameRef.current?.focus();
  }, []);

  // Auto-generate file path based on type and name
  useEffect(() => {
    if (name && autoPath) {
      const typeFolder =
        type === 'ui'
          ? 'ui'
          : type === 'layout'
          ? 'layout'
          : type === 'feature'
          ? 'features'
          : 'pages';
      setFilePath(`src/components/${typeFolder}/${name}.tsx`);
    }
  }, [name, type, autoPath]);

  function handleClose() {
    setIsVisible(false);
    setTimeout(onClose, 150);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      type,
      category: category.trim() || type,
      filePath: filePath.trim(),
      status: 'planned',
      description: description.trim(),
      props: [],
      tokens: [],
    });
  }

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors duration-150 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20';

  const labelClass = 'mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className={`relative z-10 w-full max-w-md transform rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-150 dark:border-slate-700 dark:bg-slate-900 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Nieuw component
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Name */}
          <div>
            <label htmlFor="comp-name" className={labelClass}>
              Naam <span className="text-red-400">*</span>
            </label>
            <input
              ref={nameRef}
              id="comp-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="bijv. HeroSection"
              required
              className={inputClass}
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="comp-type" className={labelClass}>
              Type
            </label>
            <select
              id="comp-type"
              value={type}
              onChange={(e) => setType(e.target.value as ComponentType)}
              className={selectClass}
            >
              <option value="ui">UI</option>
              <option value="layout">Layout</option>
              <option value="feature">Feature</option>
              <option value="page">Page</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="comp-category" className={labelClass}>
              Categorie
            </label>
            <input
              id="comp-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="bijv. cards, forms, navigation"
              className={inputClass}
            />
          </div>

          {/* File Path */}
          <div>
            <label htmlFor="comp-path" className={labelClass}>
              Bestandspad
            </label>
            <input
              id="comp-path"
              type="text"
              value={filePath}
              onChange={(e) => {
                setFilePath(e.target.value);
                setAutoPath(false);
              }}
              placeholder="src/components/..."
              className={inputClass + ' font-mono'}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="comp-desc" className={labelClass}>
              Beschrijving
            </label>
            <textarea
              id="comp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Wat doet dit component?"
              className={inputClass + ' resize-none'}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Aanmaken
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
