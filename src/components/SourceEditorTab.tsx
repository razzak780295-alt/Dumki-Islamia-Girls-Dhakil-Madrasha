import React, { useState, useEffect, useRef } from 'react';
import { Copy, RefreshCw, Download, AlertTriangle, Cpu } from 'lucide-react';

interface SourceEditorTabProps {
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function SourceEditorTab({ showToast }: SourceEditorTabProps) {
  const [sourceCode, setSourceCode] = useState('');
  const [lineNumbers, setLineNumbers] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLPreElement>(null);

  // Initialize and populate document source code
  useEffect(() => {
    try {
      const code = document.documentElement.outerHTML;
      setSourceCode(code);
    } catch (e) {
      setSourceCode('<!-- Failed to get live HTML source. Fallback active. -->\n<!DOCTYPE html>\n<html>\n<body>\n</body>\n</html>');
    }
  }, []);

  // Sync line numbers column dynamically
  useEffect(() => {
    const lines = sourceCode.split('\n').length;
    const nums = Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1).join('\n');
    setLineNumbers(nums);
  }, [sourceCode]);

  // Synchronize scrolling of line numbers with text area
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(sourceCode);
      showToast('কোড কপি হয়েছে! (Code copied successfully!)', 'success');
    } catch (err) {
      // Fallback
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        showToast('কোড কপি হয়েছে! (Code copied!)', 'success');
      } else {
        showToast('কপি ব্যর্থ হয়েছে! (Copy failed!)', 'error');
      }
    }
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি আসল সোর্স কোডে রিসেট করতে চান? (Are you sure you want to reload the current active source?)')) {
      try {
        setSourceCode(document.documentElement.outerHTML);
        showToast('আসল সোর্স কোড রিলোড করা হয়েছে।', 'success');
      } catch (e) {
        showToast('রিসেট ব্যর্থ হয়েছে! (Reset failed)', 'error');
      }
    }
  };

  const handleApplyChanges = () => {
    try {
      const blob = new Blob([sourceCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'madrasha_app_updated.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('সম্পাদিত HTML ফাইল সফলভাবে জেনারেট ও ডাউনলোড করা হয়েছে!', 'success');
    } catch (err) {
      showToast('ফাইল জেনারেট করতে ত্রুটি ঘটেছে! (Failed to process download!)', 'error');
    }
  };

  return (
    <div id="source-editor-tab" className="space-y-6 select-none animate-fade-in no-print font-sans">
      
      {/* Header element */}
      <div className="border-b border-zinc-200 pb-3 flex justify-between items-center bg-transparent">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-madrasha-green-700 tracking-tight flex items-center gap-2">
            ⚙️ সোর্স এডিটর (Source Editor)
          </h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase font-semibold">
            Inspect, modify, and export app's client-side markup source
          </p>
        </div>
        <div className="h-[2px] w-12 bg-madrasha-gold-500"></div>
      </div>

      {/* Warning Alert banner */}
      <div className="bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-amber-800 text-xs sm:text-sm">
            সতর্কতা: ভুল কোড পরিবর্তন করলে অ্যাপ নষ্ট হতে পারে। বিশেষজ্ঞের সাহায্য নিন।
          </h3>
          <p className="text-[10px] text-amber-700 font-medium mt-1">
            Warning: Modifying client-side runtime source codes or adding bad markups may render the software unstable. Exercise extreme caution.
          </p>
        </div>
      </div>

      {/* Code Editor Console and controls */}
      <div className="bg-[#1e1e1e] rounded-xl border border-zinc-700 shadow-md overflow-hidden flex flex-col">
        
        {/* Editor Top Bar Utilities */}
        <div className="bg-[#252526] border-b border-zinc-700 px-4 py-3 flex flex-wrap justify-between items-center gap-2">
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono pl-2 border-l border-zinc-700 flex items-center gap-1">
              <Cpu className="h-3 w-3 text-emerald-500" />
              <span>index.html (LIVE_DOM)</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-white rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1.5 leading-none"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>কপি করুন (Copy)</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-[#333333] hover:bg-rose-900/40 text-rose-300 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1.5 leading-none"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>রিসেট করুন (Reset)</span>
            </button>

            {/* Apply & Download Button */}
            <button
              onClick={handleApplyChanges}
              className="px-4 py-1.5 bg-madrasha-green-700 hover:bg-madrasha-green-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1.5 leading-none shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>পরিবর্তন প্রয়োগ করুন (Apply Changes)</span>
            </button>
          </div>

        </div>

        {/* Editor Main Content text space with custom line numbers panel */}
        <div className="relative flex flex-1 h-[500px]">
          {/* Line numbers column sidebar */}
          <pre
            ref={lineNumbersRef}
            className="w-12 bg-[#1e1e1e] text-zinc-600 border-r border-[#2d2d2d] py-4 text-right pr-2 select-none overflow-hidden font-mono text-[11px] leading-[18px]"
          >
            {lineNumbers}
          </pre>

          {/* Actual textarea editor input */}
          <textarea
            ref={textareaRef}
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            onScroll={handleScroll}
            className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] leading-[18px] p-4 focus:outline-none resize-none overflow-auto whitespace-pre font-medium"
            spellCheck="false"
            placeholder="Loading app's source code here..."
          />
        </div>

        {/* Editor Status Info Bar */}
        <div className="bg-[#007acc] text-white text-[9.5px] px-4 py-1.5 flex justify-between font-mono font-medium">
          <span>UTF-8 &nbsp;&nbsp;&nbsp; HTML5 Mode</span>
          <span>Lines: {sourceCode.split('\n').length} &nbsp;&nbsp; Chars: {sourceCode.length}</span>
        </div>

      </div>

    </div>
  );
}
