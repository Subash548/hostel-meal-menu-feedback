import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import client from '../../src/api/client';
import { Star, MessageSquare, Send } from 'lucide-react-native';

export default function FeedbackScreen() {
    const { user } = useAuth();
    const [mealType, setMealType] = useState('Breakfast');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await client.post('/api/feedback', {
                meal_type: mealType,
                rating: rating,
                comment: comment
            });
            Alert.alert('Success', 'Thank you! Your feedback has been submitted.');
            setComment('');
            setRating(5);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const mealTypes = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Feedback</Text>
                <Text style={styles.subtitle}>Help us improve your dining experience</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>WHICH MEAL?</Text>
                <View style={styles.chipContainer}>
                    {mealTypes.map((type) => (
                        <TouchableOpacity 
                            key={type}
                            style={[styles.chip, mealType === type && styles.activeChip]}
                            onPress={() => setMealType(type)}
                        >
                            <Text style={[styles.chipText, mealType === type && styles.activeChipText]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>RATING</Text>
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <TouchableOpacity key={s} onPress={() => setRating(s)}>
                            <Star 
                                size={40} 
                                color={rating >= s ? '#eab308' : '#334155'} 
                                fill={rating >= s ? '#eab308' : 'transparent'} 
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>COMMENTS (OPTIONAL)</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={6}
                    placeholder="Tell us more about the food quality, service, or menu variety..."
                    placeholderTextColor="#64748b"
                    value={comment}
                    onChangeText={setComment}
                />
            </View>

            <TouchableOpacity 
                style={[styles.submitButton, loading && styles.disabledButton]} 
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <Text style={styles.submitButtonText}>Submit Feedback</Text>
                        <Send size={20} color="#fff" />
                    </>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginTop: 4,
    },
    section: {
        marginBottom: 28,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        color: '#64748b',
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        backgroundColor: '#1e1e1e',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    activeChip: {
        backgroundColor: '#06b6d4',
        borderColor: '#06b6d4',
    },
    chipText: {
        color: '#94a3b8',
        fontWeight: '600',
    },
    activeChipText: {
        color: '#fff',
    },
    starContainer: {
        flexDirection: 'row',
        gap: 12,
        backgroundColor: '#1e1e1e',
        padding: 20,
        borderRadius: 20,
        justifyContent: 'center',
    },
    textArea: {
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        padding: 20,
        color: '#f1f5f9',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#334155',
        minHeight: 150,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: '#06b6d4',
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
        marginBottom: 40,
        shadowColor: '#06b6d4',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
