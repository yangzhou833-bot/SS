import type {LatLng} from './types';

// Called only by the user's explicit location button, never on map mount.
export function requestCurrentLocation():Promise<LatLng> {
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation) {reject(new Error('当前浏览器不支持定位，请使用外部地图导航'));return;}
    navigator.geolocation.getCurrentPosition(position=>{
      const {latitude:lat,longitude:lng}=position.coords;
      if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180) {reject(new Error('定位结果无效，请重试'));return;}
      resolve({lat,lng});
    },error=>reject(new Error(error.code===1 ? '定位未获授权，可继续使用原型位置或外部导航' : '暂时无法获取当前位置，请重试或使用外部地图')),{enableHighAccuracy:true,timeout:10000,maximumAge:15000});
  });
}
