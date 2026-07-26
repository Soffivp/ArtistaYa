import { useState, useEffect } from "react";
import { Search, Calendar, DollarSign, CheckCircle, MessageCircle, FileText, CreditCard, Menu, X, Star, MapPin, Award, Clock, Users, ArrowRight, ChevronDown, Send, Filter, Download, Bell, User, LogOut, Home, CalendarDays, FileCheck, Plus, Edit2, Eye, ArrowLeft, ChevronLeft, ChevronRight, Lock, Camera, Trash2, AlertTriangle, Save, Banknote, FileSignature, UploadCloud } from "lucide-react";
import { toast, Toaster } from "sonner";
import api from "./api";

type View =
  | "landing"
  | "catalog"
  | "artist-profile"
  | "register"
  | "login"
  | "chat"
  | "booking"
  | "organizer-dashboard"
  | "artist-dashboard"
  | "organizer-agenda"
  | "artist-agenda"
  | "organizer-contracts"
  | "artist-contracts"
  | "organizer-profile"
  | "artist-profile-edit"
  | "review"
  | "all-reviews"
  | "forgot-password"
  | "forgot-sent"
  | "reset-password";

type UserRole = "guest" | "organizer" | "artist";

interface Artist {
  id: string;
  name: string;
  discipline: string[];
  photo: string;
  rating: number;
  reviews: number;
  price: number;
  verified: boolean;
  description: string;
  location: string;
  experience: number;
  portfolio: string[];
  video: string;
}

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Booking {
  id: string;
  artistName: string;
  artistPhoto: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  status: "confirmed" | "in-escrow" | "completed" | "cancelled";
  amount: number;
  contractNumber?: string;
}

interface Notification {
  id: string;
  type: "message" | "booking" | "payment" | "contract" | "review";
  title: string;
  description: string;
  timestamp: string;
  group: "today" | "yesterday" | "week" | "earlier";
  read: boolean;
  navigateTo?: View;
  roles: ("organizer" | "artist")[];
}

interface Contract {
  id: string;
  contractNumber: string;
  artistName?: string;
  organizerName?: string;
  discipline?: string;
  eventType: string;
  eventDate: string;
  location: string;
  amount: number;
  netAmount?: number;
  contractStatus: "signed" | "signed-physical" | "pending-artist" | "pending-organizer" | "cancelled";
  paymentStatus?: "in-escrow" | "released" | "pending";
  signedDate?: string;
}

const sampleArtists: Artist[] = [
  {
    id: "1",
    name: "María Elena Solís",
    discipline: ["Danza", "Ballet"],
    photo: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 23,
    price: 120,
    verified: true,
    description: "Bailarina profesional con 15 años de experiencia en ballet clásico y contemporáneo. He participado en más de 50 eventos corporativos y sociales.",
    location: "Loja, Ecuador",
    experience: 15,
    portfolio: [
      "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=600&h=400&fit=crop"
    ],
    video: "https://example.com/video1"
  },
  {
    id: "2",
    name: "Carlos Andrade Trío",
    discipline: ["Música", "Jazz"],
    photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 31,
    price: 250,
    verified: true,
    description: "Trío de jazz profesional especializado en eventos corporativos y bodas. Repertorio amplio desde clásicos hasta música latina.",
    location: "Loja, Ecuador",
    experience: 12,
    portfolio: [
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=600&h=400&fit=crop"
    ],
    video: "https://example.com/video2"
  },
  {
    id: "3",
    name: "Lucía Romero",
    discipline: ["Teatro", "Animación"],
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    rating: 5.0,
    reviews: 18,
    price: 90,
    verified: true,
    description: "Actriz y animadora especializada en eventos infantiles y corporativos. Experiencia en teatro de calle y performance.",
    location: "Loja, Ecuador",
    experience: 8,
    portfolio: [
      "https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=400&fit=crop"
    ],
    video: "https://example.com/video3"
  },
  {
    id: "4",
    name: "Diego Valdivieso",
    discipline: ["Circo", "Malabares"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 14,
    price: 110,
    verified: true,
    description: "Artista circense profesional con especialidad en malabares, acrobacia y fuego. Ideal para eventos al aire libre.",
    location: "Loja, Ecuador",
    experience: 10,
    portfolio: [
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop"
    ],
    video: "https://example.com/video4"
  },
  {
    id: "5",
    name: "Sofía Mendoza",
    discipline: ["Música", "Voz"],
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 27,
    price: 150,
    verified: true,
    description: "Cantante lírica con formación en conservatorio. Especializada en repertorio clásico y popular para eventos elegantes.",
    location: "Loja, Ecuador",
    experience: 14,
    portfolio: [
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=600&h=400&fit=crop"
    ],
    video: "https://example.com/video5"
  },
  {
    id: "6",
    name: "Andrés Castillo",
    discipline: ["Magia", "Ilusionismo"],
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 22,
    price: 130,
    verified: true,
    description: "Mago profesional especializado en close-up magic y grandes ilusiones. Perfecto para eventos corporativos y fiestas.",
    location: "Loja, Ecuador",
    experience: 11,
    portfolio: [
      "https://images.unsplash.com/photo-1576267423048-15c0040fec78?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514416205405-3c4f451d35c5?w=600&h=400&fit=crop"
    ],
    video: "https://example.com/video6"
  }
];

const sampleOrganizerBookings: Booking[] = [
  {
    id: "1",
    artistName: "María Elena Solís",
    artistPhoto: sampleArtists[0].photo,
    eventType: "Evento corporativo",
    date: "25 Mayo 2026",
    time: "19:00",
    location: "Hotel Libertador, Loja",
    status: "in-escrow",
    amount: 120,
    contractNumber: "ARY-2026-0042"
  },
  {
    id: "2",
    artistName: "Carlos Andrade Trío",
    artistPhoto: sampleArtists[1].photo,
    eventType: "Boda",
    date: "3 Junio 2026",
    time: "18:00",
    location: "Quinta Los Jardines",
    status: "confirmed",
    amount: 250,
    contractNumber: "ARY-2026-0043"
  },
  {
    id: "3",
    artistName: "Lucía Romero",
    artistPhoto: sampleArtists[2].photo,
    eventType: "Fiesta infantil",
    date: "10 Marzo 2026",
    time: "15:00",
    location: "Casa de la Cultura",
    status: "completed",
    amount: 90,
    contractNumber: "ARY-2026-0028"
  }
];

const sampleArtistBookings: Booking[] = [
  {
    id: "1",
    artistName: "Andrea Mora",
    artistPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    eventType: "Evento corporativo",
    date: "25 Mayo 2026",
    time: "19:00",
    location: "Hotel Libertador, Loja",
    status: "in-escrow",
    amount: 105.60,
    contractNumber: "ARY-2026-0042"
  },
  {
    id: "2",
    artistName: "Roberto Castro",
    artistPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    eventType: "Boda",
    date: "3 Junio 2026",
    time: "18:00",
    location: "Quinta Los Jardines",
    status: "confirmed",
    amount: 220,
    contractNumber: "ARY-2026-0043"
  }
];

const sampleContracts: Contract[] = [
  {
    id: "1",
    contractNumber: "ARY-2026-0042",
    artistName: "María Elena Solís",
    discipline: "Danza",
    eventType: "Evento corporativo",
    eventDate: "25 Mayo 2026",
    location: "Hotel Libertador, Loja",
    amount: 120,
    netAmount: 105.60,
    contractStatus: "signed",
    paymentStatus: "in-escrow",
    signedDate: "15 Mayo 2026"
  },
  {
    id: "2",
    contractNumber: "ARY-2026-0043",
    artistName: "Carlos Andrade Trío",
    discipline: "Música",
    eventType: "Boda",
    eventDate: "3 Junio 2026",
    location: "Quinta Los Jardines",
    amount: 250,
    netAmount: 220,
    contractStatus: "pending-artist",
    paymentStatus: "pending"
  },
  {
    id: "3",
    contractNumber: "ARY-2026-0028",
    artistName: "Lucía Romero",
    discipline: "Teatro",
    eventType: "Fiesta infantil",
    eventDate: "10 Marzo 2026",
    location: "Casa de la Cultura",
    amount: 90,
    netAmount: 79.20,
    contractStatus: "signed",
    paymentStatus: "released",
    signedDate: "1 Marzo 2026"
  }
];

const sampleNotifications: Notification[] = [
  {
    id: "n1",
    type: "message",
    title: "Carlos Méndez te envió un mensaje",
    description: "Hola, quisiera contratarte para mi evento del 20 de julio...",
    timestamp: "Hace 5 min",
    group: "today",
    read: false,
    navigateTo: "chat",
    roles: ["artist"]
  },
  {
    id: "n2",
    type: "payment",
    title: "Pago en custodia",
    description: "El pago de $120 permanece retenido hasta 24h después del evento.",
    timestamp: "Hace 2 h",
    group: "today",
    read: false,
    navigateTo: "artist-contracts",
    roles: ["artist"]
  },
  {
    id: "n3",
    type: "booking",
    title: "¡Reserva confirmada!",
    description: "Tu evento del 15 de julio con Danza Andina está confirmado.",
    timestamp: "Hace 3 h",
    group: "today",
    read: false,
    navigateTo: "organizer-agenda",
    roles: ["organizer"]
  },
  {
    id: "n4",
    type: "contract",
    title: "Contrato listo para firmar",
    description: "María Elena Solís ha enviado el contrato ARY-2026-0042 para tu revisión.",
    timestamp: "Hace 5 h",
    group: "today",
    read: true,
    navigateTo: "organizer-contracts",
    roles: ["organizer"]
  },
  {
    id: "n5",
    type: "message",
    title: "Andrea Mora te envió un mensaje",
    description: "¿Puedes confirmarme el horario de llegada al venue?",
    timestamp: "Ayer, 14:30",
    group: "yesterday",
    read: true,
    navigateTo: "chat",
    roles: ["artist"]
  },
  {
    id: "n6",
    type: "payment",
    title: "¡Pago liberado!",
    description: "Se han transferido $105.60 a tu cuenta. El evento fue marcado como completado.",
    timestamp: "Ayer, 10:15",
    group: "yesterday",
    read: true,
    navigateTo: "artist-contracts",
    roles: ["artist"]
  },
  {
    id: "n7",
    type: "payment",
    title: "Pago procesado",
    description: "Tu pago de $120 fue procesado y está en custodia para el evento del 25 de mayo.",
    timestamp: "Ayer, 09:00",
    group: "yesterday",
    read: true,
    navigateTo: "organizer-contracts",
    roles: ["organizer"]
  },
  {
    id: "n8",
    type: "review",
    title: "Nueva reseña recibida",
    description: "Andrea Mora te dejó 5 estrellas: \"Excelente presentación en nuestra boda\"",
    timestamp: "12 jun",
    group: "week",
    read: true,
    navigateTo: "artist-profile-edit",
    roles: ["artist"]
  },
  {
    id: "n9",
    type: "booking",
    title: "Solicitud de reserva recibida",
    description: "Roberto Castro quiere contratarte para un evento corporativo el 3 de junio.",
    timestamp: "11 jun",
    group: "week",
    read: true,
    navigateTo: "artist-agenda",
    roles: ["artist"]
  },
  {
    id: "n10",
    type: "contract",
    title: "Contrato firmado por el artista",
    description: "Carlos Andrade Trío ha firmado el contrato ARY-2026-0043. Ya puedes realizar el pago.",
    timestamp: "10 jun",
    group: "earlier",
    read: true,
    navigateTo: "organizer-contracts",
    roles: ["organizer"]
  }
];

export default function App() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const [priceRange, setPriceRange] = useState(500);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [bookingStep, setBookingStep] = useState(1);
  const [registerStep, setRegisterStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"organizer" | "artist" | null>(null);
  const [agendaView, setAgendaView] = useState<"list" | "calendar">("list");
  const [agendaFilter, setAgendaFilter] = useState("all");
  const [contractsSearchTerm, setContractsSearchTerm] = useState("");
  const [contractFilter, setContractFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifFilter, setNotifFilter] = useState<"all" | "message" | "booking" | "payment" | "system">("all");
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [includesTransport, setIncludesTransport] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetContract, setUploadTargetContract] = useState<Contract | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadFileSize, setUploadFileSize] = useState<string | null>(null);
  const [physicallySignedIds, setPhysicallySignedIds] = useState<Set<string>>(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<Booking | null>(null);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set());
  const [reviewsFilter, setReviewsFilter] = useState<"recent" | "best" | "worst">("recent");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [artistReplies, setArtistReplies] = useState<Record<number, string>>({});
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // Para registro (paso de email/password)
  const [regEmail, setRegEmail] = useState("");
  const [regPassword1, setRegPassword1] = useState("");
  const [regPassword2, setRegPassword2] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setAuthLoading(false);
        return;
    }
      try {
        const { data } = await api.get("/dj-rest-auth/user/");
        const role: UserRole = data.rol === "artista" ? "artist" : "organizer";
        setUserRole(role);
    }   catch {
        localStorage.removeItem("auth_token");
        setUserRole("guest");
    }   finally {
        setAuthLoading(false);
    }
  };
  restoreSession();
}, []);

  const navigateTo = (view: View, artist?: Artist) => {
    setCurrentView(view);
    if (artist) setSelectedArtist(artist);
    if (view === "register") {
      setRegisterStep(1);
      setSelectedRole(null);
      setSelectedDisciplines([]);
      setIncludesTransport(false);
    }
    setMobileMenuOpen(false);
    setShowNotifications(false);
    window.scrollTo(0, 0);
  };

  const login = async (email: string, password: string) => {
    setLoginError("");
    try {
      const { data } = await api.post("/dj-rest-auth/login/", {
        email,
        password,
      });
      localStorage.setItem("auth_token", data.key);

      const userRes = await api.get("/dj-rest-auth/user/");
      const role: UserRole =
        userRes.data.rol === "artista" ? "artist" : "organizer";

      setUserRole(role);
      navigateTo(role === "artist" ? "artist-dashboard" : "organizer-dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        "Credenciales incorrectas o email no verificado";
      setLoginError(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/dj-rest-auth/logout/");
    } catch {
      // ignorar error de red
    } finally {
      localStorage.removeItem("auth_token");
      setUserRole("guest");
      navigateTo("landing");
    }
  };

  const register = async () => {
  setRegError("");
  setRegLoading(true);
  try {
    await api.post("/dj-rest-auth/registration/", {
      email: regEmail,
      password1: regPassword1,
      password2: regPassword2,
    });
    // Email verification es mandatory → no hay token todavía
    toast.success("Revisa tu correo para verificar la cuenta");
    navigateTo("login");
  } catch (err: any) {
    const data = err.response?.data;
    const msg =
      data?.email?.[0] ||
      data?.password1?.[0] ||
      data?.password2?.[0] ||
      data?.non_field_errors?.[0] ||
      "Error al registrarse";
    setRegError(msg);
  } finally {
    setRegLoading(false);
  }
};
  const goBack = () => {
    // Páginas del panel del organizador - vuelven al dashboard
    if (currentView === "organizer-agenda" || currentView === "organizer-contracts" || currentView === "organizer-profile") {
      navigateTo("organizer-dashboard");
    }
    // Páginas del panel del artista - vuelven al dashboard
    else if (currentView === "artist-agenda" || currentView === "artist-contracts" || currentView === "artist-profile-edit") {
      navigateTo("artist-dashboard");
    }
    // Flujo de reserva multi-step - vuelve al step anterior o al chat
    else if (currentView === "booking") {
      if (bookingStep > 1) {
        setBookingStep(bookingStep - 1);
      } else {
        navigateTo("chat");
      }
    }
    // Perfil de artista público desde catálogo - vuelve al catálogo
    else if (currentView === "artist-profile") {
      navigateTo("catalog");
    }
    // Chat abierto - vuelve al dashboard correspondiente
    else if (currentView === "chat") {
      navigateTo(userRole === "artist" ? "artist-dashboard" : "organizer-dashboard");
    }
    // All reviews - vuelve al perfil del artista o al perfil de edición
    else if (currentView === "all-reviews") {
      navigateTo(userRole === "artist" ? "artist-profile-edit" : "artist-profile");
    }
    // Password reset flow - vuelve al login
    else if (currentView === "forgot-password" || currentView === "forgot-sent" || currentView === "reset-password") {
      navigateTo("login");
    }
  };

  const filteredArtists = sampleArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiscipline = !disciplineFilter || artist.discipline.includes(disciplineFilter);
    const matchesPrice = artist.price <= priceRange;
    return matchesSearch && matchesDiscipline && matchesPrice;
  });

  const filteredBookings = (userRole === "organizer" ? sampleOrganizerBookings : sampleArtistBookings).filter(booking => {
    if (agendaFilter === "all") return true;
    if (agendaFilter === "upcoming") return booking.status === "confirmed" || booking.status === "in-escrow";
    if (agendaFilter === "in-escrow") return booking.status === "in-escrow";
    if (agendaFilter === "completed") return booking.status === "completed";
    if (agendaFilter === "cancelled") return booking.status === "cancelled";
    return true;
  });

  const filteredContracts = sampleContracts.filter(contract => {
    const matchesSearch = contract.artistName?.toLowerCase().includes(contractsSearchTerm.toLowerCase()) ||
                          contract.eventType.toLowerCase().includes(contractsSearchTerm.toLowerCase());
    const matchesFilter = contractFilter === "all" ||
                          (contractFilter === "signed" && contract.contractStatus === "signed") ||
                          (contractFilter === "pending" && (contract.contractStatus === "pending-artist" || contract.contractStatus === "pending-organizer")) ||
                          (contractFilter === "cancelled" && contract.contractStatus === "cancelled");
    return matchesSearch && matchesFilter;
  });

  // Notifications Panel
  const NotificationsPanel = () => {
    const roleNotifs = sampleNotifications.filter(n =>
      userRole !== "guest" && n.roles.includes(userRole as "organizer" | "artist")
    );
    const filterMap: Record<string, Notification["type"][]> = {
      all: ["message", "booking", "payment", "contract", "review"],
      message: ["message"],
      booking: ["booking", "contract"],
      payment: ["payment"],
      system: []
    };
    const visible = roleNotifs.filter(n => {
      if (notifFilter === "system") return false;
      return filterMap[notifFilter].includes(n.type);
    });
    const isRead = (n: Notification) => n.read || readNotifIds.has(n.id);
    const unreadCount = roleNotifs.filter(n => !isRead(n)).length;

    const markAllRead = () => {
      const ids = new Set(readNotifIds);
      roleNotifs.forEach(n => ids.add(n.id));
      setReadNotifIds(ids);
    };
    const markRead = (id: string) => {
      setReadNotifIds(prev => new Set([...prev, id]));
    };

    const notifIcon = (type: Notification["type"]) => {
      const base = "w-10 h-10 rounded-full flex items-center justify-center shrink-0";
      const icons: Record<Notification["type"], JSX.Element> = {
        message: <div className={`${base} bg-primary`}><MessageCircle className="w-5 h-5 text-primary-foreground" /></div>,
        booking: <div className={`${base} bg-primary`}><Calendar className="w-5 h-5 text-primary-foreground" /></div>,
        payment: <div className={`${base} bg-primary`}><Banknote className="w-5 h-5 text-primary-foreground" /></div>,
        contract: <div className={`${base} bg-primary`}><FileSignature className="w-5 h-5 text-primary-foreground" /></div>,
        review: <div className={`${base} bg-primary`}><Star className="w-5 h-5 text-primary-foreground" /></div>,
      };
      return icons[type];
    };

    const groups: { key: Notification["group"]; label: string }[] = [
      { key: "today", label: "HOY" },
      { key: "yesterday", label: "AYER" },
      { key: "week", label: "ESTA SEMANA" },
      { key: "earlier", label: "ANTERIORES" },
    ];

    return (
      <>
        {/* Backdrop (mobile full, desktop subtle) */}
        <div
          className="fixed inset-0 z-50 bg-black/30 md:bg-black/20"
          onClick={() => setShowNotifications(false)}
        />
        {/* Panel */}
        <div
          className="fixed top-0 right-0 h-full z-50 w-full md:w-[400px] bg-card shadow-2xl flex flex-col"
          style={{ boxShadow: "-4px 0 32px rgba(61,32,16,0.15)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotifications(false)}
                className="inline-flex items-center gap-1.5 text-accent hover:text-accent transition-all duration-150 group min-h-[44px] min-w-[44px] -ml-2 px-2"
                style={{ color: "#8B3E22" }}
              >
                <ArrowLeft className="w-5 h-5 transition-transform duration-150 group-hover:-translate-x-1" />
                <span className="font-medium text-sm group-hover:underline decoration-1 underline-offset-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  Volver
                </span>
              </button>
              <h2 className="text-xl font-display font-semibold text-foreground">Notificaciones</h2>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm font-medium hover:underline underline-offset-4 transition-colors shrink-0"
                style={{ color: "#C1603A" }}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 px-5 py-3 overflow-x-auto shrink-0 border-b border-border">
            {(["all", "message", "booking", "payment", "system"] as const).map(f => (
              <button
                key={f}
                onClick={() => setNotifFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  notifFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {f === "all" && "Todas"}
                {f === "message" && "Mensajes"}
                {f === "booking" && "Reservas"}
                {f === "payment" && "Pagos"}
                {f === "system" && "Sistema"}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-5">
                  <Bell className="w-10 h-10" style={{ color: "#C1603A" }} />
                </div>
                <p className="text-base font-medium text-foreground mb-2">Todo tranquilo por aquí.</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cuando recibas mensajes, reservas o movimientos de pago, aparecerán aquí.
                </p>
              </div>
            ) : (
              <div>
                {groups.map(({ key, label }) => {
                  const items = visible.filter(n => n.group === key);
                  if (items.length === 0) return null;
                  return (
                    <div key={key}>
                      <div className="px-5 py-2 sticky top-0 bg-card/90 backdrop-blur-sm z-10">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground">{label}</span>
                      </div>
                      {items.map(n => (
                        <button
                          key={n.id}
                          onClick={() => {
                            markRead(n.id);
                            if (n.navigateTo) navigateTo(n.navigateTo as View);
                            else setShowNotifications(false);
                          }}
                          className="w-full flex items-start gap-3 px-5 py-4 hover:bg-background/70 transition-colors text-left relative"
                          style={{ background: isRead(n) ? undefined : "#F5EDE3" }}
                        >
                          {/* Unread indicator */}
                          {!isRead(n) && (
                            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full" style={{ background: "#C1603A" }} />
                          )}
                          {notifIcon(n.type)}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm leading-snug mb-0.5 ${!isRead(n) ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{n.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 mt-0.5 ml-1">{n.timestamp}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Back Button Component - Global navigation component
  const BackButton = ({ onClick }: { onClick?: () => void }) => (
    <button
      onClick={onClick || goBack}
      className="inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-3 py-2 mb-6 text-accent hover:text-accent transition-all duration-150 group"
      style={{ color: '#8B3E22' }}
    >
      <ArrowLeft className="w-5 h-5 transition-transform duration-150 group-hover:-translate-x-1" />
      <span className="font-medium transition-all duration-150 group-hover:underline decoration-1 underline-offset-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
        Volver
      </span>
    </button>
  );

  // Helper: unread notification count for current role
  const unreadNotifCount = (() => {
    if (userRole === "guest") return 0;
    const roleNotifs = sampleNotifications.filter(n => n.roles.includes(userRole as "organizer" | "artist"));
    return roleNotifs.filter(n => !n.read && !readNotifIds.has(n.id)).length;
  })();

  // Bell button reused across all authenticated layouts
  const BellButton = () => (
    <button
      onClick={() => setShowNotifications(true)}
      className="relative p-2 hover:bg-secondary rounded-full transition-colors"
    >
      <Bell className="w-5 h-5 text-foreground" />
      {unreadNotifCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {unreadNotifCount}
        </span>
      )}
    </button>
  );

  // Topbar for sidebar-layout pages (shows bell in top-right of content area)
  const SidebarTopBar = () => (
    <div className="sticky top-0 z-40 bg-background border-b border-border flex items-center justify-end px-8 h-14 shrink-0">
      <BellButton />
    </div>
  );

  // Upload signed contract modal
  const UploadContractModal = () => {
    const handleSimulateUpload = () => {
      setUploadFileName("contrato-firmado.pdf");
      setUploadFileSize("1.2 MB");
    };
    const handleConfirmUpload = () => {
      if (!uploadTargetContract) return;
      setPhysicallySignedIds(prev => new Set([...prev, uploadTargetContract.id]));
      setShowUploadModal(false);
      setUploadFileName(null);
      setUploadFileSize(null);
      setUploadTargetContract(null);
      toast.success("Contrato subido correctamente", {
        description: "El documento ha quedado registrado como firmado presencialmente.",
      });
    };
    const handleClose = () => {
      setShowUploadModal(false);
      setUploadFileName(null);
      setUploadFileSize(null);
      setUploadTargetContract(null);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">Subir contrato firmado</h2>
            <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Si firmaron el contrato de forma presencial, sube aquí el documento escaneado para dejarlo registrado en la plataforma. Formatos aceptados: PDF, JPG, PNG. Peso máximo: 10 MB.
            </p>

            {/* Drop zone */}
            {!uploadFileName ? (
              <button
                type="button"
                onClick={handleSimulateUpload}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-secondary/20 transition-colors"
              >
                <UploadCloud className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-foreground mb-1">Arrastra el archivo aquí</p>
                <p className="text-sm text-muted-foreground mb-3">o</p>
                <span className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-accent transition-colors">
                  Buscar archivo
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-secondary/30 border border-border rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{uploadFileName}</p>
                  <p className="text-xs text-muted-foreground">{uploadFileSize}</p>
                </div>
                <button
                  onClick={() => { setUploadFileName(null); setUploadFileSize(null); }}
                  className="p-1.5 hover:bg-secondary rounded-full transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Warning */}
            <div className="flex items-start gap-2 p-3 rounded-lg border" style={{ background: "#FFF8ED", borderColor: "#D4A017" }}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#D4A017" }} />
              <p className="text-xs text-foreground">Asegúrate de que el documento esté firmado por ambas partes antes de subirlo.</p>
            </div>
          </div>

          <div className="p-6 border-t border-border flex gap-3">
            <button onClick={handleClose} className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
              Cancelar
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={!uploadFileName}
              className={`flex-1 px-6 py-3 rounded-full font-medium transition-colors ${
                uploadFileName
                  ? "bg-primary text-primary-foreground hover:bg-accent"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Subir contrato
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Review modal
  const ReviewModal = () => {
    const booking = reviewTargetBooking;
    if (!booking) return null;

    const starLabels: Record<number, string> = {
      1: "Muy mala experiencia",
      2: "Regular",
      3: "Aceptable",
      4: "Muy buena",
      5: "Excelente",
    };
    const activeStars = reviewHover || reviewStars;
    const isValid = reviewStars > 0 && reviewComment.trim().length >= 20;

    const handleSubmit = () => {
      setReviewedBookingIds(prev => new Set([...prev, booking.id]));
      setReviewSubmitted(true);
    };

    const handleClose = () => {
      setShowReviewModal(false);
      setReviewTargetBooking(null);
      setReviewStars(0);
      setReviewHover(0);
      setReviewComment("");
      setReviewSubmitted(false);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden">
          {reviewSubmitted ? (
            /* Confirmation state */
            <div className="p-10 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "#F5EDE3" }}>
                <Star className="w-10 h-10 fill-primary text-primary" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-3">¡Gracias por tu reseña!</h2>
              <p className="text-muted-foreground mb-8">Ya está visible en el perfil del artista.</p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-foreground">Dejar tu reseña</h2>
                <button onClick={handleClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Artist context */}
              <div className="px-6 pt-5 pb-4 flex items-center gap-4 bg-secondary/20 border-b border-border">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted shrink-0">
                  <img src={booking.artistPhoto} alt={booking.artistName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-base">{booking.artistName}</p>
                  <p className="text-sm text-muted-foreground">{booking.eventType} · {booking.date}</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Star rating */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-foreground">Calificación <span className="text-destructive">*</span></label>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewStars(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="transition-transform hover:scale-110"
                        style={{ lineHeight: 1 }}
                      >
                        <Star
                          className="w-10 h-10 transition-colors"
                          style={{
                            fill: star <= activeStars ? "#C1603A" : "transparent",
                            color: star <= activeStars ? "#C1603A" : "#9B8B80",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  {activeStars > 0 && (
                    <p className="text-sm font-medium" style={{ color: "#C1603A" }}>
                      {starLabels[activeStars]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Comentario <span className="text-destructive">*</span></label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value.slice(0, 500))}
                    placeholder="Cuéntanos cómo fue la experiencia: puntualidad, calidad de la actuación, actitud profesional..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${reviewComment.trim().length < 20 && reviewComment.length > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {reviewComment.trim().length < 20 && reviewComment.length > 0 ? `Mínimo 20 caracteres (faltan ${20 - reviewComment.trim().length})` : "Mínimo 20 caracteres"}
                    </span>
                    <span className="text-xs text-muted-foreground">{reviewComment.length}/500</span>
                  </div>
                </div>

                {/* Transparency note */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tu reseña será pública y visible en el perfil del artista. No puede editarse una vez publicada.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid}
                  className={`flex-1 px-6 py-3 rounded-full font-medium transition-colors ${
                    isValid
                      ? "bg-primary text-primary-foreground hover:bg-accent"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  Publicar reseña
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Public Navbar (guest)
  const PublicNavbar = () => (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary">
              ArtistaYa!
            </button>
            <div className="hidden md:flex gap-6">
              <button onClick={() => navigateTo("catalog")} className="text-foreground hover:text-primary transition-colors">
                Artistas
              </button>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigateTo("login")} className="px-4 py-2 text-foreground hover:text-primary transition-colors">
              Iniciar sesión
            </button>
            <button onClick={() => navigateTo("register")} className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors">
              Registrarse
            </button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="px-4 py-3 space-y-2">
            <button onClick={() => navigateTo("catalog")} className="block w-full text-left px-3 py-2 hover:bg-secondary rounded">
              Artistas
            </button>
            <button onClick={() => navigateTo("login")} className="block w-full text-left px-3 py-2 hover:bg-secondary rounded">
              Iniciar sesión
            </button>
            <button onClick={() => navigateTo("register")} className="block w-full text-left px-3 py-2 bg-primary text-primary-foreground rounded">
              Registrarse
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  // Authenticated Navbar
  const AuthNavbar = () => (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => navigateTo(userRole === "artist" ? "artist-dashboard" : "organizer-dashboard")} className="text-2xl font-display font-semibold text-primary">
              ArtistaYa!
            </button>
            <div className="hidden md:flex gap-6">
              <button onClick={() => navigateTo("catalog")} className="text-foreground hover:text-primary transition-colors">
                Buscar artistas
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo("chat")} className="relative p-2 hover:bg-secondary rounded-full transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">3</span>
            </button>
            <BellButton />
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-secondary rounded-full transition-colors">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                  <User className="w-5 h-5" />
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button onClick={() => navigateTo(userRole === "artist" ? "artist-dashboard" : "organizer-dashboard")} className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Mi panel
                  </div>
                </button>
                <button onClick={logout} className="block w-full text-left px-4 py-2 hover:bg-secondary rounded-b-lg text-destructive">
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  // Landing Page
  const LandingPage = () => (
    <div className="min-h-screen">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent via-primary to-accent text-primary-foreground py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&h=900&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Encuentra el artista ideal para tu evento
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-95">
            El marketplace de artistas escénicos verificados de Loja. Sin informalidad. Sin riesgos.
          </p>

          <div className="bg-card/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-border">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="md:col-span-1">
                <select className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Disciplina</option>
                  <option>Danza</option>
                  <option>Música</option>
                  <option>Teatro</option>
                  <option>Circo</option>
                  <option>Magia</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <input type="date" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="md:col-span-1">
                <input type="number" placeholder="Presupuesto" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="md:col-span-1">
                <button onClick={() => navigateTo("catalog")} className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-accent transition-colors font-medium flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button onClick={() => navigateTo("register")} className="px-6 py-3 bg-card text-foreground rounded-full hover:bg-secondary transition-colors font-medium flex items-center justify-center gap-2">
              Soy organizador de eventos <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigateTo("register")} className="px-6 py-3 bg-card text-foreground rounded-full hover:bg-secondary transition-colors font-medium flex items-center justify-center gap-2">
              Soy artista escénico <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-foreground">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Search, title: "Busca y filtra", desc: "Encuentra artistas verificados según tu presupuesto y necesidades" },
              { icon: MessageCircle, title: "Chatea y acuerda", desc: "Conversa directamente y define todos los detalles del evento" },
              { icon: FileText, title: "Reserva con contrato", desc: "Genera un contrato automático que protege a ambas partes" },
              { icon: CheckCircle, title: "Paga seguro", desc: "Tu pago queda en custodia hasta 24h después del evento" }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-12 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Award, text: "Artistas verificados con cédula/RUC" },
              { icon: FileText, text: "Contrato automático incluido" },
              { icon: DollarSign, text: "Pago en custodia" },
              { icon: Star, text: "Reseñas reales" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-success-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-foreground">Artistas destacados</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {sampleArtists.slice(0, 6).map(artist => (
              <div key={artist.id} className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-muted relative">
                  <img src={artist.photo} alt={artist.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-success px-3 py-1 rounded-full text-success-foreground text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verificado
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-2">
                    {artist.discipline.slice(0, 2).map((d, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">{d}</span>
                    ))}
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-1 text-foreground">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{artist.description}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{artist.rating}</span>
                    <span className="text-sm text-muted-foreground">({artist.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-foreground">Desde ${artist.price}</span>
                    <button onClick={() => navigateTo("artist-profile", artist)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors">
                      Ver perfil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigateTo("catalog")} className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
              Ver catálogo completo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-accent text-accent-foreground py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-display font-bold mb-4">ArtistaYa!</h3>
              <p className="text-sm opacity-90">El marketplace de artistas escénicos de Loja, Ecuador</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Para organizadores</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:opacity-100">Buscar artistas</a></li>
                <li><a href="#" className="hover:opacity-100">Cómo funciona</a></li>
                <li><a href="#" className="hover:opacity-100">Preguntas frecuentes</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Para artistas</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:opacity-100">Registrarse</a></li>
                <li><a href="#" className="hover:opacity-100">Verificación</a></li>
                <li><a href="#" className="hover:opacity-100">Tarifas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li><a href="#" className="hover:opacity-100">Términos y condiciones</a></li>
                <li><a href="#" className="hover:opacity-100">Privacidad</a></li>
                <li><a href="#" className="hover:opacity-100">Contacto</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-accent-foreground/20 mt-8 pt-8 text-center text-sm opacity-75">
            © 2026 ArtistaYa! - Todos los derechos reservados
          </div>
        </div>
      </footer>
    </div>
  );

  // Catalog Page
  const CatalogPage = () => (
    <div className="min-h-screen">
      {userRole === "guest" ? <PublicNavbar /> : <AuthNavbar />}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold mb-8 text-foreground">Catálogo de artistas</h1>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-6 mb-8 shadow-md border border-border sticky top-20 z-40">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o agencia"
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Disciplina</label>
              <select
                value={disciplineFilter}
                onChange={(e) => setDisciplineFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todas</option>
                <option value="Danza">Danza</option>
                <option value="Música">Música</option>
                <option value="Teatro">Teatro</option>
                <option value="Circo">Circo</option>
                <option value="Magia">Magia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Fecha disponible</label>
              <input type="date" className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Precio máximo: ${priceRange}</label>
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">{filteredArtists.length} artistas encontrados</p>
            <button onClick={() => { setSearchTerm(""); setDisciplineFilter(""); setPriceRange(500); }} className="text-sm text-primary hover:text-accent">
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Artist Grid */}
        {filteredArtists.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredArtists.map(artist => (
              <div key={artist.id} className="bg-card rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-muted relative">
                  <img src={artist.photo} alt={artist.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-success px-3 py-1 rounded-full text-success-foreground text-xs font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verificado
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {artist.discipline.slice(0, 2).map((d, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">{d}</span>
                    ))}
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-1 text-foreground">{artist.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{artist.description}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{artist.rating}</span>
                    <span className="text-sm text-muted-foreground">({artist.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-foreground">Desde ${artist.price}</span>
                    <button onClick={() => navigateTo("artist-profile", artist)} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors">
                      Ver perfil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">No encontramos artistas</h3>
            <p className="text-muted-foreground mb-6">Prueba ajustando los filtros de búsqueda</p>
            <button onClick={() => { setSearchTerm(""); setDisciplineFilter(""); setPriceRange(500); }} className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Artist Profile (continues in next part due to length...)
  const ArtistProfile = () => {
    if (!selectedArtist) return null;

    return (
      <div className="min-h-screen">
        {userRole === "guest" ? <PublicNavbar /> : <AuthNavbar />}

        <div className="max-w-6xl mx-auto px-4 py-8">
          <BackButton />

          {/* Header */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border mb-8">
            <div className="h-48 bg-gradient-to-br from-primary to-accent relative">
              <img src={selectedArtist.portfolio[0]} alt="" className="w-full h-full object-cover opacity-30" />
            </div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                <div className="w-32 h-32 rounded-full border-4 border-card bg-muted overflow-hidden shrink-0">
                  <img src={selectedArtist.photo} alt={selectedArtist.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 mt-20 md:mt-16">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h1 className="text-3xl font-display font-bold mb-2 text-foreground">{selectedArtist.name}</h1>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedArtist.discipline.map((d, i) => (
                          <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">{d}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedArtist.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          {selectedArtist.rating} ({selectedArtist.reviews} reseñas)
                        </div>
                        <div className="flex items-center gap-1 bg-success px-3 py-1 rounded-full text-success-foreground">
                          <CheckCircle className="w-4 h-4" />
                          Verificado
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => navigateTo("chat")} className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Contactar
                      </button>
                      <button className="px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
                        Ver disponibilidad
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card rounded-2xl overflow-hidden shadow-md border border-border">
            <div className="flex border-b border-border overflow-x-auto">
              {["portfolio", "about", "rates", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "portfolio" && "Portafolio"}
                  {tab === "about" && "Sobre mí"}
                  {tab === "rates" && "Tarifas"}
                  {tab === "reviews" && "Reseñas"}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === "portfolio" && (
                <div>
                  <h3 className="text-2xl font-display font-semibold mb-6 text-foreground">Galería</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {selectedArtist.portfolio.map((img, i) => (
                      <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-4 text-foreground">Video presentación</h3>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                      <p className="text-muted-foreground">Video de presentación del artista</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div>
                  <h3 className="text-2xl font-display font-semibold mb-4 text-foreground">Descripción</h3>
                  <p className="text-foreground mb-8 leading-relaxed">{selectedArtist.description}</p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-secondary/50 p-6 rounded-xl">
                      <Clock className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-semibold mb-1 text-foreground">Experiencia</h4>
                      <p className="text-muted-foreground">{selectedArtist.experience} años</p>
                    </div>
                    <div className="bg-secondary/50 p-6 rounded-xl">
                      <Star className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-semibold mb-1 text-foreground">Calificación</h4>
                      <p className="text-muted-foreground">{selectedArtist.rating} / 5.0</p>
                    </div>
                    <div className="bg-secondary/50 p-6 rounded-xl">
                      <Users className="w-8 h-8 text-primary mb-3" />
                      <h4 className="font-semibold mb-1 text-foreground">Eventos realizados</h4>
                      <p className="text-muted-foreground">{selectedArtist.reviews} eventos</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "rates" && (
                <div>
                  <h3 className="text-2xl font-display font-semibold mb-6 text-foreground">Tarifas</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-foreground">Tarifa por hora</h4>
                        <p className="text-sm text-muted-foreground">Ideal para eventos cortos</p>
                      </div>
                      <p className="text-2xl font-mono font-semibold text-foreground">${selectedArtist.price - 20}</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <h4 className="font-semibold text-foreground">Tarifa por evento</h4>
                        <p className="text-sm text-muted-foreground">Hasta 4 horas de presentación</p>
                      </div>
                      <p className="text-2xl font-mono font-semibold text-foreground">${selectedArtist.price}</p>
                    </div>
                    <div className="p-4 bg-warning/10 border border-warning rounded-xl">
                      <p className="text-sm text-foreground"><strong>Nota:</strong> Los traslados fuera de Loja tienen un costo adicional según la distancia. Consultarme por detalles.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  <h3 className="text-2xl font-display font-semibold mb-6 text-foreground">Reseñas ({selectedArtist.reviews})</h3>
                  <div className="space-y-6">
                    {[
                      { name: "Andrea M.", rating: 5, comment: "Excelente presentación en nuestra boda. Muy profesional y puntual. Los invitados quedaron encantados.", date: "15 de marzo, 2026" },
                      { name: "Roberto C.", rating: 5, comment: "Contratamos para evento corporativo. Superó nuestras expectativas. Lo recomiendo completamente.", date: "8 de febrero, 2026" },
                      { name: "Gabriela S.", rating: 4, comment: "Muy buena presentación, aunque hubo un pequeño retraso al inicio. De todos modos, valió la pena.", date: "22 de enero, 2026" }
                    ].map((review, i) => (
                      <div key={i} className="p-6 bg-secondary/30 rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{review.name}</h4>
                            <p className="text-sm text-muted-foreground">{review.date}</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                            ))}
                          </div>
                        </div>
                        <p className="text-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigateTo("all-reviews")}
                      className="text-sm font-medium hover:underline underline-offset-4 transition-colors"
                      style={{ color: "#C1603A" }}
                    >
                      Ver todas las reseñas ({selectedArtist.reviews}) →
                    </button>
                  </div>
                  {/* Dejar reseña — only for organizers with a completed booking with this artist */}
                  {(() => {
                    if (userRole !== "organizer") return null;
                    const completedBooking = sampleOrganizerBookings.find(
                      b => b.artistName === selectedArtist?.name && b.status === "completed" && !reviewedBookingIds.has(b.id)
                    );
                    const alreadyReviewed = sampleOrganizerBookings.some(
                      b => b.artistName === selectedArtist?.name && b.status === "completed" && reviewedBookingIds.has(b.id)
                    );
                    if (alreadyReviewed) {
                      return (
                        <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-success" />
                          Ya dejaste una reseña para este artista.
                        </div>
                      );
                    }
                    if (!completedBooking) return null;
                    return (
                      <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-4">¿Has trabajado con este artista? Comparte tu experiencia.</p>
                        <button
                          onClick={() => { setReviewTargetBooking(completedBooking); setShowReviewModal(true); }}
                          className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Dejar reseña
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Register/Onboarding
  const RegisterPage = () => {
    // Progress indicator helpers
    const totalSteps = selectedRole === "artist" ? 5 : 3;
    // Map registerStep → visual step number (step 1 = role picker, no indicator)
    // step 2 = step 1/N, step 3 = step 2/N, step 4 = step 3/N, etc.
    const visualStep = registerStep - 1;

    const disciplines = [
      "Danza contemporánea", "Ballet", "Danza folclórica",
      "Música en vivo", "Canto", "Teatro",
      "Circo", "Magia", "Humor", "Otra"
    ];

    const toggleDiscipline = (d: string) => {
      setSelectedDisciplines(prev =>
        prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
      );
    };

    const ProgressBar = ({ current, total }: { current: number; total: number }) => (
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const done = stepNum < current;
          const active = stepNum === current;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                done ? "bg-success text-success-foreground" :
                active ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : stepNum}
              </div>
              {i < total - 1 && (
                <div className={`w-10 h-1 rounded-full transition-colors ${done ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          );
        })}
      </div>
    );

    const inputClass = "w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="max-w-2xl mx-auto px-4 py-12">

          {/* Step 1: Role picker */}
          {registerStep === 1 && (
            <div>
              <h1 className="text-4xl font-display font-bold text-center mb-4 text-foreground">Únete a ArtistaYa!</h1>
              <p className="text-center text-muted-foreground mb-12">Elige cómo quieres usar la plataforma</p>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => { setSelectedRole("organizer"); setRegisterStep(2); }}
                  className="bg-card p-8 rounded-2xl border-2 border-border hover:border-primary transition-all text-left group"
                >
                  <div className="w-16 h-16 mb-4 bg-secondary rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Users className="w-8 h-8 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">Soy organizador</h3>
                  <p className="text-muted-foreground">Busco contratar artistas para mis eventos corporativos o sociales</p>
                </button>
                <button
                  onClick={() => { setSelectedRole("artist"); setRegisterStep(2); }}
                  className="bg-card p-8 rounded-2xl border-2 border-border hover:border-primary transition-all text-left group"
                >
                  <div className="w-16 h-16 mb-4 bg-secondary rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Star className="w-8 h-8 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">Soy artista</h3>
                  <p className="text-muted-foreground">Quiero ofrecer mis servicios artísticos y conseguir más eventos</p>
                </button>
              </div>
              <p className="text-center mt-8 text-muted-foreground">
                ¿Ya tienes cuenta? <button onClick={() => navigateTo("login")} className="text-primary hover:text-accent">Iniciar sesión</button>
              </p>
            </div>
          )}

          {/* Step 2: Datos básicos */}
          {registerStep === 2 && (
            <div>
              <ProgressBar current={1} total={totalSteps} />
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-1">
                Datos básicos
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Paso 1 de {totalSteps}
              </p>
              <div className="bg-card p-8 rounded-2xl border border-border">
                {regError && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {regError}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={regPassword1}
                      onChange={(e) => setRegPassword1(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      value={regPassword2}
                      onChange={(e) => setRegPassword2(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setRegisterStep(1)}
                    className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={async () => {
                      await register(); // llama al backend
                      // si quieres seguir el flujo multi-step sin backend de rol todavía:
                      // setRegisterStep(3);
                    }}
                    disabled={regLoading}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium"
                  >
                    {regLoading ? "Registrando..." : "Continuar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verificación de identidad */}
          {registerStep === 3 && (
            <div>
              <ProgressBar current={2} total={totalSteps} />
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-1">Verificación de identidad</h2>
              <p className="text-center text-muted-foreground mb-8">Paso 2 de {totalSteps}</p>
              <div className="bg-card p-8 rounded-2xl border border-border">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Documento de identidad</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-foreground font-medium">Sube tu cédula o RUC</p>
                      <p className="text-sm text-muted-foreground mt-1">PNG, JPG o PDF — Máximo 5MB</p>
                    </div>
                  </div>
                  <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                    <p className="text-sm text-foreground"><strong>¿Por qué necesitamos esto?</strong> La verificación nos ayuda a mantener un marketplace seguro y prevenir fraudes.</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setRegisterStep(2)} className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
                    Atrás
                  </button>
                  <button onClick={() => setRegisterStep(4)} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — ORGANIZER: Completa tu perfil (3/3) */}
          {registerStep === 4 && selectedRole === "organizer" && (
            <div>
              <ProgressBar current={3} total={3} />
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-1">Completa tu perfil</h2>
              <p className="text-center text-muted-foreground mb-8">Paso 3 de 3 — Último paso</p>
              <div className="bg-card p-8 rounded-2xl border border-border">
                {/* Photo upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-foreground">Foto de perfil</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center shrink-0 border-2 border-dashed border-border overflow-hidden">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-3 mb-2">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors font-medium">
                          Subir foto
                        </button>
                        <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors font-medium md:hidden">
                          Tomar foto
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Una foto de perfil genera más confianza en los artistas. JPG o PNG, máx. 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Número de teléfono</label>
                    <div className="flex gap-2">
                      <select className="px-3 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm shrink-0">
                        <option value="+593">🇪🇨 +593</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+51">🇵🇪 +51</option>
                      </select>
                      <input type="tel" placeholder="987 654 321" className={`${inputClass} flex-1`} />
                    </div>
                  </div>

                  {/* Profession */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Profesión o empresa</label>
                    <input type="text" placeholder="Ej: Coordinadora de eventos, Hotel Libertador" className={inputClass} />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Descripción breve <span className="text-muted-foreground font-normal">(opcional)</span>
                    </label>
                    <textarea
                      placeholder="Cuéntale a los artistas quién eres y qué tipo de eventos organizas."
                      rows={3}
                      maxLength={200}
                      className={`${inputClass} resize-none`}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">0 / 200 caracteres</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={() => { setProfileIncomplete(false); login(selectedRole!); }}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium"
                  >
                    Completar registro →
                  </button>
                  <button
                    onClick={() => { setProfileIncomplete(true); login(selectedRole!); }}
                    className="w-full px-6 py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    Completar más tarde
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — ARTIST: Datos personales (3/5) */}
          {registerStep === 4 && selectedRole === "artist" && (
            <div>
              <ProgressBar current={3} total={5} />
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-1">Datos personales y de contacto</h2>
              <p className="text-center text-muted-foreground mb-8">Paso 3 de 5</p>
              <div className="bg-card p-8 rounded-2xl border border-border">
                {/* Photo upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-foreground">Foto de perfil</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center shrink-0 border-2 border-dashed border-border overflow-hidden">
                      <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-3 mb-2">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors font-medium">
                          Subir foto
                        </button>
                        <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors font-medium md:hidden">
                          Tomar foto
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">JPG o PNG, máx. 5MB.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Número de teléfono</label>
                    <div className="flex gap-2">
                      <select className="px-3 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm shrink-0">
                        <option value="+593">🇪🇨 +593</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+51">🇵🇪 +51</option>
                      </select>
                      <input type="tel" placeholder="987 654 321" className={`${inputClass} flex-1`} />
                    </div>
                  </div>

                  {/* Artistic name */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Nombre artístico</label>
                    <input type="text" placeholder="El nombre con el que te conocen en escena" className={inputClass} />
                  </div>

                  {/* City (read only) */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Ciudad</label>
                    <input
                      type="text"
                      value="Loja, Ecuador"
                      readOnly
                      className={`${inputClass} opacity-60 cursor-not-allowed`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">ArtistaYa! opera actualmente solo en Loja, Ecuador.</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Descripción profesional</label>
                    <textarea
                      placeholder="Preséntate a los organizadores: tu estilo, experiencia y lo que hace único tu arte."
                      rows={4}
                      maxLength={400}
                      className={`${inputClass} resize-none`}
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">0 / 400 caracteres</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setRegisterStep(3)} className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
                    Atrás
                  </button>
                  <button onClick={() => setRegisterStep(5)} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — ARTIST: Información artística (4/5) */}
          {registerStep === 5 && selectedRole === "artist" && (
            <div>
              <ProgressBar current={4} total={5} />
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-1">Información artística</h2>
              <p className="text-center text-muted-foreground mb-8">Paso 4 de 5</p>
              <div className="bg-card p-8 rounded-2xl border border-border">
                {/* Disciplines */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-foreground">Disciplinas <span className="text-muted-foreground font-normal">(selecciona todas las que apliquen)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {disciplines.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                          selectedDisciplines.includes(d)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-input-background text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  {selectedDisciplines.includes("Otra") && (
                    <input type="text" placeholder="Especifica tu disciplina" className={`${inputClass} mt-3`} />
                  )}
                </div>

                {/* Experience */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-foreground">Años de experiencia</label>
                  <select className={inputClass}>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? "año" : "años"}</option>
                    ))}
                    <option value="20+">20+ años</option>
                  </select>
                </div>

                {/* Rates */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-foreground">Tarifas</label>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Tarifa por hora</label>
                      <div className="flex items-center">
                        <span className="px-3 py-3 bg-secondary text-secondary-foreground text-sm rounded-l-lg border border-r-0 border-border font-mono">$</span>
                        <input type="number" placeholder="0.00" className="flex-1 px-4 py-3 rounded-r-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Tarifa por evento</label>
                      <div className="flex items-center">
                        <span className="px-3 py-3 bg-secondary text-secondary-foreground text-sm rounded-l-lg border border-r-0 border-border font-mono">$</span>
                        <input type="number" placeholder="0.00" className="flex-1 px-4 py-3 rounded-r-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                      </div>
                    </div>
                  </div>
                  {/* Transport toggle */}
                  <button
                    type="button"
                    onClick={() => setIncludesTransport(!includesTransport)}
                    className="flex items-center gap-3 group"
                  >
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${includesTransport ? "bg-primary" : "bg-muted"}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${includesTransport ? "translate-x-5.5 left-0.5" : "left-0.5"}`} style={{ transform: includesTransport ? "translateX(20px)" : "translateX(0)" }} />
                    </div>
                    <span className="text-sm text-foreground">Incluye traslado dentro de Loja</span>
                  </button>
                  <p className="text-xs text-muted-foreground mt-3">Puedes actualizar tus tarifas en cualquier momento desde tu perfil.</p>
                </div>

                <div className="flex gap-4 mt-8">
                  <button onClick={() => setRegisterStep(4)} className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
                    Atrás
                  </button>
                  <button onClick={() => setRegisterStep(6)} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 6 — ARTIST: Portafolio multimedia (5/5) */}
          {registerStep === 6 && selectedRole === "artist" && (
            <div>
              <ProgressBar current={5} total={5} />
              <h2 className="text-3xl font-display font-bold text-center text-foreground mb-1">Portafolio multimedia</h2>
              <p className="text-center text-muted-foreground mb-8">Paso 5 de 5 — ¡Casi listo!</p>
              <div className="bg-card p-8 rounded-2xl border border-border">
                {/* Photos */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-1 text-foreground">Fotos de actuación <span className="text-destructive">*</span></label>
                  <p className="text-xs text-muted-foreground mb-3">Mínimo 1, máximo 10 — Formatos: JPG, PNG — Máx. 10MB por foto</p>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-secondary/20 transition-colors cursor-pointer mb-4">
                    <Camera className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium text-foreground mb-1">Arrastra tus fotos aquí</p>
                    <p className="text-sm text-muted-foreground mb-3">o</p>
                    <button type="button" className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors font-medium">
                      Seleccionar fotos
                    </button>
                  </div>
                  {/* Sample preview grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {sampleArtists[0].portfolio.map((img, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden relative group bg-muted">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Video de actuación <span className="text-muted-foreground font-normal">(recomendado)</span>
                  </label>
                  <p className="text-xs text-muted-foreground mb-3">Formatos: MP4, MOV — Máx. 500MB</p>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-secondary/20 transition-colors cursor-pointer">
                    <div className="w-14 h-14 mx-auto mb-3 bg-secondary rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <p className="font-medium text-foreground mb-1">Sube tu video de actuación</p>
                    <p className="text-sm text-muted-foreground mb-3">o arrastra el archivo aquí</p>
                    <button type="button" className="px-5 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors font-medium">
                      Seleccionar video
                    </button>
                  </div>
                  <div className="mt-3 p-3 bg-secondary/30 rounded-lg flex items-start gap-2">
                    <Star className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground">Un video de tu actuación aumenta hasta <strong>3×</strong> las probabilidades de ser contratado.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={() => { setProfileIncomplete(false); login(selectedRole!); }}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium"
                  >
                    Publicar mi perfil →
                  </button>
                  <button
                    onClick={() => { setProfileIncomplete(true); login(selectedRole!); }}
                    className="w-full px-6 py-3 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    Completar más tarde
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Login Page
  // Forgot Password — Step 1: Request reset
  const ForgotPasswordPage = () => {
    const [email, setEmail] = useState(forgotEmail);
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSend = () => {
      setForgotEmail(email);
      setResendCooldown(60);
      navigateTo("forgot-sent");
    };

    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="max-w-md mx-auto px-4 py-16">
          <BackButton />
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "#F5EDE3" }}>
              <Lock className="w-8 h-8" style={{ color: "#C1603A" }} />
            </div>
            <h1 className="text-3xl font-display font-bold mb-3 text-foreground">¿Olvidaste tu contraseña?</h1>
            <p className="text-muted-foreground leading-relaxed">
              Ingresa el correo con el que te registraste y te enviaremos un enlace para crear una nueva contraseña.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border shadow-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!isValid}
              className={`w-full mt-6 px-6 py-3 rounded-full font-medium transition-colors ${
                isValid ? "bg-primary text-primary-foreground hover:bg-accent" : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Enviar enlace
            </button>

            <p className="text-center mt-5 text-sm text-muted-foreground">
              <button onClick={() => navigateTo("login")} className="text-primary hover:text-accent font-medium">
                Volver al inicio de sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Forgot Password — Step 2: Email sent confirmation
  const ForgotSentPage = () => {
    const [cooldown, setCooldown] = useState(resendCooldown);

    // Count down every second
    useState(() => {
      if (cooldown <= 0) return;
      const timer = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    });

    const handleResend = () => {
      setCooldown(60);
      setResendCooldown(60);
    };

    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          {/* Envelope illustration */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "#F5EDE3" }}>
            <svg className="w-12 h-12" fill="none" viewBox="0 0 48 48" style={{ color: "#C1603A" }}>
              <rect x="4" y="10" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
              <path d="M4 14l20 13L44 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-3xl font-display font-bold mb-4 text-foreground">Revisa tu correo</h1>
          <p className="text-muted-foreground mb-2 leading-relaxed">
            Te enviamos un enlace a <span className="font-medium text-foreground">{forgotEmail || "tu correo"}</span>.
            Úsalo en los próximos 30 minutos para restablecer tu contraseña.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            ¿No lo encuentras? Revisa tu carpeta de spam.
          </p>

          <button
            onClick={cooldown === 0 ? handleResend : undefined}
            disabled={cooldown > 0}
            className={`w-full px-6 py-3 rounded-full font-medium border transition-colors mb-4 ${
              cooldown === 0
                ? "border-primary text-primary hover:bg-secondary"
                : "border-border text-muted-foreground cursor-not-allowed"
            }`}
          >
            {cooldown > 0 ? `Reenviar en ${fmt(cooldown)}` : "Reenviar enlace"}
          </button>

          <button onClick={() => navigateTo("login")} className="text-sm text-primary hover:text-accent font-medium">
            Volver al inicio de sesión
          </button>

          {/* Demo shortcut */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Demo: simular clic en el enlace del correo</p>
            <button
              onClick={() => navigateTo("reset-password")}
              className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors"
            >
              Abrir pantalla "Nueva contraseña" →
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Forgot Password — Step 3: Set new password
  const ResetPasswordPage = () => {
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [done, setDone] = useState(false);

    const hasMin8 = newPwd.length >= 8;
    const hasUpper = /[A-Z]/.test(newPwd);
    const hasNumber = /[0-9]/.test(newPwd);
    const strength = [hasMin8, hasUpper, hasNumber].filter(Boolean).length;
    const strengthLabel = ["", "Débil", "Regular", "Fuerte"][strength];
    const strengthColor = ["", "#d4183d", "#D4A017", "#5A8A5A"][strength];
    const strengthWidth = `${(strength / 3) * 100}%`;

    const mismatch = confirmPwd.length > 0 && newPwd !== confirmPwd;
    const isValid = strength === 3 && newPwd === confirmPwd && confirmPwd.length > 0;

    const inputClass = "w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-12";

    if (done) {
      return (
        <div className="min-h-screen bg-background">
          <PublicNavbar />
          <div className="max-w-md mx-auto px-4 py-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: "#E8F5E8" }}>
              <svg className="w-12 h-12" fill="none" viewBox="0 0 48 48" style={{ color: "#5A8A5A" }}>
                <path d="M16 24l8 8 14-14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="10" y="20" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <path d="M18 20v-6a6 6 0 0112 0v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold mb-3 text-foreground">¡Listo!</h1>
            <p className="text-muted-foreground mb-8">Tu contraseña fue actualizada exitosamente.</p>
            <button
              onClick={() => navigateTo("login")}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium"
            >
              Ir al inicio de sesión
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="max-w-md mx-auto px-4 py-16">
          <BackButton />
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-3 text-foreground">Crea una nueva contraseña</h1>
            <p className="text-muted-foreground leading-relaxed">
              Elige una contraseña segura. No podrás reutilizar tu contraseña anterior.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl border border-border shadow-md space-y-5">
            {/* New password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Nueva contraseña</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew
                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>

              {/* Strength indicator */}
              {newPwd.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strengthWidth, backgroundColor: strengthColor }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className={hasMin8 ? "text-success" : ""}>✓ 8+ caracteres</span>
                      <span className={hasUpper ? "text-success" : ""}>✓ Mayúscula</span>
                      <span className={hasNumber ? "text-success" : ""}>✓ Número</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Confirmar nueva contraseña</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Repite la contraseña"
                  className={`${inputClass} ${mismatch ? "border-destructive focus:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm
                    ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              {mismatch && (
                <p className="text-xs mt-1.5" style={{ color: "#d4183d" }}>Las contraseñas no coinciden.</p>
              )}
            </div>

            <button
              onClick={() => setDone(true)}
              disabled={!isValid}
              className={`w-full px-6 py-3 rounded-full font-medium transition-colors ${
                isValid ? "bg-primary text-primary-foreground hover:bg-accent" : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Guardar nueva contraseña
            </button>
          </div>
        </div>
      </div>
    );
  };

  const LoginPage = () => (
  <div className="min-h-screen bg-background">
    <PublicNavbar />
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-display font-bold text-center mb-8 text-foreground">
        Iniciar sesión
      </h1>

      <div className="bg-card p-8 rounded-2xl border border-border shadow-md">
        {loginError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {loginError}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Correo electrónico
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Contraseña
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <button
          onClick={() => login(loginEmail, loginPassword)}
          className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium"
        >
          Entrar
        </button>

        <p className="text-center mt-4 text-sm text-muted-foreground">
          <button
            onClick={() => navigateTo("forgot-password")}
            className="text-primary hover:text-accent"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </p>

        <p className="text-center mt-6 text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <button
            onClick={() => navigateTo("register")}
            className="text-primary hover:text-accent"
          >
            Regístrate
          </button>
        </p>
      </div>
    </div>
  </div>
);

  // Chat Page
  const ChatPage = () => {
    const [currentMessage, setCurrentMessage] = useState("");
    const conversations = [
      { id: "1", name: "María Elena Solís", lastMessage: "Perfecto, entonces nos vemos el viernes", time: "10:30", unread: 2, photo: sampleArtists[0].photo },
      { id: "2", name: "Carlos Andrade Trío", lastMessage: "¿Tienen un lugar techado para el equipo?", time: "Ayer", unread: 0, photo: sampleArtists[1].photo },
      { id: "3", name: "Lucía Romero", lastMessage: "Gracias por la reserva!", time: "15 Mar", unread: 1, photo: sampleArtists[2].photo }
    ];

    const messages = [
      { from: "other", content: "¡Hola! Vi que estás interesado en mi servicio para tu evento", time: "10:15" },
      { from: "me", content: "Sí, necesito una presentación de danza para un evento corporativo el 25 de mayo", time: "10:20" },
      { from: "other", content: "Excelente. ¿Cuánto tiempo de presentación necesitas?", time: "10:22" },
      { from: "me", content: "Aproximadamente 30 minutos. ¿Estarías disponible?", time: "10:25" },
      { from: "other", content: "Perfecto, entonces nos vemos el viernes", time: "10:30" }
    ];

    return (
      <div className="min-h-screen flex flex-col">
        <AuthNavbar />

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-border bg-card overflow-y-auto">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-display font-semibold text-foreground">Mensajes</h2>
            </div>
            <div>
              {conversations.map(conv => (
                <button key={conv.id} className="w-full p-4 hover:bg-secondary transition-colors border-b border-border text-left">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                      <img src={conv.photo} alt={conv.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-foreground truncate">{conv.name}</h3>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        {conv.unread > 0 && (
                          <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center shrink-0 ml-2">{conv.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-background">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="mb-3">
                <BackButton onClick={() => navigateTo(userRole === "artist" ? "artist-dashboard" : "organizer-dashboard")} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    <img src={sampleArtists[0].photo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">María Elena Solís</h3>
                    <p className="text-xs text-muted-foreground">En línea</p>
                  </div>
                </div>
                <button onClick={() => navigateTo("artist-profile", sampleArtists[0])} className="px-4 py-2 text-sm border border-border rounded-full hover:bg-secondary transition-colors">
                  Ver perfil
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md px-4 py-3 rounded-2xl ${
                    msg.from === "me"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}>
                    <p>{msg.content}</p>
                    <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-3 mb-3">
                <button onClick={() => navigateTo("booking")} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Proponer reserva
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-3 rounded-full bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Booking Flow
  const BookingFlow = () => (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <BackButton />

        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map(step => (
              <>
                <div key={step} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  bookingStep === step ? "bg-primary text-primary-foreground" :
                  bookingStep > step ? "bg-success text-success-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {bookingStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 5 && <div className={`w-12 h-1 ${bookingStep > step ? "bg-success" : "bg-muted"}`}></div>}
              </>
            ))}
          </div>
          <h2 className="text-3xl font-display font-bold text-center text-foreground">
            {bookingStep === 1 && "Detalles del evento"}
            {bookingStep === 2 && "Resumen y costos"}
            {bookingStep === 3 && "Contrato generado"}
            {bookingStep === 4 && "Pago seguro"}
            {bookingStep === 5 && "¡Reserva confirmada!"}
          </h2>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-md">
          {bookingStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Fecha del evento</label>
                <input type="date" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Tipo de evento</label>
                <select className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Evento corporativo</option>
                  <option>Boda</option>
                  <option>Fiesta privada</option>
                  <option>Festival</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Lugar del evento</label>
                <input type="text" placeholder="Dirección completa" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Duración estimada</label>
                <select className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>30 minutos</option>
                  <option>1 hora</option>
                  <option>2 horas</option>
                  <option>4 horas</option>
                  <option>Evento completo</option>
                </select>
              </div>
              <div className="pt-4">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                  <span className="font-medium text-foreground">Tarifa calculada</span>
                  <span className="text-2xl font-mono font-semibold text-foreground">$120</span>
                </div>
              </div>
            </div>
          )}

          {bookingStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Tarifa acordada</span>
                  <span className="font-mono font-medium text-foreground">$120.00</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-muted-foreground">Comisión ArtistaYa! (12%)</span>
                  <span className="font-mono font-medium text-destructive">-$14.40</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-foreground">Monto neto al artista</span>
                  <span className="text-2xl font-mono font-semibold text-foreground">$105.60</span>
                </div>
              </div>
              <div className="p-4 bg-warning/10 border border-warning rounded-xl">
                <p className="text-sm text-foreground"><strong>Pago en custodia:</strong> El dinero quedará retenido de forma segura hasta 24 horas después del evento. Luego se liberará automáticamente al artista.</p>
              </div>
            </div>
          )}

          {bookingStep === 3 && (
            <div>
              <div className="p-6 bg-secondary/30 rounded-xl mb-6 space-y-4">
                <h3 className="font-display font-semibold text-lg text-foreground">Contrato de Prestación de Servicios Artísticos</h3>
                <div className="text-sm space-y-2 text-foreground">
                  <p><strong>Organizador:</strong> [Tu nombre]</p>
                  <p><strong>Artista:</strong> María Elena Solís</p>
                  <p><strong>Tipo de evento:</strong> Evento corporativo</p>
                  <p><strong>Fecha:</strong> 25 de mayo, 2026</p>
                  <p><strong>Lugar:</strong> [Dirección del evento]</p>
                  <p><strong>Duración:</strong> 1 hora</p>
                  <p><strong>Tarifa total:</strong> $120.00</p>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Condiciones de cancelación: Cancelación hasta 48h antes del evento: reembolso del 100%. Cancelación entre 24-48h: reembolso del 50%. Menos de 24h: sin reembolso.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 border border-border rounded-full hover:bg-secondary transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => { setUploadTargetContract(null); setShowUploadModal(true); }}
                  className="px-4 py-2 border border-border rounded-full hover:bg-secondary transition-colors flex items-center gap-2"
                >
                  <UploadCloud className="w-4 h-4" />
                  Subir contrato firmado
                </button>
              </div>
            </div>
          )}

          {bookingStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Número de tarjeta</label>
                <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Titular de la tarjeta</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Vencimiento</label>
                  <input type="text" placeholder="MM/AA" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">CVV</label>
                  <input type="text" placeholder="123" className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-mono" />
                </div>
              </div>
              <div className="p-4 bg-success/10 border border-success rounded-xl">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span><strong>Pago seguro</strong> - Conexión encriptada SSL/TLS</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <span className="font-semibold text-foreground">Total a pagar</span>
                <span className="text-2xl font-mono font-semibold text-foreground">$120.00</span>
              </div>
            </div>
          )}

          {bookingStep === 5 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-success rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-success-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 text-foreground">¡Reserva confirmada!</h3>
              <div className="bg-secondary/30 rounded-xl p-6 mb-6 text-left space-y-2">
                <p className="text-foreground"><strong>Artista:</strong> María Elena Solís</p>
                <p className="text-foreground"><strong>Fecha:</strong> 25 de mayo, 2026</p>
                <p className="text-foreground"><strong>Lugar:</strong> [Dirección del evento]</p>
                <p className="text-foreground"><strong>Monto en custodia:</strong> <span className="font-mono">$120.00</span></p>
              </div>
              <p className="text-muted-foreground mb-6">Hemos enviado los detalles de la reserva a tu correo electrónico</p>
              <button onClick={() => navigateTo("organizer-dashboard")} className="px-8 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                Ir a mi agenda
              </button>
            </div>
          )}

          {bookingStep < 5 && (
            <div className="flex gap-4 mt-8">
              {bookingStep > 1 && (
                <button onClick={() => setBookingStep(bookingStep - 1)} className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
                  Atrás
                </button>
              )}
              <button
                onClick={() => bookingStep === 4 ? setBookingStep(5) : setBookingStep(bookingStep + 1)}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium"
              >
                {bookingStep === 4 ? "Pagar $120.00 de forma segura" : bookingStep === 3 ? "Firmar digitalmente" : "Continuar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // (Continue with remaining pages in next message due to length...)

  // Organizer Dashboard
  const OrganizerDashboard = () => {
    const upcomingEvents: Booking[] = [
      { id: "1", artistName: "María Elena Solís", artistPhoto: sampleArtists[0].photo, eventType: "Evento corporativo", date: "25 Mayo 2026", time: "19:00", location: "Hotel Libertador", status: "confirmed", amount: 120 },
      { id: "2", artistName: "Carlos Andrade Trío", artistPhoto: sampleArtists[1].photo, eventType: "Boda", date: "3 Junio 2026", time: "18:00", location: "Quinta Los Jardines", status: "in-escrow", amount: 250 }
    ];

    return (
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
            <nav className="space-y-2">
              {[
                { icon: Home, label: "Inicio", active: true, view: "organizer-dashboard" },
                { icon: CalendarDays, label: "Mi agenda", active: false, view: "organizer-agenda" },
                { icon: FileCheck, label: "Mis contratos", active: false, view: "organizer-contracts" },
                { icon: MessageCircle, label: "Mensajes", active: false, badge: 3, view: "chat" },
                { icon: User, label: "Mi perfil", active: false, view: "organizer-profile" }
              ].map((item, i) => (
                <button key={i} onClick={() => navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <SidebarTopBar />
          <div className="p-8">
            <h1 className="text-4xl font-display font-bold mb-2 text-foreground">Hola, Organizador</h1>
            <p className="text-muted-foreground mb-6">Gestiona tus eventos y reservas</p>

            {/* Incomplete profile banner */}
            {profileIncomplete && (
              <div className="flex items-start gap-3 p-4 mb-6 rounded-xl border" style={{ background: "#FFF8ED", borderColor: "#D4A017" }}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#D4A017" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Tu perfil está incompleto</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Completa tu foto y datos de contacto para generar más confianza en los artistas.</p>
                </div>
                <button
                  onClick={() => navigateTo("organizer-profile")}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-accent transition-colors shrink-0"
                >
                  Completar perfil
                </button>
                <button onClick={() => setProfileIncomplete(false)} className="p-1 hover:bg-secondary rounded-full transition-colors shrink-0">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Próximo evento destacado */}
            <div className="bg-gradient-to-br from-primary to-accent p-6 rounded-2xl mb-8 text-primary-foreground">
              <h2 className="text-xl font-display font-semibold mb-4">Próximo evento</h2>
              <div className="bg-card/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{upcomingEvents[0].artistName}</h3>
                    <p className="text-sm opacity-90">{upcomingEvents[0].eventType}</p>
                  </div>
                  <span className="px-3 py-1 bg-success rounded-full text-success-foreground text-xs font-medium">Confirmado</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {upcomingEvents[0].date}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {upcomingEvents[0].location}
                  </div>
                </div>
              </div>
            </div>

            {/* Artistas sugeridos */}
            <div className="mb-8">
              <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">Artistas sugeridos para ti</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {sampleArtists.slice(0, 3).map(artist => (
                  <div key={artist.id} className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted">
                      <img src={artist.photo} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1 text-foreground">{artist.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="text-sm text-foreground">{artist.rating}</span>
                      </div>
                      <button onClick={() => navigateTo("artist-profile", artist)} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors">
                        Ver perfil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceso rápido */}
            <div>
              <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">Acceso rápido</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button onClick={() => navigateTo("catalog")} className="bg-card p-6 rounded-xl border border-border hover:border-primary transition-all text-left group">
                  <Search className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1 text-foreground">Buscar artistas</h3>
                  <p className="text-sm text-muted-foreground">Encuentra el artista perfecto para tu próximo evento</p>
                </button>
                <button onClick={() => navigateTo("chat")} className="bg-card p-6 rounded-xl border border-border hover:border-primary transition-all text-left group">
                  <MessageCircle className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-1 text-foreground">Mensajes</h3>
                  <p className="text-sm text-muted-foreground">Conversa con artistas sobre tus eventos</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Artist Dashboard
  const ArtistDashboard = () => {
    return (
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
            <nav className="space-y-2">
              {[
                { icon: Home, label: "Inicio", active: true, view: "artist-dashboard" },
                { icon: CalendarDays, label: "Mi agenda", active: false, view: "artist-agenda" },
                { icon: FileCheck, label: "Mis contratos", active: false, view: "artist-contracts" },
                { icon: MessageCircle, label: "Mensajes", active: false, badge: 3, view: "chat" },
                { icon: User, label: "Mi perfil", active: false, view: "artist-profile-edit" }
              ].map((item, i) => (
                <button key={i} onClick={() => navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-background">
          <SidebarTopBar />
          <div className="p-8">
            <h1 className="text-4xl font-display font-bold mb-2 text-foreground">Hola, Artista</h1>
            <p className="text-muted-foreground mb-6">Gestiona tus presentaciones y disponibilidad</p>

            {/* Incomplete profile banner */}
            {profileIncomplete && (
              <div className="flex items-start gap-3 p-4 mb-6 rounded-xl border" style={{ background: "#FFF8ED", borderColor: "#D4A017" }}>
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#D4A017" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Tu perfil está incompleto</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Añade fotos y un video de actuación para aumentar hasta 3× tus probabilidades de ser contratado.</p>
                </div>
                <button
                  onClick={() => navigateTo("artist-profile-edit")}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-accent transition-colors shrink-0"
                >
                  Completar perfil
                </button>
                <button onClick={() => setProfileIncomplete(false)} className="p-1 hover:bg-secondary rounded-full transition-colors shrink-0">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card p-6 rounded-2xl border border-border">
                <CalendarDays className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-3xl font-display font-bold mb-1 text-foreground">3</h3>
                <p className="text-sm text-muted-foreground">Eventos este mes</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border">
                <Star className="w-8 h-8 text-warning mb-3" />
                <h3 className="text-3xl font-display font-bold mb-1 text-foreground">4.9</h3>
                <p className="text-sm text-muted-foreground">Calificación promedio</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border">
                <DollarSign className="w-8 h-8 text-success mb-3" />
                <h3 className="text-3xl font-display font-bold mb-1 font-mono text-foreground">$360</h3>
                <p className="text-sm text-muted-foreground">Ingresos pendientes</p>
              </div>
            </div>

            {/* Estado de pago */}
            <div className="bg-warning/10 border border-warning p-6 rounded-2xl mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-warning rounded-full flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6 text-warning-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">Pago en custodia - $120.00</h3>
                  <p className="text-sm text-muted-foreground">El pago por el evento del 25 de mayo se liberará automáticamente 24 horas después del evento.</p>
                </div>
              </div>
            </div>

            {/* Próximas reservas */}
            <div className="mb-8">
              <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">Próximas presentaciones</h2>
              <div className="space-y-4">
                {sampleArtistBookings.slice(0, 2).map((event, i) => (
                  <div key={i} className="bg-card p-6 rounded-xl border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{event.artistName}</h3>
                        <p className="text-sm text-muted-foreground">{event.eventType}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.status === "confirmed" ? "bg-success text-success-foreground" :
                        event.status === "in-escrow" ? "bg-warning text-warning-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {event.status === "confirmed" ? "Confirmado" : event.status === "in-escrow" ? "Pago en custodia" : "Completado"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <DollarSign className="w-4 h-4" />
                        ${event.amount}
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar contrato
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Últimas reseñas */}
            <div>
              <h2 className="text-2xl font-display font-semibold mb-4 text-foreground">Últimas reseñas</h2>
              <div className="space-y-4">
                {[
                  { name: "Andrea M.", rating: 5, comment: "Excelente presentación, muy profesional" },
                  { name: "Roberto C.", rating: 5, comment: "Superó nuestras expectativas" }
                ].map((review, i) => (
                  <div key={i} className="bg-card p-6 rounded-xl border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{review.name}</h4>
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Organizer Agenda Page
  const OrganizerAgendaPage = () => (
    <div className="min-h-screen flex">
      <div className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
          <nav className="space-y-2">
            {[
              { icon: Home, label: "Inicio", view: "organizer-dashboard" },
              { icon: CalendarDays, label: "Mi agenda", active: true },
              { icon: FileCheck, label: "Mis contratos", view: "organizer-contracts" },
              { icon: MessageCircle, label: "Mensajes", badge: 3, view: "chat" },
              { icon: User, label: "Mi perfil", view: "organizer-profile" }
            ].map((item, i) => (
              <button key={i} onClick={() => item.view && navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
              }`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <BackButton />

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2 text-foreground">Mi agenda</h1>
              <p className="text-muted-foreground">Tus eventos contratados y próximas fechas</p>
            </div>
            <button onClick={() => navigateTo("catalog")} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full hover:bg-muted transition-colors font-medium flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Buscar nuevo artista
            </button>
          </div>

          {/* Controls */}
          <div className="bg-card p-6 rounded-2xl border border-border mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button onClick={() => setAgendaView("list")} className={`px-4 py-2 rounded-lg transition-colors ${agendaView === "list" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  Lista
                </button>
                <button onClick={() => setAgendaView("calendar")} className={`px-4 py-2 rounded-lg transition-colors ${agendaView === "calendar" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  Calendario
                </button>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "upcoming", "in-escrow", "completed", "cancelled"].map(filter => (
                <button
                  key={filter}
                  onClick={() => setAgendaFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    agendaFilter === filter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {filter === "all" && "Todos"}
                  {filter === "upcoming" && "Próximos"}
                  {filter === "in-escrow" && "Pago en custodia"}
                  {filter === "completed" && "Completados"}
                  {filter === "cancelled" && "Cancelados"}
                </button>
              ))}
            </div>
          </div>

          {/* List View */}
          {agendaView === "list" && (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="bg-card p-6 rounded-2xl border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                      <img src={booking.artistPhoto} alt={booking.artistName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-display font-semibold text-foreground mb-1">{booking.artistName}</h3>
                          <div className="flex gap-2 mb-2">
                            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">Danza</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {booking.date} · {booking.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {booking.location}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{booking.eventType}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-lg text-foreground mb-2">${booking.amount}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "in-escrow" ? "bg-warning text-warning-foreground" :
                            booking.status === "completed" ? "bg-success text-success-foreground" :
                            booking.status === "confirmed" ? "bg-primary/20 text-primary" :
                            "bg-destructive/20 text-destructive"
                          }`}>
                            {booking.status === "in-escrow" ? "Pago en custodia" :
                             booking.status === "completed" ? "Completado" :
                             booking.status === "confirmed" ? "Confirmado" :
                             "Cancelado"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Ver contrato
                        </button>
                        <button onClick={() => navigateTo("chat")} className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Ir al chat
                        </button>
                        {booking.status === "completed" && !reviewedBookingIds.has(booking.id) && userRole === "organizer" && (
                          <button
                            onClick={() => { setReviewTargetBooking(booking); setShowReviewModal(true); }}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Dejar reseña
                          </button>
                        )}
                        {booking.status === "completed" && reviewedBookingIds.has(booking.id) && (
                          <span className="px-4 py-2 rounded-full text-sm flex items-center gap-2 text-muted-foreground bg-secondary">
                            <CheckCircle className="w-4 h-4 text-success" />
                            Reseña publicada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calendar View */}
          {agendaView === "calendar" && (
            <>
              <div className="bg-card p-6 rounded-2xl border border-border">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
                    <div key={day} className="text-sm font-medium text-muted-foreground p-2">{day}</div>
                  ))}
                  {[...Array(31)].map((_, i) => {
                    const dayNum = i + 1;
                    const today = new Date().getDate();
                    const isToday = dayNum === today;
                    const hasEvent = dayNum === 25 || dayNum === 3;
                    const isPast = dayNum < today;

                    return (
                      <div key={i} className={`aspect-square p-2 rounded-lg transition-colors cursor-pointer ${
                        isToday ? "border-2 border-primary font-semibold" :
                        hasEvent && !isPast ? "bg-primary text-primary-foreground font-semibold" :
                        hasEvent && isPast ? "bg-muted text-muted-foreground" :
                        isPast ? "text-muted-foreground" :
                        "hover:bg-secondary"
                      }`}>
                        {dayNum}
                        {hasEvent && <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${hasEvent && !isPast ? 'bg-primary-foreground' : 'bg-primary'}`} style={hasEvent && !isPast ? {} : { backgroundColor: '#C1603A' }}></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event details panel (shown when a day with event is selected) */}
              <div className="bg-card p-6 rounded-2xl border border-border mt-4">
                <h3 className="font-display font-semibold mb-4 text-foreground">Evento del 25 de Mayo</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                      <img src={sampleOrganizerBookings[0].artistPhoto} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{sampleOrganizerBookings[0].artistName}</p>
                      <p className="text-sm text-muted-foreground">{sampleOrganizerBookings[0].eventType}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>⏰ {sampleOrganizerBookings[0].time}</p>
                    <p>📍 {sampleOrganizerBookings[0].location}</p>
                    <p className="font-mono">💵 ${sampleOrganizerBookings[0].amount}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors">
                      Ver detalles
                    </button>
                    <button onClick={() => navigateTo("chat")} className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors">
                      Ir al chat
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Empty State */}
          {filteredBookings.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
                <CalendarDays className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">Aún no tienes eventos agendados</h3>
              <p className="text-muted-foreground mb-6">Comienza a buscar artistas para tus próximos eventos</p>
              <button onClick={() => navigateTo("catalog")} className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                Buscar artistas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Organizer Contracts Page
  const OrganizerContractsPage = () => (
    <div className="min-h-screen flex">
      <div className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
          <nav className="space-y-2">
            {[
              { icon: Home, label: "Inicio", view: "organizer-dashboard" },
              { icon: CalendarDays, label: "Mi agenda", view: "organizer-agenda" },
              { icon: FileCheck, label: "Mis contratos", active: true },
              { icon: MessageCircle, label: "Mensajes", badge: 3, view: "chat" },
              { icon: User, label: "Mi perfil", view: "organizer-profile" }
            ].map((item, i) => (
              <button key={i} onClick={() => item.view && navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
              }`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-8">
          <BackButton />

          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2 text-foreground">Mis contratos</h1>
            <p className="text-muted-foreground">Historial de todos tus acuerdos formalizados</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card p-6 rounded-2xl border border-border mb-8">
            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-foreground">Buscar</label>
                <input
                  type="text"
                  value={contractsSearchTerm}
                  onChange={(e) => setContractsSearchTerm(e.target.value)}
                  placeholder="Nombre del artista o tipo de evento"
                  className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Estado</label>
                <select
                  value={contractFilter}
                  onChange={(e) => setContractFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">Todos</option>
                  <option value="signed">Firmados</option>
                  <option value="pending">Pendiente de firma</option>
                  <option value="cancelled">Cancelados</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Orden</label>
                <select className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Más reciente</option>
                  <option>Más antiguo</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{filteredContracts.length} contratos encontrados</p>
          </div>

          {/* Contracts List */}
          {filteredContracts.length > 0 ? (
            <div className="space-y-4">
              {filteredContracts.map(contract => {
                const isPhysical = physicallySignedIds.has(contract.id);
                const effectiveStatus = isPhysical ? "signed-physical" : contract.contractStatus;
                const canUpload = !isPhysical && (contract.contractStatus === "pending-organizer" || contract.contractStatus === "pending-artist" || contract.contractStatus === "signed");
                return (
                <div key={contract.id} className="bg-card p-6 rounded-2xl border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-lg font-semibold text-foreground">{contract.contractNumber}</span>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          effectiveStatus === "signed-physical" ? "bg-success text-success-foreground" :
                          effectiveStatus === "signed" ? "bg-success text-success-foreground" :
                          effectiveStatus === "pending-organizer" ? "bg-warning text-warning-foreground" :
                          effectiveStatus === "pending-artist" ? "bg-warning text-warning-foreground" :
                          "bg-destructive/20 text-destructive"
                        }`}>
                          {effectiveStatus === "signed-physical" && <><FileText className="w-3 h-3" />Firmado presencialmente</>}
                          {effectiveStatus === "signed" && "Firmado por ambas partes"}
                          {effectiveStatus === "pending-organizer" && <><AlertTriangle className="w-3 h-3" />Pendiente tu firma</>}
                          {effectiveStatus === "pending-artist" && "Pendiente firma del artista"}
                          {effectiveStatus === "cancelled" && "Cancelado"}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{contract.artistName}</h3>
                      <div className="flex gap-2 mb-2">
                        <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">{contract.discipline}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div>{contract.eventType}</div>
                        <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{contract.eventDate}</div>
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{contract.location}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-2xl font-semibold text-foreground">${contract.amount}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => { setSelectedContract(contract); setShowContractModal(true); }} className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                      <Eye className="w-4 h-4" />Ver contrato
                    </button>
                    <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />Descargar PDF
                    </button>
                    {canUpload && (
                      <button
                        onClick={() => { setUploadTargetContract(contract); setShowUploadModal(true); }}
                        className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                      >
                        <UploadCloud className="w-4 h-4" />Subir contrato firmado
                      </button>
                    )}
                    {effectiveStatus === "pending-organizer" && (
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />Firmar
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">Aún no tienes contratos</h3>
              <p className="text-muted-foreground mb-6">Se generan automáticamente al confirmar una reserva</p>
              <button onClick={() => navigateTo("catalog")} className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors">
                Buscar artistas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contract Modal */}
      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-foreground">Contrato de Prestación de Servicios</h2>
              <button onClick={() => setShowContractModal(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 bg-background/50">
              <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-1">Número de contrato</h3>
                    <p className="font-mono text-lg font-semibold text-foreground">{selectedContract.contractNumber}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Organizador</h3>
                      <p className="text-foreground">Andrea Mora</p>
                      <p className="text-sm text-muted-foreground">andrea.mora@email.com</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Artista</h3>
                      <p className="text-foreground">{selectedContract.artistName}</p>
                      <p className="text-sm text-muted-foreground">{selectedContract.discipline}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4 text-foreground">Detalles del servicio</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tipo de evento:</span>
                        <span className="ml-2 text-foreground font-medium">{selectedContract.eventType}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="ml-2 text-foreground font-medium">{selectedContract.eventDate}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Lugar:</span>
                        <span className="ml-2 text-foreground font-medium">{selectedContract.location}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duración:</span>
                        <span className="ml-2 text-foreground font-medium">1 hora</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4 text-foreground">Desglose económico</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tarifa bruta:</span>
                        <span className="font-mono text-foreground">${selectedContract.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Comisión ArtistaYa! (12%):</span>
                        <span className="font-mono text-destructive">-${(selectedContract.amount * 0.12).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold text-foreground">Monto neto al artista:</span>
                        <span className="font-mono font-semibold text-foreground">${selectedContract.netAmount}</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-2 text-foreground">Condiciones de cancelación</h3>
                    <p className="text-sm text-muted-foreground">
                      Cancelación hasta 48h antes del evento: reembolso del 100%. Cancelación entre 24-48h: reembolso del 50%. Menos de 24h: sin reembolso.
                    </p>
                  </div>
                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4 text-foreground">Firmas digitales</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">Organizador</p>
                        {selectedContract.contractStatus === "signed" ? (
                          <>
                            <p className="text-sm text-muted-foreground">Firmado el {selectedContract.signedDate}</p>
                            <div className="mt-2 font-display text-2xl text-primary">Andrea Mora</div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Pendiente de firma</p>
                        )}
                      </div>
                      <div className="p-4 bg-secondary/30 rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">Artista</p>
                        {selectedContract.contractStatus === "signed" ? (
                          <>
                            <p className="text-sm text-muted-foreground">Firmado el {selectedContract.signedDate}</p>
                            <div className="mt-2 font-display text-2xl text-primary">{selectedContract.artistName}</div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Pendiente de firma</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-card border-t border-border p-6 flex flex-wrap gap-3">
              <button className="px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium flex items-center gap-2">
                <Download className="w-5 h-5" />
                Descargar PDF
              </button>
              {selectedContract && !physicallySignedIds.has(selectedContract.id) && (
                <button
                  onClick={() => { setUploadTargetContract(selectedContract); setShowContractModal(false); setShowUploadModal(true); }}
                  className="px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium flex items-center gap-2"
                >
                  <UploadCloud className="w-5 h-5" />
                  Subir contrato firmado
                </button>
              )}
              <button onClick={() => setShowContractModal(false)} className="ml-auto px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {showUploadModal && <UploadContractModal />}
    </div>
  );

  // Artist Agenda Page
  const ArtistAgendaPage = () => {
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const toggleDateBlock = (day: number) => {
      const dateToToggle = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isBlocked = blockedDates.some(d =>
        d.getDate() === day &&
        d.getMonth() === currentMonth.getMonth() &&
        d.getFullYear() === currentMonth.getFullYear()
      );

      if (isBlocked) {
        setBlockedDates(blockedDates.filter(d => !(d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear())));
      } else {
        setBlockedDates([...blockedDates, dateToToggle]);
      }
      setHasUnsavedChanges(true);
    };

    const saveAvailabilityChanges = () => {
      setHasUnsavedChanges(false);
    };

    const isDateBlocked = (day: number) => {
      return blockedDates.some(d =>
        d.getDate() === day &&
        d.getMonth() === currentMonth.getMonth() &&
        d.getFullYear() === currentMonth.getFullYear()
      );
    };

    const hasEventOnDate = (day: number) => {
      return day === 25 || day === 3;
    };

    const isWithin24Hours = (eventDateStr: string) => {
      return false;
    };

    return (
      <div className="min-h-screen flex">
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
            <nav className="space-y-2">
              {[
                { icon: Home, label: "Inicio", view: "artist-dashboard" },
                { icon: CalendarDays, label: "Mi agenda", active: true },
                { icon: FileCheck, label: "Mis contratos", view: "artist-contracts" },
                { icon: MessageCircle, label: "Mensajes", badge: 2, view: "chat" },
                { icon: User, label: "Mi perfil", view: "artist-profile-edit" }
              ].map((item, i) => (
                <button key={i} onClick={() => item.view && navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-background">
          <SidebarTopBar />
          <div className="p-8 pb-24">
            <BackButton />

            <div className="mb-8">
              <h1 className="text-4xl font-display font-bold mb-2 text-foreground">Mi agenda</h1>
              <p className="text-muted-foreground">Gestiona tu disponibilidad y fechas comprometidas</p>
            </div>

            {/* Panel de disponibilidad */}
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 p-6 rounded-2xl mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-1">Panel de disponibilidad</h2>
                  <p className="text-sm text-muted-foreground">Bloquea fechas en las que no estés disponible para reservas</p>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-secondary rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center mb-4">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
                    <div key={day} className="text-sm font-medium text-muted-foreground p-2">{day}</div>
                  ))}
                  {[...Array(31)].map((_, i) => {
                    const dayNum = i + 1;
                    const today = new Date().getDate();
                    const isToday = dayNum === today;
                    const hasEvent = hasEventOnDate(dayNum);
                    const isBlocked = isDateBlocked(dayNum);
                    const isPast = dayNum < today;

                    return (
                      <button
                        key={i}
                        onClick={() => !hasEvent && !isPast && toggleDateBlock(dayNum)}
                        disabled={hasEvent || isPast}
                        className={`aspect-square p-2 rounded-lg transition-all relative ${
                          isToday ? "border-2 border-primary font-semibold" : ""
                        } ${
                          hasEvent ? "bg-primary text-primary-foreground font-semibold cursor-not-allowed" :
                          isBlocked ? "bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80" :
                          isPast ? "text-muted-foreground cursor-not-allowed" :
                          "hover:bg-success/20 cursor-pointer"
                        }`}
                      >
                        {dayNum}
                        {hasEvent && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground mx-auto mt-1"></div>}
                        {isBlocked && !hasEvent && <Lock className="w-3 h-3 absolute top-1 right-1 opacity-60" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-6 text-sm pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded"></div>
                    <span className="text-muted-foreground">Reservado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                    <span className="text-muted-foreground">Bloqueado por ti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-success/40 rounded"></div>
                    <span className="text-muted-foreground">Disponible</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-card p-6 rounded-2xl border border-border mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <button onClick={() => setAgendaView("list")} className={`px-4 py-2 rounded-lg transition-colors ${agendaView === "list" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    Lista
                  </button>
                  <button onClick={() => setAgendaView("calendar")} className={`px-4 py-2 rounded-lg transition-colors ${agendaView === "calendar" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    Calendario
                  </button>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "upcoming", "in-escrow", "completed"].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setAgendaFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      agendaFilter === filter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {filter === "all" && "Todos"}
                    {filter === "upcoming" && "Próximos"}
                    {filter === "in-escrow" && "Pago en custodia"}
                    {filter === "completed" && "Completados"}
                  </button>
                ))}
              </div>
            </div>

            {/* List View */}
            {agendaView === "list" && filteredBookings.length > 0 && (
              <div className="space-y-4">
                {filteredBookings.map(booking => {
                  const grossAmount = booking.amount / 0.88;
                  const commission = grossAmount * 0.12;
                  const within24h = isWithin24Hours(booking.date);

                  return (
                    <div key={booking.id} className="bg-card p-6 rounded-2xl border border-border">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shrink-0">
                          <img src={booking.artistPhoto} alt={booking.artistName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-display font-semibold text-foreground mb-1">{booking.artistName}</h3>
                              <div className="flex gap-2 mb-2">
                                <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">{booking.eventType}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {booking.date} · {booking.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {booking.location}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <details className="cursor-pointer group">
                                <summary className="list-none">
                                  <p className="font-mono font-semibold text-lg text-foreground mb-2 flex items-center gap-1">
                                    ${booking.amount.toFixed(2)}
                                    <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                                  </p>
                                </summary>
                                <div className="mt-2 p-3 bg-background rounded-lg text-sm space-y-1 min-w-[200px]">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tarifa bruta:</span>
                                    <span className="font-mono">${grossAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Comisión (12%):</span>
                                    <span className="font-mono text-destructive">-${commission.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-border font-semibold">
                                    <span>Monto neto:</span>
                                    <span className="font-mono">${booking.amount.toFixed(2)}</span>
                                  </div>
                                </div>
                              </details>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "in-escrow" ? "bg-warning text-warning-foreground" :
                                booking.status === "completed" ? "bg-success text-success-foreground" :
                                booking.status === "confirmed" ? "bg-primary/20 text-primary" :
                                "bg-destructive/20 text-destructive"
                              }`}>
                                {booking.status === "in-escrow" ? "Pago en custodia" :
                                 booking.status === "completed" ? "Completado" :
                                 booking.status === "confirmed" ? "Confirmado" :
                                 "Cancelado"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Ver contrato
                            </button>
                            <button onClick={() => navigateTo("chat")} className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                              <MessageCircle className="w-4 h-4" />
                              Ir al chat
                            </button>
                            {within24h && booking.status === "confirmed" && (
                              <button className="px-4 py-2 bg-success text-success-foreground rounded-full text-sm hover:bg-success/90 transition-colors flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Confirmar asistencia
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calendar View */}
            {agendaView === "calendar" && (
              <>
                <div className="bg-card p-6 rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-display font-semibold text-foreground">
                      {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-secondary rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
                      <div key={day} className="text-sm font-medium text-muted-foreground p-2">{day}</div>
                    ))}
                    {[...Array(31)].map((_, i) => {
                      const dayNum = i + 1;
                      const today = new Date().getDate();
                      const isToday = dayNum === today;
                      const hasEvent = hasEventOnDate(dayNum);
                      const isPast = dayNum < today;

                      return (
                        <div
                          key={i}
                          onClick={() => hasEvent && setSelectedDate(dayNum)}
                          className={`aspect-square p-2 rounded-lg transition-colors ${hasEvent ? 'cursor-pointer' : ''} ${
                            isToday ? "border-2 border-primary font-semibold" :
                            hasEvent && !isPast ? "bg-primary text-primary-foreground font-semibold" :
                            hasEvent && isPast ? "bg-muted text-muted-foreground" :
                            isPast ? "text-muted-foreground" :
                            "hover:bg-secondary"
                          }`}
                        >
                          {dayNum}
                          {hasEvent && <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${hasEvent && !isPast ? 'bg-primary-foreground' : 'bg-primary'}`} style={hasEvent && !isPast ? {} : { backgroundColor: '#C1603A' }}></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="bg-card p-6 rounded-2xl border border-border mt-4">
                    <h3 className="font-display font-semibold mb-4 text-foreground">Evento del {selectedDate} de Mayo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                          <img src={sampleArtistBookings[0].artistPhoto} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{sampleArtistBookings[0].artistName}</p>
                          <p className="text-sm text-muted-foreground">{sampleArtistBookings[0].eventType}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>⏰ {sampleArtistBookings[0].time}</p>
                        <p>📍 {sampleArtistBookings[0].location}</p>
                        <p className="font-mono">💵 ${sampleArtistBookings[0].amount.toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors">
                          Ver detalles
                        </button>
                        <button onClick={() => navigateTo("chat")} className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors">
                          Ir al chat
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {filteredBookings.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
                  <CalendarDays className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">No tienes eventos próximos</h3>
                <p className="text-muted-foreground mb-6">Mantén tu perfil actualizado para aparecer en búsquedas</p>
                <button onClick={() => navigateTo("artist-profile-edit")} className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                  Ir a mi perfil
                </button>
              </div>
            )}
          </div>

          {/* Sticky Save Button */}
          {hasUnsavedChanges && (
            <div className="fixed bottom-0 left-64 right-0 bg-card border-t border-border p-4 shadow-lg">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Tienes cambios sin guardar en tu disponibilidad</p>
                <div className="flex gap-3">
                  <button onClick={() => { setBlockedDates([]); setHasUnsavedChanges(false); }} className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors">
                    Cancelar
                  </button>
                  <button onClick={saveAvailabilityChanges} className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Guardar cambios de disponibilidad
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Artist Contracts Page
  const ArtistContractsPage = () => {
    const monthlyIncome = sampleContracts
      .filter(c => c.paymentStatus === "released" && c.eventDate.includes("Mayo"))
      .reduce((sum, c) => sum + (c.netAmount || 0), 0);

    const previousMonthIncome = sampleContracts
      .filter(c => c.paymentStatus === "released" && c.eventDate.includes("Marzo"))
      .reduce((sum, c) => sum + (c.netAmount || 0), 0);

    const pendingPayments = sampleContracts
      .filter(c => c.paymentStatus === "in-escrow")
      .reduce((sum, c) => sum + (c.netAmount || 0), 0);

    return (
      <div className="min-h-screen flex">
        <div className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
            <nav className="space-y-2">
              {[
                { icon: Home, label: "Inicio", view: "artist-dashboard" },
                { icon: CalendarDays, label: "Mi agenda", view: "artist-agenda" },
                { icon: FileCheck, label: "Mis contratos", active: true },
                { icon: MessageCircle, label: "Mensajes", badge: 3, view: "chat" },
                { icon: User, label: "Mi perfil", view: "artist-profile-edit" }
              ].map((item, i) => (
                <button key={i} onClick={() => item.view && navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                  item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
                }`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                  )}
                </button>
              ))}
            </nav>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
              <LogOut className="w-5 h-5" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-background">
          <SidebarTopBar />
            <div className="p-8">
              <BackButton />

              <div className="mb-8">
                <h1 className="text-4xl font-display font-bold mb-2 text-foreground">Mis contratos</h1>
                <p className="text-muted-foreground">Tus acuerdos de prestación de servicios</p>
              </div>

              {/* Search and Filters */}
              <div className="bg-card p-6 rounded-2xl border border-border mb-8">
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-foreground">Buscar</label>
                    <input
                      type="text"
                      value={contractsSearchTerm}
                      onChange={(e) => setContractsSearchTerm(e.target.value)}
                      placeholder="Nombre del organizador o tipo de evento"
                      className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Estado contrato</label>
                    <select
                      value={contractFilter}
                      onChange={(e) => setContractFilter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">Todos</option>
                      <option value="signed">Firmados</option>
                      <option value="pending">Pendiente de firma</option>
                      <option value="cancelled">Cancelados</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Estado pago</label>
                    <select className="w-full px-4 py-2 rounded-lg bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      <option>Todos</option>
                      <option>Pago en custodia</option>
                      <option>Pago liberado</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{filteredContracts.length} contratos encontrados</p>
              </div>

              {/* Contracts List */}
              {filteredContracts.length > 0 ? (
                <div className="space-y-4">
                  {filteredContracts.map(contract => {
                    const isPhysical = physicallySignedIds.has(contract.id);
                    const effectiveStatus = isPhysical ? "signed-physical" : contract.contractStatus;
                    const canUpload = !isPhysical && (contract.contractStatus === "pending-artist" || contract.contractStatus === "pending-organizer" || contract.contractStatus === "signed");
                    return (
                    <div key={contract.id} className="bg-card p-6 rounded-2xl border border-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-mono text-lg font-semibold text-foreground">{contract.contractNumber}</span>
                            <div className="flex gap-2 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                effectiveStatus === "signed-physical" ? "bg-success text-success-foreground" :
                                effectiveStatus === "signed" ? "bg-success text-success-foreground" :
                                effectiveStatus === "pending-artist" ? "bg-warning text-warning-foreground" :
                                "bg-destructive/20 text-destructive"
                              }`}>
                                {effectiveStatus === "signed-physical" && <><FileText className="w-3 h-3" />Firmado presencialmente</>}
                                {effectiveStatus === "signed" && "Firmado"}
                                {effectiveStatus === "pending-artist" && "Pendiente tu firma"}
                                {effectiveStatus === "cancelled" && "Cancelado"}
                              </span>
                              {contract.paymentStatus && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  contract.paymentStatus === "in-escrow" ? "bg-warning text-warning-foreground" :
                                  contract.paymentStatus === "released" ? "bg-success text-success-foreground" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {contract.paymentStatus === "in-escrow" && "En custodia"}
                                  {contract.paymentStatus === "released" && "Liberado"}
                                  {contract.paymentStatus === "pending" && "—"}
                                </span>
                              )}
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">Organizador: Andrea Mora</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div>{contract.eventType}</div>
                            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{contract.eventDate}</div>
                          </div>
                          <p className="text-sm text-muted-foreground">Monto neto: <span className="font-mono font-semibold text-foreground">${contract.netAmount}</span> (después de comisión 12%)</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => { setSelectedContract(contract); setShowContractModal(true); }} className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                          <Eye className="w-4 h-4" />Ver contrato
                        </button>
                        <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2">
                          <Download className="w-4 h-4" />Descargar PDF
                        </button>
                        {canUpload && (
                          <button
                            onClick={() => { setUploadTargetContract(contract); setShowUploadModal(true); }}
                            className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                          >
                            <UploadCloud className="w-4 h-4" />Subir contrato firmado
                          </button>
                        )}
                        {effectiveStatus === "pending-artist" && (
                          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors flex items-center gap-2">
                            <Edit2 className="w-4 h-4" />Firmar
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold mb-2 text-foreground">Aún no tienes contratos</h3>
                  <p className="text-muted-foreground">Cuando un organizador confirme una reserva contigo, el contrato aparecerá aquí</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary Sidebar */}
          <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto hidden lg:block">
            <h2 className="text-xl font-display font-semibold mb-6 text-foreground">Resumen financiero</h2>
            <div className="space-y-4">
              <div className="p-4 bg-success/10 border border-success rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Ingresos mes actual</p>
                <p className="text-2xl font-mono font-bold text-success">${monthlyIncome.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Mayo 2026</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Ingresos mes anterior</p>
                <p className="text-2xl font-mono font-bold text-foreground">${previousMonthIncome.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Abril 2026</p>
              </div>
              <div className="p-4 bg-warning/10 border border-warning rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Pagos pendientes</p>
                <p className="text-2xl font-mono font-bold text-warning">${pendingPayments.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">En custodia</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-foreground">
                  <strong>Nota:</strong> Los pagos se liberan automáticamente 24h después del evento si no hay disputas activas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Modal - Same as Organizer */}
        {showContractModal && selectedContract && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h2 className="text-2xl font-display font-bold text-foreground">Contrato de Prestación de Servicios</h2>
                <button onClick={() => setShowContractModal(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 bg-background/50">
                <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">Número de contrato</h3>
                      <p className="font-mono text-lg font-semibold text-foreground">{selectedContract.contractNumber}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">Organizador</h3>
                        <p className="text-foreground">Andrea Mora</p>
                        <p className="text-sm text-muted-foreground">andrea.mora@email.com</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground mb-1">Artista</h3>
                        <p className="text-foreground">{selectedContract.artistName}</p>
                        <p className="text-sm text-muted-foreground">{selectedContract.discipline}</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold mb-4 text-foreground">Detalles del servicio</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Tipo de evento:</span>
                          <span className="ml-2 text-foreground font-medium">{selectedContract.eventType}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fecha:</span>
                          <span className="ml-2 text-foreground font-medium">{selectedContract.eventDate}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Lugar:</span>
                          <span className="ml-2 text-foreground font-medium">{selectedContract.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold mb-4 text-foreground">Desglose económico</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tarifa bruta:</span>
                          <span className="font-mono text-foreground">${selectedContract.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Comisión ArtistaYa! (12%):</span>
                          <span className="font-mono text-destructive">-${(selectedContract.amount * 0.12).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border">
                          <span className="font-semibold text-foreground">Monto neto al artista:</span>
                          <span className="font-mono font-semibold text-foreground">${selectedContract.netAmount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold mb-2 text-foreground">Condiciones de cancelación</h3>
                      <p className="text-sm text-muted-foreground">
                        Cancelación hasta 48h antes del evento: reembolso del 100%. Cancelación entre 24-48h: reembolso del 50%. Menos de 24h: sin reembolso.
                      </p>
                    </div>
                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold mb-4 text-foreground">Firmas digitales</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/30 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Organizador</p>
                          {selectedContract.contractStatus === "signed" ? (
                            <>
                              <p className="text-sm text-muted-foreground">Firmado el {selectedContract.signedDate}</p>
                              <div className="mt-2 font-display text-2xl text-primary">Andrea Mora</div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Pendiente de firma</p>
                          )}
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-1">Artista</p>
                          {selectedContract.contractStatus === "signed" ? (
                            <>
                              <p className="text-sm text-muted-foreground">Firmado el {selectedContract.signedDate}</p>
                              <div className="mt-2 font-display text-2xl text-primary">{selectedContract.artistName}</div>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground">Pendiente de firma</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-card border-t border-border p-6 flex flex-wrap gap-3">
                <button className="px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
                {selectedContract && !physicallySignedIds.has(selectedContract.id) && (
                  <button
                    onClick={() => { setUploadTargetContract(selectedContract); setShowContractModal(false); setShowUploadModal(true); }}
                    className="px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium flex items-center gap-2"
                  >
                    <UploadCloud className="w-5 h-5" />
                    Subir contrato firmado
                  </button>
                )}
                <button onClick={() => setShowContractModal(false)} className="ml-auto px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {showUploadModal && <UploadContractModal />}
      </div>
    );
  };

  // Organizer Profile Page
  const OrganizerProfilePage = () => (
    <div className="min-h-screen flex">
      <div className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
          <nav className="space-y-2">
            {[
              { icon: Home, label: "Inicio", view: "organizer-dashboard" },
              { icon: CalendarDays, label: "Mi agenda", view: "organizer-agenda" },
              { icon: FileCheck, label: "Mis contratos", view: "organizer-contracts" },
              { icon: MessageCircle, label: "Mensajes", badge: 3, view: "chat" },
              { icon: User, label: "Mi perfil", active: true }
            ].map((item, i) => (
              <button key={i} onClick={() => item.view && navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
              }`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto p-8">
          <BackButton />

          <div className="flex items-start justify-between mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground">Mi perfil</h1>
            <button onClick={() => setEditMode(!editMode)} className={`px-6 py-3 rounded-full transition-colors font-medium flex items-center gap-2 ${
              editMode ? "border border-border hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-accent"
            }`}>
              <Edit2 className="w-5 h-5" />
              {editMode ? "Cancelar" : "Editar perfil"}
            </button>
          </div>

          {/* Identity Section */}
          <div className="bg-card p-8 rounded-2xl border border-border mb-6">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Información personal</h2>

            <div className="flex items-start gap-8 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                </div>
                {editMode && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-success text-success-foreground text-sm rounded-full flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Identidad verificada
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Nombre completo</label>
                {editMode ? (
                  <input type="text" defaultValue="Andrea Mora" className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : (
                  <p className="text-lg text-foreground">Andrea Mora</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Profesión / Empresa</label>
                {editMode ? (
                  <input type="text" defaultValue="Gerente de Eventos - Hotel Libertador" className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : (
                  <p className="text-lg text-foreground">Gerente de Eventos - Hotel Libertador</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Número de teléfono</label>
                {editMode ? (
                  <input type="tel" defaultValue="+593 99 123 4567" className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : (
                  <p className="text-lg text-foreground flex items-center gap-2">
                    +593 99 123 4567
                    <span className="text-sm text-muted-foreground">(WhatsApp)</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Correo electrónico</label>
                <div className="flex items-center justify-between">
                  <p className="text-lg text-foreground">andrea.mora@email.com</p>
                  {!editMode && (
                    <button className="text-sm text-primary hover:text-accent">Cambiar correo</button>
                  )}
                </div>
                {editMode && (
                  <p className="text-sm text-muted-foreground mt-1">El correo no se puede editar desde aquí. Usa el enlace "Cambiar correo".</p>
                )}
              </div>
            </div>

            {editMode && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-border">
                <button onClick={() => setEditMode(false)} className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
                  Cancelar
                </button>
                <button onClick={() => setEditMode(false)} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                  Guardar cambios
                </button>
              </div>
            )}
          </div>

          {/* Platform History */}
          <div className="bg-card p-8 rounded-2xl border border-border mb-6">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Historial en la plataforma</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-secondary/30 rounded-xl">
                <p className="text-4xl font-display font-bold text-primary mb-2">3</p>
                <p className="text-sm text-muted-foreground">Eventos contratados</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-3">Artistas contratados</p>
                <div className="flex gap-2">
                  {sampleArtists.slice(0, 3).map(artist => (
                    <div key={artist.id} className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                      <img src={artist.photo} alt={artist.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-4">Miembro desde: <span className="text-foreground font-medium">Enero 2026</span></p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Seguridad</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Cambiar contraseña</p>
                    <p className="text-sm text-muted-foreground">Actualiza tu contraseña</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors text-destructive">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Eliminar cuenta</p>
                    <p className="text-sm opacity-75">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Artist Profile Edit Page
  const ArtistProfileEditPage = () => (
    <div className="min-h-screen flex">
      <div className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <button onClick={() => navigateTo("landing")} className="text-2xl font-display font-semibold text-primary mb-8">ArtistaYa!</button>
          <nav className="space-y-2">
            {[
              { icon: Home, label: "Inicio", view: "artist-dashboard" },
              { icon: CalendarDays, label: "Mi agenda", view: "artist-agenda" },
              { icon: FileCheck, label: "Mis contratos", view: "artist-contracts" },
              { icon: MessageCircle, label: "Mensajes", badge: 3, view: "chat" },
              { icon: User, label: "Mi perfil", active: true }
            ].map((item, i) => (
              <button key={i} onClick={() => item.view && navigateTo(item.view as View)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                item.active ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"
              }`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="absolute right-3 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 mt-8 rounded-lg hover:bg-secondary text-destructive">
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-5xl mx-auto p-8">
          <BackButton />

          <div className="flex items-start justify-between mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground">Mi perfil</h1>
            <div className="flex gap-3">
              <button className="px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Ver cómo me ven
              </button>
              <button onClick={() => setEditMode(!editMode)} className={`px-6 py-3 rounded-full transition-colors font-medium flex items-center gap-2 ${
                editMode ? "border border-border hover:bg-secondary" : "bg-primary text-primary-foreground hover:bg-accent"
              }`}>
                <Edit2 className="w-5 h-5" />
                {editMode ? "Cancelar" : "Editar perfil"}
              </button>
            </div>
          </div>

          {/* Cover and Profile */}
          <div className="bg-card rounded-2xl overflow-hidden border border-border mb-6">
            <div className="h-48 bg-gradient-to-br from-primary to-accent relative">
              <img src="https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1200&h=400&fit=crop" alt="Cover" className="w-full h-full object-cover opacity-30" />
              {editMode && (
                <button className="absolute top-4 right-4 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-full flex items-center gap-2 hover:bg-card transition-colors">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm font-medium">Cambiar portada</span>
                </button>
              )}
            </div>
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 -mt-12">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-card bg-muted overflow-hidden">
                    <img src={sampleArtists[0].photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  {editMode && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-accent transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1 mt-14">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-success text-success-foreground text-sm rounded-full flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Perfil verificado
                    </span>
                    <button className="px-3 py-1 bg-success/20 text-success text-sm rounded-full flex items-center gap-2">
                      Activo en el catálogo
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                    </button>
                  </div>
                  {editMode ? (
                    <input type="text" defaultValue="María Elena Solís" className="text-3xl font-display font-bold mb-2 w-full bg-input-background border-2 border-primary rounded-lg px-4 py-2" />
                  ) : (
                    <h2 className="text-3xl font-display font-bold mb-2 text-foreground">María Elena Solís</h2>
                  )}
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">Danza</span>
                    <span className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full">Ballet</span>
                    {editMode && (
                      <button className="px-3 py-1 border border-border text-sm rounded-full hover:bg-secondary transition-colors">+ Agregar</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Me */}
          <div className="bg-card p-8 rounded-2xl border border-border mb-6">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Sobre mí</h2>
            {editMode ? (
              <textarea
                defaultValue="Bailarina profesional con 15 años de experiencia en ballet clásico y contemporáneo. He participado en más de 50 eventos corporativos y sociales."
                className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
              />
            ) : (
              <p className="text-foreground mb-6">Bailarina profesional con 15 años de experiencia en ballet clásico y contemporáneo. He participado en más de 50 eventos corporativos y sociales.</p>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Años de experiencia</label>
                {editMode ? (
                  <input type="number" defaultValue="15" className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                ) : (
                  <p className="text-lg text-foreground">15 años</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Ciudad</label>
                <p className="text-lg text-muted-foreground">Loja, Ecuador (no editable)</p>
              </div>
            </div>
          </div>

          {/* Rates */}
          <div className="bg-card p-8 rounded-2xl border border-border mb-6">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Tarifas</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Tarifa por hora</label>
                {editMode ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-mono">$</span>
                    <input type="number" defaultValue="100" className="w-full pl-8 pr-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ) : (
                  <p className="text-2xl font-mono font-semibold text-foreground">$100</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Tarifa por evento</label>
                {editMode ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-mono">$</span>
                    <input type="number" defaultValue="120" className="w-full pl-8 pr-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ) : (
                  <p className="text-2xl font-mono font-semibold text-foreground">$120</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={false} disabled={!editMode} className="w-5 h-5 accent-primary" />
                <span className="text-foreground">Incluye traslado</span>
              </label>
            </div>
            {editMode && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Nota adicional de precios (opcional)</label>
                <textarea
                  placeholder="Ej: Los traslados fuera de Loja tienen costo adicional"
                  className="w-full px-4 py-3 rounded-lg bg-input-background border-2 border-primary text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>

          {/* Portfolio */}
          <div className="bg-card p-8 rounded-2xl border border-border mb-6">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Portafolio multimedia</h2>
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {sampleArtists[0].portfolio.map((img, i) => (
                  <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {editMode && (
                      <button className="absolute top-2 right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editMode && (
                <button className="w-full py-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Agregar fotos (máx. 10)</span>
                </button>
              )}
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-foreground">Video de presentación</h3>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <p className="text-muted-foreground">Video de presentación</p>
                </div>
              </div>
              {editMode && (
                <button className="px-4 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors">
                  Reemplazar video
                </button>
              )}
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Nota:</strong> Sube al menos 1 video de tu actuación. Es lo que más influye en la decisión de contratar.
              </p>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-card p-8 rounded-2xl border border-border mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-semibold text-foreground">Disponibilidad</h2>
              <button onClick={() => navigateTo("artist-agenda")} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:bg-accent transition-colors">
                Gestionar disponibilidad
              </button>
            </div>
            <div className="bg-secondary/20 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">Vista compacta del calendario (solo lectura)</p>
              <p className="text-sm text-center text-foreground mt-2">Próximos eventos: 25 Mayo, 3 Junio</p>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-card p-8 rounded-2xl border border-border mb-6">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Mis reseñas</h2>
            <div className="flex items-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-6xl font-display font-bold text-primary">4.9</p>
                <div className="flex gap-1 justify-center my-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">23 reseñas</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map(stars => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-8">{stars} ★</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full bg-warning`} style={{ width: stars === 5 ? '85%' : stars === 4 ? '10%' : '5%' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {stars === 5 ? '85%' : stars === 4 ? '10%' : '5%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 mb-4">
              {[
                { name: "Andrea M.", rating: 5, comment: "Excelente presentación en nuestra boda", date: "15 Mar 2026" },
                { name: "Roberto C.", rating: 5, comment: "Muy profesional, lo recomiendo", date: "8 Feb 2026" },
                { name: "Gabriela S.", rating: 4, comment: "Buena presentación", date: "22 Ene 2026" }
              ].map((review, i) => (
                <div key={i} className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigateTo("all-reviews")} className="text-primary hover:text-accent font-medium">Ver todas las reseñas →</button>
          </div>

          {/* Security */}
          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="text-2xl font-display font-semibold mb-6 text-foreground">Seguridad</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-secondary transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Cambiar contraseña</p>
                    <p className="text-sm text-muted-foreground">Actualiza tu contraseña</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </button>

              <button className="w-full flex items-center justify-between p-4 border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors text-destructive">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Eliminar cuenta</p>
                    <p className="text-sm opacity-75">Esta acción no se puede deshacer</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {editMode && (
            <div className="flex gap-4 mt-8">
              <button onClick={() => setEditMode(false)} className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium">
                Cancelar
              </button>
              <button onClick={() => setEditMode(false)} className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-accent transition-colors font-medium">
                Guardar cambios
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Reply modal for artist responding to reviews
  const ReplyModal = () => {
    if (replyTargetId === null) return null;
    const reviews = [
      { id: 0, name: "Andrea M.", rating: 5, comment: "Excelente presentación en nuestra boda. Muy profesional y puntual. Los invitados quedaron encantados.", date: "15 de marzo, 2026" },
      { id: 1, name: "Roberto C.", rating: 5, comment: "Contratamos para evento corporativo. Superó nuestras expectativas. Lo recomiendo completamente.", date: "8 de febrero, 2026" },
      { id: 2, name: "Gabriela S.", rating: 4, comment: "Muy buena presentación, aunque hubo un pequeño retraso al inicio. De todos modos, valió la pena.", date: "22 de enero, 2026" },
      { id: 3, name: "Carlos M.", rating: 5, comment: "Increíble actuación para nuestra gala anual. Todos los asistentes quedaron impresionados.", date: "10 de enero, 2026" },
      { id: 4, name: "Patricia V.", rating: 3, comment: "La presentación fue aceptable pero esperábamos más variedad en el repertorio. Cumplió con lo acordado.", date: "5 de diciembre, 2025" },
    ];
    const target = reviews.find(r => r.id === replyTargetId);
    if (!target) return null;

    const isEdit = !!artistReplies[replyTargetId];
    const handleSubmit = () => {
      setArtistReplies(prev => ({ ...prev, [replyTargetId]: replyText }));
      setShowReplyModal(false);
      setReplyTargetId(null);
      setReplyText("");
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-foreground">
              {isEdit ? "Editar respuesta" : `Respondiendo a la reseña de ${target.name}`}
            </h2>
            <button onClick={() => { setShowReplyModal(false); setReplyText(""); }} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {/* Quoted original review */}
            <div className="pl-4 border-l-4 rounded-r-lg p-4" style={{ borderColor: "#C1603A", background: "#F5EDE3" }}>
              <div className="flex gap-1 mb-2">
                {[...Array(target.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-warning text-warning" />
                ))}
              </div>
              <p className="text-sm text-foreground italic">"{target.comment}"</p>
              <p className="text-xs text-muted-foreground mt-1">— {target.name}, {target.date}</p>
            </div>

            {/* Reply textarea */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Tu respuesta</label>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value.slice(0, 400))}
                placeholder="Escribe tu respuesta aquí..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <p className="text-xs text-muted-foreground text-right mt-1">{replyText.length}/400</p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Tu respuesta será pública. Responde con profesionalismo — otros organizadores también la verán.
            </p>
          </div>
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => { setShowReplyModal(false); setReplyText(""); }}
              className="flex-1 px-6 py-3 border border-border rounded-full hover:bg-secondary transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={replyText.trim().length === 0}
              className={`flex-1 px-6 py-3 rounded-full font-medium transition-colors ${
                replyText.trim().length > 0
                  ? "bg-primary text-primary-foreground hover:bg-accent"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Publicar respuesta
            </button>
          </div>
        </div>
      </div>
    );
  };

  // All Reviews Page
  const AllReviewsPage = () => {
    const artistName = selectedArtist?.name || "María Elena Solís";
    const artistPhoto = selectedArtist?.photo || sampleArtists[0].photo;

    const allReviews = [
      { id: 0, name: "Andrea M.", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", rating: 5, comment: "Excelente presentación en nuestra boda. Muy profesional y puntual. Los invitados quedaron encantados con cada momento de la actuación.", date: "15 de marzo, 2026" },
      { id: 1, name: "Roberto C.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", rating: 5, comment: "Contratamos para evento corporativo anual. Superó nuestras expectativas. Lo recomiendo completamente para cualquier tipo de evento formal.", date: "8 de febrero, 2026" },
      { id: 2, name: "Gabriela S.", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", rating: 4, comment: "Muy buena presentación, aunque hubo un pequeño retraso al inicio. De todos modos, valió la pena. El show en sí fue impecable.", date: "22 de enero, 2026" },
      { id: 3, name: "Carlos M.", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", rating: 5, comment: "Increíble actuación para nuestra gala anual. Todos los asistentes quedaron impresionados. Ya la contratamos para el próximo año.", date: "10 de enero, 2026" },
      { id: 4, name: "Patricia V.", photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&h=80&fit=crop", rating: 3, comment: "La presentación fue aceptable pero esperábamos más variedad en el repertorio. Cumplió con lo acordado pero sin sorpresas.", date: "5 de diciembre, 2025" },
    ];

    const stats: Record<number, number> = { 5: 68, 4: 20, 3: 8, 2: 3, 1: 1 };

    const sorted = [...allReviews].sort((a, b) => {
      if (reviewsFilter === "best") return b.rating - a.rating;
      if (reviewsFilter === "worst") return a.rating - b.rating;
      return b.id - a.id;
    });

    const openReply = (id: number) => {
      setReplyTargetId(id);
      setReplyText(artistReplies[id] || "");
      setShowReplyModal(true);
    };

    return (
      <div className="min-h-screen bg-background">
        {userRole === "guest" ? <PublicNavbar /> : <AuthNavbar />}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <BackButton />

          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
              <img src={artistPhoto} alt={artistName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Reseñas de {artistName}</h1>
              <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="font-medium text-foreground">4.7</span> promedio · 23 reseñas
              </p>
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="bg-card p-6 rounded-2xl border border-border mb-6 mt-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-10 shrink-0">{stars} ★</span>
                  <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stats[stars]}%`, background: "#C1603A" }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10 text-right shrink-0">{stats[stars]}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Ordenar:</span>
            {(["recent", "best", "worst"] as const).map(f => (
              <button
                key={f}
                onClick={() => setReviewsFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  reviewsFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {f === "recent" && "Más recientes"}
                {f === "best" && "Mejor calificación"}
                {f === "worst" && "Peor calificación"}
              </button>
            ))}
          </div>

          {/* Reviews list */}
          <div className="space-y-5">
            {sorted.map(review => (
              <div key={review.id} className="bg-card p-6 rounded-2xl border border-border">
                {/* Reviewer */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0">
                      <img src={review.photo} alt={review.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4" style={{ fill: s <= review.rating ? "#C1603A" : "transparent", color: s <= review.rating ? "#C1603A" : "#9B8B80" }} />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-foreground text-sm leading-relaxed mb-4">{review.comment}</p>

                {/* Artist reply (if exists) */}
                {artistReplies[review.id] && (
                  <div className="ml-4 pl-4 border-l-2 rounded-r-lg p-4 mb-3" style={{ borderColor: "#C1603A", background: "#F5EDE3" }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ArrowLeft className="w-3 h-3 rotate-180" style={{ color: "#C1603A" }} />
                      <span className="text-xs font-semibold" style={{ color: "#C1603A" }}>Respuesta del artista</span>
                    </div>
                    <p className="text-sm text-foreground">{artistReplies[review.id]}</p>
                  </div>
                )}

                {/* Reply button — only for logged-in artist */}
                {userRole === "artist" && (
                  <button
                    onClick={() => openReply(review.id)}
                    className="text-sm font-medium transition-colors hover:underline underline-offset-4"
                    style={{ color: "#C1603A" }}
                  >
                    {artistReplies[review.id] ? "Editar respuesta" : "Responder"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  const renderView = () => {
    if (currentView === "landing") return <LandingPage />;
    if (currentView === "catalog") return <CatalogPage />;
    if (currentView === "artist-profile") return <ArtistProfile />;
    if (currentView === "register") return <RegisterPage />;
    if (currentView === "login") return <LoginPage />;
    if (currentView === "forgot-password") return <ForgotPasswordPage />;
    if (currentView === "forgot-sent") return <ForgotSentPage />;
    if (currentView === "reset-password") return <ResetPasswordPage />;
    if (currentView === "chat") return <ChatPage />;
    if (currentView === "booking") return <BookingFlow />;
    if (currentView === "organizer-dashboard") return <OrganizerDashboard />;
    if (currentView === "artist-dashboard") return <ArtistDashboard />;
    if (currentView === "organizer-agenda") return <OrganizerAgendaPage />;
    if (currentView === "artist-agenda") return <ArtistAgendaPage />;
    if (currentView === "organizer-contracts") return <OrganizerContractsPage />;
    if (currentView === "artist-contracts") return <ArtistContractsPage />;
    if (currentView === "organizer-profile") return <OrganizerProfilePage />;
    if (currentView === "artist-profile-edit") return <ArtistProfileEditPage />;
    if (currentView === "all-reviews") return <AllReviewsPage />;
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-foreground">ArtistaYa!</h1>
          <p className="text-muted-foreground mt-4">Vista no encontrada: {currentView}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderView()}
      {showNotifications && <NotificationsPanel />}
      {showReviewModal && <ReviewModal />}
      {showReplyModal && <ReplyModal />}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}

function Upload({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );
}