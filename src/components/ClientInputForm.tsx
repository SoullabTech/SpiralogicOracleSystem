import React, { useState } from 'react';
import { UserPlus, Mail, Flame, Target } from 'lucide-react';

interface ClientData {
  client_name: string;
  email: string;
  journey: {
    dominant_element: string;
    current_phase: string;
  };
}

interface ClientInputFormProps {
  onSubmit: (clientData: ClientData) => void;
  isLoading?: boolean;
}

export const ClientInputForm: React.FC<ClientInputFormProps> = ({ 
  onSubmit,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    client_name: '',
    email: '',
    dominant_element: 'fire',
    current_phase: 'exploration',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const clientData: ClientData = {
      client_name: formData.client_name,
      email: formData.email,
      journey: {
        dominant_element: formData.dominant_element,
        current_phase: formData.current_phase
      }
    };
    
    onSubmit(clientData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <UserPlus className="text-green-600" size={20} />
        </div>
        <h2 className="text-xl font-bold">New Client</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Name
          </label>
          <div className="relative">
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <UserPlus className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dominant Element
          </label>
          <div className="relative">
            <select
              name="dominant_element"
              value={formData.dominant_element}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="fire">Fire</option>
              <option value="water">Water</option>
              <option value="earth">Earth</option>
              <option value="air">Air</option>
              <option value="aether">Aether</option>
            </select>
            <Flame className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Phase
          </label>
          <div className="relative">
            <select
              name="current_phase"
              value={formData.current_phase}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
            >
              <option value="exploration">Exploration</option>
              <option value="growth">Growth</option>
              <option value="integration">Integration</option>
              <option value="mastery">Mastery</option>
            </select>
            <Target className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <UserPlus size={20} />
        {isLoading ? 'Creating...' : 'Create Client'}
      </button>
    </form>
  );
};