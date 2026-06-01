import type { Session, User } from "@supabase/supabase-js";

export type RegisterInput = {
    email: string;
    password: string;
    username: string;
    fullName: string;
};

export type LoginInput = {
    email: string;
    password: string; 
};

export type ProfileRow = {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    email_2fa_enabled: boolean;
    created_at: string;
    updated_at: string; 
};

export type AuthState = {
    session: Session | null;
    user: User | null;
}
