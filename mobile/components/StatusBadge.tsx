import { View, Text } from "react-native";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    aguardando: { bg: "#FEF9C3", text: "#854D0E", label: "Aguardando" },
    pago:       { bg: "#DBEAFE", text: "#1E40AF", label: "Pago" },
    enviado:    { bg: "#EDE9FE", text: "#5B21B6", label: "Enviado" },
    entregue:   { bg: "#DCFCE7", text: "#166534", label: "Entregue" },
    cancelado:  { bg: "#FEE2E2", text: "#991B1B", label: "Cancelado" },
    ativo:      { bg: "#DCFCE7", text: "#166534", label: "Ativo" },
    inativo:    { bg: "#F3F4F6", text: "#6B7280", label: "Inativo" },
};

export default function StatusBadge({ status }: { status: string }) {
    const key = typeof status === "string" ? status.toLowerCase() : "";
    const config = statusConfig[key] ?? { bg: "#F3F4F6", text: "#6B7280", label: String(status ?? "—") };
    return (
        <View style={{ backgroundColor: config.bg }} className="px-2 py-1 rounded-full">
            <Text style={{ color: config.text }} className="text-xs font-semibold">{config.label}</Text>
        </View>
    );
}
