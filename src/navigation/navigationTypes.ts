import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  MainMenu: undefined;
  PuzzleScreen: { apiBaseUrl: string; startingArtist: string; targetArtist: string; connectionPath: string[]; playlistId: string };
};


export type PuzzleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PuzzleScreen'
>;


export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;