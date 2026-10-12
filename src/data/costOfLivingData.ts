import {
  RegionalCostData,
  LifestylePreset,
  LifestylePresetKey,
  CostSubLayerKey,
  CostDimensionKey,
  BudgetSimulatorInput,
  BudgetSimulatorOutput,
  RelocationPlan,
} from '../types';

export const PROTOTYPE_DEMO_TAG = '原型演示数据 · Prototype Demo Data';

export const COST_SUBLAYERS_CONFIG: {
  key: CostSubLayerKey;
  label: string;
  iconName: string;
  description: string;
  unit: string;
}[] = [
  { key: 'cost_index', label: '生活成本', iconName: 'CircleDollarSign', description: '综合生活成本指数（全国平均基准=50）', unit: '指数 (0-100)' },
  { key: 'income', label: '收入水平', iconName: 'TrendingUp', description: '全职社平月度税后净收入', unit: '元/月' },
  { key: 'rent', label: '房租水平', iconName: 'Home', description: '普通一居/两居典型月租金区间', unit: '元/月' },
  { key: 'healthcare', label: '医疗保障', iconName: 'HeartPulse', description: '三甲/专科可及性与医保自费水平', unit: '保障指数' },
  { key: 'education', label: '教育资源', iconName: 'GraduationCap', description: '基础公办学位与优质高中可及度', unit: '资源指数' },
  { key: 'transport', label: '交通出行', iconName: 'Bus', description: '通勤耗时与城际跨市通达成本', unit: '出行综合分' },
  { key: 'livability', label: '宜居要素', iconName: 'Sparkles', description: '生态环境、物价温和度与社区便利', unit: '宜居总评' },
];

export const LIFESTYLE_PRESETS: Record<LifestylePresetKey, LifestylePreset> = {
  single_basic: {
    key: 'single_basic',
    name: '单人基础版',
    description: '单身合租/小开间，注重极简节流与基础刚性生活保障',
    targetHouseholdSize: 1,
    householdSize: 1,
    housingType: 'rent_shared',
    commuteType: 'public_transit',
    diningType: 'cook_mostly',
    hasChildEducation: false,
    educationType: 'none',
    hasElderCare: false,
    defaultIncome: 4500,
    monthlyNetIncome: 4500,
    baseMultiplier: 0.65,
  },
  single_comfortable: {
    key: 'single_comfortable',
    name: '单人舒适版',
    description: '单身独立整租一居室，适度外卖、健身、社交娱乐',
    targetHouseholdSize: 1,
    householdSize: 1,
    housingType: 'rent_1bed',
    commuteType: 'public_transit',
    diningType: 'half_half',
    hasChildEducation: false,
    educationType: 'none',
    hasElderCare: false,
    defaultIncome: 7000,
    monthlyNetIncome: 7000,
    baseMultiplier: 1.0,
  },
  couple: {
    key: 'couple',
    name: '二人世界',
    description: '年轻情侣或丁克双职工，租住品质两居，日常买菜与周末约会',
    targetHouseholdSize: 2,
    householdSize: 2,
    housingType: 'rent_2bed',
    commuteType: 'public_transit',
    diningType: 'half_half',
    hasChildEducation: false,
    educationType: 'none',
    hasElderCare: false,
    defaultIncome: 12000,
    monthlyNetIncome: 12000,
    baseMultiplier: 1.45,
  },
  family_three: {
    key: 'family_three',
    name: '三口之家',
    description: '学龄/学前儿童家庭，自住三居，关注优质学区与课外辅导',
    targetHouseholdSize: 3,
    householdSize: 3,
    housingType: 'rent_3bed',
    commuteType: 'private_car',
    diningType: 'cook_mostly',
    hasChildEducation: true,
    educationType: 'public_school',
    hasElderCare: false,
    defaultIncome: 15000,
    monthlyNetIncome: 15000,
    baseMultiplier: 2.1,
  },
  family_four: {
    key: 'family_four',
    name: '四口之家',
    description: '二孩家庭或三代同堂，刚性关注两套学龄教育与家庭大宗开支',
    targetHouseholdSize: 4,
    householdSize: 4,
    housingType: 'rent_3bed',
    commuteType: 'private_car',
    diningType: 'cook_mostly',
    hasChildEducation: true,
    educationType: 'public_school',
    hasElderCare: true,
    defaultIncome: 20000,
    monthlyNetIncome: 20000,
    baseMultiplier: 2.7,
  },
  student: {
    key: 'student',
    name: '在校学生',
    description: '校内宿舍或近校合租，食堂就餐，零散日常自习与文印开销',
    targetHouseholdSize: 1,
    householdSize: 1,
    housingType: 'rent_shared',
    commuteType: 'walk_bike',
    diningType: 'cook_mostly',
    hasChildEducation: false,
    educationType: 'none',
    hasElderCare: false,
    defaultIncome: 2200,
    monthlyNetIncome: 2200,
    baseMultiplier: 0.45,
  },
  retired: {
    key: 'retired',
    name: '银发退休',
    description: '自有住房或生态康养租住，医疗药品偏高，日常食品自炊',
    targetHouseholdSize: 2,
    householdSize: 2,
    housingType: 'own_paid_off',
    commuteType: 'walk_bike',
    diningType: 'cook_mostly',
    hasChildEducation: false,
    educationType: 'none',
    hasElderCare: true,
    defaultIncome: 6500,
    monthlyNetIncome: 6500,
    baseMultiplier: 0.95,
  },
  custom: {
    key: 'custom',
    name: '自定义预算',
    description: '用户自主调配各维度偏好与收支模型',
    targetHouseholdSize: 1,
    householdSize: 1,
    housingType: 'rent_1bed',
    commuteType: 'public_transit',
    diningType: 'half_half',
    hasChildEducation: false,
    educationType: 'none',
    hasElderCare: false,
    defaultIncome: 8000,
    monthlyNetIncome: 8000,
    baseMultiplier: 1.0,
  },
};

export const DEFAULT_INDEX_WEIGHTS: Record<string, number> = {
  housing: 25,
  food: 12,
  transportation: 10,
  healthcare: 10,
  education: 10,
  employment: 15,
  publicServices: 8,
  environment: 5,
  leisure: 5,
};

export const WEIGHT_PRESET_MODES: {
  id: string;
  name: string;
  description: string;
  weights: Record<string, number>;
}[] = [
  {
    id: 'balanced',
    name: '均衡模式 (默认)',
    description: '住房25% + 就业15% + 食品12% + 医教各10%，全面综合平衡',
    weights: { ...DEFAULT_INDEX_WEIGHTS },
  },
  {
    id: 'low_cost',
    name: '低成本优先',
    description: '住房升至35%，食品18%，交通12%，聚焦刚性节约生存底线',
    weights: {
      housing: 35,
      food: 18,
      transportation: 12,
      healthcare: 8,
      education: 5,
      employment: 8,
      publicServices: 6,
      environment: 4,
      leisure: 4,
    },
  },
  {
    id: 'employment',
    name: '就业机遇优先',
    description: '就业与薪资升至35%，公共服务15%，降低对居住成本的敏感度',
    weights: {
      housing: 15,
      food: 8,
      transportation: 10,
      healthcare: 6,
      education: 6,
      employment: 35,
      publicServices: 12,
      environment: 4,
      leisure: 4,
    },
  },
  {
    id: 'family_education',
    name: '育儿教育优先',
    description: '教育与托育权重升至30%，医疗15%，居住20%，保障下一代成长',
    weights: {
      housing: 20,
      food: 10,
      transportation: 6,
      healthcare: 15,
      education: 30,
      employment: 8,
      publicServices: 5,
      environment: 4,
      leisure: 2,
    },
  },
  {
    id: 'retirement',
    name: '生态康养优先',
    description: '医疗健康升至28%，环境安全升至22%，生活便利15%，适合退休长住',
    weights: {
      housing: 16,
      food: 10,
      transportation: 6,
      healthcare: 28,
      education: 2,
      employment: 4,
      publicServices: 8,
      environment: 22,
      leisure: 4,
    },
  },
];

// 区域完整演示数据（基础规范字典，每个区域仅保留唯一规范条目）
const RAW_REGIONAL_COST_DATABASE: Record<string, RegionalCostData> = {
  // 1. 甘肃省 (省层级)
  gansu: {
    id: 'gansu',
    name: '甘肃省',
    shortName: '甘肃',
    level: 'province',
    parentPath: '中国',
    provinceName: '甘肃省',
    lat: 36.0618,
    lng: 103.8322,
    hasData: true,
    overallCostIndex: 56,
    incomeOpportunityIndex: 48,
    healthcareIndex: 58,
    educationIndex: 54,
    transportIndex: 57,
    livabilityIndex: 64,
    environmentIndex: 68,
    monthlyBasicRange: { low: 2200, typical: 3200, high: 4600, unit: '元/月' },
    annualBasicRange: { low: 26400, typical: 38400, high: 55200, unit: '元/年' },
    afterTaxIncomeRange: { low: 3100, typical: 4800, high: 7500, unit: '元/月' },
    disposableIncomeRange: { low: 900, typical: 1600, high: 2900, unit: '元/月' },
    housingBurdenRatio: 0.23,
    suitableProfiles: ['省内体制就业', '能源化工人才', '低生活压力安居', '高校科教人才'],
    mainAdvantages: ['全省平均居住与餐饮成本平易近人', '兰州集中优质三甲与兰大科教资源', '气候干燥凉爽夏季无闷热感'],
    mainCostPressures: ['地级市与县级优质医疗教育资源梯次差距明显', '冬季集中供暖期能源开销上升', '优质高薪民企就业岗位供给偏少'],
    updateDate: '2026-08-15',
    source: '西北地区城镇居民生活收支社会调查采样库',
    confidenceLevel: 'A',
    sampleSize: '全省14市州 8,420 样本家庭',
    statisticalPeriod: '2025Q3 - 2026Q2 滚动统计',
    seasonalVariationWarning: '冬季（11月-次年3月）需承担法定采暖季集中供暖费用（约22-26元/㎡），总支出略有上升',
    isPrototypeDemo: true,
    dimensions: createStandardDimensions({
      baseRent: { low: 800, typical: 1400, high: 2200 },
      baseFood: { low: 800, typical: 1100, high: 1600 },
      baseUtilities: { low: 180, typical: 320, high: 500 },
      baseTransport: { low: 120, typical: 220, high: 450 },
      baseMedical: { low: 100, typical: 240, high: 600 },
      baseEducation: { low: 200, typical: 600, high: 1500 },
      baseIncome: { low: 3100, typical: 4800, high: 7500 },
      regionPrefix: '甘肃全省综合',
    }),
  },

  // 2. 兰州市 (地级市层级)
  lanzhou: {
    id: 'lanzhou',
    name: '兰州市',
    shortName: '兰州',
    level: 'city',
    parentPath: '中国 · 甘肃省',
    provinceName: '甘肃省',
    cityName: '兰州市',
    lat: 36.0611,
    lng: 103.8343,
    hasData: true,
    overallCostIndex: 62,
    incomeOpportunityIndex: 58,
    healthcareIndex: 72,
    educationIndex: 68,
    transportIndex: 66,
    livabilityIndex: 67,
    environmentIndex: 62,
    monthlyBasicRange: { low: 2600, typical: 3800, high: 5400, unit: '元/月' },
    annualBasicRange: { low: 31200, typical: 45600, high: 64800, unit: '元/年' },
    afterTaxIncomeRange: { low: 3600, typical: 5500, high: 9200, unit: '元/月' },
    disposableIncomeRange: { low: 1000, typical: 1700, high: 3800, unit: '元/月' },
    housingBurdenRatio: 0.27,
    suitableProfiles: ['省会综合白领', '三甲医院与高校教职', '西北商贸物流骨干', '返乡青年创业安居'],
    mainAdvantages: ['全省最密集的9家三甲医院与兰州大学等双一流高校', '地铁1/2号线贯通东西狭长核心城区', '牛肉面与瓜果饮食极为丰俭由人'],
    mainCostPressures: ['城关与七里河中心区房租相对较高', '狭长河谷地形导致早晚高峰重点路段拥堵', '冬季雾霾与沙尘天数偶发'],
    updateDate: '2026-08-15',
    source: '兰州市核心区生活成本常态化观测样本',
    confidenceLevel: 'A',
    sampleSize: '城关/七里河/安宁/西固 4,280 样本数据点',
    statisticalPeriod: '2025Q3 - 2026Q2 滚动统计',
    seasonalVariationWarning: '供暖季为当年11月1日至次年3月31日，居民采暖费统一执行25元/㎡/季度',
    isPrototypeDemo: true,
    dimensions: createStandardDimensions({
      baseRent: { low: 1100, typical: 1800, high: 2800 },
      baseFood: { low: 900, typical: 1300, high: 1900 },
      baseUtilities: { low: 200, typical: 360, high: 550 },
      baseTransport: { low: 150, typical: 280, high: 520 },
      baseMedical: { low: 120, typical: 280, high: 680 },
      baseEducation: { low: 300, typical: 800, high: 2000 },
      baseIncome: { low: 3600, typical: 5500, high: 9200 },
      regionPrefix: '兰州主城区',
    }),
  },

  // 3. 榆中县 (县层级 - 隶属兰州市)
  yuzhong: {
    id: 'yuzhong',
    name: '榆中县',
    shortName: '榆中',
    level: 'county',
    parentPath: '中国 · 甘肃省 · 兰州市',
    provinceName: '甘肃省',
    cityName: '兰州市',
    countyName: '榆中县',
    lat: 35.8455,
    lng: 104.1147,
    hasData: true,
    overallCostIndex: 46,
    incomeOpportunityIndex: 42,
    healthcareIndex: 56,
    educationIndex: 52,
    transportIndex: 58,
    livabilityIndex: 72,
    environmentIndex: 76,
    monthlyBasicRange: { low: 1800, typical: 2700, high: 3900, unit: '元/月' },
    annualBasicRange: { low: 21600, typical: 32400, high: 46800, unit: '元/年' },
    afterTaxIncomeRange: { low: 2900, typical: 4300, high: 6800, unit: '元/月' },
    disposableIncomeRange: { low: 1100, typical: 1600, high: 2900, unit: '元/月' },
    housingBurdenRatio: 0.19,
    suitableProfiles: ['兰州大学榆中校区师生', '远程办公独立创作者', '低成本考研考公备考族', '兰州近郊生态安老家庭'],
    mainAdvantages: ['房租仅为主城区的1/3，电梯精装两居仅需800-1200元/月', '空气纯净背靠兴隆山国家级自然保护区，夏季清凉', '兰大榆中校区高素质学术环境辐射效应'],
    mainCostPressures: ['县域高薪民营企业较少，本地就业岗位以体制、教职、高原夏菜农业为主', '重特大疾病需40分钟车程前往兰州市区三甲就医', '晚间外卖与家政快修响应度不如主城区'],
    updateDate: '2026-08-15',
    source: '榆中县城及夏官营大学城实地采价调研报告',
    confidenceLevel: 'A',
    sampleSize: '县城核心区及大学城 1,650 家居样本',
    statisticalPeriod: '2025Q3 - 2026Q2 滚动统计',
    seasonalVariationWarning: '冬季兴隆山周边气温较兰州市区低3-5℃，需保证室内采暖',
    isPrototypeDemo: true,
    dimensions: createStandardDimensions({
      baseRent: { low: 600, typical: 950, high: 1500 },
      baseFood: { low: 650, typical: 950, high: 1400 },
      baseUtilities: { low: 160, typical: 280, high: 450 },
      baseTransport: { low: 100, typical: 200, high: 380 },
      baseMedical: { low: 80, typical: 180, high: 450 },
      baseEducation: { low: 180, typical: 500, high: 1200 },
      baseIncome: { low: 2900, typical: 4300, high: 6800 },
      regionPrefix: '榆中县域',
    }),
    countyIndicators: {
      rentAndHousePriceSummary: '县城均价约4,800-6,200元/㎡，租金单间400-600元，整租两居800-1,200元/月',
      localJobAvailability: '岗位集中于兰大教辅、高原夏菜现代冷链物流、县属事业单位与中小学',
      industryConcentration: ['国家级高原夏菜现代农业园', '高等教育与科研服务', '兴隆山文化生态旅游'],
      deliveryAndHousekeepingCoverage: '主流美团/饿了么在县城及夏官营全覆盖，保洁起步价35元/小时',
      heatingAndCoolingCosts: '冬季集中供暖23元/㎡/季度，夏季无需空调开启，仅需自然通风',
      travelTimeToHigherHospitals: '经兰西高速或312国道直达兰州大学第一/第二医院约38-45分钟',
      highSchoolAndVocationalAccess: '榆中一中为省级示范性高中，近三年一本上线率保持全省县域前列',
      crossCityShoppingCosts: '乘城际公交901/902路或高铁18分钟直达兰州东方红广场，往返车费约12-24元',
      returnHomeTransportCosts: '前往兰州中川国际机场车程约70分钟（或高铁中转），春运返乡便捷度高',
      retirementSuitabilityScore: 84,
      retirementSuitabilityNote: '负氧离子丰沛，夏季均温22℃避暑首选；但需注意高龄老人重症转诊车程',
      remoteWorkSuitabilityScore: 88,
      remoteWorkSuitabilityNote: '光纤入户千兆宽带，生活开销极低，静谧安宁非常适合内容创作者与程序员',
      outOfCountyMedicalForSevere: '重特大疑难杂症转诊省直三甲医疗比例约占32%，异地医保联网结算直接报销',
      accessToSpecialistHealthcare: '榆中县第一人民医院达二甲水准，省人民医院定期驻点专家门诊',
      accessToHigherEducation: '坐拥兰州大学榆中校区、西北民族大学榆中校区，图书馆与学术讲座资源丰沛',
      costOfTravelingToCityCenter: '901城际大巴单程4元，城际网约拼车单程20-25元/人',
    },
  },

  // 4. 四川省 (省层级)
  sichuan: {
    id: 'sichuan',
    name: '四川省',
    shortName: '四川',
    level: 'province',
    parentPath: '中国',
    provinceName: '四川省',
    lat: 30.5728,
    lng: 104.0668,
    hasData: true,
    overallCostIndex: 68,
    incomeOpportunityIndex: 67,
    healthcareIndex: 76,
    educationIndex: 73,
    transportIndex: 75,
    livabilityIndex: 82,
    environmentIndex: 78,
    monthlyBasicRange: { low: 2700, typical: 4100, high: 6200, unit: '元/月' },
    annualBasicRange: { low: 32400, typical: 49200, high: 74400, unit: '元/年' },
    afterTaxIncomeRange: { low: 3800, typical: 6200, high: 11000, unit: '元/月' },
    disposableIncomeRange: { low: 1100, typical: 2100, high: 4800, unit: '元/月' },
    housingBurdenRatio: 0.28,
    suitableProfiles: ['数字经济与软件研发', '文创传媒与泛娱乐', '休闲养老安居', '高端电子信息制造'],
    mainAdvantages: ['华西医院辐射西南最高水准医疗体系', '天府之国物产丰饶生活气息浓郁', '成渝双城经济圈发展动能强劲'],
    mainCostPressures: ['成都核心区居住与育儿支出偏高', '冬季盆地静稳天气日照偏少', '夏季极端高温期空调用电负荷大'],
    updateDate: '2026-08-15',
    source: '四川全省居民生活消费大样本监测网络',
    confidenceLevel: 'A',
    sampleSize: '全省21市州 12,300 样本户',
    statisticalPeriod: '2025Q3 - 2026Q2 滚动统计',
    seasonalVariationWarning: '7-8月盛夏高温持续期用电费用阶梯跳档，需额外预算防暑降温费',
    isPrototypeDemo: true,
    dimensions: createStandardDimensions({
      baseRent: { low: 1200, typical: 1900, high: 3200 },
      baseFood: { low: 950, typical: 1400, high: 2200 },
      baseUtilities: { low: 190, typical: 340, high: 580 },
      baseTransport: { low: 160, typical: 300, high: 580 },
      baseMedical: { low: 130, typical: 290, high: 720 },
      baseEducation: { low: 350, typical: 900, high: 2400 },
      baseIncome: { low: 3800, typical: 6200, high: 11000 },
      regionPrefix: '四川全省综合',
    }),
  },

  // 5. 成都市 (地级市层级)
  chengdu: {
    id: 'chengdu',
    name: '成都市',
    shortName: '成都',
    level: 'city',
    parentPath: '中国 · 四川省',
    provinceName: '四川省',
    cityName: '成都市',
    lat: 30.6586,
    lng: 104.0648,
    hasData: true,
    overallCostIndex: 76,
    incomeOpportunityIndex: 79,
    healthcareIndex: 88,
    educationIndex: 82,
    transportIndex: 85,
    livabilityIndex: 86,
    environmentIndex: 74,
    monthlyBasicRange: { low: 3300, typical: 5100, high: 7800, unit: '元/月' },
    annualBasicRange: { low: 39600, typical: 61200, high: 93600, unit: '元/年' },
    afterTaxIncomeRange: { low: 4500, typical: 7800, high: 14500, unit: '元/月' },
    disposableIncomeRange: { low: 1200, typical: 2700, high: 6700, unit: '元/月' },
    housingBurdenRatio: 0.31,
    suitableProfiles: ['互联网与游戏研发骨干', '金融与专业服务白领', '高净值品质生活追求者', '西南大区商务运营'],
    mainAdvantages: ['四川大学华西医院等顶尖三甲医疗集群', '多达14条轨道交通超大网络', '餐饮社交娱乐生活极其丰富多元'],
    mainCostPressures: ['天府新区及锦江核心区租购房开销持续走高', '优质幼小初教育学区房竞争激烈', '职场加班与职场内卷压力高于二三线'],
    updateDate: '2026-08-15',
    source: '成都市统计年报及新一线城市生活指数研报',
    confidenceLevel: 'A',
    sampleSize: '主城五区及高新天府 6,800 组家庭样本',
    statisticalPeriod: '2025Q3 - 2026Q2 滚动统计',
    seasonalVariationWarning: '7-8月盛夏极端高温空调用电高峰期电费环比上升40%-70%',
    isPrototypeDemo: true,
    dimensions: createStandardDimensions({
      baseRent: { low: 1600, typical: 2600, high: 4500 },
      baseFood: { low: 1100, typical: 1700, high: 2800 },
      baseUtilities: { low: 220, typical: 410, high: 700 },
      baseTransport: { low: 200, typical: 380, high: 720 },
      baseMedical: { low: 160, typical: 350, high: 890 },
      baseEducation: { low: 500, typical: 1400, high: 3600 },
      baseIncome: { low: 4500, typical: 7800, high: 14500 },
      regionPrefix: '成都核心区',
    }),
  },

  // 6. 都江堰市 (县级市 - 隶属成都市)
  dujiangyan: {
    id: 'dujiangyan',
    name: '都江堰市',
    shortName: '都江堰',
    level: 'county',
    parentPath: '中国 · 四川省 · 成都市',
    provinceName: '四川省',
    cityName: '成都市',
    countyName: '都江堰市',
    lat: 30.9882,
    lng: 103.6193,
    hasData: true,
    overallCostIndex: 54,
    incomeOpportunityIndex: 51,
    healthcareIndex: 68,
    educationIndex: 62,
    transportIndex: 72,
    livabilityIndex: 91,
    environmentIndex: 93,
    monthlyBasicRange: { low: 2100, typical: 3300, high: 4900, unit: '元/月' },
    annualBasicRange: { low: 25200, typical: 39600, high: 58800, unit: '元/年' },
    afterTaxIncomeRange: { low: 3400, typical: 5100, high: 8200, unit: '元/月' },
    disposableIncomeRange: { low: 1300, typical: 1800, high: 3300, unit: '元/月' },
    housingBurdenRatio: 0.22,
    suitableProfiles: ['高品质生态养老旅居', '青城山旅居数字游民', '文旅民宿与自媒体主理人', '成都通勤高铁候鸟族'],
    mainAdvantages: ['青城山-都江堰世界双遗产，空气与水质常年全川顶尖', '成灌快铁最快19分钟直达成都犀浦站无缝换乘地铁2号线', '电梯洋房月租仅1200-1800元，生活节奏舒适从容'],
    mainCostPressures: ['本地重度工业与大型互联网大厂偏少', '旅游旺季部分景区周边餐饮物价略有浮动', '重疾三甲专科需依赖快铁前往成都主城华西医院'],
    updateDate: '2026-08-15',
    source: '成都市都江堰文旅生态居住成本专题追踪',
    confidenceLevel: 'A',
    sampleSize: '灌口/幸福/青城山镇 2,140 样本户',
    statisticalPeriod: '2025Q3 - 2026Q2 滚动统计',
    seasonalVariationWarning: '4-10月避暑旅游旺季青城山沿线短租及餐饮价格较淡季上浮15%-25%',
    isPrototypeDemo: true,
    dimensions: createStandardDimensions({
      baseRent: { low: 800, typical: 1350, high: 2200 },
      baseFood: { low: 780, typical: 1180, high: 1750 },
      baseUtilities: { low: 170, typical: 300, high: 500 },
      baseTransport: { low: 140, typical: 260, high: 490 },
      baseMedical: { low: 110, typical: 230, high: 580 },
      baseEducation: { low: 260, typical: 680, high: 1650 },
      baseIncome: { low: 3400, typical: 5100, high: 8200 },
      regionPrefix: '都江堰市域',
    }),
    countyIndicators: {
      rentAndHousePriceSummary: '市区新房均价约7,500-9,800元/㎡，租金两居电梯房1,100-1,600元/月',
      localJobAvailability: '岗位集中于世界文旅演艺、康养度假、中高端特色民宿与成都市区远程办公',
      industryConcentration: ['世界文化与自然双遗产文旅', '道医与现代健康医养', '天府绿道生态农业'],
      deliveryAndHousekeepingCoverage: '市区及主要镇街美团饿了么无死角配送，家政上门服务便利度极佳',
      heatingAndCoolingCosts: '夏季天然避暑胜地几乎无需开空调，冬季潮湿建议使用地暖或电热毯（月均300元）',
      travelTimeToHigherHospitals: '乘坐成灌快铁19分钟到达犀浦，转乘地铁直达川大华西医院约45-55分钟',
      highSchoolAndVocationalAccess: '都江堰中学为四川省一级示范性普通高中，教育质量扎实',
      crossCityShoppingCosts: '成灌快铁票价10-15元，日均开行逾40对车次，实现半小时同城生活圈',
      returnHomeTransportCosts: '经成灌高速直达成都双流机场约55分钟，天府国际机场约80分钟',
      retirementSuitabilityScore: 94,
      retirementSuitabilityNote: '中国长寿之乡，负氧离子高达25,000个/cm³，水质纯净甘甜，西南第一梯队康养圣地',
      remoteWorkSuitabilityScore: 92,
      remoteWorkSuitabilityNote: '青城山麓咖啡厅林立，文青氛围浓郁，快铁直通成都主城，数字游民核心目的地',
      outOfCountyMedicalForSevere: '都江堰市人民医院为三级综合医院，重症直通成都市区华西绿色通道',
      accessToSpecialistHealthcare: '具备中西医结合康养与老年病特色专科，常规就诊几乎无需排队',
      accessToHigherEducation: '四川农业大学都江堰校区、东软学院等本科院校坐落境内',
      costOfTravelingToCityCenter: '成灌快铁单程二等座10元，刷天府通乘车码随到随走',
    },
  },

  // 7. 空数据测试区 (Empty State Testing Region - 玛曲县)
  empty_demo: {
    id: 'empty_demo',
    name: '玛曲县',
    shortName: '玛曲',
    level: 'county',
    parentPath: '中国 · 甘肃省 · 甘南藏族自治州',
    provinceName: '甘肃省',
    cityName: '甘南州',
    countyName: '玛曲县',
    lat: 33.9984,
    lng: 102.0739,
    hasData: false,
    emptyStateReason: '该区县尚未完成定点生活成本社会调查采样。数据采编团队已列入下一季度抽样排期，暂不提供估测数值以防误导。',
    overallCostIndex: 0,
    incomeOpportunityIndex: 0,
    healthcareIndex: 0,
    educationIndex: 0,
    transportIndex: 0,
    livabilityIndex: 0,
    environmentIndex: 0,
    monthlyBasicRange: { low: 0, typical: 0, high: 0 },
    annualBasicRange: { low: 0, typical: 0, high: 0 },
    afterTaxIncomeRange: { low: 0, typical: 0, high: 0 },
    disposableIncomeRange: { low: 0, typical: 0, high: 0 },
    housingBurdenRatio: 0,
    suitableProfiles: [],
    mainAdvantages: [],
    mainCostPressures: [],
    updateDate: '未录入',
    source: '暂无有效统计样本',
    confidenceLevel: 'D',
    sampleSize: '0 样本',
    statisticalPeriod: '待采集',
    isPrototypeDemo: true,
    dimensions: createStandardDimensions({
      baseRent: { low: 0, typical: 0, high: 0 },
      baseFood: { low: 0, typical: 0, high: 0 },
      baseUtilities: { low: 0, typical: 0, high: 0 },
      baseTransport: { low: 0, typical: 0, high: 0 },
      baseMedical: { low: 0, typical: 0, high: 0 },
      baseEducation: { low: 0, typical: 0, high: 0 },
      baseIncome: { low: 0, typical: 0, high: 0 },
      regionPrefix: '玛曲',
    }),
  },
};

// 兼容别名映射字典（通过 Proxy 解析别名，确保 Object.values/Object.keys 仅返回唯一规范条目，杜绝 React duplicate key 报错）
const REGIONAL_COST_ALIASES: Record<string, string> = {
  lanzhou_yuzhong: 'yuzhong',
  yuzhong_county: 'yuzhong',
};

export const REGIONAL_COST_DATABASE: Record<string, RegionalCostData> = new Proxy(
  RAW_REGIONAL_COST_DATABASE,
  {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string') {
        if (prop in target) {
          return target[prop];
        }
        if (prop in REGIONAL_COST_ALIASES) {
          return target[REGIONAL_COST_ALIASES[prop]];
        }
      }
      return Reflect.get(target, prop);
    },
    has(target, prop: string | symbol) {
      if (typeof prop === 'string') {
        return prop in target || prop in REGIONAL_COST_ALIASES;
      }
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return Object.keys(target);
    },
    getOwnPropertyDescriptor(target, prop) {
      return Object.getOwnPropertyDescriptor(target, prop);
    },
  }
);

// 辅助函数：构造标准16项成本维度明细
function createStandardDimensions(params: {
  baseRent: { low: number; typical: number; high: number };
  baseFood: { low: number; typical: number; high: number };
  baseUtilities: { low: number; typical: number; high: number };
  baseTransport: { low: number; typical: number; high: number };
  baseMedical: { low: number; typical: number; high: number };
  baseEducation: { low: number; typical: number; high: number };
  baseIncome: { low: number; typical: number; high: number };
  regionPrefix: string;
}): Record<CostDimensionKey, any> {
  const { baseRent, baseFood, baseUtilities, baseTransport, baseMedical, baseEducation, baseIncome, regionPrefix } = params;

  return {
    housing: {
      key: 'housing',
      name: '住房成本',
      icon: 'Home',
      monthlyRange: { low: baseRent.low, typical: baseRent.typical, high: baseRent.high, unit: '元/月' },
      summary: `${regionPrefix}常规整租一居至两居月租金在 ¥${baseRent.low}–¥${baseRent.high} 范围波动`,
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '房产租赁公开挂牌与成交大数据抽样',
      items: [
        { name: '普通一居室整租', range: { low: baseRent.low, typical: Math.round(baseRent.typical * 0.8), high: baseRent.typical }, confidence: 'A' },
        { name: '舒适两居室整租', range: { low: baseRent.typical, typical: Math.round(baseRent.typical * 1.3), high: baseRent.high }, confidence: 'A' },
        { name: '商品住宅购房均价', range: { low: Math.round(baseRent.typical * 5), typical: Math.round(baseRent.typical * 7.5), high: Math.round(baseRent.typical * 11), unit: '元/㎡' }, confidence: 'A' },
        { name: '住宅物业管理费', range: { low: 1.2, typical: 1.8, high: 2.8, unit: '元/㎡/月' }, confidence: 'B' },
        { name: '租赁押金通常惯例', range: { low: 1, typical: 1, high: 3, unit: '个月房租' }, note: '押一付三或押一付一', confidence: 'A' },
      ],
    },
    food: {
      key: 'food',
      name: '餐饮食品',
      icon: 'Utensils',
      monthlyRange: { low: baseFood.low, typical: baseFood.typical, high: baseFood.high, unit: '元/月' },
      summary: `单人三餐自行烹饪约 ¥${baseFood.low}，适度外卖与聚餐约 ¥${baseFood.typical}`,
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '农贸批发市场与主要商超生活必需品物价监测',
      items: [
        { name: '普通工作日午餐/快餐', range: { low: 12, typical: 18, high: 28, unit: '元/餐' }, confidence: 'A' },
        { name: '大米/面粉 (500g)', range: { low: 2.4, typical: 3.2, high: 4.8, unit: '元/斤' }, confidence: 'A' },
        { name: '时令蔬菜综合均价', range: { low: 2.5, typical: 4.2, high: 7.0, unit: '元/斤' }, confidence: 'A' },
        { name: '猪后腿肉/牛肉精肉', range: { low: 16, typical: 28, high: 42, unit: '元/斤' }, confidence: 'A' },
        { name: '单人月度买菜下厨预算', range: { low: 650, typical: 950, high: 1400, unit: '元/月' }, confidence: 'A' },
      ],
    },
    utilities: {
      key: 'utilities',
      name: '水电燃气与暖气',
      icon: 'Zap',
      monthlyRange: { low: baseUtilities.low, typical: baseUtilities.typical, high: baseUtilities.high, unit: '元/月' },
      summary: '包含民用水电气及阶梯电价，冬夏用能存在季节波动',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '发改委公布民用公用事业价格名录',
      items: [
        { name: '居民阶梯电价（第一档）', range: { low: 0.51, typical: 0.53, high: 0.56, unit: '元/度' }, confidence: 'A' },
        { name: '居民自来水费（含污水处理）', range: { low: 2.6, typical: 3.1, high: 3.8, unit: '元/吨' }, confidence: 'A' },
        { name: '管道天然气费', range: { low: 2.1, typical: 2.4, high: 2.8, unit: '元/m³' }, confidence: 'A' },
        { name: '冬季采暖/夏季空调月折算', range: { low: 80, typical: 160, high: 300, unit: '元/月' }, confidence: 'B' },
      ],
    },
    transportation: {
      key: 'transportation',
      name: '交通出行',
      icon: 'Bus',
      monthlyRange: { low: baseTransport.low, typical: baseTransport.typical, high: baseTransport.high, unit: '元/月' },
      summary: '公交地铁公共出行平价便捷，网约车均价适中',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '公交地铁票价与滴滴/高德路网计价',
      items: [
        { name: '公共汽车基础票价', range: { low: 1.0, typical: 2.0, high: 3.0, unit: '元/次' }, confidence: 'A' },
        { name: '出租车起步价 (含3公里)', range: { low: 8.0, typical: 10.0, high: 12.0, unit: '元/起步' }, confidence: 'A' },
        { name: '居民月度公共通勤总支出', range: { low: 60, typical: 140, high: 260, unit: '元/月' }, confidence: 'A' },
        { name: '私家车月度油费/电费+停车', range: { low: 450, typical: 780, high: 1400, unit: '元/月' }, confidence: 'B' },
      ],
    },
    communications: {
      key: 'communications',
      name: '通信网络',
      icon: 'Wifi',
      monthlyRange: { low: 68, typical: 128, high: 238, unit: '元/月' },
      summary: '千兆家用宽带与全国通用5G大流量融合套餐',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '电信三大运营商融合资费标准',
      items: [
        { name: '手机5G全国大流量单卡', range: { low: 39, typical: 59, high: 99, unit: '元/月' }, confidence: 'A' },
        { name: '家用千兆光纤宽带套餐', range: { low: 40, typical: 79, high: 139, unit: '元/月' }, confidence: 'A' },
      ],
    },
    healthcare: {
      key: 'healthcare',
      name: '医疗健康',
      icon: 'HeartPulse',
      monthlyRange: { low: baseMedical.low, typical: baseMedical.typical, high: baseMedical.high, unit: '元/月' },
      summary: '居民医保统筹报销后自费开支，慢病用药受集采降价利好',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '医保定点医药机构自付统筹样本',
      items: [
        { name: '普通门诊挂号费 (二甲/三甲)', range: { low: 6, typical: 12, high: 25, unit: '元/次' }, confidence: 'A' },
        { name: '知名专家特需号', range: { low: 50, typical: 100, high: 200, unit: '元/次' }, confidence: 'B' },
        { name: '普通感冒发热一次门诊药费', range: { low: 40, typical: 90, high: 180, unit: '元/次' }, confidence: 'A' },
        { name: '城乡居民基本医保年筹资缴费', range: { low: 400, typical: 420, high: 450, unit: '元/年' }, confidence: 'A' },
      ],
    },
    education: {
      key: 'education',
      name: '教育资源',
      icon: 'GraduationCap',
      monthlyRange: { low: baseEducation.low, typical: baseEducation.typical, high: baseEducation.high, unit: '元/月' },
      summary: '九年义务教育公办免学费，学前幼托与课外素养培训因人而异',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '教育收费指导文件与民办学校公示标准',
      items: [
        { name: '公办幼儿园保教费', range: { low: 450, typical: 750, high: 1300, unit: '元/月' }, confidence: 'A' },
        { name: '普惠民办幼儿园月费', range: { low: 800, typical: 1400, high: 2600, unit: '元/月' }, confidence: 'B' },
        { name: '课外文体素养班（单项单月）', range: { low: 300, typical: 650, high: 1500, unit: '元/月' }, confidence: 'B' },
      ],
    },
    childcare: {
      key: 'childcare',
      name: '托育育儿',
      icon: 'Baby',
      monthlyRange: { low: 800, typical: 1600, high: 3200, unit: '元/月' },
      summary: '婴幼儿奶粉纸尿裤大宗耗材及托育早教支出',
      confidence: 'B',
      updateDate: '2026-08-15',
      source: '母婴连锁消费与社区普惠托育调研',
      items: [
        { name: '婴幼儿配方奶粉 (月度2-3罐)', range: { low: 400, typical: 750, high: 1200, unit: '元/月' }, confidence: 'A' },
        { name: '全日制托育机构（0-3岁）', range: { low: 1200, typical: 2100, high: 3800, unit: '元/月' }, confidence: 'B' },
      ],
    },
    elder_care: {
      key: 'elder_care',
      name: '养老护理',
      icon: 'Users',
      monthlyRange: { low: 1500, typical: 2800, high: 5500, unit: '元/月' },
      summary: '社区适老照料与公建民营养老院床位收费标准',
      confidence: 'B',
      updateDate: '2026-08-15',
      source: '民政局备案养老机构收费名录',
      items: [
        { name: '自理老人普通养老院床位费', range: { low: 1600, typical: 2500, high: 4200, unit: '元/月' }, confidence: 'A' },
        { name: '失能/半失能专业介护月费', range: { low: 3200, typical: 4800, high: 7500, unit: '元/月' }, confidence: 'B' },
      ],
    },
    daily_services: {
      key: 'daily_services',
      name: '日常便民服务',
      icon: 'Scissors',
      monthlyRange: { low: 120, typical: 260, high: 580, unit: '元/月' },
      summary: '理发、家政深度保洁、衣物干洗与快修',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '生活服务O2O平台均价',
      items: [
        { name: '普通洗剪吹理发', range: { low: 15, typical: 30, high: 68, unit: '元/次' }, confidence: 'A' },
        { name: '日常钟点家政保洁', range: { low: 30, typical: 45, high: 70, unit: '元/小时' }, confidence: 'A' },
      ],
    },
    clothing_home: {
      key: 'clothing_home',
      name: '服饰与家居置办',
      icon: 'Shirt',
      monthlyRange: { low: 200, typical: 450, high: 1100, unit: '元/月' },
      summary: '日常服装换季更新与床品家纺耐用品购置',
      confidence: 'B',
      updateDate: '2026-08-15',
      source: '居民衣着消费支出占比调查',
      items: [
        { name: '季更普通便服/鞋靴', range: { low: 150, typical: 350, high: 800, unit: '元/件' }, confidence: 'B' },
        { name: '冬季保暖羽绒服/大衣', range: { low: 350, typical: 750, high: 1800, unit: '元/件' }, confidence: 'B' },
      ],
    },
    leisure_social: {
      key: 'leisure_social',
      name: '休闲社交与娱乐',
      icon: 'Film',
      monthlyRange: { low: 150, typical: 380, high: 950, unit: '元/月' },
      summary: '影院观影、健身打卡、咖啡简餐及朋友社交聚会',
      confidence: 'B',
      updateDate: '2026-08-15',
      source: '主流文娱平台消费画像',
      items: [
        { name: '院线电影票 (标准2D/3D)', range: { low: 28, typical: 42, high: 65, unit: '元/张' }, confidence: 'A' },
        { name: '独立咖啡馆现磨咖啡', range: { low: 15, typical: 24, high: 36, unit: '元/杯' }, confidence: 'A' },
        { name: '好友聚会人均正餐消费', range: { low: 60, typical: 95, high: 180, unit: '元/人' }, confidence: 'A' },
      ],
    },
    employment_income: {
      key: 'employment_income',
      name: '就业与薪资水平',
      icon: 'TrendingUp',
      monthlyRange: { low: baseIncome.low, typical: baseIncome.typical, high: baseIncome.high, unit: '元/月' },
      summary: `城镇全职劳动者月度税后工资中位数为 ¥${baseIncome.typical} 左右`,
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '人社局就业薪酬监测报告与招聘平台实收薪资统计',
      items: [
        { name: '法定最低月工资标准', range: { low: 1950, typical: 2100, high: 2350, unit: '元/月' }, confidence: 'A' },
        { name: '初级白领/行政税后薪资', range: { low: baseIncome.low, typical: Math.round(baseIncome.typical * 0.85), high: baseIncome.typical }, confidence: 'A' },
        { name: '骨干专业技术/研发税后薪酬', range: { low: baseIncome.typical, typical: Math.round(baseIncome.typical * 1.5), high: baseIncome.high }, confidence: 'A' },
      ],
    },
    taxes_social_security: {
      key: 'taxes_social_security',
      name: '税费社保与公积金',
      icon: 'Shield',
      monthlyRange: { low: 550, typical: 1100, high: 2600, unit: '元/月' },
      summary: '五险一金个人扣缴比例通常占税前工资约 17.5% - 22.2%',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '税务局与社保局官方缴费基数核定标准',
      items: [
        { name: '社保个人缴费综合费率', range: { low: 10.2, typical: 10.5, high: 10.5, unit: '%' }, note: '养老8% + 医保2% + 失业0.5%', confidence: 'A' },
        { name: '住房公积金个人缴存比例', range: { low: 5.0, typical: 8.0, high: 12.0, unit: '%' }, confidence: 'A' },
      ],
    },
    environment_safety: {
      key: 'environment_safety',
      name: '环境与公共安全',
      icon: 'Trees',
      monthlyRange: { low: 0, typical: 0, high: 0, unit: '分' },
      summary: '治安良好夜行安心，空气优良天数达标率超过85%',
      confidence: 'A',
      updateDate: '2026-08-15',
      source: '生态环境局空气质量AQI年报与平安城市指数',
      items: [
        { name: '全年空气质量优良天数比例', range: { low: 82, typical: 89, high: 96, unit: '%' }, confidence: 'A' },
        { name: '社会公众安全感综合满意度', range: { low: 96.2, typical: 98.4, high: 99.2, unit: '%' }, confidence: 'A' },
      ],
    },
    relocation_overhead: {
      key: 'relocation_overhead',
      name: '搬迁过渡与置家',
      icon: 'Truck',
      monthlyRange: { low: 2500, typical: 4800, high: 11000, unit: '一次性' },
      summary: '跨城/同城长途搬家、中介找房服务费及新居软装必要置办',
      confidence: 'B',
      updateDate: '2026-08-15',
      source: '货拉拉/德邦搬家平台与安家调研',
      items: [
        { name: '跨城打包货运及长途托运', range: { low: 1200, typical: 2400, high: 4800, unit: '元/车次' }, confidence: 'B' },
        { name: '租房中介居间服务费', range: { low: 300, typical: Math.round(baseRent.typical * 0.5), high: baseRent.typical, unit: '元/单' }, confidence: 'A' },
        { name: '新居基础软装/生活用品置办', range: { low: 600, typical: 1500, high: 3200, unit: '元/次' }, confidence: 'B' },
      ],
    },
  };
}

// 预算模拟计算器引擎
export function calculateBudgetSimulation(
  arg1: RegionalCostData | BudgetSimulatorInput,
  arg2: RegionalCostData | BudgetSimulatorInput
): BudgetSimulatorOutput {
  const region: RegionalCostData = ('dimensions' in arg1 ? arg1 : arg2) as RegionalCostData;
  const input: BudgetSimulatorInput = ('dimensions' in arg1 ? arg2 : arg1) as BudgetSimulatorInput;

  const income = input?.monthlyNetIncome ?? input?.monthlyIncome ?? 6500;
  const hSize = Math.max(1, input?.householdSize || 1);

  if (!region || !region.hasData) {
    const emptyBreakdown = {
      housing: 0,
      food: 0,
      utilities: 0,
      transportation: 0,
      dailyAndComms: 0,
      childEducation: 0,
      healthAndCare: 0,
      leisureAndMisc: 0,
    };
    return {
      regionId: region?.id || 'unknown',
      regionName: region?.name || '未知区域',
      estimatedMonthlyExpense: { low: 0, typical: 0, high: 0, unit: '元/月' },
      estimatedAnnualExpense: { low: 0, typical: 0, high: 0, unit: '元/年' },
      disposableIncome: { low: 0, typical: 0, high: 0, unit: '元/月' },
      recommendedMinIncome: 0,
      recommendedEmergencyFund: { low: 0, typical: 0, high: 0, unit: '元' },
      pressures: { housing: 'low', healthcare: 'low', education: 'low', transport: 'low' },
      initialRelocationCashNeeded: { low: 0, typical: 0, high: 0, unit: '元' },
      savingsPotentialMonthly: 0,
      estimatedMonthlyBudget: 0,
      surplusOrDeficit: 0,
      breakdown: emptyBreakdown,
      emergencyBufferRecommended: 0,
    };
  }

  // 1. 住房费用拆解
  const baseRentTypical = region?.dimensions?.housing?.monthlyRange?.typical || 1200;
  let housingExpense = baseRentTypical;
  if (input.housingType === 'rent_shared') {
    housingExpense = Math.round(baseRentTypical * 0.55);
  } else if (input.housingType === 'rent_1bed') {
    housingExpense = baseRentTypical;
  } else if (input.housingType === 'rent_2bed') {
    housingExpense = Math.round(baseRentTypical * 1.4);
  } else if (input.housingType === 'rent_3bed') {
    housingExpense = Math.round(baseRentTypical * 1.85);
  } else if (input.housingType === 'own_paid_off') {
    housingExpense = Math.round(baseRentTypical * 0.22); // 仅物业能耗
  } else if (input.housingType === 'own_mortgage') {
    housingExpense = Math.round(baseRentTypical * 1.6); // 月供
  }

  // 2. 餐饮生鲜拆解
  const baseFood = region?.dimensions?.food?.monthlyRange?.typical || 900;
  let diningFactor = 1.0;
  if (input.diningType === 'cook_mostly') diningFactor = 0.82;
  else if (input.diningType === 'half_half') diningFactor = 1.05;
  else if (input.diningType === 'dine_out_often') diningFactor = 1.45;
  const foodExpense = Math.round(baseFood * Math.pow(hSize, 0.72) * diningFactor);

  // 3. 水电燃气
  const baseUtil = region?.dimensions?.utilities?.monthlyRange?.typical || 280;
  const utilExpense = Math.round(baseUtil * (1 + (hSize - 1) * 0.35));

  // 4. 交通出行
  const baseTrans = region?.dimensions?.transportation?.monthlyRange?.typical || 160;
  let transExpense = baseTrans * (hSize > 1 ? 1.5 : 1.0);
  if (input.commuteType === 'walk_bike') transExpense = Math.round(transExpense * 0.4);
  else if (input.commuteType === 'public_transit') transExpense = Math.round(transExpense * 0.9);
  else if (input.commuteType === 'private_car') transExpense = Math.round(transExpense + 750);
  else if (input.commuteType === 'intercity_train') transExpense = Math.round(transExpense + 950);

  // 5. 通信日用
  const dailyAndComms = Math.round(380 * Math.pow(hSize, 0.65));

  // 6. 子女教育
  let childEducation = 0;
  if (input.hasChildEducation) {
    if (input.educationType === 'nursery') childEducation = 1500;
    else if (input.educationType === 'private_school') childEducation = 2500;
    else childEducation = 400; // public_school
  }

  // 7. 医疗健康长辈照护
  const baseHealth = region?.dimensions?.healthcare?.monthlyRange?.typical || 260;
  let healthAndCare = Math.round(baseHealth * Math.pow(hSize, 0.7));
  if (input.hasElderCare) {
    healthAndCare += 800;
  }

  // 8. 休闲社交
  const leisureAndMisc = Math.round(350 * Math.pow(hSize, 0.65));

  const totalMonthlyBudget = Math.round(
    housingExpense +
    foodExpense +
    utilExpense +
    transExpense +
    dailyAndComms +
    childEducation +
    healthAndCare +
    leisureAndMisc
  );

  const surplusOrDeficit = Math.round(income - totalMonthlyBudget);
  const emergencyBufferRecommended = Math.round(totalMonthlyBudget * 6);

  const totalMonthlyLow = Math.round(totalMonthlyBudget * 0.85);
  const totalMonthlyHigh = Math.round(totalMonthlyBudget * 1.25);

  const housingRatio = housingExpense / Math.max(1, income);

  return {
    regionId: region.id,
    regionName: region.name,
    estimatedMonthlyExpense: { low: totalMonthlyLow, typical: totalMonthlyBudget, high: totalMonthlyHigh, unit: '元/月' },
    estimatedAnnualExpense: { low: totalMonthlyLow * 12, typical: totalMonthlyBudget * 12, high: totalMonthlyHigh * 12, unit: '元/年' },
    disposableIncome: { low: income - totalMonthlyHigh, typical: surplusOrDeficit, high: income - totalMonthlyLow, unit: '元/月' },
    recommendedMinIncome: Math.round(totalMonthlyBudget * 1.3),
    recommendedEmergencyFund: { low: totalMonthlyBudget * 6, typical: emergencyBufferRecommended, high: totalMonthlyBudget * 12, unit: '元' },
    pressures: {
      housing: housingRatio > 0.38 ? 'high' : housingRatio > 0.24 ? 'moderate' : 'low',
      healthcare: input.hasElderCare ? 'moderate' : 'low',
      education: input.hasChildEducation ? 'moderate' : 'low',
      transport: transExpense > 800 ? 'moderate' : 'low',
    },
    initialRelocationCashNeeded: { low: Math.round(housingExpense * 2.5 + 2000), typical: Math.round(housingExpense * 3 + 3000), high: Math.round(housingExpense * 4 + 4500), unit: '元' },
    savingsPotentialMonthly: Math.max(0, surplusOrDeficit),
    estimatedMonthlyBudget: totalMonthlyBudget,
    surplusOrDeficit,
    breakdown: {
      housing: housingExpense,
      food: foodExpense,
      utilities: utilExpense,
      transportation: transExpense,
      dailyAndComms,
      childEducation,
      healthAndCare,
      leisureAndMisc,
    },
    emergencyBufferRecommended,
  };
}

// 定居搬迁估算生成
export function generateRelocationPlan(params: {
  destinationRegion?: RegionalCostData | null;
  originRegionName: string;
  monthlyIncome: number;
  householdSize: number;
}): RelocationPlan {
  const destinationRegion =
    params.destinationRegion ||
    REGIONAL_COST_DATABASE['yuzhong'] ||
    REGIONAL_COST_DATABASE['lanzhou'] ||
    Object.values(REGIONAL_COST_DATABASE)[0];
  const { originRegionName, monthlyIncome, householdSize } = params;

  const rentTypical = destinationRegion?.dimensions?.housing?.monthlyRange?.typical || 1200;
  const movingFee = 2200 + Math.round((householdSize - 1) * 600);
  const rentalAdvance = rentTypical * 3; // 押一付二或付三
  const furniture = 1500 + Math.round((householdSize - 1) * 800);
  const first3MonthsBuffer = rentTypical * 3 + 4500 * Math.max(1, householdSize * 0.75);
  const totalInitial = movingFee + rentalAdvance + furniture + first3MonthsBuffer;

  const monthlyExpense = Math.round(
    rentTypical + (destinationRegion?.dimensions?.food?.monthlyRange?.typical || 1000) * householdSize * 0.8 + 800
  );
  const netSurplus = monthlyIncome - monthlyExpense;

  let conclusionTag: '适合立即搬迁' | '建议先尝试短住' | '建议先提升收入储备' | '医疗条件可能不匹配' = '适合立即搬迁';
  let conclusionNote = '';

  const targetLevel = destinationRegion?.level || 'county';
  const healthcareIndex = destinationRegion?.healthcareIndex ?? 50;

  if (monthlyIncome < monthlyExpense * 1.15) {
    conclusionTag = '建议先提升收入储备';
    conclusionNote = `目的地月度刚性生活测算约 ¥${monthlyExpense}，您当前收入盈余安全边际较低，建议先积攒6个月以上应急备用金。`;
  } else if (targetLevel === 'county' && healthcareIndex < 60) {
    conclusionTag = '建议先尝试短住';
    conclusionNote = `目的地县域居住成本极低（月均开销仅需 ¥${monthlyExpense}），但优质医疗需跨城转诊，建议先签约短租体验3个月季节适应度。`;
  } else {
    conclusionTag = '适合立即搬迁';
    conclusionNote = `财务收支测算非常健康，每月预计可留存结余 ¥${netSurplus}，安家启动资金需约 ¥${totalInitial}，具备良好的定居可行性。`;
  }

  return {
    id: `plan-${Date.now()}`,
    title: `${originRegionName} → 迁居至${destinationRegion?.name || '目的地'}计划方案`,
    destinationRegionId: destinationRegion?.id || 'yuzhong',
    destinationRegionName: destinationRegion?.name || '榆中县',
    originRegionName,
    targetLevel,
    householdSize,
    monthlyIncome,
    breakdown: {
      movingAndTransport: movingFee,
      rentalDepositAndAdvance: rentalAdvance,
      furnitureAndAppliances: furniture,
      initialSchoolOrRegistration: 800,
      firstThreeMonthsBuffer: Math.round(first3MonthsBuffer),
      totalInitialCashNeeded: Math.round(totalInitial),
    },
    monthlyLocalIncomeVsExpense: {
      estimatedIncome: monthlyIncome,
      estimatedExpense: monthlyExpense,
      netMonthlySurplus: netSurplus,
    },
    conclusionTag,
    conclusionNote,
    createdAt: new Date().toLocaleDateString('zh-CN'),
  };
}
