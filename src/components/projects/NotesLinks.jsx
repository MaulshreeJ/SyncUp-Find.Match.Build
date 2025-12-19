import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Link, Plus, Trash, FileText, Loader2 } from 'lucide-react';
import { getNotesAndLinks, addNote, addLink, deleteNote, deleteLink } from '@/api/notes';

const NotesLinks = () => {
  const { teamId, projectId } = useParams();
  const hackathonId = teamId || projectId;
  const [notes, setNotes] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' });

  useEffect(() => {
    const loadData = async () => {
      if (!hackathonId) return;
      try {
        setLoading(true);
        const data = await getNotesAndLinks(hackathonId);
        setNotes(data.notes);
        setLinks(data.links);
      } catch (error) {
        console.error('Failed to load notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notes and links',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [hackathonId]);

  const handleAddNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({ title: 'Missing Info', description: 'Please provide both title and content.', variant: 'destructive' });
      return;
    }

    try {
      await addNote(hackathonId, newNote.title, newNote.content);
      const data = await getNotesAndLinks(hackathonId);
      setNotes(data.notes);
      setNewNote({ title: '', content: '' });
      toast({ title: 'Note Added!', description: 'Your note has been saved.' });
    } catch (error) {
      console.error('Failed to add note:', error);
      toast({ title: 'Error', description: 'Failed to add note', variant: 'destructive' });
    }
  };

  const handleAddLink = async () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast({ title: 'Missing Info', description: 'Please provide both a title and a URL.', variant: 'destructive' });
      return;
    }

    try {
      await addLink(hackathonId, newLink.title, newLink.url, newLink.description);
      const data = await getNotesAndLinks(hackathonId);
      setLinks(data.links);
      setNewLink({ title: '', url: '', description: '' });
      toast({ title: 'Link Added!', description: 'The new link has been saved.' });
    } catch (error) {
      console.error('Failed to add link:', error);
      toast({ title: 'Error', description: 'Failed to add link', variant: 'destructive' });
    }
  };

  const handleRemoveNote = async (noteId) => {
    try {
      await deleteNote(hackathonId, noteId);
      const data = await getNotesAndLinks(hackathonId);
      setNotes(data.notes);
      toast({ title: 'Note Removed', description: 'The note has been deleted.' });
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast({ title: 'Error', description: 'Failed to delete note', variant: 'destructive' });
    }
  };

  const handleRemoveLink = async (linkId) => {
    try {
      await deleteLink(hackathonId, linkId);
      const data = await getNotesAndLinks(hackathonId);
      setLinks(data.links);
      toast({ title: 'Link Removed', description: 'The link has been deleted.' });
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast({ title: 'Error', description: 'Failed to delete link', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-3 text-gray-400">Loading notes and links...</span>
      </div>
    );
  }
  
  return (
    <div className="glass-card p-6 rounded-2xl space-y-8">
      {/* Notes Section */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-400" />
          Notes
        </h3>
        
        <div className="space-y-3 mb-6">
          {notes.length === 0 ? (
            <p className="text-gray-400 text-sm">No notes yet. Add one below!</p>
          ) : (
            notes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">{note.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{note.content}</p>
                    <p className="text-gray-500 text-xs">By {note.createdBy} • {new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveNote(note._id)} className="text-red-400 hover:text-red-300">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-2 p-4 border border-white/10 rounded-lg bg-white/5">
          <h4 className="font-semibold text-white text-sm">Add a new note</h4>
          <Input 
            placeholder="Note title" 
            value={newNote.title}
            onChange={(e) => setNewNote({...newNote, title: e.target.value})}
            className="bg-white/5 border-white/10"
          />
          <textarea
            placeholder="Note content..."
            value={newNote.content}
            onChange={(e) => setNewNote({...newNote, content: e.target.value})}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
          />
          <Button onClick={handleAddNote} className="glass-button w-full">
            <Plus className="h-4 w-4 mr-2"/>
            Add Note
          </Button>
        </div>
      </div>

      {/* Links Section */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Link className="h-5 w-5 text-blue-400" />
          Important Links
        </h3>
        
        <div className="space-y-3 mb-6">
          {links.length === 0 ? (
            <p className="text-gray-400 text-sm">No links yet. Add one below!</p>
          ) : (
            links.map((link, index) => (
              <motion.div
                key={link._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Link className="h-5 w-5 text-blue-400 flex-shrink-0"/>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium">{link.title}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:underline truncate block">{link.url}</a>
                    {link.description && <p className="text-gray-500 text-xs mt-1">{link.description}</p>}
                    <p className="text-gray-500 text-xs mt-1">Added by {link.addedBy}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveLink(link._id)} className="text-red-400 hover:text-red-300 flex-shrink-0">
                  <Trash className="h-4 w-4" />
                </Button>
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-2 p-4 border border-white/10 rounded-lg bg-white/5">
          <h4 className="font-semibold text-white text-sm">Add a new link</h4>
          <Input 
            placeholder="Link title (e.g. GitHub Repo)" 
            value={newLink.title}
            onChange={(e) => setNewLink({...newLink, title: e.target.value})}
            className="bg-white/5 border-white/10"
          />
          <Input 
            placeholder="URL (e.g. https://github.com/...)"
            value={newLink.url}
            onChange={(e) => setNewLink({...newLink, url: e.target.value})}
            className="bg-white/5 border-white/10"
          />
          <Input 
            placeholder="Description (optional)"
            value={newLink.description}
            onChange={(e) => setNewLink({...newLink, description: e.target.value})}
            className="bg-white/5 border-white/10"
          />
          <Button onClick={handleAddLink} className="glass-button w-full">
            <Plus className="h-4 w-4 mr-2"/>
            Add Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotesLinks;