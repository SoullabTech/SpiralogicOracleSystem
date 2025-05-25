import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSystemConfig } from '../../services/adminService';

export function ConfigurationPanel() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState({
    elementalWeights: {
      fire: 0.5,
      water: 0.5,
      earth: 0.5,
      air: 0.5,
      aether: 0.5,
    },
    confidenceThresholds: {
      memory: 0.7,
      pattern: 0.8,
      wisdom: 0.9,
    },
    systemParameters: {
      maxTokens: 2000,
      temperature: 0.7,
      responseTimeout: 30000,
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSystemConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemConfig'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(config);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">System Configuration</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Elemental Weights</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(config.elementalWeights).map(([element, weight]) => (
              <div key={element}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {element}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={weight}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      elementalWeights: {
                        ...prev.elementalWeights,
                        [element]: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {(weight * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Confidence Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(config.confidenceThresholds).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={value}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      confidenceThresholds: {
                        ...prev.confidenceThresholds,
                        [key]: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {(value * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">System Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={config.systemParameters.maxTokens}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    systemParameters: {
                      ...prev.systemParameters,
                      maxTokens: parseInt(e.target.value),
                    },
                  }))
                }
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={config.systemParameters.temperature}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    systemParameters: {
                      ...prev.systemParameters,
                      temperature: parseFloat(e.target.value),
                    },
                  }))
                }
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Timeout (ms)
              </label>
              <input
                type="number"
                step="1000"
                value={config.systemParameters.responseTimeout}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    systemParameters: {
                      ...prev.systemParameters,
                      responseTimeout: parseInt(e.target.value),
                    },
                  }))
                }
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}