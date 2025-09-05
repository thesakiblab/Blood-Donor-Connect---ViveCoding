import React from 'react';
import { BLOOD_GROUPS } from '../constants';
import { BloodGroup } from '../types';

interface BloodGroupSelectorProps {
    value: BloodGroup | '';
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    includeAllOption?: boolean;
    // FIX: Add name prop to allow form handlers to identify the select element.
    name?: string;
}

const BloodGroupSelector: React.FC<BloodGroupSelectorProps> = ({ value, onChange, required = false, includeAllOption = false, name }) => {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
            {includeAllOption && <option value="">All Blood Groups</option>}
            {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                    {group}
                </option>
            ))}
        </select>
    );
};

export default BloodGroupSelector;