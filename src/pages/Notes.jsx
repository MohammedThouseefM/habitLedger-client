import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, Save, ArrowLeft, Pin, FileText, ChevronLeft } from 'lucide-react';
import api from '../utils/api';
import debounce from 'lodash/debounce';

const Notes = () => {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/notes');
            setNotes(response.data);
            if (response.data.length > 0 && !selectedNote) {
                // Optionally select first note, but let's leave it blank for cleaner start
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNote = async () => {
        try {
            const response = await api.post('/api/notes', {
                title: '',
                content: ''
            });
            const newNote = response.data;
            setNotes([newNote, ...notes]);
            selectNote(newNote);
        } catch (error) {
            console.error('Error creating note:', error);
        }
    };

    const selectNote = (note) => {
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content || '');
    };

    // Auto-save logic
    const saveNote = useCallback(
        debounce(async (id, noteData) => {
            setSaving(true);
            try {
                const response = await api.put(`/api/notes/${id}`, noteData);
                // Update local list to reflect changes (e.g. title in sidebar)
                setNotes(prev => prev.map(n => n.id === id ? response.data : n));
            } catch (error) {
                console.error('Error saving note:', error);
            } finally {
                setSaving(false);
            }
        }, 1000),
        []
    );

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setTitle(val);
        if (selectedNote) {
            saveNote(selectedNote.id, { ...selectedNote, title: val, content });
        }
    };

    const handleContentChange = (e) => {
        const val = e.target.value;
        setContent(val);
        if (selectedNote) {
            saveNote(selectedNote.id, { ...selectedNote, title, content: val });
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Delete this note?')) return;

        try {
            await api.delete(`/api/notes/${id}`);
            setNotes(notes.filter(n => n.id !== id));
            if (selectedNote?.id === id) {
                setSelectedNote(null);
                setTitle('');
                setContent('');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const togglePin = async (e, note) => {
        e.stopPropagation();
        try {
            const updated = { ...note, is_pinned: !note.is_pinned };
            await api.put(`/api/notes/${note.id}`, updated);
            // Refresh list to reorder
            fetchNotes();
            if (selectedNote?.id === note.id) setSelectedNote(updated);
        } catch (error) {
            console.error('Error pinning note:', error);
        }
    };

    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-bg overflow-hidden">
            {/* Sidebar List */}
            <div className={`${selectedNote ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-border bg-surface`}>
                {/* Header */}
                <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center text-sm text-text-secondary hover:text-text transition-colors">
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h2 className="font-bold text-text">Notes</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-text-secondary w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface-light border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-text-secondary"
                        />
                    </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                    <button
                        onClick={handleCreateNote}
                        className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2 font-medium text-sm mb-2"
                    >
                        <Plus size={16} /> New Note
                    </button>

                    {loading ? (
                        <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="text-center p-8 text-slate-500 text-sm">No notes found.</div>
                    ) : (
                        filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => selectNote(note)}
                                className={`group p-4 rounded-xl cursor-pointer border transition-all hover:bg-surface-light text-left relative ${selectedNote?.id === note.id
                                    ? 'bg-surface-light border-primary/50 shadow-md ring-1 ring-primary/20'
                                    : 'bg-transparent border-transparent hover:border-border'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-semibold text-sm truncate pr-6 ${!note.title ? 'text-text-secondary italic' : 'text-text'}`}>
                                        {note.title || 'Untitled Note'}
                                    </h3>
                                    {note.is_pinned && <Pin size={12} className="text-amber-500 fill-current flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-text-secondary line-clamp-2 h-8">
                                    {note.content || 'No content...'}
                                </p>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800/50">
                                    <span className="text-[10px] text-slate-600">
                                        {new Date(note.updated_at).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={(e) => togglePin(e, note)} className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-amber-400">
                                            <Pin size={14} />
                                        </button>
                                        <button onClick={(e) => handleDelete(e, note.id)} className="p-1 hover:bg-red-900/20 rounded text-slate-500 hover:text-red-400">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Editor */}
            <div className={`${!selectedNote ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-bg h-full relative z-10`}>
                {selectedNote ? (
                    <>
                        <div className="border-b border-border p-4 flex items-center justify-between bg-bg">
                            <button onClick={() => setSelectedNote(null)} className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text">
                                <ArrowLeft />
                            </button>
                            <div className="text-xs text-text-secondary flex items-center gap-2">
                                {saving ? 'Saving...' : 'Saved'}
                            </div>
                            <button onClick={(e) => handleDelete(e, selectedNote.id)} className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="max-w-3xl mx-auto p-6 md:p-12">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Note Title"
                                    className="w-full text-3xl md:text-4xl font-bold text-text placeholder-text-secondary border-none focus:ring-0 p-0 mb-6 bg-transparent"
                                />
                                <textarea
                                    value={content}
                                    onChange={handleContentChange}
                                    placeholder="Start writing..."
                                    className="w-full h-[calc(100vh-250px)] resize-none text-lg text-text placeholder-text-secondary border-none focus:ring-0 p-0 leading-relaxed bg-transparent"
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-secondary p-8 text-center bg-bg">
                        <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-border">
                            <FileText size={48} className="text-text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold text-text mb-2">Select a note to view</h3>
                        <p className="max-w-xs mx-auto text-text-secondary">Choose a note from the list on the left, or create a new one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
