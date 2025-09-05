import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from '../types';

interface PieChartComponentProps {
    users: User[];
}

const COLORS = ['#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', '#1e88e5', '#039be5', '#00acc1'];

const PieChartComponent: React.FC<PieChartComponentProps> = ({ users }) => {
    const data = users.reduce((acc, user) => {
        const group = user.bloodGroup;
        const existing = acc.find(item => item.name === group);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: group, value: 1 });
        }
        return acc;
    }, [] as { name: string; value: number }[]);

    if (data.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400">No donor data available for chart.</p>
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PieChartComponent;