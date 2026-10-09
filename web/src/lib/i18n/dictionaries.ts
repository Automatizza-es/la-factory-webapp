import type { Locale } from "./config";

export interface Dictionary {
  nav: {
    home: string;
    book: string;
    bookings: string;
    profile: string;
    events: string;
    packages: string;
    incidents: string;
  };
  home: {
    greeting: string;
    subtitle: string;
    noActivePlan: string;
    guestNotice: string;
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
    receivedByLabel: string;
    receivedBy: (name: string) => string;
    view: string;
    homeBannerOne: string;
    homeBannerMany: (count: number) => string;
    homeBannerReceived: (when: string) => string;
    registerAction: string;
    registerActionSubtitle: string;
    emailSubject: string;
    emailGreeting: (name: string) => string;
    emailBody: string;
    emailCta: string;
    markCollected: string;
    markAllCollected: string;
    marking: string;
    markError: string;
  };
  incidents: {
    title: string;
    subtitle: string;
    report: string;
    reportTitle: string;
    category: string;
    categories: Record<"internet" | "climate" | "cleaning" | "room" | "furniture" | "access" | "other", string>;
    description: string;
    descriptionPlaceholder: string;
    photo: string;
    addPhoto: string;
    changePhoto: string;
    submit: string;
    submitting: string;
    sent: string;
    descriptionRequired: string;
    openTitle: string;
    openHint: string;
    mineTitle: string;
    noneOpen: string;
    noneMine: string;
    status: Record<"pending" | "in_progress" | "resolved", string>;
    adminNote: string;
    homeCta: string;
    homeCtaSubtitle: string;
    reportedBy: string;
    filterOpen: string;
    filterResolved: string;
    filterAll: string;
    notePlaceholder: string;
    save: string;
    none: string;
    pendingCount: (count: number) => string;
  };
  notifications: {
    title: string;
    empty: string;
    incidentNewTitle: string;
    incidentUpdateTitle: string;
    incidentUpdateBody: (status: string) => string;
    genericTitle: string;
    genericBody: string;
    packageReceivedTitle: string;
    packageReceivedBody: (when: string) => string;
    eventNewTitle: string;
    eventNewBody: (eventTitle: string, when: string) => string;
    bookingReminderTitle: string;
    bookingReminderBody: (roomName: string, timeRange: string) => string;
  };
  events: {
    homeTitle: string;
    viewAll: string;
    title: string;
    subtitle: string;
    upcoming: string;
    past: string;
    noUpcoming: string;
    noPast: string;
    join: string;
    joined: string;
    full: string;
    cancelAttendance: string;
    cancelConfirm: string;
    spotsLeft: (n: number) => string;
    spotsLeftOne: string;
    location: string;
    capacity: string;
    registrationClosed: string;
    joining: string;
    cancelling: string;
    errorFull: string;
    errorClosed: string;
    errorNotAuthorized: string;
    errorGeneric: string;
    back: string;
  };
  notificationSettings: {
    back: string;
    title: string;
    subtitle: string;
    pushSectionTitle: string;
    pushEnabled: string;
    pushDisabledHint: string;
    activateButton: string;
    activating: string;
    deactivateButton: string;
    deactivating: string;
    notSupported: string;
    permissionDenied: string;
    pushNotActive: string;
    iosInstallHint: string;
    preferencesTitle: string;
    preferencesHint: string;
    bookingReminders: string;
    packages: string;
    events: string;
    saved: string;
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
    notifications: string;
    changePassword: string;
    myDetails: string;
    firstName: string;
    lastName: string;
    phone: string;
    company: string;
    language: string;
    email: string;
    emailHint: string;
    save: string;
    saving: string;
    saved: string;
    firstNameRequired: string;
    saveError: string;
    newsletter: string;
  };
  login: {
    title: string;
    subtitle: string;
    placeholder: string;
    passwordPlaceholder: string;
    submit: string;
    submitting: string;
    error: string;
    linkExpired: string;
    forgotPassword: string;
  };
  recover: {
    title: string;
    subtitle: string;
    submit: string;
    sending: string;
    sent: (email: string) => string;
    error: string;
    backToLogin: string;
  };
  password: {
    title: string;
    subtitle: string;
    newPassword: string;
    confirmPassword: string;
    submit: string;
    saving: string;
    tooShort: string;
    mismatch: string;
    samePassword: string;
    error: string;
    back: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
  };
  emails: {
    greeting: (name: string) => string;
    linkFallback: string;
    invite: {
      subject: string;
      heading: string;
      body: string;
      cta: string;
    };
    welcome: {
      subject: string;
      heading: string;
      body: string;
      cta: string;
      validity: string;
    };
  };
  unlinked: {
    title: string;
    body: string;
    archivedTitle: string;
    archivedBody: string;
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
    password: string;
    confirmPassword: string;
    passwordHint: string;
  };
  language: {
    label: string;
  };
  admin: {
    nav: {
      dashboard: string;
      calendar: string;
      coworkers: string;
      book: string;
      packages: string;
      events: string;
      bookings: string;
      users: string;
      more: string;
      account: string;
      companies: string;
      billing: string;
      settings: string;
      incidents: string;
    };
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
      roomsNow: string;
      busyUntil: (time: string) => string;
      freeUntil: (time: string) => string;
      freeRestOfDay: string;
      packagesTitle: string;
      pendingPackages: (count: number) => string;
      noPendingPackages: string;
      latestPackages: string;
      nextEvent: string;
      noUpcomingEvents: string;
      registered: (count: number, capacity: number | null) => string;
      quickActions: string;
      newBooking: string;
      newCoworker: string;
      registerPackage: string;
      newEvent: string;
      seeAll: string;
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
      statusNoAccess: string;
      statusWelcomeSent: string;
      sendWelcome: string;
      sendingWelcome: string;
      sendWelcomeAll: (count: number) => string;
      sendWelcomeConfirm: (count: number) => string;
      welcomeSent: (count: number) => string;
      welcomeError: string;
      access: string;
      filterAll: string;
      filterCoworkers: string;
      filterGuests: string;
      filterAdmins: string;
      filterArchived: string;
      searchPlaceholder: string;
      search: string;
      kindAdmin: string;
      kindCoworker: string;
      kindGuest: string;
      kindArchived: string;
      sharedWith: (name: string) => string;
      noResults: string;
    };
    userDetail: {
      sectionPersonal: string;
      firstName: string;
      lastName: string;
      nif: string;
      phone: string;
      email: string;
      emailHint: string;
      company: string;
      language: string;
      sectionStatus: string;
      archived: string;
      archivedHint: string;
      canReceivePackages: string;
      newsletter: string;
      sectionPlan: string;
      noPlan: string;
      since: (date: string) => string;
      until: (date: string) => string;
      billable: string;
      billableHint: string;
      endPlan: string;
      endDate: string;
      newPlan: string;
      plan: string;
      startDate: string;
      assign: string;
      sharedWith: string;
      sharedHint: string;
      noShare: string;
      sectionBilling: string;
      billTo: string;
      billToPerson: string;
      billToCompany: string;
      chooseCompany: string;
      manageCompanies: string;
      address: string;
      city: string;
      postalCode: string;
      province: string;
      country: string;
      sectionAdmin: string;
      holdedId: string;
      internalNotes: string;
      save: string;
      saving: string;
      saved: string;
      error: string;
      firstNameRequired: string;
    };
    companies: {
      title: string;
      subtitle: string;
      newCompany: string;
      noCompanies: string;
      name: string;
      taxId: string;
      billingEmail: string;
      notes: string;
      people: (count: number) => string;
      back: string;
      nameRequired: string;
    };
    billing: {
      title: string;
      subtitle: (month: string) => string;
      person: string;
      plan: string;
      amount: string;
      billTo: string;
      invoiced: string;
      issues: string;
      total: string;
      progress: (done: number, total: number) => string;
      noLines: string;
      notBillableTitle: string;
      noPrice: string;
      noTaxId: string;
      noAddress: string;
      noHoldedId: string;
      startsMidMonth: (date: string) => string;
      endsMidMonth: (date: string) => string;
      setPrices: string;
    };
    settings: {
      title: string;
      subtitle: string;
      plansTitle: string;
      monthlyHours: string;
      price: string;
      invalidPrice: string;
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
      adjustTitle: string;
      adjustHint: string;
      hours: string;
      reasonPlaceholder: string;
      addHours: string;
      removeHours: string;
      invalidHours: string;
      hoursUpdated: string;
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
      bookingFor: string;
      typeExternal: string;
      typeOther: string;
      nameLabel: string;
      eventNameLabel: string;
      otherNameLabel: string;
      notesLabel: string;
      notesPlaceholder: string;
      nameRequired: string;
      contactRequired: string;
      bookedThisMonth: (hours: string) => string;
      eventFallback: string;
      otherFallback: string;
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
      success: (name: string) => string;
      registerAnother: string;
      backHome: string;
      photoRequired: string;
      recipientRequired: string;
    };
    events: {
      title: string;
      subtitle: string;
      newEvent: string;
      attendeesLabel: (n: number) => string;
      viewAttendees: string;
      cancelEvent: string;
      cancelConfirm: string;
      noEvents: string;
      statusCancelled: string;
      unlimitedCapacity: string;
      edit: string;
    };
    newEventForm: {
      title: string;
      titleLabel: string;
      descriptionLabel: string;
      imageLabel: string;
      dateLabel: string;
      startTimeLabel: string;
      endTimeLabel: string;
      locationLabel: string;
      roomLabel: string;
      noRoom: string;
      blockRoomLabel: string;
      capacityLabel: string;
      capacityOptional: string;
      registrationDeadlineLabel: string;
      deadlineOptional: string;
      audienceLabel: string;
      audienceAll: string;
      audiencePlan: string;
      audienceContacts: string;
      audienceSearchPlaceholder: string;
      submit: string;
      submitting: string;
      success: string;
      titleRequired: string;
      backToList: string;
      editTitle: string;
      editSubmit: string;
      editSuccess: string;
    };
    eventAttendees: {
      title: string;
      back: string;
      registered: string;
      cancelled: string;
      noAttendees: string;
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
  nav: {
    home: "Inicio",
    book: "Reservar",
    bookings: "Mis reservas",
    profile: "Perfil",
    events: "Eventos",
    packages: "Mis paquetes",
    incidents: "Incidencias",
  },
  home: {
    greeting: "Hola",
    subtitle: "Qué bueno tenerte por aquí",
    noActivePlan: "No tienes una tarifa activa este mes.",
    guestNotice: "Ahora mismo no tienes una tarifa activa, pero sigues formando parte de la comunidad: eventos, paquetes y avisos.",
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
    receivedByLabel: "Lo recibió",
    receivedBy: (name) => `Lo recibió ${name}`,
    view: "Ver",
    homeBannerOne: "Tienes 1 paquete pendiente",
    homeBannerMany: (count) => `Tienes ${count} paquetes pendientes`,
    homeBannerReceived: (when) => `Recibido ${when}`,
    registerAction: "Registrar paquete",
    registerActionSubtitle: "¿Ha llegado un paquete para alguien? Avísale en un momento.",
    emailSubject: "Tienes un paquete en La Factory 📦",
    emailGreeting: (name) => `Hola ${name},`,
    emailBody: "Ha llegado un paquete para ti a La Factory. Puedes recogerlo cuando quieras.",
    emailCta: "Ver paquete",
    markCollected: "Ya lo he recogido",
    markAllCollected: "Los he recogido todos",
    marking: "Guardando...",
    markError: "No hemos podido guardarlo. Inténtalo de nuevo.",
  },
  incidents: {
    title: "Incidencias",
    subtitle: "¿Algo no funciona en el espacio? Avísanos y lo arreglamos.",
    report: "Comunicar incidencia",
    reportTitle: "Nueva incidencia",
    category: "¿Qué pasa?",
    categories: {
      internet: "Internet / wifi",
      climate: "Climatización",
      cleaning: "Limpieza",
      room: "Sala",
      furniture: "Mobiliario",
      access: "Acceso",
      other: "Otro",
    },
    description: "Cuéntanos qué ocurre",
    descriptionPlaceholder: "Dónde, desde cuándo, qué has visto...",
    photo: "Foto (opcional)",
    addPhoto: "Añadir foto",
    changePhoto: "Cambiar foto",
    submit: "Enviar",
    submitting: "Enviando...",
    sent: "Gracias, lo hemos recibido. Te avisaremos cuando haya novedades.",
    descriptionRequired: "Describe la incidencia.",
    openTitle: "Abiertas en el espacio",
    openHint: "Si lo que ves ya está aquí, no hace falta que lo comuniques otra vez.",
    mineTitle: "Mis incidencias",
    noneOpen: "Ahora mismo no hay incidencias abiertas.",
    noneMine: "No has comunicado ninguna incidencia.",
    status: { pending: "Pendiente", in_progress: "En proceso", resolved: "Resuelta" },
    adminNote: "Respuesta de La Factory",
    homeCta: "¿Algo no funciona?",
    homeCtaSubtitle: "Comunica una incidencia del espacio.",
    reportedBy: "Comunicada por",
    filterOpen: "Abiertas",
    filterResolved: "Resueltas",
    filterAll: "Todas",
    notePlaceholder: "Nota para quien la comunicó (opcional)",
    save: "Guardar",
    none: "No hay incidencias.",
    pendingCount: (count) => (count === 1 ? "1 pendiente" : `${count} pendientes`),
  },
  notifications: {
    title: "Notificaciones",
    empty: "No tienes notificaciones.",
    incidentNewTitle: "🛠️ Nueva incidencia",
    incidentUpdateTitle: "🛠️ Tu incidencia se ha actualizado",
    incidentUpdateBody: (status) => `Estado: ${status}`,
    genericTitle: "Notificación",
    genericBody: "",
    packageReceivedTitle: "📦 Tienes un paquete",
    packageReceivedBody: (when) => `Ha llegado un paquete para ti a La Factory.\n${when}`,
    eventNewTitle: "🎉 Nuevo evento en La Factory",
    eventNewBody: (eventTitle, when) => `${eventTitle} · ${when}`,
    bookingReminderTitle: "⏰ Tu reserva empieza en 1 hora",
    bookingReminderBody: (roomName, timeRange) => `${roomName} · ${timeRange}`,
  },
  events: {
    homeTitle: "Próximos eventos",
    viewAll: "Ver todos",
    title: "Eventos",
    subtitle: "Actividades y eventos de La Factory.",
    upcoming: "Próximos",
    past: "Pasados",
    noUpcoming: "No hay eventos próximos.",
    noPast: "Todavía no hay eventos pasados.",
    join: "Me apunto",
    joined: "✓ Estás apuntado",
    full: "Completo",
    cancelAttendance: "Cancelar asistencia",
    cancelConfirm: "¿Seguro que quieres cancelar tu asistencia?",
    spotsLeft: (n) => `${n} plazas disponibles`,
    spotsLeftOne: "1 plaza disponible",
    location: "Lugar",
    capacity: "Aforo",
    registrationClosed: "El plazo de inscripción ha finalizado.",
    joining: "Apuntando...",
    cancelling: "Cancelando...",
    errorFull: "El evento se ha completado.",
    errorClosed: "El plazo de inscripción ha finalizado.",
    errorNotAuthorized: "No tienes acceso a este evento.",
    errorGeneric: "No hemos podido completar la operación. Inténtalo de nuevo.",
    back: "Volver a eventos",
  },
  notificationSettings: {
    back: "Volver al perfil",
    title: "Notificaciones",
    subtitle: "Elige qué avisos quieres recibir y activa las notificaciones push.",
    pushSectionTitle: "Notificaciones push",
    pushEnabled: "Notificaciones push activadas en este dispositivo.",
    pushDisabledHint: "Las has bloqueado en el navegador. Actívalas desde los ajustes del sitio para recibirlas.",
    activateButton: "Activar notificaciones",
    activating: "Activando...",
    deactivateButton: "Desactivar en este dispositivo",
    deactivating: "Desactivando...",
    notSupported: "Tu navegador no admite notificaciones push.",
    permissionDenied: "No hemos podido activarlas: el navegador denegó el permiso.",
    pushNotActive: "Todavía no recibes notificaciones en este móvil. Pulsa el botón para activarlas.",
    iosInstallHint: "En iPhone, primero añade la app a la pantalla de inicio: pulsa Compartir y luego «Añadir a pantalla de inicio». Después ábrela desde el icono y vuelve aquí para activarlas.",
    preferencesTitle: "Qué quiero recibir",
    preferencesHint: "Elige qué avisos te interesan. Para que te lleguen al móvil, activa también las notificaciones push de arriba.",
    bookingReminders: "Recordatorios de reservas",
    packages: "Paquetes",
    events: "Eventos",
    saved: "Preferencias guardadas.",
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
    notifications: "Notificaciones",
    changePassword: "Cambiar contraseña",
    myDetails: "Mis datos",
    firstName: "Nombre",
    lastName: "Apellidos",
    phone: "Teléfono",
    company: "Empresa",
    language: "Idioma",
    email: "Email",
    emailHint: "Para cambiar tu email, escríbenos a hola@lafactorycoworking.com.",
    save: "Guardar",
    saving: "Guardando...",
    saved: "Datos guardados.",
    firstNameRequired: "El nombre es obligatorio.",
    saveError: "No hemos podido guardar los datos. Inténtalo de nuevo.",
    newsletter: "Quiero recibir la newsletter de La Factory",
  },
  login: {
    title: "Entrar",
    subtitle: "Accede con tu email y tu contraseña.",
    placeholder: "tu@email.com",
    passwordPlaceholder: "Contraseña",
    submit: "Entrar",
    submitting: "Entrando...",
    error: "El email o la contraseña no son correctos.",
    linkExpired: "El enlace ha caducado o ya se ha usado. Pide uno nuevo.",
    forgotPassword: "¿Has olvidado tu contraseña?",
  },
  recover: {
    title: "Recuperar contraseña",
    subtitle: "Te enviaremos un email con un enlace para crear una contraseña nueva.",
    submit: "Enviar email",
    sending: "Enviando...",
    sent: (email) => `Si hay una cuenta con ${email}, te hemos enviado un email con un enlace para crear una contraseña nueva.`,
    error: "No hemos podido enviar el email. Inténtalo de nuevo en unos minutos.",
    backToLogin: "Volver a entrar",
  },
  password: {
    title: "Nueva contraseña",
    subtitle: "Elige una contraseña de al menos 8 caracteres.",
    newPassword: "Contraseña nueva",
    confirmPassword: "Repite la contraseña",
    submit: "Guardar contraseña",
    saving: "Guardando...",
    tooShort: "La contraseña debe tener al menos 8 caracteres.",
    mismatch: "Las contraseñas no coinciden.",
    samePassword: "La contraseña nueva tiene que ser distinta de la actual.",
    error: "No hemos podido guardar la contraseña. Inténtalo de nuevo.",
    back: "Volver",
    welcomeTitle: "Crea tu contraseña",
    welcomeSubtitle: "Te damos la bienvenida al hub de La Factory. Elige una contraseña de al menos 8 caracteres para entrar.",
  },
  emails: {
    greeting: (name) => (name ? `Hola ${name},` : "Hola,"),
    linkFallback: "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    invite: {
      subject: "Bienvenido/a a La Factory Coworking",
      heading: "Completa tu registro",
      body: "Te han dado de alta como coworker en La Factory Coworking. Completa tus datos y elige tu contraseña para empezar a usar la app: reservar salas, ver tus paquetes y enterarte de los eventos.",
      cta: "Completar registro",
    },
    welcome: {
      subject: "Ya tienes acceso al hub de La Factory",
      heading: "Te damos la bienvenida al hub",
      body: "Hemos estrenado una app para los coworkers de La Factory: desde aquí podrás reservar salas, ver tus paquetes y enterarte de los eventos. Ya tienes tu cuenta preparada; solo falta que crees tu contraseña.",
      cta: "Crear mi contraseña",
      validity: "El enlace es válido durante 14 días.",
    },
  },
  unlinked: {
    title: "Tu cuenta todavía no está vinculada",
    body: "Hemos verificado tu email pero no encontramos ningún coworker asociado. Contacta con La Factory para activarlo.",
    archivedTitle: "Tu cuenta está archivada",
    archivedBody: "Ya no tienes acceso a la app. Si crees que es un error, escríbenos a hola@lafactorycoworking.com.",
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
    password: "Contraseña",
    confirmPassword: "Repite la contraseña",
    passwordHint: "Mínimo 8 caracteres. La usarás para entrar en la app.",
  },
  language: { label: "Idioma" },
  admin: {
    nav: {
      dashboard: "Dashboard",
      calendar: "Calendario",
      coworkers: "Coworkers",
      book: "Nueva reserva",
      packages: "Paquetería",
      events: "Eventos",
      bookings: "Reservas",
      users: "Usuarios",
      more: "Más",
      account: "Cuenta",
      companies: "Empresas",
      billing: "Facturación",
      settings: "Configuración",
      incidents: "Incidencias",
    },
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
      roomsNow: "Salas ahora",
      busyUntil: (time) => `Ocupada hasta las ${time}`,
      freeUntil: (time) => `Libre hasta las ${time}`,
      freeRestOfDay: "Libre el resto del día",
      packagesTitle: "Paquetería",
      pendingPackages: (count) =>
        count === 1 ? "1 paquete pendiente de recoger" : `${count} paquetes pendientes de recoger`,
      noPendingPackages: "Ningún paquete pendiente.",
      latestPackages: "Últimos recibidos",
      nextEvent: "Próximo evento",
      noUpcomingEvents: "No hay eventos próximos.",
      registered: (count, capacity) =>
        capacity ? `${count} de ${capacity} plazas` : count === 1 ? "1 inscrito" : `${count} inscritos`,
      quickActions: "Accesos rápidos",
      newBooking: "Nueva reserva",
      newCoworker: "Nuevo coworker",
      registerPackage: "Registrar paquete",
      newEvent: "Crear evento",
      seeAll: "Ver todo",
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
      title: "Usuarios",
      subtitle: "Toda la comunidad: coworkers, invitados y admins.",
      name: "Nombre",
      plan: "Tarifa",
      status: "Estado",
      used: "Usadas",
      available: "Disponibles",
      noCoworkers: "Todavía no hay nadie dado de alta.",
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
      statusNoAccess: "Sin acceso",
      statusWelcomeSent: "Bienvenida enviada",
      sendWelcome: "Enviar bienvenida",
      sendingWelcome: "Enviando...",
      sendWelcomeAll: (count) => `Enviar bienvenida a todos (${count})`,
      sendWelcomeConfirm: (count) =>
        `Se enviará un email de bienvenida a ${count} ${count === 1 ? "coworker" : "coworkers"} para que creen su contraseña. ¿Continuar?`,
      welcomeSent: (count) => `Bienvenida enviada a ${count} ${count === 1 ? "coworker" : "coworkers"}.`,
      welcomeError: "No hemos podido enviar la bienvenida. Inténtalo de nuevo.",
      access: "Acceso a la app",
      filterAll: "Todos",
      filterCoworkers: "Coworkers",
      filterGuests: "Invitados",
      filterAdmins: "Admins",
      filterArchived: "Archivados",
      searchPlaceholder: "Buscar por nombre o email",
      search: "Buscar",
      kindAdmin: "Admin",
      kindCoworker: "Coworker",
      kindGuest: "Invitado",
      kindArchived: "Archivado",
      sharedWith: (name) => `Comparte con ${name}`,
      noResults: "No hay nadie con estos filtros.",
    },
    userDetail: {
      sectionPersonal: "Datos personales",
      firstName: "Nombre",
      lastName: "Apellidos",
      nif: "NIF",
      phone: "Teléfono",
      email: "Email",
      emailHint: "Es su usuario para entrar en la app; de momento no se cambia desde aquí.",
      company: "Empresa",
      language: "Idioma",
      sectionStatus: "Estado y permisos",
      archived: "Perfil archivado",
      archivedHint: "No puede entrar en la app ni aparece en reservas, paquetes ni comunicaciones. Su historial se conserva.",
      canReceivePackages: "Puede recibir paquetes",
      newsletter: "Newsletter",
      sectionPlan: "Tarifa",
      noPlan: "Sin tarifa propia",
      since: (date) => `Desde el ${date}`,
      until: (date) => `hasta el ${date}`,
      billable: "Facturable",
      billableHint: "Desmárcalo para cortesías, socios o intercambios.",
      endPlan: "Finalizar tarifa",
      endDate: "Último día",
      newPlan: "Asignar tarifa",
      plan: "Tarifa",
      startDate: "Fecha de inicio",
      assign: "Asignar",
      sharedWith: "Comparte las horas de",
      sharedHint: "Reserva y gasta de las horas de otra persona, que es quien paga. No es facturable.",
      noShare: "No comparte",
      sectionBilling: "Facturación",
      billTo: "Se factura a",
      billToPerson: "La propia persona",
      billToCompany: "Una empresa",
      chooseCompany: "Elige empresa",
      manageCompanies: "Gestionar empresas",
      address: "Dirección",
      city: "Población",
      postalCode: "Código postal",
      province: "Provincia",
      country: "País",
      sectionAdmin: "Administrativo",
      holdedId: "ID de contacto en Holded",
      internalNotes: "Observaciones internas",
      save: "Guardar",
      saving: "Guardando...",
      saved: "Guardado.",
      error: "No se ha podido guardar. Inténtalo de nuevo.",
      firstNameRequired: "El nombre es obligatorio.",
    },
    companies: {
      title: "Empresas",
      subtitle: "Entidades a las que se facturan algunos coworkers.",
      newCompany: "Nueva empresa",
      noCompanies: "Todavía no hay empresas.",
      name: "Razón social",
      taxId: "CIF / NIF",
      billingEmail: "Email de facturación",
      notes: "Notas",
      people: (count) => (count === 1 ? "1 persona" : `${count} personas`),
      back: "Volver a empresas",
      nameRequired: "La razón social es obligatoria.",
    },
    billing: {
      title: "Facturación",
      subtitle: (month) => `Quién hay que facturar en ${month}. La factura se emite en Holded.`,
      person: "Persona",
      plan: "Tarifa",
      amount: "Importe",
      billTo: "Se factura a",
      invoiced: "Facturado",
      issues: "Avisos",
      total: "Total previsto",
      progress: (done, total) => `${done} de ${total} facturadas`,
      noLines: "No hay nadie que facturar este mes.",
      notBillableTitle: "Con tarifa pero no facturables",
      noPrice: "Tarifa sin precio",
      noTaxId: "Falta NIF/CIF",
      noAddress: "Falta dirección fiscal",
      noHoldedId: "Sin ID de Holded",
      startsMidMonth: (date) => `Alta el ${date}`,
      endsMidMonth: (date) => `Baja el ${date}`,
      setPrices: "Poner precios",
    },
    settings: {
      title: "Configuración",
      subtitle: "Ajustes generales de La Factory.",
      plansTitle: "Tarifas",
      monthlyHours: "Horas de sala al mes",
      price: "Precio mensual (€)",
      invalidPrice: "El precio no es válido.",
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
      back: "Volver a usuarios",
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
      adjustTitle: "Añadir o quitar horas",
      adjustHint: "Se aplica a las horas de este mes.",
      hours: "Horas",
      reasonPlaceholder: "Motivo (opcional)",
      addHours: "Añadir",
      removeHours: "Quitar",
      invalidHours: "Indica un número de horas mayor que cero.",
      hoursUpdated: "Horas actualizadas.",
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
      typeGuest: "Invitado",
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
      bookingFor: "Reserva para",
      typeExternal: "Cliente externo",
      typeOther: "Otro",
      nameLabel: "Nombre del cliente",
      eventNameLabel: "Nombre del evento (opcional)",
      otherNameLabel: "Descripción (opcional)",
      notesLabel: "Notas (opcional)",
      notesPlaceholder: "Empresa, teléfono, lo que necesite...",
      nameRequired: "Escribe el nombre del cliente.",
      contactRequired: "Elige para quién es la reserva.",
      bookedThisMonth: (hours) => `Has reservado ${hours} este mes`,
      eventFallback: "Evento",
      otherFallback: "Reserva interna",
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
      success: (name) => `Paquete registrado. Hemos avisado a ${name}.`,
      registerAnother: "Registrar otro paquete",
      backHome: "Volver a inicio",
      photoRequired: "Añade una foto del paquete.",
      recipientRequired: "Elige a quién va dirigido el paquete.",
    },
    events: {
      title: "Eventos",
      subtitle: "Actividades y eventos internos de La Factory.",
      newEvent: "+ Crear evento",
      attendeesLabel: (n) => `${n} inscritos`,
      viewAttendees: "Ver asistentes",
      cancelEvent: "Cancelar evento",
      cancelConfirm: "¿Seguro que quieres cancelar este evento?",
      noEvents: "Todavía no hay eventos.",
      statusCancelled: "Cancelado",
      unlimitedCapacity: "Sin límite",
      edit: "Editar",
    },
    newEventForm: {
      title: "Crear evento",
      titleLabel: "Título",
      descriptionLabel: "Descripción",
      imageLabel: "Imagen",
      dateLabel: "Fecha",
      startTimeLabel: "Hora de inicio",
      endTimeLabel: "Hora de fin",
      locationLabel: "Lugar",
      roomLabel: "Sala",
      noRoom: "Ninguna",
      blockRoomLabel: "Bloquear sala durante el evento",
      capacityLabel: "Aforo",
      capacityOptional: "opcional, sin límite si se deja en blanco",
      registrationDeadlineLabel: "Fecha límite de inscripción",
      deadlineOptional: "opcional",
      audienceLabel: "Público objetivo",
      audienceAll: "Todos los coworkers",
      audiencePlan: "Un plan concreto",
      audienceContacts: "Personas concretas",
      audienceSearchPlaceholder: "Buscar coworker...",
      submit: "Crear evento",
      submitting: "Creando...",
      success: "Evento creado y aviso enviado.",
      titleRequired: "Añade un título para el evento.",
      backToList: "Volver a eventos",
      editTitle: "Editar evento",
      editSubmit: "Guardar cambios",
      editSuccess: "Cambios guardados.",
    },
    eventAttendees: {
      title: "Asistentes",
      back: "Volver al evento",
      registered: "Apuntados",
      cancelled: "Cancelados",
      noAttendees: "Todavía no hay inscritos.",
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
  nav: {
    home: "Inici",
    book: "Reservar",
    bookings: "Les meves reserves",
    profile: "Perfil",
    events: "Esdeveniments",
    packages: "Els meus paquets",
    incidents: "Incidències",
  },
  home: {
    greeting: "Hola",
    subtitle: "Que bé tenir-te per aquí",
    noActivePlan: "No tens cap tarifa activa aquest mes.",
    guestNotice: "Ara mateix no tens cap tarifa activa, però continues formant part de la comunitat: esdeveniments, paquets i avisos.",
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
    receivedByLabel: "El va rebre",
    receivedBy: (name) => `El va rebre ${name}`,
    view: "Veure",
    homeBannerOne: "Tens 1 paquet pendent",
    homeBannerMany: (count) => `Tens ${count} paquets pendents`,
    homeBannerReceived: (when) => `Rebut ${when}`,
    registerAction: "Registrar paquet",
    registerActionSubtitle: "Ha arribat un paquet per a algú? Avisa-l'hi en un moment.",
    emailSubject: "Tens un paquet a La Factory 📦",
    emailGreeting: (name) => `Hola ${name},`,
    emailBody: "Ha arribat un paquet per a tu a La Factory. Pots recollir-lo quan vulguis.",
    emailCta: "Veure paquet",
    markCollected: "Ja l'he recollit",
    markAllCollected: "Els he recollit tots",
    marking: "Desant...",
    markError: "No ho hem pogut desar. Torna-ho a provar.",
  },
  incidents: {
    title: "Incidències",
    subtitle: "Alguna cosa no funciona a l'espai? Avisa'ns i ho arreglem.",
    report: "Comunicar incidència",
    reportTitle: "Nova incidència",
    category: "Què passa?",
    categories: {
      internet: "Internet / wifi",
      climate: "Climatització",
      cleaning: "Neteja",
      room: "Sala",
      furniture: "Mobiliari",
      access: "Accés",
      other: "Altre",
    },
    description: "Explica'ns què passa",
    descriptionPlaceholder: "On, des de quan, què has vist...",
    photo: "Foto (opcional)",
    addPhoto: "Afegir foto",
    changePhoto: "Canviar foto",
    submit: "Enviar",
    submitting: "Enviant...",
    sent: "Gràcies, ho hem rebut. T'avisarem quan hi hagi novetats.",
    descriptionRequired: "Descriu la incidència.",
    openTitle: "Obertes a l'espai",
    openHint: "Si el que veus ja és aquí, no cal que ho tornis a comunicar.",
    mineTitle: "Les meves incidències",
    noneOpen: "Ara mateix no hi ha incidències obertes.",
    noneMine: "No has comunicat cap incidència.",
    status: { pending: "Pendent", in_progress: "En curs", resolved: "Resolta" },
    adminNote: "Resposta de La Factory",
    homeCta: "Alguna cosa no funciona?",
    homeCtaSubtitle: "Comunica una incidència de l'espai.",
    reportedBy: "Comunicada per",
    filterOpen: "Obertes",
    filterResolved: "Resoltes",
    filterAll: "Totes",
    notePlaceholder: "Nota per a qui la va comunicar (opcional)",
    save: "Desar",
    none: "No hi ha incidències.",
    pendingCount: (count) => (count === 1 ? "1 pendent" : `${count} pendents`),
  },
  notifications: {
    title: "Notificacions",
    empty: "No tens notificacions.",
    incidentNewTitle: "🛠️ Nova incidència",
    incidentUpdateTitle: "🛠️ La teva incidència s'ha actualitzat",
    incidentUpdateBody: (status) => `Estat: ${status}`,
    genericTitle: "Notificació",
    genericBody: "",
    packageReceivedTitle: "📦 Tens un paquet",
    packageReceivedBody: (when) => `Ha arribat un paquet per a tu a La Factory.\n${when}`,
    eventNewTitle: "🎉 Nou esdeveniment a La Factory",
    eventNewBody: (eventTitle, when) => `${eventTitle} · ${when}`,
    bookingReminderTitle: "⏰ La teva reserva comença en 1 hora",
    bookingReminderBody: (roomName, timeRange) => `${roomName} · ${timeRange}`,
  },
  events: {
    homeTitle: "Propers esdeveniments",
    viewAll: "Veure'ls tots",
    title: "Esdeveniments",
    subtitle: "Activitats i esdeveniments de La Factory.",
    upcoming: "Propers",
    past: "Passats",
    noUpcoming: "No hi ha esdeveniments propers.",
    noPast: "Encara no hi ha esdeveniments passats.",
    join: "M'hi apunto",
    joined: "✓ Estàs apuntat/da",
    full: "Complet",
    cancelAttendance: "Cancel·lar assistència",
    cancelConfirm: "Segur que vols cancel·lar la teva assistència?",
    spotsLeft: (n) => `${n} places disponibles`,
    spotsLeftOne: "1 plaça disponible",
    location: "Lloc",
    capacity: "Aforament",
    registrationClosed: "El termini d'inscripció ha finalitzat.",
    joining: "Apuntant...",
    cancelling: "Cancel·lant...",
    errorFull: "L'esdeveniment s'ha completat.",
    errorClosed: "El termini d'inscripció ha finalitzat.",
    errorNotAuthorized: "No tens accés a aquest esdeveniment.",
    errorGeneric: "No hem pogut completar l'operació. Torna-ho a provar.",
    back: "Tornar a esdeveniments",
  },
  notificationSettings: {
    back: "Tornar al perfil",
    title: "Notificacions",
    subtitle: "Tria quins avisos vols rebre i activa les notificacions push.",
    pushSectionTitle: "Notificacions push",
    pushEnabled: "Notificacions push activades en aquest dispositiu.",
    pushDisabledHint: "Les has bloquejat al navegador. Activa-les des dels ajustos del lloc per rebre-les.",
    activateButton: "Activar notificacions",
    activating: "Activant...",
    deactivateButton: "Desactivar en aquest dispositiu",
    deactivating: "Desactivant...",
    notSupported: "El teu navegador no admet notificacions push.",
    permissionDenied: "No les hem pogut activar: el navegador ha denegat el permís.",
    pushNotActive: "Encara no reps notificacions en aquest mòbil. Prem el botó per activar-les.",
    iosInstallHint: "A l'iPhone, primer afegeix l'app a la pantalla d'inici: prem Compartir i després «Afegir a la pantalla d'inici». Després obre-la des de la icona i torna aquí per activar-les.",
    preferencesTitle: "Què vull rebre",
    preferencesHint: "Tria quins avisos t'interessen. Perquè t'arribin al mòbil, activa també les notificacions push de dalt.",
    bookingReminders: "Recordatoris de reserves",
    packages: "Paquets",
    events: "Esdeveniments",
    saved: "Preferències desades.",
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
    notifications: "Notificacions",
    changePassword: "Canviar contrasenya",
    myDetails: "Les meves dades",
    firstName: "Nom",
    lastName: "Cognoms",
    phone: "Telèfon",
    company: "Empresa",
    language: "Idioma",
    email: "Email",
    emailHint: "Per canviar el teu email, escriu-nos a hola@lafactorycoworking.com.",
    save: "Desar",
    saving: "Desant...",
    saved: "Dades desades.",
    firstNameRequired: "El nom és obligatori.",
    saveError: "No hem pogut desar les dades. Torna-ho a provar.",
    newsletter: "Vull rebre la newsletter de La Factory",
  },
  login: {
    title: "Entrar",
    subtitle: "Accedeix amb el teu email i la teva contrasenya.",
    placeholder: "tu@email.com",
    passwordPlaceholder: "Contrasenya",
    submit: "Entrar",
    submitting: "Entrant...",
    error: "L'email o la contrasenya no són correctes.",
    linkExpired: "L'enllaç ha caducat o ja s'ha fet servir. Demana'n un de nou.",
    forgotPassword: "Has oblidat la contrasenya?",
  },
  recover: {
    title: "Recuperar contrasenya",
    subtitle: "T'enviarem un email amb un enllaç per crear una contrasenya nova.",
    submit: "Enviar email",
    sending: "Enviant...",
    sent: (email) => `Si hi ha un compte amb ${email}, t'hem enviat un email amb un enllaç per crear una contrasenya nova.`,
    error: "No hem pogut enviar l'email. Torna-ho a provar d'aquí a uns minuts.",
    backToLogin: "Tornar a entrar",
  },
  password: {
    title: "Nova contrasenya",
    subtitle: "Tria una contrasenya d'almenys 8 caràcters.",
    newPassword: "Contrasenya nova",
    confirmPassword: "Repeteix la contrasenya",
    submit: "Desar contrasenya",
    saving: "Desant...",
    tooShort: "La contrasenya ha de tenir almenys 8 caràcters.",
    mismatch: "Les contrasenyes no coincideixen.",
    samePassword: "La contrasenya nova ha de ser diferent de l'actual.",
    error: "No hem pogut desar la contrasenya. Torna-ho a provar.",
    back: "Tornar",
    welcomeTitle: "Crea la teva contrasenya",
    welcomeSubtitle: "Et donem la benvinguda al hub de La Factory. Tria una contrasenya d'almenys 8 caràcters per entrar.",
  },
  emails: {
    greeting: (name) => (name ? `Hola ${name},` : "Hola,"),
    linkFallback: "Si el botó no funciona, copia i enganxa aquest enllaç al navegador:",
    invite: {
      subject: "Benvingut/da a La Factory Coworking",
      heading: "Completa el teu registre",
      body: "T'han donat d'alta com a coworker a La Factory Coworking. Completa les teves dades i tria la teva contrasenya per començar a fer servir l'app: reservar sales, veure els teus paquets i assabentar-te dels esdeveniments.",
      cta: "Completar registre",
    },
    welcome: {
      subject: "Ja tens accés al hub de La Factory",
      heading: "Et donem la benvinguda al hub",
      body: "Hem estrenat una app per als coworkers de La Factory: des d'aquí podràs reservar sales, veure els teus paquets i assabentar-te dels esdeveniments. Ja tens el compte preparat; només cal que creïs la teva contrasenya.",
      cta: "Crear la meva contrasenya",
      validity: "L'enllaç és vàlid durant 14 dies.",
    },
  },
  unlinked: {
    title: "El teu compte encara no està vinculat",
    body: "Hem verificat el teu email però no hem trobat cap coworker associat. Contacta amb La Factory per activar-lo.",
    archivedTitle: "El teu compte està arxivat",
    archivedBody: "Ja no tens accés a l'app. Si creus que és un error, escriu-nos a hola@lafactorycoworking.com.",
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
    password: "Contrasenya",
    confirmPassword: "Repeteix la contrasenya",
    passwordHint: "Mínim 8 caràcters. La faràs servir per entrar a l'app.",
  },
  language: { label: "Idioma" },
  admin: {
    nav: {
      dashboard: "Dashboard",
      calendar: "Calendari",
      coworkers: "Coworkers",
      book: "Nova reserva",
      packages: "Paqueteria",
      events: "Esdeveniments",
      bookings: "Reserves",
      users: "Usuaris",
      more: "Més",
      account: "Compte",
      companies: "Empreses",
      billing: "Facturació",
      settings: "Configuració",
      incidents: "Incidències",
    },
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
      roomsNow: "Sales ara",
      busyUntil: (time) => `Ocupada fins a les ${time}`,
      freeUntil: (time) => `Lliure fins a les ${time}`,
      freeRestOfDay: "Lliure la resta del dia",
      packagesTitle: "Paqueteria",
      pendingPackages: (count) =>
        count === 1 ? "1 paquet pendent de recollir" : `${count} paquets pendents de recollir`,
      noPendingPackages: "Cap paquet pendent.",
      latestPackages: "Últims rebuts",
      nextEvent: "Proper esdeveniment",
      noUpcomingEvents: "No hi ha esdeveniments propers.",
      registered: (count, capacity) =>
        capacity ? `${count} de ${capacity} places` : count === 1 ? "1 inscrit" : `${count} inscrits`,
      quickActions: "Accessos ràpids",
      newBooking: "Nova reserva",
      newCoworker: "Nou coworker",
      registerPackage: "Registrar paquet",
      newEvent: "Crear esdeveniment",
      seeAll: "Veure-ho tot",
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
      title: "Usuaris",
      subtitle: "Tota la comunitat: coworkers, convidats i admins.",
      name: "Nom",
      plan: "Tarifa",
      status: "Estat",
      used: "Utilitzades",
      available: "Disponibles",
      noCoworkers: "Encara no hi ha ningú donat d'alta.",
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
      statusNoAccess: "Sense accés",
      statusWelcomeSent: "Benvinguda enviada",
      sendWelcome: "Enviar benvinguda",
      sendingWelcome: "Enviant...",
      sendWelcomeAll: (count) => `Enviar benvinguda a tothom (${count})`,
      sendWelcomeConfirm: (count) =>
        `S'enviarà un email de benvinguda a ${count} ${count === 1 ? "coworker" : "coworkers"} perquè creïn la seva contrasenya. Continuar?`,
      welcomeSent: (count) => `Benvinguda enviada a ${count} ${count === 1 ? "coworker" : "coworkers"}.`,
      welcomeError: "No hem pogut enviar la benvinguda. Torna-ho a provar.",
      access: "Accés a l'app",
      filterAll: "Tots",
      filterCoworkers: "Coworkers",
      filterGuests: "Convidats",
      filterAdmins: "Admins",
      filterArchived: "Arxivats",
      searchPlaceholder: "Cerca per nom o email",
      search: "Cercar",
      kindAdmin: "Admin",
      kindCoworker: "Coworker",
      kindGuest: "Convidat",
      kindArchived: "Arxivat",
      sharedWith: (name) => `Comparteix amb ${name}`,
      noResults: "No hi ha ningú amb aquests filtres.",
    },
    userDetail: {
      sectionPersonal: "Dades personals",
      firstName: "Nom",
      lastName: "Cognoms",
      nif: "NIF",
      phone: "Telèfon",
      email: "Email",
      emailHint: "És el seu usuari per entrar a l'app; de moment no es canvia des d'aquí.",
      company: "Empresa",
      language: "Idioma",
      sectionStatus: "Estat i permisos",
      archived: "Perfil arxivat",
      archivedHint: "No pot entrar a l'app ni apareix en reserves, paquets ni comunicacions. El seu historial es conserva.",
      canReceivePackages: "Pot rebre paquets",
      newsletter: "Newsletter",
      sectionPlan: "Tarifa",
      noPlan: "Sense tarifa pròpia",
      since: (date) => `Des del ${date}`,
      until: (date) => `fins al ${date}`,
      billable: "Facturable",
      billableHint: "Desmarca-ho per a cortesies, socis o intercanvis.",
      endPlan: "Finalitzar tarifa",
      endDate: "Últim dia",
      newPlan: "Assignar tarifa",
      plan: "Tarifa",
      startDate: "Data d'inici",
      assign: "Assignar",
      sharedWith: "Comparteix les hores de",
      sharedHint: "Reserva i gasta de les hores d'una altra persona, que és qui paga. No és facturable.",
      noShare: "No comparteix",
      sectionBilling: "Facturació",
      billTo: "Es factura a",
      billToPerson: "La mateixa persona",
      billToCompany: "Una empresa",
      chooseCompany: "Tria empresa",
      manageCompanies: "Gestionar empreses",
      address: "Adreça",
      city: "Població",
      postalCode: "Codi postal",
      province: "Província",
      country: "País",
      sectionAdmin: "Administratiu",
      holdedId: "ID de contacte a Holded",
      internalNotes: "Observacions internes",
      save: "Desar",
      saving: "Desant...",
      saved: "Desat.",
      error: "No s'ha pogut desar. Torna-ho a provar.",
      firstNameRequired: "El nom és obligatori.",
    },
    companies: {
      title: "Empreses",
      subtitle: "Entitats a les quals es facturen alguns coworkers.",
      newCompany: "Nova empresa",
      noCompanies: "Encara no hi ha empreses.",
      name: "Raó social",
      taxId: "CIF / NIF",
      billingEmail: "Email de facturació",
      notes: "Notes",
      people: (count) => (count === 1 ? "1 persona" : `${count} persones`),
      back: "Tornar a empreses",
      nameRequired: "La raó social és obligatòria.",
    },
    billing: {
      title: "Facturació",
      subtitle: (month) => `Qui cal facturar el ${month}. La factura s'emet a Holded.`,
      person: "Persona",
      plan: "Tarifa",
      amount: "Import",
      billTo: "Es factura a",
      invoiced: "Facturat",
      issues: "Avisos",
      total: "Total previst",
      progress: (done, total) => `${done} de ${total} facturades`,
      noLines: "No hi ha ningú per facturar aquest mes.",
      notBillableTitle: "Amb tarifa però no facturables",
      noPrice: "Tarifa sense preu",
      noTaxId: "Falta NIF/CIF",
      noAddress: "Falta adreça fiscal",
      noHoldedId: "Sense ID de Holded",
      startsMidMonth: (date) => `Alta el ${date}`,
      endsMidMonth: (date) => `Baixa el ${date}`,
      setPrices: "Posar preus",
    },
    settings: {
      title: "Configuració",
      subtitle: "Ajustos generals de La Factory.",
      plansTitle: "Tarifes",
      monthlyHours: "Hores de sala al mes",
      price: "Preu mensual (€)",
      invalidPrice: "El preu no és vàlid.",
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
      back: "Tornar a usuaris",
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
      adjustTitle: "Afegir o treure hores",
      adjustHint: "S'aplica a les hores d'aquest mes.",
      hours: "Hores",
      reasonPlaceholder: "Motiu (opcional)",
      addHours: "Afegir",
      removeHours: "Treure",
      invalidHours: "Indica un nombre d'hores més gran que zero.",
      hoursUpdated: "Hores actualitzades.",
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
      typeGuest: "Convidat",
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
      bookingFor: "Reserva per a",
      typeExternal: "Client extern",
      typeOther: "Altre",
      nameLabel: "Nom del client",
      eventNameLabel: "Nom de l'esdeveniment (opcional)",
      otherNameLabel: "Descripció (opcional)",
      notesLabel: "Notes (opcional)",
      notesPlaceholder: "Empresa, telèfon, el que necessiti...",
      nameRequired: "Escriu el nom del client.",
      contactRequired: "Tria per a qui és la reserva.",
      bookedThisMonth: (hours) => `Has reservat ${hours} aquest mes`,
      eventFallback: "Esdeveniment",
      otherFallback: "Reserva interna",
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
      success: (name) => `Paquet registrat. Hem avisat ${name}.`,
      registerAnother: "Registrar un altre paquet",
      backHome: "Tornar a inici",
      photoRequired: "Afegeix una foto del paquet.",
      recipientRequired: "Tria a qui va dirigit el paquet.",
    },
    events: {
      title: "Esdeveniments",
      subtitle: "Activitats i esdeveniments interns de La Factory.",
      newEvent: "+ Crear esdeveniment",
      attendeesLabel: (n) => `${n} inscrits`,
      viewAttendees: "Veure assistents",
      cancelEvent: "Cancel·lar esdeveniment",
      cancelConfirm: "Segur que vols cancel·lar aquest esdeveniment?",
      noEvents: "Encara no hi ha esdeveniments.",
      statusCancelled: "Cancel·lat",
      unlimitedCapacity: "Sense límit",
      edit: "Editar",
    },
    newEventForm: {
      title: "Crear esdeveniment",
      titleLabel: "Títol",
      descriptionLabel: "Descripció",
      imageLabel: "Imatge",
      dateLabel: "Data",
      startTimeLabel: "Hora d'inici",
      endTimeLabel: "Hora de fi",
      locationLabel: "Lloc",
      roomLabel: "Sala",
      noRoom: "Cap",
      blockRoomLabel: "Bloquejar sala durant l'esdeveniment",
      capacityLabel: "Aforament",
      capacityOptional: "opcional, sense límit si es deixa en blanc",
      registrationDeadlineLabel: "Data límit d'inscripció",
      deadlineOptional: "opcional",
      audienceLabel: "Públic objectiu",
      audienceAll: "Tots els coworkers",
      audiencePlan: "Un pla concret",
      audienceContacts: "Persones concretes",
      audienceSearchPlaceholder: "Cerca un coworker...",
      submit: "Crear esdeveniment",
      submitting: "Creant...",
      success: "Esdeveniment creat i avís enviat.",
      titleRequired: "Afegeix un títol per a l'esdeveniment.",
      backToList: "Tornar a esdeveniments",
      editTitle: "Editar esdeveniment",
      editSubmit: "Desar canvis",
      editSuccess: "Canvis desats.",
    },
    eventAttendees: {
      title: "Assistents",
      back: "Tornar a l'esdeveniment",
      registered: "Apuntats",
      cancelled: "Cancel·lats",
      noAttendees: "Encara no hi ha inscrits.",
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
  nav: {
    home: "Home",
    book: "Book",
    bookings: "My bookings",
    profile: "Profile",
    events: "Events",
    packages: "My packages",
    incidents: "Issues",
  },
  home: {
    greeting: "Hi",
    subtitle: "Great to have you here",
    noActivePlan: "You don't have an active plan this month.",
    guestNotice: "You don't have an active plan right now, but you're still part of the community: events, packages and notices.",
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
    receivedByLabel: "Received by",
    receivedBy: (name) => `Received by ${name}`,
    view: "View",
    homeBannerOne: "You have 1 package waiting",
    homeBannerMany: (count) => `You have ${count} packages waiting`,
    homeBannerReceived: (when) => `Received ${when}`,
    registerAction: "Register a package",
    registerActionSubtitle: "Did a package arrive for someone? Let them know in a moment.",
    emailSubject: "You have a package at La Factory 📦",
    emailGreeting: (name) => `Hi ${name},`,
    emailBody: "A package has arrived for you at La Factory. Pick it up whenever you like.",
    emailCta: "View package",
    markCollected: "I've picked it up",
    markAllCollected: "I've picked them all up",
    marking: "Saving...",
    markError: "We couldn't save that. Please try again.",
  },
  incidents: {
    title: "Issues",
    subtitle: "Something not working in the space? Let us know and we'll fix it.",
    report: "Report an issue",
    reportTitle: "New issue",
    category: "What's wrong?",
    categories: {
      internet: "Internet / wifi",
      climate: "Heating / AC",
      cleaning: "Cleaning",
      room: "Room",
      furniture: "Furniture",
      access: "Access",
      other: "Other",
    },
    description: "Tell us what's happening",
    descriptionPlaceholder: "Where, since when, what you've noticed...",
    photo: "Photo (optional)",
    addPhoto: "Add photo",
    changePhoto: "Change photo",
    submit: "Send",
    submitting: "Sending...",
    sent: "Thanks, we've got it. We'll let you know when there's news.",
    descriptionRequired: "Describe the issue.",
    openTitle: "Open in the space",
    openHint: "If what you see is already here, no need to report it again.",
    mineTitle: "My issues",
    noneOpen: "No open issues right now.",
    noneMine: "You haven't reported any issues.",
    status: { pending: "Pending", in_progress: "In progress", resolved: "Resolved" },
    adminNote: "Reply from La Factory",
    homeCta: "Something not working?",
    homeCtaSubtitle: "Report an issue in the space.",
    reportedBy: "Reported by",
    filterOpen: "Open",
    filterResolved: "Resolved",
    filterAll: "All",
    notePlaceholder: "Note for whoever reported it (optional)",
    save: "Save",
    none: "No issues.",
    pendingCount: (count) => (count === 1 ? "1 pending" : `${count} pending`),
  },
  notifications: {
    title: "Notifications",
    empty: "You have no notifications.",
    incidentNewTitle: "🛠️ New issue reported",
    incidentUpdateTitle: "🛠️ Your issue has been updated",
    incidentUpdateBody: (status) => `Status: ${status}`,
    genericTitle: "Notification",
    genericBody: "",
    packageReceivedTitle: "📦 You have a package",
    packageReceivedBody: (when) => `A package has arrived for you at La Factory.\n${when}`,
    eventNewTitle: "🎉 New event at La Factory",
    eventNewBody: (eventTitle, when) => `${eventTitle} · ${when}`,
    bookingReminderTitle: "⏰ Your booking starts in 1 hour",
    bookingReminderBody: (roomName, timeRange) => `${roomName} · ${timeRange}`,
  },
  events: {
    homeTitle: "Upcoming events",
    viewAll: "View all",
    title: "Events",
    subtitle: "Activities and events at La Factory.",
    upcoming: "Upcoming",
    past: "Past",
    noUpcoming: "No upcoming events.",
    noPast: "No past events yet.",
    join: "I'm in",
    joined: "✓ You're signed up",
    full: "Full",
    cancelAttendance: "Cancel attendance",
    cancelConfirm: "Are you sure you want to cancel your attendance?",
    spotsLeft: (n) => `${n} spots left`,
    spotsLeftOne: "1 spot left",
    location: "Location",
    capacity: "Capacity",
    registrationClosed: "Registration has closed.",
    joining: "Signing up...",
    cancelling: "Cancelling...",
    errorFull: "This event is full.",
    errorClosed: "Registration has closed.",
    errorNotAuthorized: "You don't have access to this event.",
    errorGeneric: "We couldn't complete the operation. Please try again.",
    back: "Back to events",
  },
  notificationSettings: {
    back: "Back to profile",
    title: "Notifications",
    subtitle: "Choose which alerts you want, and turn on push notifications.",
    pushSectionTitle: "Push notifications",
    pushEnabled: "Push notifications are on for this device.",
    pushDisabledHint: "You've blocked them in your browser. Turn them back on from the site settings to receive them.",
    activateButton: "Turn on notifications",
    activating: "Turning on...",
    deactivateButton: "Turn off on this device",
    deactivating: "Turning off...",
    notSupported: "Your browser doesn't support push notifications.",
    permissionDenied: "We couldn't turn them on: the browser denied permission.",
    pushNotActive: "You're not getting notifications on this phone yet. Tap the button to turn them on.",
    iosInstallHint: "On iPhone, first add the app to your Home Screen: tap Share, then “Add to Home Screen”. Then open it from the icon and come back here to turn them on.",
    preferencesTitle: "What I want to receive",
    preferencesHint: "Pick which alerts you care about. To get them on your phone, also turn on push notifications above.",
    bookingReminders: "Booking reminders",
    packages: "Packages",
    events: "Events",
    saved: "Preferences saved.",
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
    notifications: "Notifications",
    changePassword: "Change password",
    myDetails: "My details",
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone",
    company: "Company",
    language: "Language",
    email: "Email",
    emailHint: "To change your email, write to us at hola@lafactorycoworking.com.",
    save: "Save",
    saving: "Saving...",
    saved: "Details saved.",
    firstNameRequired: "First name is required.",
    saveError: "We couldn't save your details. Please try again.",
    newsletter: "I want to receive the La Factory newsletter",
  },
  login: {
    title: "Sign in",
    subtitle: "Sign in with your email and password.",
    placeholder: "you@email.com",
    passwordPlaceholder: "Password",
    submit: "Sign in",
    submitting: "Signing in...",
    error: "The email or password is incorrect.",
    linkExpired: "That link has expired or was already used. Request a new one.",
    forgotPassword: "Forgot your password?",
  },
  recover: {
    title: "Reset password",
    subtitle: "We'll email you a link to create a new password.",
    submit: "Send email",
    sending: "Sending...",
    sent: (email) => `If there's an account for ${email}, we've emailed you a link to create a new password.`,
    error: "We couldn't send the email. Please try again in a few minutes.",
    backToLogin: "Back to sign in",
  },
  password: {
    title: "New password",
    subtitle: "Choose a password with at least 8 characters.",
    newPassword: "New password",
    confirmPassword: "Repeat password",
    submit: "Save password",
    saving: "Saving...",
    tooShort: "The password must be at least 8 characters long.",
    mismatch: "The passwords don't match.",
    samePassword: "The new password must be different from your current one.",
    error: "We couldn't save the password. Please try again.",
    back: "Back",
    welcomeTitle: "Create your password",
    welcomeSubtitle: "Welcome to the La Factory hub. Choose a password with at least 8 characters to sign in.",
  },
  emails: {
    greeting: (name) => (name ? `Hi ${name},` : "Hi,"),
    linkFallback: "If the button doesn't work, copy and paste this link into your browser:",
    invite: {
      subject: "Welcome to La Factory Coworking",
      heading: "Complete your sign-up",
      body: "You've been added as a coworker at La Factory Coworking. Fill in your details and choose your password to start using the app: book rooms, check your packages and keep up with events.",
      cta: "Complete sign-up",
    },
    welcome: {
      subject: "You now have access to the La Factory hub",
      heading: "Welcome to the hub",
      body: "We've launched an app for La Factory coworkers: book rooms, check your packages and keep up with events, all in one place. Your account is ready; you just need to create your password.",
      cta: "Create my password",
      validity: "The link is valid for 14 days.",
    },
  },
  unlinked: {
    title: "Your account isn't linked yet",
    body: "We verified your email but couldn't find a matching coworker. Contact La Factory to activate it.",
    archivedTitle: "Your account is archived",
    archivedBody: "You no longer have access to the app. If you think this is a mistake, write to us at hola@lafactorycoworking.com.",
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
    password: "Password",
    confirmPassword: "Repeat password",
    passwordHint: "At least 8 characters. You'll use it to sign in to the app.",
  },
  language: { label: "Language" },
  admin: {
    nav: {
      dashboard: "Dashboard",
      calendar: "Calendar",
      coworkers: "Coworkers",
      book: "New booking",
      packages: "Packages",
      events: "Events",
      bookings: "Bookings",
      users: "Users",
      more: "More",
      account: "Account",
      companies: "Companies",
      billing: "Billing",
      settings: "Settings",
      incidents: "Issues",
    },
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
      roomsNow: "Rooms right now",
      busyUntil: (time) => `Busy until ${time}`,
      freeUntil: (time) => `Free until ${time}`,
      freeRestOfDay: "Free for the rest of the day",
      packagesTitle: "Packages",
      pendingPackages: (count) =>
        count === 1 ? "1 package waiting to be picked up" : `${count} packages waiting to be picked up`,
      noPendingPackages: "No packages waiting.",
      latestPackages: "Latest received",
      nextEvent: "Next event",
      noUpcomingEvents: "No upcoming events.",
      registered: (count, capacity) =>
        capacity ? `${count} of ${capacity} spots` : count === 1 ? "1 attendee" : `${count} attendees`,
      quickActions: "Quick actions",
      newBooking: "New booking",
      newCoworker: "New coworker",
      registerPackage: "Register package",
      newEvent: "Create event",
      seeAll: "See all",
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
      title: "Users",
      subtitle: "The whole community: coworkers, guests and admins.",
      name: "Name",
      plan: "Plan",
      status: "Status",
      used: "Used",
      available: "Available",
      noCoworkers: "Nobody has been added yet.",
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
      statusNoAccess: "No access",
      statusWelcomeSent: "Welcome sent",
      sendWelcome: "Send welcome",
      sendingWelcome: "Sending...",
      sendWelcomeAll: (count) => `Send welcome to everyone (${count})`,
      sendWelcomeConfirm: (count) =>
        `A welcome email will go to ${count} ${count === 1 ? "coworker" : "coworkers"} so they can create their password. Continue?`,
      welcomeSent: (count) => `Welcome sent to ${count} ${count === 1 ? "coworker" : "coworkers"}.`,
      welcomeError: "We couldn't send the welcome email. Please try again.",
      access: "App access",
      filterAll: "All",
      filterCoworkers: "Coworkers",
      filterGuests: "Guests",
      filterAdmins: "Admins",
      filterArchived: "Archived",
      searchPlaceholder: "Search by name or email",
      search: "Search",
      kindAdmin: "Admin",
      kindCoworker: "Coworker",
      kindGuest: "Guest",
      kindArchived: "Archived",
      sharedWith: (name) => `Shares with ${name}`,
      noResults: "Nobody matches these filters.",
    },
    userDetail: {
      sectionPersonal: "Personal details",
      firstName: "First name",
      lastName: "Last name",
      nif: "Tax ID",
      phone: "Phone",
      email: "Email",
      emailHint: "It's their app login; it can't be changed from here yet.",
      company: "Company",
      language: "Language",
      sectionStatus: "Status and permissions",
      archived: "Archived profile",
      archivedHint: "Can't sign in and doesn't appear in bookings, packages or communications. Their history is kept.",
      canReceivePackages: "Can receive packages",
      newsletter: "Newsletter",
      sectionPlan: "Plan",
      noPlan: "No plan of their own",
      since: (date) => `Since ${date}`,
      until: (date) => `until ${date}`,
      billable: "Billable",
      billableHint: "Untick it for courtesies, partners or exchanges.",
      endPlan: "End plan",
      endDate: "Last day",
      newPlan: "Assign plan",
      plan: "Plan",
      startDate: "Start date",
      assign: "Assign",
      sharedWith: "Shares the hours of",
      sharedHint: "Books and uses someone else's hours; that person pays. Not billable.",
      noShare: "Doesn't share",
      sectionBilling: "Billing",
      billTo: "Invoice goes to",
      billToPerson: "The person themselves",
      billToCompany: "A company",
      chooseCompany: "Choose a company",
      manageCompanies: "Manage companies",
      address: "Address",
      city: "City",
      postalCode: "Postcode",
      province: "Province",
      country: "Country",
      sectionAdmin: "Admin",
      holdedId: "Holded contact ID",
      internalNotes: "Internal notes",
      save: "Save",
      saving: "Saving...",
      saved: "Saved.",
      error: "Couldn't save. Please try again.",
      firstNameRequired: "First name is required.",
    },
    companies: {
      title: "Companies",
      subtitle: "Entities some coworkers are invoiced to.",
      newCompany: "New company",
      noCompanies: "No companies yet.",
      name: "Company name",
      taxId: "Tax ID",
      billingEmail: "Billing email",
      notes: "Notes",
      people: (count) => (count === 1 ? "1 person" : `${count} people`),
      back: "Back to companies",
      nameRequired: "The company name is required.",
    },
    billing: {
      title: "Billing",
      subtitle: (month) => `Who to invoice in ${month}. Invoices are issued in Holded.`,
      person: "Person",
      plan: "Plan",
      amount: "Amount",
      billTo: "Invoice to",
      invoiced: "Invoiced",
      issues: "Warnings",
      total: "Expected total",
      progress: (done, total) => `${done} of ${total} invoiced`,
      noLines: "Nobody to invoice this month.",
      notBillableTitle: "With a plan but not billable",
      noPrice: "Plan has no price",
      noTaxId: "Missing tax ID",
      noAddress: "Missing fiscal address",
      noHoldedId: "No Holded ID",
      startsMidMonth: (date) => `Starts ${date}`,
      endsMidMonth: (date) => `Ends ${date}`,
      setPrices: "Set prices",
    },
    settings: {
      title: "Settings",
      subtitle: "General settings for La Factory.",
      plansTitle: "Plans",
      monthlyHours: "Room hours per month",
      price: "Monthly price (€)",
      invalidPrice: "That price isn't valid.",
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
      back: "Back to users",
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
      adjustTitle: "Add or remove hours",
      adjustHint: "Applies to this month's hours.",
      hours: "Hours",
      reasonPlaceholder: "Reason (optional)",
      addHours: "Add",
      removeHours: "Remove",
      invalidHours: "Enter a number of hours above zero.",
      hoursUpdated: "Hours updated.",
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
      typeGuest: "Guest",
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
      bookingFor: "Booking for",
      typeExternal: "External client",
      typeOther: "Other",
      nameLabel: "Client name",
      eventNameLabel: "Event name (optional)",
      otherNameLabel: "Description (optional)",
      notesLabel: "Notes (optional)",
      notesPlaceholder: "Company, phone, anything they need...",
      nameRequired: "Enter the client's name.",
      contactRequired: "Choose who the booking is for.",
      bookedThisMonth: (hours) => `You've booked ${hours} this month`,
      eventFallback: "Event",
      otherFallback: "Internal booking",
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
      success: (name) => `Package registered. We've notified ${name}.`,
      registerAnother: "Register another package",
      backHome: "Back to home",
      photoRequired: "Add a photo of the package.",
      recipientRequired: "Choose who the package is for.",
    },
    events: {
      title: "Events",
      subtitle: "Internal activities and events at La Factory.",
      newEvent: "+ Create event",
      attendeesLabel: (n) => `${n} registered`,
      viewAttendees: "View attendees",
      cancelEvent: "Cancel event",
      cancelConfirm: "Are you sure you want to cancel this event?",
      noEvents: "No events yet.",
      statusCancelled: "Cancelled",
      unlimitedCapacity: "No limit",
      edit: "Edit",
    },
    newEventForm: {
      title: "Create event",
      titleLabel: "Title",
      descriptionLabel: "Description",
      imageLabel: "Image",
      dateLabel: "Date",
      startTimeLabel: "Start time",
      endTimeLabel: "End time",
      locationLabel: "Location",
      roomLabel: "Room",
      noRoom: "None",
      blockRoomLabel: "Block room during the event",
      capacityLabel: "Capacity",
      capacityOptional: "optional, no limit if left blank",
      registrationDeadlineLabel: "Registration deadline",
      deadlineOptional: "optional",
      audienceLabel: "Target audience",
      audienceAll: "All coworkers",
      audiencePlan: "A specific plan",
      audienceContacts: "Specific people",
      audienceSearchPlaceholder: "Search coworker...",
      submit: "Create event",
      submitting: "Creating...",
      success: "Event created and notification sent.",
      titleRequired: "Add a title for the event.",
      backToList: "Back to events",
      editTitle: "Edit event",
      editSubmit: "Save changes",
      editSuccess: "Changes saved.",
    },
    eventAttendees: {
      title: "Attendees",
      back: "Back to event",
      registered: "Registered",
      cancelled: "Cancelled",
      noAttendees: "No one has registered yet.",
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
