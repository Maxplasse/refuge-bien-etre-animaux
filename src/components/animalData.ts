export type AnimalStatus = 'active' | 'quarantine' | 'treatment' | 'transferred' | 'deceased';

export interface Animal {
  id: string;
  name: string;
  species: 'chat' | 'chien' | 'chevre' | 'cochon' | 'lapin' | 'rat' | 'chinchilla' | 'gerbille' | 'canard' | 'poule' | 'pigeon' | 'tourterelle' | 'tortue' | 'hamster' | 'autre';
  breed?: string;
  status: AnimalStatus;
  gender: 'mâle' | 'femelle';
  age?: string;
  image?: string;
  entryDate: string;
  description?: string;
}

// Sample data
export const animals: Animal[] = [
  {
    id: '1',
    name: 'Luna',
    species: 'chat',
    breed: 'Siamois',
    status: 'active',
    gender: 'femelle',
    age: '2 ans',
    image: '/placeholder.svg',
    entryDate: '2024-03-15',
    description: 'Luna est une chatte très affectueuse qui aime les câlins.'
  },
  {
    id: '2',
    name: 'Max',
    species: 'chien',
    breed: 'Berger Allemand',
    status: 'quarantine',
    gender: 'mâle',
    age: '3 ans',
    image: '/placeholder.svg',
    entryDate: '2024-04-02',
    description: 'Max est très joueur et aime les longues promenades.'
  },
  {
    id: '3',
    name: 'Mia',
    species: 'chat',
    breed: 'Européen',
    status: 'treatment',
    gender: 'femelle',
    age: '1 an',
    image: '/placeholder.svg',
    entryDate: '2024-04-05',
    description: 'Mia se remet d\'une intervention chirurgicale mineure.'
  },
  {
    id: '4',
    name: 'Rocky',
    species: 'chien',
    breed: 'Labrador',
    status: 'active',
    gender: 'mâle',
    age: '5 ans',
    image: '/placeholder.svg',
    entryDate: '2024-03-20',
    description: 'Rocky est un chien calme qui s\'entend bien avec les autres animaux.'
  },
  {
    id: '5',
    name: 'Bella',
    species: 'chat',
    breed: 'Maine Coon',
    status: 'active',
    gender: 'femelle',
    age: '4 ans',
    image: '/placeholder.svg',
    entryDate: '2024-03-10',
    description: 'Bella est une chatte indépendante qui aime explorer.'
  },
  {
    id: '6',
    name: 'Charlie',
    species: 'chien',
    breed: 'Beagle',
    status: 'active',
    gender: 'mâle',
    age: '2 ans',
    image: '/placeholder.svg',
    entryDate: '2024-03-25',
    description: 'Charlie est très énergique et aime jouer à la balle.'
  },
  {
    id: '7',
    name: 'Oscar',
    species: 'chat',
    breed: 'Persan',
    status: 'transferred',
    gender: 'mâle',
    age: '6 ans',
    image: '/placeholder.svg',
    entryDate: '2024-02-15',
    description: 'Oscar a été transféré dans une famille d\'accueil temporaire.'
  },
  {
    id: '8',
    name: 'Ruby',
    species: 'autre',
    breed: 'Lapin nain',
    status: 'active',
    gender: 'femelle',
    age: '1 an',
    image: '/placeholder.svg',
    entryDate: '2024-04-01',
    description: 'Ruby est une lapine très douce qui aime les carottes.'
  }
];

export const getStatusLabel = (status: AnimalStatus): string => {
  switch (status) {
    case 'active':
      return 'Actif';
    case 'quarantine':
      return 'En quarantaine';
    case 'treatment':
      return 'Sous traitement';
    case 'transferred':
      return 'Transféré';
    case 'deceased':
      return 'Décédé';
    default:
      return '';
  }
};

export const getStatusClass = (status: AnimalStatus): string => {
  switch (status) {
    case 'active':
      return 'status-active';
    case 'quarantine':
      return 'status-quarantine';
    case 'treatment':
      return 'status-treatment';
    case 'transferred':
      return 'status-transferred';
    case 'deceased':
      return 'status-deceased';
    default:
      return '';
  }
};
