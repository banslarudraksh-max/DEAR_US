import { 
  Memory, 
  TimelineEvent, 
  PlaceMemory, 
  FutureLetter, 
  MemoryCapsule, 
  BucketListItem, 
  CountdownEvent, 
  UserProfile,
  SpecialDate,
  HomepageCms,
  CategoryItem,
  MoodItem,
  AuditLogEntry,
  AdminMediaItem
} from '../types';

export const initialProfile: UserProfile = {
  id: 'partner-1',
  email: 'elena@dearus.love',
  name: 'Elena',
  partnerName: 'Julian',
  relationshipStartDate: '2023-04-14',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  partnerAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  anniversaryTitle: 'The Night at the Bookstore Cafe',
  customQuote: 'Every chapter with you is my favorite page.',
  role: 'admin'
};

export const demoMemories: Memory[] = [
  {
    id: 'mem-1',
    userId: 'partner-1',
    creatorName: 'Elena',
    title: 'Rainy afternoon at Shakespeare & Company',
    date: '2024-04-14',
    description: 'We escaped the sudden spring downpour and took refuge on the quiet upper floor. You found that old volume of Neruda poems and whispered the third stanza while rain drummed against the glass. We lost track of time until closing bells.',
    photos: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=1200&q=85'
    ],
    location: 'Paris, France',
    latitude: 48.8525,
    longitude: 2.3470,
    mood: 'Magical',
    category: 'Travel',
    tags: ['rainy day', 'books', 'poetry', 'paris'],
    isFavorite: true,
    isPrivate: false,
    songTitle: 'Clair de Lune - Claude Debussy',
    songUrl: 'https://open.spotify.com/track/6N7gZrjdV5vTCV9P0lq8cT',
    reactions: [
      { id: 'rx-1', emoji: '✨', label: 'Magical', userName: 'Julian', createdAt: '2024-04-14T20:00:00Z' },
      { id: 'rx-2', emoji: '💌', label: 'Cherished', userName: 'Elena', createdAt: '2024-04-14T20:05:00Z' }
    ],
    createdAt: '2024-04-14T19:30:00Z',
    updatedAt: '2024-04-14T19:30:00Z'
  },
  {
    id: 'mem-2',
    userId: 'partner-2',
    creatorName: 'Julian',
    title: 'The Cliffside Picnic at Golden Hour',
    date: '2024-07-22',
    description: 'Fresh sourdough, salted butter, ripe figs, and a bottle of chilled pinot noir. The Pacific stretched out like molten copper beneath us. You laughed so hard when the seagull tried to steal your napkin.',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=85'
    ],
    location: 'Big Sur, California',
    latitude: 36.2704,
    longitude: -121.8081,
    mood: 'Peaceful',
    category: 'Special',
    tags: ['sunset', 'pacific coast', 'picnic', 'wine'],
    isFavorite: true,
    isPrivate: false,
    songTitle: 'Holocene - Bon Iver',
    reactions: [
      { id: 'rx-3', emoji: '🥂', label: 'Toast', userName: 'Elena', createdAt: '2024-07-22T21:00:00Z' }
    ],
    createdAt: '2024-07-22T20:15:00Z',
    updatedAt: '2024-07-22T20:15:00Z'
  },
  {
    id: 'mem-3',
    userId: 'partner-1',
    creatorName: 'Elena',
    title: 'Midnight Pasta & Jazz in the Kitchen',
    date: '2025-01-18',
    description: 'We came home exhausted from work and decided to make cacio e pepe from scratch at 11:30 PM. The vinyl was crackling, flour ended up on your cheek, and we slow danced barefoot by the stove waiting for the water to boil.',
    photos: [
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=85'
    ],
    location: 'Our Apartment Kitchen',
    latitude: 37.7749,
    longitude: -122.4194,
    mood: 'Love',
    category: 'Everyday',
    tags: ['kitchen', 'cacio e pepe', 'vinyl', 'slow dance'],
    isFavorite: true,
    isPrivate: false,
    songTitle: 'Autumn in New York - Chet Baker',
    reactions: [
      { id: 'rx-4', emoji: '✨', label: 'Magical', userName: 'Julian', createdAt: '2025-01-19T08:00:00Z' }
    ],
    createdAt: '2025-01-18T23:45:00Z',
    updatedAt: '2025-01-18T23:45:00Z'
  },
  {
    id: 'mem-4',
    userId: 'partner-2',
    creatorName: 'Julian',
    title: 'First Autumn Fog over the Golden Gate',
    date: '2024-10-09',
    description: 'Bundled in oversized knit scarves, thermos of spiced apple cider in hand. The city vanished behind a wall of white mist and for two hours, the headlands belonged only to us.',
    photos: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=85'
    ],
    location: 'Marin Headlands, CA',
    latitude: 37.8267,
    longitude: -122.4998,
    mood: 'Adventure',
    category: 'Travel',
    tags: ['autumn', 'fog', 'cider', 'hike'],
    isFavorite: false,
    isPrivate: false,
    reactions: [],
    createdAt: '2024-10-09T18:00:00Z',
    updatedAt: '2024-10-09T18:00:00Z'
  },
  {
    id: 'mem-5',
    userId: 'partner-1',
    creatorName: 'Elena',
    title: 'The Starlit Glamping Night in Joshua Tree',
    date: '2025-05-30',
    description: 'No cell reception, just a crackling cedar fire and the Milky Way arching across the black desert canopy. You pointed out Cassiopeia and told me the folklore behind the constellations.',
    photos: [
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1200&q=85'
    ],
    location: 'Joshua Tree, California',
    latitude: 33.8734,
    longitude: -115.9010,
    mood: 'Magical',
    category: 'Travel',
    tags: ['stars', 'desert', 'campfire', 'stargazing'],
    isFavorite: true,
    isPrivate: false,
    songTitle: 'Space Song - Beach House',
    reactions: [
      { id: 'rx-5', emoji: '✨', label: 'Magical', userName: 'Julian', createdAt: '2025-05-31T09:00:00Z' }
    ],
    createdAt: '2025-05-30T22:30:00Z',
    updatedAt: '2025-05-30T22:30:00Z'
  },
  {
    id: 'mem-6',
    userId: 'partner-1',
    creatorName: 'Elena',
    title: 'Private: Note written on the morning of your promotion',
    date: '2025-03-12',
    description: 'Watching you sleep right before your big presentation. You prepared for months and gave it everything. No matter what happened in that boardroom today, you are the most resilient person I have ever known.',
    photos: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85'
    ],
    location: 'Bedroom',
    mood: 'Emotional',
    category: 'Achievement',
    tags: ['proud', 'morning', 'milestone'],
    isFavorite: false,
    isPrivate: true,
    reactions: [],
    createdAt: '2025-03-12T07:10:00Z',
    updatedAt: '2025-03-12T07:10:00Z'
  }
];

export const demoTimeline: TimelineEvent[] = [
  {
    id: 'tl-1',
    title: 'First Look at the Antique Market',
    date: '2023-04-14',
    description: 'We both reached for the same brass pocket compass at the flea market stall. You laughed, insisted I keep it, and asked if I wanted to get an espresso across the street.',
    photos: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80'],
    location: 'Portobello Road, London',
    category: 'The Beginning',
    tags: ['first meeting', 'espresso', 'antique market'],
    isMilestone: true,
    userId: 'partner-1',
    createdAt: '2023-04-14T11:00:00Z'
  },
  {
    id: 'tl-2',
    title: 'Our First Road Trip up Highway 1',
    date: '2023-08-19',
    description: 'Windows down, indie folk playlist looping, stopping every five miles to take in the sheer ocean drops. We got lost near Monterey and found the sweetest blueberry pancake shack.',
    photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    location: 'Big Sur Coastline',
    category: 'Adventure',
    tags: ['roadtrip', 'highway 1', 'ocean'],
    isMilestone: false,
    userId: 'partner-2',
    createdAt: '2023-08-19T14:00:00Z'
  },
  {
    id: 'tl-3',
    title: 'Moving In Together & The Unpacked Boxes',
    date: '2024-02-01',
    description: 'Cardboard boxes everywhere, eating takeout Thai curry on the living room hardwood floor because the sofa had not arrived yet. Our first set of keys on one ring.',
    photos: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'],
    location: '124 Willow Street',
    category: 'Milestone',
    tags: ['new home', 'takeout', 'keys'],
    isMilestone: true,
    userId: 'partner-1',
    createdAt: '2024-02-01T17:30:00Z'
  },
  {
    id: 'tl-4',
    title: 'Adopted Miso the Scottish Fold',
    date: '2024-09-15',
    description: 'We said we were just going to "look" at the shelter. Twenty minutes later, little gray Miso was curled asleep inside Julian’s denim jacket.',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'],
    location: 'City Animal Shelter',
    category: 'Family',
    tags: ['miso', 'kitten', 'home'],
    isMilestone: true,
    userId: 'partner-2',
    createdAt: '2024-09-15T12:00:00Z'
  },
  {
    id: 'tl-5',
    title: 'The Quiet Vows on Lake Como',
    date: '2025-06-20',
    description: 'Rented a wooden Riva boat at sunrise when the water was like green glass. We exchanged handwritten letters promising each other our patience, our loyalty, and our whole hearts.',
    photos: ['https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'],
    location: 'Lake Como, Italy',
    category: 'Milestone',
    tags: ['lake como', 'boat', 'vows'],
    isMilestone: true,
    userId: 'partner-1',
    createdAt: '2025-06-20T06:30:00Z'
  }
];

export const demoPlaces: PlaceMemory[] = [
  {
    id: 'place-1',
    name: 'Shakespeare and Company',
    location: 'Paris, France',
    latitude: 48.8525,
    longitude: 2.3470,
    date: '2024-04-14',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'The old creaky wooden steps, smell of aged paper, and that piano nook overlooking Notre Dame.',
    relatedMemoryIds: ['mem-1'],
    userId: 'partner-1',
    isVisited: true,
    createdAt: '2024-04-14T20:00:00Z'
  },
  {
    id: 'place-2',
    name: 'Bixby Creek & Big Sur',
    location: 'California Coast, USA',
    latitude: 36.3714,
    longitude: -121.9018,
    date: '2024-07-22',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Breathtaking bridge arches, wild sage scents in the ocean breeze, and our sunset picnic.',
    relatedMemoryIds: ['mem-2'],
    userId: 'partner-2',
    isVisited: true,
    createdAt: '2024-07-22T21:00:00Z'
  },
  {
    id: 'place-3',
    name: 'Villa del Balbianello',
    location: 'Lake Como, Italy',
    latitude: 45.9654,
    longitude: 9.2023,
    date: '2025-06-20',
    coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Terraced cypress gardens and classical arches overlooking quiet alpine waters.',
    relatedMemoryIds: [],
    userId: 'partner-1',
    isVisited: true,
    createdAt: '2025-06-20T08:00:00Z'
  },
  {
    id: 'place-4',
    name: 'Kyoto Bamboo Grove & Pontocho',
    location: 'Kyoto, Japan',
    latitude: 35.0163,
    longitude: 135.6713,
    date: '2027-03-25',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
    ],
    notes: 'Dream destination for our fourth anniversary: morning matcha, traditional ryokan, and cherry blossoms.',
    relatedMemoryIds: [],
    userId: 'partner-1',
    isVisited: false,
    createdAt: '2025-01-01T10:00:00Z'
  }
];

export const demoLetters: FutureLetter[] = [
  {
    id: 'let-1',
    title: 'To Read on Our 3rd Anniversary',
    message: 'My dearest Julian, if you are reading this, three full years have quietly slipped past since the day we found that brass compass. I hope by now our herb garden on the terrace is thriving. I wrote this while you were downstairs brewing morning coffee, humming that Bill Evans tune. No matter what changes in the world, the safest shelter I know is the curve of your shoulder. Happy Anniversary, my heart.',
    senderName: 'Elena',
    senderId: 'partner-1',
    recipientName: 'Julian',
    createdDate: '2025-04-14',
    unlockDate: '2026-04-14',
    photoUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    isOpened: true,
    sealColor: '#8B264E',
    createdAt: '2025-04-14T09:00:00Z'
  },
  {
    id: 'let-2',
    title: 'Open When We Land in Tokyo',
    message: 'Elena, as our wheels touch the tarmac at Haneda, remember how many late nights we spent planning this trip over cold green tea and ramen. Turn to your left and look out the window—we finally made it together. Let’s get lost in the alleyways.',
    senderName: 'Julian',
    senderId: 'partner-2',
    recipientName: 'Elena',
    createdDate: '2026-01-10',
    unlockDate: '2027-03-25',
    photoUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    isOpened: false,
    sealColor: '#541944',
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'let-3',
    title: 'For a Tough Rainy Day',
    message: 'Take a deep breath and set down whatever heavy thoughts you are carrying right now. Put the kettle on. You don’t have to solve everything this afternoon. You are loved, you are grounded, and I will be home before the streetlights turn on.',
    senderName: 'Elena',
    senderId: 'partner-1',
    recipientName: 'Julian',
    createdDate: '2025-08-01',
    unlockDate: '2025-08-01',
    isOpened: true,
    sealColor: '#A23B72',
    createdAt: '2025-08-01T15:00:00Z'
  }
];

export const demoCapsules: MemoryCapsule[] = [
  {
    id: 'cap-1',
    title: 'The 2026 Solstice Time Capsule',
    theme: 'Our First Year in the Coastal Cottage',
    createdDate: '2025-12-21',
    unlockDate: '2026-12-21',
    creatorName: 'Julian & Elena',
    creatorId: 'partner-1',
    photos: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80'
    ],
    message: 'A collection of pressed wildflowers from our first summer hike, the ticket stub from the symphony in Prague, and a promise we made while painting the kitchen sage green.',
    notes: [
      'Favorite current restaurant: Osteria del Moro',
      'The book we are reading out loud: The Shadow of the Wind',
      'Inside joke of the year: "It’s not lost, it’s just in Big Sur"'
    ],
    links: [
      { title: 'Our 2025 Joint Playlist', url: 'https://spotify.com' }
    ],
    isUnlocked: false,
    createdAt: '2025-12-21T18:00:00Z'
  },
  {
    id: 'cap-2',
    title: 'Our Tokyo Trip Expectations Capsule',
    theme: 'Whispers before the Journey',
    createdDate: '2026-03-01',
    unlockDate: '2027-03-20',
    creatorName: 'Elena',
    creatorId: 'partner-1',
    photos: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
    ],
    message: 'Three wishes sealed away until the cherry blossoms open over the Philosopher’s Path in Kyoto.',
    notes: [
      'Elena’s wish: Finding a hand-thrown ceramic tea bowl in Uji',
      'Julian’s wish: Riding the Shinkansen past Mt. Fuji at dawn'
    ],
    isUnlocked: false,
    createdAt: '2026-03-01T10:00:00Z'
  }
];

export const demoBucketList: BucketListItem[] = [
  {
    id: 'bkt-1',
    title: 'Watch the Northern Lights from a Glass Igloo in Lapland',
    description: 'Hot cocoa, wool blankets, and watching green auroras dance across the Arctic sky.',
    category: 'Travel',
    isCompleted: false,
    targetDate: '2027-11-15',
    addedBy: 'Elena',
    createdAt: '2024-05-10T10:00:00Z'
  },
  {
    id: 'bkt-2',
    title: 'Learn to Make Authentic Neapolitan Pizza from Scratch',
    description: 'Mastering the 72-hour cold ferment dough and high-heat blistered crust.',
    category: 'Culinary',
    isCompleted: true,
    completedDate: '2025-02-14',
    completedPhoto: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    addedBy: 'Julian',
    createdAt: '2024-08-01T14:00:00Z'
  },
  {
    id: 'bkt-3',
    title: 'Build a Built-In Floor-to-Ceiling Library Wall',
    description: 'Dark walnut wood, rolling library brass ladder, and warm reading spotlights.',
    category: 'Home',
    isCompleted: false,
    targetDate: '2027-09-01',
    addedBy: 'Elena',
    createdAt: '2025-01-15T18:00:00Z'
  },
  {
    id: 'bkt-4',
    title: 'Hot Air Balloon Flight over Cappadocia at Dawn',
    description: 'Drifting above fairy chimneys as hundreds of colorful balloons rise with the sun.',
    category: 'Experience',
    isCompleted: false,
    targetDate: '2028-05-10',
    addedBy: 'Julian',
    createdAt: '2025-03-20T11:00:00Z'
  },
  {
    id: 'bkt-5',
    title: 'Adopt our First Rescue Kitten',
    description: 'Provide a warm, loving home for a sweet shelter cat.',
    category: 'Milestone',
    isCompleted: true,
    completedDate: '2024-09-15',
    completedPhoto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    addedBy: 'Elena',
    createdAt: '2024-02-01T10:00:00Z'
  }
];

export const demoCountdowns: CountdownEvent[] = [
  {
    id: 'cd-1',
    title: 'Our Next Anniversary',
    targetDate: '2027-04-14T00:00:00Z',
    category: 'Anniversary',
    isRecurringYearly: true,
    notes: 'Four years since our first coffee and compass encounter.',
    coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-04-14T00:00:00Z'
  },
  {
    id: 'cd-2',
    title: 'Japan Spring Cherry Blossom Journey',
    targetDate: '2027-03-25T08:00:00Z',
    category: 'Trip',
    isRecurringYearly: false,
    notes: 'Flight JL001 to Tokyo Haneda, then Shinkansen to Kyoto.',
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cd-3',
    title: 'Julian’s 30th Birthday Celebration',
    targetDate: '2026-11-04T00:00:00Z',
    category: 'Birthday',
    isRecurringYearly: true,
    notes: 'Surprise weekend cabin retreat with close friends.',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    createdAt: '2025-11-04T00:00:00Z'
  }
];

export const demoSpecialDates: SpecialDate[] = [
  {
    id: 'sd-1',
    title: 'Our Official Anniversary',
    date: '2023-04-14',
    category: 'Anniversary',
    description: 'The rainy afternoon in Paris when we decided our paths were meant to be one.',
    isReminderEnabled: true,
    isVisibleOnHome: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sd-2',
    title: 'Elena’s Birthday',
    date: '1997-08-22',
    category: 'Birthday',
    description: 'Celebrate Elena with breakfast in bed and fresh lilies.',
    isReminderEnabled: true,
    isVisibleOnHome: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sd-3',
    title: 'Julian’s Birthday',
    date: '1996-11-04',
    category: 'Birthday',
    description: 'Surprise celebration, vinyl records, and espresso cheesecake.',
    isReminderEnabled: true,
    isVisibleOnHome: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sd-4',
    title: 'First Apartment Move-in Day',
    date: '2024-06-01',
    category: 'Milestone',
    description: 'Carrying thrifted rugs, pizza boxes on the floor, and hanging our first string lights.',
    isReminderEnabled: true,
    isVisibleOnHome: true,
    createdAt: '2024-06-01T00:00:00Z'
  },
  {
    id: 'sd-5',
    title: 'Japan Departure Date',
    date: '2027-03-25',
    category: 'Travel',
    description: 'Heading to Haneda for our two-week cherry blossom journey.',
    isReminderEnabled: true,
    isVisibleOnHome: false,
    createdAt: '2026-01-10T00:00:00Z'
  }
];

export const defaultHomepageCms: HomepageCms = {
  heroHeading: 'Dear Us',
  tagline: 'Every moment has a story. Ours deserves to be remembered.',
  introText: 'A private, quiet sanctuary for our letters, vintage moments, milestones, and the adventures yet to come.',
  featuredMemoryId: 'mem-1',
  featuredStoryId: 'tl-1',
  showStats: true,
  showOnThisDay: true,
  showUpcomingCountdown: true,
  enterStoryCta: 'Enter Our Story',
  addMemoryCta: 'Add a Memory',
  rediscoverCta: 'Rediscover',
  updatedAt: '2026-09-16T12:00:00Z'
};

export const defaultCategories: CategoryItem[] = [
  { id: 'cat-1', name: 'Special', color: '#DFBF99', description: 'Significant couple milestones and core memories' },
  { id: 'cat-2', name: 'Travel', color: '#7D2146', description: 'Flights, road trips, and faraway adventures' },
  { id: 'cat-3', name: 'Birthday', color: '#B45309', description: 'Birthday dinners and personal celebrations' },
  { id: 'cat-4', name: 'Festival', color: '#854D0E', description: 'Holidays, lanterns, new year and autumn nights' },
  { id: 'cat-5', name: 'Funny', color: '#047857', description: 'Hilarious misadventures and bloopers' },
  { id: 'cat-6', name: 'Everyday', color: '#4B5563', description: 'Quiet coffee mornings, grocery runs, rainy days' },
  { id: 'cat-7', name: 'Achievement', color: '#4338CA', description: 'Career wins, degrees, personal milestones' },
  { id: 'cat-8', name: 'Other', color: '#6B7280', description: 'Miscellaneous heartfelt notes' }
];

export const defaultMoods: MoodItem[] = [
  { id: 'mood-1', name: 'Love', emoji: '❤️', color: '#E11D48' },
  { id: 'mood-2', name: 'Peaceful', emoji: '🌿', color: '#059669' },
  { id: 'mood-3', name: 'Magical', emoji: '✨', color: '#D97706' },
  { id: 'mood-4', name: 'Emotional', emoji: '🥺', color: '#6366F1' },
  { id: 'mood-5', name: 'Adventure', emoji: '🧭', color: '#D97706' },
  { id: 'mood-6', name: 'Celebration', emoji: '🥂', color: '#E11D48' },
  { id: 'mood-7', name: 'Funny', emoji: '😂', color: '#EAB308' }
];

export const demoActivityLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    action: 'create',
    entity: 'Memory',
    entityTitle: 'Rainy afternoon at Shakespeare & Company',
    adminUser: 'Elena (Admin)',
    summary: 'Created memory in Paris with 2 photos and audio attachment.',
    timestamp: '2026-09-15T16:20:00Z'
  },
  {
    id: 'log-2',
    action: 'update',
    entity: 'HomepageCMS',
    entityTitle: 'Hero Tagline',
    adminUser: 'Julian (Admin)',
    summary: 'Updated romantic headline and featured anniversary story.',
    timestamp: '2026-09-15T18:45:00Z'
  },
  {
    id: 'log-3',
    action: 'create',
    entity: 'SpecialDate',
    entityTitle: 'First Apartment Move-in Day',
    adminUser: 'Elena (Admin)',
    summary: 'Added special date milestone for June 1st.',
    timestamp: '2026-09-16T09:12:00Z'
  },
  {
    id: 'log-4',
    action: 'config',
    entity: 'Theme',
    entityTitle: 'Velvet Rose Palette',
    adminUser: 'Elena (Admin)',
    summary: 'Confirmed WCAG AA contrast compliance for cinematic plum palette.',
    timestamp: '2026-09-16T11:05:00Z'
  }
];

export const demoMediaItems: AdminMediaItem[] = [
  {
    id: 'med-1',
    name: 'shakespeare-books-upper-floor.jpg',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=85',
    sizeBytes: 428000,
    mimeType: 'image/jpeg',
    uploadedAt: '2024-04-14T19:30:00Z',
    usedIn: ['Rainy afternoon at Shakespeare & Company', 'Our Next Anniversary Countdown']
  },
  {
    id: 'med-2',
    name: 'big-sur-pacific-coast.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    sizeBytes: 685000,
    mimeType: 'image/jpeg',
    uploadedAt: '2024-07-22T20:15:00Z',
    usedIn: ['The Cliffside Picnic at Golden Hour']
  },
  {
    id: 'med-3',
    name: 'kyoto-bamboo-grove-mist.jpg',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
    sizeBytes: 812000,
    mimeType: 'image/jpeg',
    uploadedAt: '2026-01-01T00:00:00Z',
    usedIn: ['Arashiyama Bamboo Grove', 'Japan Spring Cherry Blossom Journey']
  },
  {
    id: 'med-4',
    name: 'amalfi-coast-sunset-cliffs.jpg',
    url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=85',
    sizeBytes: 540000,
    mimeType: 'image/jpeg',
    uploadedAt: '2024-09-02T14:00:00Z',
    usedIn: ['Positano Cliffside Suite & Lemon Groves']
  },
  {
    id: 'med-5',
    name: 'elena-portrait-golden.jpg',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    sizeBytes: 195000,
    mimeType: 'image/jpeg',
    uploadedAt: '2023-04-14T00:00:00Z',
    usedIn: ['Elena Avatar']
  },
  {
    id: 'med-6',
    name: 'julian-portrait-warm.jpg',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    sizeBytes: 210000,
    mimeType: 'image/jpeg',
    uploadedAt: '2023-04-14T00:00:00Z',
    usedIn: ['Julian Avatar']
  }
];
