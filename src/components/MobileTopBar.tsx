import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import NotificationCenter from '@/components/NotificationCenter';
import { supabase } from '@/lib/supabaseClient';

export const MobileTopBar: React.FC = () => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [pageTitle, setPageTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Determine the page title based on the current route
    const updatePageTitle = async () => {
      // Default title is empty
      let title = '';

      // Check if we're on a specific page
      if (location.pathname === '/' || location.pathname === '/dashboard') {
        title = 'Accueil';
      } else if (location.pathname.startsWith('/animal/') && id) {
        // If we're on an animal detail page, fetch the animal's name
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('animaux')
            .select('nom')
            .eq('id', id)
            .single();

          if (error) throw error;
          if (data) {
            title = data.nom || `Animal #${id}`;
          }
        } catch (error) {
          console.error('Error fetching animal name:', error);
          title = `Animal #${id}`;
        } finally {
          setLoading(false);
        }
      } else if (location.pathname === '/ajouter-animal') {
        title = 'Nouvel animal';
      } else if (location.pathname === '/admin') {
        title = 'Administration';
      }

      setPageTitle(title);
    };

    updatePageTitle();
  }, [location, id]);

  return (
    <div className="fixed top-0 left-0 right-0 h-12 bg-white shadow-sm px-4 z-10 flex items-center lg:hidden border-b-2 border-[#e9e5fa]">
      {/* Empty div to balance the notification center for centering */}
      <div className="w-10"></div>
      
      {/* Centered title */}
      <h1 className="font-semibold text-lg truncate flex-1 text-center">
        {loading ? 'Chargement...' : pageTitle}
      </h1>
      
      {/* Notification center */}
      <div className="w-10 flex justify-end">
        <NotificationCenter />
      </div>
    </div>
  );
}; 