// ==================== 数据存储层（对接后端 API） ====================
const DB = {
    KEY: 'hotel_system_data',
    cache: null, // 内存缓存
    apiAvailable: false, // 后端是否可用

    // 初始化默认数据
    defaultData() {
        return {
            users: [
                { id: 1, username: 'admin', password: '123456', name: '张管理', role: '系统管理员', phone: '13800138000', status: 1 }
            ],
            employees: [
                { id: 1, name: '张管理', gender: '男', phone: '13800138000', position: '系统管理员', dept: '管理部', entryDate: '2020-01-15', status: 1 },
                { id: 2, name: '李前台', gender: '女', phone: '13800138001', position: '前台接待', dept: '前厅部', entryDate: '2021-03-20', status: 1 },
                { id: 3, name: '王客房', gender: '女', phone: '13800138002', position: '客房主管', dept: '客房部', entryDate: '2020-06-10', status: 1 },
                { id: 4, name: '赵服务', gender: '男', phone: '13800138003', position: '服务员', dept: '客房部', entryDate: '2022-02-15', status: 1 }
            ],
            roomTypes: [
                { id: 1, name: '标准大床房', bedType: '大床', area: 28, price: 288, facilities: 'WiFi,空调,电视,独立卫浴', count: 8 },
                { id: 2, name: '标准双床房', bedType: '双床', area: 30, price: 328, facilities: 'WiFi,空调,电视,独立卫浴', count: 8 },
                { id: 3, name: '豪华大床房', bedType: '大床', area: 40, price: 488, facilities: 'WiFi,空调,电视,浴缸,迷你吧', count: 4 },
                { id: 4, name: '豪华双床房', bedType: '双床', area: 42, price: 528, facilities: 'WiFi,空调,电视,浴缸,迷你吧', count: 4 },
                { id: 5, name: '行政套房', bedType: '大床', area: 65, price: 888, facilities: 'WiFi,空调,电视,浴缸,迷你吧,客厅', count: 2 },
                { id: 6, name: '总统套房', bedType: '大床', area: 120, price: 1888, facilities: 'WiFi,空调,电视,浴缸,迷你吧,客厅,餐厅', count: 1 }
            ],
            rooms: [
                { id: 1, roomNo: '101', typeId: 1, floor: 1, orientation: '朝南', status: '空闲', remark: '' },
                { id: 2, roomNo: '102', typeId: 1, floor: 1, orientation: '朝北', status: '空闲', remark: '' },
                { id: 3, roomNo: '103', typeId: 2, floor: 1, orientation: '朝南', status: '入住', remark: '' },
                { id: 4, roomNo: '104', typeId: 2, floor: 1, orientation: '朝北', status: '清洁中', remark: '' },
                { id: 5, roomNo: '105', typeId: 1, floor: 1, orientation: '朝南', status: '空闲', remark: '' },
                { id: 6, roomNo: '106', typeId: 2, floor: 1, orientation: '朝北', status: '预订', remark: '' },
                { id: 7, roomNo: '201', typeId: 1, floor: 2, orientation: '朝南', status: '入住', remark: '' },
                { id: 8, roomNo: '202', typeId: 1, floor: 2, orientation: '朝北', status: '空闲', remark: '' },
                { id: 9, roomNo: '203', typeId: 2, floor: 2, orientation: '朝南', status: '空闲', remark: '' },
                { id: 10, roomNo: '204', typeId: 2, floor: 2, orientation: '朝北', status: '维修', remark: '空调故障' },
                { id: 11, roomNo: '205', typeId: 3, floor: 2, orientation: '朝南', status: '入住', remark: '' },
                { id: 12, roomNo: '206', typeId: 3, floor: 2, orientation: '朝北', status: '空闲', remark: '' },
                { id: 13, roomNo: '301', typeId: 3, floor: 3, orientation: '朝南', status: '空闲', remark: '' },
                { id: 14, roomNo: '302', typeId: 4, floor: 3, orientation: '朝北', status: '入住', remark: '' },
                { id: 15, roomNo: '303', typeId: 4, floor: 3, orientation: '朝南', status: '空闲', remark: '' },
                { id: 16, roomNo: '304', typeId: 4, floor: 3, orientation: '朝北', status: '清洁中', remark: '' },
                { id: 17, roomNo: '401', typeId: 5, floor: 4, orientation: '朝南', status: '入住', remark: '' },
                { id: 18, roomNo: '402', typeId: 5, floor: 4, orientation: '朝北', status: '空闲', remark: '' },
                { id: 19, roomNo: '501', typeId: 6, floor: 5, orientation: '朝南', status: '空闲', remark: '' },
                { id: 20, roomNo: '502', typeId: 6, floor: 5, orientation: '朝北', status: '预订', remark: '' },
                { id: 21, roomNo: '107', typeId: 1, floor: 1, orientation: '朝东', status: '空闲', remark: '' }
            ],
            customers: [
                { id: 1, name: '陈先生', gender: '男', phone: '13900139001', idCard: '110101199001011234', level: '普通', points: 0, remark: '' },
                { id: 2, name: '刘女士', gender: '女', phone: '13900139002', idCard: '110101199203052345', level: '银卡', points: 1500, remark: '常客' },
                { id: 3, name: '王先生', gender: '男', phone: '13900139003', idCard: '110101198807123456', level: '金卡', points: 5600, remark: '' },
                { id: 4, name: '张女士', gender: '女', phone: '13900139004', idCard: '110101199509084567', level: '普通', points: 200, remark: '' },
                { id: 5, name: '李先生', gender: '男', phone: '13900139005', idCard: '110101198711205678', level: '钻石', points: 18000, remark: 'VIP客户' }
            ],
            members: [
                { id: 1, customerId: 2, cardNo: 'VIP0001', level: '银卡', points: 1500, discount: 0.95, joinDate: '2022-05-10', status: 1 },
                { id: 2, customerId: 3, cardNo: 'VIP0002', level: '金卡', points: 5600, discount: 0.9, joinDate: '2021-08-15', status: 1 },
                { id: 3, customerId: 5, cardNo: 'VIP0003', level: '钻石', points: 18000, discount: 0.85, joinDate: '2020-03-20', status: 1 }
            ],
            reservations: [
                { id: 1, customerId: 2, roomTypeId: 2, roomId: 106, guestName: '刘女士', phone: '13900139002', checkInDate: '2026-10-10', checkOutDate: '2026-10-12', nights: 2, amount: 656, status: '待入住', createTime: '2026-10-08 10:30' },
                { id: 2, customerId: 5, roomTypeId: 6, roomId: 20, guestName: '李先生', phone: '13900139005', checkInDate: '2026-10-11', checkOutDate: '2026-10-14', nights: 3, amount: 5664, status: '待入住', createTime: '2026-10-08 14:20' }
            ],
            checkins: [
                { id: 1, customerId: 1, roomId: 3, guestName: '陈先生', phone: '13900139001', idCard: '110101199001011234', checkInTime: '2026-10-09 09:00', expectedCheckOut: '2026-10-10', deposit: 500, status: '入住中' },
                { id: 2, customerId: 3, roomId: 7, guestName: '王先生', phone: '13900139003', idCard: '110101198807123456', checkInTime: '2026-10-08 15:30', expectedCheckOut: '2026-10-11', deposit: 1000, status: '入住中' },
                { id: 3, customerId: 3, roomId: 11, guestName: '王先生', phone: '13900139003', idCard: '110101198807123456', checkInTime: '2026-10-09 11:00', expectedCheckOut: '2026-10-12', deposit: 1000, status: '入住中' },
                { id: 4, customerId: 1, roomId: 14, guestName: '陈先生', phone: '13900139001', idCard: '110101199001011234', checkInTime: '2026-10-08 14:00', expectedCheckOut: '2026-10-10', deposit: 1000, status: '入住中' },
                { id: 5, customerId: 5, roomId: 17, guestName: '李先生', phone: '13900139005', idCard: '110101198711205678', checkInTime: '2026-10-09 10:00', expectedCheckOut: '2026-10-12', deposit: 2000, status: '入住中' }
            ],
            checkouts: [
                { id: 1, customerId: 2, roomId: 5, guestName: '刘女士', checkInTime: '2026-10-05 14:00', checkOutTime: '2026-10-08 11:30', nights: 3, roomFee: 864, otherFee: 0, total: 864, paymentMethod: '微信' },
                { id: 2, customerId: 4, roomId: 8, guestName: '张女士', checkInTime: '2026-10-06 15:00', checkOutTime: '2026-10-07 10:30', nights: 1, roomFee: 328, otherFee: 50, total: 378, paymentMethod: '支付宝' },
                { id: 3, customerId: 1, roomId: 9, guestName: '陈先生', checkInTime: '2026-10-04 13:00', checkOutTime: '2026-10-06 12:00', nights: 2, roomFee: 656, otherFee: 0, total: 656, paymentMethod: '现金' }
            ],
            settings: [
                { id: 1, key: 'hotel_name', value: '丽景大酒店', label: '酒店名称' },
                { id: 2, key: 'deposit_rate', value: '100', label: '押金比例(%)' },
                { id: 3, key: 'check_out_time', value: '12:00', label: '退房时间' },
                { id: 4, key: 'check_in_time', value: '14:00', label: '入住时间' },
                { id: 5, key: 'member_discount_silver', value: '0.95', label: '银卡折扣' },
                { id: 6, key: 'member_discount_gold', value: '0.9', label: '金卡折扣' },
                { id: 7, key: 'member_discount_diamond', value: '0.85', label: '钻石折扣' }
            ],
            logs: [
                { id: 1, user: '张管理', action: '登录系统', time: '2026-10-09 08:30:00', ip: '192.168.1.100' },
                { id: 2, user: '张管理', action: '新增客房 107', time: '2026-10-09 09:15:23', ip: '192.168.1.100' },
                { id: 3, user: '李前台', action: '办理入住 103', time: '2026-10-09 09:00:00', ip: '192.168.1.101' },
                { id: 4, user: '李前台', action: '办理退房 5', time: '2026-10-08 11:30:00', ip: '192.168.1.101' },
                { id: 5, user: '张管理', action: '新增房型 行政套房', time: '2026-10-07 16:20:00', ip: '192.168.1.100' }
            ]
        };
    },

    // 初始化：优先从后端加载，失败则用 localStorage，再失败用默认数据
    async init() {
        try {
            // 尝试从后端加载所有数据
            const collections = ['users', 'employees', 'roomTypes', 'rooms', 'customers', 'members', 'reservations', 'checkins', 'checkouts', 'settings', 'logs'];
            const results = await Promise.all(collections.map(c => Api.list(c)));
            this.cache = {};
            collections.forEach((c, i) => { this.cache[c] = results[i]; });
            this.apiAvailable = true;
            this.saveToLocal(); // 同时缓存到本地
            console.log('数据已从后端 API 加载');
        } catch (e) {
            console.warn('后端 API 不可用，使用本地数据:', e.message);
            this.apiAvailable = false;
            this.cache = this.loadFromLocal();
        }
    },

    // 从 localStorage 加载
    loadFromLocal() {
        const data = localStorage.getItem(this.KEY);
        if (!data) {
            const d = this.defaultData();
            this.saveToLocal(d);
            return d;
        }
        try {
            return JSON.parse(data);
        } catch (e) {
            const d = this.defaultData();
            this.saveToLocal(d);
            return d;
        }
    },

    // 保存到 localStorage
    saveToLocal(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data || this.cache));
    },

    // 获取某个集合
    get(collection) {
        if (!this.cache) this.cache = this.loadFromLocal();
        return this.cache[collection] || [];
    },

    // 保存某个集合（内存 + localStorage + 后端）
    set(collection, list) {
        if (!this.cache) this.cache = this.loadFromLocal();
        this.cache[collection] = list;
        this.saveToLocal();
        // 后端已不可用时不调用
        // 后端同步通过 add/update/remove 单独处理
    },

    // 新增记录
    add(collection, item) {
        const list = this.get(collection);
        const maxId = list.reduce((m, i) => Math.max(m, i.id || 0), 0);
        item.id = maxId + 1;
        list.push(item);
        this.set(collection, list);
        // 同步到后端
        if (this.apiAvailable) {
            Api.create(collection, item).catch(e => console.error('后端同步失败(add):', e));
        }
        return item;
    },

    // 更新记录
    update(collection, id, updates) {
        const list = this.get(collection);
        const idx = list.findIndex(i => i.id === id);
        if (idx > -1) {
            list[idx] = { ...list[idx], ...updates };
            this.set(collection, list);
            if (this.apiAvailable) {
                Api.update(collection, id, updates).catch(e => console.error('后端同步失败(update):', e));
            }
            return list[idx];
        }
        return null;
    },

    // 删除记录
    remove(collection, id) {
        const list = this.get(collection).filter(i => i.id !== id);
        this.set(collection, list);
        if (this.apiAvailable) {
            Api.remove(collection, id).catch(e => console.error('后端同步失败(remove):', e));
        }
    },

    // 批量操作（事务性，如入住时同时更新房间状态）
    batch(operations) {
        // operations: [{collection, id?, data}]
        operations.forEach(op => {
            const list = this.get(op.collection);
            if (op.id) {
                const idx = list.findIndex(i => i.id === op.id);
                if (idx > -1) {
                    list[idx] = { ...list[idx], ...op.data };
                }
            } else {
                const maxId = list.reduce((m, i) => Math.max(m, i.id || 0), 0);
                op.data.id = maxId + 1;
                list.push(op.data);
            }
            this.set(op.collection, list);
        });
        if (this.apiAvailable) {
            Api.batch(operations).catch(e => console.error('后端批量同步失败:', e));
        }
    },

    // 重置数据
    async reset() {
        if (this.apiAvailable) {
            await Api.reset();
            await this.init(); // 重新加载
        } else {
            localStorage.removeItem(this.KEY);
            this.cache = this.defaultData();
            this.saveToLocal();
        }
    }
};

// ==================== 房间状态常量 ====================
const ROOM_STATUS = {
    FREE: '空闲',
    OCCUPIED: '入住',
    RESERVED: '预订',
    CLEANING: '清洁中',
    MAINTENANCE: '维修'
};

const ROOM_STATUS_TAG = {
    '空闲': 'tag-success',
    '入住': 'tag-danger',
    '预订': 'tag-warning',
    '清洁中': 'tag-primary',
    '维修': 'tag-info'
};

const ROOM_STATUS_CLASS = {
    '空闲': '',
    '入住': 'occupied',
    '预订': 'reserved',
    '清洁中': 'cleaning',
    '维修': 'maintenance'
};

// 会员等级
const MEMBER_LEVELS = ['普通', '银卡', '金卡', '钻石'];
const MEMBER_DISCOUNT = { '普通': 1, '银卡': 0.95, '金卡': 0.9, '钻石': 0.85 };

// 工具函数
function formatDate(d) {
    const date = d instanceof Date ? d : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function formatDateTime(d) {
    const date = d instanceof Date ? d : new Date(d);
    return formatDate(date) + ' ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}

function now() {
    return formatDateTime(new Date());
}
