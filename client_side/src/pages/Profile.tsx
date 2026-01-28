import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Camera, Save, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Profile() {
    const { user, setUser } = useAuth() as any;
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profileImage: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await api.auth.me();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    profileImage: data.profileImage || '',
                    address: {
                        street: data.address?.street || '',
                        city: data.address?.city || '',
                        state: data.address?.state || '',
                        zipCode: data.address?.zipCode || '',
                        country: data.address?.country || 'USA'
                    }
                });
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.auth.updateProfile(formData);
            setUser({ ...user, name: formData.name, avatar: formData.profileImage });
            toast.success('Profile updated successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const Content = (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl bg-card border border-border">
                    <div className="relative group">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                            <AvatarImage src={formData.profileImage} />
                            <AvatarFallback className="text-4xl bg-accent text-accent-foreground">
                                {formData.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <label className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg">
                            <Camera className="w-5 h-5" />
                            <input
                                type="text"
                                className="hidden"
                                placeholder="Image URL"
                                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                            />
                        </label>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-display font-bold text-foreground mb-2">{formData.name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{formData.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider">
                                <Shield className="w-3 h-3" />
                                {user?.role}
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6 p-8 rounded-2xl bg-card border border-border">
                        <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                            <User className="w-5 h-5 text-accent" />
                            Basic Information
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-muted/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Profile Image URL</Label>
                                <Input
                                    id="image"
                                    value={formData.profileImage}
                                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Info */}
                    <div className="space-y-6 p-8 rounded-2xl bg-card border border-border">
                        <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-accent" />
                            Location Details
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="street">Street Address</Label>
                                <Input
                                    id="street"
                                    value={formData.address.street}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        address: { ...formData.address, street: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={formData.address.city}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, city: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State / Province</Label>
                                    <Input
                                        id="state"
                                        value={formData.address.state}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, state: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP / Postal Code</Label>
                                    <Input
                                        id="zip"
                                        value={formData.address.zipCode}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, zipCode: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input
                                        id="country"
                                        value={formData.address.country}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            address: { ...formData.address, country: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <Button
                            type="submit"
                            className="bg-accent hover:bg-accent/90 px-8 py-6 h-auto text-lg"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );

    if (user?.role === 'admin' || user?.role === 'organizer') {
        return (
            <DashboardLayout title="Profile Settings" subtitle="Manage your account information">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                ) : Content}
            </DashboardLayout>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
            ) : Content}
            <Footer />
        </div>
    );
}
