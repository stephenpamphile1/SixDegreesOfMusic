# React Native Debugging Setup Guide

## Prerequisites
1. **Enable Developer Options on Android Device:**
   - Go to Settings → About phone → Tap "Build number" 7 times
   - Go to Settings → Developer options → Enable "USB debugging"

## Method 1: React Native Debugger (Recommended)

### Setup Steps:
1. **Connect your Android device via USB**
2. **Open React Native Debugger** (installed in Applications folder)
3. **Start Metro bundler:**
   ```bash
   npm run start
   ```
4. **Run app on device:**
   ```bash
   npm run android:debug
   ```
5. **Enable debugging on device:**
   - Shake device or run: `adb shell input keyevent 82`
   - Select "Debug" from developer menu
   - Select "Debug with Chrome" or "Debug JS Remotely"

### Using React Native Debugger:
- Set breakpoints by clicking line numbers
- Use Console tab for `console.log` output
- Use Redux tab if using Redux
- Use React tab for component inspection

## Method 2: Chrome DevTools

### Setup Steps:
1. **Start Metro and run app:**
   ```bash
   npm run start
   npm run android:debug
   ```
2. **Enable debugging on device** (same as above)
3. **Open Chrome and navigate to:**
   ```
   chrome://inspect/#devices
   ```
4. **Click "inspect" next to your app**

## Method 3: VS Code Debugging

### Setup Steps:
1. **Install React Native Tools extension in VS Code**
2. **Use the launch.json configuration** (already created)
3. **Start debugging:**
   - Press F5 or go to Run → Start Debugging
   - Select "Debug Android" configuration

## Debugging Your AuthContext Login Method

### Add debugging statements to your login method:
```typescript
const login = async (email: string, password: string) => {
    try {
        console.log('🔐 Starting login process for:', email);
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Firebase auth successful:', userCredential.user.uid);
        
        const user = userCredential.user;
        const token = await user.getIdToken();
        console.log('🎫 Firebase token obtained');

        const response = await axios.post(`${apiBaseUrl}/login`, { email, password});
        console.log('🌐 API response:', response.status);
        
        const { token: newToken, user: userData } = response.data;
        console.log('👤 User data received:', userData);

        await Promise.all([
            AsyncStorage.setItem('authToken', newToken),
            AsyncStorage.setItem('userData', JSON.stringify(userData))
        ]);
        console.log('💾 Data stored successfully');
        
    } catch (error) {
        console.error('❌ Login error:', error);
        throw error;
    }
};
```

## Troubleshooting

### Device Not Detected:
```bash
# Check if device is connected
adb devices

# If no devices, try:
adb kill-server
adb start-server
```

### Metro Connection Issues:
```bash
# Reset Metro cache
npm run start:reset

# Check Metro is running on correct port
netstat -an | grep 8081
```

### Debugging Not Working:
1. Ensure device and computer are on same network (for wireless debugging)
2. Try restarting Metro bundler
3. Clear app data and reinstall
4. Check firewall settings

## Quick Commands:
- `npm run debug` - Opens React Native Debugger
- `npm run start:reset` - Starts Metro with cache reset
- `npm run android:debug` - Runs debug build on Android
