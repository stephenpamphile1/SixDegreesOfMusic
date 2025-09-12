// components/MainMenuScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

export type RootStackParamList = {
  PuzzleScreen: { 
    apiBaseUrl: string;
    startingArtist: string;
    targetArtist: string;
    connectionPath: string[];
    playlistId: string;
  };
  Settings: undefined;
  Leaderboard: undefined;
};

type Playlist = {
  id: string;
  name: string;
  description: string;
  artistCount: number;
  imageUrl: string;
  completed?: boolean;
  progress?: number;
  genre?: string;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MainMenuScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [loadingPlaylist, setLoadingPlaylist] = useState<string | null>(null);
  const API_BASE_URL = 'http://192.168.1.142:8080/api';

  const predefinedPlaylists: Playlist[] = [
    {
      id: 'hiphop',
      name: 'Hip-Hop Legends',
      description: 'Connect the biggest names in hip-hop history',
      artistCount: 25,
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
      progress: 75,
      genre: 'Hip-Hop'
    },
    {
      id: 'rock-classics',
      name: 'Rock Classics',
      description: 'From Beatles to Zeppelin and everything in between',
      artistCount: 30,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      completed: true,
      genre: 'Rock'
    },
    {
      id: 'pop',
      name: 'Pop Stars',
      description: 'Modern pop artists and their collaborations',
      artistCount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
      progress: 30,
      genre: 'Pop'
    },
    {
      id: 'rb',
      name: 'R&B Soul',
      description: 'Smooth sounds and soulful connections',
      artistCount: 35,
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=300&fit=crop',
      genre: 'R&B'
    },
    {
      id: 'country',
      name: 'Country Roads',
      description: 'Country music artists and their collaborations',
      artistCount: 22,
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
      genre: 'Country'
    },
    {
        id: 'audiophile',
        name: 'Audiophile',
        description: 'The best of the best',
        artistCount: 10,
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop',
        genre: 'Everything'
    }
  ];

  const genres = ['all', ...new Set(predefinedPlaylists.map(p => p.genre).filter(Boolean))] as string[];

  const filteredPlaylists = selectedGenre === 'all' 
    ? predefinedPlaylists 
    : predefinedPlaylists.filter(playlist => playlist.genre === selectedGenre);

  const handlePlaylistSelect = async (playlist: Playlist) => {
    setLoadingPlaylist(playlist.id);
    
    try {

      const response = await axios.post(`${API_BASE_URL}/getArtistsToMatch`, { playlistId: playlist.id });

      const { artist1, artist2, path } = response.data;

      if (!artist1 || !artist2 || !path) {
        throw new Error('Invalid response from server');
      }

      navigation.navigate('PuzzleScreen', {
        apiBaseUrl: API_BASE_URL,
        startingArtist: artist1,
        targetArtist: artist2,
        connectionPath: Array.isArray(path) ? path : [path],
        playlistId: playlist.id
      });

    } catch (error: any) {
      console.error('Failed to start puzzle:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to start the puzzle. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingPlaylist(null);
    }
  };

  const getGenreColor = (genre: string) => {
    const genreColors: { [key: string]: string } = {
      'Hip-Hop': '#FF6B6B',
      'Rock': '#4ECDC4',
      'Pop': '#FFD93D',
      'R&B': '#6B5B95',
      'Electronic': '#9EE6CF',
      'Country': '#F9A826',
    };
    return genreColors[genre] || '#667eea';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#f5f7fa', '#c3cfe2']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Six Degrees of Music</Text>
          <Text style={styles.subtitle}>Choose Your Playlist</Text>
        </View>

        {/* Genre Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.filterButton,
                selectedGenre === genre && styles.filterButtonActive,
                selectedGenre === genre && { backgroundColor: getGenreColor(genre) }
              ]}
              onPress={() => setSelectedGenre(genre)}
            >
              <Text style={[
                styles.filterText,
                selectedGenre === genre && styles.filterTextActive
              ]}>
                {genre === 'all' ? 'All Genres' : genre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Playlists Grid */}
        <ScrollView style={styles.playlistsContainer}>
          <View style={styles.playlistsGrid}>
            {filteredPlaylists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistCard}
                onPress={() => handlePlaylistSelect(playlist)}
                activeOpacity={0.7}
                disabled={loadingPlaylist === playlist.id}
              >
                {loadingPlaylist === playlist.id && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#667eea" />
                    <Text style={styles.loadingText}>Starting Puzzle...</Text>
                  </View>
                )}
                
                <Image
                  source={{ uri: playlist.imageUrl }}
                  style={styles.playlistImage}
                  resizeMode="cover"
                />
                
                {/* Progress Bar */}
                {playlist.progress !== undefined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${playlist.progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{playlist.progress}%</Text>
                  </View>
                )}

                {/* Completed Badge */}
                {playlist.completed && (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓</Text>
                  </View>
                )}

                <View style={styles.playlistContent}>
                  <Text style={styles.playlistName}>{playlist.name}</Text>
                  <Text style={styles.playlistDescription} numberOfLines={2}>
                    {playlist.description}
                  </Text>
                  
                  <View style={styles.playlistMeta}>
                    {/* Genre Badge */}
                    {playlist.genre && (
                      <View style={[
                        styles.genreBadge,
                        { backgroundColor: getGenreColor(playlist.genre) }
                      ]}>
                        <Text style={styles.genreText}>
                          {playlist.genre}
                        </Text>
                      </View>
                    )}
                    
                    <Text style={styles.artistCount}>
                      {playlist.artistCount} artists
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.navButtonText}>🏆 Leaderboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.navButtonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  gradient: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    maxHeight: 50,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    borderColor: 'transparent',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  playlistsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playlistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 20,
  },
  playlistCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#667eea',
    fontWeight: '600',
  },
  playlistImage: {
    width: '100%',
    height: 120,
  },
  progressContainer: {
    position: 'absolute',
    top: 100,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  playlistContent: {
    padding: 12,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  playlistMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genreText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  artistCount: {
    fontSize: 10,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'white',
  },
  navButton: {
    padding: 12,
  },
  navButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
});

export default MainMenuScreen;