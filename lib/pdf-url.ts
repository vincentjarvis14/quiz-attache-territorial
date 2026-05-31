// Construit l'URL publique d'un PDF de cours hébergé sur Supabase Storage.
// slug = nom du fichier sans extension = colonne source_pdf en base.
// page (optionnel) ouvre le PDF directement à la page donnée (#page=N).
export function pdfUrl(slug: string, page?: number | null): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const url = `${base}/storage/v1/object/public/cours-pdfs/${slug}.pdf`;
  return page && page > 0 ? `${url}#page=${page}` : url;
}
