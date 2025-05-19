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
    // Get current read IDs
    const readIds = getReadNotificationIds();
    
    // If ID is not already in the list, add it
    if (!readIds.includes(id)) {
      const newReadIds = [...readIds, id];
      saveReadNotificationIds(newReadIds);
      
      // Update the UI
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    // Get unread notifications
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;
    
    // Get current read IDs
    const readIds = getReadNotificationIds();
    
    // Add all unread notification IDs to the read list
    const newReadIds = [
      ...readIds,
      ...unreadNotifications.map(n => n.id).filter(id => !readIds.includes(id))
    ];
    
    // Save to localStorage
    saveReadNotificationIds(newReadIds);
    
    // Update the UI
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications}
        className="relative p-2 text-gray-700 hover:text-shelter-purple focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          ref={panelRef}
          className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden max-h-[80vh] overflow-y-auto lg:mt-2 lg:right-0 lg:top-full lg:w-96
          sm:w-[calc(100vw-2rem)] sm:right-[-0.25rem]"
        >
          <div className="p-3 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                onClick={markAllAsRead}
                variant="ghost" 
                size="sm"
                className="text-xs flex items-center gap-1 h-7 hover:bg-gray-100"
              >
                <Check className="h-3 w-3" />
                <span>Tout marquer comme lu</span>
              </Button>
            )}
          </div>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Chargement des notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "p-3 hover:bg-gray-50 cursor-pointer transition-colors",
                      notification.read ? "bg-white" : "bg-blue-50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{notification.animal_name}</span>
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full",
                          notification.source === 'quarantine' ? "bg-red-100 text-red-800" :
                          notification.source === 'treatment' ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-green-800"
                        )}>
                          {getSourceText(notification.source)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatNotificationDate(notification.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 