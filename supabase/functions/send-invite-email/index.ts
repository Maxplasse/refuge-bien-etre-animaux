import { serve } from "http/server"
import { corsHeaders } from '../_shared/cors.ts'

// URL et clé Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Variables d'environnement manquantes. Assurez-vous que SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont définis.")
}

// Fonction pour générer un template HTML pour l'email
function generateHtmlTemplate(prenom: string, nom: string, role: string, temporaryPassword: string, supabaseUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">Bienvenue sur la plateforme Arche de Ringo</h1>
      <p>Bonjour ${prenom || ''} ${nom || ''},</p>
      <p>Un compte a été créé pour vous sur la plateforme de gestion Arche de Ringo.</p>
      <p><strong>Votre rôle</strong>: ${role || 'Utilisateur'}</p>
      ${temporaryPassword ? `<p><strong>Votre mot de passe temporaire</strong>: ${temporaryPassword}</p>` : ''}
      <p>Lors de votre première connexion, il vous sera demandé de modifier ce mot de passe temporaire.</p>
      <p>Vous pouvez vous connecter en cliquant sur le lien suivant:</p>
      <p><a href="${supabaseUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Accéder à la plateforme</a></p>
      <p>Si vous avez des questions, n'hésitez pas à contacter l'administrateur du système.</p>
      <p>Cordialement,<br>L'équipe Arche de Ringo</p>
    </div>
  `
}

serve(async (req) => {
  // Cette ligne est essentielle pour permettre les requêtes cross-origin
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extraire les données du corps de la requête
    const { email, subject, nom, prenom, temporaryPassword, role } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email requis' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Générer le contenu HTML de l'email
    const htmlContent = generateHtmlTemplate(prenom, nom, role, temporaryPassword, supabaseUrl)

    // Appeler l'API Supabase directement avec la clé de service
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email,
        type: 'invite',
        template_values: {
          site_name: 'Arche de Ringo',
          subject: subject || 'Bienvenue sur la plateforme Arche de Ringo',
          custom_html: htmlContent
        }
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Erreur API Supabase:', result)
      return new Response(
        JSON.stringify({ error: result.message || 'Erreur lors de l\'envoi de l\'email' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }
    
    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
}) 