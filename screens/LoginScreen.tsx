import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../src/navigation/navigationTypes';
import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { Alert } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Image, Text, 
    ActivityIndicator } from 'react-native';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Please enter both email and password');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password);
            Alert.alert('Success', 'Logged in successfully');
        } catch (error) {
            Alert.alert('Login Failed', error.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert('Forgot Password', 'Please contact support for assistance');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>Six Degrees of Music</Text>
                    <Text style={styles.subtitle}>Connect artists through music</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={StyleSheet.formTitle}>Login</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                        onSubmitEditing={handleLogin}
                    />

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.loadingButtonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleForgotPassword}>
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine}></View>
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine}></View>
                    </View>

                    <TouchableOpacity 
                        style={styles.registerButton}
                        onPress={() => navigation.navigate('Register')}
                        disabled={isLoading}
                    >
                        <Text style={styles.registerButtonText}>Create New Account</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 Six Degrees of Music</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1DB954',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        fontSize: 16,
        color: '#333',
    },
    loginButton: {
        backgroundColor: '#1DB954',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonDisabled: {
        backgroundColor: '#b3dcb3',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    forgotPassword: {
        color: '#1DB954',
        textAlign: 'center',
        fontSize: 14,
        marginBottom: 30,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#999',
        fontSize: 14,
    },
    registerButton: {
        borderWidth: 2,
        borderColor: '#1DB954',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#1DB954',
        fontSize: 16,
        fontWeight: '600'
    },
    footer: {
        color: '#999',
        fontSize: 12,
    },
});

export default LoginScreen;
        
        
        
        
    
    

