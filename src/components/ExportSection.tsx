import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { GeneratedContent } from '../types';

interface ExportSectionProps {
  content: GeneratedContent;
  selectedCaption: string;
}

export function ExportSection({ content, selectedCaption }: ExportSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const text = `
FORMAL CAPTION:
${content.formal}

CASUAL CAPTION:
${content.casual}

FUNNY CAPTION:
${content.funny}

HASHTAGS:
${content.hashtags.join(' ')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `
AutoPostr - Generated Content
==============================

FORMAL CAPTION:
${content.formal}

CASUAL CAPTION:
${content.casual}

FUNNY CAPTION:
${content.funny}

HASHTAGS:
${content.hashtags.join(' ')}

---
Generated at: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopostr-content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Export Your Content</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleCopyAll}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Copied All!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Copy All Captions
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Download className="w-5 h-5" />
          Download as Text
        </button>
      </div>
    </div>
  );
}
