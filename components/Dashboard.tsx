import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { UserProfile, SportType } from '../types';

interface DashboardProps {
    user: UserProfile;
    matches: UserProfile[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, matches }) => {
    
    // Calculate simple stats
    const sportStats = Object.values(SportType).map(sport => {
        const count = matches.filter(m => m.sports.includes(sport)).length + (user.sports.includes(sport) ? 1 : 0);
        return { name: sport, count };
    }).filter(s => s.count > 0);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm uppercase font-bold mb-1">Training diese Woche</h3>
                    <p className="text-4xl font-bold text-white">{user.frequency} <span className="text-lg text-gray-500 font-normal">Einheiten</span></p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm uppercase font-bold mb-1">Potential Matches</h3>
                    <p className="text-4xl font-bold text-blue-400">{matches.length}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                    <h3 className="text-gray-400 text-sm uppercase font-bold mb-1">Dein Level</h3>
                    <p className="text-2xl font-bold text-purple-400 mt-2">{user.level}</p>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold text-white mb-6">Community Sportarten Trend</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sportStats}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ color: '#60a5fa' }}
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {sportStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
