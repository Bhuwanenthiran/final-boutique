import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOWS, getColors } from '../theme';
import { useThemeStore } from '../store/themeStore';
import { ScreenWrapper } from '../components/common';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderEntryScreen from '../screens/orders/OrderEntryScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import StitchingProductionScreen from '../screens/production/StitchingProductionScreen';

import FinishingScreen from '../screens/finishing/FinishingScreen';
import ShootScreen from '../screens/shoot/ShootScreen';

import CatalogueScreen from '../screens/catalogue/CatalogueScreen';

// Auth
import { useAuthStore } from '../store/authStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
    HomeTab: { active: 'home', inactive: 'home-outline' },
    OrdersTab: { active: 'receipt', inactive: 'receipt-outline' },
    ProductionTab: { active: 'construct', inactive: 'construct-outline' },
    MoreTab: { active: 'grid', inactive: 'grid-outline' },
};

const TAB_LABELS = {
    HomeTab: 'Home',
    OrdersTab: 'Orders',
    ProductionTab: 'Production',
    MoreTab: 'More',
};

const AdminTabs = () => {
    const insets = useSafeAreaInsets();
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => {
                    const icons = TAB_ICONS[route.name];
                    return (
                        <View style={focused ? [styles.activeTabIcon, { backgroundColor: C.primaryMuted }] : null}>
                            <Ionicons
                                name={focused ? icons.active : icons.inactive}
                                size={focused ? 22 : 20}
                                color={focused ? C.primary : C.textMuted}
                            />
                        </View>
                    );
                },
                tabBarLabel: TAB_LABELS[route.name],
                tabBarActiveTintColor: C.primary,
                tabBarInactiveTintColor: C.textMuted,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: 60 + insets.bottom,
                        paddingBottom: insets.bottom > 0 ? insets.bottom : SIZES.sm,
                        backgroundColor: C.bgCard,
                        borderTopColor: C.borderLight
                    }
                ],
                tabBarLabelStyle: styles.tabLabel,
                tabBarItemStyle: [
                    styles.tabItem,
                    { paddingBottom: insets.bottom > 0 ? 0 : 4 }
                ],
            })}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} />
            <Tab.Screen name="OrdersTab" component={OrderListScreen} />
            <Tab.Screen name="ProductionTab" component={StitchingProductionScreen} />
            <Tab.Screen name="MoreTab" component={MoreNavigator} />
        </Tab.Navigator>
    );
};

const StaffTabs = () => {
    const insets = useSafeAreaInsets();
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => {
                    const icons = TAB_ICONS[route.name];
                    return (
                        <View style={focused ? [styles.activeTabIcon, { backgroundColor: C.primaryMuted }] : null}>
                            <Ionicons
                                name={focused ? icons.active : icons.inactive}
                                size={focused ? 22 : 20}
                                color={focused ? C.primary : C.textMuted}
                            />
                        </View>
                    );
                },
                tabBarLabel: TAB_LABELS[route.name],
                tabBarActiveTintColor: C.primary,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        height: 60 + insets.bottom,
                        paddingBottom: insets.bottom > 0 ? insets.bottom : SIZES.sm,
                        backgroundColor: C.bgCard,
                        borderTopColor: C.borderLight
                    }
                ],
            })}
        >
            <Tab.Screen name="OrdersTab" component={OrderListScreen} />
            <Tab.Screen name="ProductionTab" component={StitchingProductionScreen} />
            <Tab.Screen name="MoreTab" component={MoreNavigator} />
        </Tab.Navigator>
    );
};

const MoreStack = createStackNavigator();

const MoreNavigator = () => (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
        <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />

        <MoreStack.Screen name="Finishing" component={FinishingScreen} />
        <MoreStack.Screen name="Shoot" component={ShootScreen} />
        <MoreStack.Screen name="Catalogue" component={CatalogueScreen} />
    </MoreStack.Navigator>
);

const MoreMenuScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const isDark = useThemeStore(s => s.isDark);
    const logout = useAuthStore((s) => s.logout);
    const C = getColors(isDark);

    const menuItems = [

        { label: 'Finishing', subtitle: 'Quality check & ready for delivery', icon: 'checkmark-done-outline', screen: 'Finishing', color: C.success },
        { label: 'Media & Shoot', subtitle: 'Product photography & social uploads', icon: 'camera-outline', screen: 'Shoot', color: C.primary },
        { label: 'Catalogue', subtitle: 'Hold, cancelled & alteration records', icon: 'albums-outline', screen: 'Catalogue', color: C.slate },
    ];

    const handleLogout = () => {
        const performLogout = () => {
            logout();
        };

        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to log out?')) {
                performLogout();
            }
        } else {
            Alert.alert(
                'Log Out',
                'Are you sure you want to log out?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log Out', style: 'destructive', onPress: performLogout },
                ]
            );
        }
    };

    return (
        <ScreenWrapper useSafeTop>
            <View style={[styles.moreContainer, { backgroundColor: C.bg }]}>
                <View style={[styles.moreHeader, { borderBottomColor: C.borderLight }]}>
                    <Text style={[styles.moreTitle, { color: C.textPrimary }]}>More</Text>
                    <Text style={[styles.moreSubtitle, { color: C.textMuted }]}>Additional modules</Text>
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.moreContent, { paddingBottom: 20 + insets.bottom }]}
                >
                    {menuItems.map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[styles.menuCard, { backgroundColor: C.bgCard, borderColor: C.borderLight }]}
                            onPress={() => navigation.navigate(item.screen)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                                <Ionicons name={item.icon} size={24} color={item.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.menuLabel, { color: C.textPrimary }]}>{item.label}</Text>
                                <Text style={[styles.menuSubtitle, { color: C.textMuted }]}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
                        </TouchableOpacity>
                    ))}



                    <TouchableOpacity
                        style={[styles.logoutCard, { backgroundColor: C.errorLight, borderColor: C.error + '40' }]}
                        onPress={handleLogout}
                        activeOpacity={0.75}
                    >
                        <View style={[styles.settingsIcon, { backgroundColor: C.error + '22' }]}>
                            <Ionicons name="log-out-outline" size={22} color={C.error} />
                        </View>
                        <Text style={[styles.menuLabel, { color: C.error, flex: 1 }]}>Log Out</Text>
                        <Ionicons name="chevron-forward" size={18} color={C.error + '80'} />
                    </TouchableOpacity>

                    <View style={styles.appInfo}>
                        <View style={[styles.appLogoWrap, { backgroundColor: C.primaryMuted }]}>
                            <Ionicons name="diamond-outline" size={28} color={C.primary} />
                        </View>
                        <Text style={[styles.appName, { color: C.textPrimary }]}>Mellinam Designer Studio</Text>
                        <Text style={[styles.appVersion, { color: C.textMuted }]}>Version 1.0.0</Text>
                        <Text style={[styles.appTagline, { color: C.textMuted }]}>Excellence in every stitch</Text>
                    </View>
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

const AuthLoadingScreen = () => {
    const isDark = useThemeStore(s => s.isDark);
    const C = getColors(isDark);

    return (
        <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: C.primaryMuted,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: SIZES.xl,
            }}>
                <Ionicons name="diamond-outline" size={44} color={C.primary} />
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
                {[0, 1, 2].map((i) => (
                    <View key={i} style={{
                        width: 6, height: 6, borderRadius: 3,
                        backgroundColor: C.primary,
                        opacity: 0.4 + i * 0.3,
                    }} />
                ))}
            </View>
        </View>
    );
};

const AppNavigator = () => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const role = useAuthStore((s) => s.role);
    const isInitializing = useAuthStore((s) => s.isInitializing);
    const initSession = useAuthStore((s) => s.initSession);

    React.useEffect(() => {
        initSession();
    }, []);

    // Show branded loading screen while checking persisted session.
    // Prevents the Login screen from flashing before auth state is resolved.
    if (isInitializing) {
        return <AuthLoadingScreen />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // AUTHENTICATION FLOW
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : role === 'admin' ? (
                    // ADMIN FLOW
                    <Stack.Screen name="AdminRoot" component={AdminTabs} />
                ) : role === 'staff' ? (
                    // STAFF FLOW
                    <Stack.Screen name="StaffRoot" component={StaffTabs} />
                ) : (
                    // FALLBACK (If authenticated but no valid role matched)
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}

                {/* Common Stack Screens (Shared by both roles) */}
                {isAuthenticated && (role === 'admin' || role === 'staff') && (
                    <>
                        <Stack.Screen
                            name="OrderEntry"
                            component={OrderEntryScreen}
                            options={{ presentation: 'modal' }}
                        />
                        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
                        <Stack.Screen name="StitchingProduction" component={StitchingProductionScreen} />

                        <Stack.Screen name="Finishing" component={FinishingScreen} />
                        <Stack.Screen name="Shoot" component={ShootScreen} />
                        <Stack.Screen name="Catalogue" component={CatalogueScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        borderTopWidth: 1,
        paddingTop: SIZES.xs,
        ...SHADOWS.small,
    },
    tabLabel: {
        fontSize: 10,
        ...FONTS.medium,
        marginTop: 2,
    },
    tabItem: {
        paddingTop: 4,
    },
    activeTabIcon: {
        borderRadius: SIZES.radiusFull,
        padding: 6,
        marginBottom: -4,
    },
    moreContainer: {
        flex: 1,
    },
    moreHeader: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.lg,
        paddingBottom: SIZES.md,
        borderBottomWidth: 1,
        marginBottom: SIZES.sm,
    },
    moreTitle: {
        fontSize: SIZES.heading,
        ...FONTS.bold,
        letterSpacing: -0.5,
    },
    moreSubtitle: {
        fontSize: SIZES.small,
        ...FONTS.regular,
        marginTop: 2,
    },
    moreContent: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.sm,
    },
    menuCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        borderWidth: 1,
        ...SHADOWS.small,
    },
    settingsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        borderWidth: 1,
        ...SHADOWS.small,
    },
    settingsIcon: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    logoutCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: SIZES.radiusLg,
        padding: SIZES.base,
        marginBottom: SIZES.md,
        borderWidth: 1,
        ...SHADOWS.small,
    },
    menuIcon: {
        width: 48,
        height: 48,
        borderRadius: SIZES.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.md,
    },
    menuLabel: {
        fontSize: SIZES.bodyLg,
        ...FONTS.semiBold,
    },
    menuSubtitle: {
        fontSize: SIZES.small,
        ...FONTS.regular,
        marginTop: 2,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: SIZES.xxl,
        paddingVertical: SIZES.xl,
    },
    appLogoWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    appName: {
        fontSize: SIZES.subtitle,
        ...FONTS.bold,
    },
    appVersion: {
        fontSize: SIZES.caption,
        ...FONTS.regular,
        marginTop: 4,
    },
    appTagline: {
        fontSize: SIZES.small,
        ...FONTS.regular,
        marginTop: SIZES.sm,
        fontStyle: 'italic',
    },
});

export default AppNavigator;
