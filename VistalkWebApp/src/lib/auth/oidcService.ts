// src/lib/oidcService.ts
import { UserManager, User } from 'oidc-client-ts';
import oidcConfig from './oidcConfig';
import { goto } from '$app/navigation';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { browser } from '$app/environment';
import type {LoggedInUser} from'../../types/types';

export type CustomJwtPayload = JwtPayload & LoggedInUser;
const TOKEN_KEY = 'authToken';
const USER_KEY = 'loggedInUser';

const oidcClient = new UserManager(oidcConfig);

export async function signIn(keepExistingUrl: boolean = true): Promise<void> {
	if (keepExistingUrl && browser) {
		window.sessionStorage.setItem('redirectUrl', window.location.href);
	}
	await oidcClient.signinRedirect();
}

export async function signOut(): Promise<void> {
	await oidcClient.signoutRedirect();
}

export async function getUser(): Promise<User | null> {
	const user = await oidcClient.getUser();
	return user;
}

export async function getLoggedInUser(): Promise<LoggedInUser | null> {
    const token = getTokenFromLocalStorage();
    if (!token) return null;
    
    try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decodedToken.exp && decodedToken.exp < currentTime) {
            clearLocalStorage();
            return null;
        }

        const user: LoggedInUser = {
            name: decodedToken.sub,
            token
        };
        
        return user;
    } catch {
        clearLocalStorage();
        return null;
    }
}

export async function handleCallback(): Promise<void> {
	try {
		await oidcClient.signinRedirectCallback();
		if (browser) {
			const redirectUrl = window.sessionStorage.getItem(`redirectUrl`);
			if (redirectUrl) {
				window.sessionStorage.removeItem(`redirectUrl`);
				goto(redirectUrl);
				return;
			}
		}
		goto('/');
	} catch (error) {
		console.error('Error processing callback:', error);
	}
}

export { oidcConfig, oidcClient };

export function getTokenFromLocalStorage(): string | null {
    if (!browser) return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function getUserFromLocalStorage(): LoggedInUser | null {
    if (!browser) return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
}

export function saveTokenToLocalStorage(token: string): void {
    if (browser) {
        localStorage.setItem(TOKEN_KEY, token);
    }
}

export function saveUserToLocalStorage(user: LoggedInUser): void {
    if (browser) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export function clearLocalStorage(): void {
    if (browser) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
}