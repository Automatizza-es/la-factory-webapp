import type { Locale } from "./config";

export interface Dictionary {
  nav: {
    home: string;
    book: string;
    bookings: string;
    profile: string;
  };
  home: {
    greeting: string;
    subtitle: string;
    noActivePlan: string;
    bookRoom: string;
    viewCalendar: string;
    upcomingBookings: string;
    viewAll: string;
    noUpcoming: string;
  };
  quota: {
    currentPlan: string;
    availableOf: string;
    usedThisMonth: string;
  };
  room: {
    availability: string;
    people: string;
  };
  booking: {
    statusUpcoming: string;
    statusCompleted: string;
    statusCancelled: string;
    modify: string;
    cancel: string;
    cancelling: string;
    confirmCancel: string;
    minutesShort: string;
  };
  reservar: {
    title: string;
    modifyTitle: string;
    chooseRoom: string;
    chooseDateTime: string;
    day: string;
    start: string;
    end: string;
    invalidRange: string;
    duration: string;
    availableNow: string;
    afterBooking: string;
    submitting: string;
    saveChanges: string;
    confirmBooking: string;
  };
  reservas: {
    title: string;
    subtitle: string;
    upcoming: string;
    history: string;
    noUpcoming: string;
    noHistory: string;
  };
  perfil: {
    plan: string;
    noActivePlan: string;
    currentPeriod: string;
    contact: string;
    comingSoon: string;
    signOut: string;
  };
  login: {
    title: string;
    subtitle: string;
    checkEmail: (email: string) => string;
    placeholder: string;
    submit: string;
    sending: string;
    error: string;
  };
  unlinked: {
    title: string;
    body: string;
  };
  language: {
    label: string;
  };
}

const es: Dictionary = {
  nav: { home: "Inicio", book: "Reservar", bookings: "Mis reservas", profile: "Perfil" },
  home: {
    greeting: "Hola",
    subtitle: "Qué bueno tenerte por aquí",
    noActivePlan: "No tienes una tarifa activa este mes.",
    bookRoom: "Reservar una sala",
    viewCalendar: "Ver calendario",
    upcomingBookings: "Próximas reservas",
    viewAll: "Ver todas",
    noUpcoming: "No tienes reservas próximas.",
  },
  quota: {
    currentPlan: "Tu tarifa actual",
    availableOf: "disponibles de",
    usedThisMonth: "utilizadas este mes",
  },
  room: { availability: "Disponibilidad", people: "pers." },
  booking: {
    statusUpcoming: "Próxima",
    statusCompleted: "Completada",
    statusCancelled: "Cancelada",
    modify: "Modificar",
    cancel: "Cancelar",
    cancelling: "Cancelando...",
    confirmCancel: "¿Seguro que quieres cancelar esta reserva?",
    minutesShort: "min",
  },
  reservar: {
    title: "Reservar sala",
    modifyTitle: "Modificar reserva",
    chooseRoom: "Elige una sala para ver su disponibilidad.",
    chooseDateTime: "Elige el día y el horario que necesites.",
    day: "Día",
    start: "Inicio",
    end: "Fin",
    invalidRange: "La hora de fin debe ser posterior a la de inicio.",
    duration: "Duración",
    availableNow: "Disponible actualmente",
    afterBooking: "Después de reservar",
    submitting: "Reservando...",
    saveChanges: "Guardar cambios",
    confirmBooking: "Confirmar reserva",
  },
  reservas: {
    title: "Mis reservas",
    subtitle: "Consulta, modifica o cancela tus reservas de salas.",
    upcoming: "Próximas",
    history: "Histórico",
    noUpcoming: "No tienes reservas próximas.",
    noHistory: "Todavía no tienes reservas pasadas.",
  },
  perfil: {
    plan: "Tarifa",
    noActivePlan: "Sin tarifa activa",
    currentPeriod: "Periodo actual",
    contact: "Contacto",
    comingSoon:
      "La edición de datos personales y las preferencias de comunicación estarán disponibles próximamente.",
    signOut: "Cerrar sesión",
  },
  login: {
    title: "Entrar",
    subtitle: "Te enviamos un enlace de acceso a tu email, sin contraseña.",
    checkEmail: (email) => `Revisa ${email} y abre el enlace que te hemos enviado para entrar.`,
    placeholder: "tu@email.com",
    submit: "Enviar enlace de acceso",
    sending: "Enviando...",
    error: "No hemos podido enviar el enlace. Inténtalo de nuevo.",
  },
  unlinked: {
    title: "Tu cuenta todavía no está vinculada",
    body: "Hemos verificado tu email pero no encontramos ningún coworker asociado. Contacta con La Factory para activarlo.",
  },
  language: { label: "Idioma" },
};

const ca: Dictionary = {
  nav: { home: "Inici", book: "Reservar", bookings: "Les meves reserves", profile: "Perfil" },
  home: {
    greeting: "Hola",
    subtitle: "Que bé tenir-te per aquí",
    noActivePlan: "No tens cap tarifa activa aquest mes.",
    bookRoom: "Reservar una sala",
    viewCalendar: "Veure calendari",
    upcomingBookings: "Properes reserves",
    viewAll: "Veure-les totes",
    noUpcoming: "No tens reserves properes.",
  },
  quota: {
    currentPlan: "La teva tarifa actual",
    availableOf: "disponibles de",
    usedThisMonth: "utilitzades aquest mes",
  },
  room: { availability: "Disponibilitat", people: "pers." },
  booking: {
    statusUpcoming: "Propera",
    statusCompleted: "Completada",
    statusCancelled: "Cancel·lada",
    modify: "Modificar",
    cancel: "Cancel·lar",
    cancelling: "Cancel·lant...",
    confirmCancel: "Segur que vols cancel·lar aquesta reserva?",
    minutesShort: "min",
  },
  reservar: {
    title: "Reservar sala",
    modifyTitle: "Modificar reserva",
    chooseRoom: "Tria una sala per veure la seva disponibilitat.",
    chooseDateTime: "Tria el dia i l'horari que necessitis.",
    day: "Dia",
    start: "Inici",
    end: "Fi",
    invalidRange: "L'hora de fi ha de ser posterior a la d'inici.",
    duration: "Durada",
    availableNow: "Disponible actualment",
    afterBooking: "Després de reservar",
    submitting: "Reservant...",
    saveChanges: "Desar els canvis",
    confirmBooking: "Confirmar reserva",
  },
  reservas: {
    title: "Les meves reserves",
    subtitle: "Consulta, modifica o cancel·la les teves reserves de sales.",
    upcoming: "Properes",
    history: "Historial",
    noUpcoming: "No tens reserves properes.",
    noHistory: "Encara no tens reserves passades.",
  },
  perfil: {
    plan: "Tarifa",
    noActivePlan: "Sense tarifa activa",
    currentPeriod: "Període actual",
    contact: "Contacte",
    comingSoon:
      "L'edició de dades personals i les preferències de comunicació estaran disponibles properament.",
    signOut: "Tancar sessió",
  },
  login: {
    title: "Entrar",
    subtitle: "T'enviem un enllaç d'accés al teu email, sense contrasenya.",
    checkEmail: (email) => `Revisa ${email} i obre l'enllaç que t'hem enviat per entrar.`,
    placeholder: "tu@email.com",
    submit: "Enviar enllaç d'accés",
    sending: "Enviant...",
    error: "No hem pogut enviar l'enllaç. Torna-ho a provar.",
  },
  unlinked: {
    title: "El teu compte encara no està vinculat",
    body: "Hem verificat el teu email però no hem trobat cap coworker associat. Contacta amb La Factory per activar-lo.",
  },
  language: { label: "Idioma" },
};

const en: Dictionary = {
  nav: { home: "Home", book: "Book", bookings: "My bookings", profile: "Profile" },
  home: {
    greeting: "Hi",
    subtitle: "Great to have you here",
    noActivePlan: "You don't have an active plan this month.",
    bookRoom: "Book a room",
    viewCalendar: "View calendar",
    upcomingBookings: "Upcoming bookings",
    viewAll: "View all",
    noUpcoming: "You have no upcoming bookings.",
  },
  quota: {
    currentPlan: "Your current plan",
    availableOf: "available of",
    usedThisMonth: "used this month",
  },
  room: { availability: "Availability", people: "people" },
  booking: {
    statusUpcoming: "Upcoming",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    modify: "Modify",
    cancel: "Cancel",
    cancelling: "Cancelling...",
    confirmCancel: "Are you sure you want to cancel this booking?",
    minutesShort: "min",
  },
  reservar: {
    title: "Book a room",
    modifyTitle: "Modify booking",
    chooseRoom: "Choose a room to see its availability.",
    chooseDateTime: "Choose the day and time you need.",
    day: "Day",
    start: "Start",
    end: "End",
    invalidRange: "The end time must be later than the start time.",
    duration: "Duration",
    availableNow: "Currently available",
    afterBooking: "After booking",
    submitting: "Booking...",
    saveChanges: "Save changes",
    confirmBooking: "Confirm booking",
  },
  reservas: {
    title: "My bookings",
    subtitle: "View, modify or cancel your room bookings.",
    upcoming: "Upcoming",
    history: "History",
    noUpcoming: "You have no upcoming bookings.",
    noHistory: "You have no past bookings yet.",
  },
  perfil: {
    plan: "Plan",
    noActivePlan: "No active plan",
    currentPeriod: "Current period",
    contact: "Contact",
    comingSoon: "Editing personal details and communication preferences will be available soon.",
    signOut: "Sign out",
  },
  login: {
    title: "Sign in",
    subtitle: "We'll send a sign-in link to your email, no password needed.",
    checkEmail: (email) => `Check ${email} and open the link we sent you to sign in.`,
    placeholder: "you@email.com",
    submit: "Send sign-in link",
    sending: "Sending...",
    error: "We couldn't send the link. Please try again.",
  },
  unlinked: {
    title: "Your account isn't linked yet",
    body: "We verified your email but couldn't find a matching coworker. Contact La Factory to activate it.",
  },
  language: { label: "Language" },
};

const dictionaries: Record<Locale, Dictionary> = { es, ca, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
