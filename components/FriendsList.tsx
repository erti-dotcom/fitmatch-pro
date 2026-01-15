import React from 'react';
import { UserProfile } from '../types';
import { UserMinus, Search } from 'lucide-react';

interface FriendsListProps {
    users: UserProfile[];
    followingIds: string[];
    onUnfollow: (id: string) => void;
    onProfileClick: (id: string) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({ users, followingIds, onUnfollow, onProfileClick }) => {
    const following = users.filter(u => followingIds.includes(u.id));

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Deine Community ({following.length})</h2>
            
            <div className="grid grid-cols-1 gap-4">
                {following.length > 0 ? (
                    following.map(user => (
                        <div key={user.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                            <div 
                                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => onProfileClick(user.id)}
                            >
                                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <h4 className="font-bold text-white">{user.name}</h4>
                                    <p className="text-xs text-gray-400">{user.level} • {user.location}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => onUnfollow(user.id)}
                                className="text-red-400 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                                title="Entfolgen"
                            >
                                <UserMinus size={20} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                        <p className="text-gray-400">Du folgst noch niemandem.</p>
                        <p className="text-sm text-gray-500 mt-1">Gehe auf "Entdecken", um Leute zu finden!</p>
                    </div>
                )}
            </div>
        </div>
    );
};