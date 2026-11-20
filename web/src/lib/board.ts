import type { Locale } from "@/lib/i18n/config";

export interface BoardAttachment {
  path: string;
  name: string;
  type: string;
}
export interface BoardPost {
  id: string;
  author_contact_id: string;
  author_name: string;
  title: string;
  body: string;
  status: "active" | "closed" | "archived";
  attachments: BoardAttachment[];
  created_at: string;
  updated_at: string;
}
export interface BoardComment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}
export const BOARD_DOCUMENT_TYPES = [
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text", "text/plain",
];
export const BOARD_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const es = {
  title: "Tablón de anuncios", subtitle: "Comparte algo con la comunidad de La Factory.",
  newPost: "Crear publicación", edit: "Editar", save: "Guardar", publish: "Publicar", saving: "Guardando…",
  postTitle: "Título", text: "Texto", photos: "Fotos", document: "Documento (opcional)",
  fileHint: "Hasta 5 fotos y 1 documento PDF, Word, ODT o TXT. Máximo 10 MB por archivo.",
  search: "Buscar en publicaciones y comentarios", searchButton: "Buscar", all: "Todas",
  active: "Activa", closed: "Cerrada", archived: "Archivada", empty: "No hay publicaciones con estos filtros.",
  commentMatch: "Coincidencia en una respuesta", comments: "Respuestas", reply: "Responder", replyText: "Tu respuesta",
  guest: "Puedes consultar el tablón. Para publicar o responder necesitas una tarifa activa.",
  closedHint: "Esta publicación está cerrada. Su contenido y respuestas siguen disponibles para consulta.",
  archivedHint: "Esta publicación está archivada y solo es visible para administración.",
  close: "Cerrar publicación", archive: "Archivar", reopen: "Reactivar", remove: "Eliminar",
  confirmDelete: "¿Eliminar esta publicación, sus respuestas y sus archivos? Esta acción es definitiva.",
  confirmArchive: "¿Archivar esta publicación? Dejará de aparecer en el tablón de la comunidad.",
  confirmClose: "¿Cerrar esta publicación? Seguirá visible, pero dejará de admitir respuestas.",
  back: "Volver al tablón", cancel: "Cancelar", next: "Siguiente", previous: "Anterior",
  error: "No se pudo guardar. Inténtalo de nuevo.", loadError: "No se pudo cargar el tablón. Recarga la página.",
  conflict: "La publicación ha cambiado. Recarga la página antes de guardar.",
  invalidFile: "Revisa el formato, el número y el tamaño de los archivos.",
  replyTitle: "Nueva respuesta en el tablón", replyBody: "Han respondido a tu publicación",
  removeFile: "Quitar archivo", noComments: "Todavía no hay respuestas.", attachments: "Archivos adjuntos",
};
type BoardDictionary = Record<keyof typeof es, string>;
const ca: BoardDictionary = {
  title: "Tauler d’anuncis", subtitle: "Comparteix alguna cosa amb la comunitat de La Factory.",
  newPost: "Crear publicació", edit: "Editar", save: "Desar", publish: "Publicar", saving: "Desant…",
  postTitle: "Títol", text: "Text", photos: "Fotos", document: "Document (opcional)",
  fileHint: "Fins a 5 fotos i 1 document PDF, Word, ODT o TXT. Màxim 10 MB per arxiu.",
  search: "Buscar en publicacions i comentaris", searchButton: "Buscar", all: "Totes",
  active: "Activa", closed: "Tancada", archived: "Arxivada", empty: "No hi ha publicacions amb aquests filtres.",
  commentMatch: "Coincidència en una resposta", comments: "Respostes", reply: "Respondre", replyText: "La teva resposta",
  guest: "Pots consultar el tauler. Per publicar o respondre necessites una tarifa activa.",
  closedHint: "Aquesta publicació està tancada. El contingut i les respostes segueixen disponibles per consultar.",
  archivedHint: "Aquesta publicació està arxivada i només és visible per a administració.",
  close: "Tancar publicació", archive: "Arxivar", reopen: "Reactivar", remove: "Eliminar",
  confirmDelete: "Eliminar aquesta publicació, les respostes i els arxius? Aquesta acció és definitiva.",
  confirmArchive: "Arxivar aquesta publicació? Deixarà d’aparèixer al tauler de la comunitat.",
  confirmClose: "Tancar aquesta publicació? Seguirà visible, però deixarà d’admetre respostes.",
  back: "Tornar al tauler", cancel: "Cancel·lar", next: "Següent", previous: "Anterior",
  error: "No s’ha pogut desar. Torna-ho a provar.", loadError: "No s’ha pogut carregar el tauler. Recarrega la pàgina.",
  conflict: "La publicació ha canviat. Recarrega la pàgina abans de desar.",
  invalidFile: "Revisa el format, el nombre i la mida dels arxius.",
  replyTitle: "Nova resposta al tauler", replyBody: "Han respost a la teva publicació",
  removeFile: "Treure arxiu", noComments: "Encara no hi ha respostes.", attachments: "Arxius adjunts",
};
const en: BoardDictionary = {
  title: "Notice board", subtitle: "Share something with the La Factory community.",
  newPost: "Create post", edit: "Edit", save: "Save", publish: "Publish", saving: "Saving…",
  postTitle: "Title", text: "Text", photos: "Photos", document: "Document (optional)",
  fileHint: "Up to 5 photos and 1 PDF, Word, ODT or TXT document. Maximum 10 MB per file.",
  search: "Search posts and comments", searchButton: "Search", all: "All",
  active: "Active", closed: "Closed", archived: "Archived", empty: "No posts match these filters.",
  commentMatch: "Match in a reply", comments: "Replies", reply: "Reply", replyText: "Your reply",
  guest: "You can browse the board. An active plan is required to post or reply.",
  closedHint: "This post is closed. Its content and replies remain available to read.",
  archivedHint: "This post is archived and only visible to administrators.",
  close: "Close post", archive: "Archive", reopen: "Reopen", remove: "Delete",
  confirmDelete: "Delete this post, its replies and files? This action is permanent.",
  confirmArchive: "Archive this post? It will disappear from the community board.",
  confirmClose: "Close this post? It will remain visible and stop accepting replies.",
  back: "Back to the board", cancel: "Cancel", next: "Next", previous: "Previous",
  error: "Could not save. Please try again.", loadError: "Could not load the board. Reload the page.",
  conflict: "This post has changed. Reload the page before saving.",
  invalidFile: "Check the file types, number and sizes.",
  replyTitle: "New reply on the notice board", replyBody: "Someone replied to your post",
  removeFile: "Remove file", noComments: "No replies yet.", attachments: "Attachments",
};
export function getBoardDictionary(locale: Locale): BoardDictionary {
  return { es, ca, en }[locale];
}
