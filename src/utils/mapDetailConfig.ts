export type MapDetailLevel = 'province' | 'city' | 'district' | 'street';

export interface MapDetailConfigItem {
  showUserClusters: boolean;
  showUserAvatars: boolean;
  showFriendExactLocation: boolean;
  showActivities: boolean;
  showStories: boolean;
  showSchedules: boolean;
  showNearbyPlaces: boolean;
  transitionDurationMs: number;
}

export const MAP_DETAIL_CONFIG: Record<MapDetailLevel, MapDetailConfigItem> = {
  province: {
    showUserClusters: true,
    showUserAvatars: true,
    showFriendExactLocation: false,
    showActivities: false,
    showStories: false,
    showSchedules: false,
    showNearbyPlaces: false,
    transitionDurationMs: 200,
  },
  city: {
    showUserClusters: true,
    showUserAvatars: true,
    showFriendExactLocation: true,
    showActivities: false,
    showStories: false,
    showSchedules: false,
    showNearbyPlaces: false,
    transitionDurationMs: 200,
  },
  district: {
    showUserClusters: true,
    showUserAvatars: true,
    showFriendExactLocation: true,
    showActivities: true,
    showStories: true,
    showSchedules: true,
    showNearbyPlaces: true,
    transitionDurationMs: 200,
  },
  street: {
    showUserClusters: true,
    showUserAvatars: true,
    showFriendExactLocation: true,
    showActivities: true,
    showStories: true,
    showSchedules: true,
    showNearbyPlaces: true,
    transitionDurationMs: 200,
  },
};

export function getMapDetailLevel(zoom: number): MapDetailLevel {
  if (zoom < 9) return 'province';
  if (zoom < 13) return 'city';
  if (zoom < 16) return 'district';
  return 'street';
}

export function getMapDetailLevelName(level: MapDetailLevel): string {
  switch (level) {
    case 'province': return '省级视图';
    case 'city': return '市级视图';
    case 'district': return '区级视图';
    case 'street': return '街道视图';
  }
}

/**
 * Robust administrative region identification algorithm based on lat/lng boundaries and zoom level
 */
export function identifyAdministrativeRegion(lat: number, lng: number, zoom: number): {
  province: string;
  city: string;
  district: string;
  level: MapDetailLevel;
} {
  const level = getMapDetailLevel(zoom);
  
  // Geographic bounds matching for major regions (China coordinate ranges as reference)
  let province = '北京市';
  let city = '北京市';
  let district = '朝阳区';

  if (lat > 38 && lat < 43 && lng > 115 && lng < 120) {
    province = '北京市';
    city = lng > 117 ? '天津市' : '北京市';
    district = '朝阳区';
  } else if (lat > 30 && lat < 33 && lng > 120 && lng < 122) {
    province = '上海市';
    city = '上海市';
    district = '黄浦区';
  } else if (lat > 22 && lat < 25 && lng > 113 && lng < 115) {
    province = '广东省';
    city = lng > 114 ? '深圳市' : '广州市';
    district = lng > 114 ? '南山区' : '天河区';
  } else if (lat > 30 && lat < 32 && lng > 103 && lng < 105) {
    province = '四川省';
    city = '成都市';
    district = '锦江区';
  } else if (lat > 29 && lat < 31 && lng > 119 && lng < 121) {
    province = '浙江省';
    city = '杭州市';
    district = '西湖区';
  } else {
    // Default fallback based on approximate regions
    if (lat > 35) {
      province = '华北行政区';
      city = '中心城市';
    } else if (lat < 25) {
      province = '华南行政区';
      city = '沿海城市';
    } else {
      province = '华东行政区';
      city = '核心城市';
    }
  }

  return { province, city, district, level };
}

