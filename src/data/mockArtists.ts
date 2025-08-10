import { ImageSourcePropType } from "react-native";

export interface Artist {
    id: string;
    name: string;
    imageUrl: string;
}

export interface Connection {
    artist: Artist['id'];
    artist2: Artist['id'];
    sharedWork: string;
}

export const mockArtists = new Map<Artist['id'], Artist>([
  ['a1', { id: 'a1', name: 'Beyoncé', imageUrl: require('../assets/images/beyonce.jpg') }],
  ['a2', { id: 'a2', name: 'Jay-Z', imageUrl: require('../assets/images/jayz.jpg') }],
  ['a3', { id: 'a3', name: 'Rihanna', imageUrl: require('../assets/images/rihanna.jpg') }],
  ['a4', { id: 'a4', name: 'Kanye West', imageUrl: require('../assets/images/kanyewest.jpg') }],
  ['a5', { id: 'a5', name: 'Drake', imageUrl: require('../assets/images/drake.jpg') }],
]);

export const mockConnections: Connection[] = [
  { artist1: 'a1', artist2: 'a2', sharedWork: 'Crazy in Love' },
  { artist1: 'a2', artist2: 'a4', sharedWork: 'Watch the Throne' },
  { artist1: 'a4', artist2: 'a5', sharedWork: 'Glow' },
  { artist1: 'a3', artist2: 'a2', sharedWork: 'Talk That Talk' },
  { artist1: 'a3', artist2: 'a5', sharedWork: 'Take Care' },
];