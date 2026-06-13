import { View, Text } from "react-native";



export default function Card({title, icon, value, color}: {title: string, icon: React.ReactNode, value: string, color: string}) {
 return (
    <View style={{ backgroundColor: color}} className="rounded-3xl px-6 py-8">
        <View className="flex-row items-center gap-2 mb-2">
          {icon}
          <Text className="text-xl font-semibold text-white">{title}</Text>
        </View>
        <Text className="text-5xl font-bold text-white mt-2">{value}</Text>
      </View>
 )
}