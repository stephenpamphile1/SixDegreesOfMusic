import React from "react";
import { StyleSheet, Text, View } from "react-native";
import PlayButton from "../components/PlayButton";

type HomeScreenProps = {
    navigation: any;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const handlePlayPress = () => {
        navigation.navigate('MainMenu');
    };

    return (
    <View style={styles.container}>
      <Text style={styles.title}>Six Degrees of Music</Text>
      <Text style={styles.subtitle}>Let's connect some artists!</Text>

      <PlayButton title="Start Game" onPress={handlePlayPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    color: '#666',
  },
});

export default HomeScreen;

