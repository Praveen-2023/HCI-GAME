import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Settings, Type, Eye, Volume2, Square, X, ChevronUp, ChevronDown } from 'lucide-react';

const AccessibilityWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100); // percentage
  const [highContrast, setHighContrast] = useState(false);
  const [isReading, setIsReading] = useState(false);
  
  const readingElementsRef = useRef([]);
  const currentReadIndexRef = useRef(0);

  // Hide widget during gameplay
  const hideOnRoutes = ['/piano-reaction', '/shape-tracing', '/board-drawing', '/fruit-basket', '/in-cam-game'];
  const shouldHide = hideOnRoutes.some(route => location.pathname.includes(route));

  // Load preferences
  useEffect(() => {
    const savedSize = localStorage.getItem('hci_a11y_font_size');
    if (savedSize) setFontSize(Number(savedSize));
    
    const savedContrast = localStorage.getItem('hci_a11y_contrast');
    if (savedContrast === 'true') setHighContrast(true);
  }, []);

  // Apply Font Size globally via rem scaling
  useEffect(() => {
    // 16px is default browser size. We scale it by percentage.
    const baseSize = 16 * (fontSize / 100);
    document.documentElement.style.fontSize = `${baseSize}px`;
    localStorage.setItem('hci_a11y_font_size', fontSize.toString());
  }, [fontSize]);

  // Apply High Contrast
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('hci_a11y_contrast', highContrast.toString());
  }, [highContrast]);

  // Handle routing changes - stop reading if user navigates
  useEffect(() => {
    stopReading();
  }, [location.pathname]);

  const stopReading = () => {
    window.speechSynthesis.cancel();
    setIsReading(false);
    
    // Clear highlights
    readingElementsRef.current.forEach(el => {
      if (el && el.classList) {
        el.classList.remove('read-aloud-highlight');
      }
    });
    readingElementsRef.current = [];
    currentReadIndexRef.current = 0;
  };

  const startReading = (mode = 'top') => {
    stopReading();
    setIsReading(true);

    // Find readable elements (excluding widget itself)
    const selectors = 'h1, h2, h3, h4, h5, h6, p, label, .readable';
    const rawElements = Array.from(document.querySelectorAll(selectors));
    
    // Filter out hidden elements or elements within this widget
    const elements = rawElements.filter(el => {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      if (el.closest('.a11y-widget-container')) return false;
      if (!el.textContent.trim()) return false;
      return true;
    });

    let startIndex = 0;
    if (mode === 'current') {
      const headerOffset = 60; // Approximate fixed header allowance
      startIndex = elements.findIndex(el => {
        const rect = el.getBoundingClientRect();
        return rect.top >= -headerOffset;
      });
      if (startIndex === -1) startIndex = 0;
    }

    readingElementsRef.current = elements;
    currentReadIndexRef.current = startIndex;

    readNext();
  };

  const readNext = () => {
    if (currentReadIndexRef.current >= readingElementsRef.current.length) {
      stopReading();
      return;
    }

    const el = readingElementsRef.current[currentReadIndexRef.current];
    const text = el.textContent.trim();
    
    if (!text) {
      currentReadIndexRef.current++;
      readNext();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Slightly slower rate for older patients
    utterance.rate = 0.9;
    
    utterance.onstart = () => {
      el.classList.add('read-aloud-highlight');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    utterance.onend = () => {
      el.classList.remove('read-aloud-highlight');
      currentReadIndexRef.current++;
      readNext();
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error", e);
      el.classList.remove('read-aloud-highlight');
      currentReadIndexRef.current++;
      readNext();
    };

    window.speechSynthesis.speak(utterance);
  };

  if (shouldHide) {
    return null;
  }

  return (
    <div className="a11y-widget-container fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      
      {/* Expanded Menu */}
      <div 
        className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-4 border-blue-500 p-5 mb-4 w-72 transition-all duration-300 pointer-events-auto origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 hidden'
        }`}
      >
        <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-3">
          <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2">
            <Settings className="text-blue-500" /> Accessibility
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 hover:bg-red-100 hover:text-red-600 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Text Size */}
          <div>
            <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 mb-3 text-lg">
              <Type className="text-blue-500" /> Text Size ({fontSize}%)
            </label>
            <div className="flex gap-2">
              <button 
                onClick={() => setFontSize(prev => Math.max(80, prev - 10))}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-lg active:scale-95 transition"
              >
                A-
              </button>
              <button 
                onClick={() => setFontSize(100)}
                className="flex-1 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-xl font-bold active:scale-95 transition"
              >
                Reset
              </button>
              <button 
                onClick={() => setFontSize(prev => Math.min(150, prev + 10))}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xl active:scale-95 transition"
              >
                A+
              </button>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* High Contrast */}
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition active:scale-95 ${
              highContrast 
                ? 'bg-amber-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye /> High Contrast {highContrast ? 'On' : 'Off'}
          </button>

          <hr className="border-gray-200" />

          {/* Read Aloud */}
          <div>
            <label className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200 mb-3 text-lg">
              <Volume2 className="text-blue-500" /> Read Screen Aloud
            </label>
            {isReading ? (
              <button 
                onClick={stopReading}
                className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition animate-pulse"
              >
                <Square fill="currentColor" /> Stop Reading
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => startReading('top')}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
                >
                  <Volume2 size={20} /> Start from Top
                </button>
                <button 
                  onClick={() => startReading('current')}
                  className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-95 transition"
                >
                  <Eye size={20} /> Read from Current View
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white dark:border-gray-800"
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
      >
        {isOpen ? <ChevronDown size={32} /> : <Settings size={32} />}
      </button>

    </div>
  );
};

export default AccessibilityWidget;
