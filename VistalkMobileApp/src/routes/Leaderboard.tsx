import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import BackIcon from '../assets/svg/BackIcon';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import Svg, { Path } from 'react-native-svg';
import CrownIcon from '../assets/svg/CrownIcon';


type Props = StackScreenProps<RootStackParamList, 'Leaderboard'>;

const Leaderboard: React.FC<Props> = ({ navigation }) => {

    const scores = { first: 10000, second: 5000, third: 2000 };

    // Animation values for each bar
    const firstPlaceHeight = useRef(new Animated.Value(0)).current;
    const secondPlaceHeight = useRef(new Animated.Value(0)).current;
    const thirdPlaceHeight = useRef(new Animated.Value(0)).current;

    // Maximum height for the bars based on the highest score
    const maxHeight = 200; // Set max height for 1st place
    const getBarHeight = (score: number) => (score / scores.first) * maxHeight;

    useEffect(() => {
        // Animate each bar to its corresponding height based on the score
        Animated.parallel([
            Animated.timing(firstPlaceHeight, {
                toValue: getBarHeight(scores.first),
                duration: 1000,
                useNativeDriver: false,
            }),
            Animated.timing(secondPlaceHeight, {
                toValue: getBarHeight(scores.second),
                duration: 1000,
                useNativeDriver: false,
            }),
            Animated.timing(thirdPlaceHeight, {
                toValue: getBarHeight(scores.third),
                duration: 1000,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    return (
        <LinearGradient colors={['#6addd0', '#f7c188']} className="flex-1 justify-center items-center resize-cover">
            <TouchableOpacity className="absolute top-8 left-4" onPress={() => navigation.navigate('Dashboard')}>
                <BackIcon className="h-8 w-8 text-white" />
            </TouchableOpacity>
            <View className="flex-1 top-8">
                <Text className="text-white text-3xl font-black text-center">Leaderboard</Text>
                <View className="flex-1 flex-row gap-x-10 mt-8 flex-wrap w-full items-center">
                    <TouchableOpacity>
                        <Text className="text-lg text-black font-bold bg-white px-5 py-2 rounded-2xl">Weekly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text className="text-lg font-bold">All Time</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-row items-end justify-center space-x-4 mt-10">
                {/* Second Place */}
                <View className="items-center">
                    <Svg width="40" height="40" viewBox="0 0 1792 1792">
                        <Path fill="black" d="M1523 1339q-22-155-87.5-257.5T1251 963q-67 74-159.5 115.5T896 1120t-195.5-41.5T541 963q-119 16-184.5 118.5T269 1339q106 150 271 237.5t356 87.5t356-87.5t271-237.5m-243-699q0-159-112.5-271.5T896 256T624.5 368.5T512 640t112.5 271.5T896 1024t271.5-112.5T1280 640m512 256q0 182-71 347.5t-190.5 286T1245 1721t-349 71q-182 0-348-71t-286-191t-191-286T0 896t71-348t191-286T548 71T896 0t348 71t286 191t191 286t71 348" />
                    </Svg>
                    <Text className="text-base text-white font-black">Alena Donin</Text>
                    <Text className="text-base text-black font-bold bg-white px-4 py-2 rounded-2xl mt-2">5,000</Text>
                    <Animated.View style={{ height: secondPlaceHeight }} className="w-20 mt-2 rounded-t-xl overflow-hidden">
                        <LinearGradient colors={['#4B4C4B', '#F8F6F4']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-1 justify-center items-center pt-2">
                            <Text className="text-4xl text-white font-black">2nd</Text>
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* First Place */}
                <View className="items-center">
                    <Svg width="40" height="40" viewBox="0 0 1792 1792">
                        <Path fill="black" d="M1523 1339q-22-155-87.5-257.5T1251 963q-67 74-159.5 115.5T896 1120t-195.5-41.5T541 963q-119 16-184.5 118.5T269 1339q106 150 271 237.5t356 87.5t356-87.5t271-237.5m-243-699q0-159-112.5-271.5T896 256T624.5 368.5T512 640t112.5 271.5T896 1024t271.5-112.5T1280 640m512 256q0 182-71 347.5t-190.5 286T1245 1721t-349 71q-182 0-348-71t-286-191t-191-286T0 896t71-348t191-286T548 71T896 0t348 71t286 191t191 286t71 348" />
                    </Svg>
                    <Text className="text-base text-white font-black">Alena Donin</Text>
                    <Text className="text-base text-black font-bold bg-white px-4 py-2 rounded-2xl mt-2">10,000</Text>
                    <Animated.View style={{ height: firstPlaceHeight }} className="w-24 mt-2 rounded-t-xl overflow-hidden">
                        <LinearGradient colors={['#FFD43B', '#FF8800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-1 justify-center items-center pt-2">
                            <Text className="text-4xl text-white font-black">1st</Text>
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Third Place */}
                <View className="items-center">
                    <Svg width="40" height="40" viewBox="0 0 1792 1792">
                        <Path fill="black" d="M1523 1339q-22-155-87.5-257.5T1251 963q-67 74-159.5 115.5T896 1120t-195.5-41.5T541 963q-119 16-184.5 118.5T269 1339q106 150 271 237.5t356 87.5t356-87.5t271-237.5m-243-699q0-159-112.5-271.5T896 256T624.5 368.5T512 640t112.5 271.5T896 1024t271.5-112.5T1280 640m512 256q0 182-71 347.5t-190.5 286T1245 1721t-349 71q-182 0-348-71t-286-191t-191-286T0 896t71-348t191-286T548 71T896 0t348 71t286 191t191 286t71 348" />
                    </Svg>
                    <Text className="text-base text-white font-black">Alena Donin</Text>
                    <Text className="text-base text-black font-bold bg-white px-4 py-2 rounded-2xl mt-2">2,000</Text>
                    <Animated.View style={{ height: thirdPlaceHeight }} className="w-20 mt-2 rounded-t-xl overflow-hidden">
                        <LinearGradient colors={['#AE5129', '#F9931F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} className="flex-1 justify-center items-center pt-2">
                            <Text className="text-4xl text-white font-black">3rd</Text>
                        </LinearGradient>
                    </Animated.View>
                </View>
            </View>

            <View className="rounded-t-3xl w-full bg-white">
                <View className="px-6 py-2">
                    <View className="flex-row items-center justify-between">
                        <View className="p-2">
                            <Text className="text-black font-black text-base">4th</Text>
                        </View>
                        <View className="p-2">
                            <Svg width="40" height="40" viewBox="0 0 1792 1792" >
                                <Path fill="black" d="M1523 1339q-22-155-87.5-257.5T1251 963q-67 74-159.5 115.5T896 1120t-195.5-41.5T541 963q-119 16-184.5 118.5T269 1339q106 150 271 237.5t356 87.5t356-87.5t271-237.5m-243-699q0-159-112.5-271.5T896 256T624.5 368.5T512 640t112.5 271.5T896 1024t271.5-112.5T1280 640m512 256q0 182-71 347.5t-190.5 286T1245 1721t-349 71q-182 0-348-71t-286-191t-191-286T0 896t71-348t191-286T548 71T896 0t348 71t286 191t191 286t71 348" />
                            </Svg>
                        </View>
                        <View className="flex-col gap-y-1 p-2">
                            <Text className="text-base font-black text-black">Aldrich Batisla-on</Text>
                            <Text className="text-base font-bold text-[#858494]">1,149</Text>
                        </View>
                        <View className="p-2">
                            <CrownIcon className="h-8 w-8" />
                        </View>
                    </View>
                </View>
                <View className="border-t border-black mx-6"></View>
                <View className="px-6 py-2">
                    <View className="flex-row items-center justify-between">
                        <View className="p-2">
                            <Text className="text-black font-black text-base">5th</Text>
                        </View>
                        <View className="p-2">
                            <Svg width="40" height="40" viewBox="0 0 1792 1792" >
                                <Path fill="black" d="M1523 1339q-22-155-87.5-257.5T1251 963q-67 74-159.5 115.5T896 1120t-195.5-41.5T541 963q-119 16-184.5 118.5T269 1339q106 150 271 237.5t356 87.5t356-87.5t271-237.5m-243-699q0-159-112.5-271.5T896 256T624.5 368.5T512 640t112.5 271.5T896 1024t271.5-112.5T1280 640m512 256q0 182-71 347.5t-190.5 286T1245 1721t-349 71q-182 0-348-71t-286-191t-191-286T0 896t71-348t191-286T548 71T896 0t348 71t286 191t191 286t71 348" />
                            </Svg>
                        </View>
                        <View className="flex-col gap-y-1 p-2">
                            <Text className="text-base font-black text-black">Aldrich Batisla-on</Text>
                            <Text className="text-base font-bold text-[#858494]">1,149</Text>
                        </View>
                        <View className="p-2">
                            <CrownIcon className="h-8 w-8" />
                        </View>
                    </View>
                </View>
                <LinearGradient colors={['#6addd0', '#f7c188']} /* start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }} */ className="rounded-t-3xl w-full">
                    {/* <View className="rounded-t-3xl w-full bg-[#f7c188]"> */}
                    <View className="px-6 py-2">
                        <View className="flex-row items-center justify-between">
                            <View className="p-2">
                                <Text className="text-black font-black text-base">110</Text>
                            </View>
                            <View className="p-2">
                                <Svg width="40" height="40" viewBox="0 0 1792 1792" >
                                    <Path fill="black" d="M1523 1339q-22-155-87.5-257.5T1251 963q-67 74-159.5 115.5T896 1120t-195.5-41.5T541 963q-119 16-184.5 118.5T269 1339q106 150 271 237.5t356 87.5t356-87.5t271-237.5m-243-699q0-159-112.5-271.5T896 256T624.5 368.5T512 640t112.5 271.5T896 1024t271.5-112.5T1280 640m512 256q0 182-71 347.5t-190.5 286T1245 1721t-349 71q-182 0-348-71t-286-191t-191-286T0 896t71-348t191-286T548 71T896 0t348 71t286 191t191 286t71 348" />
                                </Svg>
                            </View>
                            <View className="flex-col gap-y-1 p-2">
                                <Text className="text-base font-black text-black">Aldrich Batisla-on</Text>
                                <Text className="text-base font-bold text-[#858494]">1,149</Text>
                            </View>
                            <View className="p-2">
                                <CrownIcon className="h-8 w-8" />
                            </View>
                        </View>
                    </View>
                    {/* </View> */}
                </LinearGradient>
            </View>
        </LinearGradient>
    );
};

export default Leaderboard;