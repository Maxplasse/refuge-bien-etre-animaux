import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import useOnClickOutside from '@/hooks/use-on-click-outside';

interface Notification {
  id: string;
  source: 'quarantine' | 'treatment' | 'vaccination';
  animal_id: number;
  animal_name: string;
  date: string;
  message: string;
  read: boolean;
}

// Storage key for tracking read notifications
const READ_NOTIFICATIONS_KEY = 'readNotificationsIds';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get read notification IDs from localStorage
  const getReadNotificationIds = (): string[] => {
    try {
      const storedIds = localStorage.getItem(READ_NOTIFICATIONS_KEY);
      return storedIds ? JSON.parse(storedIds) : [];
    } catch (error) {
      console.error('Error parsing read notifications from localStorage:', error);
      return [];
    }
  };

  // Save read notification IDs to localStorage
  const saveReadNotificationIds = (ids: string[]) => {
    try {
      localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Error saving read notifications to localStorage:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Update unread count whenever notifications change
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);
  
  // Use the custom hook for detecting clicks outside
  useOnClickOutside(panelRef, () => setIsOpen(false));

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Get read notification IDs from localStorage
      const readIds = getReadNotificationIds();
      
      // Create animal IDs set and animal names object to keep track of all animals
      let allAnimalIds = new Set<number>();
      let animalNames: Record<number, string> = {};
      let allNotifications: Notification[] = [];

      // 1. Fetch quarantine observations
      const { data: quarantineData, error: quarantineError } = await supabase
        .from('observations')
        .select(`
          id, 
          date, 
          description,
          quarantine_id,
          quarantines(animal_id)
        `)
        .order('date', { ascending: false })
        .limit(10);

      if (quarantineError) throw quarantineError;

      // Process quarantine observations
      quarantineData.forEach(item => {
        if (item.quarantines && typeof item.quarantines === 'object' && 'animal_id' in item.quarantines) {
          const animalId = (item.quarantines as any).animal_id;
          if (animalId) {
            allAnimalIds.add(animalId);
          }
        }
      });

      // 2. Fetch treatment observations
      const { data: treatmentData, error: treatmentError } = await supabase
        .from('traitements')
        .select(`
          id, 
          date,
          observation,
          animal_id,
          created_at
        `)
        .order('date', { ascending: false })
        .limit(10);

      if (treatmentError) throw treatmentError;

      // Process treatment animal IDs
      treatmentData.forEach(item => {
        if (item.animal_id) {
          allAnimalIds.add(item.animal_id);
        }
      });

      // 3. Fetch vaccination observations
      const { data: vaccinationData, error: vaccinationError } = await supabase
        .from('vaccinations')
        .select(`
          id, 
          date,
          observation,
          animal_id,
          created_at
        `)
        .order('date', { ascending: false })
        .limit(10);

      if (vaccinationError) throw vaccinationError;

      // Process vaccination animal IDs
      vaccinationData.forEach(item => {
        if (item.animal_id) {
          allAnimalIds.add(item.animal_id);
        }
      });

      // 4. Get animal names for all collected IDs if there are any
      if (allAnimalIds.size > 0) {
        const { data: animalsData } = await supabase
          .from('animaux')
          .select('id, nom')
          .in('id', Array.from(allAnimalIds));

        if (animalsData) {
          animalNames = animalsData.reduce((acc: Record<number, string>, animal) => {
            acc[animal.id] = animal.nom || 'Animal sans nom';
            return acc;
          }, {});
        }
      }

      // 5. Format quarantine notifications
      const quarantineNotifications: Notification[] = quarantineData
        .filter(obs => obs.description) // Only include observations with content
        .map(obs => {
          let animal_id = 0;
          if (obs.quarantines && typeof obs.quarantines === 'object' && 'animal_id' in obs.quarantines) {
            animal_id = (obs.quarantines as any).animal_id || 0;
          }
          
          return {
            id: `quarantine_${obs.id}`,
            source: 'quarantine',
            animal_id,
            animal_name: animal_id ? animalNames[animal_id] || 'Animal inconnu' : 'Animal inconnu',
            date: obs.date,
            message: obs.description || 'Nouvelle observation',
            read: readIds.includes(`quarantine_${obs.id}`)
          };
        });

      // 6. Format treatment notifications
      const treatmentNotifications: Notification[] = treatmentData
        .filter(treatment => treatment.observation) // Only include treatments with observations
        .map(treatment => {
          return {
            id: `treatment_${treatment.id}`,
            source: 'treatment',
            animal_id: treatment.animal_id || 0,
            animal_name: treatment.animal_id ? animalNames[treatment.animal_id] || 'Animal inconnu' : 'Animal inconnu',
            date: treatment.date || treatment.created_at,
            message: treatment.observation || 'Nouveau traitement',
            read: readIds.includes(`treatment_${treatment.id}`)
          };
        });

      // 7. Format vaccination notifications
      const vaccinationNotifications: Notification[] = vaccinationData
        .filter(vaccination => vaccination.observation) // Only include vaccinations with observations
        .map(vaccination => {
          return {
            id: `vaccination_${vaccination.id}`,
            source: 'vaccination',
            animal_id: vaccination.animal_id || 0,
            animal_name: vaccination.animal_id ? animalNames[vaccination.animal_id] || 'Animal inconnu' : 'Animal inconnu',
            date: vaccination.date || vaccination.created_at,
            message: vaccination.observation || 'Nouvelle vaccination',
            read: readIds.includes(`vaccination_${vaccination.id}`)
          };
        });

      // 8. Combine all notifications and sort by date (most recent first)
      allNotifications = [
        ...quarantineNotifications,
        ...treatmentNotifications,
        ...vaccinationNotifications
      ].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      // 9. Limit to most recent 15 notifications
      allNotifications = allNotifications.slice(0, 15);

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const formatNotificationDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Get notification source text for display
  const getSourceText = (source: string) => {
    switch (source) {
      case 'quarantine': return 'Quarantaine';
      case 'treatment': return 'Traitement';
      case 'vaccination': return 'Vaccination';
      default: return '';
    }
  };

  // Navigate to animal detail when clicking on a notification
  const handleNotificationClick = (notification: Notification) => {
    // Mark this notification as read
    markNotificationAsRead(notification.id);
    
    if (notification.animal_id > 0) {
      window.location.href = `/animal/${notification.animal_id}`;
    }
  };
  
  // Mark a single notification as read
  const markNotificationAsRead = (id: string) => {
    // Update UI state
    setNotifications(prevNotifications => 
      prevNotifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    
    // Update localStorage
    const readIds = getReadNotificationIds();
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      saveReadNotificationIds(newReadIds);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    // Get all notification IDs that aren't already read
    const allIds = notifications.filter(n => !n.read).map(n => n.id);
    if (allIds.length === 0) return;
    
    // Update UI state
    setNotifications(prevNotifications => 
      prevNotifications.map(n => ({ ...n, read: true }))
    );
    
    // Update localStorage by combining existing read IDs with newly read IDs
    const existingReadIds = getReadNotificationIds();
    const newReadIds = [...existingReadIds];
    
    // Add any IDs that aren't already in the array
    allIds.forEach(id => {
      if (!newReadIds.includes(id)) {
        newReadIds.push(id);
      }
    });
    
    saveReadNotificationIds(newReadIds);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost" 
        size="icon"
        onClick={toggleNotifications}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div 
          ref={panelRef}
          className="absolute z-50 top-full right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden"
        >
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center gap-1 h-auto py-1"
                onClick={markAllAsRead}
              >
                <Check className="h-3 w-3" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune notification</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer",
                    !notification.read && "bg-blue-50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{notification.animal_name}</span>
                    <span className="text-xs text-gray-500">{formatNotificationDate(notification.date)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded-full ml-1">
                      {getSourceText(notification.source)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 