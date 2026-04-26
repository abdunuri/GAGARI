export function getLoginRedirectUrl() {
    const baseUrl = process.env["BETTER_AUTH_URL"];
    return baseUrl ? `${baseUrl.replace(/\/$/, "")}/login` : "/login";
}

export function parseBakeryId(bakeryId: string | number | null | undefined) {
    const parsed = Number(bakeryId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}