import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Puzzle: { apiBaseUrl: string };
};

// For PuzzleScreen
export type PuzzleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Puzzle'
>;

// For HomeScreen (if needed)
export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;