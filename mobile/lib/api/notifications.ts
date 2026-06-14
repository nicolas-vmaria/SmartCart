import api from "../apiConfig";

export function savePushToken(token: string) {
    return api.post("/admin/push-token", { token });
}
