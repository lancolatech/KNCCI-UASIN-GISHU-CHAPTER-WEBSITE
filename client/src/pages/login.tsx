import { motion } from "framer-motion";
import { Lock, User, Mail, ArrowRight, ShieldCheck, LogIn, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOHead } from "@/components/seo/seo-head";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

import { useAuth } from "@/services/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cmsService } from "@/services/cms-service";



export default function LoginPage() {
    const [, setLocation] = useLocation();
    const { login, isAuthenticated, user } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            setLocation(user.role === 'admin' ? '/admin' : '/profile');
        }
    }, [isAuthenticated, user, setLocation]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const loggedInUser = await login({ email, password });
            toast({
                title: "Welcome back!",
                description: loggedInUser.role === 'admin'
                    ? "Redirecting to admin dashboard..."
                    : "You have successfully logged in.",
            });
            setLocation(loggedInUser.role === 'admin' ? '/admin' : '/profile');

            // Fire-and-forget CMS session warmup. This pre-warms the marketplace
            // session without blocking the portal login redirect. If warmup fails
            // the marketplace lazy-fallback will re-establish the session on first use.
            if (loggedInUser.role !== 'admin' && !loggedInUser.requirePasswordChange) {
                cmsService.warmup(password).catch(() => {
                    // Warmup failure is non-fatal; marketplace will handle it lazily.
                });
            }

        } catch (error: any) {
            toast({
                title: "Login failed",
                description: error.response?.data?.message || "Invalid email or password",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden flex flex-col">
            <SEOHead
                title="Login | KNCCI Uasin Gishu Member Portal"
                description="Access your KNCCI Uasin Gishu member portal. Manage your profile, pay for membership, and explore business opportunities."
            />

            <main className="flex-grow flex items-center justify-center p-4 relative">
                {/* Abstract Background Orbs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
                </div>

                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    {/* Left Column - Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="hidden lg:block space-y-8"
                    >
                        <Link href="/">
                            <Button variant="ghost" className="mb-4 text-primary font-bold hover:bg-primary/5 pl-0">
                                <ChevronLeft className="w-4 h-4 mr-2" /> Back to Home
                            </Button>
                        </Link>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-primary/20">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Secure Member Portal
                            </div>
                            <h1 className="text-5xl font-extrabold mb-8 leading-tight">
                                Unlock Your <span className="text-primary italic">Chamber</span> Benefits
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-md">
                                Access exclusive member resources, update your business profile, and connect with other businesses in the North Rift region.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                "Manage your membership status",
                                "Access trade opportunities & leads",
                                "Register for events with member discounts",
                                "Post products in the marketplace"
                            ].map((text, i) => (
                                <div key={i} className="flex gap-4 items-center group">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-lg font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">{text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-slate-200" />
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                                    +6k
                                </div>
                            </div>
                            <p className="text-sm font-bold text-muted-foreground">Join 6,500+ businesses registered with us</p>
                        </div>
                    </motion.div>

                    {/* Right Column - Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md mx-auto"
                    >
                        <Card className="border-border/50 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[2.5rem] overflow-hidden bg-background/80 backdrop-blur-xl">
                            <Tabs defaultValue="login" className="w-full">
                                <TabsList className="grid grid-cols-2 h-16  bg-primary/5 rounded-none p-1.5 gap-1">
                                    <TabsTrigger value="login" className="h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg font-bold text-sm rounded-3xl transition-all">Login</TabsTrigger>
                                    <TabsTrigger value="register" className="h-full data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg font-bold text-sm rounded-3xl transition-all">Register</TabsTrigger>
                                </TabsList>

                                <CardContent className="p-10">
                                    <TabsContent value="login" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="text-center mb-2">
                                            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Welcome Back</h2>
                                            <p className="text-muted-foreground font-medium">Enter your credentials to access your account</p>
                                        </div>

                                        <form onSubmit={handleLogin} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground ml-1">Email / Username</label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            required
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            placeholder="name@company.com"
                                                            className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-border/50 focus:border-primary focus:ring-primary/20 transition-all text-base"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</label>
                                                        <Button variant="ghost" type="button" className="text-xs h-auto p-0 font-bold text-primary hover:bg-transparent hover:underline">Forgot Password?</Button>
                                                    </div>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                        <Input
                                                            required
                                                            type={showPassword ? "text" : "password"}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            className="h-14 pl-12 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-border/50 focus:border-primary focus:ring-primary/20 transition-all text-base"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
                                                        >
                                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                size="lg"
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 group relative overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center justify-center">
                                                    {isLoading ? "Signing In..." : "Sign In"} <LogIn className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </Button>
                                        </form>

                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
                                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-background px-3 text-muted-foreground">Or continue with</span></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Button variant="outline" className="h-14 rounded-2xl font-bold gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 border-border/60 transition-all">
                                                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                                                Google
                                            </Button>
                                            <Button variant="outline" className="h-14 rounded-2xl font-bold gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 border-border/60 transition-all">
                                                <User className="w-4 h-4 text-primary" />
                                                Member ID
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="register" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                        <div className="text-center mb-2">
                                            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Grow With Us</h2>
                                            <p className="text-muted-foreground font-medium">Join the largest business network in Uasin Gishu</p>
                                        </div>

                                        <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10">
                                            <p className="text-sm leading-relaxed mb-6 font-medium text-slate-700 dark:text-slate-300">
                                                Ready to take your business to the next level? Join over 6,500 members in Uasin Gishu County today.
                                            </p>
                                            <Button className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-primary/10" variant="default" asChild>
                                                <Link href="/membership">Start Application <ArrowRight className="ml-2 w-4 h-4" /></Link>
                                            </Button>
                                        </div>

                                        <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Become a member to access</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {["Trade Leads", "Discounts", "Networking", "Marketplace"].map((tag) => (
                                                <div key={tag} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-border/50">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    <span className="text-xs font-bold">{tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </CardContent>
                            </Tabs>
                        </Card>

                        <div className="mt-8 text-center text-sm text-muted-foreground font-medium">
                            &copy; {new Date().getFullYear()} KNCCI Uasin Gishu Chapter
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
