import { useLocation, Link } from 'react-router-dom';
import { base44 } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                console.error('[PageNotFound] Auth check failed:', error);
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center">
                <h1 className="text-8xl font-syne font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">404</h1>
                <div className="neon-line w-24 mx-auto mb-6" />
                <h2 className="text-xl font-syne font-bold text-foreground mb-2">Page Not Found</h2>
                <p className="text-sm text-muted-foreground mb-8">
                    The page <span className="text-foreground">"{pageName}"</span> doesn't exist.
                </p>
                
                {isFetched && authData?.isAuthenticated && authData.user?.role === 'admin' && (
                    <div className="p-4 rounded-xl bg-card border border-primary/20 text-left mb-6">
                        <p className="text-xs text-primary font-medium mb-1">Admin Note</p>
                        <p className="text-xs text-muted-foreground">This page hasn't been implemented yet.</p>
                    </div>
                )}
                
                <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-syne font-bold text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Go Home
                </Link>
            </div>
        </div>
    )
}