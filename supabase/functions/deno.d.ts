// Déclaration des types pour Deno
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): { [key: string]: string };
  }
  
  export const env: Env;
}

// Pour les modules importés via URLs
declare module "http/server" {
  export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}

declare module "../_shared/cors.ts" {
  export const corsHeaders: Record<string, string>;
}

// Declare external modules used in Supabase Edge Functions
declare module "https://esm.sh/@supabase/supabase-js@2.38.4" {
  export * from "@supabase/supabase-js";
}

declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response>): void;
} 