import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../../theme';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.sm,
        paddingBottom: SIZES.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    headerTitle: {
        fontSize: SIZES.subtitle,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    draftBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryMuted,
        paddingHorizontal: SIZES.md,
        paddingVertical: SIZES.sm,
        borderRadius: SIZES.radiusFull,
    },
    draftText: {
        fontSize: SIZES.small,
        color: COLORS.primary,
        ...FONTS.medium,
        marginLeft: 4,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
    },
    progressStep: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    progressDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    progressDotActive: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.golden,
    },
    progressDotCompleted: {
        backgroundColor: COLORS.success,
    },
    progressNum: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.semiBold,
    },
    progressLabel: {
        fontSize: 9,
        color: COLORS.textMuted,
        ...FONTS.medium,
        marginTop: 4,
        textAlign: 'center',
    },
    progressLabelActive: {
        color: COLORS.primary,
        ...FONTS.semiBold,
    },
    progressLine: {
        position: 'absolute',
        top: 13,
        left: '60%',
        right: '-40%',
        height: 2,
        backgroundColor: COLORS.border,
        zIndex: 0,
    },
    progressLineCompleted: {
        backgroundColor: COLORS.success,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        paddingHorizontal: SIZES.lg,
        paddingTop: SIZES.md,
    },
    stepTitle: {
        fontSize: SIZES.title,
        color: COLORS.textPrimary,
        ...FONTS.bold,
        marginBottom: SIZES.sm,
    },
    stepDescription: {
        fontSize: SIZES.body,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginBottom: SIZES.lg,
        lineHeight: 20,
    },
    dividerWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SIZES.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        fontSize: SIZES.caption,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginHorizontal: SIZES.md,
    },
    galleryLabel: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.medium,
        marginTop: SIZES.md,
        marginBottom: SIZES.sm,
    },
    galleryRow: {
        paddingVertical: SIZES.sm,
    },
    designCard: {
        width: 110,
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginRight: SIZES.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
    },
    designCardSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryMuted,
    },
    designImagePlaceholder: {
        width: 56,
        height: 56,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.sm,
    },
    designName: {
        fontSize: SIZES.caption,
        color: COLORS.textPrimary,
        ...FONTS.medium,
        textAlign: 'center',
    },
    designCategory: {
        fontSize: 10,
        color: COLORS.textMuted,
        ...FONTS.regular,
        marginTop: 2,
    },
    selectedCheck: {
        position: 'absolute',
        top: 6,
        right: 6,
    },
    measurementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SIZES.xs,
    },
    measurementItem: {
        width: '50%',
        paddingHorizontal: SIZES.xs,
    },
    paymentCard: {
        backgroundColor: COLORS.bgElevated,
        marginTop: SIZES.sm,
        borderColor: COLORS.primarySoft,
        borderWidth: 1,
    },
    paymentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.md,
    },
    paymentTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
        marginLeft: SIZES.sm,
    },
    balanceSummary: {
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.md,
        marginTop: SIZES.md,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SIZES.sm,
    },
    balanceLabel: {
        fontSize: SIZES.body,
        color: COLORS.textSecondary,
        ...FONTS.regular,
    },
    balanceValue: {
        fontSize: SIZES.body,
        color: COLORS.textPrimary,
        ...FONTS.medium,
    },
    balanceFinal: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SIZES.sm,
        marginBottom: 0,
    },
    balanceFinalLabel: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    balanceFinalValue: {
        fontSize: SIZES.bodyLg,
        color: COLORS.primary,
        ...FONTS.bold,
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: SIZES.lg,
        paddingVertical: SIZES.md,
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
        ...SHADOWS.medium,
    },

    // ── Design Category Sections ──────────────────────────────────────────
    designSection: {
        marginTop: SIZES.lg,
        marginBottom: SIZES.sm,
    },
    designSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SIZES.sm,
    },
    designSectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    designSectionTitle: {
        fontSize: SIZES.bodyLg,
        color: COLORS.textPrimary,
        ...FONTS.semiBold,
    },
    designSectionBadge: {
        fontSize: SIZES.caption,
        paddingHorizontal: SIZES.sm,
        paddingVertical: 3,
        borderRadius: SIZES.radiusFull,
        overflow: 'hidden',
        ...FONTS.medium,
    },
    designSectionBadgeSelected: {
        backgroundColor: COLORS.primaryMuted,
        color: COLORS.primary,
    },
    designSectionBadgeRequired: {
        backgroundColor: COLORS.bgElevated,
        color: COLORS.textMuted,
    },

    // ── Design Grid ───────────────────────────────────────────────────────
    designGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -SIZES.xs,
    },
    designGridCard: {
        width: `${100 / 3}%`,
        paddingHorizontal: SIZES.xs,
        marginBottom: SIZES.sm,
        alignItems: 'center',
        position: 'relative',
    },
    designGridCardInner: {
        width: '100%',
        backgroundColor: COLORS.bgCard,
        borderRadius: SIZES.radiusMd,
        padding: SIZES.sm,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.borderLight,
    },
    designGridCardSelectedInner: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryMuted,
    },
    designGridImage: {
        width: 56,
        height: 56,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SIZES.xs,
        overflow: 'hidden',
    },
    designGridName: {
        fontSize: 10,
        color: COLORS.textPrimary,
        ...FONTS.medium,
        textAlign: 'center',
        lineHeight: 14,
    },
    designGridCheck: {
        position: 'absolute',
        top: 4,
        right: 8,
    },
});
