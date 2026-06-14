export function decodeJwt(token: string): any {
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}
