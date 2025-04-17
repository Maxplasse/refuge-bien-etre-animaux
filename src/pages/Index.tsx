
import React from 'react';
import Layout from '@/components/Layout';
import AnimalDashboard from '@/components/AnimalDashboard';
import DashboardStats from '@/components/DashboardStats';

const Index = () => {
  return (
    <Layout>
      <DashboardStats />
      <AnimalDashboard />
    </Layout>
  );
};

export default Index;
