/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Image, ScrollView, Modal, BackHandler } from 'react-native';
import Menu from '../components/Menu';
import Svg, { Circle, Path } from 'react-native-svg';
import { LeaderboardScreenNavigationProp, RootStackParamList, UnitScreenNavigationProp } from '../../types';
import { getSections, getUserDetails, getUserImageUrl, getUserLanguage } from './repo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Languages, SectionDetails, UserProfileDto } from './type';
import { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import UnitIcon from '../assets/svg/UnitIcon';
import Leaderboard from '../components/LeaderBoard';
import LeaderboardIcon from '../assets/svg/LeaderboardIcon';
import DailyTaskIcon from '../assets/svg/DailyTaskIcon';
import NotificationIcon from '../assets/svg/NotificationIcon';

type Props = StackScreenProps<RootStackParamList, 'Dashboard'>;

const Dashboard: React.FC<Props> = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [leaderBoardVisible, setLeaderBoardVisible] = useState(false);
  const [dailyTaskVisible, setdailyTaskVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionDetails | null>(null);
  const [activeScreen] = useState<keyof RootStackParamList | null>('Dashboard');
  const [languageDetails, setLanguageDetails] = useState<Languages>();
  const [userDetails, setUserDetails] = useState<UserProfileDto>();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const unit = useNavigation<UnitScreenNavigationProp>();
  const [sections, setSections] = useState<SectionDetails[]>([]);
  const leaderboardNavigation = useNavigation<LeaderboardScreenNavigationProp>();

  let progressnumber = 17;

  const handleBackPress = () => {
    BackHandler.exitApp();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove();
  }, []);



  const fetchUserData = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      const result = await getUserLanguage(Number(userID));
      setLanguageDetails(result.data);
      const userResult = await getUserDetails(Number(userID));
      setUserDetails(userResult.data);
      const sectionResult = await getSections(result.data.languageID);

      setSections(sectionResult.data)
      if (userResult.data.imagePath) {
        setFileUrl(getUserImageUrl(userResult.data.imagePath));
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    return unsubscribe;
  }, [navigation]);

  const navigateToUnit = () => {
    if (currentSection) {
      const sectionId = currentSection.sectionId
      const sectionName = currentSection.sectionNumber.toString();
      unit.navigate('Unit', { sectionId, sectionName });
    }
  };

  const navigateToLeaderboard = () => {
    leaderboardNavigation.navigate("Leaderboard");
  };


  const openModal = (section: SectionDetails) => {
    setCurrentSection(section);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentSection(null);
  };

  const opendailyTask = () => {
    setdailyTaskVisible(true);
  };

  const closedailyTask = () => {
    setdailyTaskVisible(false);
  };

  const openLeaderBoard = () => {
    setLeaderBoardVisible(true);
  };

  const closeLeaderBoard = () => {
    console.log('close')
    setLeaderBoardVisible(false);
  };

  const openNotification = () => {
    setNotificationVisible(true);
  };

  const closeNotification = () => {
    setNotificationVisible(false);
  };

  const circleSize = 100;

  return (
    <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 resize-cover justify-center">
      <View className="flex-row justify-between p-2 items-center">
        <TouchableOpacity className="w-10 h-10 rounded-full overflow-hidden bg-white justify-center items-center" onPress={() => navigation.navigate('UserProfile')}>
          {fileUrl ? (
            <Image
              source={{ uri: fileUrl }}
              className="w-10 h-10"
            />
          ) : (
            <Svg width="40" height="40" viewBox="0 0 1792 1792" >
              <Path fill="black" d="M1523 1339q-22-155-87.5-257.5T1251 963q-67 74-159.5 115.5T896 1120t-195.5-41.5T541 963q-119 16-184.5 118.5T269 1339q106 150 271 237.5t356 87.5t356-87.5t271-237.5m-243-699q0-159-112.5-271.5T896 256T624.5 368.5T512 640t112.5 271.5T896 1024t271.5-112.5T1280 640m512 256q0 182-71 347.5t-190.5 286T1245 1721t-349 71q-182 0-348-71t-286-191t-191-286T0 896t71-348t191-286T548 71T896 0t348 71t286 191t191 286t71 348" />
            </Svg>
          )}
        </TouchableOpacity>
        <View className="flex-row items-center">
          <TouchableOpacity className="" onPress={navigateToLeaderboard}>
            <LeaderboardIcon className="h-8 w-8 text-white" />
          </TouchableOpacity>
          {/* <TouchableOpacity className="ml-2" onPress={openLeaderBoard}>
            <Svg width="24" height="24" className='bg-white rounded-lg' viewBox="0 0 24 24">
              <Path
                fill="black"
                d="M12 2C10.9 2 10 2.9 10 4H5C4.45 4 4 4.45 4 5V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V5C20 4.45 19.55 4 19 4H14C14 2.9 13.1 2 12 2ZM12 4C12.55 4 13 4.45 13 5H11C11 4.45 11.45 4 12 4ZM6 6H18V18H6V6ZM8 8V16H10V10H12V16H14V8H12V10H10V8H8Z"
              />
            </Svg>
          </TouchableOpacity> */}
          <TouchableOpacity className="ml-1" onPress={opendailyTask}>
            <DailyTaskIcon className="h-8 w-8 text-white" />
{/*             <Svg width="24" height="24" className='bg-white rounded-lg' viewBox="0 0 16 16">
              <Path
                fill="black"
                d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5zm6.5 6a.5.5 0 0 0 .5.5h2.25a.5.5 0 0 0 0-1H9a.5.5 0 0 0-.5.5M9 6a.5.5 0 0 0 0 1h2.25a.5.5 0 0 0 0-1zM7.354 9.146a.5.5 0 0 0-.708 0L5.5 10.293l-.394-.395a.5.5 0 0 0-.708.707l.748.749a.5.5 0 0 0 .708 0l1.5-1.5a.5.5 0 0 0 0-.708m0-3.292a.5.5 0 1 0-.708-.708L5.5 6.293l-.394-.395a.5.5 0 0 0-.708.708l.748.748a.5.5 0 0 0 .708 0z"
              />
            </Svg> */}
          </TouchableOpacity>
          <TouchableOpacity className="ml-1" onPress={openNotification}>
            <NotificationIcon className="h-8 w-8 text-white" />
            {/* <Svg width="24" height="24" className='bg-white rounded-lg' viewBox="0 0 24 24">
              <Path
                fill="black"
                d="M14.235 19c.865 0 1.322 1.024.745 1.668A4 4 0 0 1 12 22a4 4 0 0 1-2.98-1.332c-.552-.616-.158-1.579.634-1.661l.11-.006zM12 2c1.358 0 2.506.903 2.875 2.141l.046.171l.008.043a8.01 8.01 0 0 1 4.024 6.069l.028.287L19 11v2.931l.021.136a3 3 0 0 0 1.143 1.847l.167.117l.162.099c.86.487.56 1.766-.377 1.864L20 18H4c-1.028 0-1.387-1.364-.493-1.87a3 3 0 0 0 1.472-2.063L5 13.924l.001-2.97A8 8 0 0 1 8.822 4.5l.248-.146l.01-.043a3 3 0 0 1 2.562-2.29l.182-.017z"
              />
            </Svg> */}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }} className="mb-8" showsVerticalScrollIndicator={false}>
        {languageDetails !== undefined && (
          <View className="items-center mb-5">
            <Text className="text-4xl font-black text-white">{languageDetails.native_name}</Text>
          </View>
        )}
        {sections.map((section, index) => (
          <View key={index} className="mb-5">
            <View
              className="flex-row items-center justify-between rounded-2xl py-4 px-8"
              style={{
                backgroundColor: index % 2 === 0 ? '#6addd0' : '#f7c188', // Alternate colors
                shadowColor: '#000', // Shadow color
                shadowOffset: { width: 0, height: 4 }, // Offset for the shadow
                shadowOpacity: 0.3, // Opacity of the shadow
                shadowRadius: 5, // Radius of the shadow
                elevation: 6, // For Android shadow
              }}
            >
              <View className="flex-col gap-y-2">
                <Text className="text-lg text-white font-bold">Section {section.sectionNumber}</Text>
                <Text className="text-3xl text-white font-black">{section.unitCount} Units</Text>
                <TouchableOpacity onPress={() => openModal(section)}>
                  <View className="bg-white rounded-2xl mt-2 px-10 py-2">
                    <Text className="text-lg text-black font-bold">Play</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View className="justify-center items-center" style={{ width: circleSize, height: circleSize }}>
                <Svg width={circleSize} height={circleSize}>
                  {/* Background Circle with semi-transparent fill */}
                  <Circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={(circleSize / 2) - 5} // Radius reduced for stroke
                    stroke="#AEAEAE"
                    strokeWidth="5"
                    fill="rgba(0, 0, 0, 0.1)" // Semi-transparent fill
                  />
                  {/* Progress Circle */}
                  <Circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={(circleSize / 2) - 5}
                    stroke="#ffffff"
                    strokeWidth="6"
                    fill="none" // No fill for the progress circle
                    strokeDasharray={`${(progressnumber / 100) * 2 * Math.PI * ((circleSize / 2) - 5)} ${2 * Math.PI * ((circleSize / 2) - 5) - (progressnumber / 100) * 2 * Math.PI * ((circleSize / 2) - 5)}`}
                    strokeDashoffset={(Math.PI / 2) * ((circleSize / 2) - 5)}
                  />
                </Svg>
                {/* Percentage Text */}
                <Text className="text-2xl text-white font-black absolute">{progressnumber}%</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>


      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableOpacity className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }} onPress={closeModal}>
          <View className="rounded-t-xl w-full" >
            <TouchableOpacity activeOpacity={1} className="bg-[#FAF9F6] rounded-t-xl" >
              <View className="p-8">
                <View className="flex-row justify-between">
                  <Text className="text-md font-medium text-black">SECTION {currentSection?.sectionNumber}</Text>
                  <View className="flex-row gap-x-1">
                    <Text className="text-md font-medium text-black">Difficulty:</Text>
                    <Text className="text-md font-black text-black">Easy</Text>
                  </View>
                </View>
                <View className="flex-col items-start gap-2 ml-4 mb-6">
                  <Text className="text-md font-medium text-black ml-4s">{currentSection?.unitCount} Units</Text>
                </View>
                <Text className="text-3xl font-bold text-black mb-2 text-center uppercase">{currentSection?.title}</Text>
                <Text className="text-base text-black text-justify mb-5 text-center">
                  {currentSection?.description}
                </Text>
                <View className="pb-4 px-10">
                  <TouchableOpacity onPress={() => navigateToUnit()}>
                    <LinearGradient colors={['#6addd0', '#f7c188']} start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }} className="bg-gray-600 py-2 px-14 rounded-2xl self-center">
                      <Text className="text-lg text-white font-bold">Let's Begin</Text>
                    </LinearGradient>

                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* dailyTask*/}
      <Modal
        visible={dailyTaskVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closedailyTask}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-[#00000080]"
          onPress={closedailyTask}
        >
          <View className="w-4/5 bg-[#99BC85] rounded-xl p-3 ">
            <View className="border border-white rounded-md border-2 p-5">
              <Text className="text-center text-lg text-white font-bold">DAILY TASK</Text>

              <View className="mt-4">
                {/* Task Items */}
                <View className="flex-row items-center mb-2">
                  <TouchableOpacity className="mr-2">
                    <View className="w-5 h-5 border border-white rounded"></View>
                  </TouchableOpacity>
                  <Text className="text-white text-base">Complete 3 games</Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <TouchableOpacity className="mr-2">
                    <View className="w-5 h-5 border border-white rounded"></View>
                  </TouchableOpacity>
                  <Text className="text-white text-base">Complete 3 games</Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <TouchableOpacity className="mr-2">
                    <View className="w-5 h-5 border border-white rounded"></View>
                  </TouchableOpacity>
                  <Text className="text-white text-base">Complete 3 games</Text>
                </View>
              </View>

              {/* Rewards Section */}
              <View className="mt-4 items-center">
                <Text className="text-white text-sm">
                  Rewards:
                  <Text> 2x 🪙 </Text>
                  <Text> 1x 💧</Text>
                </Text>
              </View>

              {/* Claim Button */}
              <TouchableOpacity onPress={closedailyTask} className="mt-5 bg-white py-3 rounded-full shadow-md w-40 mx-auto">
                <Text className="text-gray-800 text-center font-bold">CLAIM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {leaderBoardVisible && (
        <Leaderboard onCloseLeaderBoard={closeLeaderBoard} />
      )}

      {/* Notification Modal */}
      <Modal
        visible={notificationVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeNotification}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-[#00000080]"
          onPress={closeNotification}
        >
          <View className="w-4/5 bg-[#99BC85] rounded-xl p-3">
            <View className="border border-white rounded-md border-1 p-2">
              <Text className="text-center text-xl font-bold mb-4 text-white">NOTIFICATIONS</Text>
              {/* Notification content here */}
              <ScrollView>
                <Text className="text-white">You have no new notifications!</Text>
                {/* Add more notifications as needed */}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Menu activeScreen={activeScreen} />
    </LinearGradient>
  );
};

export default Dashboard;
