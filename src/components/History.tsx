import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download, Trash2, Filter, CheckSquare } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { TranscriptionItem } from '../types';

interface HistoryProps {
  items: TranscriptionItem[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

export function History({ items, onDelete, onSelect }: HistoryProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(filter.toLowerCase()) ||
                         item.transcription.toLowerCase().includes(filter.toLowerCase());
    const itemDate = new Date(item.date);
    const afterStart = !dateRange.start || itemDate >= new Date(dateRange.start);
    const beforeEnd = !dateRange.end || itemDate <= new Date(dateRange.end);
    return matchesSearch && afterStart && beforeEnd;
  });

  const pageCount = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const downloadTranscriptionAsTxt = (item: TranscriptionItem) => {
    const content = `
Transcription: ${item.fileName}
Date: ${item.date}
Content: ${item.transcription}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.fileName}_transcription.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadQAAsTxt = (item: TranscriptionItem) => {
    const content = `
Q&A Analysis for: ${item.fileName}
Date: ${item.date}

${item.analysis.map((answer, index) => `Q${index + 1}: ${answer}`).join('\n\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.fileName}_qa.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTranscriptionAsPdf = (item: TranscriptionItem) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(item.fileName, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${item.date}`, 20, 30);
    doc.text('Transcription:', 20, 40);
    
    const splitText = doc.splitTextToSize(item.transcription, 170);
    doc.text(splitText, 20, 50);
    
    doc.save(`${item.fileName}_transcription.pdf`);
  };

  const downloadQAAsPdf = (item: TranscriptionItem) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Q&A Analysis: ${item.fileName}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${item.date}`, 20, 30);
    
    let yPos = 50;
    item.analysis.forEach((answer, index) => {
      doc.text(`Q${index + 1}:`, 20, yPos);
      const splitAnswer = doc.splitTextToSize(answer, 170);
      doc.text(splitAnswer, 20, yPos + 10);
      yPos += splitAnswer.length * 10 + 20;
      
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    doc.save(`${item.fileName}_qa.pdf`);
  };

  const downloadSelectedTranscriptions = (format: 'txt' | 'pdf') => {
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) {
        if (format === 'txt') {
          downloadTranscriptionAsTxt(item);
        } else {
          downloadTranscriptionAsPdf(item);
        }
      }
    });
  };

  const downloadSelectedQA = (format: 'txt' | 'pdf') => {
    selectedItems.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item) {
        if (format === 'txt') {
          downloadQAAsTxt(item);
        } else {
          downloadQAAsPdf(item);
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search transcriptions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {selectedItems.size > 0 && (
          <div className="flex flex-wrap gap-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Transcriptions</p>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadSelectedTranscriptions('txt')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download (TXT)
                </button>
                <button
                  onClick={() => downloadSelectedTranscriptions('pdf')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download (PDF)
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Q&A Analysis</p>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadSelectedQA('txt')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download (TXT)
                </button>
                <button
                  onClick={() => downloadSelectedQA('pdf')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {paginatedItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <h3 className="text-lg font-semibold">{item.fileName}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(item.date), 'PPpp')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Transcription:</span>
                  <button
                    onClick={() => downloadTranscriptionAsTxt(item)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Download Transcription as TXT"
                  >
                    <Download className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Q&A:</span>
                  <button
                    onClick={() => downloadQAAsTxt(item)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    title="Download Q&A as TXT"
                  >
                    <Download className="w-5 h-5 text-green-600" />
                  </button>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-md ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}