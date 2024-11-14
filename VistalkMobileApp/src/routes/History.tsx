import { Animated, Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import BackIcon from "../assets/svg/BackIcon";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../types";
import { PieChart } from "react-native-chart-kit";
import React, { useRef, useState } from "react";
import { PronunciationProgressDto, PronunciationProgressListDto } from "./type";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pronunciationProgressChart, pronunciationProgressList } from "./repo";

type Props = StackScreenProps<RootStackParamList, 'History'>;

const screenWidth = Dimensions.get('window').width;

const History: React.FC<Props> = ({ navigation, route }) => {
    const [pieDataResult, setPieData] = useState<PronunciationProgressDto>();
    const [currentContentId, setContentId] = useState<number | null>(null);
    const [list, setList] = useState<PronunciationProgressListDto[]>([]);
    const { contentId } = route.params;

    const [isToggled, setIsToggled] = useState(false);
    const animatedPosition = useRef(new Animated.Value(0)).current;

    const fetchLeaderboardData = async () => {
        try {
            const userIdString = await AsyncStorage.getItem('userID');
            if (userIdString) {
                const result = await pronunciationProgressChart(parseInt(userIdString), currentContentId);
                setPieData(result.data);
                const result2 = await pronunciationProgressList(parseInt(userIdString), currentContentId);
                setList(result2.data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchLeaderboardData();
        }, [contentId])
    );

    const handleToggle = () => {
        setIsToggled((prevState) => !prevState);

        Animated.timing(animatedPosition, {
            toValue: isToggled ? 0 : 20,
            duration: 200,
            useNativeDriver: false,
        }).start();

        // Toggle content filter by setting `contentId` to either `currentContentId` or `null`
        setContentId(isToggled ? null : contentId);
    };

    const pieData = [
        { name: 'Correct', population: parseInt(pieDataResult?.correct ?? "0"), color: '#FF6384', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Incorrect', population: parseInt(pieDataResult?.incorrect ?? "0"), color: '#36A2EB', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    ];
    return (
        <SafeAreaView className="flex-1">
            <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 items-center">
                <View className="flex-row justify-between items-center mt-4 w-full px-5">
                    <TouchableOpacity onPress={() => navigation.navigate('Practice')}>
                        <BackIcon className="h-8 w-8 text-white" />
                    </TouchableOpacity>
                </View>
                <View className="flex-1 mt-2">
                    <Text className="text-3xl font-black text-white text-center">History</Text>

                    <View className="flex-row items-center gap-x-2 mt-2 justify-end mr-5">
                        <Text className="text-md text-white">Show Content History only</Text>
                        <TouchableOpacity onPress={handleToggle} className="ml-4">
                            <View className={`w-10 h-5 rounded-full item-center ${isToggled ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <Animated.View
                                    style={{
                                        width: 16,
                                        height: 16,
                                        backgroundColor: 'white',
                                        borderRadius: 8,
                                        marginLeft: animatedPosition,
                                        alignItems: 'center'
                                    }}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View className="">
                        <PieChart
                            data={pieData}
                            width={screenWidth}
                            height={220}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#f7c188',
                                backgroundGradientTo: '#6addd0',
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute // Shows absolute values instead of percentages
                        />
                    </View>

                </View>
                <ScrollView
                    className="bg-white rounded-xl mb-6 mt-[30%]"
                    contentContainerStyle={{ paddingHorizontal: 30, paddingVertical: 15 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View>
                        <Text className="text-black text-lg font-bold mb-4 w-full px-16">History Words</Text>

                        <View className="flex-row mb-4">
                            <Text className="flex-1 font-bold text-black text-base text-center">Word</Text>
                            <Text className="flex-1 font-bold text-black text-base text-center">Response</Text>
                        </View>

                        {list.map((item, index) => (
                            <View key={index} className="flex-row mb-2">
                                <Text className="flex-1 text-base text-black text-center">{item.contentText}</Text>
                                <Text className="flex-1 text-base text-black text-center">{item.pronunciationScore}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};
export default History;