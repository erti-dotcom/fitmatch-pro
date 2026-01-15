import React, { useState } from 'react';
import { UserProfile, ActivityLog, SportType } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Clock, Flame, User } from 'lucide-react';

interface SocialFeedProps {
    currentUser: UserProfile;
    activities: ActivityLog[]; // Combined stream of all friends + user
    users: UserProfile[]; // To resolve IDs to names/avatars
}

export const SocialFeed: React.FC<SocialFeedProps> = ({ currentUser, activities, users }) => {
    // Sort by date desc
    const sortedActivities = [...activities].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-20">
            {sortedActivities.map(activity => (
                <FeedCard key={activity.id} activity={activity} currentUser={currentUser} allUsers={users} />
            ))}
            
            {sortedActivities.length === 0 && (
                <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700">
                    <div className="bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-gray-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-white">Dein Feed ist leer</h3>
                    <p className="text-gray-400 mt-2">Folge anderen Sportlern oder logge dein erstes Workout!</p>
                </div>
            )}
        </div>
    );
};

const FeedCard = ({ activity, currentUser, allUsers }: { activity: ActivityLog, currentUser: UserProfile, allUsers: UserProfile[] }) => {
    const [liked, setLiked] = useState(activity.likes?.includes(currentUser.id) || false);
    const [likeCount, setLikeCount] = useState(activity.likes?.length || 0);

    const owner = allUsers.find(u => u.id === activity.userId) || currentUser;
    
    // Formatting
    const dateObj = new Date(activity.date);
    const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = dateObj.toLocaleDateString();
    
    // Sport Icon Helper
    const getSportColor = (type: string) => {
        switch(type) {
            case SportType.RUNNING: return 'from-orange-500 to-red-500';
            case SportType.HYROX: return 'from-yellow-500 to-orange-600';
            case SportType.GYM: return 'from-blue-600 to-purple-600';
            case SportType.YOGA: return 'from-green-500 to-teal-500';
            default: return 'from-gray-600 to-gray-700';
        }
    };

    const handleLike = () => {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
        // Note: In a real app, this would dispatch an API call
    };

    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={owner.avatar} alt={owner.name} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                    <div>
                        <h4 className="font-bold text-white text-sm">{owner.name}</h4>
                        <p className="text-xs text-gray-400">{dateString} um {timeString} • {owner.location}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white"><MoreHorizontal size={20} /></button>
            </div>

            {/* Content Visualization (Map Placeholder / Stat Block) */}
            <div className={`h-48 bg-gradient-to-br ${getSportColor(activity.type)} relative p-6 flex flex-col justify-between`}>
                <div className="flex justify-between items-start">
                    <span className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                        {activity.type}
                    </span>
                    {activity.taggedUserIds && activity.taggedUserIds.length > 0 && (
                        <div className="flex -space-x-2">
                             {activity.taggedUserIds.map(tid => {
                                 const u = allUsers.find(user => user.id === tid);
                                 return u ? <img key={tid} src={u.avatar} className="w-8 h-8 rounded-full border-2 border-white/20" title={u.name} /> : null;
                             })}
                        </div>
                    )}
                </div>
                
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{activity.notes || `${activity.type} Session`}</h2>
                    <div className="flex gap-6 mt-2">
                        <div>
                            <p className="text-white/70 text-xs uppercase font-bold">Dauer</p>
                            <p className="text-white font-mono text-xl">{activity.duration} <span className="text-sm">min</span></p>
                        </div>
                        {activity.distance && (
                            <div>
                                <p className="text-white/70 text-xs uppercase font-bold">Distanz</p>
                                <p className="text-white font-mono text-xl">{activity.distance} <span className="text-sm">km</span></p>
                            </div>
                        )}
                        <div>
                            <p className="text-white/70 text-xs uppercase font-bold">Kalorien</p>
                            <p className="text-white font-mono text-xl">~{Math.floor(activity.duration * 8)} <span className="text-sm">kcal</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-gray-700 flex items-center gap-6">
                <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                >
                    <Heart size={20} fill={liked ? "currentColor" : "none"} />
                    {likeCount}
                </button>
                <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                    <MessageCircle size={20} />
                    {activity.comments?.length || 0}
                </button>
                <div className="flex-1"></div>
                <button className="text-gray-400 hover:text-white"><Share2 size={20} /></button>
            </div>
        </div>
    );
};