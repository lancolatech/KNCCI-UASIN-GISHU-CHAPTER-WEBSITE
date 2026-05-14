import { Navigation } from "@/components/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Settings,
    CreditCard,
    Briefcase,
    MapPin,
    Phone,
    Mail,
    Calendar,
    LogOut,
    ExternalLink,
    ChevronRight,
    Shield,
    BadgeCheck,
    BaggageClaim,
    Activity,
    LayoutDashboard,
    Award,
    Home,
    Search,
    Bell,
    TrendingUp,
    Store,
    Users,
    FileText,
    Download,
    CreditCard as PaymentIcon,
    Camera,
    Upload,
    Edit,
    KeyRound,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    Plus,
    Package,
    ShoppingCart,
    DollarSign,
    Loader2,
    Trash2,
    AlertCircle,
    ShieldCheck,
    Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOHead } from "@/components/seo/seo-head";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/services/auth-context";
import { businessService, BusinessData } from "@/services/business-service";
import { cmsService, CmsStatus, CmsDashboard, CmsProduct, CmsCategory, CmsOrder } from "@/services/cms-service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { MembershipCertificate } from "@/components/membership-certificate";

export default function ProfilePage() {
    const [, setLocation] = useLocation();
    const {
        user,
        logout,
        loading: authLoading,
        updateUser,
        temporaryPassword,
        clearTemporaryPassword,
    } = useAuth();
    const [business, setBusiness] = useState<BusinessData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPersonalEditDialogOpen, setIsPersonalEditDialogOpen] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
    const [activeTab, setActiveTab] = useState("overview");

    const businessSchema = z.object({
        name: z.string().min(2, "Business name must be at least 2 characters"),
        category: z.string().min(2, "Category is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(10, "Phone number must be at least 10 characters"),
        location: z.string().min(2, "Location is required"),
        plan: z.enum(["Bronze", "Silver", "Gold"]),
        website: z.string().url("Invalid website URL").optional().or(z.literal("")),
        description: z.string().min(10, "Description must be at least 10 characters").optional().or(z.literal("")),
        kra_pin: z.string().optional().or(z.literal("")),
        company_reg_no: z.string().optional().or(z.literal("")),
        business_permit: z.string().optional().or(z.literal("")),
    });

    const personalSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        phone: z.string().min(10, "Phone number must be at least 10 characters").optional().or(z.literal("")),
    });

    const form = useForm<z.infer<typeof businessSchema>>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            name: "",
            category: "",
            email: "",
            phone: "",
            location: "",
            plan: "Bronze",
            website: "",
            description: "",
            kra_pin: "",
            company_reg_no: "",
            business_permit: "",
        },
    });

    const personalForm = useForm<z.infer<typeof personalSchema>>({
        resolver: zodResolver(personalSchema),
        defaultValues: {
            name: user?.name || "",
            phone: user?.phone || "",
        },
    });

    useEffect(() => {
        if (!authLoading && !user) {
            setLocation("/login");
            return;
        }

        const fetchBusiness = async () => {
            try {
                const response = await businessService.getMyBusiness();
                if (response.success && response.data) {
                    setBusiness(response.data);
                    form.reset({
                        name: response.data.name || "",
                        category: response.data.category || "",
                        email: response.data.email || "",
                        phone: response.data.phone || "",
                        location: response.data.location || "",
                        plan: response.data.plan || "Bronze",
                        website: response.data.website || "",
                        description: response.data.description || "",
                        kra_pin: response.data.kra_pin || "",
                        company_reg_no: response.data.company_reg_no || "",
                        business_permit: response.data.business_permit || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch business:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBusiness();
            personalForm.reset({
                name: user.name || "",
                phone: user.phone || "",
            });
            if (user.requirePasswordChange) {
                setIsPasswordOpen(true);
            }
        }
    }, [user, authLoading, setLocation, form, personalForm]);

    const onSubmit = async (data: z.infer<typeof businessSchema>) => {
        try {
            let response;
            if (business?._id) {
                response = await businessService.updateBusiness(data);
            } else {
                response = await businessService.createBusiness(data as BusinessData);
            }

            if (response.success) {
                setBusiness(response.data);
                toast({
                    title: "Success",
                    description: "Business profile updated successfully.",
                });
                setIsEditDialogOpen(false);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update business profile.",
                variant: "destructive",
            });
        }
    };

    const onPersonalSubmit = async (data: z.infer<typeof personalSchema>) => {
        try {
            const { authService } = await import('@/lib/auth-service');
            const response = await authService.updateProfile(data);

            if (response.success) {
                updateUser(response.data);
                toast({
                    title: "Success",
                    description: "Personal profile updated successfully.",
                });
                setIsPersonalEditDialogOpen(false);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update personal profile.",
                variant: "destructive",
            });
        }
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file.",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Image size should be less than 2MB.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsUploadingLogo(true);
            const response = await businessService.uploadLogo(file);
            if (response.success) {
                setBusiness(response.data);
                toast({
                    title: "Success",
                    description: "Organization logo updated successfully.",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to upload logo.",
                variant: "destructive",
            });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "New password and confirmation must match exactly.",
                variant: "destructive",
            });
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            toast({
                title: "Password too short",
                description: "New password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsSubmittingPassword(true);
            const { authService } = await import('@/lib/auth-service');
            const currentPassword = user?.requirePasswordChange
                ? temporaryPassword
                : passwordForm.currentPassword;

            if (!currentPassword) {
                toast({
                    title: "Temporary password missing",
                    description: "Please log out and sign in again with your temporary password before updating it.",
                    variant: "destructive",
                });
                return;
            }

            const response = await authService.changePassword({
                currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Password updated successfully.",
                });
                setIsPasswordOpen(false);
                if (user) {
                    updateUser({ ...user, requirePasswordChange: false });
                }
                clearTemporaryPassword();
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (error: any) {
            let errorMessage = "Failed to update password.";
            if (error.response?.data?.details && Array.isArray(error.response.data.details) && error.response.data.details.length > 0) {
                errorMessage = error.response.data.details[0].message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const openMarketplace = async () => {
        const marketplaceUrl = import.meta.env.VITE_MARKETPLACE_URL || 'http://localhost:3000';
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.open(marketplaceUrl, '_blank');
            return;
        }
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
            const res = await fetch(`${apiUrl}/auth/marketplace-token`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                const code = json?.data?.code ?? json?.code;
                if (code) {
                    window.open(`${marketplaceUrl}/auth/exchange?code=${code}`, '_blank');
                    return;
                }
            }
        } catch {
            // fallback — open without SSO
        }
        window.open(marketplaceUrl, '_blank');
    };

    if (authLoading || (loading && !business && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (!user) return null;

    const sideNavItems = [
        { key: "overview", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
        { key: "business", label: "Business Profile", icon: <Briefcase className="w-4 h-4" /> },
        { key: "finances", label: "Finances", icon: <PaymentIcon className="w-4 h-4" /> },
        { key: "marketplace", label: "Marketplace", icon: <Store className="w-4 h-4" /> },
        { key: "events", label: "Events & Trade", icon: <Activity className="w-4 h-4" /> },
    ];

    // Shorter labels for the compact mobile bottom bar
    const bottomNavItems = [
        { key: "overview",     label: "Home",      icon: <LayoutDashboard className="w-5 h-5" /> },
        { key: "business",     label: "Business",  icon: <Briefcase className="w-5 h-5" /> },
        ...(DIRECTORY_MODE ? [] : [{ key: "finances", label: "Finances", icon: <PaymentIcon className="w-5 h-5" /> }]),
        { key: "marketplace",  label: DIRECTORY_MODE ? "Directory" : "Market", icon: <Store className="w-5 h-5" /> },
        { key: "events",       label: "Events",    icon: <Activity className="w-5 h-5" /> },
    ];

    const stats = [
        { title: "Membership Status", value: business?.plan || "Full", icon: <Shield className="w-5 h-5" />, color: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10" },
        { title: "Registered Events", value: "2", icon: <Calendar className="w-5 h-5" />, color: "from-primary to-primary/70", bg: "bg-primary/10" },
        { title: "Trade Leads", value: "12", icon: <TrendingUp className="w-5 h-5" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10" },
        { title: "Total Points", value: "450", icon: <Award className="w-5 h-5" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
            <SEOHead
                title="Member Dashboard | KNCCI Uasin Gishu"
                description="Manage your business, explore trade leads, and connect with the chamber through your personal dashboard."
            />

            {/* ──── Sidebar ──────────────────────────────────────────────── */}
            <aside className="hidden lg:flex lg:flex-col w-72 bg-white dark:bg-slate-900 border-r border-border/40 p-6 justify-between fixed h-full z-20 overflow-y-auto">
                <div className="space-y-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-primary/20">
                            K
                        </div>
                        <div>
                            <h2 className="font-extrabold text-sm tracking-tight text-foreground">Member Portal</h2>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">KNCCI Uasin Gishu</p>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="space-y-1">
                        {sideNavItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setActiveTab(item.key)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === item.key
                                    ? "bg-primary/10 text-primary shadow-sm"
                                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Navigation Help */}
                    <div className="pt-4 space-y-4">
                        <p className="px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resources</p>
                        <div className="space-y-1">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setLocation('/')}
                            >
                                <Home className="w-4 h-4 mr-3" /> Visit Website
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setShowCertificate(true)}
                            >
                                <Award className="w-4 h-4 mr-3" /> Certificate
                            </Button>
                        </div>
                    </div>
                </div>

                {/* User & Logout */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/20 text-foreground">
                        <Avatar className="w-9 h-9 border border-border/40">
                            {business?.logoUrl ? (
                                <AvatarImage src={business.logoUrl} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate italic">{business?.plan || "Member"}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
                        onClick={logout}
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Log Out
                    </Button>
                </div>
            </aside>

            {/* ──── Main Content ─────────────────────────────────────────── */}
            <main className="flex-1 lg:ml-72 min-h-screen text-foreground">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-border/40 bg-white dark:bg-slate-900 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-extrabold text-xs">K</div>
                        <h2 className="font-extrabold text-sm uppercase">
                            {sideNavItems.find(i => i.key === activeTab)?.label ?? "Dashboard"}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setShowCertificate(true)}>
                            <Award className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={logout}>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                <div className="p-6 pb-28 lg:p-10 w-full max-w-[1600px] flex flex-col gap-8">
                    {/* ═══ Compact Profile Header ═══ */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-border/40 p-4 lg:px-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12 border-2 border-primary/20 shadow-sm rounded-xl overflow-hidden bg-white">
                                {business?.logoUrl ? (
                                    <AvatarImage src={business.logoUrl} className="object-cover" />
                                ) : null}
                                <AvatarFallback className="bg-primary text-white text-lg font-extrabold uppercase">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <h2 className="text-base font-extrabold tracking-tight truncate">{user.name}</h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{business?.category || "KNCCI Member"}</p>
                            </div>
                        </div>

                        <div className="hidden xl:flex items-center gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Email</p>
                                    <p className="text-xs font-bold truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Contact</p>
                                    <p className="text-xs font-bold">{user.phone || "Not set"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Active Plan</p>
                                <Badge className="bg-primary/10 text-primary border-none font-bold rounded-lg px-2 py-0.5 text-[10px]">
                                    {business?.plan || "Bronze"}
                                </Badge>
                            </div>
                            <Button
                                variant="outline"
                                className="rounded-xl h-10 px-5 font-bold shadow-sm bg-primary/5 text-primary border-primary/20 hover:bg-primary hover:text-white transition-all text-[11px] uppercase tracking-wider"
                                onClick={() => setShowCertificate(true)}
                            >
                                <Award className="w-3.5 h-3.5 mr-2" /> Certificate
                            </Button>
                        </div>
                    </motion.div>

                    {/* Header Section with glassmorphism welcome banner */}
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/5 border border-primary/10 p-8 lg:p-12">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full -ml-32 -mb-32 blur-[60px]" />

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="max-w-2xl"
                            >
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 font-mono">
                                    Welcome back, {user.name.split(' ')[0]}
                                </p>
                                <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-4">
                                    {sideNavItems.find(n => n.key === activeTab)?.label || "Dashboard"}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-primary/10">
                                        <BadgeCheck className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-extrabold text-foreground uppercase tracking-widest">Verified Member</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest border-l border-border/40 pl-4 h-4 flex items-center">
                                        Member Since Jan 2023
                                    </span>
                                </div>
                            </motion.div>

                            <div className="flex flex-wrap gap-3">
                                {user.role === 'admin' && (
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl border-primary/20 bg-white/50 backdrop-blur-sm hover:bg-white dark:bg-slate-900/50 dark:hover:bg-slate-900 font-bold h-12 px-6 shadow-sm"
                                        onClick={() => setLocation('/admin')}
                                    >
                                        <LayoutDashboard className="w-4 h-4 mr-2" /> Admin Panel
                                    </Button>
                                )}
                                <Button className="rounded-2xl shadow-xl shadow-primary/20 font-bold h-12 px-8" onClick={() => setIsPersonalEditDialogOpen(true)}>
                                    <Settings className="w-4 h-4 mr-2" /> Profile Settings
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA: Tabs (Full Width) */}
                    <div className="w-full space-y-8">
                        {/* ═══ Full Width Content Tabs ═══ */}
                        <div className="w-full space-y-8">
                            <AnimatePresence mode="wait">
                                {activeTab === "overview" && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="space-y-8"
                                    >
                                        {/* Quick Stats Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {stats.map((stat, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                >
                                                    <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all border-border/30 overflow-hidden relative group">
                                                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150 blur-2xl`} />
                                                        <CardContent className="p-6 relative">
                                                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                                {stat.icon}
                                                            </div>
                                                            <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">{stat.title}</p>
                                                        </CardContent>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Notifications / Activity */}
                                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 dark:bg-slate-900 overflow-hidden">
                                            <CardHeader className="p-8 pb-4">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <CardTitle className="text-xl font-extrabold text-foreground">Recent Activities</CardTitle>
                                                        <CardDescription className="text-sm font-medium">Insights and updates for your business journey</CardDescription>
                                                    </div>
                                                    <Button variant="ghost" className="text-primary font-extrabold text-[10px] uppercase tracking-widest">Mark read</Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="divide-y divide-border/20">
                                                    {[
                                                        { title: "Renewal Success", desc: "Your membership for 2026/27 has been officially confirmed.", time: "2h ago", icon: Award, color: "text-amber-500", bg: "bg-amber-500/10" },
                                                        { title: "Marketplace Match", desc: "A new lead in 'Construction Materials' matches your profile.", time: "1d ago", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                                        { title: "Directory Profile", desc: "Your business is now visible in the verified member directory.", time: "3d ago", icon: User, color: "text-blue-500", bg: "bg-blue-500/10" },
                                                    ].map((item, i) => (
                                                        <div key={i} className="p-6 flex gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.bg} ${item.color} shadow-sm group-hover:rotate-6 transition-transform`}>
                                                                <item.icon className="w-7 h-7" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h4 className="font-extrabold truncate pr-4 text-xs uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                                                                    <span className="text-[10px] font-extrabold text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5 whitespace-nowrap">{item.time}</span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-6 bg-slate-50/50 dark:bg-slate-800/20 text-center border-t border-border/10">
                                                    <Button variant="ghost" className="font-extrabold text-primary text-[10px] uppercase tracking-[0.2em] hover:bg-transparent">All Updates <ChevronRight className="w-4 h-4 ml-1" /></Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {activeTab === "business" && (
                                    <motion.div
                                        key="business"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 p-8 lg:p-12 bg-white dark:bg-slate-900 border border-border/40 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                                    <div className="relative group">
                                                        <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden bg-white">
                                                            {business?.logoUrl ? (
                                                                <AvatarImage src={business.logoUrl} className="object-cover" />
                                                            ) : null}
                                                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-extrabold uppercase">
                                                                {business?.name?.slice(0, 2) || user.name.slice(0, 2)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                                                            <div className="flex flex-col items-center">
                                                                <Camera className="w-6 h-6 mb-1" />
                                                                <span className="text-[10px] font-bold uppercase">Change</span>
                                                            </div>
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} />
                                                        </label>
                                                        {isUploadingLogo && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 rounded-2xl">
                                                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="relative z-10 text-center md:text-left">
                                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                                            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{business?.name || "Member Organization"}</h2>
                                                            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary font-bold uppercase text-[10px] tracking-widest px-3 h-6">{business?.plan || "Bronze"}</Badge>
                                                        </div>
                                                        <p className="text-muted-foreground font-bold flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest text-xs">
                                                            <Briefcase className="w-4 h-4 text-primary" /> {business?.category || "Industrial Sector"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button className="rounded-2xl h-12 px-8 font-bold shadow-xl shadow-primary/20 group hover:scale-105 transition-transform" onClick={() => setIsEditDialogOpen(true)}>
                                                    Modify Details
                                                </Button>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-12 mb-12 relative z-10">
                                                <div className="space-y-6">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Organizational Background</p>
                                                    <p className="text-muted-foreground leading-[1.8] font-medium">
                                                        {business?.description || "No primary organization description provided. A complete profile helps you connect with trade partners and enhances your visibility in the regional business landscape. Please click 'Modify Details' to update your background info."}
                                                    </p>
                                                </div>
                                                <div className="space-y-8">
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Web & Social</p>
                                                        {business?.website ? (
                                                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-foreground font-extrabold flex items-center gap-2 hover:text-primary transition-all text-sm group">
                                                                {business.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-4 h-4 opacity-30 group-hover:opacity-100" />
                                                            </a>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic font-medium">Corporate website not linked</p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Official Contacts</p>
                                                        <div className="space-y-1">
                                                            <p className="font-extrabold text-sm">{business?.email || "General info missing"}</p>
                                                            <p className="font-extrabold text-sm">{business?.phone || "Phone contact missing"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-12 border-t border-border/40 relative z-10">
                                                <h3 className="font-extrabold text-[10px] uppercase tracking-[0.3em] mb-8 flex items-center gap-3 text-muted-foreground">
                                                    <Shield className="w-4 h-4 text-primary" /> Registration Compliance
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-primary/5 group cursor-default">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 group-hover:text-primary transition-colors">KRA PIN Status</p>
                                                        <p className="font-extrabold font-mono text-foreground text-sm tracking-wider uppercase">{business?.kra_pin || "---"}</p>
                                                    </div>
                                                    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-primary/5 group cursor-default">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 group-hover:text-primary transition-colors">Company Registry</p>
                                                        <p className="font-extrabold font-mono text-foreground text-sm tracking-wider uppercase">{business?.company_reg_no || "---"}</p>
                                                    </div>
                                                    <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-primary/5 group cursor-default">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 group-hover:text-primary transition-colors">Operating Permit</p>
                                                        <p className="font-extrabold font-mono text-foreground text-sm tracking-wider uppercase">{business?.business_permit || "---"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}

                                {activeTab === "finances" && (
                                    <motion.div
                                        key="finances"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 p-12 bg-white dark:bg-slate-900 border border-border/40 min-h-[500px] flex flex-col items-center justify-center text-center">
                                            <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-inner">
                                                <PaymentIcon className="w-10 h-10 text-muted-foreground/30" />
                                            </div>
                                            <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Finances & Billing</h3>
                                            <p className="text-muted-foreground max-w-sm font-medium leading-[1.8]">
                                                Track your investment in the chamber. View past receipts, upcoming renewals, and download tax-ready invoices. This feature is currently in final verification.
                                            </p>
                                            <div className="mt-10 flex gap-4">
                                                <Button variant="ghost" className="font-bold opacity-50 cursor-not-allowed">H1 Stat</Button>
                                                <div className="w-px h-10 bg-border/40" />
                                                <Button variant="ghost" className="font-bold opacity-50 cursor-not-allowed">H2 Stat</Button>
                                            </div>
                                            <Button variant="outline" className="mt-12 rounded-2xl h-12 px-10 font-extrabold uppercase tracking-widest text-[10px]" disabled>
                                                System locked
                                            </Button>
                                        </Card>
                                    </motion.div>
                                )}

                                {activeTab === "marketplace" && (
                                    <motion.div
                                        key="marketplace"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="space-y-6"
                                    >
                                        <MarketplaceTab business={business} user={user} onBusinessTabSwitch={() => setActiveTab("business")} />
                                    </motion.div>
                                )}

                                {activeTab === "events" && (
                                    <motion.div
                                        key="events"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-6"
                                    >
                                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 p-10 lg:p-12 bg-white dark:bg-slate-900 border border-border/40">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                                                <div className="relative z-10">
                                                    <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight">County Business Events</h3>
                                                    <p className="text-sm text-muted-foreground mt-2 font-bold uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Event Portal
                                                    </p>
                                                </div>
                                                <Link href="/events">
                                                    <Button className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/20 bg-primary hover:scale-105 transition-transform uppercase tracking-widest text-[10px]">
                                                        Full Calendar View
                                                    </Button>
                                                </Link>
                                            </div>

                                            <div className="space-y-6">
                                                {[
                                                    { title: "Eldoret Business Expo 2026", date: "Oct 15, 2026", type: "Conference", status: "Open for Gold", speakers: 12 },
                                                    { title: "SME Digital Growth Forum", date: "Nov 02, 2026", type: "Workshop", status: "Limited Slots", speakers: 4 },
                                                ].map((event, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-border/30 hover:shadow-xl hover:shadow-primary/5 group"
                                                    >
                                                        <div className="flex items-center gap-6 mb-4 sm:mb-0">
                                                            <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 flex flex-col items-center justify-center border border-border/20 shadow-sm group-hover:border-primary/40 transition-colors">
                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-tighter">{event.date.split(' ')[0]}</span>
                                                                <span className="text-2xl font-extrabold text-primary leading-none -mt-1">{event.date.split(' ')[1].slice(0, 2)}</span>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-extrabold text-base uppercase tracking-tight group-hover:text-primary transition-colors">{event.title}</h4>
                                                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                                                    <Badge variant="outline" className="text-[9px] h-5 font-bold border-primary/20 bg-primary/5 text-primary tracking-widest uppercase">{event.type}</Badge>
                                                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{event.status}</span>
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                                        <Users className="w-3 h-3" /> {event.speakers} Key Speakers
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" className="rounded-xl font-bold text-xs uppercase tracking-widest text-primary hover:bg-primary/5 px-6">Event Details</Button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            {/* ──── Mobile Bottom Navigation ─────────────────────────────── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-border/40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex items-stretch">
                {bottomNavItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors duration-150 ${
                            activeTab === item.key ? "text-primary" : "text-muted-foreground"
                        }`}
                    >
                        <span className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${
                            activeTab === item.key ? "bg-primary/10 scale-105" : ""
                        }`}>
                            {item.icon}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wide w-full text-center px-0.5 truncate leading-none">
                            {item.label}
                        </span>
                    </button>
                ))}
            </nav>

            {/* Membership Certificate Modal */}
            {showCertificate && (
                <MembershipCertificate
                    memberName={user.name}
                    regNo={user.reg_no || "KNCCI/UG/0000"}
                    businessName={business?.name || "Member Organization"}
                    businessCategory={business?.category || "Sector Information"}
                    plan={business?.plan || "Bronze"}
                    certificateUrl={business?.certificateUrl}
                    logoUrl={business?.logoUrl}
                    onClose={() => setShowCertificate(false)}
                />
            )}

            {/* Edit Business Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">Edit Business Profile</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Update your organization's details to enhance your profile visibility in the directory.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 px-1">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Organization Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Business Name" {...field} className="rounded-xl h-11 border-border/40 focus:border-primary/40 focus:ring-primary/20" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Industrial Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="rounded-xl h-11 border-border/40">
                                                        <SelectValue placeholder="Select sector" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="Agriculture">Agriculture & Food</SelectItem>
                                                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                                    <SelectItem value="Trade">Retail & Wholesale</SelectItem>
                                                    <SelectItem value="Services">Professional Services</SelectItem>
                                                    <SelectItem value="Construction">Construction</SelectItem>
                                                    <SelectItem value="Technology">Technology & Innovation</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Official Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="office@company.com" {...field} className="rounded-xl h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Support Contact</FormLabel>
                                            <FormControl>
                                                <Input placeholder="+254..." {...field} className="rounded-xl h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Physical Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Town, County" {...field} className="rounded-xl h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Corporate Website (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} className="rounded-xl h-11" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="kra_pin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">KRA PIN</FormLabel>
                                            <FormControl>
                                                <Input placeholder="P0..." {...field} className="rounded-xl h-11 font-mono text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="company_reg_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Reg Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PV..." {...field} className="rounded-xl h-11 font-mono text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="business_permit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Business Permit</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Permit ID" {...field} className="rounded-xl h-11 font-mono text-sm" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Mission & Overview</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about your organization..."
                                                className="min-h-[120px] rounded-[1.5rem] border-border/40 p-4 leading-relaxed"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" className="rounded-xl px-10 font-extrabold shadow-xl shadow-primary/20 bg-primary">Save Profile Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Personal Profile Dialog */}
            <Dialog open={isPersonalEditDialogOpen} onOpenChange={setIsPersonalEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">Personal Settings</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">
                            Update your personal information used for communications.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...personalForm}>
                        <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-6 pt-4">
                            <FormField
                                control={personalForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Name" {...field} className="rounded-xl h-11 border-border/40 focus:border-primary/40 focus:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={personalForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+254..." {...field} className="rounded-xl h-11 border-border/40 focus:border-primary/40 focus:ring-primary/20" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="pt-2 border-t border-border/20 flex items-center justify-between">
                                <div>
                                    <h4 className="font-extrabold text-sm text-foreground">Account Security</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Update your password</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl font-bold border-primary/20 text-primary hover:bg-primary/5 gap-2"
                                    onClick={() => {
                                        setIsPersonalEditDialogOpen(false);
                                        setIsPasswordOpen(true);
                                    }}
                                >
                                    <KeyRound className="w-3.5 h-3.5" />
                                    Change Password
                                </Button>
                            </div>

                            <DialogFooter className="pt-4 border-t border-border/20">
                                <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsPersonalEditDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" className="rounded-xl px-10 font-extrabold shadow-xl shadow-primary/20 bg-primary">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog
                open={isPasswordOpen}
                onOpenChange={(val) => {
                    // Prevent closing if required
                    if (user?.requirePasswordChange && !val) return;
                    setIsPasswordOpen(val);
                }}
            >
                <DialogContent className="sm:max-w-[400px] rounded-[2rem] outline-none">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold tracking-tight">
                            {user?.requirePasswordChange ? "Action Required" : "Change Password"}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground text-xs leading-relaxed">
                            {user?.requirePasswordChange
                                ? "For security reasons, you must update your temporary password before accessing the member portal."
                                : "Keep your account secure by updating your password regularly."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4">
                        {!user?.requirePasswordChange && (
                            <div className="space-y-1.5">
                                <label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                                <div className="relative">
                                    <Input
                                        type={showPasswords.current ? "text" : "password"}
                                        required
                                        value={passwordForm.currentPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-border/50 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showPasswords.new ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-border/50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                            <div className="relative">
                                <Input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    required
                                    minLength={8}
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-slate-900 border-border/50 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <DialogFooter className="pt-6">
                            {!user?.requirePasswordChange && (
                                <Button type="button" variant="ghost" className="rounded-xl font-bold h-12" onClick={() => setIsPasswordOpen(false)}>
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isSubmittingPassword || !passwordForm.newPassword || passwordForm.newPassword.length < 8}
                                className="rounded-xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20 bg-primary flex-1"
                            >
                                {isSubmittingPassword ? "Updating..." : "Update Password"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// ═══ MARKETPLACE TAB COMPONENT ════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════

interface MarketplaceTabProps {
    business: BusinessData | null;
    user: { name: string; email: string; phone?: string;[key: string]: any };
    onBusinessTabSwitch: () => void;
}

function MarketplaceTab({ business, user, onBusinessTabSwitch }: MarketplaceTabProps) {
    const [cmsStatus, setCmsStatus] = useState<CmsStatus | null>(null);
    const [dashboard, setDashboard] = useState<CmsDashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [loginPassword, setLoginPassword] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const [connecting, setConnecting] = useState(false);
    const [cmsPassword, setCmsPassword] = useState("");
    const [cmsConfirmPassword, setCmsConfirmPassword] = useState("");
    const [showCmsPassword, setShowCmsPassword] = useState(false);
    const [addingProduct, setAddingProduct] = useState(false);
    const [isUploadingProductImage, setIsUploadingProductImage] = useState(false);
    const [isUploadingSelectedProductImage, setIsUploadingSelectedProductImage] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "", category: "", stock: "", unit: "", image: "" });
    const [selectedProduct, setSelectedProduct] = useState<CmsProduct | null>(null);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [categories, setCategories] = useState<CmsCategory[]>([]);
    const [showCategoryMgmt, setShowCategoryMgmt] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", categoryType: 'product' as 'product' | 'service', description: "" });
    const [creatingCategory, setCreatingCategory] = useState(false);

    // Sub-tab navigation
    const [subTab, setSubTab] = useState<'overview' | 'products' | 'categories' | 'orders'>('overview');
    
    // Orders state
    const [orders, setOrders] = useState<CmsOrder[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    
    useEffect(() => {
        loadCmsData();
    }, [business]);

    useEffect(() => {
        if (cmsStatus?.connected && !isSessionExpired) {
            loadCategories();
        }
    }, [cmsStatus?.connected, isSessionExpired]);


    const loadCmsData = async () => {
        if (!business) { setLoading(false); return; }
        try {
            setIsSessionExpired(false);
            const statusRes = await cmsService.getStatus();
            setCmsStatus(statusRes.data);

            if (statusRes.data.connected) {
                try {
                    const dashRes = await cmsService.getDashboard();
                    setDashboard(dashRes.data);
                } catch (err: any) {
                    if (err.response?.status === 400 && err.response?.data?.error?.includes("Session expired")) {
                        setIsSessionExpired(true);
                    } else {
                        console.error("Dashboard load failed:", err);
                    }
                }
            }
        } catch (err: any) {
            console.error("CMS status check failed:", err);
            // Don't set connected: false if it's a network error or session error
            if (err.response?.data?.error?.includes("Session expired")) {
                setIsSessionExpired(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMarketplaceLogin = async () => {
        if (!loginPassword) return;
        try {
            setIsLoggingIn(true);
            await cmsService.login(loginPassword);
            toast({ title: "Welcome Back", description: "Successfully logged in to marketplace." });
            setLoginPassword("");
            setIsSessionExpired(false);
            await loadCmsData();
        } catch (error: any) {
            toast({
                title: "Login Failed",
                description: error.response?.data?.message || "Invalid marketplace password.",
                variant: "destructive"
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleConnect = async () => {
        if (cmsPassword.length < 8) {
            toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
            return;
        }
        if (cmsPassword !== cmsConfirmPassword) {
            toast({ title: "Passwords don't match", description: "Please make sure both passwords match.", variant: "destructive" });
            return;
        }
        try {
            setConnecting(true);
            const res = await cmsService.connect({ password: cmsPassword, confirmPassword: cmsConfirmPassword });
            toast({ title: "🎉 Marketplace Activated!", description: res.data.message });
            setCmsPassword(""); setCmsConfirmPassword("");
            await loadCmsData();
        } catch (error: any) {
            toast({ title: "Activation Failed", description: error.response?.data?.message || "Could not activate marketplace account.", variant: "destructive" });
        } finally {
            setConnecting(false);
        }
    };

    const openMarketplace = async () => {
        const marketplaceUrl = import.meta.env.VITE_MARKETPLACE_URL || 'http://localhost:3000';
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.open(marketplaceUrl, '_blank');
            return;
        }
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
            const res = await fetch(`${apiUrl}/auth/marketplace-token`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const json = await res.json();
                const code = json?.data?.code ?? json?.code;
                if (code) {
                    window.open(`${marketplaceUrl}/auth/exchange?code=${code}`, '_blank');
                    return;
                }
            }
        } catch {
            // fallback — open without SSO
        }
        window.open(marketplaceUrl, '_blank');
    };

    const loadCategories = async () => {
        try {
            const res = await cmsService.getCategories();
            if (res.success) setCategories(res.data.data);
        } catch (err: any) {
            console.error("Failed to load categories:", err);
            if (err.response?.status === 400 && err.response?.data?.error?.includes("Session expired")) {
                setIsSessionExpired(true);
            }
        }
    };

    const uploadMarketplaceImage = async (
        file: File,
        onUploaded: (url: string) => void,
        setUploading: (value: boolean) => void,
    ) => {
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file.",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Image size should be less than 5MB.",
                variant: "destructive",
            });
            return;
        }

        try {
            setUploading(true);
            const response = await cmsService.uploadImage(file);
            const imageUrl = response.data?.url;

            if (!imageUrl) {
                throw new Error("No image URL was returned.");
            }

            onUploaded(imageUrl);
            toast({
                title: "Image uploaded",
                description: "Your product image is ready to use.",
            });
        } catch (error: any) {
            toast({
                title: "Upload failed",
                description: error.response?.data?.message || error.message || "Failed to upload image.",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleNewProductImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        void uploadMarketplaceImage(
            file,
            (url) => setNewProduct((prev) => ({ ...prev, image: url })),
            setIsUploadingProductImage,
        );
    };

    const handleSelectedProductImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !selectedProduct) return;

        void uploadMarketplaceImage(
            file,
            (url) =>
                setSelectedProduct((prev) =>
                    prev
                        ? {
                            ...prev,
                            image: url,
                            images: [url],
                        }
                        : prev,
                ),
            setIsUploadingSelectedProductImage,
        );
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category) {
            toast({ title: "Incomplete", description: "Please fill in all required fields.", variant: "destructive" });
            return;
        }
        try {
            setAddingProduct(true);
            await cmsService.createProduct({
                name: newProduct.name,
                description: newProduct.description,
                price: parseFloat(newProduct.price),
                category: newProduct.category,
                image: newProduct.image || undefined,
                stock: newProduct.stock ? parseInt(newProduct.stock) : undefined,
                unit: newProduct.unit || undefined,
            });
            toast({ title: "Product Added", description: `"${newProduct.name}" is now listed on the marketplace.` });
            setNewProduct({ name: "", description: "", price: "", category: "", stock: "", unit: "", image: "" });
            setShowAddForm(false);
            await loadCmsData();
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to create product.", variant: "destructive" });
        } finally {
            setAddingProduct(false);
        }
    };

    const handleUpdateProduct = async (data: any) => {
        if (!selectedProduct) return;
        try {
            setAddingProduct(true);
            await cmsService.updateProduct(selectedProduct._id, data);
            toast({ title: "Product Updated", description: "Changes saved successfully." });
            setIsEditingProduct(false);
            setSelectedProduct(null);
            await loadCmsData();
        } catch (error: any) {
            toast({ title: "Error", description: error.response?.data?.message || "Failed to update product.", variant: "destructive" });
        } finally {
            setAddingProduct(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategory.name) return;
        try {
            setCreatingCategory(true);
            await cmsService.createCategory(newCategory);
            toast({ title: "Category Created", description: `"${newCategory.name}" is now available.` });
            setNewCategory({ name: "", categoryType: 'product', description: "" });
            await loadCategories();
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to create category." });
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!confirm(`Delete category "${name}"?`)) return;
        try {
            await cmsService.deleteCategory(id);
            toast({ title: "Category Deleted" });
            await loadCategories();
        } catch (err) {
            toast({ title: "Error", description: "Failed to delete category." });
        }
    };

    const handleDeleteProduct = async (productId: string, productName: string) => {
        if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
        try {
            await cmsService.deleteProduct(productId);
            toast({ title: "Deleted", description: `"${productName}" has been removed.` });
            await loadCmsData();
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        }
    };

    const loadOrders = async () => {
        try {
            setLoadingOrders(true);
            const res = await cmsService.getOrders();
            if (res.success) {
                // Handle different response shapes from CMS
                const responseData = res.data as any;
                let fetchedOrders = [];
                if (Array.isArray(responseData)) fetchedOrders = responseData;
                else if (Array.isArray(responseData?.data)) fetchedOrders = responseData.data;
                else if (Array.isArray(responseData?.orders)) fetchedOrders = responseData.orders;
                setOrders(fetchedOrders);
            } else {
                setOrders([]);
            }
        } catch (err: any) {
            console.error("Failed to load orders:", err);
            if (err.response?.status === 400 && err.response?.data?.error?.includes("Session expired")) {
                setIsSessionExpired(true);
            }
        } finally {
            setLoadingOrders(false);
        }
    };

    useEffect(() => {
        if (subTab === 'orders' && cmsStatus?.connected && !isSessionExpired) {
            loadOrders();
        }
        if (subTab === 'categories' && categories.length === 0 && cmsStatus?.connected && !isSessionExpired) {
            loadCategories();
        }
    }, [subTab, cmsStatus?.connected, isSessionExpired]);

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await cmsService.updateOrderStatus(orderId, status);
            toast({ title: "Updated", description: "Order status has been updated." });
            await loadOrders();
            await loadCmsData(); // Update dashboard stats
        } catch (err: any) {
            toast({ title: "Error", description: "Failed to update order status.", variant: "destructive" });
        }
    };

    const handleSeedOrders = async () => {
        try {
            const product = dashboard?.products?.data?.[0];
            const productId = product?._id || "640a1b2c3d4e5f6a7b8c9d0e"; // Dummy or real ID
            const productName = product?.name || "Marketplace Product";

            const testOrder = {
                guestInfo: {
                    name: "Jane Doe Test",
                    email: "jane.doe@example.com",
                    phone: "+254 711 222333"
                },
                items: [
                   { 
                     productId: productId,
                     name: productName, 
                     quantity: 2, 
                     basePrice: 500,
                     totalPrice: 1000
                   }
                ],
                paymentInfo: {
                    method: 'mpesa',
                    paymentReference: 'SEED-' + Math.random().toString(36).substring(7).toUpperCase(),
                    paidAmount: 1000,
                    paidAt: new Date().toISOString()
                },
                shipping: {
                    type: 'pickup',
                    price: 0
                },
                totalAmount: 1000,
                status: "Pending"
            };
            await cmsService.createTestOrder(testOrder);
            toast({ title: "Success", description: "Test order seeded successfully." });
            await loadOrders();
            await loadCmsData(); // Update dash
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.message || "Failed to seed order.", variant: "destructive" });
        }
    };

    // ─── Loading ──────────────────────────────────────────────────
    if (loading) {
        return (
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 p-12 bg-white dark:bg-slate-900 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading marketplace...</p>
                </div>
            </Card>
        );
    }

    // ─── No business profile ─────────────────────────────────────
    if (!business) {
        return (
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 p-12 bg-white dark:bg-slate-900 min-h-[500px] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-8">
                    <Store className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Business Profile Required</h3>
                <p className="text-muted-foreground max-w-md font-medium leading-relaxed mb-8">
                    To sell on the KNCCI Marketplace, you first need to set up your business profile. This ensures all marketplace sellers are verified KNCCI members.
                </p>
                <Button className="rounded-2xl h-12 px-8 font-extrabold shadow-xl shadow-primary/20" onClick={onBusinessTabSwitch}>
                    <Briefcase className="w-4 h-4 mr-2" /> Set Up Business Profile
                </Button>
            </Card>
        );
    }

    // ─── Readiness check items ───────────────────────────────────
    const checks = [
        { label: "Business Name", value: business.name, ok: !!business.name },
        { label: "Email Address", value: business.email, ok: !!business.email },
        { label: "Phone Number", value: business.phone, ok: !!business.phone },
        { label: "Category", value: business.category, ok: !!business.category },
        { label: "Location", value: business.location || "Not set", ok: !!business.location, optional: true },
        { label: "Description", value: business.description ? "Provided" : "Not set", ok: !!business.description, optional: true },
    ];
    const requiredComplete = checks.filter(c => !c.optional).every(c => c.ok);

    // ─── Not connected: Activation flow ──────────────────────────
    if (!cmsStatus?.connected) {
        return (
            <div className="space-y-8">
                {/* Hero */}
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 p-10 lg:p-12 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 overflow-hidden relative">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                                <Store className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Activate Your Marketplace Store</h3>
                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1">Sell to the KNCCI Trade Network</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground max-w-2xl leading-relaxed font-medium">
                            As a verified KNCCI member, you can list your products and services on the marketplace.
                            Your business details will be used to set up your seller storefront. Complete the checklist below and choose a marketplace password to get started.
                        </p>
                    </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Readiness Checklist */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-primary/5 p-8 bg-white dark:bg-slate-900">
                        <h4 className="font-extrabold text-sm uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Pre-flight Checklist
                        </h4>
                        <div className="space-y-4">
                            {checks.map((check, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        {check.ok ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        ) : (
                                            <XCircle className={`w-5 h-5 shrink-0 ${check.optional ? 'text-amber-400' : 'text-red-400'}`} />
                                        )}
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                                {check.label} {check.optional && <span className="text-[9px] opacity-50">(optional)</span>}
                                            </p>
                                            <p className="text-sm font-extrabold truncate max-w-[200px]">{check.value}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!requiredComplete && (
                            <Button variant="outline" className="w-full mt-6 rounded-xl h-11 font-bold border-primary/20 text-primary" onClick={onBusinessTabSwitch}>
                                <Edit className="w-4 h-4 mr-2" /> Complete Business Profile
                            </Button>
                        )}
                    </Card>

                    {/* Activation Form */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-primary/5 p-8 bg-white dark:bg-slate-900">
                        <h4 className="font-extrabold text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-primary" /> Marketplace Credentials
                        </h4>
                        <p className="text-xs text-muted-foreground mb-6 leading-relaxed font-medium">
                            Choose a password for your marketplace seller account. Your KNCCI email <span className="font-bold text-foreground">{user.email}</span> will be your login.
                        </p>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Marketplace Password</label>
                                <div className="relative">
                                    <Input
                                        type={showCmsPassword ? "text" : "password"}
                                        placeholder="Min 8 characters"
                                        value={cmsPassword}
                                        onChange={(e) => setCmsPassword(e.target.value)}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-border/50 pr-10"
                                    />
                                    <button type="button" onClick={() => setShowCmsPassword(!showCmsPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showCmsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        type={showCmsPassword ? "text" : "password"}
                                        placeholder="Re-enter password"
                                        value={cmsConfirmPassword}
                                        onChange={(e) => setCmsConfirmPassword(e.target.value)}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-border/50 pr-10"
                                    />
                                    <button type="button" onClick={() => setShowCmsPassword(!showCmsPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {showCmsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-8 rounded-2xl h-14 font-extrabold text-sm shadow-xl shadow-primary/20 uppercase tracking-widest"
                            disabled={!requiredComplete || connecting || cmsPassword.length < 8 || cmsPassword !== cmsConfirmPassword}
                            onClick={handleConnect}
                        >
                            {connecting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating...</>
                            ) : (
                                <><Store className="w-4 h-4 mr-2" /> Activate Seller Account</>
                            )}
                        </Button>

                        {!requiredComplete && (
                            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Complete required business fields first</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        );
    }

    // ─── Connected but Session Expired: Login Flow ────────────────
    if (isSessionExpired) {
        return (
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 p-12 bg-white dark:bg-slate-900 min-h-[500px] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8">
                    <KeyRound className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Marketplace Session Expired</h3>
                <p className="text-muted-foreground max-w-sm font-medium leading-[1.8] mb-8">
                    Your marketplace session has expired for security. Please enter your marketplace password to continue managing products.
                </p>
                <div className="w-full max-w-xs space-y-4">
                    <div className="relative">
                        <Input
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="Marketplace Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="rounded-xl h-12 text-center pr-10"
                            onKeyDown={(e) => e.key === 'Enter' && handleMarketplaceLogin()}
                        />
                        <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    <Button
                        className="w-full rounded-2xl h-12 font-extrabold uppercase tracking-widest text-[10px]"
                        onClick={handleMarketplaceLogin}
                        disabled={isLoggingIn || !loginPassword}
                    >
                        {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px]"
                        onClick={openMarketplace}
                    >
                        Visit Marketplace
                    </Button>
                </div>
            </Card>
        );
    }

    const products: CmsProduct[] = dashboard?.products?.data || (Array.isArray(dashboard?.products) ? dashboard?.products as any : []);
    const totalProducts = dashboard?.products?.total || products.length;
    const totalOrders = dashboard?.orderStats?.totalOrders || 0;
    const totalRevenue = dashboard?.orderStats?.totalRevenue || 0;

    return (
        <div className="space-y-8">
            {/* Connection Indicator */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.1em]">Connected to Marketplace</span>
                    </div>
                    {cmsStatus?.tenantId && (
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                            Tenant ID: {cmsStatus.tenantId.slice(0, 8)}...
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                     <div className="text-right">
                         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Store Slug</p>
                         <p className="text-[11px] font-extrabold text-foreground truncate max-w-[150px]">{business?.cms_org_slug || 'active-store'}</p>
                     </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[
                    { label: "Products", value: totalProducts, icon: <Package className="w-5 h-5" />, color: "from-secondary to-secondary/70", bg: "bg-secondary/10" },
                    { label: "Orders", value: totalOrders, icon: <ShoppingCart className="w-5 h-5" />, color: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10" },
                    { label: "Revenue", value: `KES ${totalRevenue.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-500/10" },
                    { label: "Escrow", value: `KES ${dashboard?.orderStats?.escrowBalance?.toLocaleString() || 0}`, icon: <ShieldCheck className="w-5 h-5" />, color: "from-amber-500 to-orange-600", bg: "bg-amber-500/10" },
                    { label: "Available", value: `KES ${dashboard?.orderStats?.availableBalance?.toLocaleString() || 0}`, icon: <Wallet className="w-5 h-5" />, color: "from-primary to-primary/70", bg: "bg-primary/10" },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card className="rounded-3xl border-none shadow-xl shadow-primary/5 overflow-hidden relative group hover:shadow-primary/10 transition-all">
                            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                            <CardContent className="p-6 relative">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <p className="text-xl font-extrabold tracking-tight">{stat.value}</p>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">{stat.label}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Marketplace Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-border/40 pb-2">
                {[
                    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
                    { id: 'categories', label: 'Categories', icon: <Settings className="w-4 h-4" /> },
                    { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-4 h-4" /> },
                ].map(tab => (
                    <Button
                        key={tab.id}
                        variant={subTab === tab.id ? "secondary" : "ghost"}
                        className={`rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 px-5 ${subTab === tab.id ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setSubTab(tab.id as any)}
                    >
                        {tab.icon}
                        <span className="ml-2">{tab.label}</span>
                    </Button>
                ))}
            </div>

            {/* Content Switch */}
            <AnimatePresence mode="wait">
                {subTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                                <Card className="rounded-[2rem] border-none shadow-xl shadow-primary/5 p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 group overflow-hidden relative cursor-pointer" onClick={() => { openMarketplace(); }}>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-[40px] group-hover:bg-secondary/10 transition-colors" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-sm">Visit Marketplace</h4>
                                            <p className="text-xs text-muted-foreground font-medium">Browse the public storefront</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                            </motion.div>
                            <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                                <Link href="/member-directory">
                                    <Card className="rounded-[2rem] border-none shadow-xl shadow-primary/5 p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 group overflow-hidden relative cursor-pointer">
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-[40px] group-hover:bg-primary/10 transition-colors" />
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-sm">Member Directory</h4>
                                                <p className="text-xs text-muted-foreground font-medium">Connect with verified members</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {subTab === 'products' && (
                    <motion.div key="products" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                        {/* Products Card */}
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 bg-white dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl font-extrabold">Your Products</CardTitle>
                            <CardDescription className="font-medium">Manage your marketplace listings</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="rounded-xl font-bold text-xs uppercase tracking-widest border-primary/20 text-primary h-10 px-5"
                                onClick={() => { openMarketplace(); }}
                            >
                                <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Store
                            </Button>
                            <Button className="rounded-xl font-bold text-xs uppercase tracking-widest h-10 px-5 shadow-lg shadow-primary/20" onClick={() => {
                                setShowAddForm(!showAddForm);
                                if (!showAddForm) loadCategories();
                            }}>
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Button>
                        </div>

                    </div>
                </CardHeader>

                {/* Add Product Form (inline) */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="px-8 pb-6 pt-2 border-t border-border/20">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">New Product</p>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    <Input placeholder="Product name *" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} className="rounded-xl h-11" />
                                    <Select onValueChange={val => setNewProduct({ ...newProduct, category: val })} value={newProduct.category}>
                                        <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Select category *" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {categories.length > 0 ? (
                                                categories.map(c => <SelectItem key={c._id} value={c.name}>{c.name} ({c.categoryType})</SelectItem>)
                                            ) : (
                                                <SelectItem value="none" disabled>No categories found</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Input placeholder="Price (KES) *" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="rounded-xl h-11" />
                                    <Input placeholder="Stock quantity" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className="rounded-xl h-11" />
                                    <Input placeholder="Unit (e.g. Kg, Box, Hr)" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })} className="rounded-xl h-11" />
                                </div>

                                <Textarea placeholder="Product description *" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className="mt-4 rounded-xl min-h-[80px]" />
                                <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border/30 bg-muted/20 p-4 sm:flex-row sm:items-center">
                                    <div className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-border/20 shrink-0">
                                        {newProduct.image ? (
                                            <img src={newProduct.image} alt="New product" className="h-full w-full object-cover" />
                                        ) : (
                                            <Package className="w-8 h-8 text-muted-foreground/30" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Product Image</p>
                                            <p className="text-xs text-muted-foreground mt-1">Upload a cover image for this product.</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <label className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer">
                                                {isUploadingProductImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                {newProduct.image ? "Replace Image" : "Upload Image"}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleNewProductImageChange}
                                                    disabled={isUploadingProductImage}
                                                />
                                            </label>
                                            {newProduct.image && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    className="rounded-xl font-bold"
                                                    onClick={() => setNewProduct((prev) => ({ ...prev, image: "" }))}
                                                >
                                                    Remove Image
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setShowAddForm(false)}>Cancel</Button>
                                    <Button className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20" onClick={handleAddProduct} disabled={addingProduct}>
                                        {addingProduct ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Product"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Products List */}
                <CardContent className="p-0">
                    {products.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                                <Package className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                            <h4 className="font-extrabold text-lg mb-2">No Products Yet</h4>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">Start listing your products and services to reach the KNCCI trade network.</p>
                            <Button className="mt-6 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => setShowAddForm(true)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Your First Product
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/20">
                            {products.map((product, i) => (
                                <motion.div
                                    key={product._id || i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group cursor-pointer"
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setIsEditingProduct(false);
                                    }}

                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                            {product.image || product.images?.[0] ? (
                                                <img src={product.image || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-6 h-6 text-muted-foreground/40" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-extrabold text-sm truncate group-hover:text-primary transition-colors">{product.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs font-bold text-primary">KES {((product.basePrice || product.price || 0) + (product.additions || 0)).toLocaleString()}</span>
                                                <Badge variant="outline" className={`text-[9px] h-5 font-bold tracking-widest uppercase ${product.isActive !== false ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-red-500/30 bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {product.isActive !== false ? "Active" : "Inactive"}
                                                </Badge>
                                                {product.category && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{product.category}</span>}
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{product.stock || 0} {product.unit || 'Units'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProduct(product);
                                                setIsEditingProduct(true);
                                                loadCategories();
                                            }}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteProduct(product._id, product.name);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>

                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            </motion.div>
                )}

                {subTab === 'categories' && (
                    <motion.div key="categories" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 bg-white dark:bg-slate-900 overflow-hidden min-h-[400px]">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-extrabold">Categories</CardTitle>
                                        <CardDescription className="font-medium">Organize your marketplace offerings</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-8">
                                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 max-w-xl">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Add New Category</p>
                                    <div className="grid gap-4">
                                        <Input
                                            placeholder="Category Name"
                                            value={newCategory.name}
                                            onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                            className="rounded-xl h-11"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Select
                                                value={newCategory.categoryType}
                                                onValueChange={(val: any) => setNewCategory({ ...newCategory, categoryType: val })}
                                            >
                                                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    <SelectItem value="product">Product</SelectItem>
                                                    <SelectItem value="service">Service</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                className="rounded-xl h-11 font-extrabold bg-primary shadow-lg shadow-primary/10"
                                                onClick={handleCreateCategory}
                                                disabled={creatingCategory || !newCategory.name}
                                            >
                                                {creatingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Create</>}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Existing Categories</p>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {categories.map(c => (
                                            <div key={c._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/20 group">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold truncate">{c.name}</p>
                                                    <Badge variant="outline" className="text-[9px] mt-1 h-5 font-bold tracking-widest uppercase border-primary/20 text-primary">
                                                        {c.categoryType}
                                                    </Badge>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                    onClick={() => handleDeleteCategory(c._id, c.name)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {categories.length === 0 && (
                                            <div className="text-center py-12 text-muted-foreground col-span-full">
                                                <p className="text-sm font-medium">No categories created yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {subTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                        <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 bg-white dark:bg-slate-900 overflow-hidden min-h-[400px]">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <CardTitle className="text-xl font-extrabold">Order Management</CardTitle>
                                        <CardDescription className="font-medium">Track and fulfill customer orders</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="rounded-xl font-bold text-xs uppercase tracking-widest border-primary/20 text-primary h-10 px-5"
                                        onClick={handleSeedOrders}
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-2" /> Seed Test Order
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loadingOrders ? (
                                    <div className="flex items-center justify-center p-12">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    </div>
                                ) : (orders || []).length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                                            <ShoppingCart className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <h4 className="font-extrabold text-lg mb-2">No Orders Yet</h4>
                                        <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium">When customers buy your products, orders will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {(orders || []).map((order, i) => (
                                            <div key={order._id || i} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-extrabold text-sm truncate">{order.guestInfo?.name || 'Guest Customer'}</h4>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                                {order.id || `#${order._id.slice(-6)}`}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-medium truncate">{order.guestInfo?.email}</p>
                                                        <div className="pt-2 flex items-center gap-3">
                                                            <span className="text-xs font-bold text-primary">KES {(order.totalAmount || 0).toLocaleString()}</span>
                                                            <span className="text-[10px] text-muted-foreground">•</span>
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                {order.items?.length || 0} item(s)
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">•</span>
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                    <Select
                                                        value={(order.status || 'Pending').toLowerCase()}
                                                        onValueChange={(val) => handleUpdateOrderStatus(order._id, val.charAt(0).toUpperCase() + val.slice(1))}
                                                    >
                                                        <SelectTrigger className="rounded-xl h-10 w-[140px] text-xs font-bold uppercase tracking-widest">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="paid_escrow">Locked in Escrow</SelectItem>
                                                            <SelectItem value="paid">Paid (Direct)</SelectItem>
                                                            <SelectItem value="processing">Processing</SelectItem>
                                                            <SelectItem value="shipped">Shipped</SelectItem>
                                                            <SelectItem value="completed">Completed</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>




            {/* Product Detail Dialog */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight">
                            {isEditingProduct ? "Edit Listing" : "Product Details"}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedProduct && (
                        <div className="space-y-6 pt-4">
                            {isEditingProduct ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Name</label>
                                            <Input
                                                defaultValue={selectedProduct.name}
                                                onBlur={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                                            <Select
                                                defaultValue={selectedProduct.category}
                                                onValueChange={(val) => setSelectedProduct({ ...selectedProduct, category: val })}
                                            >
                                                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-xl">
                                                    {categories.map(c => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Price (KES)</label>
                                            <Input
                                                type="number"
                                                defaultValue={selectedProduct.price}
                                                onBlur={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })}
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Stock</label>
                                            <Input
                                                type="number"
                                                defaultValue={selectedProduct.stock}
                                                onBlur={(e) => setSelectedProduct({ ...selectedProduct, stock: parseInt(e.target.value) })}
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Unit</label>
                                            <Input
                                                defaultValue={selectedProduct.unit}
                                                placeholder="e.g. Kg"
                                                onBlur={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })}
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                                        <Textarea
                                            defaultValue={selectedProduct.description}
                                            onBlur={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                                            className="rounded-xl min-h-[100px]"
                                        />
                                    </div>
                                    <div className="rounded-2xl border border-border/20 bg-slate-50 dark:bg-slate-900/40 p-4">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">Product Image</p>
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <div className="w-28 h-28 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-border/20 shrink-0">
                                                {selectedProduct.image || selectedProduct.images?.[0] ? (
                                                    <img
                                                        src={selectedProduct.image || selectedProduct.images?.[0]}
                                                        alt={selectedProduct.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-10 h-10 text-muted-foreground/30" />
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                <label className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer">
                                                    {isUploadingSelectedProductImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                    {selectedProduct.image || selectedProduct.images?.[0] ? "Replace Image" : "Upload Image"}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleSelectedProductImageChange}
                                                        disabled={isUploadingSelectedProductImage}
                                                    />
                                                </label>
                                                {(selectedProduct.image || selectedProduct.images?.[0]) && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        className="rounded-xl font-bold"
                                                        onClick={() =>
                                                            setSelectedProduct({
                                                                ...selectedProduct,
                                                                image: undefined,
                                                                images: [],
                                                            })
                                                        }
                                                    >
                                                        Remove Image
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsEditingProduct(false)}>Cancel</Button>
                                        <Button
                                            className="rounded-xl px-10 font-extrabold shadow-xl shadow-primary/20 bg-primary"
                                            disabled={addingProduct}
                                            onClick={() => handleUpdateProduct({
                                                name: selectedProduct.name,
                                                price: selectedProduct.price,
                                                category: selectedProduct.category,
                                                description: selectedProduct.description,
                                                image: selectedProduct.image || selectedProduct.images?.[0],
                                                stock: selectedProduct.stock,
                                                unit: selectedProduct.unit
                                            })}
                                        >
                                            {addingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex gap-6">
                                        <div className="w-32 h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-border/20">
                                            {selectedProduct.image || selectedProduct.images?.[0] ? (
                                                <img src={selectedProduct.image || selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-10 h-10 text-muted-foreground/30" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Badge className="bg-primary/10 text-primary border-none font-bold rounded-lg px-2 h-5 text-[9px] uppercase tracking-widest">
                                                {selectedProduct.category}
                                            </Badge>
                                            <h3 className="text-2xl font-extrabold tracking-tight">{selectedProduct.name}</h3>
                                            <p className="text-2xl font-black text-primary">KES {((selectedProduct.basePrice || selectedProduct.price || 0) + (selectedProduct.additions || 0)).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border/20">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Stock Availability</p>
                                            <p className="font-extrabold text-lg">{selectedProduct.stock || 0} {selectedProduct.unit || 'Units'}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-border/20">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${selectedProduct.isActive !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                <p className="font-extrabold text-sm uppercase tracking-widest">{selectedProduct.isActive !== false ? 'Active' : 'Hidden'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Description</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                            {selectedProduct.description}
                                        </p>
                                    </div>

                                    <div className="flex justify-end pt-6 border-t border-border/20">
                                        <Button className="rounded-xl font-bold" onClick={() => setIsEditingProduct(true)}>
                                            <Edit className="w-4 h-4 mr-2" /> Edit Listing
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>


        </div>
    );
}
