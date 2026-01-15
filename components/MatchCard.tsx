import React, { useState } from 'react';
import { UserProfile, MatchRecommendation } from '../types';
import { getMatchAnalysis } from '../services/geminiService';
import { Heart, MessageCircle, Zap } from 'lucide-react';

interface MatchCardProps {
  currentUser: UserProfile;
  candidate: UserProfile;
  onConnect: (id: string) => void;
  onChat: (id: string) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ currentUser, candidate, onConnect, onChat }) => {
  const [analysis, setAnalysis] = useState<MatchRecommendation | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    const result = await getMatchAnalysis(currentUser, candidate);
    setAnalysis(result);
    setLoadingAi(false);
  };

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300">
      <div className="h-48 bg-gray-700 relative">
        <img 
          src={candidate.avatar} 
          alt={candidate.name} 
          className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
        />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 to-transparent p-4">
          <h3 className="text-2xl font-bold text-white">{candidate.name}, {candidate.age}</h3>
          <p className="text-blue-400 font-medium">{candidate.location}</p>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {candidate.sports.map(sport => (
            <span key={sport} className="bg-blue-900 text-blue-200 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              {sport}
            </span>
          ))}
          <span className="bg-purple-900 text-purple-200 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            {candidate.level}
          </span>
        </div>

        <p className="text-gray-300 text-sm italic">"{candidate.bio}"</p>
        
        {analysis ? (
          <div className="bg-gray-700/50 p-3 rounded-lg border border-green-500/30 animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 font-bold text-sm">Gemini Match Score</span>
                <span className="text-white font-bold">{analysis.score}%</span>
             </div>
             <p className="text-xs text-gray-300 mb-2">{analysis.reasoning}</p>
             <div className="text-xs bg-gray-800 p-2 rounded text-blue-300">
               💡 Tipp: {analysis.suggestedActivity}
             </div>
          </div>
        ) : (
          <button 
            onClick={handleAiAnalysis}
            disabled={loadingAi}
            className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            <Zap size={14} className={loadingAi ? "animate-pulse text-yellow-400" : "text-yellow-400"} />
            {loadingAi ? "Analysiere..." : "AI Kompatibilitäts-Check"}
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 mt-4">
            <button 
                onClick={() => onConnect(candidate.id)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
                <Heart size={18} />
                Match
            </button>
            <button 
                onClick={() => onChat(candidate.id)}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
                <MessageCircle size={18} />
                Nachricht
            </button>
        </div>
      </div>
    </div>
  );
};
