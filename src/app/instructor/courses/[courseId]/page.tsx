import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { ImageUploadDropzone } from "@/components/ImageUploadDropzone";
import { VideoUploadInput } from "@/components/VideoUploadInput";
import { isCoursePendingReview, submitCourseForReview, cancelCourseReview } from "@/lib/courseReview";

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const resolvedParams = await params;
  const courseId = resolvedParams.courseId;

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: true,
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      },
      enrollments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Security check: only course owner or admin can edit
  if (course.instructorId !== userId && userRole !== "ADMIN") {
    redirect("/instructor");
  }

  const isPending = await isCoursePendingReview(courseId);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // --- SERVER ACTIONS ---

  async function updateCourseInfo(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const categoryId = formData.get("categoryId") as string;
    const priceStr = formData.get("price") as string;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;

    const current = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true, price: true },
    });

    // If published, protect the price from change
    const price = current?.isPublished 
      ? current.price 
      : (priceStr && parseFloat(priceStr) > 0 ? parseFloat(priceStr) : null);

    await prisma.course.update({
      where: { id: courseId },
      data: {
        title: title || undefined,
        categoryId: categoryId || null,
        price,
        description: description || null,
        imageUrl: imageUrl || undefined,
      },
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/courses`);
  }

  async function submitForReview() {
    "use server";
    await submitCourseForReview(courseId);
    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/admin/courses`);
  }

  async function cancelReview() {
    "use server";
    await cancelCourseReview(courseId);
    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/admin/courses`);
  }

  async function togglePublish() {
    "use server";
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    // Only Admin can directly publish/unpublish
    if (role !== "ADMIN") {
      throw new Error("Seul un administrateur peut directement publier un cours.");
    }

    const current = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true },
    });
    if (!current) return;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished: !current.isPublished,
      },
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/instructor`);
    revalidatePath(`/courses`);
    revalidatePath(`/admin/courses`);
  }

  async function addChapter(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    if (!title) return;

    const count = await prisma.chapter.count({ where: { courseId } });

    await prisma.chapter.create({
      data: {
        title,
        position: count + 1,
        courseId,
      },
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}/learn`);
  }

  async function deleteChapter(formData: FormData) {
    "use server";
    const chapterId = formData.get("chapterId") as string;
    if (!chapterId) return;

    const current = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true },
    });

    if (current?.isPublished) {
      throw new Error("Impossible de supprimer un chapitre d'une formation déjà en ligne.");
    }

    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}/learn`);
  }

  async function addLesson(formData: FormData) {
    "use server";
    const chapterId = formData.get("chapterId") as string;
    const title = formData.get("title") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const description = formData.get("description") as string;
    const isFree = formData.get("isFree") === "on";

    if (!title || !chapterId) return;

    const count = await prisma.lesson.count({ where: { chapterId } });

    await prisma.lesson.create({
      data: {
        title,
        videoUrl: videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        description: description || null,
        isFree,
        position: count + 1,
        chapterId,
      },
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}/learn`);
    revalidatePath(`/courses/${courseId}`);
  }

  async function deleteLesson(formData: FormData) {
    "use server";
    const lessonId = formData.get("lessonId") as string;
    if (!lessonId) return;

    const current = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true },
    });

    if (current?.isPublished) {
      throw new Error("Impossible de supprimer une leçon d'une formation déjà en ligne.");
    }

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}/learn`);
  }

  const totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
      {/* Published Course Protection Notice Banner */}
      {course.isPublished && (
        <div 
          style={{ 
            background: "rgba(254, 145, 0, 0.08)", 
            border: "1px solid rgba(254, 145, 0, 0.3)", 
            borderRadius: "0.85rem", 
            padding: "1rem 1.25rem", 
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem"
          }}
        >
          <div style={{ color: "var(--brand-orange)", flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div style={{ fontSize: "0.88rem", lineHeight: 1.4, color: "#fcd34d" }}>
            <strong>Formation en ligne (Approuvée) :</strong> Le tarif et les leçons existantes sont protégés afin de préserver l'accès des étudiants déjà inscrits. Vous pouvez toujours mettre à jour les descriptions ou ajouter de nouveaux chapitres et leçons.
          </div>
        </div>
      )}

      {/* Pending Review Notice Banner */}
      {!course.isPublished && isPending && (
        <div 
          style={{ 
            background: "rgba(254, 145, 0, 0.12)", 
            border: "1px solid rgba(254, 145, 0, 0.4)", 
            borderRadius: "0.85rem", 
            padding: "1rem 1.25rem", 
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.85rem"
          }}
        >
          <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>⏳</div>
          <div style={{ fontSize: "0.88rem", lineHeight: 1.4, color: "#fcd34d" }}>
            <strong>Demande d'approbation en cours d'examen :</strong> Votre formation a été soumise à l'équipe pédagogique et administrative de Level Up DZ. Un administrateur examine vos vidéos et le programme. Dès validation, votre cours sera publié automatiquement dans le catalogue public.
          </div>
        </div>
      )}

      {/* Rejected Course Alert Banner */}
      {course.status === "REJECTED" && (
        <div 
          style={{ 
            background: "rgba(239, 68, 68, 0.12)", 
            border: "1px solid rgba(239, 68, 68, 0.4)", 
            borderRadius: "0.85rem", 
            padding: "1.25rem", 
            marginBottom: "1.75rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.85rem"
          }}
        >
          <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>⚠️</div>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.5, color: "#fca5a5" }}>
            <strong style={{ color: "#ef4444", fontSize: "0.95rem" }}>
              Publication refusée par l'administration :
            </strong>
            <div style={{ marginTop: "0.35rem", color: "white", background: "rgba(0,0,0,0.3)", padding: "0.6rem 0.85rem", borderRadius: "0.5rem", border: "1px solid rgba(239,68,68,0.2)" }}>
              « {course.rejectionReason || "Le contenu ne respecte pas les critères de publication."} »
            </div>
            <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#fca5a5" }}>
              Apportez les modifications nécessaires (vidéos, descriptions, leçons) puis cliquez sur <strong>"🔄 Ressoumettre pour validation admin"</strong> ci-dessus.
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Navigation & Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <Link 
          href="/instructor" 
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Retour au tableau de bord
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link 
            href={`/courses/${course.id}`} 
            target="_blank"
            className="btn btn-outline"
            style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
          >
            Voir la page publique ↗
          </Link>

          {/* Publishing Controls: Admin has direct toggle, Teacher must submit for review */}
          {userRole === "ADMIN" ? (
            <form action={togglePublish}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  fontSize: "0.85rem",
                  padding: "0.5rem 1.25rem",
                  background: course.isPublished ? "#ef4444" : "var(--brand-green)",
                  borderColor: course.isPublished ? "#ef4444" : "var(--brand-green)",
                }}
              >
                {course.isPublished ? "Dépublier le cours" : "✓ Publier le cours (Admin)"}
              </button>
            </form>
          ) : course.isPublished ? (
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#34d399",
                background: "rgba(52,211,153,0.15)",
                border: "1px solid rgba(52,211,153,0.3)",
                padding: "0.45rem 1rem",
                borderRadius: "9999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              ● En ligne (Validé par Admin)
            </span>
          ) : isPending ? (
            <form action={cancelReview}>
              <button
                type="submit"
                className="btn btn-outline"
                style={{
                  fontSize: "0.85rem",
                  padding: "0.5rem 1.25rem",
                  borderColor: "rgba(255,255,255,0.25)",
                  color: "var(--foreground)",
                }}
                title="Annuler la demande et repasser en brouillon"
              >
                ✕ Annuler la soumission
              </button>
            </form>
          ) : (
            <form action={submitForReview}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  fontSize: "0.85rem",
                  padding: "0.5rem 1.25rem",
                  background: "var(--gradient-orange)",
                  boxShadow: "0 4px 14px rgba(254,145,0,0.3)"
                }}
              >
                {course.status === "REJECTED" ? "🔄 Ressoumettre pour validation admin" : "🚀 Soumettre pour validation admin"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Grid: Left is Settings, Right is Curriculum */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem", alignItems: "flex-start" }}>
        
        {/* Left: General Settings */}
        <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: 0 }}>
              Informations Générales
            </h2>
            <span 
              style={{ 
                fontSize: "0.75rem", 
                fontWeight: 700, 
                padding: "0.2rem 0.5rem", 
                borderRadius: "9999px",
                background: course.isPublished 
                  ? "rgba(52,211,153,0.15)" 
                  : isPending 
                  ? "rgba(254,145,0,0.15)" 
                  : course.status === "REJECTED"
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(255,255,255,0.1)",
                color: course.isPublished 
                  ? "#34d399" 
                  : isPending 
                  ? "var(--brand-orange)" 
                  : course.status === "REJECTED"
                  ? "#ef4444"
                  : "var(--text-muted)",
              }}
            >
              {course.isPublished ? "En ligne" : isPending ? "En attente admin" : course.status === "REJECTED" ? "Refusé" : "Brouillon"}
            </span>
          </div>

          <form action={updateCourseInfo} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.3rem", display: "block" }}>
                Titre de la formation
              </label>
              <input 
                type="text" 
                name="title" 
                defaultValue={course.title} 
                required 
                className="input-field" 
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.3rem", display: "block" }}>
                Catégorie / Niveau
              </label>
              <select 
                name="categoryId" 
                defaultValue={course.categoryId || ""} 
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb" }}>
                  Prix en Dinar Algérien (DZD)
                </label>
                {course.isPublished && (
                  <span style={{ fontSize: "0.75rem", color: "var(--brand-orange)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    🔒 Verrouillé
                  </span>
                )}
              </div>

              {course.isPublished ? (
                <>
                  <input 
                    type="number" 
                    defaultValue={course.price || ""} 
                    disabled 
                    className="input-field" 
                    style={{ opacity: 0.65, cursor: "not-allowed", background: "rgba(255,255,255,0.03)" }}
                  />
                  <input type="hidden" name="price" value={course.price || ""} />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                    Le prix est protégé car le cours est en ligne. Dépubliez le cours pour modifier son prix.
                  </p>
                </>
              ) : (
                <input 
                  type="number" 
                  name="price" 
                  defaultValue={course.price || ""} 
                  placeholder="0 (Gratuit)" 
                  min="0"
                  step="100"
                  className="input-field" 
                />
              )}
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.3rem", display: "block" }}>
                Description
              </label>
              <textarea 
                name="description" 
                rows={4} 
                defaultValue={course.description || ""} 
                className="input-field" 
                style={{ resize: "vertical", lineHeight: 1.5 }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.4rem", display: "block" }}>
                Image de couverture du cours
              </label>
              <ImageUploadDropzone initialUrl={course.imageUrl} name="imageUrl" />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ marginTop: "0.5rem", padding: "0.75rem" }}>
              Enregistrer les modifications
            </button>
          </form>
        </div>

        {/* Right: Visual Curriculum Builder */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="glass" style={{ padding: "1.75rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", margin: 0 }}>
                Programme du Cours ({course.chapters.length} chapitres, {totalLessons} leçons)
              </h2>
            </div>

            {/* Add Chapter Form */}
            <form action={addChapter} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <input 
                type="text" 
                name="title" 
                required 
                placeholder="Titre du nouveau chapitre..." 
                className="input-field"
                style={{ flex: 1 }}
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: "0.6rem 1.25rem", fontSize: "0.9rem", whiteSpace: "nowrap", background: "var(--gradient-orange)" }}
              >
                + Ajouter Chapitre
              </button>
            </form>

            {/* Chapter Accordion / Cards List */}
            {course.chapters.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>
                Aucun chapitre pour le moment. Ajoutez votre premier chapitre ci-dessus.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {course.chapters.map((chapter) => (
                  <div 
                    key={chapter.id}
                    style={{ 
                      background: "rgba(0,0,0,0.3)", 
                      borderRadius: "0.75rem", 
                      border: "1px solid var(--border)",
                      overflow: "hidden" 
                    }}
                  >
                    {/* Chapter Header */}
                    <div style={{ padding: "1rem 1.25rem", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--brand-orange)", fontWeight: 700 }}>
                          Section {chapter.position}
                        </span>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "white", margin: 0 }}>
                          {chapter.title}
                        </h3>
                      </div>

                      {course.isPublished ? (
                        <span 
                          style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                          title="Suppression impossible sur un cours publié"
                        >
                          🔒 Protégé
                        </span>
                      ) : (
                        <form action={deleteChapter}>
                          <input type="hidden" name="chapterId" value={chapter.id} />
                          <button 
                            type="submit" 
                            style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", opacity: 0.8 }}
                            title="Supprimer ce chapitre"
                          >
                            Supprimer
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Lessons inside chapter */}
                    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {chapter.lessons.map((lesson, lIdx) => (
                        <div 
                          key={lesson.id}
                          style={{ 
                            padding: "0.75rem 1rem", 
                            background: "rgba(255,255,255,0.02)", 
                            borderRadius: "0.5rem", 
                            border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ color: "var(--brand-blue)" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                            </div>
                            <span style={{ fontSize: "0.9rem", color: "#e5e7eb", fontWeight: 500 }}>
                              {lIdx + 1}. {lesson.title}
                            </span>
                            {lesson.isFree && (
                              <span style={{ fontSize: "0.7rem", color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "0.1rem 0.4rem", borderRadius: "0.25rem", fontWeight: 700 }}>
                                Gratuit
                              </span>
                            )}
                          </div>

                          {course.isPublished ? (
                            <span 
                              style={{ color: "var(--text-muted)", fontSize: "0.75rem", opacity: 0.6 }} 
                              title="Suppression verrouillée sur un cours publié"
                            >
                              🔒
                            </span>
                          ) : (
                            <form action={deleteLesson}>
                              <input type="hidden" name="lessonId" value={lesson.id} />
                              <button 
                                type="submit" 
                                style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", cursor: "pointer" }}
                                title="Supprimer la leçon"
                              >
                                ✕
                              </button>
                            </form>
                          )}
                        </div>
                      ))}

                      {/* Add Lesson Form */}
                      <div style={{ marginTop: "0.5rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.5rem", border: "1px dashed var(--border)" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", marginBottom: "0.75rem", display: "block" }}>
                          + Ajouter une leçon à ce chapitre
                        </span>

                        <form action={addLesson} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <input type="hidden" name="chapterId" value={chapter.id} />
                          
                          <input 
                            type="text" 
                            name="title" 
                            required 
                            placeholder="Titre de la leçon (Ex: Préparation de la ganache)" 
                            className="input-field" 
                            style={{ fontSize: "0.85rem", padding: "0.6rem 0.8rem" }}
                          />

                          <VideoUploadInput 
                            name="videoUrl" 
                            placeholder="Coller un lien vidéo (MP4, HLS...) ou téléversez un fichier" 
                          />

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)", cursor: "pointer" }}>
                              <input type="checkbox" name="isFree" />
                              Aperçu gratuit (accessible sans payer)
                            </label>

                            <button 
                              type="submit" 
                              className="btn btn-secondary"
                              style={{ padding: "0.4rem 1rem", fontSize: "0.8rem" }}
                            >
                              Enregistrer la leçon
                            </button>
                          </div>
                        </form>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Enrolled Students Roster Section */}
      <div className="glass" style={{ marginTop: "2.5rem", padding: "2rem", borderRadius: "1.25rem", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", margin: "0 0 0.2rem 0" }}>
              👥 Étudiants Inscrits à cette Formation ({course.enrollments.length})
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Consultez les apprenants qui ont rejoint votre cours et accédez à leurs coordonnées pour le suivi pédagogique.
            </p>
          </div>
          <span style={{ fontSize: "0.9rem", color: "var(--brand-blue)", fontWeight: 700 }}>
            {course.enrollments.length} inscrit(s)
          </span>
        </div>

        {course.enrollments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🎓</div>
            <p style={{ margin: 0, fontSize: "0.95rem" }}>
              Aucun étudiant n'est encore inscrit à cette formation. Dès la publication de votre cours, les inscriptions apparaîtront ici.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {course.enrollments.map((enrollment) => {
              const student = enrollment.user;
              return (
                <div 
                  key={enrollment.id}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "0.75rem",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div 
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "var(--gradient-blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      flexShrink: 0,
                    }}
                  >
                    {student.name ? student.name.charAt(0).toUpperCase() : "E"}
                  </div>

                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, color: "white", fontSize: "0.92rem", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {student.name || "Étudiant"}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {student.email}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#e5e7eb", marginTop: "0.2rem", display: "flex", gap: "0.5rem" }}>
                      <span>📍 {student.wilaya || "Wilaya N/A"}</span>
                      {student.phone && <span>📞 {student.phone}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


