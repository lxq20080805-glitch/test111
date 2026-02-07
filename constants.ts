import { HubCollection } from './types';

// Data strictly controlled < 300m for walking distance logic
export const JIE_FANG_BEI_HUB: HubCollection = {
  "解放碑": {
      lat: 29.557, lon: 106.577,
      parking: [
      { name: "都市庭院-小区共享车位", type: "居民共享", dist: 120, priority: "high" },
      { name: "临江门社区-路侧错时车位", type: "老旧小区改造", dist: 180, priority: "high" },
      { name: "大都会东方广场-地下车库", type: "商业共享", dist: 150, priority: "low" },
      ]
  },
  "WFC": {
      lat: 29.558, lon: 106.578,
      parking: [
      { name: "环球金融中心-公寓区车位", type: "居民共享", dist: 50, priority: "high" },
      { name: "五四路社区-共享停车点", type: "居民共享", dist: 130, priority: "high" },
      ]
  },
  "洪崖洞": {
      lat: 29.563, lon: 106.583,
      parking: [
      { name: "沧白路社区-居民共享点", type: "居民共享", dist: 90, priority: "high" },
      { name: "棉花街小区-错时共享车库", type: "居民共享", dist: 150, priority: "high" },
      ]
  },
  "八一广场": {
      lat: 29.556, lon: 106.576,
      parking: [
      { name: "得意世界-住宅区车库", type: "居民共享", dist: 110, priority: "high" },
      { name: "八一广场-地下停车场", type: "商业共享", dist: 20, priority: "low" }
      ]
  },
  "来福士": {
      lat: 29.566, lon: 106.587,
      parking: [
      { name: "长滨路小区-共享车位", type: "居民共享", dist: 150, priority: "high" },
      { name: "来福士广场-LG层共享区", type: "综合体", dist: 30, priority: "low" }
      ]
  }
};