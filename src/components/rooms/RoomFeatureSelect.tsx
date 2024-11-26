import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { RoomFeature } from '../../types';
import { Check } from 'lucide-react';

interface RoomFeatureSelectProps {
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
}

export default function RoomFeatureSelect({ selectedFeatures, onChange }: RoomFeatureSelectProps) {
  const { data: features, isLoading } = useQuery({
    queryKey: ['room-features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('room_features')
        .select('*')
        .eq('is_active', true)
        .order('category');
      
      if (error) throw error;
      return data as RoomFeature[];
    }
  });

  const toggleFeature = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      onChange(selectedFeatures.filter(id => id !== featureId));
    } else {
      onChange([...selectedFeatures, featureId]);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map(n => (
          <div key={n} className="h-10 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  const groupedFeatures = features?.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, RoomFeature[]>);

  return (
    <div className="space-y-6">
      {groupedFeatures && Object.entries(groupedFeatures).map(([category, features]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">
            {category}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {features.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => toggleFeature(feature.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border ${
                  selectedFeatures.includes(feature.id)
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-600 hover:bg-indigo-50'
                }`}
              >
                {selectedFeatures.includes(feature.id) && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
                <span className="text-sm">{feature.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}