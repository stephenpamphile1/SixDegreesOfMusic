import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import PuzzleScreen from './screens/PuzzleScreen';

// Define your stack param list
type RootStackParamList = {
  Home: undefined;
  Puzzle: { apiBaseUrl: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Puzzle"
          component={PuzzleScreen}
          initialParams={{ apiBaseUrl: "http://192.168.1.142:8080/api" }}
          options={{ title: 'Artist Connection' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;