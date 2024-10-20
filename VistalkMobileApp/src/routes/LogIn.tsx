import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, StyleSheet, Alert, ImageBackground, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types'; // Adjust the import path
import { loginUser } from './repo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

type Props = StackScreenProps<RootStackParamList, 'LogIn'>;

const LogIn: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailPlaceholder, setEmailPlaceholder] = useState('Email');
  const [passwordPlaceholder, setPasswordPlaceholder] = useState('Password');

  const handleLogin = async () => {
    try {
      const response = await loginUser(email, password);

      if (response.isSuccess === true) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userID', response.data.id);
        
        navigation.navigate('Dashboard')
      } else {
        Alert.alert('Login Failed', response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('An error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 justify-center items-center">
        <View className="items-center mb-8">
          <Image source={require('../assets/White.png')} className="w-44 h-44" />
          <Text className="text-white text-4xl font-bold" style={{ color: '#ffffff', fontFamily: 'cursive' }}>
              Vistalk
          </Text>
        </View>
        <TextInput
          className="w-4/5 h-13 border-2 border-white mb-5 px-3 rounded-xl bg-transparent text-white"
          placeholder={emailPlaceholder}
          placeholderTextColor="white"
          onChangeText={setEmail}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          onFocus={() => setEmailPlaceholder('')}
          onBlur={() => setEmailPlaceholder('Email')}
        />

        <TextInput
          className="w-4/5 h-13 border-2 border-white mb-5 px-3 rounded-xl bg-transparent text-white"
          placeholder={passwordPlaceholder}
          placeholderTextColor="white"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
          onFocus={() => setPasswordPlaceholder('')}
          onBlur={() => setPasswordPlaceholder('Password')}
        />

        <TouchableOpacity className="border border-2 border-white p-3 w-[80%] rounded-xl items-center mb-4" onPress={handleLogin}>
          <Text className="text-white text-xl font-bold">Login</Text>
        </TouchableOpacity>

  {/*       <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert('Google Sign In')}>
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          className="w-4/5 items-end"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text className="text-white mt-0 text-right font-bold text-base">Forgot password?</Text>
        </TouchableOpacity>
        </LinearGradient>
    </SafeAreaView>
  );
};

export default LogIn;