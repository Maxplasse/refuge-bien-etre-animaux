// Follow this setup guide to integrate the Deno runtime and send emails with your Supabase project: https://supabase.com/docs/guides/functions/integrations/resend

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const resendApiKey = Deno.env.get('RESEND_API_KEY') || ''

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey || !resendApiKey) {
  console.error("Variables d'environnement manquantes. Assurez-vous que SUPABASE_URL, SUPABASE_ANON_KEY et RESEND_API_KEY sont définis.")
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour le CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérifier l'authentification (assurez-vous que c'est une requête autorisée)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Extraire le JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Créer un client Supabase avec le token d'administrateur
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    
    // Extraire les données de l'utilisateur du corps de la requête
    const { email, nom, prenom, temporaryPassword, role } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Envoyer l'email via Resend
    const resendUrl = 'https://api.resend.com/emails'
    const response = await fetch(resendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Refuge Bien-Être Animaux <no-reply@votredomaine.com>',
        to: email,
        subject: 'Bienvenue sur la plateforme Refuge Bien-Être Animaux',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #7c3aed;">Bienvenue sur la plateforme Refuge Bien-Être Animaux</h1>
            <p>Bonjour ${prenom || ''} ${nom || ''},</p>
            <p>Un compte a été créé pour vous sur la plateforme de gestion du Refuge Bien-Être Animaux.</p>
            <p><strong>Votre rôle</strong>: ${role || 'Utilisateur'}</p>
            ${temporaryPassword ? `<p><strong>Votre mot de passe temporaire</strong>: ${temporaryPassword}</p>` : ''}
            <p>Lors de votre première connexion, il vous sera demandé de modifier ce mot de passe temporaire.</p>
            <p>Vous pouvez vous connecter en cliquant sur le lien suivant:</p>
            <p><a href="${supabaseUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Accéder à la plateforme</a></p>
            <p>Si vous avez des questions, n'hésitez pas à contacter l'administrateur du refuge.</p>
            <p>Cordialement,<br>L'équipe du Refuge Bien-Être Animaux</p>
          </div>
        `,
      }),
    })
    
    const result = await response.json()
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 