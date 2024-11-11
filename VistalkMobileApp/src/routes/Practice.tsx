import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Menu from '../components/Menu'; // Adjust the import path as needed
import HistoryIcon from '../assets/svg/HistoryIcon';
import SearchIcon from '../assets/svg/SearchIcon';
import SpeakerIcon from '../assets/svg/SpeakerIcon';
import { Circle, Svg } from 'react-native-svg';
import MicrophoneIcon from '../assets/svg/MicrophoneIcon';
import { RootStackParamList } from '../../types';
import LinearGradient from 'react-native-linear-gradient';

const Practice: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeScreen, setActiveScreen] = useState<keyof RootStackParamList | null>('Practice');
  let progressnumber = 17;
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 resize-cover items-center">
        <TouchableOpacity className="absolute top-0 right-0 mr-4 mt-4">
          <HistoryIcon className="h-8 w-8 text-white" />
        </TouchableOpacity>
        <View className="items-center mt-20 mb-3">
          <Text className="text-4xl font-black text-white">Pronounce</Text>
        </View>
        <View className="flex flex-row items-center justify-start bg-white rounded-lg px-4 mb-5 w-4/5 h-10">
          <TextInput
            className="flex-1 h-full text-[#999] text-base"
            placeholder="Search for a word"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <SearchIcon className="w-7 h-7" />
        </View>
        <TouchableOpacity className="items-center mb-4">
          <Text className="rounded-xl p-2 text-base font-black text-white" style={{
            backgroundColor: 'rgba(240, 240, 240, 0.4)'
          }}>
            Random Words
          </Text>
        </TouchableOpacity>
        <View className="flex-1 items-center mt-8">
          <View className="mb-2 items-center">
            <Text className="text-2xl font-black text-white">Maayong Buntag</Text>
            <View className="flex flex-row ml-2 mb-2 px-2">
              <View className="flex-row items-center space-x-2">
                <Text className="text-xl italic font-light text-white underline">ma</Text>
                <Text className="text-xl italic font-light text-white underline">a</Text>
                <Text className="text-xl italic font-light text-white underline">yong</Text>
                <Text className="text-xl italic font-light text-white underline">bun</Text>
                <Text className="text-xl italic font-light text-white underline">tag</Text>
              </View>
              <TouchableOpacity>
                <SpeakerIcon className="h-8 w-8 ml-3 text-white" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="items-center mb-4">
            <Text className="text-3xl font-bold text-white">Excellent !!!</Text>
          </View>
          <View className="justify-center items-center mb-4">
            <Svg width="160" height="160">
              <Circle
                cx="80"
                cy="80"
                r="70"
                stroke="#AEAEAE"
                strokeWidth="5"
                fill="rgba(0, 0, 0, 0.1)"
              />
              <Circle
                cx="80"
                cy="80"
                r="70"
                stroke="#ffffff"
                strokeWidth="5"
                fill="none"
                strokeDasharray={`${progressnumber / 100 * 2 * Math.PI * 70} ${2 * Math.PI * 70 - progressnumber / 100 * 2 * Math.PI * 70}`}
                strokeDashoffset={Math.PI / 2 * 70}
              />
            </Svg>
            <Text className='absolute text-2xl text-white font-black'>{progressnumber}%</Text>
          </View>

          <TouchableOpacity className="items-center rounded-full p-4" style={{
            backgroundColor: 'rgba(240, 240, 240, 0.4)'
          }}>
            <MicrophoneIcon className="h-16 w-16 text-white" />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: 4 }} className="mb-4" showsVerticalScrollIndicator={false}>

        </ScrollView>
        <Menu activeScreen={activeScreen} />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Practice;
