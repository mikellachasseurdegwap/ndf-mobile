import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_dev')
export async function sendEmailSoumission(
  reportId: string,
  membreNom: string,
  montantTotal: number
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: process.env.EMAIL_TRESORIER!,
    subject: `Nouvelle note de frais — ${membreNom}`,
    html: `
      <h2>Nouvelle note de frais soumise</h2>
      <p><strong>Membre :</strong> ${membreNom}</p>
      <p><strong>Montant total :</strong> ${montantTotal.toFixed(2)} €</p>
      <p><strong>Référence :</strong> ${reportId}</p>
      <p>Connectez-vous à l'interface admin pour valider ou rejeter.</p>
    `,
  })
}

export async function sendEmailConfirmationSoumission(
  membreEmail: string,
  membreNom: string,
  reportId: string,
  montantTotal: number
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: membreEmail,
    subject: `Votre note de frais a été reçue`,
    html: `
      <h2>Note de frais reçue</h2>
      <p>Bonjour ${membreNom},</p>
      <p>Votre note de frais a bien été transmise.</p>
      <p><strong>Référence :</strong> ${reportId}</p>
      <p><strong>Montant total :</strong> ${montantTotal.toFixed(2)} €</p>
      <p>Le trésorier va traiter votre demande.</p>
    `,
  })
}

export async function sendEmailValidation(
  membreEmail: string,
  membreNom: string,
  reportId: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: membreEmail,
    subject: `Votre note de frais a été validée`,
    html: `
      <h2>Note de frais validée</h2>
      <p>Bonjour ${membreNom},</p>
      <p>Votre note de frais (réf. ${reportId}) a été validée par le trésorier.</p>
      <p>Le remboursement sera effectué prochainement.</p>
    `,
  })
}

export async function sendEmailResetPassword(email: string, resetUrl: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: 'Réinitialisation de votre mot de passe — FFS/EFS',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #4a5c14;">Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous (lien valable <strong>1 heure</strong>) :</p>
        <a href="${resetUrl}" style="display:inline-block;background:#A6C630;color:#1a2e0a;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Réinitialiser mon mot de passe
        </a>
        <p style="font-size:12px;color:#888;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  })
}

export async function sendEmailRejet(
  membreEmail: string,
  membreNom: string,
  reportId: string,
  commentaire: string
) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: membreEmail,
    subject: `Votre note de frais a été rejetée`,
    html: `
      <h2>Note de frais rejetée</h2>
      <p>Bonjour ${membreNom},</p>
      <p>Votre note de frais (réf. ${reportId}) a été rejetée.</p>
      <p><strong>Motif :</strong> ${commentaire}</p>
      <p>Contactez le trésorier pour plus d'informations.</p>
    `,
  })
}
