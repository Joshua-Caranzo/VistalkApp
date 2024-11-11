import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { SubscriptionDto } from './type';
import { buySubscription, getSubscriptions, getUserVCoin, paymongoRedirect } from './repo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Text as SvgText, Image as SvgImage } from 'react-native-svg';


type SusbcriptionProps = {
  vCoin: number;
  setVcoin: React.Dispatch<React.SetStateAction<number>>;
};

const Subscription: React.FC<SusbcriptionProps> = ({ vCoin, setVcoin }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedSubcription, setSelectedSubscription] = useState<SubscriptionDto | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const result = await getSubscriptions();
        setSubscriptions(result.data);

        const userID = await AsyncStorage.getItem('userID');

        if (userID) {
          const result = await getUserVCoin(userID);
          if (result.isSuccess) {
            setVcoin(result.data);
          } else {
            setError('Failed to fetch vCoin');
          }
        }
      } catch (err) {
        setError('Failed to fetch power-ups');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleOpenModal = (s: SubscriptionDto) => {
    setSelectedSubscription(s);
    setModalVisible(true);
  };

  const handleBuy = async () => {
    if (selectedSubcription) {
      const userID = await AsyncStorage.getItem('userID');
      if (userID) {
        try {
          const result = await paymongoRedirect(selectedSubcription.price, selectedSubcription.subscriptionName);
          if (result.url) {
            Linking.openURL(result.url);

            setModalVisible(false);
            setTimeout(async () => {
              const paymentSuccess = true;
              if (paymentSuccess) {
                await buySubscription(userID, selectedSubcription.id);
                Alert.alert("Payment Success", "Your payment was successful!");
              } else {
                Alert.alert("Payment Failed", "There was a problem with your payment. Please try again.");
              }
            }, 10000);
          } else {
            setError('Failed to initiate payment');
          }
        } catch (err) {
          setError('Payment failed');
        }
      }
    }
  };

  return (
    <View className="flex flex-row gap-32 items-center p-[100px] mb-24">
      {subscriptions.map((subscription, index) => (
        <View key={index} className="items-center">
          <LinearGradient colors={['rgba(169, 204, 27, 0.45)', 'rgba(54, 68, 0, 0.45)']} className="items-center justify-center rounded-lg p-4 mb-4 border border-white">
            <Image source={require('../assets/White.png')} className="w-24 h-24 mb-6 bg-gray-400 p-4 rounded-full" />
            <Text className="text-2xl font-bold text-white w-32 text-center">{subscription.subscriptionName}</Text>
          </LinearGradient>

          <TouchableOpacity onPress={() => handleOpenModal(subscription)}>
            <LinearGradient colors={['#F8F6F4', '#8399A2']} className="rounded-xl py-3 px-4">
              <Text className="text-base font-black text-white">₱ {subscription.price}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>))}

      {selectedSubcription && (
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex items-center justify-center flex-1 bg-[#00000080]">
            <View className="bg-white items-center p-6 rounded-2xl w-[80%]">
              <Text className="text-black text-xl font-black mb-4 text-center">Purchase {selectedSubcription.subscriptionName}</Text>

              <View className="flex-row items-center gap-x-2 mb-4">
                <Text className="text-lg text-black font-bold">Total Price:</Text>
                <Text className="text-lg text-black">₱ {selectedSubcription.price}</Text>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleBuy}
                >
                  <LinearGradient
                    className="py-2 px-5 rounded-xl items-center" colors={['#F8F6F4', '#8399A2']}>
                    <Text className="text-base font-bold text-white">Buy</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                >
                  <LinearGradient
                    className="py-2 px-3 rounded-xl items-center" colors={['#DD816A', '#FF1F1F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Text className="text-base font-bold text-white">Cancel</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

    </View>
  );
};

export default Subscription;
