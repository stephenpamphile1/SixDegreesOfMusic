import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert, 
  Button, 
  ActivityIndicator,
  Modal
} from 'react-native';
import axios from 'axios';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../src/navigation/navigationTypes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your navigation props
type PuzzleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Puzzle'
>;
type PuzzleScreenRouteProp = RouteProp<RootStackParamList, 'Puzzle'>;

interface PuzzleScreenProps {
  route: {
    params: {
      apiBaseUrl: string;
    };
  };
  navigation: any;
}

const PuzzleScreen: React.FC<PuzzleScreenProps> = ({ route }) => {
  const { apiBaseUrl } = route.params;
  const [startingArtist, setStartingArtist] = useState<string>('');
  const [targetArtist, setTargetArtist] = useState<string>('');
  const [artistGuess, setArtistGuess] = useState('');
  const [songGuess, setSongGuess] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionPath, setConnectionPath] = useState<string[]>([]);
  const [showSongInput, setShowSongInput] = useState(false);
  const [isDirectConnection, setIsDirectConnection] = useState(false);

  const fetchArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<{ path: string[] }>(
        `${apiBaseUrl}/getArtistsToMatch`,
        {},
        { timeout: 30000 }
      );
      
      if (response.data?.path?.length >= 2) {
        setStartingArtist(response.data.path[0]);
        setTargetArtist(response.data.path[response.data.path.length - 1]);
        setConnectionPath(response.data.path);
        
        // Check if it's a direct connection (only 2 artists)
        if (response.data.path.length === 2) {
          setIsDirectConnection(true);
          Alert.alert(
            'Direct Connection!',
            'These artists have collaborated directly. Try guessing their song!',
            [{ text: 'OK', onPress: () => setShowSongInput(true) }]
          );
        }
      } else {
        setError('Invalid artist data received');
      }
    } catch (err) {
      setError(`Failed to load artists: ${err.message}`);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistGuessSubmit = () => {
    if (!artistGuess.trim()) return;
    
    const isCorrect = connectionPath.some(artist => 
      artist.toLowerCase() === artistGuess.trim().toLowerCase()
    );
    
    Alert.alert(
      isCorrect ? 'Correct!' : 'Incorrect',
      isCorrect 
        ? `Yes! ${artistGuess} is part of the connection path.`
        : `${artistGuess} is not part of the path. Try again!`,
      [{ text: 'OK', onPress: () => setArtistGuess('') }]
    );
  };

  const handleSongGuessSubmit = async () => {
    if (!songGuess.trim()) return;
    
    try {
      // Call your API to verify the song collaboration
      const response = await axios.post(
        `${apiBaseUrl}/verifySong`,
        {
          artist1: startingArtist,
          artist2: targetArtist,
          song: songGuess
        }
      );
      
      if (response.data.isValid) {
        Alert.alert(
          'Correct!',
          `"${songGuess}" is a song by ${startingArtist} and ${targetArtist}!`,
          [{ text: 'OK', onPress: () => {
            setSongGuess('');
            fetchArtists(); // Get new puzzle
          }}]
        );
      } else {
        Alert.alert(
          'Incorrect',
          `"${songGuess}" is not a known collaboration. Try again!`,
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Failed to verify song. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading artists...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Retry" onPress={fetchArtists} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Connect These Artists</Text>
      
      <View style={styles.artistContainer}>
        <Text style={styles.artistLabel}>Starting Artist:</Text>
        <Text style={styles.artistName}>{startingArtist}</Text>
      </View>

      <View style={styles.artistContainer}>
        <Text style={styles.artistLabel}>Target Artist:</Text>
        <Text style={styles.artistName}>{targetArtist}</Text>
      </View>

      {isDirectConnection ? (
        <>
          <Text style={styles.instruction}>
            These artists have collaborated directly! Guess their song:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter song title"
            value={songGuess}
            onChangeText={setSongGuess}
            onSubmitEditing={handleSongGuessSubmit}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Submit Song Guess"
              onPress={handleSongGuessSubmit}
              disabled={!songGuess.trim()}
            />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.instruction}>
            Find artists that connect {startingArtist} to {targetArtist}:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter connecting artist"
            value={artistGuess}
            onChangeText={setArtistGuess}
            onSubmitEditing={handleArtistGuessSubmit}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Submit Artist Guess"
              onPress={handleArtistGuessSubmit}
              disabled={!artistGuess.trim()}
            />
          </View>
        </>
      )}

      <Button
        title="New Puzzle"
        onPress={() => {
          setShowSongInput(false);
          setIsDirectConnection(false);
          fetchArtists();
        }}
        color="#841584"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  artistContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  artistLabel: {
    fontSize: 16,
    color: '#666',
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 15,
  },
});

export default PuzzleScreen;