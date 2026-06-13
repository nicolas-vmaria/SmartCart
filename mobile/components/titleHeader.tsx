import { View, Text } from "react-native";

export default  function TitleHeader({ title, subtitle }: {title: string, subtitle: string}){
    return (
        <View className="mb-6">
            <Text className="text-4xl font-bold">{title}</Text>
            <Text className="text-sm text-gray-500">{subtitle}</Text>
        </View>
    )
}