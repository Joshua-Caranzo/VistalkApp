/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, Image, ScrollView, Modal, BackHandler } from 'react-native';
import Menu from '../components/Menu';
import Svg, { Circle, Path } from 'react-native-svg';
import { LeaderboardScreenNavigationProp, RootStackParamList, UnitScreenNavigationProp } from '../../types';
import { claimReward, getDailyTasks, getNotifications, getSections, getUserDetails, getUserImageUrl, getUserLanguage, updateNotifications } from './repo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyTaskDto, Languages, NotificationsDto, SectionDetails, UserProfileDto } from './type';
import { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
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
  const [dailyTasks, setdailyTasks] = useState<DailyTaskDto[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<{ [key: number]: boolean }>({});
  const [notifications, setNotifications] = useState<NotificationsDto[]>([]);
  const [notificationCount, setNotifCount] = useState<number>(0);
  const [userId, setUserID] = useState<string>("");
  const toggleDescription = (taskID: number) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskID]: !prev[taskID],
    }));
  };

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
      setUserID(userID ?? "");
      const result = await getUserLanguage(Number(userID));
      setLanguageDetails(result.data);
      const userResult = await getUserDetails(Number(userID));
      setUserDetails(userResult.data);
      const sectionResult = await getSections(Number(userID), result.data.languageID);

      setSections(sectionResult.data)
      if (userResult.data.imagePath) {
        setFileUrl(getUserImageUrl(userResult.data.imagePath));
      }

      const dailyTaskResult = await getDailyTasks(Number(userID));
      setdailyTasks(dailyTaskResult.data);

      const notifResult = await getNotifications(Number(userID));
      setNotifCount(notifResult.totalCount || 0);
      setNotifications(notifResult.data);
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
    navigation.navigate("Leaderboard");
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

  const closeLeaderBoard = () => {
    setLeaderBoardVisible(false);
  };

  const openNotification = async () => {
    setNotificationVisible(true);
  };

  const closeNotification = async () => {
    console.log(userId)
    await updateNotifications(userId);
    setNotificationVisible(false);
    fetchUserData();
  };

  async function claimRewardDashboard(taskId: number) {
    await claimReward(userId, taskId);
    fetchUserData();
  }

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
          <TouchableOpacity className="ml-1" onPress={opendailyTask}>
            <DailyTaskIcon className="h-8 w-8 text-white" />
          </TouchableOpacity>
          <TouchableOpacity className="ml-1" onPress={openNotification}>
            <View style={{ position: 'relative' }}>
              <NotificationIcon className="h-8 w-8 text-white" />
              {notificationCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: 'red',
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    minWidth: 16,
                    height: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                    {notificationCount}
                  </Text>
                </View>
              )}
            </View>
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
                    strokeDasharray={`${(section.completedUnitCount / 100) * 2 * Math.PI * ((circleSize / 2) - 5)} ${2 * Math.PI * ((circleSize / 2) - 5) - (section.completedUnitCount / 100) * 2 * Math.PI * ((circleSize / 2) - 5)}`}
                    strokeDashoffset={(Math.PI / 2) * ((circleSize / 2) - 5)}
                  />
                </Svg>
                {/* Percentage Text */}
                <Text className="text-2xl text-white font-black absolute">{section.completedUnitCount}%</Text>
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
                <View className="flex-row justify-between mb-2">
                  <Text className="text-md font-medium text-black">SECTION {currentSection?.sectionNumber}</Text>
                  <View className="flex-row gap-x-1">
                    <Text className="text-md font-medium text-black ml-4s">{currentSection?.unitCount} Units</Text>

                  </View>
                </View>

                <Text className="text-2xl font-bold text-black mb-2 text-center uppercase">{currentSection?.title}</Text>
                <Text className="text-base text-black text-justify mb-5 text-center">
                  {currentSection?.description}
                </Text>
                <View className="pb-4 px-10">
                  <TouchableOpacity onPress={() => navigateToUnit()}>
                    <LinearGradient colors={['#6addd0', '#f7c188']} start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }} className="bg-gray-600 py-2 px-14 rounded-2xl self-center">
                      <Text className="text-lg text-gray-100 font-bold">Let's Begin</Text>
                    </LinearGradient>

                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={dailyTaskVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closedailyTask}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onPress={closedailyTask}
        >
          <View className="flex-1 justify-center items-center bg-opacity-50">
            <TouchableOpacity activeOpacity={1} className="bg-[#FAF9F6] rounded-xl">

              <View className="bg-white rounded-lg p-12 w-11/12 max-w-md shadow-lg">
                <Text className="text-2xl font-bold mb-4 text-black text-center">Daily Tasks</Text>
                <ScrollView contentContainerStyle={{ maxHeight: 400 }}>
                  {dailyTasks.length > 0 ? (
                    dailyTasks.map((task) => (
                      <View key={task.taskID} className="flex-row items-center mb-4 p-2 justify-between">
                        <View className="flex-row items-center">
                          <TouchableOpacity className="mr-4" disabled>
                            <View className="w-6 h-6 bg-gray-100 rounded-md justify-center items-center">
                              {task.isCompleted == true && (
                                <Svg className="w-6 h-6" viewBox="0 0 24 24">
                                  <Path fill="#000000" d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41z" />
                                </Svg>
                              )}
                            </View>
                          </TouchableOpacity>
                          <View>
                            <Text className="text-md text-gray-700">{task.taskName}</Text>

                            <TouchableOpacity onPress={() => toggleDescription(task.taskID)} className="flex-row items-center">
                              <Text className="text-md text-gray-700">Description</Text>
                              <Svg
                                className="ml-1 w-4 h-4"
                                style={{ transform: [{ rotate: expandedTasks[task.taskID] ? '90deg' : '0deg' }] }}
                                viewBox="0 0 24 24"
                              >
                                <Path fill="#000000" d="M7 10l5 5 5-5H7z" />
                              </Svg>
                            </TouchableOpacity>

                            {expandedTasks[task.taskID] && (
                              <Text className="text-sm text-gray-600 mt-1 w-24">{task.taskDescription}</Text>
                            )}
                            <Text className="text-md text-gray-700">Reward: {task.rewardcoins}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          disabled={!task.isCompleted}
                          onPress={() => claimRewardDashboard(task.taskID)}
                          className={`px-2 py-1 rounded-full ml-6 ${task.isCompleted ? 'bg-[#E8C58F]' : 'bg-gray-400'
                            }`}
                        >
                          <Text
                            className={`text-xs text-white ${task.isClaimed ? 'line-through decoration-red-500' : ''
                              }`}
                          >
                            Claim
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <Text className="text-center text-gray-500 mt-4">No daily tasks today.</Text>
                  )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>


      <Modal
        visible={notificationVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeNotification}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onPress={closeNotification}
        >
          <View className="flex-1 justify-center items-center bg-opacity-50">
            <TouchableOpacity activeOpacity={1} className="bg-[#FAF9F6] rounded-xl">

              <View className="bg-white rounded-lg p-12 w-11/12 max-w-md shadow-lg">
                <Text className="text-2xl font-bold mb-4 text-black text-center">Notifications</Text>
                <ScrollView contentContainerStyle={{ maxHeight: 400 }}>
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <View key={notif.id} className="flex-row items-center mb-4 p-2 justify-between">
                        {notif.isOpened === 0 && (
                          <View style={{ width: 10, height: 10, backgroundColor: 'red', borderRadius: 5, marginRight: 8 }} />
                        )}

                        <Text className="text-black text-lg">
                          {notif.message}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-center text-gray-500 mt-4">No notifications.</Text>
                  )}
                </ScrollView>

              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Menu activeScreen={activeScreen} />
    </LinearGradient>
  );
};

export default Dashboard;
