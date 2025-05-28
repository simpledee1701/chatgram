import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { genAI } from '../firebase/firebaseConfig';

export default function ChatSummarizerModal({
  onClose,
  selectedUser,
  selectedGroup,
  selectedAI,
  currentUser
}) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const db = getFirestore();
      let q;

      const startTimestamp = new Date(startDate);
      const endTimestamp = new Date(endDate);

      if (selectedUser) {
        const participants = [currentUser.uid, selectedUser.uid].sort();
        q = query(
          collection(db, 'messages'),
          where('conversationId', '==', participants.join('_')),
          where('timestamp', '>=', startTimestamp),
          where('timestamp', '<=', endTimestamp),
          orderBy('timestamp', 'asc'),
          limit(1000)
        );
      } else if (selectedGroup) {
        q = query(
          collection(db, 'messages'),
          where('groupId', '==', selectedGroup.id),
          where('timestamp', '>=', startTimestamp),
          where('timestamp', '<=', endTimestamp),
          orderBy('timestamp', 'asc'),
          limit(1000)
        );
      } else if (selectedAI) {
        q = query(
          collection(db, 'aiMessages'),
          where('userId', '==', currentUser.uid),
          where('timestamp', '>=', startTimestamp),
          where('timestamp', '<=', endTimestamp),
          orderBy('timestamp', 'asc'),
          limit(1000)
        );
      } else {
        setError('No chat selected');
        return;
      }

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          sender: data.displayName || (data.isAI ? 'AI Assistant' : 'Unknown'),
          text: data.text,
          timestamp: data.timestamp?.toDate().toLocaleString(),
          imageUrl: data.imageUrl
        };
      });

      if (messages.length === 0) {
        setError('No messages found in selected date range');
        return;
      }

      const prompt = `Summarize the following conversation between ${startDate.toLocaleString()} and ${endDate.toLocaleString()}.\n
        Highlight key points, decisions, and important information. Include any images mentioned.\n\n
        Conversation:\n${messages.map(m => 
          `[${m.timestamp}] ${m.sender}: ${m.text}${m.imageUrl ? ' (attached image)' : ''}`
        ).join('\n')}`;

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setSummary(response.text());
    } catch (err) {
      console.error('Summarization error:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl text-white font-semibold">Chat Summary Generator</h2>
        </div>
        
        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="bg-gray-700 text-white p-3 rounded-md w-full border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2 font-medium">End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="bg-gray-700 text-white p-3 rounded-md w-full border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-md mb-4">
              {error}
            </div>
          )}

          {summary && (
            <div className="bg-gray-700 border border-gray-600 rounded-md mb-6">
              <div className="p-4 border-b border-gray-600">
                <h3 className="font-semibold text-white text-lg">Summary:</h3>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="whitespace-pre-wrap text-gray-200 leading-relaxed">
                  {summary}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-gray-700 flex-shrink-0">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              Close
            </button>
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? 'Generating...' : 'Summarize'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};