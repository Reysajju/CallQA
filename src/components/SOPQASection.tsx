import React, { useState } from 'react';
import { format } from 'date-fns';
import { Download, Share2, Filter, Search, Tag, Building2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { QAEntry } from '../types';
import toast from 'react-hot-toast';

interface SOPQASectionProps {
  qaEntries: QAEntry[];
  departments: string[];
  topics: string[];
  onShare: (entryId: string, email: string) => void;
}

export function SOPQASection({ qaEntries, departments, topics, onShare }: SOPQASectionProps) {
  const [filter, setFilter] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedEntryForShare, setSelectedEntryForShare] = useState<string | null>(null);

  const filteredEntries = qaEntries.filter(entry => {
    const matchesSearch = entry.question.toLowerCase().includes(filter.toLowerCase()) ||
                         entry.answer.toLowerCase().includes(filter.toLowerCase());
    const matchesDepartment = !selectedDepartment || entry.department === selectedDepartment;
    const matchesTopic = !selectedTopic || entry.topic === selectedTopic;
    const entryDate = new Date(entry.date);
    const afterStart = !dateRange.start || entryDate >= new Date(dateRange.start);
    const beforeEnd = !dateRange.end || entryDate <= new Date(dateRange.end);
    return matchesSearch && matchesDepartment && matchesTopic && afterStart && beforeEnd;
  });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedEntries);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedEntries(newSelection);
  };

  const downloadAsPDF = (entries: QAEntry[]) => {
    const doc = new jsPDF();
    let yPos = 20;

    entries.forEach((entry, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(`Q: ${entry.question}`, 20, yPos);
      yPos += 10;

      doc.setFontSize(12);
      const splitAnswer = doc.splitTextToSize(`A: ${entry.answer}`, 170);
      doc.text(splitAnswer, 20, yPos);
      yPos += splitAnswer.length * 7 + 10;

      doc.setFontSize(10);
      doc.text(`Date: ${format(new Date(entry.date), 'PPpp')}`, 20, yPos);
      yPos += 15;

      if (entry.department) {
        doc.text(`Department: ${entry.department}`, 20, yPos);
        yPos += 7;
      }
      if (entry.topic) {
        doc.text(`Topic: ${entry.topic}`, 20, yPos);
        yPos += 15;
      }
    });

    doc.save('sop-qa-export.pdf');
    toast.success('PDF downloaded successfully');
  };

  const downloadAsTxt = (entries: QAEntry[]) => {
    const content = entries.map(entry => `
Question: ${entry.question}
Answer: ${entry.answer}
Date: ${format(new Date(entry.date), 'PPpp')}
${entry.department ? `Department: ${entry.department}` : ''}
${entry.topic ? `Topic: ${entry.topic}` : ''}
-------------------
    `).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sop-qa-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('TXT file downloaded successfully');
  };

  const handleShare = () => {
    if (selectedEntryForShare && shareEmail) {
      onShare(selectedEntryForShare, shareEmail);
      setShowShareModal(false);
      setShareEmail('');
      setSelectedEntryForShare(null);
      toast.success('Content shared successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">SOP Q&A History</h2>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search Q&A entries..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedEntries.size > 0 && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => downloadAsPDF(Array.from(selectedEntries).map(id => qaEntries.find(e => e.id === id)!).filter(Boolean))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Selected as PDF
            </button>
            <button
              onClick={() => downloadAsTxt(Array.from(selectedEntries).map(id => qaEntries.find(e => e.id === id)!).filter(Boolean))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Selected as TXT
            </button>
          </div>
        )}

        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{entry.question}</h3>
                  <p className="text-gray-600 mt-2">{entry.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => toggleSelection(entry.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      setSelectedEntryForShare(entry.id);
                      setShowShareModal(true);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {entry.department || 'No Department'}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {entry.topic || 'No Topic'}
                </span>
                <span>{format(new Date(entry.date), 'PPpp')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Share Q&A Entry</h3>
            <input
              type="email"
              placeholder="Enter recipient's email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}