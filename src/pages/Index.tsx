import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalDashboard from '@/components/AnimalDashboard';
import DashboardStats from '@/components/DashboardStats';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);

  return null;
};

export default Index;
