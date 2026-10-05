import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";

export default async function NewCoursePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  async function createCourse(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const priceStr = formData.get("price") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!title) {
      throw new Error("Le titre du cours est obligatoire.");
    }

    const price = priceStr && parseFloat(priceStr) > 0 ? parseFloat(priceStr) : null;

    const newCourse = await prisma.course.create({
      data: {
        title,
        categoryId: categoryId || null,
        price,
        description: description || null,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
        instructorId: userId,
        isPublished: false, // Starts as draft
      }
    });

    // Create a first default chapter
    await prisma.chapter.create({
      data: {
        title: "Chapitre 1 : Introduction",
        position: 1,
        courseId: newCourse.id,
      }
    });

    redirect(`/instructor/courses/${newCourse.id}`);
  }

  return (
    <div style={{ maxWidth: "750px", margin: "0 auto" }}>
      {/* Back button */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link 
          href="/instructor" 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Retour aux formations
        </Link>
      </div>

      <div className="glass" style={{ padding: "2.5rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>
          Créer un Nouveau Cours
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "2rem" }}>
          Définissez les informations générales de votre cours. Vous pourrez ensuite organiser vos chapitres et ajouter vos vidéos.
        </p>

        <form action={createCourse} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
              Titre du cours *
            </label>
            <input 
              type="text" 
              name="title" 
              required
              placeholder="Ex: Masterclass Pâtisserie Fine et Viennoiseries" 
              className="input-field" 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
                Niveau Académique / Catégorie *
              </label>
              <select 
                name="categoryId" 
                required 
                className="input-field"
                style={{ cursor: "pointer" }}
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ background: "#1c1c1e", color: "white" }}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
                Prix en Dinar Algérien (DZD)
              </label>
              <input 
                type="number" 
                name="price" 
                placeholder="Ex: 3500 (Laissez vide si gratuit)" 
                min="0"
                step="100"
                className="input-field" 
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
              Description détaillée du cours
            </label>
            <textarea 
              name="description" 
              rows={4}
              placeholder="Présentez les objectifs d'apprentissage, le public visé et les compétences qui seront acquises..." 
              className="input-field"
              style={{ resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
              Photo de couverture du cours
            </label>
            <ImageUploadDropzone name="imageUrl" />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href="/instructor" className="btn btn-secondary" style={{ padding: "0.75rem 1.5rem" }}>
              Annuler
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ 
                padding: "0.75rem 2rem", 
                background: "var(--gradient-orange)",
                boxShadow: "0 4px 14px rgba(254,145,0,0.3)"
              }}
            >
              Créer et configurer le programme →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
