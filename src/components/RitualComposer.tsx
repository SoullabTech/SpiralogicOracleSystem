import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, GripVertical, X, Save, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface RitualStep {
  id: string;
  type: string;
  title: string;
  description: string;
  duration: number;
  element?: string;
  content: string;
}

interface RitualFlow {
  id: string;
  name: string;
  description: string;
  steps: RitualStep[];
  element?: string;
  duration: number;
}

const stepTypes = [
  { id: 'oracle', name: 'Oracle Pull', icon: '🔮' },
  { id: 'breathwork', name: 'Breathwork', icon: '🫁' },
  { id: 'journaling', name: 'Journaling', icon: '📝' },
  { id: 'meditation', name: 'Meditation', icon: '🧘' },
  { id: 'movement', name: 'Movement', icon: '💫' },
  { id: 'reflection', name: 'Reflection', icon: '🌟' }
];

export function RitualComposer() {
  const [flow, setFlow] = useState<RitualFlow>({
    id: '',
    name: '',
    description: '',
    steps: [],
    duration: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState('');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const steps = Array.from(flow.steps);
    const [reorderedItem] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, reorderedItem);

    setFlow({ ...flow, steps });
  };

  const addStep = (type: string) => {
    const newStep: RitualStep = {
      id: `step-${Date.now()}`,
      type,
      title: '',
      description: '',
      duration: 5,
      content: ''
    };

    setFlow({
      ...flow,
      steps: [...flow.steps, newStep]
    });
    setSelectedType('');
  };

  const removeStep = (stepId: string) => {
    setFlow({
      ...flow,
      steps: flow.steps.filter(step => step.id !== stepId)
    });
  };

  const updateStep = (stepId: string, updates: Partial<RitualStep>) => {
    setFlow({
      ...flow,
      steps: flow.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };

  const saveFlow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ritual_flows')
        .upsert({
          id: flow.id || undefined,
          name: flow.name,
          description: flow.description,
          steps: flow.steps,
          element: flow.element,
          duration: flow.steps.reduce((total, step) => total + step.duration, 0),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      setFlow(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving flow:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Play className="text-green-600" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ritual Composer</h2>
            <p className="text-sm text-gray-500">Design multi-step ceremonial flows</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {isEditing ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={saveFlow}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            Save Flow
          </button>
        </div>
      </div>

      {/* Flow Details */}
      {isEditing && (
        <div className="mb-6 space-y-4">
          <input
            type="text"
            value={flow.name}
            onChange={(e) => setFlow({ ...flow, name: e.target.value })}
            placeholder="Flow Name"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <textarea
            value={flow.description}
            onChange={(e) => setFlow({ ...flow, description: e.target.value })}
            placeholder="Flow Description"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <select
            value={flow.element}
            onChange={(e) => setFlow({ ...flow, element: e.target.value })}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select Element</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="earth">Earth</option>
            <option value="air">Air</option>
            <option value="aether">Aether</option>
          </select>
        </div>
      )}

      {/* Steps */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {flow.steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="bg-gray-50 rounded-lg p-4 border"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="text-gray-400" size={20} />
                        </div>
                        <span className="text-sm font-medium">Step {index + 1}</span>
                        <div className="flex-1" />
                        <button
                          onClick={() => removeStep(step.id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X size={16} className="text-gray-500" />
                        </button>
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={step.title}
                            onChange={(e) => updateStep(step.id, { title: e.target.value })}
                            placeholder="Step Title"
                            className="w-full p-2 border rounded-lg"
                          />
                          <textarea
                            value={step.description}
                            onChange={(e) => updateStep(step.id, { description: e.target.value })}
                            placeholder="Step Description"
                            className="w-full p-2 border rounded-lg"
                          />
                          <div className="flex gap-4">
                            <input
                              type="number"
                              value={step.duration}
                              onChange={(e) => updateStep(step.id, { duration: parseInt(e.target.value) })}
                              placeholder="Duration (minutes)"
                              className="w-32 p-2 border rounded-lg"
                            />
                            <select
                              value={step.element}
                              onChange={(e) => updateStep(step.id, { element: e.target.value })}
                              className="flex-1 p-2 border rounded-lg"
                            >
                              <option value="">Element (optional)</option>
                              <option value="fire">Fire</option>
                              <option value="water">Water</option>
                              <option value="earth">Earth</option>
                              <option value="air">Air</option>
                              <option value="aether">Aether</option>
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-medium">{step.title || 'Untitled Step'}</h4>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{step.duration} minutes</span>
                            {step.element && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                step.element === 'fire' ? 'bg-orange-100 text-orange-800' :
                                step.element === 'water' ? 'bg-blue-100 text-blue-800' :
                                step.element === 'earth' ? 'bg-green-100 text-green-800' :
                                step.element === 'air' ? 'bg-purple-100 text-purple-800' :
                                'bg-indigo-100 text-indigo-800'
                              }`}>
                                {step.element}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Step */}
      {isEditing && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Plus size={16} className="text-gray-400" />
            <span className="text-sm font-medium">Add Step</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stepTypes.map(type => (
              <button
                key={type.id}
                onClick={() => addStep(type.id)}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span>{type.icon}</span>
                  <span>{type.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}