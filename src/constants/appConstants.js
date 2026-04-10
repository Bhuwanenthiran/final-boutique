// src/constants/appConstants.js

export const DESIGN_TEMPLATES = {
    blousePatterns: [
        { id: 'bp1', name: 'Neck Pattern 1', image: require('../../assets/designs/blouse_1.jpg'), category: 'blousePattern' },
        { id: 'bp2', name: 'Neck Pattern 2', image: require('../../assets/designs/blouse_2.jpg'), category: 'blousePattern' },
        { id: 'bp3', name: 'Neck Pattern 3', image: require('../../assets/designs/blouse_3.jpg'), category: 'blousePattern' },
    ],
    frontNeckDesigns: [
        { id: 'fn1', name: 'Front Neck 1', image: require('../../assets/designs/front_neck_1.jpg'), category: 'frontNeck' },
        { id: 'fn2', name: 'Front Neck 2', image: require('../../assets/designs/front_neck_2.jpg'), category: 'frontNeck' },
        { id: 'fn3', name: 'Front Neck 3', image: require('../../assets/designs/front_neck_3.jpg'), category: 'frontNeck' },
    ],
    backNeckDesigns: [
        { id: 'bn1', name: 'Back Neck 1', image: require('../../assets/designs/back_neck_1.jpg'), category: 'backNeck' },
        { id: 'bn2', name: 'Back Neck 2', image: require('../../assets/designs/back_neck_2.jpg'), category: 'backNeck' },
        { id: 'bn3', name: 'Back Neck 3', image: require('../../assets/designs/back_neck_3.jpg'), category: 'backNeck' },
    ],
    aariDesigns: [
        { id: 'ad1', name: 'Aari Pattern 1', image: require('../../assets/designs/aari_1.jpg'), category: 'aariDesign' },
        { id: 'ad2', name: 'Aari Pattern 2', image: require('../../assets/designs/aari_2.jpg'), category: 'aariDesign' },
        { id: 'ad3', name: 'Aari Pattern 3', image: require('../../assets/designs/aari_3.jpg'), category: 'aariDesign' },
    ],
};

export const MEASUREMENT_FIELDS = [
    'length', 'shoulder', 'sleeveLength', 'sleeveFit', 'armhole',
    'biceps', 'bust', 'upperChest', 'hip', 'frontLength',
    'dart', 'frontNeckDeep', 'backNeckDeep',
];
