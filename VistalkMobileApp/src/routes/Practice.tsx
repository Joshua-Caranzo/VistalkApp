import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Menu from '../components/Menu';
import HistoryIcon from '../assets/svg/HistoryIcon';
import SearchIcon from '../assets/svg/SearchIcon';
import SpeakerIcon from '../assets/svg/SpeakerIcon';
import { Circle, Svg } from 'react-native-svg';
import MicrophoneIcon from '../assets/svg/MicrophoneIcon';
import { RootStackParamList } from '../../types';
import LinearGradient from 'react-native-linear-gradient';
import { Content, ContentSyllable } from './type';
import { checkPronunciation, getContent, getContentById, getContentPronunciation, getContentSyllableById, getSyllablePronunciation } from './repo';
import Sound from 'react-native-sound';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { Keyboard } from 'react-native';  // Import the Keyboard module
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoaderModal from '../components/LoaderModal';

const Practice: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeScreen, setActiveScreen] = useState<keyof RootStackParamList | null>('Practice');
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentContent, setCurrentContent] = useState<Content>();
  const [contentSyllables, setContentSyllables] = useState<ContentSyllable[]>();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Sound | null>(null);
  const [syllableFileUrls, setSyllableFileUrls] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const fetchContents = async (reset = false) => {
    setLoading(true);
    setLoadingMessage("Loading...")
    try {
      const result = await getContent(searchText, offset, 10);
      const newContents = result.data;
      if (reset) {
        setContents(newContents);
        setOffset(0);
      } else {
        setContents((prevContents) => [...prevContents, ...newContents]);
      }

      if (newContents.length < 10) setHasMore(false);
      if (hasMore) setOffset((prevOffset) => prevOffset + 10);
      stopAndReleaseSound();
    } catch (error) {
      setError('Failed to fetch contents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchContents(true);
  }, [searchText]);

  const startRecording = async () => {
    setIsRecording(true);
    setPronunciationResult(null)
    setMessage(null);

    try {
      if (audioRecorderPlayer != null) {
        console.log(audioRecorderPlayer)
        await audioRecorderPlayer.startRecorder()
        audioRecorderPlayer.addRecordBackListener((e) => {
          console.log('Recording: ', e.currentPosition);
          return;
        });
      }
      else {
        console.log("player is null")
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      const filePath = await audioRecorderPlayer.stopRecorder();
      console.log('Recording stopped, saved at: ', filePath);


      setAudioFile(filePath);
      audioRecorderPlayer.removeRecordBackListener();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  async function selectContent(id: number) {
    setPronunciationResult(null)
    setMessage(null);

    setShowDropdown(false)
    Keyboard.dismiss();

    const contentResult = await getContentById(id);
    setCurrentContent(contentResult.data);

    if (contentResult.data.audioPath) {
      const newFileUrl = getContentPronunciation(contentResult.data.audioPath);
      setFileUrl(newFileUrl);
    }

    const syllableResult = await getContentSyllableById(id);
    setContentSyllables(syllableResult.data);

    const syllableUrls = syllableResult.data.map(syllable => getSyllablePronunciation(syllable.audioPath));
    setSyllableFileUrls(syllableUrls);
  }

  async function searchContent(text: string) {
    setSearchText(text);
    fetchContents();
  }

  async function random() {
    if (contents.length > 0) {
      const randomIndex = Math.floor(Math.random() * contents.length);
      const randomContent = contents[randomIndex];
      if (randomContent) {
        await selectContent(randomContent.contentID);
      }
    }
  }

  const check = async () => {
    if (!audioFile) {
      setMessage("No audio file to upload");
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage("Getting Result...")
      setMessage(null);
      const file = await RNFS.readFile(audioFile, 'base64');
      const userID = await AsyncStorage.getItem('userID');
      const decodedFile = RNFS.DocumentDirectoryPath + '/audio.m4a';
      await RNFS.writeFile(decodedFile, file, 'base64');

      const formData = new FormData();
      formData.append('userId', userID);
      formData.append('contentId', String(currentContent?.contentID ?? 0));
      formData.append('audioFile', {
        uri: 'file://' + decodedFile,
        type: 'audio/m4a',
        name: 'audio.m4a',
      });

      const response = await checkPronunciation(formData);
      if (response.isSuccess) {
        setPronunciationResult("Excellent")
      }
      else {
        setPronunciationResult("You're doing great! Please try again")
      }
      setAudioFile(null);
      setLoading(false);

    } catch (error) {
      console.error('Failed to upload audio file:', error);
    }
  };

  const playSound = (fileUrl: string | null) => {
    if (!fileUrl) return;

    const sound = new Sound(fileUrl, '', (error: Error | null) => {
      if (error) {
        console.error('Failed to load sound', error);
        return;
      }

      sound.setVolume(1.0); // Set volume to max
      sound.play(() => {
        // Callback when sound playback ends
        sound.release(); // Release the sound instance after playback
      });
    });

    setSound(sound); // Optionally track the sound instance
  };

  const stopAndReleaseSound = () => {
    if (sound) {
      sound.stop();
      sound.release();
      setSound(null);
    }
  };

  const playSyllableSound = (syllableIndex: number) => {
    const syllableAudioUrl = syllableFileUrls[syllableIndex];
    if (!syllableAudioUrl) return;

    const syllableSound = new Sound(syllableAudioUrl, '', (error) => {
      if (error) {
        console.error('Failed to load the syllable sound', error);
        return;
      }

      syllableSound.play();
    });
  };
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 items-center">
        <TouchableOpacity className="absolute top-4 right-4">
          <HistoryIcon className="h-8 w-8 text-white" />
        </TouchableOpacity>
        <View className="items-center mt-20 mb-3">
          <Text className="text-4xl font-black text-white">Pronounce</Text>
        </View>

        <View className="relative w-4/5">
          <View className={`flex flex-row items-center bg-white px-4 mb-2 h-10 ${showDropdown ? 'rounded-t-lg' : 'rounded-lg'}`}>
            <TextInput
              className="flex-1 text-gray-600"
              placeholder="Search for a word"
              placeholderTextColor="#999"
              value={searchText}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setShowDropdown(false)}
              onChangeText={(text) => searchContent(text)}
            />
            <SearchIcon className="w-6 h-6 text-gray-400" />
          </View>
          {showDropdown && contents.length > 0 && (
            <View className="absolute top-10 left-0 right-0 bg-white shadow-lg rounded-b-lg z-10">
              {contents.map((content, index) => (
                <TouchableOpacity
                  key={index}
                  className="px-4 py-2 border-b border-gray-200"
                  onPress={() => selectContent(content.contentID)}
                >
                  <Text className="text-gray-800">{content.contentText}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity className="items-center mb-4" onPress={random}>
          <Text className="rounded-xl p-2 text-base font-black text-white bg-white/40">
            Random Words
          </Text>
        </TouchableOpacity>
        <View className="items-center mb-4 mt-10 p-6">
          <Text className="text-2xl text-center font-bold text-white">{pronunciationResult || ""}</Text>
        </View>
        {currentContent && (
          <View className="flex-1 items-center mt-4">
            <View className="mb-2 items-center">
            <Text className="text-2xl font-black text-white">Try to Speak this:</Text>
              <View className="flex-row items-center">
                <Text className="text-2xl font-black text-white">{currentContent.contentText}</Text>
                <TouchableOpacity onPress={() => playSound(fileUrl)}>
                  <SpeakerIcon className="h-8 w-8 ml-3 text-white" />
                </TouchableOpacity>
              </View>
              <View className="flex flex-row ml-2 mb-2 px-2">
                {contentSyllables?.map((syllable, index) => (
                  <View key={index} className="flex flex-row">
                    <Text className="text-xl italic font-light text-white underline" onPress={() => playSyllableSound(index)}>
                      {syllable.syllableText}
                    </Text>
                    {index < contentSyllables.length - 1 && (
                      <Text className="text-xl italic font-light text-white"> </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              className={`items-center rounded-full p-4 ${isRecording ? 'bg-red-500' : 'bg-white/40'}`}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <MicrophoneIcon className={`h-10 w-10 ${isRecording ? 'text-white' : 'text-black'}`} />
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-xl p-4 text-base font-black text-white bg-white/40 mt-10"
              onPress={() => check()}
              disabled = {!audioFile}
            >
              <Text className="text-white text-lg font-bold">Submit</Text>
            </TouchableOpacity>
            <Text className="text-bg-red mt-2 text-md font-bold">{message}</Text>
          </View>
        )}

        <View className="absolute bottom-0 w-full">
          <Menu activeScreen={activeScreen} />
        </View>
        
      </LinearGradient>
      <LoaderModal isVisible={loading} message={loadingMessage} />

    </SafeAreaView>
    
  );
};

export default Practice;
