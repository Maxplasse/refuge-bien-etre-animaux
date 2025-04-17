
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { animals } from './animalData';

const DashboardStats = () => {
  // Calculate statistics
  const totalAnimals = animals.length;
  const activeAnimals = animals.filter(a => a.status === 'active').length;
  const inTreatment = animals.filter(a => a.status === 'treatment').length;
  const inQuarantine = animals.filter(a => a.status === 'quarantine').length;
  
  const stats = [
    { label: 'Total des animaux', value: totalAnimals, color: 'bg-shelter-light-purple' },
    { label: 'Animaux actifs', value: activeAnimals, color: 'bg-green-100' },
    { label: 'Sous traitement', value: inTreatment, color: 'bg-blue-100' },
    { label: 'En quarantaine', value: inQuarantine, color: 'bg-amber-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <div className={`h-1 ${stat.color}`}></div>
          <CardContent className="pt-4">
            <h3 className="text-lg font-semibold">{stat.value}</h3>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
