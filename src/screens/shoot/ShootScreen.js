import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../theme';
import { useShootStore } from '../../store/shootStore';
import { useOrderStore } from '../../store/orderStore';
import { Card, LoadingOverlay, ErrorOverlay, EmptyState, ScreenWrapper } from '../../components/common';
import { FormButton } from '../../components/forms';
import * as ImagePicker from 'expo-image-picker';

const ShootScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const orders = useOrderStore((s) => s.orders);
    const shoots = useShootStore((s) => s.shoots);
    const updateShoot = useShootStore((s) => s.updateShoot);
    const addShoot = useShootStore((s) => s.addShoot);
    const addImage = useShootStore((s) => s.addImage);
    const isLoading = useShootStore((s) => s.isLoading);
    const error = useShootStore((s) => s.error);
    const clearError = useShootStore((s) => s.clearError);

    const handleUpload = async (uri) => {
        try {
            // Upload-ready structure: returns { localUri, remoteUrl, uploadedAt }
            const uploadedImage = await uploadImage(uri);
            
            // Update store with the new image
            if (shoots.length > 0) {
                addImage(shoots[0].id, uploadedImage);
            }

            Alert.alert(
                'Upload Successful', 
                'Media has been uploaded to cloud storage and associated with this order record.',
                [{ text: 'OK' }]
            );
            
            return uploadedImage;
        } catch (error) {
            // Handled by store ErrorOverlay
        }
    };


    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera roll permissions to upload product photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await handleUpload(result.assets[0].uri);
        }
    };

    const handleOpenCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need camera permissions to take product photos.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            await handleUpload(result.assets[0].uri);
        }
    };

    const handleShare = async (item) => {
        try {
            // Fallback to local image if mainImage (URL) is not yet available
            const imageUrl = item.mainImage || (item.images && item.images[0]?.remoteUrl);
            if (!imageUrl) return;

            await Share.share({
                message: `Check out our latest design: ${item.orderId} - ${item.customerName}`,
                url: imageUrl,
            });
        } catch {
            // Share dismissed or failed silently
        }
    };


    return (
        <ScreenWrapper useSafeTop>
            <LoadingOverlay visible={isLoading} message="Processing media..." />
            <ErrorOverlay
                visible={!!error}
                error={error}
                onClose={clearError}
            />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Media & Shoot</Text>
                <Text style={styles.headerSubtitle}>{shoots.length} product shoots recorded</Text>
            </View>

            {shoots.length === 0 ? (
                <EmptyState
                    icon="camera-outline"
                    title="No product photos yet"
                    subtitle="Shoots from completed orders will appear here"
                />
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
                >
                    <View style={styles.shootGrid}>
                        {shoots.map((item) => (
                            <Card key={item.id} style={styles.shootCard}>
                                <TouchableOpacity onPress={() => { }}>
                                    <Image source={{ uri: item.mainImage }} style={styles.shootImage} />
                                    <View style={styles.shootOverlay}>
                                        <View style={[styles.statusTag, { backgroundColor: item.status === 'published' ? COLORS.success : COLORS.warning }]}>
                                            <Text style={styles.statusTagText}>{item.status}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <View style={styles.shootInfo}>
                                    <View>
                                        <Text style={styles.shootOrderId}>ORDER {item.orderId}</Text>
                                        <Text style={styles.shootCustomer}>{item.customerName}</Text>
                                    </View>
                                    <View style={styles.shootActions}>
                                        <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleShare(item)}>
                                            <Ionicons name="share-social-outline" size={20} color={COLORS.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionIconBtn}>
                                            <Ionicons name="cloud-upload-outline" size={20} color={COLORS.primary} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Card>
                        ))}
                    </View>

                    <View style={styles.uploadSection}>
                        <Card style={styles.uploadCard}>
                            <Ionicons name="cloud-upload-outline" size={40} color={COLORS.primary} style={{ marginBottom: SIZES.sm }} />
                            <Text style={styles.uploadTitle}>New Product Shoot</Text>
                            <Text style={styles.uploadSubtitle}>Capture and upload product photography for social media</Text>
                            <FormButton
                                title="Select from Gallery"
                                icon="images-outline"
                                onPress={handlePickImage}
                                variant="outline"
                            />
                            <FormButton
                                title="Open Camera"
                                icon="camera-outline"
                                onPress={handleOpenCamera}
                                style={{ marginTop: SIZES.sm }}
                            />
                        </Card>
                    </View>
                </ScrollView>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.md,
    },
    headerTitle: {
        fontSize: SIZES.heading,
        ...FONTS.bold,
        color: COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: SIZES.small,
        ...FONTS.regular,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    scrollContent: {
        paddingHorizontal: SIZES.lg,
    },
    shootGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    shootCard: {
        width: '48%',
        padding: 0,
        overflow: 'hidden',
        marginBottom: SIZES.md,
    },
    shootImage: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.bgElevated,
    },
    shootOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: SIZES.radiusSm,
    },
    statusTagText: {
        fontSize: 10,
        ...FONTS.bold,
        color: COLORS.textOnPrimary,
        textTransform: 'uppercase',
    },
    shootInfo: {
        padding: SIZES.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shootOrderId: {
        fontSize: 10,
        ...FONTS.medium,
        color: COLORS.textMuted,
    },
    shootCustomer: {
        fontSize: SIZES.small,
        ...FONTS.semiBold,
        color: COLORS.textPrimary,
        marginTop: 2,
    },
    shootActions: {
        flexDirection: 'row',
    },
    actionIconBtn: {
        marginLeft: 8,
        padding: 4,
    },
    uploadSection: {
        marginTop: SIZES.xl,
        marginBottom: SIZES.xxxl,
    },
    uploadCard: {
        alignItems: 'center',
        padding: SIZES.xl,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: COLORS.primarySoft,
    },
    uploadTitle: {
        fontSize: SIZES.subtitle,
        ...FONTS.bold,
        color: COLORS.textPrimary,
    },
    uploadSubtitle: {
        fontSize: SIZES.small,
        ...FONTS.regular,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: SIZES.xl,
    },
});

export default ShootScreen;
