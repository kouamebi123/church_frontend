import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider, useDispatch } from 'react-redux';
import moduleRegistry from './architecture/ModuleRegistry';
import { getMe, logout } from './features/auth/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'
import i18nService from './services/i18nService';
// import { SpeedInsights } from "@vercel/speed-insights/react"
import { authService } from './services/authService';
import { SelectedChurchProvider } from './hooks/useSelectedChurch';
import RealtimeNotification from './components/RealtimeNotification';
import ConsoleProtection from './components/ConsoleProtection';

import store from './app/store';
import theme from './theme';
import './theme/globalTheme.css';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NoFound from './pages/NoFound';
import RequireAuth from './components/auth/RequireAuth';
import RedirectIfAuth from './components/auth/RedirectIfAuth';
import Layout from './components/layout/Layout';
import Loading from './components/Loading';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Lazy loading des pages
const Home = React.lazy(() =>
    import ('./pages/Home'));
const Profile = React.lazy(() =>
    import ('./pages/Profile'));

// Debug components
const FileUploadTest = React.lazy(() =>
    import ('./components/debug/FileUploadTest'));

// Réseaux
const Networks = React.lazy(() =>
    import ('./pages/networks/Networks'));
const NetworkDetails = React.lazy(() =>
    import ('./pages/networks/NetworkDetails'));

// Cultes
const Services = React.lazy(() =>
    import ('./pages/services/Services'));
const ServiceForm = React.lazy(() =>
    import ('./pages/services/ServiceForm'));
const ServicesList = React.lazy(() =>
    import ('./pages/services/ServicesList'));

// Autres pages
const Dashboard = React.lazy(() =>
    import ('./pages/Dashboard'));
const Testimonies = React.lazy(() =>
    import ('./pages/Testimonies'));

function AppContent() {
    const dispatch = useDispatch();
    const [showConsoleProtection, setShowConsoleProtection] = React.useState(false);

    React.useEffect(() => {
        // Initialisation du registre de modules
        moduleRegistry.registerModule('auth', {
            init: () => {
                const token = sessionStorage.getItem('token');
                if (token) {
                    dispatch(getMe());
                }
            },
            destroy: () => {
                // Module auth détruit
            }
        });

        moduleRegistry.registerModule('dashboard', {
            init: () => {
                // Module dashboard initialisé
            },
            destroy: () => {
                // Module dashboard détruit
            }
        });

        // Exécution des hooks d'initialisation
        moduleRegistry.executeHook('appInitialized');
    }, [dispatch]);

    // Écouteur pour la déconnexion forcée (token expiré)
    React.useEffect(() => {
        const handleForceLogout = (event) => {
            dispatch(logout());
        };

        window.addEventListener('forceLogout', handleForceLogout);

        return () => {
            window.removeEventListener('forceLogout', handleForceLogout);
        };
    }, [dispatch]);

    // Forcer la récupération du token CSRF au démarrage si l'utilisateur est connecté
    React.useEffect(() => {
        if (authService.isAuthenticated()) {
            // Appeler getMe pour récupérer le token CSRF
            authService.getMe().catch(error => {
                // Erreur lors de la récupération du token CSRF
            });
            // Activer la protection console seulement en production
            setShowConsoleProtection(true);
        } else {
            setShowConsoleProtection(false);
        }
    }, []);

    React.useEffect(() => {
        AOS.init({
            duration: 1000, // Durée de l'animation en ms
        });
    }, []);

    return ( 
        <>
            <Routes>
                <Route path = "/login" element = { 
                    <RedirectIfAuth>
                        <Login />
                    </RedirectIfAuth>
                }/>
                <Route path = "/register" element = { 
                    <RedirectIfAuth>
                        <Register />
                    </RedirectIfAuth>
                }/>
                <Route path = "/forgot-password" element = { 
                    <RedirectIfAuth>
                        <ForgotPassword />
                    </RedirectIfAuth>
                }/>
                <Route path = "/reset-password" element = { 
                    <RedirectIfAuth>
                        <ResetPassword />
                    </RedirectIfAuth>
                }/>
                <Route path = "/testimonies" element = { <Testimonies /> } />
                <Route path = "/" element = { < Navigate to = "/home" replace /> } />
                <Route path = "/home" element = { 
                    <RequireAuth>
                        <Home />
                    </RequireAuth>
                }/>
                <Route path = "/profile" element = { 
                    <RequireAuth>
                        <Profile />
                    </RequireAuth>
                }/>
                <Route path = "/networks" element = { 
                    <RequireAuth>
                        <Networks />
                    </RequireAuth>
                }/>
                <Route path = "/networks/:id" element = { 
                    <RequireAuth>
                        <NetworkDetails />
                    </RequireAuth>
                }/>
                <Route path = "/services" element = { 
                    <RequireAuth>
                        <Services />
                    </RequireAuth>
                }>
                    <Route index element = {< ServicesList /> } />
                    <Route path = "new" element = { < ServiceForm /> } />
                    <Route path = "list" element = { < ServicesList /> } />
                </Route>
                <Route path = "/dashboard" element = { 
                    <RequireAuth>
                        <Dashboard />
                    </RequireAuth> } />
                <Route path = "/debug/upload" element = { 
                    <RequireAuth>
                        <FileUploadTest />
                    </RequireAuth> } />
                <Route path = "*" element = { < NoFound /> } />
            </Routes>
            {showConsoleProtection && <ConsoleProtection />}
        </>
    );
}

function App() {
    return ( 
        <Provider store = { store } >
            <ThemeProvider theme = { theme } >
                <CssBaseline />
                <Router>
                    <SelectedChurchProvider>
                        <Layout>
                            <React.Suspense fallback = {<Loading titre = {i18nService.t('common.actions.loading')} /> } >
                                <AppContent />
                            </React.Suspense> 
                            <ToastContainer position = "top-right"
                            autoClose = { 5000 }
                            />
                            <RealtimeNotification />
                        </Layout> 
                    </SelectedChurchProvider>
                    {/* <SpeedInsights /> */} 
                </Router> 
            </ThemeProvider> 
        </Provider>
    );
}

export default App;
