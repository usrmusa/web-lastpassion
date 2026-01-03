/**
 * AuthViewModel.js
 * Mimics Android's ViewModel for Auth logic.
 */
import { AuthService, db, COLLECTIONS } from '../core/FirebaseService.js';
import { doc, getDoc, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export class AuthViewModel {
    constructor(isRegistration = false) {
        this.authService = AuthService;
        this.isRegistration = isRegistration;
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            name: '',
            username: '',
            loading: false,
            error: null,
            isValid: false
        };
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
        callback(this.state);
    }

    notify() {
        this.listeners.forEach(callback => callback(this.state));
    }

    updateField(field, value) {
        if (field === 'username') {
            this.state[field] = value.toLowerCase().replace(/\s+/g, '');
        } else {
            this.state[field] = value;
        }
        this.validate();
        this.notify();
    }

    validate() {
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.email);
        const isPasswordValid = this.state.password.length >= 6;
        
        // Registration specific validation
        const isNameValid = this.isRegistration ? this.state.name.trim().length > 0 : true;
        const isUsernameValid = this.isRegistration ? /^[a-z0-9_]{3,15}$/.test(this.state.username) : true;
        const passwordsMatch = this.isRegistration ? this.state.password === this.state.confirmPassword : true;

        this.state.isValid = isEmailValid && isPasswordValid && isNameValid && isUsernameValid && passwordsMatch;
        
        // Optionally set an error if they don't match and confirmPassword is not empty
        if (this.isRegistration && this.state.confirmPassword.length > 0 && this.state.password !== this.state.confirmPassword) {
            this.state.error = "Passwords do not match";
        } else if (this.state.error === "Passwords do not match") {
            this.state.error = null;
        }
    }

    async login() {
        if (!this.state.isValid) return;
        this.setLoading(true);

        try {
            await this.authService.signIn(this.state.email, this.state.password);
            return { success: true };
        } catch (error) {
            this.setError(this.mapError(error.code));
            return { success: false };
        }
    }

    async register() {
        if (!this.state.isValid) return;
        this.setLoading(true);

        const username = this.state.username.toLowerCase().trim();

        try {
            // Check if username exists FIRST before creating Auth account
            // This is safer than doing it inside the transaction after Auth creation
            const usernameRef = doc(db, COLLECTIONS.USERNAMES, username);
            const usernameDoc = await getDoc(usernameRef);
            if (usernameDoc.exists()) {
                this.setError("This username is already taken. Try another.");
                return { success: false };
            }

            // 1. Create Auth Account
            // Firebase will automatically throw 'auth/email-already-in-use' if email exists
            const userCredential = await this.authService.signUp(
                this.state.email, 
                this.state.password, 
                this.state.name
            );
            const uid = userCredential.user.uid;

            // 2. Claim Username and Create Profile in a transaction
            await runTransaction(db, async (transaction) => {
                const txUsernameRef = doc(db, COLLECTIONS.USERNAMES, username);
                const txUserRef = doc(db, COLLECTIONS.USERS, uid);

                // Double check in transaction to be absolutely sure
                const txUsernameDoc = await transaction.get(txUsernameRef);
                if (txUsernameDoc.exists()) {
                    throw new Error("USERNAME_TAKEN");
                }

                transaction.set(txUsernameRef, {
                    uid: uid,
                    claimedAt: new Date()
                });

                transaction.set(txUserRef, {
                    displayName: this.state.name,
                    username: username,
                    email: this.state.email,
                    createdAt: new Date(),
                    roles: {
                        lastpassion: { isAdmin: false }
                    }
                });
            });

            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            
            // Map the specific Firebase error for existing email
            if (error.code === 'auth/email-already-in-use') {
                this.setError("This email address is already registered.");
            } else if (error.message === "USERNAME_TAKEN") {
                this.setError("This username is already taken. Try another.");
            } else {
                this.setError(this.mapError(error.code));
            }
            return { success: false };
        }
    }

    setLoading(isLoading) {
        this.state.loading = isLoading;
        this.state.error = null;
        this.notify();
    }

    setError(message) {
        this.state.error = message;
        this.state.loading = false;
        this.notify();
    }

    mapError(code) {
        switch (code) {
            case 'auth/user-not-found': return 'Account not found.';
            case 'auth/wrong-password': return 'Incorrect password.';
            case 'auth/email-already-in-use': return 'This email address is already registered.';
            case 'auth/weak-password': return 'Password is too weak.';
            case 'auth/invalid-credential': return 'Invalid details.';
            default: return 'An error occurred. Please try again.';
        }
    }
}
