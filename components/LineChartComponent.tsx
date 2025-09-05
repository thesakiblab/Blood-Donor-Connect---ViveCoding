import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface LineChartComponentProps {
    users: User[];
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ users }) => {
    // FIX: Add defensive check for user.id to prevent errors with invalid or missing IDs.
    const data = users
        .filter(user => user.id && !isNaN(parseInt(user.id)))
        .map(user => ({
            date: new Date(parseInt(user.id)).toISOString().split('T')[0],
        }))
        .reduce((acc, curr) => {
            const existing = acc.find(item => item.date === curr.date);
            if (existing) {
                existing.registrations += 1;
            } else {
                acc.push({ date: curr.date, registrations: 1 });
            }
            return acc;
        }, [] as { date: string; registrations: number }[])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (data.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400">No registration data available.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="registrations" stroke="#e53935" strokeWidth={2} name="New Registrations" dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default LineChartComponent;