import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

const API_BASE = "http://localhost:5000";

/**
 * Registers a new passkey for the currently logged-in user.
 * Must be called with a valid JWT in localStorage ("authToken").
 *
 * @returns {{ success: boolean, message: string }}
 */
export const registerPasskey = async () => {
    const token = localStorage.getItem("authToken");

    // 1️⃣ Fetch registration options from the server
    const optionsRes = await fetch(`${API_BASE}/auth/passkey/register-options`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!optionsRes.ok) {
        const err = await optionsRes.json();
        return { success: false, message: err.message || "Failed to get options" };
    }

    const options = await optionsRes.json();

    // 2️⃣ Trigger the browser's native passkey prompt (Touch ID / Face ID / PIN)
    let registrationResponse;
    try {
        registrationResponse = await startRegistration({ optionsJSON: options });
    } catch (err) {
        // User cancelled or browser doesn't support it
        return { success: false, message: err.message || "Passkey registration cancelled" };
    }

    // 3️⃣ Send the signed response to the server to verify and save
    const verifyRes = await fetch(`${API_BASE}/auth/passkey/register-verify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registrationResponse),
    });

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
        return { success: false, message: verifyData.message || "Verification failed" };
    }

    return { success: true, message: verifyData.message || "Passkey registered!" };
};

/**
 * Authenticates using a saved passkey for the given email.
 * On success, stores the JWT and returns user data.
 *
 * @param {string} email - The user's email address
 * @returns {{ success: boolean, data?: { token, user }, message?: string }}
 */
export const loginWithPasskey = async (email) => {
    // 1️⃣ Fetch authentication options (challenge + allowed credentials)
    const optionsRes = await fetch(
        `${API_BASE}/auth/passkey/login-options?email=${encodeURIComponent(email)}`
    );

    if (!optionsRes.ok) {
        const err = await optionsRes.json();
        return { success: false, message: err.message || "No passkey found for this account" };
    }

    const { userId, ...options } = await optionsRes.json();

    // 2️⃣ Trigger the browser's native passkey picker
    let authResponse;
    try {
        authResponse = await startAuthentication({ optionsJSON: options });
    } catch (err) {
        return { success: false, message: err.message || "Passkey authentication cancelled" };
    }

    // 3️⃣ Verify the assertion on the server and receive a JWT
    const verifyRes = await fetch(`${API_BASE}/auth/passkey/login-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...authResponse }),
    });

    const data = await verifyRes.json();
    if (!verifyRes.ok) {
        return { success: false, message: data.message || "Passkey login failed" };
    }

    // 4️⃣ Store token (same pattern as password login)
    localStorage.setItem("authToken", data.token);

    return { success: true, data };
};
