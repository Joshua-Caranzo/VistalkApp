import { Animated, Dimensions, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import BackIcon from "../assets/svg/BackIcon";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../types";
import { PieChart } from "react-native-chart-kit";
import { useRef, useState } from "react";

type Props = StackScreenProps<RootStackParamList, 'History'>;

const screenWidth = Dimensions.get('window').width;

const History: React.FC<Props> = ({ navigation }) => {
    const pieData = [
        { name: 'Category A', population: 30, color: '#FF6384', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Category B', population: 50, color: '#36A2EB', legendFontColor: '#7F7F7F', legendFontSize: 15 },
        { name: 'Category C', population: 20, color: '#FFCE56', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    ];

    const data = [
        { word: 'Akoy kay estudyante', response: 'Response 1' },
        { word: 'Word 2', response: 'Response 2' },
        { word: 'Word 3', response: 'Response 3' },
        { word: 'Word 4', response: 'Response 4' },
    ];

    const [isToggled, setIsToggled] = useState(false);
    const animatedPosition = useRef(new Animated.Value(0)).current;

    const handleToggle = () => {
        setIsToggled((prevState) => !prevState);

        Animated.timing(animatedPosition, {
            toValue: isToggled ? 0 : 20,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

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

                        {/* Table Header */}
                        <View className="flex-row mb-4">
                            <Text className="flex-1 font-bold text-black text-base text-center">Word</Text>
                            <Text className="flex-1 font-bold text-black text-base text-center">Response</Text>
                        </View>

                        {/* Table Rows */}
                        {data.map((item, index) => (
                            <View key={index} className="flex-row mb-2">
                                <Text className="flex-1 text-base text-black text-center">{item.word}</Text>
                                <Text className="flex-1 text-base text-black text-center">{item.response}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};
export default History;