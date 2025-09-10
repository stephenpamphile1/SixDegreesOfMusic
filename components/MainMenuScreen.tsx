import React, { useState, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';

export type RootStackParamList = {
  GameScreen: { playlistId: string; playlistName: string };
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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  useEffect(() => {
    const loadPlaylists = async () => {
        try {
            const response = await axios.get<Playlist[]>('http://192.168.1.142:8080/api/playlists');
            setPlaylists(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching playlists:', error);
            setLoading(false);
        }
    };
    
    loadPlaylists();
}, []);

  const genres = ['all', ...new Set(playlists.map(p => p.genre).filter(Boolean))] as string[];

  const filteredPlaylists = selectedGenre === 'all' 
    ? playlists 
    : playlists.filter(playlist => playlist.genre === selectedGenre);

  const handlePlaylistSelect = (playlist: Playlist) => {
    navigation.navigate('GameScreen', {
      playlistId: playlist.id,
      playlistName: playlist.name
    });
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Playlists...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#f5f7fa', '#c3cfe2']}
        style={styles.gradient}
      >
 
        <View style={styles.header}>
          <Text style={styles.title}>Music Connect</Text>
          <Text style={styles.subtitle}>Choose Your Playlist</Text>
        </View>

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

        <ScrollView style={styles.playlistsContainer}>
          <View style={styles.playlistsGrid}>
            {filteredPlaylists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistCard}
                onPress={() => handlePlaylistSelect(playlist)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: playlist.imageUrl }}
                  style={styles.playlistImage}
                  resizeMode="cover"
                />
                
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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