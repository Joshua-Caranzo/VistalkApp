import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Modal } from 'react-native';
import Menu from '../components/Menu';
import HistoryIcon from '../assets/svg/HistoryIcon';
import SearchIcon from '../assets/svg/SearchIcon';
import SpeakerIcon from '../assets/svg/SpeakerIcon';
import { Circle, Svg, SvgXml } from 'react-native-svg';
import MicrophoneIcon from '../assets/svg/MicrophoneIcon';
import { RootStackParamList } from '../../types';
import LinearGradient from 'react-native-linear-gradient';
import { Content, ContentSyllable, Languages } from './type';
import { checkPronunciation, getContentById, getContentPronunciation, getContentSyllableById, getPronunciationCount, getPronunciations, getSyllablePronunciation, getUserLanguage } from './repo';
import Sound from 'react-native-sound';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { Keyboard } from 'react-native';  // Import the Keyboard module
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoaderModal from '../components/LoaderModal';
import { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<RootStackParamList, 'Practice'>;

const Practice: React.FC<Props> = ({ navigation }) => {
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
  const [count, setCount] = useState<number | null>(null)
  const [countMessage, setShowCountMessage] = useState<string | null>(null);
  const [languageDetails, setLanguageDetails] = useState<Languages>();
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [userID, setUserId] = useState<string | null>(null);

  const fetchContents = async (reset = false) => {
    setLoading(true);
    setLoadingMessage("Loading...")
    try {
      const userIdString = await AsyncStorage.getItem('userID');
      setUserId(userIdString)
      const result1 = await getUserLanguage(Number(userID));
      setLanguageDetails(result1.data);
      const result = await getPronunciations(result1.data.languageID, searchText, offset, 10);
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
    getcount();
  }, [userID]);


  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    fetchContents(true);
  }, [searchText, userID]);

  const startRecording = async () => {
    if (count != null && count == 0) {
      setShowCountMessage("You've reached your daily credit limit. Subscribe to continue, or come back tomorrow to keep learning!");
      return
    }
    setIsRecording(true);
    setCorrect(null)
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
    setCorrect(null)
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

  useEffect(() => {
    if (contents.length > 0) {
      random();
    }
  }, [contents]);

  useEffect(() => {
    if (contents.length > 0) {
      random();
   }
  }, [contents]);

  async function getcount() {
    if (userID) {
      const countResult = await getPronunciationCount(parseInt(userID))
      setCount(countResult.data.numberPronounced)
      console.log(countResult.data.numberPronounced)
    }
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
        setCorrect(true)
        setPronunciationResult("Excellent!")
      }
      else {
        setCorrect(false)
        setPronunciationResult("You're doing great! Please try again.")
      }
      getcount();
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

  const playUserAudio = () => {
    if (!audioFile) return;

    const soundInstance = new Sound(audioFile, '', (error: Error | null) => {
      if (error) {
        console.error('Failed to load sound', error);
        return;
      }
      soundInstance.setVolume(1.0); // Set volume to max
      soundInstance.play(() => {
        soundInstance.release(); // Release the sound instance after playback
      });
    });

    setSound(soundInstance); // Optionally track the sound instance
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

  const navigateToHistory = (contentId: number) => {
    navigation.navigate('History', { contentId });
  };

  function closeModal() {
    setShowCountMessage(null)
  }

  function navigateToSubscription() {
    closeModal()
    navigation.navigate('Shop', { selectedItemDefault: 'Subscription' })
  }
  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 items-center">
      <Text className="absolute top-4 left-4 text-lg font-black text-white">Credits: {count === null ? '∞' : count}</Text>
      <TouchableOpacity className="absolute top-4 right-4" disabled={!currentContent} onPress={() => navigateToHistory(currentContent?.contentID ?? 0)}>
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

        <TouchableOpacity className="items-center mb-4 mt-4" onPress={random}>
          <Text className="rounded-xl p-2 text-base font-black text-white bg-white/40">
            Select Randomly
          </Text>
        </TouchableOpacity>

        <View className="items-center mb-4 mt-2 p-1">
          <Text
            className={`text-xl italic font-light text-center font-bold ${correct ? 'text-white' : 'text-red-400'}`}
          >
            {pronunciationResult || ""}
          </Text>
        </View>

        {currentContent && (
          <View className="flex-1 items-center mt-4">
            <View className="mb-2 items-center">
              <Text className="text-2xl font-black text-white">Try to speak this:</Text>
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

            {isRecording && (
              <Text className="text-sm italic text-white mt-2">
                Please stop the recording first before submitting.
              </Text>
            )}

            <View className="flex flex-row items-center mb-4 mt-10 p-6">

              <TouchableOpacity
                className={`rounded-xl py-4 px-7 text-base font-black text-white bg-white/40 mr-4`}
                disabled={!audioFile}
                onPress={playUserAudio}
              >
                <Text className={`text-lg font-bold ${!audioFile ? 'text-gray-400' : 'text-white'}`}>
                  Play
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`rounded-xl p-4 text-base font-black text-white bg-white/40 `}
                onPress={check}
                disabled={!audioFile}
              >
                <Text className={`text-lg font-bold ${!audioFile ? 'text-gray-400' : 'text-white'}`}>
                  Submit
                </Text>
              </TouchableOpacity>

            </View>

            <Text className="text-bg-red mt-2 text-md font-bold">{message}</Text>
          </View>
        )}

        <View className="absolute bottom-0 w-full">
          <Menu activeScreen={activeScreen} />
        </View>

      </LinearGradient>
      <LoaderModal isVisible={loading} message={loadingMessage} />

      <Modal
        transparent={true}
        visible={countMessage != null}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50 justify-center items-center"
          onPress={closeModal}
        >
          <View className="bg-white p-6 rounded-lg w-4/5 shadow-lg">
            <Text className="text-center text-lg text-gray-800 mb-4">
              {countMessage}
            </Text>
            <TouchableOpacity style={{
              backgroundColor: 'white',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 50,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
            }} onPress={() => navigateToSubscription}>
              <Text className="text-[#f7c188] font-bold text-lg text-center">
                Subscribe</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>

  );
};

export default Practice;
