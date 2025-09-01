import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Alert, 
  Button, 
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../src/navigation/navigationTypes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { useGameProgress } from '../src/hooks/useGameProgress';

// Define your navigation props
type PuzzleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Puzzle'
>;
type PuzzleScreenRouteProp = RouteProp<RootStackParamList, 'Puzzle'>;

interface PuzzleScreenProps {
  route: PuzzleScreenRouteProp;
  navigation: PuzzleScreenNavigationProp;
}

const PuzzleScreen: React.FC<PuzzleScreenProps> = ({ route }) => {
  const { apiBaseUrl } = route.params;
  const navigation = useNavigation<PuzzleScreenNavigationProp>();
  const [startingArtist, setStartingArtist] = useState<string>('');
  const [targetArtist, setTargetArtist] = useState<string>('');
  const [artistGuess, setArtistGuess] = useState('');
  const [songGuess, setSongGuess] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionPath, setConnectionPath] = useState<string[]>([]);
  const [showSongInput, setShowSongInput] = useState(false);
  const [isDirectConnection, setIsDirectConnection] = useState(false);
  const [showKnowSongPrompt, setShowKnowSongPrompt] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [potentialConnection, setPotentialConnection] = useState('');
  const { user } = useAuth();
  const { saveProgress, loadProgress } = useGameProgress();
  const [puzzleId] = useState(() => `puzzle_${Date.now()}`);

  useEffect(() => {
    if (user) {
      loadSavedProgress();
    }
  }, [user]);

  const loadSavedProgress = async () => {
    const progress = await loadProgress();
    if (progress) {
        const savedPuzzle = progress.find((p: any) => p.targetArtist === targetArtist);
        
        if (savedPuzzle) {
          setCurrentPath(savedPuzzle.currentPath || [startingArtist]);
      }
    }
  };

  useEffect(() => {
    if (user && currentPath.length > 0) {
      saveProgress({
        puzzleId,
        currentPath,
        startingArtist,
        targetArtist,
        completed: currentPath[currentPath.length - 1] === targetArtist
      });
    }
  }, [currentPath, user, puzzleId, startingArtist, targetArtist, saveProgress]);

  const fetchArtists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<{ path: string[] }>(
        `${apiBaseUrl}/getArtistsToMatch`
      );
      
      if (response.data?.path?.length >= 2) {
        setStartingArtist(response.data.path[0]);
        setTargetArtist(response.data.path[response.data.path.length - 1]);
        setConnectionPath(response.data.path);
        setCurrentPath([response.data.path[0]]);
        
        // Check if it's a direct connection (only 2 artists)
        if (response.data.path.length === 2) {
          setIsDirectConnection(true);
          setShowKnowSongPrompt(true);
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

  const handleKnowSongPrompt = () => {
    Alert.alert(
      'Direct Connection Found!',
      `Do you know a song that connects ${startingArtist} and ${targetArtist}?`,
      [
        {
          text: "No, show me the path",
          onPress: () => {
            setShowKnowSongPrompt(false);
            // Continue with normal flow (artist guessing)
            setIsDirectConnection(false);
          }
        },
        {
          text: "Yes, let me guess",
          onPress: () => {
            setShowKnowSongPrompt(false);
            setShowSongInput(true);
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (showKnowSongPrompt) {
      handleKnowSongPrompt();
    }
  }, [showKnowSongPrompt]);

  const handleArtistGuessSubmit = async () => {
    if (!artistGuess || !artistGuess.trim()) return;

    const guessedArtist = artistGuess.trim();
    const lastArtistInPath = currentPath[currentPath.length - 1];

    try {
      const response = await axios.post(
        `${apiBaseUrl}/verifyArtistHasConnection`,
        null,
        {
          params: {
            startingArtist: lastArtistInPath,
            targetArtist: guessedArtist
          },
          paramsSerializer: params => {
            return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
          }
        }
      );

      const isCorrect = response.data;

      if (isCorrect) {
        if (guessedArtist.toLowerCase() === targetArtist.toLowerCase()) {
          setPotentialConnection(guessedArtist);
          setShowSubmitButton(true);
          Alert.alert(
          'Final Connection Found!',
          `You've found a connection to ${targetArtist}. Submit to verify and win!`,
          [{ text: 'OK' }]
        );
        } else {
          const newPath = [...currentPath, guessedArtist];

          setCurrentPath(newPath);
          setArtistGuess('');
          Alert.alert(
          'Correct!',
          `${guessedArtist} is connected! Find the next artist to reach ${targetArtist}`,
          [{ text: 'OK' }]
        );
        }
      } else {
        Alert.alert(
        'Incorrect',
        `${guessedArtist} is not directly connected to ${lastArtistInPath}. Try again!`,
        [{ text: 'OK', onPress: () => setArtistGuess('') }]
      );
      }
    } catch (error) {
      console.error('Error verifying artist connection', error);
      Alert.alert(
        'Error',
        'Failed to verify connection. Please try again.',
        [{ text: 'OK'}]
      )
    }
  };

  const handleSubmitFinalConnection = async () => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/verifyArtistHasConnection`,
        null,
        {
          params: {
            startingArtist: currentPath[currentPath.length - 1],
            targetArtist: potentialConnection
          },
          paramsSerializer: params => {
            return Object.entries(params)
              .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
              .join('&');
          }
        }
      );

      if (response.data) {
        const winningPath = [...currentPath, potentialConnection];

        setCurrentPath(winningPath);
        setShowSubmitButton(false);
        Alert.alert(
        'You Won!',
        `🎉 Congratulations! You connected ${startingArtist} to ${targetArtist}!\n\nPath: ${winningPath.join(' → ')}`,
        [
          { 
            text: 'Play Again', 
            onPress: () => {
              setArtistGuess('');
              setPotentialConnection('');
              fetchArtists();
            }
          },
          { 
            text: 'Main Menu',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } else {
      Alert.alert(
        'Connection Changed',
        'The connection is no longer valid. Please find a new path.',
        [{ text: 'OK' }]
      );
      setShowSubmitButton(false);
    }
      } catch (error) {
      console.error(error);
    }
  };

  const handleSongGuessSubmit = async () => {
    if (!songGuess.trim()) return;
    
    try {
      // Call your API to verify the song collaboration
      const response = await axios.post(
        `${apiBaseUrl}/verifySongConnectsArtists`,
        null,
        {
          params: {
            startingArtist: startingArtist,
            targetArtist: targetArtist,  
            songTitle: songGuess.trim()
          },
          paramsSerializer: (params) => {
            return Object.entries(params)
              .map(([key, value]) => 
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
              )
              .join('&');
          }
        }
      );

      const { exactMatch, fuzzyMatches } = response.data;
      
      if (exactMatch) {
        Alert.alert(
          'Perfect Match!',
          `✅ "${songGuess}" directly connects ${connectionPath[0]} and ${connectionPath[connectionPath.length - 1]}`,
          [{ text: 'OK', onPress: () => setSongGuess('')}]
        );
        Alert.alert(
        'You Won!',
        `🎉 Congratulations! You connected ${startingArtist} to ${targetArtist}!\n\nPath: ${[startingArtist, targetArtist].join(' → ')}`,
        [
          { 
            text: 'Play Again', 
            onPress: () => {
              setArtistGuess('');
              setPotentialConnection('');
              fetchArtists();
            }
          },
          { 
            text: 'Main Menu',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
      } else if (fuzzyMatches.length > 0) {
        const bestMatch = fuzzyMatches[0];
        
        Alert.alert(
          'Close Match!',
          `Did you mean "${bestMatch.title}"? (${Math.round(bestMatch.similarity * 100)}% match)\n\n` + `This song 
          features: ${bestMatch.featuredArtists.join(', ')}`,
          [
            { text: 'No', style: 'cancel'},
            {
              text: 'Yes, use this',
              onPress: () => {
                setSongGuess(bestMatch.title);
                handleSongGuessSubmit();
              }
            }
          ]
        )
      } else {
        Alert.alert(
        'No Match Found',
        `"${songGuess}" doesn't appear to connect these artists. Try another song!`,
        [{ text: 'OK', onPress: () => setSongGuess('') }]
      );
      }
    } catch (error) {
    console.error('Song verification failed:', error);
    Alert.alert(
      'Error',
      'Failed to verify song connection. Please try again.',
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
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
      {showSubmitButton ? (
        <>
          <Button
            title={`Submit Final Connection to ${targetArtist}`}
            onPress={handleSubmitFinalConnection}
            color="#4CAF50" // Green color for submit
          />
          <Button
            title="Cancel"
            onPress={() => {
              setShowSubmitButton(false);
              setPotentialConnection('');
            }}
            color="#F44336" // Red color for cancel
          />
        </>
      ) : (
        <Button
          title="Submit Artist Guess"
          onPress={handleArtistGuessSubmit}
          disabled={!artistGuess.trim()}
        />
      )}
    </View>
        </>
      )}

      {/* Add connection path display */}
      {currentPath.length > 0 && (
      <View style={styles.pathContainer}>
        <Text style={styles.pathLabel}>Current Connection Path:</Text>
        <View style={styles.pathDisplay}>
          {currentPath.map((artist, index) => (
            <View key={index} style={styles.pathItem}>
              <Text style={styles.pathArtist}>{artist}</Text>
              {index < currentPath.length - 1 && (
                <Text style={styles.pathArrow}>→</Text>
              )}
            </View>
          ))}
          {showSubmitButton && (
            <>
              <Text style={styles.pathArrow}>→</Text>
              <Text style={[styles.pathArtist, styles.targetArtist]}>{potentialConnection}</Text>
            </>
          )}
        </View>
      </View>
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
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: 10
  },
  pathContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  pathLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4682b4',
  },
  pathDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pathItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  pathArtist: {
    fontSize: 16,
    fontWeight: '500',
  },
  pathArrow: {
    fontSize: 16,
    marginHorizontal: 4,
    color: '#888',
  },
  targetArtist: {
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100 // Extra space at bottom
  }
});

export default PuzzleScreen;