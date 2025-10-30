import { Hash, Copy, Check, Plus, X, Edit2 } from 'lucide-react';
import { useState } from 'react';

interface HashtagDisplayProps {
  hashtags: string[];
  onHashtagsChange?: (hashtags: string[]) => void;
}

export function HashtagDisplay({ hashtags, onHashtagsChange }: HashtagDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHashtags, setEditedHashtags] = useState<string[]>(hashtags);
  const [newTag, setNewTag] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(editedHashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveTag = (index: number) => {
    const updated = editedHashtags.filter((_, i) => i !== index);
    setEditedHashtags(updated);
    if (onHashtagsChange) {
      onHashtagsChange(updated);
    }
  };

  const handleAddTag = () => {
    let tag = newTag.trim();
    if (!tag) return;

    if (!tag.startsWith('#')) {
      tag = '#' + tag;
    }

    tag = tag.replace(/\s+/g, '');

    if (tag.length > 1 && !editedHashtags.includes(tag)) {
      const updated = [...editedHashtags, tag];
      setEditedHashtags(updated);
      setNewTag('');
      if (onHashtagsChange) {
        onHashtagsChange(updated);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Hash className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Generated Hashtags</h2>
        </div>
        <div className="flex items-center gap-2">
          {onHashtagsChange && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                isEditing
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Done Editing' : 'Edit Tags'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy All
              </>
            )}
          </button>
        </div>
      </div>

      {isEditing && onHashtagsChange && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add new hashtag..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Tip: You can add tags with or without the # symbol. Press Enter to add.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {editedHashtags.map((tag, index) => (
          <div
            key={index}
            className={`group relative px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 ${
              isEditing && onHashtagsChange ? 'pr-10' : ''
            }`}
          >
            {tag}
            {isEditing && onHashtagsChange && (
              <button
                onClick={() => handleRemoveTag(index)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-red-100 hover:bg-red-200 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Remove tag"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            )}
          </div>
        ))}
      </div>

      {editedHashtags.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          No hashtags yet. Click "Add" to create your first hashtag.
        </p>
      )}
    </div>
  );
}
