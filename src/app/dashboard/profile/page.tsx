import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { ALGERIAN_WILAYAS } from "@/lib/constants";
import { TeacherApplicationSection } from "@/components/TeacherApplicationSection";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      wilaya: true,
      role: true,
      image: true,
      isTwoFactorEnabled: true,
      emailVerified: true,
      createdAt: true,
      instructorApplication: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  async function updateProfile(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const wilaya = formData.get("wilaya") as string;

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        wilaya: wilaya || undefined,
      }
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
  }

  async function toggleTwoFactor() {
    "use server";
    await prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: !user?.isTwoFactorEnabled,
      },
    });

    revalidatePath("/dashboard/profile");
  }

  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
          Mon Profil
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Gérez vos informations personnelles et vos préférences de sécurité.
        </p>
      </header>

      {/* Profile Overview Card */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar Circle */}
          <div 
            style={{ 
              position: 'relative',
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              overflow: 'hidden',
              background: 'var(--gradient-blue)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'white',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            {user.image ? (
              <Image src={user.image} alt="Avatar" fill style={{ objectFit: 'cover' }} />
            ) : user.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              "U"
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'white', margin: 0 }}>
                {user.name}
              </h2>
              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '9999px', 
                  background: 'rgba(0,160,220,0.15)', 
                  color: 'var(--brand-blue)', 
                  border: '1px solid rgba(0,160,220,0.3)' 
                }}
              >
                {user.role === "INSTRUCTOR" ? "Instructeur" : user.role === "ADMIN" ? "Administrateur" : "Étudiant"}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{user.email}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#34d399', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Compte vérifié par e-mail
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security & 2FA Settings Card */}
      <div 
        className="glass" 
        style={{ 
          padding: '1.75rem 2rem', 
          borderRadius: '1rem', 
          border: '1px solid rgba(0,160,220,0.25)', 
          background: 'linear-gradient(135deg, rgba(0,160,220,0.06) 0%, rgba(0,0,0,0.3) 100%)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div style={{ maxWidth: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--brand-green)" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', margin: 0 }}>
              Double Authentification (2FA par e-mail)
            </h3>
            <span 
              style={{ 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                padding: '0.15rem 0.5rem', 
                borderRadius: '9999px',
                background: user.isTwoFactorEnabled ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.08)',
                color: user.isTwoFactorEnabled ? '#34d399' : 'var(--text-muted)',
                border: `1px solid ${user.isTwoFactorEnabled ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.15)'}`
              }}
            >
              {user.isTwoFactorEnabled ? "Activé" : "Désactivé"}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, lineHeight: 1.4 }}>
            {user.isTwoFactorEnabled 
              ? "Un code de sécurité à 6 chiffres vous sera envoyé par e-mail à chaque connexion pour protéger votre compte." 
              : "Ajoutez une couche de sécurité supplémentaire : recevez un code par e-mail pour confirmer chaque connexion."}
          </p>
        </div>

        <form action={toggleTwoFactor}>
          <button 
            type="submit" 
            className={`btn ${user.isTwoFactorEnabled ? 'btn-outline' : 'btn-primary'}`}
            style={{ 
              padding: '0.65rem 1.25rem',
              fontSize: '0.88rem',
              whiteSpace: 'nowrap',
              borderColor: user.isTwoFactorEnabled ? 'rgba(239,68,68,0.4)' : undefined,
              color: user.isTwoFactorEnabled ? '#ef4444' : undefined,
            }}
          >
            {user.isTwoFactorEnabled ? "Désactiver le 2FA" : "Activer le 2FA"}
          </button>
        </form>
      </div>

      {/* Teacher Application Section for Students */}
      {user.role === "STUDENT" && (
        <TeacherApplicationSection 
          initialApplication={user.instructorApplication} 
          user={user} 
        />
      )}

      {user.role === "INSTRUCTOR" && (
        <div 
          className="glass" 
          style={{ 
            padding: '1.5rem 2rem', 
            borderRadius: '1rem', 
            border: '1px solid rgba(0,160,220,0.3)', 
            background: 'rgba(0,160,220,0.06)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 0.25rem 0' }}>
              Studio Formateur Actif
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Gérez vos programmes pédagogiques, téléversez vos vidéos et suivez vos inscriptions.
            </p>
          </div>
          <Link 
            href="/instructor" 
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', background: 'var(--gradient-orange)' }}
          >
            Accéder au Studio Instructeur →
          </Link>
        </div>
      )}

      {user.role === "ADMIN" && (
        <div 
          className="glass" 
          style={{ 
            padding: '1.5rem 2rem', 
            borderRadius: '1rem', 
            border: '1px solid rgba(168,85,247,0.3)', 
            background: 'rgba(168,85,247,0.08)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: '0 0 0.25rem 0' }}>
              Panneau d'Administration
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Vous disposez des privilèges super-administrateur pour modérer les cours et gérer les utilisateurs.
            </p>
          </div>
          <Link 
            href="/admin" 
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)' }}
          >
            Accéder au Panneau Admin →
          </Link>
        </div>
      )}

      {/* Edit Form */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          Modifier mes informations
        </h3>

        <form action={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5e7eb' }}>
              Nom et Prénom
            </label>
            <input 
              type="text" 
              name="name" 
              defaultValue={user.name || ""} 
              required
              className="input-field" 
              placeholder="Votre nom complet"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5e7eb' }}>
              Adresse E-mail (Non modifiable)
            </label>
            <input 
              type="email" 
              disabled 
              value={user.email || ""} 
              className="input-field" 
              style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'rgba(255,255,255,0.03)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5e7eb' }}>
                Numéro de Téléphone
              </label>
              <input 
                type="tel" 
                name="phone" 
                defaultValue={user.phone || ""} 
                className="input-field" 
                placeholder="Ex: 0555123456"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5e7eb' }}>
                Wilaya
              </label>
              <select 
                name="wilaya" 
                defaultValue={user.wilaya || ""} 
                className="input-field"
                style={{ cursor: 'pointer' }}
              >
                <option value="">Sélectionnez votre Wilaya</option>
                {ALGERIAN_WILAYAS.map((w) => (
                  <option key={w} value={w} style={{ background: '#1c1c1e', color: 'white' }}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
