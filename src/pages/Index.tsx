import React from 'react';
import AnimalDashboard from '@/components/AnimalDashboard';
import DashboardStats from '@/components/DashboardStats';

const Index = () => {
  return (
    <>
      <DashboardStats />
      <AnimalDashboard />
    </>
  );
};

export default Index;
