import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import client from '../../src/api/client';
import { Utensils, AlertTriangle, ShieldCheck, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const { user, loading: authLoading } = useAuth();
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchMenu = useCallback(async () => {
        try {
            const res = await client.get('/api/menu/today');
            setMenu(res.data && !res.data.message ? res.data : null);
        } catch (err) {
            console.log('Error fetching menu:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        } else if (user) {
            fetchMenu();
        }
    }, [user, authLoading]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMenu();
    };

    if (authLoading || loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
            </View>
        );
    }

    const getCurrentMeal = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'breakfast';
        if (hour < 15) return 'lunch';
        if (hour < 18) return 'snacks';
        return 'dinner';
    };

    const currentMealType = getCurrentMeal();

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.contentContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />}
        >
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name || 'Student'}</Text>
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                </View>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'S'}</Text>
                </View>
            </View>

            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>Today's Menu</Text>
                <Text style={styles.heroSubtitle}>Freshly prepared for you</Text>
            </View>

            {!menu ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No menu posted for today yet.</Text>
                </View>
            ) : (
                <View style={styles.menuGrid}>
                    <MealCard 
                        title="Breakfast" 
                        dishes={menu.breakfast} 
                        isActive={currentMealType === 'breakfast'} 
                        icon="🌅"
                    />
                    <MealCard 
                        title="Lunch" 
                        dishes={menu.lunch} 
                        isActive={currentMealType === 'lunch'} 
                        icon="☀️"
                    />
                    <MealCard 
                        title="Snacks" 
                        dishes={menu.snacks} 
                        isActive={currentMealType === 'snacks'} 
                        icon="☕"
                    />
                    <MealCard 
                        title="Dinner" 
                        dishes={menu.dinner} 
                        isActive={currentMealType === 'dinner'} 
                        icon="🌙"
                    />
                </View>
            )}

            <TouchableOpacity style={styles.feedbackCTA} onPress={() => router.push('/explore')}>
                <View style={styles.ctaContent}>
                    <Text style={styles.ctaTitle}>How was your meal?</Text>
                    <Text style={styles.ctaSubtitle}>Your feedback helps us improve the quality of our services.</Text>
                </View>
                <View style={styles.ctaIcon}>
                    <Text style={{fontSize: 24}}>📝</Text>
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
}

function MealCard({ title, dishes, isActive, icon }) {
    const dishNames = Array.isArray(dishes) ? dishes.map(d => d.name).join(', ') : (dishes || 'Not available');

    return (
        <View style={[styles.card, isActive && styles.activeCard]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{icon}</Text>
                <Text style={[styles.cardTitle, isActive && styles.activeText]}>{title}</Text>
                {isActive && (
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.cardContent, isActive && styles.activeSubtext]}>
                {dishNames}
            </Text>
            <View style={styles.cardFooter}>
                <Clock size={12} color={isActive ? '#312e81' : '#64748b'} />
                <Text style={[styles.timeText, isActive && styles.activeSubtext]}>
                    {title === 'Breakfast' ? '07:30 - 09:30' : title === 'Lunch' ? '12:30 - 14:30' : title === 'Snacks' ? '17:00 - 18:00' : '19:30 - 21:30'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    dateText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#06b6d4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    heroSection: {
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#06b6d4',
        fontWeight: '600',
        marginTop: 2,
    },
    menuGrid: {
        gap: 16,
    },
    card: {
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeCard: {
        backgroundColor: '#06b6d4',
        borderColor: '#67e8f9',
        transform: [{ scale: 1.02 }],
        shadowColor: '#06b6d4',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f1f5f9',
        flex: 1,
    },
    activeText: {
        color: '#fff',
    },
    liveBadge: {
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    liveBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#06b6d4',
    },
    cardContent: {
        fontSize: 15,
        color: '#94a3b8',
        lineHeight: 22,
        marginBottom: 16,
    },
    activeSubtext: {
        color: '#e0f2fe',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timeText: {
        fontSize: 12,
        color: '#64748b',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#334155',
    },
    emptyText: {
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    feedbackCTA: {
        backgroundColor: '#334155',
        marginTop: 30,
        borderRadius: 20,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    ctaContent: {
        flex: 1,
    },
    ctaTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    ctaSubtitle: {
        fontSize: 14,
        color: '#cbd5e1',
        lineHeight: 20,
    },
    ctaIcon: {
        width: 50,
        height: 50,
        backgroundColor: '#475569',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
