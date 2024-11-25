import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, Image, Modal } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types'; // Adjust the import path
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getIsEmailUsed, getUserDetails, sendCodetoEmail, verifyCode, editVistaProfile } from './repo'; // Ensure updateUserProfile is imported
import {  UserProfileDto } from './type';
import { launchImageLibrary } from 'react-native-image-picker';
import BackIcon from '../assets/svg/BackIcon';
import LinearGradient from 'react-native-linear-gradient';

type Props = StackScreenProps<RootStackParamList, 'EditProfile'>;

const EditProfile: React.FC<Props> = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState<UserProfileDto | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [confirmationCodePlaceHolder, setConfirmationCodePlaceHolder] = useState('');

  const fetchUserData = async () => {
    try {
      const userID = await AsyncStorage.getItem('userID');
      if (userID) {
        const result = await getUserDetails(Number(userID));
        setUserDetails(result.data);
        setName(result.data.name);
        setEmail(result.data.email);
        if (result.data.imagePath) {
          const newFileUrl = result.data.imagePath;
          setFileUrl(newFileUrl);
        }
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      Alert.alert('An error occurred while fetching user details.');
    }
  };

  useEffect(() => {
    fetchUserData();
    const unsubscribe = navigation.addListener('focus', fetchUserData);

    return unsubscribe;
  }, [navigation]);

  const handleImageSelect = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.didCancel) {
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
        Alert.alert('An error occurred while selecting image.');
      } else if (response.assets && response.assets.length > 0) {
        setFileUrl(response.assets[0].uri || null);
      } else {
        Alert.alert('No image selected');
      }
    });
  };

  const handleSave = async () => {
    try {
      if (name && email) {
        if (email !== userDetails?.email) {
          const checkEmail = await getIsEmailUsed(email);
          if (checkEmail.isSuccess) {
            const result = await sendCodetoEmail(email);
            if (result.isSuccess) {
              setIsModalVisible(true);
            } else {
              Alert.alert(result.message);
            }
          } else {
            Alert.alert(checkEmail.message);
          }
        } else {
          await updateProfile();
        }
      } else {
        Alert.alert('Please fill in all fields');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('An error occurred while updating your profile.');
    }
  };

  const updateProfile = async () => {
    const userID = await AsyncStorage.getItem('userID');
    if (userID) {
      const formData = new FormData();
      formData.append('userId', String(userID));
      formData.append('name', name);
      formData.append('email', email);
      if (fileUrl) {
        formData.append('file', {
          uri: fileUrl,
          name: `${name}${userID}.jpg`,
          type: 'image/jpeg',
        } as any);
      }
      const result = await editVistaProfile(formData);
      if (result.isSuccess) {
        Alert.alert(result.message);
        fetchUserData();
        navigation.goBack();
      } else {
        Alert.alert('Update failed', result.message);
      }
    }
  };

  const handleConfirmCode = async () => {
    if (confirmationCode) {
      try {
        const verificationResult = await verifyCode(email, confirmationCode);
        if (verificationResult.isSuccess) {
          setIsModalVisible(false);
          await updateProfile();
        } else {
          Alert.alert('Verification failed', verificationResult.message);
        }
      } catch (error) {
        console.error('Error verifying code:', error);
        Alert.alert('An error occurred while verifying the code.');
      }
    } else {
      Alert.alert('Please enter the confirmation code.');
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 resize-cover">
        <View className="flex-row justify-between w-full px-5 absolute top-10">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <BackIcon className="h-8 w-8 text-white" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <View className="items-center mb-4">
            <Text className="text-white text-2xl font-black">Edit Profile</Text>
          </View>
          <View className="items-center mb-4">
            <TouchableOpacity onPress={handleImageSelect}>
              {fileUrl ? (
                <Image
                  source={{ uri: fileUrl }}
                  className="w-20 h-20 rounded-full border-2 border-white"

                />
              ) : (
                <View className="w-20 h-20 rounded-full border-2 border-white bg-transparent justify-center items-center">
                  <Text className="text-white text-base font-bold">Select Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View className='items-center w-full'>
            <TextInput
              className="w-4/5 h-13 bg-transparent border-2 border-white text-white p-3 mb-3 rounded-lg"
              placeholder="Name"
              placeholderTextColor="#white"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="w-4/5 h-13 bg-transparent border-2 border-white text-white p-3 mb-3 rounded-lg"
              placeholder="Email"
              placeholderTextColor="white"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TouchableOpacity className="p-2 rounded-xl items-center w-[80%]" style={{
                  backgroundColor: 'rgba(240, 240, 240, 0.4)'
                }} onPress={handleSave}>
              <Text className="text-white text-lg font-bold">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal for email verification */}

        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          
          <View className="flex-1 justify-center items-center bg-[#00000080]">
            <View className="w-4/5 p-5 rounded-xl items-center bg-white">
              <Text className="text-xl font-black mb-4 text-black">Enter Confirmation Code</Text>

              <TextInput
                className="w-full h-12 border border-gray-500 border-2 mb-4 px-2 rounded-md bg-transparent text-black"
                placeholder="Confirmation Code"
                placeholderTextColor="white"
                onChangeText={setConfirmationCode}
                value={confirmationCode}
                keyboardType="numeric"
                onFocus={() => setConfirmationCodePlaceHolder('')}
                onBlur={() => setConfirmationCodePlaceHolder('Confirmation Code')}
              />

              <View className="flex-row items-center justify-center w-[100%] gap-2">
                <TouchableOpacity onPress={handleConfirmCode}>
                  <LinearGradient className="flex py-2 px-4 rounded-xl items-center" colors={['#6addd0', '#f7c188']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                        <Text className="text-base text-white">Confirm</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <LinearGradient className="flex py-2 px-4 rounded-xl items-center" colors={['#DD816A', '#FF1F1F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                      <Text className="text-base text-white">Cancel</Text>
                  </LinearGradient>  
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default EditProfile;
