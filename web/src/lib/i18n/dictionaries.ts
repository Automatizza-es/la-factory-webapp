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
  packages: {
    title: string;
    subtitle: string;
    pending: string;
    history: string;
    noPending: string;
    noHistory: string;
    statusPending: string;
    statusCollected: string;
    receivedAt: string;
    collectedAt: string;
    note: string;
    view: string;
    homeBannerOne: string;
    homeBannerMany: (count: number) => string;
    homeBannerReceived: (when: string) => string;
    emailSubject: string;
    emailGreeting: (name: string) => string;
    emailBody: string;
    emailCta: string;
  };
  notifications: {
    title: string;
    empty: string;
    genericTitle: string;
    genericBody: string;
    packageReceivedTitle: string;
    packageReceivedBody: (when: string) => string;
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
  calendar: {
    title: string;
    day: string;
    week: string;
    today: string;
    booked: string;
    occupied: string;
    available: string;
    newBooking: string;
    editBooking: string;
    continueLabel: string;
    chooseRoomAndConfirm: string;
    availableRooms: string;
    summary: string;
    changeTime: string;
    roomLabel: string;
    roomOccupied: string;
    confirming: string;
    tapFreeSlot: string;
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
  onboarding: {
    title: string;
    subtitle: string;
    firstName: string;
    lastName: string;
    nif: string;
    companyName: string;
    optional: string;
    phone: string;
    email: string;
    language: string;
    languageCa: string;
    languageEs: string;
    languageEn: string;
    privacyText: string;
    privacyLinkLabel: string;
    marketingConsent: string;
    submit: string;
    submitting: string;
    errorNotFound: string;
    errorExpired: string;
    errorCancelled: string;
  };
  language: {
    label: string;
  };
  admin: {
    nav: { dashboard: string; calendar: string; coworkers: string; book: string; packages: string };
    dashboard: {
      title: string;
      subtitle: string;
      todayBookings: string;
      bookedToday: string;
      upcoming: string;
      noUpcoming: string;
      incidents: string;
      noIncidents: string;
      noBookingsToday: string;
    };
    calendar: {
      title: string;
      day: string;
      week: string;
      month: string;
      allRooms: string;
      noBookings: string;
      today: string;
      guestLabel: string;
      internalLabel: string;
      eventLabel: string;
    };
    coworkers: {
      title: string;
      subtitle: string;
      name: string;
      plan: string;
      status: string;
      used: string;
      available: string;
      noCoworkers: string;
      statusActive: string;
      statusEnded: string;
      statusCancelled: string;
      statusNone: string;
      newCoworker: string;
      statusInvited: string;
      statusOnboarding: string;
      statusInviteExpired: string;
      statusInviteCancelled: string;
      resendInvitation: string;
      copyLink: string;
      cancelInvitation: string;
      linkCopied: string;
      cancelConfirm: string;
    };
    newCoworker: {
      title: string;
      subtitle: string;
      email: string;
      plan: string;
      startDate: string;
      submit: string;
      submitting: string;
      emailAlreadyExists: string;
      created: string;
      inviteLinkLabel: string;
      sendEmail: string;
      sendingEmail: string;
      emailSent: string;
      backToList: string;
    };
    coworkerDetail: {
      back: string;
      personalData: string;
      email: string;
      phone: string;
      plan: string;
      status: string;
      startDate: string;
      endDate: string;
      ongoing: string;
      quotaThisMonth: string;
      movements: string;
      noMovements: string;
      reasonMonthlyGrant: string;
      reasonBooking: string;
      reasonCancellation: string;
      reasonManualAdjustment: string;
      upcomingBookings: string;
      history: string;
      noUpcoming: string;
      noHistory: string;
    };
    createBooking: {
      title: string;
      subtitle: string;
      type: string;
      typeCoworker: string;
      typeGuest: string;
      typeInternal: string;
      typeEvent: string;
      coworkerLabel: string;
      contactLabel: string;
      chooseOne: string;
      room: string;
      consumesQuota: string;
      submit: string;
      submitting: string;
      success: string;
    };
    packages: {
      title: string;
      subtitle: string;
      newPackage: string;
      filterPending: string;
      filterCollected: string;
      filterAll: string;
      recipient: string;
      receivedAt: string;
      collectedAtLabel: string;
      status: string;
      statusPending: string;
      statusCollected: string;
      markCollected: string;
      noPackages: string;
    };
    newPackageForm: {
      title: string;
      photoLabel: string;
      changePhoto: string;
      recipientLabel: string;
      searchPlaceholder: string;
      noResults: string;
      noteLabel: string;
      noteOptional: string;
      summaryTitle: string;
      summaryFor: string;
      summaryReceived: string;
      submit: (name: string) => string;
      submitting: string;
      success: string;
      photoRequired: string;
      recipientRequired: string;
    };
  };
  errors: {
    notSignedIn: string;
    notAuthorized: string;
    invalidTimeRange: string;
    mustBeFuture: string;
    sameDayRequired: string;
    roomUnavailable: string;
    noActivePlan: string;
    weekendNotAllowed: (plan: string) => string;
    noScheduleForDay: (plan: string) => string;
    outsideScheduleWindow: (plan: string, window: string) => string;
    insufficientQuota: (available: string, needed: string) => string;
    roomOverlap: string;
    bookingNotFound: string;
    alreadyCancelled: string;
    alreadyStarted: string;
    originalNotFound: string;
    unknown: string;
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
  packages: {
    title: "Mis paquetes",
    subtitle: "Consulta tus paquetes recibidos en La Factory.",
    pending: "Pendientes",
    history: "Histórico",
    noPending: "No tienes paquetes pendientes de recoger.",
    noHistory: "Todavía no tienes paquetes recogidos.",
    statusPending: "Pendiente de recoger",
    statusCollected: "Recogido",
    receivedAt: "Recibido",
    collectedAt: "Recogido",
    note: "Nota",
    view: "Ver",
    homeBannerOne: "Tienes 1 paquete pendiente",
    homeBannerMany: (count) => `Tienes ${count} paquetes pendientes`,
    homeBannerReceived: (when) => `Recibido ${when}`,
    emailSubject: "Tienes un paquete en La Factory 📦",
    emailGreeting: (name) => `Hola ${name},`,
    emailBody: "Ha llegado un paquete para ti a La Factory. Puedes recogerlo cuando quieras.",
    emailCta: "Ver paquete",
  },
  notifications: {
    title: "Notificaciones",
    empty: "No tienes notificaciones.",
    genericTitle: "Notificación",
    genericBody: "",
    packageReceivedTitle: "📦 Tienes un paquete",
    packageReceivedBody: (when) => `Ha llegado un paquete para ti a La Factory.\n${when}`,
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
  calendar: {
    title: "Calendario",
    day: "Día",
    week: "Semana",
    today: "Hoy",
    booked: "Reservado",
    occupied: "Ocupado",
    available: "Disponible",
    newBooking: "Nueva reserva",
    editBooking: "Editar reserva",
    continueLabel: "Continuar",
    chooseRoomAndConfirm: "Elige sala y confirma en un solo paso.",
    availableRooms: "Salas disponibles",
    summary: "Resumen",
    changeTime: "Cambiar hora",
    roomLabel: "Sala",
    roomOccupied: "Ocupada",
    confirming: "Confirmando...",
    tapFreeSlot: "Toca una franja libre para reservar.",
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
  onboarding: {
    title: "Bienvenido/a a La Factory",
    subtitle: "Completa tus datos para terminar de configurar tu cuenta.",
    firstName: "Nombre",
    lastName: "Apellidos",
    nif: "NIF",
    companyName: "Empresa",
    optional: "opcional",
    phone: "Teléfono",
    email: "Email",
    language: "Idioma preferido",
    languageCa: "Català",
    languageEs: "Castellano",
    languageEn: "English",
    privacyText: "Tus datos se tratan conforme a nuestra",
    privacyLinkLabel: "política de privacidad",
    marketingConsent: "Quiero recibir novedades, actividades y comunicaciones de La Factory.",
    submit: "Completar registro",
    submitting: "Guardando...",
    errorNotFound: "Este enlace de invitación no es válido.",
    errorExpired: "Este enlace de invitación ha caducado. Pide a tu administrador que te envíe uno nuevo.",
    errorCancelled: "Esta invitación ha sido cancelada.",
  },
  language: { label: "Idioma" },
  admin: {
    nav: { dashboard: "Dashboard", calendar: "Calendario", coworkers: "Coworkers", book: "Reservar", packages: "Paquetería" },
    dashboard: {
      title: "Dashboard",
      subtitle: "Resumen de hoy en La Factory.",
      todayBookings: "Reservas de hoy",
      bookedToday: "reservado hoy",
      upcoming: "Próximas reservas",
      noUpcoming: "No hay próximas reservas.",
      incidents: "Incidencias",
      noIncidents: "Sin incidencias.",
      noBookingsToday: "No hay reservas para hoy.",
    },
    calendar: {
      title: "Calendario",
      day: "Día",
      week: "Semana",
      month: "Mes",
      allRooms: "Todas las salas",
      noBookings: "No hay reservas.",
      today: "Hoy",
      guestLabel: "Invitado/contacto",
      internalLabel: "Uso interno",
      eventLabel: "Evento",
    },
    coworkers: {
      title: "Coworkers",
      subtitle: "Listado de coworkers y su cuota mensual.",
      name: "Nombre",
      plan: "Tarifa",
      status: "Estado",
      used: "Usadas",
      available: "Disponibles",
      noCoworkers: "Todavía no hay coworkers.",
      statusActive: "Activa",
      statusEnded: "Finalizada",
      statusCancelled: "Cancelada",
      statusNone: "Sin tarifa",
      newCoworker: "+ Nuevo coworker",
      statusInvited: "Invitación enviada",
      statusOnboarding: "Onboarding pendiente",
      statusInviteExpired: "Invitación caducada",
      statusInviteCancelled: "Invitación cancelada",
      resendInvitation: "Reenviar invitación",
      copyLink: "Copiar enlace",
      cancelInvitation: "Cancelar invitación",
      linkCopied: "Enlace copiado",
      cancelConfirm: "¿Seguro que quieres cancelar esta invitación?",
    },
    newCoworker: {
      title: "Nuevo coworker",
      subtitle: "El coworker completará el resto de sus datos al aceptar la invitación.",
      email: "Email",
      plan: "Tarifa",
      startDate: "Fecha de inicio",
      submit: "Crear e invitar",
      submitting: "Creando...",
      emailAlreadyExists: "Ya existe un contacto con ese email.",
      created: "Invitación creada.",
      inviteLinkLabel: "Enlace de invitación",
      sendEmail: "Enviar por email",
      sendingEmail: "Enviando...",
      emailSent: "Email enviado.",
      backToList: "Volver a coworkers",
    },
    coworkerDetail: {
      back: "Volver a coworkers",
      personalData: "Datos personales",
      email: "Email",
      phone: "Teléfono",
      plan: "Tarifa",
      status: "Estado",
      startDate: "Fecha de inicio",
      endDate: "Fecha de fin",
      ongoing: "En curso",
      quotaThisMonth: "Cuota de este mes",
      movements: "Movimientos de cuota",
      noMovements: "Todavía no hay movimientos.",
      reasonMonthlyGrant: "Cuota mensual",
      reasonBooking: "Reserva",
      reasonCancellation: "Cancelación",
      reasonManualAdjustment: "Ajuste manual",
      upcomingBookings: "Próximas reservas",
      history: "Histórico",
      noUpcoming: "No tiene reservas próximas.",
      noHistory: "Todavía no tiene reservas pasadas.",
    },
    createBooking: {
      title: "Crear reserva",
      subtitle: "Reserva una sala para un coworker, invitado, uso interno o evento.",
      type: "Tipo de reserva",
      typeCoworker: "Coworker",
      typeGuest: "Invitado / contacto",
      typeInternal: "Uso interno",
      typeEvent: "Evento",
      coworkerLabel: "Coworker",
      contactLabel: "Contacto",
      chooseOne: "Selecciona una opción",
      room: "Sala",
      consumesQuota: "Descontar de su cuota mensual",
      submit: "Crear reserva",
      submitting: "Creando reserva...",
      success: "Reserva creada correctamente.",
    },
    packages: {
      title: "Paquetería",
      subtitle: "Paquetes recibidos para coworkers.",
      newPackage: "+ Registrar paquete",
      filterPending: "Pendientes",
      filterCollected: "Recogidos",
      filterAll: "Todos",
      recipient: "Destinatario",
      receivedAt: "Recibido",
      collectedAtLabel: "Recogido",
      status: "Estado",
      statusPending: "Pendiente",
      statusCollected: "Recogido",
      markCollected: "Marcar como recogido",
      noPackages: "No hay paquetes.",
    },
    newPackageForm: {
      title: "Registrar paquete",
      photoLabel: "Foto del paquete",
      changePhoto: "Cambiar foto",
      recipientLabel: "¿Para quién es el paquete?",
      searchPlaceholder: "Buscar coworker...",
      noResults: "Sin resultados.",
      noteLabel: "Nota",
      noteOptional: "opcional",
      summaryTitle: "Nuevo paquete",
      summaryFor: "Para",
      summaryReceived: "Recibido",
      submit: (name) => `Avisar a ${name}`,
      submitting: "Registrando...",
      success: "Paquete registrado y aviso enviado.",
      photoRequired: "Añade una foto del paquete.",
      recipientRequired: "Elige a quién va dirigido el paquete.",
    },
  },
  errors: {
    notSignedIn: "No has iniciado sesión.",
    notAuthorized: "No estás autorizado para realizar esta acción.",
    invalidTimeRange: "La hora de fin debe ser posterior a la de inicio.",
    mustBeFuture: "La reserva debe empezar en el futuro.",
    sameDayRequired: "La reserva debe empezar y terminar el mismo día.",
    roomUnavailable: "La sala no está disponible.",
    noActivePlan: "No hay una tarifa activa para este coworker en esa fecha.",
    weekendNotAllowed: (plan) => `La tarifa ${plan} no permite reservar en fin de semana.`,
    noScheduleForDay: (plan) => `La tarifa ${plan} no tiene horario habilitado ese día.`,
    outsideScheduleWindow: (plan, window) =>
      `La tarifa ${plan} solo permite reservar entre ${window} ese día.`,
    insufficientQuota: (available, needed) =>
      `Cuota insuficiente: quedan ${available} disponibles y la reserva necesita ${needed}.`,
    roomOverlap: "Ya existe otra reserva para esta sala en ese horario.",
    bookingNotFound: "La reserva no existe.",
    alreadyCancelled: "La reserva ya está cancelada.",
    alreadyStarted: "No se puede cancelar una reserva que ya ha empezado.",
    originalNotFound: "La reserva original no existe.",
    unknown: "No hemos podido completar la operación. Inténtalo de nuevo.",
  },
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
  packages: {
    title: "Els meus paquets",
    subtitle: "Consulta els teus paquets rebuts a La Factory.",
    pending: "Pendents",
    history: "Historial",
    noPending: "No tens paquets pendents de recollir.",
    noHistory: "Encara no tens paquets recollits.",
    statusPending: "Pendent de recollir",
    statusCollected: "Recollit",
    receivedAt: "Rebut",
    collectedAt: "Recollit",
    note: "Nota",
    view: "Veure",
    homeBannerOne: "Tens 1 paquet pendent",
    homeBannerMany: (count) => `Tens ${count} paquets pendents`,
    homeBannerReceived: (when) => `Rebut ${when}`,
    emailSubject: "Tens un paquet a La Factory 📦",
    emailGreeting: (name) => `Hola ${name},`,
    emailBody: "Ha arribat un paquet per a tu a La Factory. Pots recollir-lo quan vulguis.",
    emailCta: "Veure paquet",
  },
  notifications: {
    title: "Notificacions",
    empty: "No tens notificacions.",
    genericTitle: "Notificació",
    genericBody: "",
    packageReceivedTitle: "📦 Tens un paquet",
    packageReceivedBody: (when) => `Ha arribat un paquet per a tu a La Factory.\n${when}`,
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
  calendar: {
    title: "Calendari",
    day: "Dia",
    week: "Setmana",
    today: "Avui",
    booked: "Reservat",
    occupied: "Ocupat",
    available: "Disponible",
    newBooking: "Nova reserva",
    editBooking: "Editar reserva",
    continueLabel: "Continuar",
    chooseRoomAndConfirm: "Tria sala i confirma en un sol pas.",
    availableRooms: "Sales disponibles",
    summary: "Resum",
    changeTime: "Canviar hora",
    roomLabel: "Sala",
    roomOccupied: "Ocupada",
    confirming: "Confirmant...",
    tapFreeSlot: "Toca una franja lliure per reservar.",
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
  onboarding: {
    title: "Benvingut/da a La Factory",
    subtitle: "Completa les teves dades per acabar de configurar el teu compte.",
    firstName: "Nom",
    lastName: "Cognoms",
    nif: "NIF",
    companyName: "Empresa",
    optional: "opcional",
    phone: "Telèfon",
    email: "Email",
    language: "Idioma preferit",
    languageCa: "Català",
    languageEs: "Castellà",
    languageEn: "English",
    privacyText: "Les teves dades es tracten segons la nostra",
    privacyLinkLabel: "política de privacitat",
    marketingConsent: "Vull rebre novetats, activitats i comunicacions de La Factory.",
    submit: "Completar registre",
    submitting: "Desant...",
    errorNotFound: "Aquest enllaç d'invitació no és vàlid.",
    errorExpired: "Aquest enllaç d'invitació ha caducat. Demana a un administrador que te'n enviï un de nou.",
    errorCancelled: "Aquesta invitació ha estat cancel·lada.",
  },
  language: { label: "Idioma" },
  admin: {
    nav: { dashboard: "Dashboard", calendar: "Calendari", coworkers: "Coworkers", book: "Reservar", packages: "Paqueteria" },
    dashboard: {
      title: "Dashboard",
      subtitle: "Resum d'avui a La Factory.",
      todayBookings: "Reserves d'avui",
      bookedToday: "reservat avui",
      upcoming: "Properes reserves",
      noUpcoming: "No hi ha properes reserves.",
      incidents: "Incidències",
      noIncidents: "Sense incidències.",
      noBookingsToday: "No hi ha reserves per avui.",
    },
    calendar: {
      title: "Calendari",
      day: "Dia",
      week: "Setmana",
      month: "Mes",
      allRooms: "Totes les sales",
      noBookings: "No hi ha reserves.",
      today: "Avui",
      guestLabel: "Convidat/contacte",
      internalLabel: "Ús intern",
      eventLabel: "Esdeveniment",
    },
    coworkers: {
      title: "Coworkers",
      subtitle: "Llistat de coworkers i la seva quota mensual.",
      name: "Nom",
      plan: "Tarifa",
      status: "Estat",
      used: "Utilitzades",
      available: "Disponibles",
      noCoworkers: "Encara no hi ha coworkers.",
      statusActive: "Activa",
      statusEnded: "Finalitzada",
      statusCancelled: "Cancel·lada",
      statusNone: "Sense tarifa",
      newCoworker: "+ Nou coworker",
      statusInvited: "Invitació enviada",
      statusOnboarding: "Onboarding pendent",
      statusInviteExpired: "Invitació caducada",
      statusInviteCancelled: "Invitació cancel·lada",
      resendInvitation: "Reenviar invitació",
      copyLink: "Copiar enllaç",
      cancelInvitation: "Cancel·lar invitació",
      linkCopied: "Enllaç copiat",
      cancelConfirm: "Segur que vols cancel·lar aquesta invitació?",
    },
    newCoworker: {
      title: "Nou coworker",
      subtitle: "El coworker completarà la resta de les seves dades en acceptar la invitació.",
      email: "Email",
      plan: "Tarifa",
      startDate: "Data d'inici",
      submit: "Crear i convidar",
      submitting: "Creant...",
      emailAlreadyExists: "Ja existeix un contacte amb aquest email.",
      created: "Invitació creada.",
      inviteLinkLabel: "Enllaç d'invitació",
      sendEmail: "Enviar per email",
      sendingEmail: "Enviant...",
      emailSent: "Email enviat.",
      backToList: "Tornar a coworkers",
    },
    coworkerDetail: {
      back: "Tornar a coworkers",
      personalData: "Dades personals",
      email: "Email",
      phone: "Telèfon",
      plan: "Tarifa",
      status: "Estat",
      startDate: "Data d'inici",
      endDate: "Data de fi",
      ongoing: "En curs",
      quotaThisMonth: "Quota d'aquest mes",
      movements: "Moviments de quota",
      noMovements: "Encara no hi ha moviments.",
      reasonMonthlyGrant: "Quota mensual",
      reasonBooking: "Reserva",
      reasonCancellation: "Cancel·lació",
      reasonManualAdjustment: "Ajust manual",
      upcomingBookings: "Properes reserves",
      history: "Historial",
      noUpcoming: "No té reserves properes.",
      noHistory: "Encara no té reserves passades.",
    },
    createBooking: {
      title: "Crear reserva",
      subtitle: "Reserva una sala per a un coworker, convidat, ús intern o esdeveniment.",
      type: "Tipus de reserva",
      typeCoworker: "Coworker",
      typeGuest: "Convidat / contacte",
      typeInternal: "Ús intern",
      typeEvent: "Esdeveniment",
      coworkerLabel: "Coworker",
      contactLabel: "Contacte",
      chooseOne: "Selecciona una opció",
      room: "Sala",
      consumesQuota: "Descomptar de la seva quota mensual",
      submit: "Crear reserva",
      submitting: "Creant reserva...",
      success: "Reserva creada correctament.",
    },
    packages: {
      title: "Paqueteria",
      subtitle: "Paquets rebuts per a coworkers.",
      newPackage: "+ Registrar paquet",
      filterPending: "Pendents",
      filterCollected: "Recollits",
      filterAll: "Tots",
      recipient: "Destinatari",
      receivedAt: "Rebut",
      collectedAtLabel: "Recollit",
      status: "Estat",
      statusPending: "Pendent",
      statusCollected: "Recollit",
      markCollected: "Marcar com a recollit",
      noPackages: "No hi ha paquets.",
    },
    newPackageForm: {
      title: "Registrar paquet",
      photoLabel: "Foto del paquet",
      changePhoto: "Canviar foto",
      recipientLabel: "Per a qui és el paquet?",
      searchPlaceholder: "Cerca un coworker...",
      noResults: "Sense resultats.",
      noteLabel: "Nota",
      noteOptional: "opcional",
      summaryTitle: "Nou paquet",
      summaryFor: "Per a",
      summaryReceived: "Rebut",
      submit: (name) => `Avisar ${name}`,
      submitting: "Registrant...",
      success: "Paquet registrat i avís enviat.",
      photoRequired: "Afegeix una foto del paquet.",
      recipientRequired: "Tria a qui va dirigit el paquet.",
    },
  },
  errors: {
    notSignedIn: "No has iniciat sessió.",
    notAuthorized: "No estàs autoritzat per fer aquesta acció.",
    invalidTimeRange: "L'hora de fi ha de ser posterior a la d'inici.",
    mustBeFuture: "La reserva ha de començar en el futur.",
    sameDayRequired: "La reserva ha de començar i acabar el mateix dia.",
    roomUnavailable: "La sala no està disponible.",
    noActivePlan: "No hi ha cap tarifa activa per a aquest coworker en aquesta data.",
    weekendNotAllowed: (plan) => `La tarifa ${plan} no permet reservar en cap de setmana.`,
    noScheduleForDay: (plan) => `La tarifa ${plan} no té horari habilitat aquest dia.`,
    outsideScheduleWindow: (plan, window) =>
      `La tarifa ${plan} només permet reservar entre ${window} aquest dia.`,
    insufficientQuota: (available, needed) =>
      `Quota insuficient: queden ${available} disponibles i la reserva necessita ${needed}.`,
    roomOverlap: "Ja existeix una altra reserva per a aquesta sala en aquest horari.",
    bookingNotFound: "La reserva no existeix.",
    alreadyCancelled: "La reserva ja està cancel·lada.",
    alreadyStarted: "No es pot cancel·lar una reserva que ja ha començat.",
    originalNotFound: "La reserva original no existeix.",
    unknown: "No hem pogut completar l'operació. Torna-ho a provar.",
  },
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
  packages: {
    title: "My packages",
    subtitle: "Check the packages you've received at La Factory.",
    pending: "Pending",
    history: "History",
    noPending: "You have no packages waiting to be picked up.",
    noHistory: "You haven't picked up any packages yet.",
    statusPending: "Pending pickup",
    statusCollected: "Picked up",
    receivedAt: "Received",
    collectedAt: "Picked up",
    note: "Note",
    view: "View",
    homeBannerOne: "You have 1 package waiting",
    homeBannerMany: (count) => `You have ${count} packages waiting`,
    homeBannerReceived: (when) => `Received ${when}`,
    emailSubject: "You have a package at La Factory 📦",
    emailGreeting: (name) => `Hi ${name},`,
    emailBody: "A package has arrived for you at La Factory. Pick it up whenever you like.",
    emailCta: "View package",
  },
  notifications: {
    title: "Notifications",
    empty: "You have no notifications.",
    genericTitle: "Notification",
    genericBody: "",
    packageReceivedTitle: "📦 You have a package",
    packageReceivedBody: (when) => `A package has arrived for you at La Factory.\n${when}`,
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
  calendar: {
    title: "Calendar",
    day: "Day",
    week: "Week",
    today: "Today",
    booked: "Booked",
    occupied: "Occupied",
    available: "Available",
    newBooking: "New booking",
    editBooking: "Edit booking",
    continueLabel: "Continue",
    chooseRoomAndConfirm: "Choose a room and confirm in one step.",
    availableRooms: "Available rooms",
    summary: "Summary",
    changeTime: "Change time",
    roomLabel: "Room",
    roomOccupied: "Occupied",
    confirming: "Confirming...",
    tapFreeSlot: "Tap a free slot to book.",
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
  onboarding: {
    title: "Welcome to La Factory",
    subtitle: "Complete your details to finish setting up your account.",
    firstName: "First name",
    lastName: "Last name",
    nif: "Tax ID (NIF)",
    companyName: "Company",
    optional: "optional",
    phone: "Phone",
    email: "Email",
    language: "Preferred language",
    languageCa: "Català",
    languageEs: "Castellano",
    languageEn: "English",
    privacyText: "Your data is handled according to our",
    privacyLinkLabel: "privacy policy",
    marketingConsent: "I want to receive news, events and communications from La Factory.",
    submit: "Complete sign-up",
    submitting: "Saving...",
    errorNotFound: "This invitation link isn't valid.",
    errorExpired: "This invitation link has expired. Ask your administrator to send you a new one.",
    errorCancelled: "This invitation has been cancelled.",
  },
  language: { label: "Language" },
  admin: {
    nav: { dashboard: "Dashboard", calendar: "Calendar", coworkers: "Coworkers", book: "Book", packages: "Packages" },
    dashboard: {
      title: "Dashboard",
      subtitle: "Today's summary at La Factory.",
      todayBookings: "Today's bookings",
      bookedToday: "booked today",
      upcoming: "Upcoming bookings",
      noUpcoming: "No upcoming bookings.",
      incidents: "Incidents",
      noIncidents: "No incidents.",
      noBookingsToday: "No bookings for today.",
    },
    calendar: {
      title: "Calendar",
      day: "Day",
      week: "Week",
      month: "Month",
      allRooms: "All rooms",
      noBookings: "No bookings.",
      today: "Today",
      guestLabel: "Guest/contact",
      internalLabel: "Internal use",
      eventLabel: "Event",
    },
    coworkers: {
      title: "Coworkers",
      subtitle: "List of coworkers and their monthly quota.",
      name: "Name",
      plan: "Plan",
      status: "Status",
      used: "Used",
      available: "Available",
      noCoworkers: "There are no coworkers yet.",
      statusActive: "Active",
      statusEnded: "Ended",
      statusCancelled: "Cancelled",
      statusNone: "No plan",
      newCoworker: "+ New coworker",
      statusInvited: "Invitation sent",
      statusOnboarding: "Onboarding pending",
      statusInviteExpired: "Invitation expired",
      statusInviteCancelled: "Invitation cancelled",
      resendInvitation: "Resend invitation",
      copyLink: "Copy link",
      cancelInvitation: "Cancel invitation",
      linkCopied: "Link copied",
      cancelConfirm: "Are you sure you want to cancel this invitation?",
    },
    newCoworker: {
      title: "New coworker",
      subtitle: "The coworker will fill in the rest of their details when accepting the invitation.",
      email: "Email",
      plan: "Plan",
      startDate: "Start date",
      submit: "Create and invite",
      submitting: "Creating...",
      emailAlreadyExists: "A contact with that email already exists.",
      created: "Invitation created.",
      inviteLinkLabel: "Invitation link",
      sendEmail: "Send by email",
      sendingEmail: "Sending...",
      emailSent: "Email sent.",
      backToList: "Back to coworkers",
    },
    coworkerDetail: {
      back: "Back to coworkers",
      personalData: "Personal details",
      email: "Email",
      phone: "Phone",
      plan: "Plan",
      status: "Status",
      startDate: "Start date",
      endDate: "End date",
      ongoing: "Ongoing",
      quotaThisMonth: "This month's quota",
      movements: "Quota movements",
      noMovements: "No movements yet.",
      reasonMonthlyGrant: "Monthly grant",
      reasonBooking: "Booking",
      reasonCancellation: "Cancellation",
      reasonManualAdjustment: "Manual adjustment",
      upcomingBookings: "Upcoming bookings",
      history: "History",
      noUpcoming: "No upcoming bookings.",
      noHistory: "No past bookings yet.",
    },
    createBooking: {
      title: "Create booking",
      subtitle: "Book a room for a coworker, guest, internal use or event.",
      type: "Booking type",
      typeCoworker: "Coworker",
      typeGuest: "Guest / contact",
      typeInternal: "Internal use",
      typeEvent: "Event",
      coworkerLabel: "Coworker",
      contactLabel: "Contact",
      chooseOne: "Choose one",
      room: "Room",
      consumesQuota: "Deduct from their monthly quota",
      submit: "Create booking",
      submitting: "Creating booking...",
      success: "Booking created successfully.",
    },
    packages: {
      title: "Packages",
      subtitle: "Packages received for coworkers.",
      newPackage: "+ Register package",
      filterPending: "Pending",
      filterCollected: "Picked up",
      filterAll: "All",
      recipient: "Recipient",
      receivedAt: "Received",
      collectedAtLabel: "Picked up",
      status: "Status",
      statusPending: "Pending",
      statusCollected: "Picked up",
      markCollected: "Mark as picked up",
      noPackages: "No packages.",
    },
    newPackageForm: {
      title: "Register package",
      photoLabel: "Package photo",
      changePhoto: "Change photo",
      recipientLabel: "Who's this package for?",
      searchPlaceholder: "Search coworker...",
      noResults: "No results.",
      noteLabel: "Note",
      noteOptional: "optional",
      summaryTitle: "New package",
      summaryFor: "For",
      summaryReceived: "Received",
      submit: (name) => `Notify ${name}`,
      submitting: "Registering...",
      success: "Package registered and notification sent.",
      photoRequired: "Add a photo of the package.",
      recipientRequired: "Choose who the package is for.",
    },
  },
  errors: {
    notSignedIn: "You're not signed in.",
    notAuthorized: "You're not authorized to perform this action.",
    invalidTimeRange: "The end time must be later than the start time.",
    mustBeFuture: "The booking must start in the future.",
    sameDayRequired: "The booking must start and end on the same day.",
    roomUnavailable: "The room isn't available.",
    noActivePlan: "There's no active plan for this coworker on that date.",
    weekendNotAllowed: (plan) => `The ${plan} plan doesn't allow weekend bookings.`,
    noScheduleForDay: (plan) => `The ${plan} plan has no schedule enabled for that day.`,
    outsideScheduleWindow: (plan, window) =>
      `The ${plan} plan only allows booking between ${window} that day.`,
    insufficientQuota: (available, needed) =>
      `Not enough quota: ${available} available and the booking needs ${needed}.`,
    roomOverlap: "There's already another booking for this room at that time.",
    bookingNotFound: "The booking doesn't exist.",
    alreadyCancelled: "The booking is already cancelled.",
    alreadyStarted: "You can't cancel a booking that has already started.",
    originalNotFound: "The original booking doesn't exist.",
    unknown: "We couldn't complete the operation. Please try again.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { es, ca, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
